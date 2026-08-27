import { CalendarDays, Clock3, Euro, MapPin, Mic2, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { InviteResponseActions } from "@/components/invite-response/invite-response-actions";
import { getPublicInvitation } from "@/lib/backend/stageos-repository";

export default async function InvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitation = await getPublicInvitation(token);

  if (!invitation) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100">
      <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-md content-center">
        <div className="glass rounded-lg p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-signal-cyan text-ink-950">
              <Mic2 size={22} />
            </div>
            <div>
              <p className="text-lg font-semibold">StageOS</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Invito produzione</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-400">{invitation.professional ? `Ciao ${invitation.professional}` : "Nuova proposta"}</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">{invitation.production.artist}</h1>
            <p className="mt-2 text-slate-300">{invitation.slot.role}</p>
          </div>

          <div className="mt-6 grid gap-3 rounded-lg border border-white/10 bg-ink-950 p-4">
            <InfoRow icon={CalendarDays} label="Data" value={invitation.production.date} />
            <InfoRow icon={MapPin} label="Luogo" value={`${invitation.production.venue}, ${invitation.production.city}`} />
            <InfoRow icon={UserRound} label="Reparto" value={invitation.slot.department} />
            <InfoRow icon={Clock3} label="Orari" value={`Call ${invitation.production.callTime} · Show ${invitation.production.showTime}`} />
            <InfoRow icon={Euro} label="Cachet" value={`€${invitation.slot.fee}`} />
          </div>

          <div className="mt-5">
            <InviteResponseActions token={token} />
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 shrink-0 text-signal-cyan" size={17} />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm text-slate-200">{value}</p>
      </div>
    </div>
  );
}
