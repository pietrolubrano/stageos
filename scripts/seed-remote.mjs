import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const contents = readFileSync(envPath, "utf8");

  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono richiesti");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const statements = [
  {
    table: "organizations",
    rows: [{ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "StageOS Demo" }]
  },
  {
    table: "professionals",
    rows: [
      { id: "30000000-0000-4000-8000-000000000001", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Pietro I.", phone: "+39 333 000 0001", kind: "technician", city: "Napoli", source: "stageos" },
      { id: "30000000-0000-4000-8000-000000000002", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Marco Bifulco", phone: "+39 333 000 0002", kind: "musician", city: "Napoli", source: "rubrica" },
      { id: "30000000-0000-4000-8000-000000000003", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Marta Vitiello", phone: "+39 333 000 0003", kind: "dancer", city: "Salerno", source: "stageos" },
      { id: "30000000-0000-4000-8000-000000000004", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Sara Fusco", phone: "+39 333 000 0004", kind: "dancer", city: "Napoli", source: "rubrica" },
      { id: "30000000-0000-4000-8000-000000000005", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Nadia Ferri", phone: "+39 333 000 0005", kind: "technician", city: "Napoli", source: "stageos" },
      { id: "30000000-0000-4000-8000-000000000006", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Enzo Greco", phone: "+39 333 000 0006", kind: "production", city: "Napoli", source: "rubrica" },
      { id: "30000000-0000-4000-8000-000000000007", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Ciro Lanza", phone: "+39 333 000 0007", kind: "video", city: "Napoli", source: "esterno" },
      { id: "30000000-0000-4000-8000-000000000008", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", full_name: "Lorenzo Pace", phone: "+39 333 000 0008", kind: "technician", city: "Salerno", source: "rubrica" }
    ]
  },
  {
    table: "production_templates",
    rows: [
      { id: "40000000-0000-4000-8000-000000000001", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "SHOW VERONICA - FULL", description: "Template completo per show teatrale" },
      { id: "40000000-0000-4000-8000-000000000002", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "ARENA - LIGHT", description: "Template ridotto per arena" }
    ]
  },
  {
    table: "productions",
    rows: [
      { id: "50000000-0000-4000-8000-000000000001", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", template_id: "40000000-0000-4000-8000-000000000001", artist: "Veronica Simioli", city: "Napoli", venue: "Teatro Mediterraneo", production_date: "2026-09-18", call_time: "15:00", soundcheck_time: "18:00", show_time: "21:30" },
      { id: "50000000-0000-4000-8000-000000000002", organization_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", template_id: "40000000-0000-4000-8000-000000000002", artist: "Produzione XYZ", city: "Salerno", venue: "Arena del Mare", production_date: "2026-09-21", call_time: "14:30", soundcheck_time: "17:30", show_time: "22:00" }
    ]
  },
  {
    table: "production_slots",
    rows: [
      { id: "60000000-0000-4000-8000-000000000001", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000001", department: "Audio", role: "FOH Engineer", status: "confirmed", fee: 250, source: "stageos" },
      { id: "60000000-0000-4000-8000-000000000002", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000002", department: "Musicisti", role: "Basso", status: "confirmed", fee: 220, source: "rubrica" },
      { id: "60000000-0000-4000-8000-000000000003", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000003", department: "Ballerini", role: "Dance captain", status: "pending", fee: 160, source: "stageos" },
      { id: "60000000-0000-4000-8000-000000000004", production_id: "50000000-0000-4000-8000-000000000001", professional_id: null, department: "Luci", role: "Lighting operator", status: "missing", fee: 240, source: "rubrica" },
      { id: "60000000-0000-4000-8000-000000000005", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000004", department: "Ballerini", role: "Ballerino", status: "pending", fee: 150, source: "rubrica" },
      { id: "60000000-0000-4000-8000-000000000006", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000006", department: "Produzione", role: "Stage manager", status: "pending", fee: 210, source: "rubrica" },
      { id: "60000000-0000-4000-8000-000000000007", production_id: "50000000-0000-4000-8000-000000000001", professional_id: "30000000-0000-4000-8000-000000000007", department: "Video", role: "LED operator", status: "declined", fee: 200, source: "esterno" },
      { id: "60000000-0000-4000-8000-000000000008", production_id: "50000000-0000-4000-8000-000000000002", professional_id: "30000000-0000-4000-8000-000000000001", department: "Audio", role: "FOH Engineer", status: "pending", fee: 250, source: "stageos" },
      { id: "60000000-0000-4000-8000-000000000009", production_id: "50000000-0000-4000-8000-000000000002", professional_id: "30000000-0000-4000-8000-000000000008", department: "Audio", role: "PA Tech", status: "confirmed", fee: 190, source: "rubrica" },
      { id: "60000000-0000-4000-8000-000000000010", production_id: "50000000-0000-4000-8000-000000000002", professional_id: null, department: "Produzione", role: "Runner", status: "missing", fee: 120, source: "rubrica" }
    ]
  },
  {
    table: "invitations",
    rows: [
      {
        id: "70000000-0000-4000-8000-000000000001",
        production_slot_id: "60000000-0000-4000-8000-000000000003",
        professional_id: "30000000-0000-4000-8000-000000000003",
        channel: "whatsapp_share",
        status: "shared",
        response_token: "11111111-aaaa-4bbb-8ccc-000000000001",
        shared_at: new Date().toISOString(),
        message: [
          "Pietro ti invita a una nuova data:",
          "",
          "Veronica Simioli",
          "18 settembre 2026 · Napoli",
          "Ruolo: Dance captain",
          "Call: 15:00",
          "Soundcheck: 18:00",
          "Show: 21:30",
          "Cachet: €160",
          "",
          "Rispondi qui: http://localhost:3000/i/11111111-aaaa-4bbb-8ccc-000000000001"
        ].join("\n")
      }
    ]
  }
];

for (const statement of statements) {
  const { error } = await supabase.from(statement.table).upsert(statement.rows, { onConflict: "id" });
  if (error) {
    throw new Error(`${statement.table}: ${error.message}`);
  }
  console.log(`seeded ${statement.table} (${statement.rows.length})`);
}

console.log("Remote seed completato");
