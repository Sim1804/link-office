/**
 * app/api/b2b2c/orientation/route.ts — Algorithme d'orientation B2B2C
 * ─────────────────────────────────────────────────────────────────────
 * Analyse le profil de l'utilisateur et retourne les services de la mutuelle
 * qui correspondent à ses besoins détectés.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface ServiceRecommendation {
  trigger: string;
  service: string;
  icon: string;
  priority: "haute" | "normale";
  organizationService?: { id: string; title: string; linkUrl?: string | null };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  // Récupérer le dernier assessment soumis
  const assessment = await prisma.assessment.findFirst({
    where: { userId: session.user.id, status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    include: {
      result: { include: { icr: true } },
      demographic: true,
    },
  });

  if (!assessment?.result) {
    return NextResponse.json({ recommendations: [], hasResults: false });
  }

  const { result, demographic } = assessment;
  const icr = result.icr;
  const situations = demographic?.selectedSituations ?? [];

  const recommendations: ServiceRecommendation[] = [];

  // ── Règles d'orientation (extrait de la spec) ──────────────────

  // 1. Besoin de Soutien Parental
  const hasParentSituation = situations.some((s) =>
    s.toLowerCase().includes("parent") || s.toLowerCase().includes("enfant") || s.toLowerCase().includes("famille")
  );
  if (hasParentSituation && result.affectiveScore < 50) {
    recommendations.push({
      trigger: "Module Parent + Manque d'appui affectif",
      service: "Créer des Ateliers de Soutien à la Parentalité & coaching familial",
      icon: "💬",
      priority: "haute",
    });
  }

  // 2. Besoin de Réseau & Lien Social
  if (result.socialScore < 40) {
    recommendations.push({
      trigger: "Isolement social détecté (D1 < 40)",
      service: "Lancer une Communauté d'Échange & d'Entraide entre adhérents",
      icon: "🌐",
      priority: "haute",
    });
  }

  // 3. Surcharge & Épuisement Aidant
  const hasAidantSituation = situations.some((s) =>
    s.toLowerCase().includes("aidant") || s.toLowerCase().includes("proche")
  );
  if (hasAidantSituation && icr && icr.score > 60) {
    recommendations.push({
      trigger: "Module Aidant + ICR > 60",
      service: "Proposer des Séjours de Répit & ligne d'écoute psychologique 24/7",
      icon: "🧘",
      priority: "haute",
    });
  }

  // 4. Charge Mentale & Stress Pro
  if (icr && icr.professionalComplexity > 15 && result.selfScore < 50) {
    recommendations.push({
      trigger: "Complexité pro élevée + Relation à soi fragilisée",
      service: "Remboursement de Séances de Sophrologie & ateliers de gestion du stress",
      icon: "🧘‍♀️",
      priority: "normale",
    });
  }

  // 5. Isolement des Seniors / Retraités
  const hasRetraiteSituation = situations.some((s) =>
    s.toLowerCase().includes("retraite") || s.toLowerCase().includes("retraité")
  );
  if (hasRetraiteSituation && result.socialScore < 40) {
    recommendations.push({
      trigger: "Module Retraité + Isolement social",
      service: "Mettre en place des Appels de Convivialité & ateliers numériques",
      icon: "📞",
      priority: "normale",
    });
  }

  // Enrichir avec les services réels de l'organisation si disponibles
  if (user?.organizationId && recommendations.length > 0) {
    const orgServices = await prisma.organizationService.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true, title: true, description: true, targetNeed: true, linkUrl: true },
    });

    for (const rec of recommendations) {
      const matching = orgServices.find((s) =>
        rec.service.toLowerCase().includes(s.targetNeed.toLowerCase()) ||
        s.targetNeed.toLowerCase().includes(rec.trigger.toLowerCase().split(" ")[0])
      );
      if (matching) {
        rec.organizationService = { id: matching.id, title: matching.title, linkUrl: matching.linkUrl };
      }
    }
  }

  return NextResponse.json({
    hasResults: true,
    recommendations,
    scores: {
      social: result.socialScore,
      affective: result.affectiveScore,
      professional: result.professionalScore,
      self: result.selfScore,
      icr: icr?.score ?? null,
    },
  });
}
