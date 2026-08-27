import { NextResponse } from "next/server";
import { getProduction } from "@/lib/backend/stageos-repository";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getProduction(id);

    if (!data) {
      return NextResponse.json({ error: "Produzione non trovata" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}
