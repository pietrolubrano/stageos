# StageOS Backend

Backend MVP per gestire produzioni live, cast/crew, inviti condivisibili e risposta del professionista.

## Modalita

Senza variabili Supabase configurate, le API usano i dati demo gia presenti nella UI.

Con Supabase configurato, le API usano il service role solo lato server:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Il service role non deve mai essere esposto nel browser.

## Schema

La migration iniziale e in:

```text
supabase/migrations/20260827190000_initial_stageos_schema.sql
```

Entita principali:

- `organizations`
- `profiles`
- `organization_members`
- `professionals`
- `production_templates`
- `template_slots`
- `productions`
- `production_slots`
- `invitations`

## Inviti V1

Nella V1 WhatsApp non e un'integrazione Business API.

StageOS genera:

- `shareUrl`: pagina pubblica `/i/:token` dove il professionista accetta o rifiuta
- `whatsappShareUrl`: link `wa.me` con testo precompilato
- `message`: testo leggibile che il manager puo inviare dal proprio WhatsApp

Questo mantiene il messaggio personale: il professionista riceve dal numero del manager, non da un numero business della piattaforma.

Tutte le tabelle pubbliche hanno RLS attiva. I manager leggono e scrivono dati solo nelle organizzazioni di cui sono membri.

## Endpoint

```http
GET /api/productions
GET /api/productions/:id
GET /api/invitations
GET /api/invitations?productionId=:id
POST /api/invitations
POST /api/invitations/:id/respond
GET /api/professional/home
GET /i/:token
```

Creare un invito:

```json
{
  "productionSlotId": "slot-id"
}
```

La risposta include:

```json
{
  "shareUrl": "http://localhost:3000/i/demo-s12",
  "whatsappShareUrl": "https://wa.me/?text=...",
  "message": "Pietro ti invita a una nuova data..."
}
```

Rispondere a un invito:

```json
{
  "response": "accepted"
}
```

oppure:

```json
{
  "response": "declined"
}
```

## Setup locale Supabase

Serve Supabase CLI e Docker attivo.

```bash
npm run supabase:start
npm run supabase:reset
npm run supabase:types
```

Per collegare un progetto remoto:

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
```
