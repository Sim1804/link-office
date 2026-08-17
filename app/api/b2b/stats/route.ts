/**
 * @file route.ts
 * @module app/api/b2b/stats
 * @description Route API d'agrégation anonymisée des résultats IQRH pour le dashboard RH B2B.
 *
 * Accessible uniquement aux administrateurs B2B (rôle ADMIN_B2B ou SUPER_ADMIN),
 * cette route calcule des statistiques collectives sur l'ensemble des évaluations
 * de leur organisation, filtrables par campagne.
 *
 * RÈGLE D'OR DE L'ANONYMAT :
 * Si le nombre de répondants est inférieur à `ANONYMITY_THRESHOLD` (5),
 * aucune statistique n'est retournée — seul un message d'attente est envoyé.
 * Les données individuelles ne sont JAMAIS exposées.
 *
 * Statistiques calculées :
 * - Moyennes IQRH globales et par dimension (5 dimensions)
 * - Distribution ICR (faible / modéré / élevé / critique)
 * - Top 10 facteurs de risque et de protection (ICR)
 * - Top 5 besoins relationnels dominants
 * - Distribution des météos relationnelles
 *
 * @method GET
 * @query campaignId? — Filtre optionnel sur une campagne spécifique
 * @returns Statistiques agrégées anonymisées ou bloc d'anonymat
 * @throws {401} Si l'utilisateur n'est pas connecté
 * @throws {403} Si l'utilisateur n'a pas les droits ADMIN_B2B ou SUPER_ADMIN
 * @throws {404} Si l'administrateur n'est associé à aucune organisation
 *
 * @see app/dashboard/b2b/page.tsx — Dashboard qui consomme ces statistiques
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Seuil minimal de répondants pour garantir l'anonymat des données.
 * En dessous de ce seuil, aucune statistique agrégée n'est retournée.
 */
const ANONYMITY_THRESHOLD = 5;

/**
 * Calcule et retourne les statistiques IQRH agrégées de l'organisation B2B.
 * Applique la règle d'anonymat avant d'exposer toute donnée.
 *
 * @param request - Requête HTTP (peut contenir `?campaignId=...` pour filtrer)
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  // Vérification du rôle administrateur (B2B ou Super Admin)
  const ADMIN_ROLES = ["ADMIN_B2B", "SUPER_ADMIN"];
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Accès réservé aux responsables RH." },
      { status: 403 }
    );
  }

  // Récupération de l'organisation associée à l'administrateur
  const adminUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      organizationId: true,
      organization: { select: { subscription: { select: { status: true } } } },
    },
  });

  if (!adminUser?.organizationId) {
    return NextResponse.json(
      { error: "Aucune organisation associée." },
      { status: 404 }
    );
  }

  // Filtre optionnel par campagne
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");

  // Récupération de tous les assessments soumis et du compte d'utilisateurs
  const [submittedAssessments, registeredUsersCount] = await Promise.all([
    prisma.assessment.findMany({
      where: {
        status: "SUBMITTED",
        campaignId: campaignId || undefined,
        user: { organizationId: adminUser.organizationId },
      },
      include: {
        result: { include: { icr: true } },
      },
    }),
    prisma.user.count({
      where: { organizationId: adminUser.organizationId },
    })
  ]);

  const respondentCount = submittedAssessments.length;

  const subscriptionStatus = adminUser.organization?.subscription?.status || "INCOMPLETE";


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

  // ── Calcul des moyennes par dimension ───────────────────────────────────
  const resultsWithData = submittedAssessments
    .map((assessment) => assessment.result)
    .filter(Boolean) as NonNullable<(typeof submittedAssessments)[0]["result"]>[];

  if (resultsWithData.length === 0) {
    return NextResponse.json({ respondentCount, noResults: true });
  }

  /** Calcule la moyenne arrondie d'un tableau de nombres */
  const computeAverage = (numbers: number[]) =>
    numbers.length ? Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length) : 0;

  const avgGlobalScore = computeAverage(resultsWithData.map((result) => result.globalScore));
  const avgSocialScore = computeAverage(resultsWithData.map((result) => result.socialScore));
  const avgAffectiveScore = computeAverage(resultsWithData.map((result) => result.affectiveScore));
  const avgSentimentalScore = computeAverage(resultsWithData.map((result) => result.sentimentalScore));
  const avgProfessionalScore = computeAverage(resultsWithData.map((result) => result.professionalScore));
  const avgSelfScore = computeAverage(resultsWithData.map((result) => result.selfScore));

  // ── Distribution ICR (4 paliers de complexité) ───────────────────────────
  const icrResultsOnly = resultsWithData.map((result) => result.icr).filter(Boolean);
  const icrDistribution = {
    faible: icrResultsOnly.filter((icr) => icr!.score <= 25).length,
    modere: icrResultsOnly.filter((icr) => icr!.score > 25 && icr!.score <= 50).length,
    eleve: icrResultsOnly.filter((icr) => icr!.score > 50 && icr!.score <= 75).length,
    critique: icrResultsOnly.filter((icr) => icr!.score > 75).length,
  };

  // ── Agrégation des facteurs ICR (risques, protections, besoins) ──────────
  // Utilisation de Maps pour compter les occurrences de chaque facteur
  const riskFactorCounts = new Map<string, number>();
  const protectiveFactorCounts = new Map<string, number>();
  const dominantNeedCounts = new Map<string, number>();

  for (const icrResult of icrResultsOnly) {
    if (!icrResult) continue;
    for (const riskFactor of icrResult.riskFactors) {
      riskFactorCounts.set(riskFactor, (riskFactorCounts.get(riskFactor) ?? 0) + 1);
    }
    for (const protectiveFactor of icrResult.protectiveFactors) {
      protectiveFactorCounts.set(protectiveFactor, (protectiveFactorCounts.get(protectiveFactor) ?? 0) + 1);
    }
    for (const need of icrResult.dominantNeeds) {
      dominantNeedCounts.set(need, (dominantNeedCounts.get(need) ?? 0) + 1);
    }
  }

  // Tri par fréquence décroissante + calcul du pourcentage sur le total de répondants
  const topRiskFactors = [...riskFactorCounts.entries()]
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  const topProtectiveFactors = [...protectiveFactorCounts.entries()]
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  const topDominantNeeds = [...dominantNeedCounts.entries()]
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([label, count]) => ({ label, count, pct: Math.round((count / respondentCount) * 100) }));

  // ── Distribution des météos relationnelles ───────────────────────────────
  const weatherDistribution = resultsWithData.reduce(
    (accumulator, result) => {
      const weatherKey = result.weatherTitle || result.weather;
      accumulator[weatherKey] = (accumulator[weatherKey] ?? 0) + 1;
      return accumulator;
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
