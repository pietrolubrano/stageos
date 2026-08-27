import { NextResponse } from "next/server";
import { getProfessionalHome } from "@/lib/backend/stageos-repository";

export async function GET() {
  try {
    const data = await getProfessionalHome();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}
