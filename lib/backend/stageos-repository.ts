import { randomUUID } from "crypto";
import { productions, professionalJobs } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { CrewSlot, Production, ProfessionalJob, ShareInvitation, SlotStatus } from "@/lib/types";

type DbProduction = {
  id: string;
  artist: string;
  city: string;
  venue: string;
  production_date: string;
  call_time: string | null;
  soundcheck_time: string | null;
  show_time: string | null;
  production_templates: { name: string } | null;
  profiles: { full_name: string } | null;
  production_slots: Array<{
    id: string;
    department: string;
    role: string;
    status: SlotStatus;
    fee: number;
    source: CrewSlot["source"];
    professionals: { full_name: string; phone: string | null } | null;
  }>;
};

type InvitationResponse = "accepted" | "declined";
export type { ShareInvitation };

export type PublicInvitation = {
  id: string;
  productionSlotId: string;
  token: string;
  professional: string | null;
  production: {
    artist: string;
    city: string;
    venue: string;
    date: string;
    callTime: string;
    soundcheck: string;
    showTime: string;
  };
  slot: {
    department: string;
    role: string;
    fee: number;
    status: SlotStatus;
  };
  status: string;
};

export async function listProductions(): Promise<Production[]> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return productions;
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("productions")
    .select(
      "id, artist, city, venue, production_date, call_time, soundcheck_time, show_time, production_templates(name), profiles(full_name), production_slots(id, department, role, status, fee, source, professionals(full_name, phone))"
    )
    .order("production_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as DbProduction[]).map(mapProduction);
}

export async function getProduction(id: string): Promise<Production | null> {
  const allProductions = await listProductions();
  return allProductions.find((production) => production.id === id) ?? null;
}

export async function listInvitations(productionId?: string): Promise<ShareInvitation[]> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const sourceProductions = productionId ? productions.filter((production) => production.id === productionId) : productions;

    return sourceProductions.flatMap((production) =>
      production.slots
        .filter((slot) => slot.status === "pending" || slot.status === "missing" || slot.status === "declined")
        .map((slot) => buildShareInvitation(production, slot, `demo-${slot.id}`, slot.status === "pending" ? "shared" : slot.status))
    );
  }

  const db = supabase as any;
  let query = db
    .from("invitations")
    .select(
      "id, status, channel, message, response_token, production_slot_id, professionals(full_name), production_slots!inner(id, production_id, productions(id))"
    )
    .order("created_at", { ascending: false });

  if (productionId) {
    query = query.eq("production_slots.production_id", productionId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data.map((invitation: any) => {
    const productionSlot = unwrapRelation(invitation.production_slots);
    const production = unwrapRelation(productionSlot?.productions);
    const professional = unwrapRelation(invitation.professionals);
    const shareUrl = buildInviteUrl(invitation.response_token);

    return {
      id: invitation.id,
      productionId: production?.id ?? productionSlot?.production_id ?? "",
      productionSlotId: invitation.production_slot_id,
      professional: professional?.full_name ?? null,
      channel: invitation.channel,
      status: invitation.status,
      message: invitation.message,
      responseToken: invitation.response_token,
      shareUrl,
      whatsappShareUrl: buildWhatsAppShareUrl(invitation.message)
    };
  });
}

export async function createInvitation(productionSlotId: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const demoInvitation = productions
      .flatMap((production) => production.slots.map((slot) => ({ production, slot })))
      .find(({ slot }) => slot.id === productionSlotId);

    if (!demoInvitation) {
      throw new Error("Slot non trovato");
    }

    const responseToken = `demo-${productionSlotId}`;

    return {
      ...buildShareInvitation(demoInvitation.production, demoInvitation.slot, responseToken, "shared"),
      responseToken
    };
  }

  const db = supabase as any;
  const { data: existing } = await db
    .from("invitations")
    .select("id, response_token, status, message, channel, production_slot_id, professionals(full_name), production_slots(production_id)")
    .eq("production_slot_id", productionSlotId)
    .in("status", ["draft", "shared", "opened"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    const productionSlot = unwrapRelation(existing.production_slots);
    const professional = unwrapRelation(existing.professionals);
    const shareUrl = buildInviteUrl(existing.response_token);

    return {
      id: existing.id,
      productionId: productionSlot?.production_id ?? "",
      productionSlotId: existing.production_slot_id,
      professional: professional?.full_name ?? null,
      channel: existing.channel,
      status: existing.status,
      message: existing.message,
      responseToken: existing.response_token,
      shareUrl,
      whatsappShareUrl: buildWhatsAppShareUrl(existing.message)
    };
  }

  const { data: slot, error: slotError } = await db
    .from("production_slots")
    .select("id, professional_id, department, role, fee, productions(id, artist, city, venue, production_date, call_time, soundcheck_time, show_time)")
    .eq("id", productionSlotId)
    .single();

  if (slotError) {
    throw new Error(slotError.message);
  }

  const production = unwrapRelation(slot.productions);

  if (!production) {
    throw new Error("Produzione non trovata per lo slot");
  }
  const token = randomUUID();
  const shareUrl = buildInviteUrl(token);
  const message = buildShareText(
    {
      artist: production.artist,
      city: production.city,
      date: new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(`${production.production_date}T00:00:00`)
      ),
      callTime: formatTime(production.call_time),
      soundcheck: formatTime(production.soundcheck_time),
      showTime: formatTime(production.show_time)
    },
    { role: slot.role, fee: slot.fee },
    shareUrl
  );

  const { data, error } = await db
    .from("invitations")
    .insert({
      production_slot_id: slot.id,
      professional_id: slot.professional_id,
      channel: "whatsapp_share",
      status: "shared",
      response_token: token,
      shared_at: new Date().toISOString(),
      message
    })
    .select("id, response_token, status, message")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await db.from("production_slots").update({ status: "pending" }).eq("id", productionSlotId);

  return {
    id: data.id,
    productionId: production.id,
    productionSlotId: slot.id,
    professional: null,
    channel: "whatsapp_share",
    status: data.status,
    message,
    responseToken: data.response_token,
    shareUrl,
    whatsappShareUrl: buildWhatsAppShareUrl(message)
  };
}

export async function getPublicInvitation(token: string): Promise<PublicInvitation | null> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    const slotId = token.replace(/^demo-/, "");
    const match = productions
      .flatMap((production) => production.slots.map((slot) => ({ production, slot })))
      .find(({ slot }) => slot.id === slotId);

    if (!match) {
      return null;
    }

    return {
      id: token,
      productionSlotId: match.slot.id,
      token,
      professional: match.slot.person ?? null,
      production: {
        artist: match.production.artist,
        city: match.production.city,
        venue: match.production.venue,
        date: match.production.date,
        callTime: match.production.callTime,
        soundcheck: match.production.soundcheck,
        showTime: match.production.showTime
      },
      slot: {
        department: match.slot.department,
        role: match.slot.role,
        fee: match.slot.fee,
        status: match.slot.status
      },
      status: match.slot.status === "pending" ? "shared" : match.slot.status
    };
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("invitations")
    .select(
      "id, response_token, status, production_slot_id, professionals(full_name), production_slots(department, role, fee, status, productions(artist, city, venue, production_date, call_time, soundcheck_time, show_time))"
    )
    .eq("response_token", token)
    .single();

  if (error) {
    return null;
  }

  await db.from("invitations").update({ status: data.status === "shared" ? "opened" : data.status, opened_at: new Date().toISOString() }).eq("id", data.id);

  const slot = unwrapRelation(data.production_slots);
  const production = unwrapRelation(slot?.productions);
  const professional = unwrapRelation(data.professionals);

  if (!slot || !production) {
    return null;
  }

  return {
    id: data.id,
    productionSlotId: data.production_slot_id,
    token: data.response_token,
    professional: professional?.full_name ?? null,
    production: {
      artist: production.artist,
      city: production.city,
      venue: production.venue,
      date: new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${production.production_date}T00:00:00`)),
      callTime: formatTime(production.call_time),
      soundcheck: formatTime(production.soundcheck_time),
      showTime: formatTime(production.show_time)
    },
    slot: {
      department: slot.department,
      role: slot.role,
      fee: slot.fee,
      status: slot.status
    },
    status: data.status
  };
}

export async function respondToInvitation(idOrToken: string, response: InvitationResponse) {
  const supabase = getSupabaseAdmin();
  const slotStatus: SlotStatus = response === "accepted" ? "confirmed" : "declined";

  if (!supabase) {
    return {
      id: idOrToken,
      response,
      slotStatus,
      mode: "demo"
    };
  }

  const db = supabase as any;
  const { data: invitation, error: invitationError } = await db
    .from("invitations")
    .select("id, production_slot_id")
    .or(`id.eq.${idOrToken},response_token.eq.${idOrToken}`)
    .single();

  if (invitationError) {
    throw new Error(invitationError.message);
  }

  const { error: updateInvitationError } = await db
    .from("invitations")
    .update({
      status: response,
      responded_at: new Date().toISOString()
    })
    .eq("id", invitation.id);

  if (updateInvitationError) {
    throw new Error(updateInvitationError.message);
  }

  const { error: updateSlotError } = await db
    .from("production_slots")
    .update({ status: slotStatus })
    .eq("id", invitation.production_slot_id);

  if (updateSlotError) {
    throw new Error(updateSlotError.message);
  }

  return {
    id: invitation.id,
    response,
    slotStatus
  };
}

export async function getProfessionalHome(): Promise<ProfessionalJob[]> {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return professionalJobs;
  }

  const db = supabase as any;
  const { data, error } = await db
    .from("production_slots")
    .select("id, role, status, fee, productions(artist, city, production_date)")
    .not("professional_id", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data.map((slot: any) => {
    const production = unwrapRelation(slot.productions);
    const date = production?.production_date
      ? new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short" }).format(new Date(`${production.production_date}T00:00:00`)).toUpperCase()
      : "--";

    return {
      id: slot.id,
      date,
      title: production?.artist ?? "Produzione",
      role: slot.role,
      city: production?.city ?? "",
      status: slot.status === "pending" ? "reply" : slot.status === "confirmed" ? "confirmed" : "unavailable",
      fee: slot.fee
    } satisfies ProfessionalJob;
  });
}

function mapProduction(production: DbProduction): Production {
  return {
    id: production.id,
    artist: production.artist,
    city: production.city,
    venue: production.venue,
    date: new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(`${production.production_date}T00:00:00`)
    ),
    callTime: formatTime(production.call_time),
    soundcheck: formatTime(production.soundcheck_time),
    showTime: formatTime(production.show_time),
    template: production.production_templates?.name ?? "Template manuale",
    manager: production.profiles?.full_name ?? "Production manager",
    slots: (production.production_slots ?? []).map((slot) => ({
      id: slot.id,
      department: slot.department as CrewSlot["department"],
      role: slot.role,
      person: slot.professionals?.full_name,
      phone: slot.professionals?.phone ?? undefined,
      status: slot.status,
      fee: slot.fee,
      source: slot.source
    }))
  };
}

function buildShareInvitation(production: Production, slot: CrewSlot, responseToken: string, status: string): ShareInvitation {
  const shareUrl = buildInviteUrl(responseToken);
  const message = buildShareText(
    {
      artist: production.artist,
      city: production.city,
      date: production.date,
      callTime: production.callTime,
      soundcheck: production.soundcheck,
      showTime: production.showTime
    },
    { role: slot.role, fee: slot.fee },
    shareUrl
  );

  return {
    id: responseToken,
    productionId: production.id,
    productionSlotId: slot.id,
    professional: slot.person ?? null,
    channel: "whatsapp_share",
    status,
    message,
    responseToken,
    shareUrl,
    whatsappShareUrl: buildWhatsAppShareUrl(message)
  };
}

function buildShareText(
  production: { artist: string; city: string; date: string; callTime: string; soundcheck: string; showTime: string },
  slot: { role: string; fee: number },
  shareUrl: string
) {
  return [
    "Pietro ti invita a una nuova data:",
    "",
    production.artist,
    `${production.date} · ${production.city}`,
    `Ruolo: ${slot.role}`,
    `Call: ${production.callTime}`,
    `Soundcheck: ${production.soundcheck}`,
    `Show: ${production.showTime}`,
    `Cachet: €${slot.fee}`,
    "",
    `Rispondi qui: ${shareUrl}`
  ].join("\n");
}

function buildInviteUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${baseUrl.replace(/\/$/, "")}/i/${token}`;
}

function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function formatTime(value: string | null) {
  return value ? value.slice(0, 5) : "--:--";
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}
