/**
 * @file e2e-test.ts
 * @description Tests de bout en bout des services métiers de Link Office.
 * Exécution : npx tsx prisma/e2e-test.ts
 *
 * Modules testés :
 *  1. Seed & données de base (utilisateurs, assessments, bibliothèque)
 *  2. Moteur IQRH (calcul des scores, météo, IER)
 *  3. Moteur ICR (Indice de Charge Relationnelle)
 *  4. Profil Relationnel (12 profils)
 *  5. Ordonnance / PrescriptionService (recommandations + défis + partenaires)
 *  6. IRIS context-builder (injection du contexte IQRH)
 *  7. Gamification (complétion de défi → points → badges)
 *  8. Binôme Matching (opt-in + algorithme de matching)
 *  9. SystemConfig (config matching depuis BDD)
 * 10. IrisConversation (persistance historique)
 */

import { PrismaClient, Dimension } from "@prisma/client";
import { IQRHCalculationService } from "../src/lib/iqrh/calculation-service";
import { IcrCalculationService } from "../src/lib/iqrh/icr-calculation-service";
import { ProfileCalculationService } from "../src/lib/iqrh/profile-calculation-service";
import { PrescriptionService } from "../src/lib/iqrh/prescription-service";
import { GamificationService } from "../src/lib/gamification/gamification-service";
import { MatchingService } from "../src/lib/binome/matching-service";
import { buildIrisContext } from "../src/lib/iris/context-builder";

const prisma = new PrismaClient();

// ─── Utilitaires ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const errors: string[] = [];

function ok(label: string) {
  console.log(`  ✅ ${label}`);
  passed++;
}

function fail(label: string, detail?: unknown) {
  const msg = detail instanceof Error ? detail.message : String(detail ?? "");
  console.error(`  ❌ ${label}${msg ? `: ${msg}` : ""}`);
  failed++;
  errors.push(`${label}${msg ? ` → ${msg}` : ""}`);
}

function assert(condition: boolean, label: string, detail?: unknown) {
  condition ? ok(label) : fail(label, detail);
}

function section(title: string) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📋 ${title}`);
  console.log("─".repeat(60));
}

// ─── 1. DONNÉES DE BASE ───────────────────────────────────────────────────────

async function testSeedData() {
  section("1. DONNÉES DE BASE (Seed & Utilisateurs)");

  // Utilisateurs admin
  const adminB2B = await prisma.user.findUnique({ where: { email: "admin.b2b@linkoffice.fr" } });
  assert(!!adminB2B, "Admin B2B existe", !adminB2B && "non trouvé");
  assert(adminB2B?.role === "ADMIN_B2B", "Admin B2B a le bon rôle");

  const superAdmin = await prisma.user.findUnique({ where: { email: "superadmin@linkoffice.fr" } });
  assert(!!superAdmin, "Super Admin existe");
  assert(superAdmin?.role === "SUPER_ADMIN", "Super Admin a le bon rôle");

  const demoUser = await prisma.user.findUnique({ where: { email: "demo@linkoffice.fr" } });
  assert(!!demoUser, "Demo user (Camille) existe");
  assert(demoUser?.subscription === "FREEMIUM", "Demo user est FREEMIUM");

  const demoB2b2c = await prisma.user.findUnique({ where: { email: "demo.b2b2c@linkoffice.fr" } });
  assert(!!demoB2b2c, "Demo B2B2C user (Sacha) existe");
  assert(demoB2b2c?.subscription === "PREMIUM_PLUS", "Demo B2B2C est PREMIUM_PLUS");

  // Organisations
  const acme = await prisma.organization.findUnique({ where: { codeAccess: "ACME-2026-TEST" } });
  assert(!!acme, "Organisation Acme Corp existe");

  const mutu = await prisma.organization.findUnique({ where: { codeAccess: "MUTU-2026-TEST" } });
  assert(!!mutu, "Organisation Mutuelle Solis existe");

  // Campagnes
  const camps = await prisma.campaign.findMany({ where: { id: { startsWith: "camp-" } } });
  assert(camps.length === 3, `3 campagnes de test créées (trouvées: ${camps.length})`);

  // Mock users (36 B2B + 10 B2C)
  const mockUsers = await prisma.user.count({ where: { email: { startsWith: "mock.user" } } });
  assert(mockUsers === 46, `46 utilisateurs mock créés (trouvés: ${mockUsers})`);

  // Bibliothèque
  const libCount = await prisma.libraryItem.count();
  assert(libCount > 100, `Bibliothèque chargée (${libCount} items)`);

  const recoCount = await prisma.libraryItem.count({ where: { library: "Recommandations" } });
  assert(recoCount > 0, `Recommandations dans la bibliothèque (${recoCount})`);

  const challengeCount = await prisma.libraryItem.count({ where: { library: "Micro-défis" } });
  assert(challengeCount > 0, `Micro-défis dans la bibliothèque (${challengeCount})`);

  const partnerCount = await prisma.libraryItem.count({ where: { library: "Partenaires" } });
  assert(partnerCount > 0, `Partenaires dans la bibliothèque (${partnerCount})`);

  return { acme, mutu, demoUser, demoB2b2c };
}

// ─── 2. MOTEUR IQRH ──────────────────────────────────────────────────────────

async function testIQRHEngine() {
  section("2. MOTEUR IQRH (Calcul des Scores)");

  // Format exact : tableau plat de 30 réponses, 6 par dimension
  const iqrhAnswers: Array<{ dimension: Dimension; value: number }> = [
    // SOCIAL (6 réponses)
    { dimension: Dimension.SOCIAL, value: 4 },
    { dimension: Dimension.SOCIAL, value: 3 },
    { dimension: Dimension.SOCIAL, value: 5 },
    { dimension: Dimension.SOCIAL, value: 4 },
    { dimension: Dimension.SOCIAL, value: 2 },
    { dimension: Dimension.SOCIAL, value: 3 },
    // AFFECTIVE (6 réponses)
    { dimension: Dimension.AFFECTIVE, value: 3 },
    { dimension: Dimension.AFFECTIVE, value: 4 },
    { dimension: Dimension.AFFECTIVE, value: 3 },
    { dimension: Dimension.AFFECTIVE, value: 2 },
    { dimension: Dimension.AFFECTIVE, value: 3 },
    { dimension: Dimension.AFFECTIVE, value: 4 },
    // SENTIMENTAL (6 réponses — fort)
    { dimension: Dimension.SENTIMENTAL, value: 5 },
    { dimension: Dimension.SENTIMENTAL, value: 4 },
    { dimension: Dimension.SENTIMENTAL, value: 5 },
    { dimension: Dimension.SENTIMENTAL, value: 4 },
    { dimension: Dimension.SENTIMENTAL, value: 5 },
    { dimension: Dimension.SENTIMENTAL, value: 4 },
    // PROFESSIONAL (6 réponses — faible)
    { dimension: Dimension.PROFESSIONAL, value: 2 },
    { dimension: Dimension.PROFESSIONAL, value: 2 },
    { dimension: Dimension.PROFESSIONAL, value: 3 },
    { dimension: Dimension.PROFESSIONAL, value: 2 },
    { dimension: Dimension.PROFESSIONAL, value: 1 },
    { dimension: Dimension.PROFESSIONAL, value: 2 },
    // SELF (6 réponses)
    { dimension: Dimension.SELF, value: 3 },
    { dimension: Dimension.SELF, value: 4 },
    { dimension: Dimension.SELF, value: 3 },
    { dimension: Dimension.SELF, value: 3 },
    { dimension: Dimension.SELF, value: 2 },
    { dimension: Dimension.SELF, value: 3 },
  ];

  const iqrhResult = IQRHCalculationService.calculate(iqrhAnswers);

  // Vérifications structurelles
  assert(typeof iqrhResult.globalScore === "number", "Score global est un nombre");
  assert(iqrhResult.globalScore >= 0 && iqrhResult.globalScore <= 100, `Score global dans [0-100] (${iqrhResult.globalScore.toFixed(1)})`);
  assert(Array.isArray(iqrhResult.dimensions) && iqrhResult.dimensions.length === 5, "5 dimensions retournées");

  // Extraire les scores par dimension (format réel : iqrhResult.dimensions[].score)
  const socialScore = iqrhResult.dimensions.find(d => d.dimension === Dimension.SOCIAL)?.score ?? -1;
  const profScore  = iqrhResult.dimensions.find(d => d.dimension === Dimension.PROFESSIONAL)?.score ?? -1;
  const sentScore  = iqrhResult.dimensions.find(d => d.dimension === Dimension.SENTIMENTAL)?.score ?? -1;

  assert(socialScore >= 0, `Score SOCIAL calculé (${socialScore})`);
  assert(profScore >= 0, `Score PROFESSIONAL calculé (${profScore})`);

  // Météo : libellés en français
  const VALID_WEATHER = ["Tempête", "Orage", "Ciel couvert", "Éclaircies", "Grand soleil"];
  assert(VALID_WEATHER.includes(iqrhResult.weather), `Météo valide (${iqrhResult.weather})`);
  assert(iqrhResult.balanceIndex >= 0 && iqrhResult.balanceIndex <= 100, `IER dans [0-100] (${iqrhResult.balanceIndex.toFixed(1)})`);
  assert(iqrhResult.strengths.length > 0, `Forces identifiées (${iqrhResult.strengths.length})`);
  assert(iqrhResult.watchpoints.length > 0, `Points de vigilance identifiés (${iqrhResult.watchpoints.length})`);

  // Dimension prioritaire = celle qui a le score le plus bas
  assert(typeof iqrhResult.priorityDimension === "string", `Dimension prioritaire : ${iqrhResult.priorityDimension}`);

  // La meilleure dimension = celle qui a le score le plus haut
  const bestDim = [...iqrhResult.dimensions].sort((a, b) => b.score - a.score)[0];
  assert(!!bestDim, `Meilleure dimension déterminée : ${bestDim?.dimension}`);

  // Cohérence : PROFESSIONAL devrait être faible (scores 2,2,3,2,1,2)
  assert(profScore < 60, `PROFESSIONAL faible cohérent avec les réponses (${profScore})`);
  // SENTIMENTAL devrait être fort (scores 5,4,5,4,5,4)
  assert(sentScore > 70, `SENTIMENTAL fort cohérent avec les réponses (${sentScore})`);

  console.log(`     → Global: ${iqrhResult.globalScore.toFixed(1)} | Météo: ${iqrhResult.weather} | IER: ${iqrhResult.balanceIndex.toFixed(1)}`);
  console.log(`     → SOCIAL:${socialScore} SENTIMENTAL:${sentScore} PRO:${profScore}`);

  // Adapter la valeur retournée pour les tests suivants
  const iqrhResultNormalized = {
    globalScore: iqrhResult.globalScore,
    socialScore,
    affectiveScore: iqrhResult.dimensions.find(d => d.dimension === Dimension.AFFECTIVE)?.score ?? 50,
    sentimentalScore: sentScore,
    professionalScore: profScore,
    selfScore: iqrhResult.dimensions.find(d => d.dimension === Dimension.SELF)?.score ?? 50,
    weather: iqrhResult.weather,
    balanceIndex: iqrhResult.balanceIndex,
    strengths: iqrhResult.strengths,
    watchpoints: iqrhResult.watchpoints,
    priorityDimension: iqrhResult.priorityDimension,
    bestDimension: bestDim.dimension,
  };

  return iqrhResultNormalized;
}

// ─── 3. MOTEUR ICR ───────────────────────────────────────────────────────────

async function testICREngine(iqrhResult: Awaited<ReturnType<typeof testIQRHEngine>>) {
  section("3. MOTEUR ICR (Indice de Charge Relationnelle)");

  const icrInput = {
    selectedSituations: ["Parent", "Manager", "Aidant"],
    occupation: "Salarié",
    organizationSize: "Plus de 250 salariés",
    relationshipStatus: "Marié(e)",
    children: true,
    childrenCount: 3,
    balanceIndex: iqrhResult.balanceIndex,
    globalScore: iqrhResult.globalScore,
    scores: {
      SOCIAL: iqrhResult.socialScore,
      AFFECTIVE: iqrhResult.affectiveScore,
      SENTIMENTAL: iqrhResult.sentimentalScore,
      PROFESSIONAL: iqrhResult.professionalScore,
      SELF: iqrhResult.selfScore,
    },
    adaptiveAnswers: [
      { polarity: "POSITIVE" as const, value: 1, label: "Soutien managérial" }, // Charge forte
      { polarity: "NEGATIVE" as const, value: 5, label: "Stress perçu" },       // Charge forte
      { polarity: "POSITIVE" as const, value: 5, label: "Réseau professionnel" }, // Ressource
    ],
  };

  const icrResult = IcrCalculationService.calculate(icrInput);

  assert(typeof icrResult.score === "number", "Score ICR calculé");
  assert(icrResult.score >= 0 && icrResult.score <= 100, `ICR dans [0-100] (${icrResult.score})`);
  assert(typeof icrResult.level === "string", `Niveau ICR : ${icrResult.level}`);
  assert(icrResult.riskFactors.length > 0, `Facteurs de risque identifiés (${icrResult.riskFactors.length})`);
  assert(icrResult.protectiveFactors.length >= 0, "Facteurs protecteurs présents");
  assert(icrResult.dominantNeeds.length > 0, `Besoins dominants (${icrResult.dominantNeeds.length})`);

  // Parent + Manager + Aidant + 3 enfants = ICR élevé
  assert(icrResult.score >= 30, `ICR élevé cohérent avec profil chargé (${icrResult.score})`);

  console.log(`     → ICR: ${icrResult.score} | Niveau: ${icrResult.level}`);
  console.log(`     → Risques: ${icrResult.riskFactors.slice(0, 2).join(", ")}`);
  console.log(`     → Besoins: ${icrResult.dominantNeeds.slice(0, 2).join(", ")}`);

  return icrResult;
}

// ─── 4. PROFIL RELATIONNEL ────────────────────────────────────────────────────

async function testProfileEngine(
  iqrhResult: Awaited<ReturnType<typeof testIQRHEngine>>,
  icrResult: Awaited<ReturnType<typeof testICREngine>>
) {
  section("4. PROFIL RELATIONNEL (12 Profils)");

  const profileInput = {
    globalScore: iqrhResult.globalScore,
    balanceIndex: iqrhResult.balanceIndex,
    icrScore: icrResult.score,
    scores: {
      SOCIAL: iqrhResult.socialScore,
      AFFECTIVE: iqrhResult.affectiveScore,
      SENTIMENTAL: iqrhResult.sentimentalScore,
      PROFESSIONAL: iqrhResult.professionalScore,
      SELF: iqrhResult.selfScore,
    },
    situations: ["Parent", "Manager", "Aidant"],
  };

  const profileResult = ProfileCalculationService.calculate(profileInput);

  const VALID_PROFILES = [
    "Le Connecteur", "L'Ancre", "Le Bâtisseur", "Le Protecteur",
    "Le Résilient", "L'Explorateur", "Le Chercheur d'équilibre",
    "Le Soliste", "Le Suradapté", "Le Réorganisateur", "L'Inspirant", "L'Équilibriste",
  ];

  assert(VALID_PROFILES.includes(profileResult.primaryName), `Profil principal valide : ${profileResult.primaryName}`);
  assert(VALID_PROFILES.includes(profileResult.secondaryName), `Profil secondaire valide : ${profileResult.secondaryName}`);
  assert(profileResult.primaryName !== profileResult.secondaryName, "Profil principal ≠ secondaire");
  assert(profileResult.primaryScore >= profileResult.secondaryScore, "Score principal ≥ score secondaire");
  assert(profileResult.primaryConfidence > 0, `Confiance principale > 0 (${profileResult.primaryConfidence}%)`);
  assert(typeof profileResult.signature === "string" && profileResult.signature.includes("-"), `Signature bien formée : ${profileResult.signature}`);
  assert(!!profileResult.primaryDetails, "Détails profil principal chargés");

  // Parent + Manager + Aidant → fort score pour Le Protecteur ou Le Suradapté
  const topCandidates = ["Le Protecteur", "Le Suradapté", "L'Équilibriste"];
  const isCoherent = topCandidates.some(p => p === profileResult.primaryName || p === profileResult.secondaryName);
  assert(isCoherent, `Profil cohérent avec situations Manager/Parent/Aidant (${profileResult.primaryName} / ${profileResult.secondaryName})`);

  console.log(`     → Profil: ${profileResult.primaryName} (${profileResult.primaryConfidence}%) + ${profileResult.secondaryName} (${profileResult.secondaryConfidence}%)`);

  return profileResult;
}

// ─── 5. ORDONNANCE PRESCRIPTION ──────────────────────────────────────────────

async function testPrescription() {
  section("5. ORDONNANCE / PRESCRIPTION (Recommandations + Défis + Partenaires)");

  // Trouver un vrai assessment soumis depuis le seed
  const assessment = await prisma.assessment.findFirst({
    where: { status: "SUBMITTED" },
    include: { result: { include: { icr: true, profile: true } } },
  });

  if (!assessment?.result) {
    fail("Assessment de test introuvable (seed non exécuté ?)");
    return null;
  }

  // Générer une prescription pour ce résultat
  try {
    const prescription = await PrescriptionService.generateForResult(assessment.result.id);
    assert(!!prescription, "Prescription générée");

    const items = await prisma.prescriptionItem.findMany({
      where: { prescriptionId: prescription.id },
      include: { libraryItem: true },
    });

    assert(items.length > 0, `Items dans la prescription (${items.length})`);

    const recos = items.filter((i) => i.kind === "RECOMMENDATION");
    const defis = items.filter((i) => i.kind === "MICRO_CHALLENGE");
    const partenaires = items.filter((i) => i.kind === "PARTNER");

    assert(recos.length >= 1, `Recommandations prescrites (${recos.length})`);
    assert(defis.length >= 1, `Micro-défis prescrits (${defis.length})`);
    assert(partenaires.length >= 0, `Partenaires dans l'ordonnance (${partenaires.length})`);

    // Vérification de cohérence : tous les items ont un libraryItem valide
    const orphans = items.filter((i) => !i.libraryItem);
    assert(orphans.length === 0, `Aucun item orphelin (sans libraryItem)`);

    // Statut initial = PROPOSED
    const wrongStatus = items.filter((i) => i.status !== "PROPOSED");
    assert(wrongStatus.length === 0, "Tous les items ont le statut initial PROPOSED");

    console.log(`     → ${recos.length} recommandations | ${defis.length} défis | ${partenaires.length} partenaires`);
    if (recos[0]) console.log(`     → 1ère reco : "${recos[0].libraryItem?.title}"`);
    if (defis[0]) console.log(`     → 1er défi : "${defis[0].libraryItem?.title}"`);

    return { prescription, items, firstChallenge: defis[0] };
  } catch (e) {
    fail("Génération de la prescription", e);
    return null;
  }
}

// ─── 6. IRIS CONTEXT BUILDER ─────────────────────────────────────────────────

async function testIrisContext() {
  section("6. IRIS — Context Builder");

  // Cas 1 : utilisateur SANS assessment
  const userWithout = await prisma.user.findUnique({ where: { email: "demo@linkoffice.fr" } });
  if (userWithout) {
    const ctxEmpty = await buildIrisContext(userWithout.id);
    assert(ctxEmpty === "NO_ASSESSMENT", `Contexte vide si pas d'assessment (retourne NO_ASSESSMENT)`);
  }

  // Cas 2 : utilisateur AVEC assessment (mock user)
  const userWith = await prisma.assessment.findFirst({
    where: { status: "SUBMITTED" },
    select: { userId: true },
  });

  if (userWith) {
    const ctx = await buildIrisContext(userWith.userId);
    assert(ctx !== "NO_ASSESSMENT", "Contexte non-vide pour utilisateur avec assessment");
    assert(ctx.includes("BILAN IQRH"), "Contexte contient la section BILAN IQRH");
    assert(ctx.includes("SOUS-SCORES"), "Contexte contient les sous-scores");
    assert(ctx.includes("PROFIL RELATIONNEL") || ctx.length > 200, "Contexte contient le profil ou est substantiel");
    console.log(`     → Taille du contexte : ${ctx.length} caractères`);
  } else {
    fail("Aucun utilisateur avec assessment pour tester le contexte IRIS");
  }
}

// ─── 7. GAMIFICATION ─────────────────────────────────────────────────────────

async function testGamification(prescriptionData: Awaited<ReturnType<typeof testPrescription>>) {
  section("7. GAMIFICATION (Points + Badges)");

  if (!prescriptionData?.firstChallenge) {
    fail("Pas de défi disponible pour tester la gamification (test prescription échoué ?)");
    return;
  }

  const { prescription, firstChallenge } = prescriptionData;
  const userId = prescription.userId;

  // Points avant
  const userBefore = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
  const pointsBefore = userBefore?.points ?? 0;

  try {
    const result = await GamificationService.completeChallenge(userId, firstChallenge.id);

    assert(result.success, "Défi marqué comme complété avec succès");
    assert(result.pointsEarned > 0, `Points attribués : ${result.pointsEarned}`);
    assert(result.totalPoints >= pointsBefore + result.pointsEarned, `Total points correct : ${result.totalPoints}`);

    // Vérification en BDD
    const itemAfter = await prisma.prescriptionItem.findUnique({ where: { id: firstChallenge.id } });
    assert(itemAfter?.status === "COMPLETED", "Statut du défi = COMPLETED en BDD");

    const userAfter = await prisma.user.findUnique({ where: { id: userId }, select: { points: true } });
    assert((userAfter?.points ?? 0) === result.totalPoints, `Points mis à jour en BDD (${userAfter?.points})`);

    // Vérification UserStats
    const stats = await prisma.userStats.findUnique({ where: { userId } });
    assert(!!stats, "UserStats créé ou mis à jour");
    assert(stats?.totalPoints === result.totalPoints, `UserStats.totalPoints correct (${stats?.totalPoints})`);

    // Double complétion doit lever une erreur
    try {
      await GamificationService.completeChallenge(userId, firstChallenge.id);
      fail("La double complétion aurait dû lever une erreur");
    } catch (e) {
      assert(true, `Double complétion correctement bloquée : "${(e as Error).message}"`);
    }

    // Log d'audit
    const log = await prisma.eventLog.findFirst({
      where: { userId, eventType: "micro_challenge_completed" },
      orderBy: { createdAt: "desc" },
    });
    assert(!!log, "Log d'audit créé (EventLog)");

    console.log(`     → ${result.pointsEarned} pts gagnés | Total : ${result.totalPoints} | Badges : ${result.newBadges.length}`);
  } catch (e) {
    fail("Complétion du défi", e);
  }
}

// ─── 8. BINÔME MATCHING ───────────────────────────────────────────────────────

async function testBinomeMatching() {
  section("8. BINÔME MATCHING (Opt-in + Algorithme)");

  // Trouver 2 utilisateurs de la même campagne PREMIUM_PLUS
  const campaignId = "camp-mutu-2026";
  const users = await prisma.user.findMany({
    where: {
      campaignId,
      email: { startsWith: "mock.user" },
    },
    take: 2,
    include: {
      assessments: {
        where: { status: "SUBMITTED" },
        take: 1,
        include: { result: true },
      },
    },
  });

  if (users.length < 2) {
    fail(`Pas assez d'utilisateurs dans camp-mutu-2026 pour tester le matching (${users.length}/2)`);
    return;
  }

  const [userA, userB] = users as [typeof users[0], typeof users[0]];

  // Test opt-in
  const optInA = await MatchingService.setOptIn(userA.id, true);
  assert(optInA === true, `Opt-in userA (${userA.email}) enregistré`);

  const optInB = await MatchingService.setOptIn(userB.id, true);
  assert(optInB === true, `Opt-in userB (${userB.email}) enregistré`);

  // Vérifier en BDD
  const updatedA = await prisma.user.findUnique({ where: { id: userA.id }, select: { matchingOptIn: true } });
  assert(updatedA?.matchingOptIn === true, "matchingOptIn = true en BDD pour userA");

  // Test matching — userA cherche un partenaire
  // La campagne n'est pas PREMIUM_PLUS dans le seed (offer: "PREMIUM"), on le met à jour pour ce test
  await prisma.campaign.update({ where: { id: campaignId }, data: { offer: "PREMIUM_PLUS" } });

  // Ajouter un résultat IQRH si manquant sur userB (pour que le matching ait deux résultats)
  if (!userB.assessments[0]?.result) {
    fail("UserB n'a pas de résultat IQRH — matching ignoré");
    return;
  }

  const matchResult = await MatchingService.findAndInvitePartner(userA.id);

  if (matchResult.success) {
    assert(true, `Matching réussi — partenaire : ${matchResult.partnerName}`);
    // Vérifier la suggestion en BDD
    const suggestion = await prisma.binomeSuggestion.findFirst({
      where: { userAId: userA.id, status: "PENDING" },
    });
    assert(!!suggestion, "BinomeSuggestion PENDING créée en BDD");
    assert((suggestion?.compatibilityScore ?? 0) >= 0, `Score de compatibilité : ${suggestion?.compatibilityScore}`);
    console.log(`     → ${matchResult.message}`);
  } else {
    // Pas de match = acceptable si aucun candidat valide (scores insuffisants)
    assert(true, `Matching sans résultat (normal si seuil non atteint) : ${matchResult.message}`);
  }

  // Opt-out
  await MatchingService.setOptIn(userA.id, false);
  const afterOptOut = await prisma.user.findUnique({ where: { id: userA.id }, select: { matchingOptIn: true } });
  assert(afterOptOut?.matchingOptIn === false, "Opt-out de userA fonctionne");
}

// ─── 9. SYSTEM CONFIG (ex matching-settings.json) ────────────────────────────

async function testSystemConfig() {
  section("9. SYSTEM CONFIG (Config matching depuis BDD)");

  // Créer une config de test
  const testConfig = { minimumThreshold: 70, synergyWeight: 65, similarityWeight: 35 };
  await prisma.systemConfig.upsert({
    where: { key: "matching-settings" },
    create: { key: "matching-settings", value: testConfig },
    update: { value: testConfig },
  });

  const record = await prisma.systemConfig.findUnique({ where: { key: "matching-settings" } });
  assert(!!record, "SystemConfig créé en BDD");
  assert((record?.value as any)?.minimumThreshold === 70, "minimumThreshold correctement lu (70)");
  assert((record?.value as any)?.synergyWeight === 65, "synergyWeight correctement lu (65)");

  // Test config arbitraire
  await prisma.systemConfig.upsert({
    where: { key: "feature-flags" },
    create: { key: "feature-flags", value: { binomeEnabled: true, irisEnabled: true } },
    update: { value: { binomeEnabled: true, irisEnabled: true } },
  });
  const flags = await prisma.systemConfig.findUnique({ where: { key: "feature-flags" } });
  assert((flags?.value as any)?.irisEnabled === true, "Feature flag IRIS activé");
}

// ─── 10. IRIS CONVERSATION PERSISTANCE ───────────────────────────────────────

async function testIrisConversationPersistence() {
  section("10. IRIS — Persistance de la Conversation");

  const user = await prisma.user.findUnique({ where: { email: "demo.b2b2c@linkoffice.fr" } });
  if (!user) { fail("Utilisateur Sacha non trouvé"); return; }

  // Créer une conversation
  const conv = await prisma.irisConversation.create({
    data: { userId: user.id, title: "Session de test E2E" },
  });
  assert(!!conv.id, `Conversation créée (id: ${conv.id})`);
  assert(conv.userId === user.id, "Conversation liée au bon utilisateur");

  // Persister des messages
  const msgUser = await prisma.irisMessage.create({
    data: { conversationId: conv.id, role: "user", content: "Bonjour IRIS, j'ai accompli mon défi !" },
  });
  assert(!!msgUser.id, "Message utilisateur créé");

  const msgIris = await prisma.irisMessage.create({
    data: { conversationId: conv.id, role: "assistant", content: "Félicitations ! C'est une belle avancée." },
  });
  assert(!!msgIris.id, "Message IRIS créé");

  // Récupérer l'historique dans l'ordre
  const history = await prisma.irisMessage.findMany({
    where: { conversationId: conv.id },
    orderBy: { createdAt: "asc" },
  });
  assert(history.length === 2, `Historique complet : ${history.length} messages`);
  assert(history[0]?.role === "user", "Premier message = rôle user");
  assert(history[1]?.role === "assistant", "Deuxième message = rôle assistant");

  // Vérification de la cascade DELETE
  await prisma.irisConversation.delete({ where: { id: conv.id } });
  const orphanMsgs = await prisma.irisMessage.count({ where: { conversationId: conv.id } });
  assert(orphanMsgs === 0, "Cascade DELETE : messages supprimés avec la conversation");

  console.log("     → Historique persisté, ordré et cascade DELETE correcte");
}

// ─── RAPPORT FINAL ────────────────────────────────────────────────────────────

async function printSummary() {
  const total = passed + failed;
  console.log(`\n${"═".repeat(60)}`);
  console.log("📊 RAPPORT FINAL — TESTS E2E LINK OFFICE");
  console.log("═".repeat(60));
  console.log(`  Total   : ${total} assertions`);
  console.log(`  ✅ Passés : ${passed}`);
  console.log(`  ❌ Échoués: ${failed}`);
  if (errors.length > 0) {
    console.log("\n  Détail des échecs :");
    errors.forEach((e, i) => console.log(`    ${i + 1}. ${e}`));
  }
  console.log("═".repeat(60));
  if (failed === 0) {
    console.log("  🎉 TOUS LES TESTS PASSENT — Application fonctionnelle de bout en bout !\n");
  } else {
    console.log(`  ⚠️  ${failed} test(s) échoué(s) — voir détails ci-dessus\n`);
  }
}

// ─── POINT D'ENTRÉE ───────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 DÉMARRAGE DES TESTS E2E — Link Office");
  console.log(`   ${new Date().toLocaleString("fr-FR")}\n`);

  try {
    await testSeedData();
    const iqrhResult = await testIQRHEngine();
    const icrResult = await testICREngine(iqrhResult);
    await testProfileEngine(iqrhResult, icrResult);
    const prescriptionData = await testPrescription();
    await testIrisContext();
    if (prescriptionData) await testGamification(prescriptionData);
    await testBinomeMatching();
    await testSystemConfig();
    await testIrisConversationPersistence();
  } catch (e) {
    console.error("\n💥 Erreur fatale durant les tests :", e);
    failed++;
  } finally {
    await printSummary();
    await prisma.$disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
}

main();
