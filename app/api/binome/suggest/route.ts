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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        matchingOptIn: true, 
        campaignId: true,
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: { result: true }
        }
      }
    });

    if (!user || !user.matchingOptIn) {
      return NextResponse.json({ error: "Opt-in requis" }, { status: 400 });
    }

    // GUARD: Binome uniquement pour les campagnes PREMIUM+
    if (user.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: user.campaignId },
        select: { offer: true, status: true },
      });
      if (!campaign || campaign.offer !== "PREMIUM_PLUS") {
        return NextResponse.json({
          error: "Le module Binome Relationnel est reserve aux campagnes PREMIUM+.",
          code: "PREMIUM_PLUS_REQUIRED",
        }, { status: 403 });
      }
      if (campaign.status !== "ACTIVE") {
        return NextResponse.json({
          error: "La campagne n est pas active.",
          code: "CAMPAIGN_INACTIVE",
        }, { status: 403 });
      }
    }


    const userResult = user.assessments[0]?.result;

    // Retrieve excluded users (already in pending or accepted pair with this user)
    const existingPairs = await prisma.relationalPair.findMany({
      where: {
        OR: [
          { initiatorId: userId },
          { receiverId: userId }
        ]
      }
    });

    const excludedIds = existingPairs.flatMap(p => [p.initiatorId, p.receiverId]);
    excludedIds.push(userId); // Exclude self

    // Find candidates in the same campaign who opted in
    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
        matchingOptIn: true,
        campaignId: user.campaignId, // Strict enforcement for B2B2C
        // Ensure they are PREMIUM_PLUS via campaign or direct
      },
      include: {
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: { result: true }
        }
      },
      take: 20
    });

    // Simple matching algorithm simulating IRIS
    const suggestions = [];

    for (const candidate of candidates) {
      const cResult = candidate.assessments[0]?.result;
      if (!cResult) continue;

      let rationale = "IRIS a identifié une bonne complémentarité globale entre vos profils respectifs.";
      
      if (userResult) {
        if (userResult.priorityDimension === cResult.priorityDimension) {
          rationale = `Vous partagez un objectif commun de développement sur la dimension ${userResult.priorityDimension}.`;
        } else if (userResult.weakDimension === cResult.bestDimension) {
          rationale = `Ce partenaire excelle dans des domaines que vous cherchez à améliorer. Une excellente opportunité d'apprentissage mutuel !`;
        } else if (Math.abs(userResult.globalScore - cResult.globalScore) < 10) {
          rationale = "Vos scores globaux d'équilibre sont très proches, ce qui vous permettra d'évoluer à un rythme similaire.";
        }
      }

      suggestions.push({
        id: candidate.id,
        firstName: candidate.firstName,
        rationale
      });

      if (suggestions.length >= 3) break; // Return top 3
    }

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error("[BINOME_SUGGEST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
