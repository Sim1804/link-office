import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: binomeId } = await params;
    const { mood, actionStatus, encouragement, checkinType } = await req.json();

    const binome = await prisma.binome.findUnique({
      where: { id: binomeId }
    });

    if (!binome) {
      return NextResponse.json({ error: "Binôme introuvable" }, { status: 404 });
    }

    if (binome.userAId !== session.user.id && binome.userBId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const checkin = await prisma.binomeCheckin.create({
      data: {
        binomeId,
        userId: session.user.id,
        mood,
        actionStatus,
        encouragement,
        checkinType // "RAPIDE" or "APPROFONDI"
      }
    });

    // Optionnel : Mettre à jour le statut du binôme ou le healthScore si besoin
    await prisma.binome.update({
      where: { id: binomeId },
      data: { updatedAt: new Date() } // Touch le binome pour montrer de l'activité
    });

    return NextResponse.json({ success: true, checkin });
  } catch (error: any) {
    console.error("[BINOME_CHECKIN_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: binomeId } = await params;

    const binome = await prisma.binome.findUnique({
      where: { id: binomeId },
      include: {
        checkins: {
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    });

    if (!binome) {
      return NextResponse.json({ error: "Binôme introuvable" }, { status: 404 });
    }

    if (binome.userAId !== session.user.id && binome.userBId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    return NextResponse.json({ success: true, checkins: binome.checkins });
  } catch (error: any) {
    console.error("[BINOME_CHECKIN_GET_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
