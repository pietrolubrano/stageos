export type SlotStatus = "confirmed" | "pending" | "missing" | "declined";

export type CrewSlot = {
  id: string;
  department: "Musicisti" | "Ballerini" | "Audio" | "Luci" | "Produzione" | "Video";
  role: string;
  person?: string;
  phone?: string;
  status: SlotStatus;
  fee: number;
  source: "rubrica" | "stageos" | "esterno";
};

export type Production = {
  id: string;
  artist: string;
  city: string;
  venue: string;
  date: string;
  callTime: string;
  soundcheck: string;
  showTime: string;
  template: string;
  manager: string;
  slots: CrewSlot[];
};

export type ProfessionalJob = {
  id: string;
  date: string;
  title: string;
  role: string;
  city: string;
  status: "confirmed" | "reply" | "unavailable";
  fee?: number;
};
