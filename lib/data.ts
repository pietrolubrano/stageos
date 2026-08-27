import type { CrewSlot, Production, ProfessionalJob } from "@/lib/types";

export const productions: Production[] = [
  {
    id: "veronica-napoli",
    artist: "Veronica Simioli",
    city: "Napoli",
    venue: "Teatro Mediterraneo",
    date: "18 settembre 2026",
    callTime: "15:00",
    soundcheck: "18:00",
    showTime: "21:30",
    template: "SHOW VERONICA - FULL",
    manager: "Pietro",
    slots: [
      slot("s1", "Musicisti", "Basso", "Marco Bifulco", "confirmed", 220, "stageos"),
      slot("s2", "Musicisti", "Batteria", "Raffaele Russo", "confirmed", 240, "rubrica"),
      slot("s3", "Musicisti", "Chitarra", "Anna Leone", "confirmed", 220, "rubrica"),
      slot("s4", "Musicisti", "Tastiere", "Luca De Rosa", "confirmed", 220, "stageos"),
      slot("s5", "Musicisti", "Fiati", "Gianni Conte", "confirmed", 180, "esterno"),
      slot("s6", "Ballerini", "Dance captain", "Marta Vitiello", "confirmed", 160, "stageos"),
      slot("s7", "Ballerini", "Ballerino", "Sara Fusco", "pending", 150, "rubrica"),
      slot("s8", "Ballerini", "Ballerino", "Diego Romano", "confirmed", 150, "rubrica"),
      slot("s9", "Ballerini", "Ballerina", undefined, "missing", 150, "rubrica"),
      slot("s10", "Audio", "FOH Engineer", "Pietro I.", "confirmed", 250, "stageos"),
      slot("s11", "Audio", "Monitor Engineer", "Nadia Ferri", "confirmed", 220, "stageos"),
      slot("s12", "Luci", "Lighting operator", undefined, "missing", 240, "rubrica"),
      slot("s13", "Produzione", "Stage manager", "Enzo Greco", "pending", 210, "rubrica"),
      slot("s14", "Video", "LED operator", "Ciro Lanza", "declined", 200, "esterno")
    ]
  },
  {
    id: "tour-salerno",
    artist: "Produzione XYZ",
    city: "Salerno",
    venue: "Arena del Mare",
    date: "21 settembre 2026",
    callTime: "14:30",
    soundcheck: "17:30",
    showTime: "22:00",
    template: "ARENA - LIGHT",
    manager: "Pietro",
    slots: [
      slot("x1", "Audio", "FOH Engineer", "Pietro I.", "pending", 250, "stageos"),
      slot("x2", "Audio", "PA Tech", "Lorenzo Pace", "confirmed", 190, "rubrica"),
      slot("x3", "Luci", "Lighting operator", "Michele Caso", "confirmed", 230, "stageos"),
      slot("x4", "Produzione", "Runner", undefined, "missing", 120, "rubrica")
    ]
  }
];

export const professionalJobs: ProfessionalJob[] = [
  {
    id: "j1",
    date: "18 SET",
    title: "Veronica Simioli",
    role: "FOH",
    city: "Napoli",
    status: "confirmed",
    fee: 250
  },
  {
    id: "j2",
    date: "21 SET",
    title: "Produzione XYZ",
    role: "FOH",
    city: "Salerno",
    status: "reply",
    fee: 250
  },
  {
    id: "j3",
    date: "24 SET",
    title: "Indisponibile",
    role: "Blocco personale",
    city: "Calendario",
    status: "unavailable"
  }
];

export const templates = [
  "SHOW VERONICA - FULL",
  "ARENA - LIGHT",
  "CLUB - ESSENTIAL",
  "FESTIVAL - LARGE CREW"
];

function slot(
  id: string,
  department: CrewSlot["department"],
  role: string,
  person: string | undefined,
  status: CrewSlot["status"],
  fee: number,
  source: CrewSlot["source"]
): CrewSlot {
  return {
    id,
    department,
    role,
    person,
    phone: person ? "+39 333 000 0000" : undefined,
    status,
    fee,
    source
  };
}
