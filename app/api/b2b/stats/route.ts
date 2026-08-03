/**
 * app/api/b2b/stats/route.ts — Agrégation anonymisée des résultats B2B
 * ─────────────────────────────────────────────────────────────────────
 * Retourne les statistiques agrégées pour le dashboard RH.
 * RÈGLE D'OR : Aucun résultat si le nombre de répondants est < ANONYMITY_THRESHOLD.
 * Les réponses individuelles ne sont JAMAIS exposées.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Seuil minimal de répondants pour garantir l'anonymat */
const ANONYMITY_THRESHOLD = 5;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const ADMIN_ROLES = ["ADMIN_B2B", "SUPER_ADMIN"];
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Accès réservé aux responsables RH." },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      organizationId: true,
      organization: { select: { subscription: { select: { status: true } } } }
    },
  });

  if (!user?.organizationId) {
    return NextResponse.json(
      { error: "Aucune organisation associée." },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  // Récupérer tous les assessments soumis de l'organisation
  const assessments = await prisma.assessment.findMany({
    where: {
      status: "SUBMITTED",
      campaignId: campaignId || undefined,
      user: { organizationId: user.organizationId },
    },
    include: {
      result: { include: { icr: true } },
    },
  });

  const respondentCount = assessments.length;

  const registeredUsersCount = await prisma.user.count({
    where: { organizationId: user.organizationId },
  });

  const subscriptionStatus = user.organization?.subscription?.status || "INCOMPLETE";

  // ── Règle d'or de l'anonymat ────────────────────────────────────
  if (respondentCount < ANONYMITY_THRESHOLD) {
    return NextResponse.json({
      anonymityBlocked: true,
      respondentCount,
      registeredUsersCount,
      threshold: ANONYMITY_THRESHOLD,
      subscriptionStatus,
      message: `Les résultats ne sont pas disponibles : au moins ${ANONYMITY_THRESHOLD} répondants sont nécessaires pour garantir l'anonymat. Actuellement : ${respondentCount} répondant(s).`,
    });
  }

  // ── Calcul des moyennes ──────────────────────────────────────────
  const results = assessments
    .map((a) => a.result)
    .filter(Boolean) as NonNullable<(typeof assessments)[0]["result"]>[];

  if (results.length === 0) {
    return NextResponse.json({ respondentCount, noResults: true });
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const avgGlobalScore = avg(results.map((r) => r.globalScore));
  const avgSocialScore = avg(results.map((r) => r.socialScore));
  const avgAffectiveScore = avg(results.map((r) => r.affectiveScore));
  const avgSentimentalScore = avg(results.map((r) => r.sentimentalScore));
  const avgProfessionalScore = avg(results.map((r) => r.professionalScore));
  const avgSelfScore = avg(results.map((r) => r.selfScore));

  // ICR distribution
  const icrResults = results.map((r) => r.icr).filter(Boolean);
  const icrDistribution = {
    faible: icrResults.filter((icr) => icr!.score <= 25).length,
    modere: icrResults.filter((icr) => icr!.score > 25 && icr!.score <= 50).length,
    eleve: icrResults.filter((icr) => icr!.score > 50 && icr!.score <= 75).length,
    critique: icrResults.filter((icr) => icr!.score > 75).length,
  };

  // Top facteurs de risque (agrégation des riskFactors ICR)
  const riskFactorCounts = new Map<string, number>();
  const protectiveFactorCounts = new Map<string, number>();
  const dominantNeedCounts = new Map<string, number>();

  for (const icr of icrResults) {
    if (!icr) continue;
    for (const f of icr.riskFactors) {
      riskFactorCounts.set(f, (riskFactorCounts.get(f) ?? 0) + 1);
    }
    for (const f of icr.protectiveFactors) {
      protectiveFactorCounts.set(f, (protectiveFactorCounts.get(f) ?? 0) + 1);
    }
    for (const n of icr.dominantNeeds) {
      dominantNeedCounts.set(n, (dominantNeedCounts.get(n) ?? 0) + 1);
    }
  }

  const topRiskFactors = [...riskFactorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  const topProtectiveFactors = [...protectiveFactorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  const topDominantNeeds = [...dominantNeedCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  // Météo distribution
  const weatherDistribution = results.reduce(
    (acc, r) => {
      const key = r.weatherTitle ?? r.weather;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    anonymityBlocked: false,
    respondentCount,
    registeredUsersCount,
    threshold: ANONYMITY_THRESHOLD,
    subscriptionStatus,
    averages: {
      global: avgGlobalScore,
      social: avgSocialScore,
      affective: avgAffectiveScore,
      sentimental: avgSentimentalScore,
      professional: avgProfessionalScore,
      self: avgSelfScore,
    },
    icrDistribution,
    topRiskFactors,
    topProtectiveFactors,
    topDominantNeeds,
    weatherDistribution,
  });
}
