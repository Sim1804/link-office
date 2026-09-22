import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BINOME_ALLOWED_ROLES = ["CITIZEN", "MEMBER", "EMPLOYEE", "SUPER_ADMIN"];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!BINOME_ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Le Binôme Relationnel est réservé aux comptes Premium+.", code: "ROLE_NOT_ALLOWED" },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        matchingOptIn: true,
        campaignId: true,
        binomePreference: { select: { optIn: true } },
        assessments: {
          where: { status: "SUBMITTED" },
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: { result: true }
        }
      }
    });

    // Accept either User.matchingOptIn or BinomePreference.optIn
    const isOptedIn = user?.matchingOptIn || user?.binomePreference?.optIn;
    if (!user || !isOptedIn) {
      return NextResponse.json({ error: "Opt-in requis" }, { status: 400 });
    }

    // GUARD: Si l'utilisateur est dans une campagne, elle doit être PREMIUM+
    if (user.campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: user.campaignId },
        select: { offer: true, status: true },
      });
      if (!campaign || campaign.offer !== "PREMIUM_PLUS") {
        return NextResponse.json({
          error: "Le module Binôme Relationnel est réservé aux campagnes PREMIUM+.",
          code: "PREMIUM_PLUS_REQUIRED",
        }, { status: 403 });
      }
      if (campaign.status !== "ACTIVE") {
        return NextResponse.json({
          error: "La campagne n'est pas active.",
          code: "CAMPAIGN_INACTIVE",
        }, { status: 403 });
      }
    }

    const userResult = user.assessments[0]?.result;

    // Exclure les utilisateurs déjà en binôme ou suggestion active
    const existingPairs = await prisma.binome.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        NOT: { status: "CLOSED" }
      }
    });
    const existingSuggestions = await prisma.binomeSuggestion.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
        NOT: { status: "REJECTED" }
      }
    });

    const excludedIds = new Set<string>([userId]);
    existingPairs.forEach(p => { excludedIds.add(p.userAId); excludedIds.add(p.userBId); });
    existingSuggestions.forEach(s => { excludedIds.add(s.userAId); excludedIds.add(s.userBId); });

    // Candidats dans la même campagne (ou sans campagne si l'utilisateur n'en a pas)
    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedIds) },
        matchingOptIn: true,
        role: { in: BINOME_ALLOWED_ROLES as any },
        // Si l'utilisateur est dans une campagne, restreindre aux membres de la même campagne
        ...(user.campaignId ? { campaignId: user.campaignId } : {}),
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

    // Algorithme de matching par complémentarité
    const suggestions = [];
    for (const candidate of candidates) {
      const cResult = candidate.assessments[0]?.result;
      if (!cResult) continue;

      let rationale = "IRIS a identifié une bonne complémentarité globale entre vos profils respectifs.";

      if (userResult) {
        if (userResult.weakDimension === cResult.bestDimension) {
          rationale = `Ce partenaire excelle là où vous progressez — une opportunité d'apprentissage mutuel sur la dimension ${cResult.bestDimension?.toLowerCase() ?? ""}.`;
        } else if (userResult.priorityDimension === cResult.priorityDimension) {
          rationale = `Vous partagez le même objectif de développement relationnel. Une progression commune est idéale.`;
        } else if (Math.abs((userResult.globalScore ?? 0) - (cResult.globalScore ?? 0)) < 10) {
          rationale = "Vos scores d'équilibre sont très proches — vous évoluerez à un rythme similaire.";
        }
      }

      suggestions.push({
        id: candidate.id,
        firstName: candidate.firstName,
        rationale,
      });

      if (suggestions.length >= 3) break;
    }

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error("[BINOME_SUGGEST_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
