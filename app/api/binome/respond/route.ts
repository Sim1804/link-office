import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BINOME_ALLOWED_ROLES = ["EMPLOYEE", "SUPER_ADMIN"];

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

    if (!BINOME_ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Le Binôme Relationnel est réservé aux comptes individuels Premium/Premium+." },
        { status: 403 }
      );
    }

    const suggestion = await prisma.binomeSuggestion.findUnique({
      where: { id: pairId }
    });

    if (!suggestion) {
      return NextResponse.json({ error: "Suggestion introuvable" }, { status: 404 });
    }

    if (suggestion.userAId !== session.user.id && suggestion.userBId !== session.user.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const isUserA = suggestion.userAId === session.user.id;
    const responseField = isUserA ? "responseA" : "responseB";
    const responseValue = accept ? "ACCEPTED" : "REFUSED";

    const updated = await prisma.binomeSuggestion.update({
      where: { id: pairId },
      data: { [responseField]: responseValue }
    });

    let newBinome = null;

    // Les deux ont accepté → créer le binôme et initialiser la gamification
    if (updated.responseA === "ACCEPTED" && updated.responseB === "ACCEPTED") {
      newBinome = await prisma.binome.create({
        data: {
          userAId: updated.userAId,
          userBId: updated.userBId,
          campaignId: updated.campaignId ?? null,
          status: "ACTIVE",
        }
      });

      // Initialiser la gamification dès la création
      await prisma.binomeGamification.create({
        data: {
          binomeId: newBinome.id,
          userAId: updated.userAId,
          userBId: updated.userBId,
          pointsUserA: 0,
          pointsUserB: 0,
          pointsBinome: 0,
          badges: [],
          unlockDates: {},
        }
      });

      // Marquer la suggestion comme acceptée
      await prisma.binomeSuggestion.update({
        where: { id: pairId },
        data: { status: "ACCEPTED" }
      });
    } else if (responseValue === "REFUSED") {
      // Marquer comme rejeté si refus
      await prisma.binomeSuggestion.update({
        where: { id: pairId },
        data: { status: "REJECTED" }
      });
    }

    return NextResponse.json({ success: true, suggestion: updated, binome: newBinome });
  } catch (error: any) {
    console.error("[BINOME_RESPOND_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
