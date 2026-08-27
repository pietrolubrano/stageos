"use client";

import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";

type ResponseState = "idle" | "accepted" | "declined" | "error";

export function InviteResponseActions({ token }: { token: string }) {
  const [state, setState] = useState<ResponseState>("idle");
  const [loading, setLoading] = useState<"accepted" | "declined" | null>(null);

  async function respond(response: "accepted" | "declined") {
    setLoading(response);
    setState("idle");

    const result = await fetch(`/api/invitations/${token}/respond`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ response, token })
    });

    setLoading(null);
    setState(result.ok ? response : "error");
  }

  if (state === "accepted" || state === "declined") {
    return (
      <div className="rounded-lg border border-signal-green/30 bg-signal-green/10 p-4 text-center">
        <p className="font-semibold text-signal-green">{state === "accepted" ? "Data accettata" : "Risposta registrata"}</p>
        <p className="mt-2 text-sm text-slate-300">La produzione e stata aggiornata. Puoi chiudere questa pagina.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-md bg-signal-green font-semibold text-ink-950"
          disabled={loading !== null}
          onClick={() => respond("accepted")}
        >
          {loading === "accepted" ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Accetta
        </button>
        <button
          className="flex h-12 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 font-semibold text-white"
          disabled={loading !== null}
          onClick={() => respond("declined")}
        >
          {loading === "declined" ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
          Rifiuta
        </button>
      </div>
      {state === "error" && <p className="text-sm text-signal-red">Non sono riuscito a registrare la risposta. Riprova.</p>}
    </div>
  );
}
