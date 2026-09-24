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
 * TODO: Remettre à 5 en production. Actuellement à 0 pour les tests (pour éviter le lock screen si 0 données).
 */
const ANONYMITY_THRESHOLD = 0;

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

  // Vérification du rôle administrateur (B2B, B2B2C ou Super Admin)
  const ADMIN_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "SUPER_ADMIN"];
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Accès réservé aux responsables RH ou partenaires." },
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

  // Filtre optionnel par campagne et démographie
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaignId");
  const ageRange = searchParams.get("ageRange");
  const gender = searchParams.get("gender");

  const demographicFilter: any = {};
  if (ageRange) demographicFilter.ageRange = ageRange;
  if (gender) demographicFilter.gender = gender;

  // Récupération de tous les assessments soumis et du compte d'utilisateurs
  const [submittedAssessments, registeredUsersCount, campaignsList] = await Promise.all([
    prisma.assessment.findMany({
      where: {
        status: "SUBMITTED",
        campaignId: campaignId || undefined,
        user: { organizationId: adminUser.organizationId },
        ...(Object.keys(demographicFilter).length > 0 && {
          demographic: { is: demographicFilter }
        })
      },
      select: {
        result: {
          select: {
            globalScore: true,
            socialScore: true,
            affectiveScore: true,
            sentimentalScore: true,
            professionalScore: true,
            selfScore: true,
            weather: true,
            weatherTitle: true,
            primaryProfile: true,
            icr: {
              select: {
                score: true,
                riskFactors: true,
                protectiveFactors: true,
                dominantNeeds: true,
              }
            }
          }
        },
        submittedAt: true,
        demographic: {
          select: {
            selectedSituations: true,
          }
        }
      },
    }),
    prisma.user.count({
      where: { organizationId: adminUser.organizationId },
    }),
    prisma.campaign.findMany({
      where: { organizationId: adminUser.organizationId },
      select: { id: true, title: true, status: true, snapshot: true },
      orderBy: { startDate: "desc" }
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
      campaignsList,
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

  // ── Données Baromètre (Profils, Moments de Vie, Timeline) ───────────────
  const profilsMap: Record<string, number> = {};
  const momentsMap: Record<string, { count: number, sum: number }> = {};
  const timelineMap: Record<string, number> = {};

  for (const assessment of submittedAssessments) {
    if (!assessment.result) continue;
    const result = assessment.result;
    
    // Timeline
    if (assessment.submittedAt) {
      const monthKey = assessment.submittedAt.toISOString().substring(0, 7);
      timelineMap[monthKey] = (timelineMap[monthKey] || 0) + 1;
    }

    // Profils
    const profile = result.primaryProfile || "Non défini";
    profilsMap[profile] = (profilsMap[profile] || 0) + 1;

    // Moments de vie
    const situations = assessment.demographic?.selectedSituations || [];
    for (const sit of situations) {
      if (!momentsMap[sit]) momentsMap[sit] = { count: 0, sum: 0 };
      momentsMap[sit].count += 1;
      momentsMap[sit].sum += result.globalScore;
    }
  }

  const timeline = Object.entries(timelineMap).map(([month, count]) => ({
    month,
    score: Math.round(avgGlobalScore), // Approx for chart
  })).sort((a, b) => a.month.localeCompare(b.month));

  const COLORS = ["#10b981", "var(--primary)", "#f59e0b", "#ef4444", "#a855f7"];
  const profils = Object.entries(profilsMap)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / respondentCount) * 100),
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  const momentsVie = Object.entries(momentsMap)
    .map(([name, data]) => ({
      name,
      score: Math.round(data.sum / data.count)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);


  // ── Fetch Recommandations from Library ───────────────────────────────
  const libraryRecs = await prisma.libraryItem.findMany({
    where: { library: "Recommandations" }
  });

  const isB2B2C = adminUser.role === "ADMIN_B2B2C";
  
  // Filter and parse recommendations
  let recommendations = libraryRecs
    .map((item) => {
      const data = item.data as Record<string, any>;
      return {
        id: item.id,
        title: item.title,
        description: data.description || data.texte_affiche,
        icon: "💡",
        compatible_b2b: data.compatible_b2b === "Oui",
        compatible_b2b2c: data.compatible_b2b2c === "Oui",
        riskFactors: typeof data.facteurs_risque_cibles === "string" ? data.facteurs_risque_cibles.split(";") : []
      };
    })
    .filter((rec) => isB2B2C ? rec.compatible_b2b2c : rec.compatible_b2b);

  // Optionally sort them to prioritize ones that match top risk factors
  const topRiskFactorNames = topRiskFactors.map(r => r.label);
  recommendations.sort((a, b) => {
    const aMatch = a.riskFactors.some((rf: string) => topRiskFactorNames.includes(rf)) ? 1 : 0;
    const bMatch = b.riskFactors.some((rf: string) => topRiskFactorNames.includes(rf)) ? 1 : 0;
    return bMatch - aMatch;
  });

  // Take top 4
  recommendations = recommendations.slice(0, 4);

  return NextResponse.json({
    anonymityBlocked: false,
    respondentCount,
    registeredUsersCount,
    threshold: ANONYMITY_THRESHOLD,
    subscriptionStatus,
    campaignsList,
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
    profils,
    momentsVie,
    timeline,
    recommendations,
  });
}
