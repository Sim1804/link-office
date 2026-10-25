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

    // Mettre à jour l'activité du binôme
    await prisma.binome.update({
      where: { id: binomeId },
      data: { updatedAt: new Date() }
    });

    // ── GAMIFICATION ──
    // Points : RAPIDE = 10, APPROFONDI = 30
    const pointsToAdd = checkinType === "RAPIDE" ? 10 : 30;
    const isUserA = binome.userAId === session.user.id;

    // Chercher la ligne de gamification existante
    const gamification = await prisma.binomeGamification.findUnique({
      where: { binomeId }
    });

    if (gamification) {
      await prisma.binomeGamification.update({
        where: { id: gamification.id },
        data: {
          pointsUserA: isUserA ? { increment: pointsToAdd } : undefined,
          pointsUserB: !isUserA ? { increment: pointsToAdd } : undefined,
          pointsBinome: { increment: pointsToAdd }
        }
      });
    } else {
      // Créer la ligne si elle n'existe pas encore
      await prisma.binomeGamification.create({
        data: {
          binomeId,
          userAId: binome.userAId,
          userBId: binome.userBId,
          pointsUserA: isUserA ? pointsToAdd : 0,
          pointsUserB: !isUserA ? pointsToAdd : 0,
          pointsBinome: pointsToAdd
        }
      });
    }

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: binomeId } = await params;
    const { checkinId, actionStatus } = await req.json();

    if (!checkinId || !actionStatus) {
      return NextResponse.json({ error: "Paramètres manquants (checkinId, actionStatus)" }, { status: 400 });
    }

    const binome = await prisma.binome.findUnique({
      where: { id: binomeId },
    });

    if (!binome) {
      return NextResponse.json({ error: "Binôme introuvable" }, { status: 404 });
    }

    if (binome.userAId !== session.user.id && binome.userBId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const existingCheckin = await prisma.binomeCheckin.findUnique({
      where: { id: checkinId },
    });

    if (!existingCheckin || existingCheckin.binomeId !== binomeId) {
      return NextResponse.json({ error: "Check-in introuvable" }, { status: 404 });
    }

    const previousStatus = existingCheckin.actionStatus;

    const updatedCheckin = await prisma.binomeCheckin.update({
      where: { id: checkinId },
      data: { actionStatus },
    });

    await prisma.binome.update({
      where: { id: binomeId },
      data: { updatedAt: new Date() },
    });

    // Gamification : +10 points si passage à "Réalisée"
    const isNowRealized = actionStatus === "Réalisée" || actionStatus === "REALISEE";
    const wasRealized = previousStatus === "Réalisée" || previousStatus === "REALISEE";

    if (isNowRealized && !wasRealized) {
      const bonusPoints = 10;
      const isUserA = binome.userAId === existingCheckin.userId;

      const gamification = await prisma.binomeGamification.findUnique({
        where: { binomeId },
      });

      if (gamification) {
        await prisma.binomeGamification.update({
          where: { id: gamification.id },
          data: {
            pointsUserA: isUserA ? { increment: bonusPoints } : undefined,
            pointsUserB: !isUserA ? { increment: bonusPoints } : undefined,
            pointsBinome: { increment: bonusPoints },
          },
        });
      } else {
        await prisma.binomeGamification.create({
          data: {
            binomeId,
            userAId: binome.userAId,
            userBId: binome.userBId,
            pointsUserA: isUserA ? bonusPoints : 0,
            pointsUserB: !isUserA ? bonusPoints : 0,
            pointsBinome: bonusPoints,
          },
        });
      }
    }

    return NextResponse.json({ success: true, checkin: updatedCheckin });
  } catch (error: any) {
    console.error("[BINOME_CHECKIN_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
