export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Enums: {
      invitation_channel: "share_link" | "whatsapp_share" | "push" | "email";
      invitation_status: "draft" | "shared" | "opened" | "accepted" | "declined" | "expired";
      member_role: "owner" | "manager" | "viewer";
      professional_kind: "technician" | "musician" | "dancer" | "production" | "video" | "other";
      slot_status: "confirmed" | "pending" | "missing" | "declined";
    };
    Tables: {
      invitations: {
        Row: {
          id: string;
          production_slot_id: string;
          professional_id: string | null;
          channel: Database["public"]["Enums"]["invitation_channel"];
          status: Database["public"]["Enums"]["invitation_status"];
          message: string;
          response_token: string;
          shared_at: string | null;
          opened_at: string | null;
          responded_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      productions: {
        Row: {
          id: string;
          organization_id: string;
          template_id: string | null;
          artist: string;
          city: string;
          venue: string;
          production_date: string;
          call_time: string | null;
          soundcheck_time: string | null;
          show_time: string | null;
          manager_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      production_slots: {
        Row: {
          id: string;
          production_id: string;
          professional_id: string | null;
          department: string;
          role: string;
          status: Database["public"]["Enums"]["slot_status"];
          fee: number;
          source: "rubrica" | "stageos" | "esterno";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      professionals: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string | null;
          full_name: string;
          phone: string | null;
          email: string | null;
          kind: Database["public"]["Enums"]["professional_kind"];
          city: string | null;
          notes: string | null;
          source: "rubrica" | "stageos" | "esterno";
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
