"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  Copy,
  Headphones,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Mic2,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  UserRound,
  UsersRound,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createInvitation, fetchInvitations, fetchProductions, fetchProfessionalHome } from "@/lib/client/api";
import { templates } from "@/lib/data";
import { departmentSummary, invitationCount, productionIssues } from "@/lib/metrics";
import type { CrewSlot, Production, ProfessionalJob, ShareInvitation, SlotStatus } from "@/lib/types";

type View = "dashboard" | "production" | "crew" | "invites" | "professional";

const navItems: Array<{ view: View; label: string; icon: typeof LayoutDashboard }> = [
  { view: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { view: "production", label: "Produzione", icon: ClipboardList },
  { view: "crew", label: "Cast/Crew", icon: UsersRound },
  { view: "invites", label: "Inviti", icon: MessageCircle },
  { view: "professional", label: "Mobile", icon: Smartphone }
];

const statusCopy: Record<SlotStatus, string> = {
  confirmed: "Confermato",
  pending: "In attesa",
  missing: "Da assegnare",
  declined: "Rifiutato"
};

export function StageOSPrototype() {
  const [view, setView] = useState<View>("dashboard");
  const [productions, setProductions] = useState<Production[]>([]);
  const [invitations, setInvitations] = useState<ShareInvitation[]>([]);
  const [jobs, setJobs] = useState<ProfessionalJob[]>([]);
  const [selectedProductionId, setSelectedProductionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSlotId, setCreatingSlotId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [nextProductions, nextInvitations, nextJobs] = await Promise.all([fetchProductions(), fetchInvitations(), fetchProfessionalHome()]);
    setProductions(nextProductions);
    setInvitations(nextInvitations);
    setJobs(nextJobs);
    setSelectedProductionId((current) => current ?? nextProductions[0]?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        await refresh();
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Impossibile caricare i dati");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const selectedProduction = productions.find((production) => production.id === selectedProductionId) ?? productions[0];
  const missingTotal = productions.reduce((sum, production) => sum + productionIssues(production), 0);
  const pendingTotal = productions.reduce((sum, production) => sum + invitationCount(production, "pending"), 0);

  async function handleCreateInvitation(productionSlotId: string) {
    setCreatingSlotId(productionSlotId);
    setError(null);

    try {
      await createInvitation(productionSlotId);
      await refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Impossibile creare l'invito");
    } finally {
      setCreatingSlotId(null);
    }
  }

  return (
    <main className="min-h-screen px-4 py-4 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 xl:flex-row">
        <aside className="glass flex shrink-0 flex-col justify-between rounded-lg p-4 xl:min-h-[calc(100vh-32px)] xl:w-64">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-signal-cyan text-ink-950">
                <Mic2 size={22} strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-lg font-semibold leading-none">StageOS</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Nome provvisorio</p>
              </div>
            </div>

            <nav className="mt-8 grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.view === view;

                return (
                  <button
                    key={item.view}
                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-left text-sm transition ${
                    active ? "bg-white text-ink-950" : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setView(item.view)}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-ink-900 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck size={17} className="text-signal-green" />
              {loading ? "Caricamento dati" : error ? "API non raggiungibile" : "Dati live"}
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Produzioni, slot e inviti arrivano dalle API. Il manager condivide un link `/i/[token]` dal proprio WhatsApp.
            </p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          <TopBar />

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              {loading && <LoadingState />}
              {!loading && error && <ErrorState message={error} />}
              {!loading && !error && !selectedProduction && <EmptyState />}
              {!loading && selectedProduction && view === "dashboard" && (
                <Dashboard
                  productions={productions}
                  missingTotal={missingTotal}
                  pendingTotal={pendingTotal}
                  onOpenProduction={(id) => {
                    setSelectedProductionId(id);
                    setView("production");
                  }}
                />
              )}
              {!loading && selectedProduction && view === "production" && (
                <ProductionDetail production={selectedProduction} onGoCrew={() => setView("crew")} />
              )}
              {!loading && selectedProduction && view === "crew" && <CrewBoard production={selectedProduction} />}
              {!loading && selectedProduction && view === "invites" && (
                <InvitesPanel
                  production={selectedProduction}
                  invitations={invitations.filter((invitation) => invitation.productionId === selectedProduction.id)}
                  creatingSlotId={creatingSlotId}
                  onCreateInvitation={handleCreateInvitation}
                />
              )}
              {!loading && view === "professional" && <ProfessionalWorkspace jobs={jobs} />}
            </div>

            {selectedProduction && <MobilePreview selectedProduction={selectedProduction} jobs={jobs} />}
          </div>
        </section>
      </div>
    </main>
  );
}

function TopBar() {
  return (
    <header className="glass flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3 rounded-md border border-white/10 bg-ink-950 px-3 py-2 sm:w-[420px]">
        <Search size={18} className="shrink-0 text-slate-500" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
          placeholder="Cerca produzione, ruolo, professionista"
        />
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <button className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-ink-900 text-slate-300 hover:bg-ink-800" title="Notifiche">
          <Bell size={18} />
        </button>
        <button className="flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-ink-950">
          <Plus size={17} />
          Nuova data
        </button>
      </div>
    </header>
  );
}

function LoadingState() {
  return (
    <section className="glass grid place-items-center rounded-lg p-10 text-slate-400">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin" size={18} />
        Caricamento produzioni e inviti
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="glass rounded-lg border border-signal-red/30 p-6">
      <p className="font-semibold text-signal-red">Non riesco a leggere i dati live</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{message}</p>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="glass rounded-lg p-6">
      <p className="font-semibold">Nessuna produzione</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">Quando lo schema e il seed saranno sul progetto Supabase, dashboard e inviti si popolano da qui.</p>
    </section>
  );
}

function Dashboard({
  productions,
  missingTotal,
  pendingTotal,
  onOpenProduction
}: {
  productions: Production[];
  missingTotal: number;
  pendingTotal: number;
  onOpenProduction: (id: string) => void;
}) {
  return (
    <div className="grid gap-4">
      <section className="glass rounded-lg p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-slate-400">Buongiorno, Pietro</p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Le tue prossime produzioni</h1>
          </div>
            <div className="grid grid-cols-3 gap-2 lg:min-w-[460px]">
            <Metric label="Date" value={productions.length.toString()} tone="cyan" />
            <Metric label="Da completare" value={missingTotal.toString()} tone="red" />
            <Metric label="Inviti pendenti" value={pendingTotal.toString()} tone="amber" />
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {productions.map((production) => (
          <ProductionCard key={production.id} production={production} onOpen={() => onOpenProduction(production.id)} />
        ))}
      </section>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "cyan" | "red" | "amber" }) {
  const toneClass = {
    cyan: "text-signal-cyan",
    red: "text-signal-red",
    amber: "text-signal-amber"
  }[tone];

  return (
    <div className="rounded-md border border-white/10 bg-ink-900 p-3">
      <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}

function ProductionCard({ production, onOpen }: { production: Production; onOpen: () => void }) {
  const departments = departmentSummary(production.slots);
  const issues = productionIssues(production);
  const issueRoles = production.slots.filter((slot) => slot.status === "missing" || slot.status === "declined").map((slot) => slot.role);

  return (
    <article className="glass rounded-lg p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            <span>{production.date}</span>
            <span>{production.city}</span>
            <StatusPill status={issues > 0 ? "missing" : "confirmed"} label={issues > 0 ? "Incompleta" : "Completa"} />
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">{production.artist}</h2>
          <p className="mt-1 text-sm text-slate-400">{production.venue}</p>
        </div>

        <button className="flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-medium text-ink-950" onClick={onOpen}>
          Apri produzione
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {departments.map((item) => (
          <div key={item.department} className="rounded-md border border-white/10 bg-ink-900 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.department}</p>
              <p className={`text-sm font-semibold ${item.complete ? "text-signal-green" : "text-signal-amber"}`}>
                {item.confirmed}/{item.total}
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full bg-signal-green" style={{ width: `${(item.confirmed / item.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {issues > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-signal-red/30 bg-signal-red/10 p-3 text-sm text-slate-200">
          <CircleAlert size={18} className="mt-0.5 shrink-0 text-signal-red" />
          <span>
            Mancano {issues} assegnazioni o sostituzioni
            {issueRoles.length > 0 ? `. Priorita: ${issueRoles.join(", ")}.` : "."}
          </span>
        </div>
      )}
    </article>
  );
}

function ProductionDetail({ production, onGoCrew }: { production: Production; onGoCrew: () => void }) {
  const departments = departmentSummary(production.slots);
  const totalFees = production.slots.reduce((sum, slot) => sum + slot.fee, 0);

  return (
    <div className="grid gap-4">
      <section className="glass rounded-lg p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-400">{production.template}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{production.artist}</h1>
            <p className="mt-2 text-slate-300">
              {production.date} · {production.venue} · {production.city}
            </p>
          </div>
          <button className="flex h-10 items-center justify-center gap-2 rounded-md bg-signal-cyan px-3 text-sm font-semibold text-ink-950" onClick={onGoCrew}>
            <UsersRound size={17} />
            Gestisci cast/crew
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <TimeBlock label="Call" value={production.callTime} />
          <TimeBlock label="Soundcheck" value={production.soundcheck} />
          <TimeBlock label="Show" value={production.showTime} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="glass rounded-lg p-4">
          <h2 className="text-lg font-semibold">Stato reparti</h2>
          <div className="mt-4 grid gap-3">
            {departments.map((department) => (
              <div key={department.department} className="rounded-md border border-white/10 bg-ink-900 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{department.department}</p>
                  <p className="text-sm text-slate-400">
                    {department.confirmed}/{department.total} confermati
                  </p>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <StatusCount label="OK" value={department.confirmed} tone="green" />
                  <StatusCount label="Attesa" value={department.pending} tone="amber" />
                  <StatusCount label="Problemi" value={department.missing} tone="red" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <h2 className="text-lg font-semibold">Budget crew</h2>
          <p className="mt-4 text-3xl font-semibold text-signal-green">€{totalFees.toLocaleString("it-IT")}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Somma cachet per tutti gli slot del template. In V1 resta operativo, non contabile.
          </p>
          <div className="mt-5 rounded-md border border-white/10 bg-ink-950 p-3">
            <p className="text-sm font-medium">Template disponibili</p>
            <div className="mt-3 grid gap-2">
              {templates.map((template) => (
                <button key={template} className="rounded-md border border-white/10 px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10">
                  {template}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TimeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-ink-900 p-3">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Clock3 size={16} />
        {label}
      </div>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function StatusCount({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "red" }) {
  const toneClass = {
    green: "text-signal-green",
    amber: "text-signal-amber",
    red: "text-signal-red"
  }[tone];

  return (
    <div className="rounded-md bg-ink-950 p-2">
      <p className={`text-lg font-semibold ${toneClass}`}>{value}</p>
      <p className="text-slate-500">{label}</p>
    </div>
  );
}

function CrewBoard({ production }: { production: Production }) {
  const [filter, setFilter] = useState<"all" | SlotStatus>("all");
  const slots = filter === "all" ? production.slots : production.slots.filter((slot) => slot.status === filter);

  return (
    <section className="glass rounded-lg p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cast/Crew</h1>
          <p className="mt-1 text-sm text-slate-400">{production.artist} · slot da template e assegnazioni manuali</p>
        </div>
        <div className="grid grid-cols-5 gap-1 rounded-md border border-white/10 bg-ink-950 p-1 text-xs">
          {(["all", "confirmed", "pending", "missing", "declined"] as const).map((item) => (
            <button
              key={item}
              className={`h-9 rounded px-2 ${filter === item ? "bg-white text-ink-950" : "text-slate-400 hover:bg-white/10"}`}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "Tutti" : statusCopy[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-[1.1fr_1fr_.8fr_.7fr_.7fr] gap-3 bg-ink-950 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-500">
          <span>Ruolo</span>
          <span>Persona</span>
          <span>Stato</span>
          <span>Fonte</span>
          <span className="text-right">Cachet</span>
        </div>
        <div className="divide-y divide-white/10">
          {slots.map((slot) => (
            <CrewRow key={slot.id} slot={slot} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CrewRow({ slot }: { slot: CrewSlot }) {
  return (
    <div className="grid grid-cols-1 gap-3 bg-ink-900 px-3 py-3 text-sm md:grid-cols-[1.1fr_1fr_.8fr_.7fr_.7fr] md:items-center">
      <div>
        <p className="font-medium text-white">{slot.role}</p>
        <p className="text-xs text-slate-500">{slot.department}</p>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={slot.person ?? "Slot vuoto"} />
        <div className="min-w-0">
          <p className="truncate text-slate-200">{slot.person ?? "Non assegnato"}</p>
          <p className="truncate text-xs text-slate-500">{slot.phone ?? "Da rubrica o nuovo contatto"}</p>
        </div>
      </div>
      <StatusPill status={slot.status} label={statusCopy[slot.status]} />
      <span className="text-xs uppercase tracking-[0.12em] text-slate-400">{slot.source}</span>
      <span className="text-left font-semibold text-slate-200 md:text-right">€{slot.fee}</span>
    </div>
  );
}

function InvitesPanel({
  production,
  invitations,
  creatingSlotId,
  onCreateInvitation
}: {
  production: Production;
  invitations: ShareInvitation[];
  creatingSlotId: string | null;
  onCreateInvitation: (productionSlotId: string) => Promise<void>;
}) {
  const slotsNeedingInvite = useMemo(
    () => production.slots.filter((slot) => slot.status === "pending" || slot.status === "missing" || slot.status === "declined"),
    [production]
  );
  const invitationBySlot = useMemo(
    () => new Map(invitations.map((invitation) => [invitation.productionSlotId, invitation])),
    [invitations]
  );
  const firstMissing = slotsNeedingInvite.find((slot) => !invitationBySlot.has(slot.id));

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="glass min-w-0 rounded-lg p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Inviti e conferme</h1>
            <p className="mt-1 text-sm text-slate-400">StageOS prepara il link, il manager invia dal proprio WhatsApp.</p>
          </div>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink-950 disabled:opacity-50"
            disabled={!firstMissing || creatingSlotId !== null}
            onClick={() => firstMissing && onCreateInvitation(firstMissing.id)}
          >
            {creatingSlotId ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
            Crea link invito
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {slotsNeedingInvite.length === 0 && (
            <div className="rounded-lg border border-white/10 bg-ink-900 p-4 text-sm text-slate-400">Tutti gli slot di questa produzione sono confermati.</div>
          )}
          {slotsNeedingInvite.map((slot) => {
            const invitation = invitationBySlot.get(slot.id);
            const creating = creatingSlotId === slot.id;

            return (
              <div key={slot.id} className="min-w-0 rounded-lg border border-white/10 bg-ink-900 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">{slot.role}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {slot.person ?? "Suggerisci professionista"} · {slot.department} · €{slot.fee}
                    </p>
                  </div>
                  <StatusPill status={slot.status} label={statusCopy[slot.status]} />
                </div>

                {invitation ? (
                  <>
                    <div className="mt-3 overflow-hidden rounded-md border border-signal-cyan/20 bg-ink-950 p-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Link con token</p>
                      <p className="mt-2 break-all font-mono text-sm text-signal-cyan">{invitation.shareUrl}</p>
                      <p className="mt-2 break-all text-xs text-slate-400">Token: {invitation.responseToken}</p>
                    </div>

                    <div className="mt-3 whitespace-pre-wrap break-all rounded-md bg-ink-950 p-3 text-sm leading-6 text-slate-300">
                      {invitation.message}
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <a
                        className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 text-sm font-semibold text-ink-950"
                        href={invitation.whatsappShareUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <MessageCircle size={17} />
                        Apri WhatsApp
                      </a>
                      <button
                        className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                        onClick={() => navigator.clipboard.writeText(invitation.shareUrl)}
                        type="button"
                      >
                        <Copy size={17} />
                        Copia link
                      </button>
                      <a
                        className="flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 px-3 text-sm font-semibold text-slate-200 hover:bg-white/10"
                        href={invitation.shareUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Apri pagina risposta
                        <ChevronRight size={17} />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="mt-3">
                    <button
                      className="flex h-10 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-ink-950 disabled:opacity-50"
                      disabled={creatingSlotId !== null}
                      onClick={() => onCreateInvitation(slot.id)}
                      type="button"
                    >
                      {creating ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                      Genera link condivisibile
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-lg p-4">
        <h2 className="text-lg font-semibold">Flusso V1</h2>
        <div className="mt-4 grid gap-3">
          <ChannelStep icon={MessageCircle} title="WhatsApp personale" text="Il messaggio parte dal manager, non da un numero business StageOS." />
          <ChannelStep icon={Bell} title="Link pubblico" text="Il professionista apre una pagina StageOS minimale per accettare o rifiutare." />
          <ChannelStep icon={Check} title="Realtime" text="Slot aggiornato subito nella dashboard manager." />
        </div>
      </div>
    </section>
  );
}

function ChannelStep({ icon: Icon, title, text }: { icon: typeof MessageCircle; title: string; text: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-ink-950 p-3">
      <div className="flex items-center gap-2 font-medium">
        <Icon size={17} className="text-signal-cyan" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-5 text-slate-400">{text}</p>
    </div>
  );
}

function ProfessionalWorkspace({ jobs }: { jobs: ProfessionalJob[] }) {
  const incoming = jobs.find((job) => job.status === "reply") ?? jobs[0];

  return (
    <section className="glass rounded-lg p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-400">App professionista</p>
          <h1 className="mt-2 text-2xl font-semibold">Home e calendario</h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-400">
          Questa vista anticipa la futura app Expo/React Native: pochi comandi, risposta rapida e calendario personale sempre allineato.
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-ink-900 p-4">
          <h2 className="text-lg font-semibold">Prossime date</h2>
          <div className="mt-4 grid gap-3">
            {jobs.length === 0 && <p className="text-sm text-slate-400">Nessuna data assegnata.</p>}
            {jobs.map((job) => (
              <ProfessionalJobRow key={job.id} job={job} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-ink-900 p-4">
          <h2 className="text-lg font-semibold">Proposta in arrivo</h2>
          {incoming ? (
            <div className="mt-4 rounded-lg bg-white p-4 text-ink-950">
              <p className="text-sm font-semibold text-slate-500">Nuova data</p>
              <h3 className="mt-2 text-xl font-semibold">
                {incoming.date} · {incoming.city}
              </h3>
              <div className="mt-4 grid gap-2 text-sm">
                <InfoLine label="Ruolo" value={incoming.role} />
                <InfoLine label="Titolo" value={incoming.title} />
                <InfoLine label="Cachet" value={incoming.fee ? `€${incoming.fee}` : "Da confermare"} />
              </div>
              <p className="mt-5 text-sm text-slate-500">Per accettare o rifiutare usa il link pubblico ricevuto su WhatsApp.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Nessuna proposta in attesa.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function MobilePreview({ selectedProduction, jobs }: { selectedProduction: Production; jobs: ProfessionalJob[] }) {
  const incoming = jobs.find((job) => job.status === "reply");
  return (
    <aside className="glass hidden rounded-lg p-4 2xl:block">
      <div className="mx-auto w-[300px] rounded-[34px] border border-white/15 bg-ink-950 p-3 shadow-panel">
        <div className="rounded-[26px] bg-[#F6F8FB] p-4 text-ink-950">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">StageOS</p>
              <p className="text-lg font-semibold">Ciao, Pietro</p>
            </div>
            <Avatar name="Pietro" light />
          </div>

          <div className="mt-5 rounded-2xl bg-ink-950 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Rispondi ora</p>
            <h3 className="mt-2 text-lg font-semibold">{incoming?.title ?? selectedProduction.artist}</h3>
            <p className="mt-1 text-sm text-slate-300">
              {incoming?.city ?? selectedProduction.city} · {incoming?.role ?? "Ruolo"} · {incoming?.fee ? `€${incoming.fee}` : "Cachet da confermare"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="h-10 rounded-md bg-signal-green text-sm font-semibold text-ink-950">Accetta</button>
              <button className="h-10 rounded-md bg-white/10 text-sm font-semibold">Rifiuta</button>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold">Prossime date</p>
            <div className="mt-3 grid gap-2">
              {jobs.map((job) => (
                <ProfessionalJobRow key={job.id} job={job} compact />
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 text-[10px] font-medium text-slate-500 shadow-sm">
            <MobileTab icon={CalendarDays} label="Home" active />
            <MobileTab icon={Clock3} label="Calend." />
            <MobileTab icon={Headphones} label="Lavori" />
            <MobileTab icon={UserRound} label="Profilo" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function ProfessionalJobRow({ job, compact = false }: { job: ProfessionalJob; compact?: boolean }) {
  const statusClasses = {
    confirmed: "bg-emerald-100 text-emerald-700",
    reply: "bg-amber-100 text-amber-800",
    unavailable: "bg-slate-200 text-slate-600"
  }[job.status];

  return (
    <div className={`rounded-lg ${compact ? "bg-white" : "bg-ink-950"} p-3 ${compact ? "text-ink-950 shadow-sm" : "text-white"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`grid h-11 w-12 shrink-0 place-items-center rounded-md ${compact ? "bg-slate-100" : "bg-white/10"} text-sm font-semibold`}>
            {job.date}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold">{job.title}</p>
            <p className={`truncate text-sm ${compact ? "text-slate-500" : "text-slate-400"}`}>
              {job.role} · {job.city}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${statusClasses}`}>
          {job.status === "confirmed" ? "OK" : job.status === "reply" ? "Rispondi" : "Blocco"}
        </span>
      </div>
    </div>
  );
}

function MobileTab({ icon: Icon, label, active = false }: { icon: typeof CalendarDays; label: string; active?: boolean }) {
  return (
    <button className={`grid min-h-12 place-items-center rounded-xl ${active ? "bg-ink-950 text-white" : "text-slate-500"}`}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Avatar({ name, light = false }: { name: string; light?: boolean }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md text-xs font-semibold ${
        light ? "bg-signal-cyan text-ink-950" : "bg-slate-700 text-white"
      }`}
    >
      {initials}
    </div>
  );
}

function StatusPill({ status, label }: { status: SlotStatus; label: string }) {
  const classes = {
    confirmed: "border-signal-green/30 bg-signal-green/10 text-signal-green",
    pending: "border-signal-amber/30 bg-signal-amber/10 text-signal-amber",
    missing: "border-signal-red/30 bg-signal-red/10 text-signal-red",
    declined: "border-signal-red/30 bg-signal-red/10 text-signal-red"
  }[status];
  const Icon = status === "confirmed" ? Check : status === "pending" ? Clock3 : status === "missing" ? CircleAlert : X;

  return (
    <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${classes}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}
