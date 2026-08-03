import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { pairId, accept } = await req.json();
    if (!pairId) {
      return NextResponse.json({ error: "ID du binôme requis" }, { status: 400 });
    }

    const pair = await prisma.relationalPair.findUnique({
      where: { id: pairId }
    });

    if (!pair || pair.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Invitation introuvable ou non autorisée" }, { status: 404 });
    }

    const updated = await prisma.relationalPair.update({
      where: { id: pairId },
      data: { status: accept ? "ACCEPTED" : "REJECTED" }
    });

    return NextResponse.json({ success: true, pair: updated });
  } catch (error: any) {
    console.error("[BINOME_RESPOND_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
