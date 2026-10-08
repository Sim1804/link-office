import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Chercher un binôme actif
    const activeBinome = await prisma.binome.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "ACTIVE"
      },
      include: {
        userA: { select: { id: true, firstName: true, lastName: true } },
        userB: { select: { id: true, firstName: true, lastName: true } },
      }
    });

    if (activeBinome) {
      const partner = activeBinome.userAId === userId ? activeBinome.userB : activeBinome.userA;
      return NextResponse.json({
        success: true,
        status: "active",
        binome: {
          id: activeBinome.id,
          healthScore: activeBinome.healthScore,
          startDate: activeBinome.startDate,
          partner: {
            id: partner.id,
            firstName: partner.firstName,
            lastName: partner.lastName
          }
        }
      });
    }

    // 2. Chercher une suggestion ou invitation en attente
    const pendingSuggestion = await prisma.binomeSuggestion.findFirst({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        status: "PENDING"
      },
      include: {
        userA: { select: { id: true, firstName: true } },
        userB: { select: { id: true, firstName: true } },
      }
    });

    if (pendingSuggestion) {
      const isInitiator = pendingSuggestion.userAId === userId;
      const partner = isInitiator ? pendingSuggestion.userB : pendingSuggestion.userA;
      return NextResponse.json({
        success: true,
        status: "pending",
        isInitiator,
        partnerFirstName: partner.firstName,
        suggestionId: pendingSuggestion.id
      });
    }

    return NextResponse.json({
      success: true,
      status: "none"
    });
  } catch (error: any) {
    console.error("[BINOME_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
