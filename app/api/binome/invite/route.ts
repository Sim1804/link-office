import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { email },
    });

    if (!receiver) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    if (receiver.id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas vous inviter vous-même" }, { status: 400 });
    }

    // Check existing pair
    const existing = await prisma.relationalPair.findFirst({
      where: {
        OR: [
          { initiatorId: session.user.id, receiverId: receiver.id },
          { initiatorId: receiver.id, receiverId: session.user.id }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Un binôme ou une invitation existe déjà avec cet utilisateur" }, { status: 400 });
    }

    const pair = await prisma.relationalPair.create({
      data: {
        initiatorId: session.user.id,
        receiverId: receiver.id,
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, pair });
  } catch (error: any) {
    console.error("[BINOME_INVITE_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
