import type { Production, ProfessionalJob, ShareInvitation } from "@/lib/types";

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { data?: T; error?: string };

  if (!response.ok || !payload.data) {
    throw new Error(payload.error ?? "Errore API");
  }

  return payload.data;
}

export async function fetchProductions() {
  return readJson<Production[]>(await fetch("/api/productions"));
}

export async function fetchInvitations(productionId?: string) {
  const url = productionId ? `/api/invitations?productionId=${encodeURIComponent(productionId)}` : "/api/invitations";
  return readJson<ShareInvitation[]>(await fetch(url));
}

export async function createInvitation(productionSlotId: string) {
  return readJson<ShareInvitation>(
    await fetch("/api/invitations", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ productionSlotId })
    })
  );
}

export async function fetchProfessionalHome() {
  return readJson<ProfessionalJob[]>(await fetch("/api/professional/home"));
}
