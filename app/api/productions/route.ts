import { NextResponse } from "next/server";
import { listProductions } from "@/lib/backend/stageos-repository";

export async function GET() {
  try {
    const data = await listProductions();
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}
