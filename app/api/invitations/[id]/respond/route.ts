import { NextResponse } from "next/server";
import { respondToInvitation } from "@/lib/backend/stageos-repository";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { response?: "accepted" | "declined"; token?: string };

    if (body.response !== "accepted" && body.response !== "declined") {
      return NextResponse.json({ error: "response deve essere accepted o declined" }, { status: 400 });
    }

    const data = await respondToInvitation(body.token ?? id, body.response);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Errore backend" }, { status: 500 });
  }
}
