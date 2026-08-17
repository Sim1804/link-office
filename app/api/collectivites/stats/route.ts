/**
 * @file route.ts
 * @module app/api/collectivites/stats
 * @description Route API de l'Observatoire Territorial — statistiques agrégées pour les collectivités.
 *
 * Accessible uniquement aux administrateurs de collectivités (ADMIN_COLLECTIVITE, SUPER_ADMIN).
 * Cette route agrège les données anonymisées des citoyens évalués dans le territoire
 * et génère des recommandations de politiques publiques basées sur les résultats IQRH.
 *
 * RÈGLE D'ANONYMAT : Seuil minimum de 5 répondants (même principe que B2B).
 * Aucune donnée individuelle n'est jamais exposée.
 *
 * Statistiques calculées :
 * - Moyennes IQRH par dimension (5 dimensions)
 * - Distribution des météos relationnelles
 * - Top 5 profils relationnels les plus fréquents
 * - Segmentation démographique (seniors, jeunes, aidants)
 *
 * Recommandations de politiques publiques générées dynamiquement selon les seuils :
 * - > 15% d'aidants → Café des Aidants
 * - Seniors + score social < 40 → Groupes de marche
 * - > 20% de profils indépendants → Tiers-lieux
 * - Tissu associatif faible → Subventions associations
 * - Jeunes + score soi < 50 → Parrainages intergénérationnels
 *
 * @method GET
 * @returns Statistiques agrégées + recommandations politiques ou bloc d'anonymat
 * @throws {401} Si l'utilisateur n'est pas connecté
 * @throws {403} Si l'utilisateur n'est pas ADMIN_COLLECTIVITE ou SUPER_ADMIN
 * @throws {404} Si l'administrateur n'est associé à aucune collectivité
 *
 * @see app/dashboard/collectivites/page.tsx — Dashboard qui consomme ces données
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Seuil minimal de répondants pour garantir l'anonymat des données territoriales.
 */
const ANONYMITY_THRESHOLD = 5;

/**
 * Structure d'une recommandation de politique publique générée par l'algorithme.
 */
interface PolicyRecommendation {
  /** Titre du constat (ex: "Solitude & Sédentarité des Seniors") */
  constat: string;
  /** Indicateur chiffré justifiant le constat */
  indicateur: string;
  /** Action concrète recommandée à la collectivité */
  action: string;
  /** Emoji illustratif de la recommandation */
  icon: string;
}

/**
 * Génère des recommandations de politiques publiques basées sur les statistiques territoriales.
 * Les recommandations sont conditionnelles aux seuils dépassés par la population analysée.
 *
 * @param data - Statistiques agrégées de la collectivité
 * @returns Liste de recommandations de politiques publiques
 */
function generatePolicyRecommendations(
  data: {
    avgSocial: number;
    avgSelf: number;
    situations: string[];
    retireeCount: number;
    youngCount: number;
    solisteCount: number;
    aidantCount: number;
    totalCount: number;
  }
): PolicyRecommendation[] {
  const policyRecommendations: PolicyRecommendation[] = [];
  const { avgSocial, avgSelf, situations, retireeCount, youngCount, solisteCount, aidantCount, totalCount } = data;

  // Seuil > 15% d'aidants familiaux → risque d'isolement
  if (aidantCount / totalCount > 0.15) {
    policyRecommendations.push({
      constat: "Isolement des Aidants Familiaux",
      indicateur: `${Math.round((aidantCount / totalCount) * 100)}% de profils aidants sous tension`,
      action: "Créer des \"Cafés des Aidants\" hebdomadaires et des espaces d'écoute municipaux",
      icon: "☕",
    });
  }

  // Population retraitée avec score social faible → risque de sédentarité
  if (retireeCount > 0 && avgSocial < 40) {
    policyRecommendations.push({
      constat: "Solitude & Sédentarité des Seniors",
      indicateur: `Score social moyen : ${avgSocial}/100 sur population retraitée`,
      action: "Créer des Groupes de Marche Conviviaux et parcours santé seniors",
      icon: "🚶‍♂️",
    });
  }

  // Forte proportion d'indépendants → besoin d'espaces de travail collectif
  if (solisteCount / totalCount > 0.2) {
    policyRecommendations.push({
      constat: "Manque d'Espaces d'Échange & Travail",
      indicateur: `${Math.round((solisteCount / totalCount) * 100)}% de profils indépendants / entrepreneurs`,
      action: "Développer les Tiers-Lieux, Coworking Municipaux et tiers-lieux citoyens",
      icon: "🏢",
    });
  }

  // Besoin d'appartenance fort avec faible tissu associatif déclaré
  if (avgSocial < 50 && situations.some((s) => s.includes("association") || s.includes("bénévolat"))) {
    policyRecommendations.push({
      constat: "Fragilité du Tissu Associatif",
      indicateur: `Besoin d'appartenance fort (score social : ${avgSocial}/100)`,
      action: "Soutenir et Subventionner les Associations de quartier et de bénévolat",
      icon: "🤝",
    });
  }

  // Population jeune avec faible score relation à soi → précarité relationnelle
  if (youngCount > 0 && avgSelf < 50) {
    policyRecommendations.push({
      constat: "Précarité Relationnelle des Jeunes",
      indicateur: `Score relation à soi moyen : ${avgSelf}/100 sur population jeune`,
      action: "Mettre en place des Parrainages Intergénérationnels et bureaux des étudiants",
      icon: "🎓",
    });
  }

  return policyRecommendations;
}


/**
 * Calcule et retourne les statistiques IQRH du territoire de la collectivité.
 * Génère des recommandations de politiques publiques basées sur les profils détectés.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const ADMIN_ROLES = ["ADMIN_COLLECTIVITE", "SUPER_ADMIN"];
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json(
      { error: "Accès réservé aux administrateurs de collectivité." },
      { status: 403 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    return NextResponse.json({ error: "Aucune collectivité associée." }, { status: 404 });
  }

  const assessments = await prisma.assessment.findMany({
    where: {
      status: "SUBMITTED",
      user: { organizationId: user.organizationId },
    },
    include: {
      result: { include: { icr: true, profile: true } },
      demographic: true,
    },
  });

  const respondentCount = assessments.length;

  if (respondentCount < ANONYMITY_THRESHOLD) {
    return NextResponse.json({
      anonymityBlocked: true,
      respondentCount,
      threshold: ANONYMITY_THRESHOLD,
    });
  }

  const results = assessments.map((a) => a.result).filter(Boolean) as NonNullable<(typeof assessments)[0]["result"]>[];
  const demographics = assessments.map((a) => a.demographic).filter(Boolean) as NonNullable<(typeof assessments)[0]["demographic"]>[];

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const allSituations = demographics.flatMap((d) => d.selectedSituations ?? []);

  const retireeCount = demographics.filter((d) =>
    d.selectedSituations?.some((s) => s.toLowerCase().includes("retraite"))
  ).length;

  const youngCount = demographics.filter((d) =>
    ["étudiant", "jeune", "apprenti"].some((kw) =>
      d.occupation?.toLowerCase().includes(kw)
    )
  ).length;

  const solisteCount = results.filter((r) =>
    r.primaryProfile?.toLowerCase().includes("soliste") ||
    r.primaryProfile?.toLowerCase().includes("entrepreneur")
  ).length;

  const aidantCount = demographics.filter((d) =>
    d.selectedSituations?.some((s) => s.toLowerCase().includes("aidant"))
  ).length;

  const avgSocial = avg(results.map((r) => r.socialScore));
  const avgSelf = avg(results.map((r) => r.selfScore));

  const recommendations = generatePolicyRecommendations({
    avgSocial,
    avgSelf,
    situations: allSituations,
    retireeCount,
    youngCount,
    solisteCount,
    aidantCount,
    totalCount: respondentCount,
  });

  // Profils les plus fréquents
  const profileCounts = new Map<string, number>();
  for (const r of results) {
    const p = r.primaryProfile;
    if (p) profileCounts.set(p, (profileCounts.get(p) ?? 0) + 1);
  }
  const topProfiles = [...profileCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([profile, count]) => ({ profile, count, pct: Math.round((count / respondentCount) * 100) }));

  // Météo distribution
  const weatherDist = results.reduce((acc, r) => {
    const key = r.weatherTitle || r.weather;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    anonymityBlocked: false,
    respondentCount,
    threshold: ANONYMITY_THRESHOLD,
    averages: {
      global: avg(results.map((r) => r.globalScore)),
      social: avgSocial,
      affective: avg(results.map((r) => r.affectiveScore)),
      sentimental: avg(results.map((r) => r.sentimentalScore)),
      professional: avg(results.map((r) => r.professionalScore)),
      self: avgSelf,
    },
    weatherDistribution: weatherDist,
    topProfiles,
    recommendations,
    demographics: {
      retireeCount,
      youngCount,
      aidantCount,
    },
  });
}
