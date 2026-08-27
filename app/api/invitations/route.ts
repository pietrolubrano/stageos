import { NextResponse } from "next/server";
import { createInvitation, listInvitations } from "@/lib/backend/stageos-repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productionId = searchParams.get("productionId") ?? undefined;
    const data = await listInvitations(productionId);

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { productionSlotId?: string };

    if (!body.productionSlotId) {
      return NextResponse.json({ error: "productionSlotId richiesto" }, { status: 400 });
    }

    const data = await createInvitation(body.productionSlotId);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}
