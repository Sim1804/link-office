import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("C4 — Effacement RGPD : Témoins Positifs et Élimination des Résidus (T7.11)", () => {
  const timestamp = Date.now();
  const testUserId = `gdpr-user-${timestamp}`;
  const partnerUserId = `gdpr-partner-${timestamp}`;
  const orgId = `gdpr-org-${timestamp}`;
  const campaignId = `gdpr-camp-${timestamp}`;
  const assessmentId = `gdpr-assess-${timestamp}`;
  const moduleId = `gdpr-mod-${timestamp}`;
  const questionId = `gdpr-q-${timestamp}`;
  const variableId = `gdpr-var-${timestamp}`;
  const binomeId = `gdpr-binome-${timestamp}`;
  const suggestionId = `gdpr-sug-${timestamp}`;

  afterAll(async () => {
    try {
      await prisma.eventLog.deleteMany({ where: { userId: testUserId } });
      await prisma.user.deleteMany({ where: { id: { in: [testUserId, partnerUserId] } } });
      await prisma.campaign.deleteMany({ where: { id: campaignId } });
      await prisma.organization.deleteMany({ where: { id: orgId } });
      await prisma.adaptiveQuestion.deleteMany({ where: { id: questionId } });
      await prisma.adaptiveModule.deleteMany({ where: { id: moduleId } });
      await prisma.$disconnect();
    } catch {
      // Nettoyage de fin
    }
  });

  it("Injecte des données dans les 9 tables critiques, supprime l'utilisateur et vérifie 0 résidu", async () => {
    // 1. Création de l'organisation et de la campagne
    await prisma.organization.create({
      data: {
        id: orgId,
        name: "Org Test RGPD",
        type: "B2B",
        codeAccess: `CODE-${timestamp}`,
      },
    });

    await prisma.campaign.create({
      data: {
        id: campaignId,
        title: "Campagne Test RGPD",
        organizationId: orgId,
        codeAccess: `CAMP-${timestamp}`,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      },
    });

    // 2. Création des utilisateurs principal et partenaire
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@linkoffice.test`,
        firstName: "Test",
        lastName: "GDPR",
        role: "EMPLOYEE",
        organizationId: orgId,
        campaignId: campaignId,
      },
    });

    await prisma.user.create({
      data: {
        id: partnerUserId,
        email: `${partnerUserId}@linkoffice.test`,
        firstName: "Partner",
        lastName: "GDPR",
        role: "EMPLOYEE",
        organizationId: orgId,
        campaignId: campaignId,
      },
    });

    // 3. Création de l'évaluation
    await prisma.assessment.create({
      data: {
        id: assessmentId,
        userId: testUserId,
        campaignId: campaignId,
        status: "SUBMITTED",
      },
    });

    // Témoin 1 : AdaptiveAnswer
    await prisma.adaptiveModule.upsert({
      where: { id: moduleId },
      create: {
        id: moduleId,
        triggerSituation: `situation-${timestamp}`,
        title: "Module Adaptatif Test",
        objective: "Test RGPD",
        position: 1,
      },
      update: {},
    });

    await prisma.adaptiveQuestion.upsert({
      where: { id: questionId },
      create: {
        id: questionId,
        moduleId: moduleId,
        text: "Question adaptative test ?",
        position: 1,
      },
      update: {},
    });

    await prisma.adaptiveAnswer.create({
      data: {
        assessmentId: assessmentId,
        adaptiveQuestionId: questionId,
        value: 4,
      },
    });

    // Témoin 2 : EventLog
    await prisma.eventLog.create({
      data: {
        userId: testUserId,
        eventType: "USER_LOGIN_TEST",
        eventData: { ip: "127.0.0.1", session: "test" },
      },
    });

    // Témoin 3, 5, 6, 7 : Binome, Checkin, Feedback, Gamification
    await prisma.binome.create({
      data: {
        id: binomeId,
        userAId: testUserId,
        userBId: partnerUserId,
        campaignId: campaignId,
        status: "ACTIVE",
      },
    });

    await prisma.binomeCheckin.create({
      data: {
        binomeId: binomeId,
        userId: testUserId,
        checkinType: "RAPIDE",
        mood: 4,
      },
    });

    await prisma.binomeFeedback.create({
      data: {
        binomeId: binomeId,
        userId: testUserId,
        satisfaction: 5,
        usefulness: 5,
      },
    });

    await prisma.binomeGamification.create({
      data: {
        binomeId: binomeId,
        userAId: testUserId,
        userBId: partnerUserId,
        pointsBinome: 50,
      },
    });

    // Témoin 4 : BinomeSuggestion
    await prisma.binomeSuggestion.create({
      data: {
        id: suggestionId,
        userAId: testUserId,
        userBId: partnerUserId,
        campaignId: campaignId,
        status: "PENDING",
        compatibilityScore: 85.0,
        compatibilityReasons: ["Complémentarité test"],
        irisRecommendation: "Recommandation test binôme",
      },
    });

    // Témoin 8 : CampaignVariableAnswer
    await prisma.campaignVariable.create({
      data: {
        id: variableId,
        campaignId: campaignId,
        question: "Département Test",
        options: ["Tech", "RH", "Commercial"],
      },
    });

    await prisma.campaignVariableAnswer.create({
      data: {
        id: `cva-${timestamp}`,
        variableId: variableId,
        assessmentId: assessmentId,
        value: "Direction Technique",
      },
    });

    // Témoin 9 : UserMicroDefi
    await prisma.userMicroDefi.create({
      data: {
        userId: testUserId,
        defiId: `defi-${timestamp}`,
        status: "IN_PROGRESS",
      },
    });

    // ── Vérification préalable : Chaque témoin contient au moins 1 ligne ──
    expect(await prisma.adaptiveAnswer.count({ where: { assessmentId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.eventLog.count({ where: { userId: testUserId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.binome.count({ where: { id: binomeId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.binomeSuggestion.count({ where: { id: suggestionId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.binomeCheckin.count({ where: { binomeId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.binomeFeedback.count({ where: { binomeId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.binomeGamification.count({ where: { binomeId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.campaignVariableAnswer.count({ where: { assessmentId } })).toBeGreaterThanOrEqual(1);
    expect(await prisma.userMicroDefi.count({ where: { userId: testUserId } })).toBeGreaterThanOrEqual(1);

    // ── Déclenchement de la suppression de compte RGPD transactionnelle ──
    const { deleteUserAccount } = await import("@/lib/user/account-service");
    await deleteUserAccount(testUserId);

    // ── Vérification stricte : ZÉRO résidu pour l'utilisateur dans les 9 tables ──
    const resAdaptiveAnswer = await prisma.adaptiveAnswer.count({ where: { assessmentId } });
    const resEventLog = await prisma.eventLog.count({ where: { userId: testUserId } });
    const resBinome = await prisma.binome.count({ where: { userAId: testUserId } });
    const resBinomeSuggestion = await prisma.binomeSuggestion.count({ where: { userAId: testUserId } });
    const resBinomeCheckin = await prisma.binomeCheckin.count({ where: { userId: testUserId } });
    const resBinomeFeedback = await prisma.binomeFeedback.count({ where: { userId: testUserId } });
    const resBinomeGamification = await prisma.binomeGamification.count({ where: { userAId: testUserId } });
    const resCampaignVarAnswer = await prisma.campaignVariableAnswer.count({ where: { assessmentId } });
    const resUserMicroDefi = await prisma.userMicroDefi.count({ where: { userId: testUserId } });

    expect(resAdaptiveAnswer).toBe(0);
    expect(resEventLog).toBe(0);
    expect(resBinome).toBe(0);
    expect(resBinomeSuggestion).toBe(0);
    expect(resBinomeCheckin).toBe(0);
    expect(resBinomeFeedback).toBe(0);
    expect(resBinomeGamification).toBe(0);
    expect(resCampaignVarAnswer).toBe(0);
    expect(resUserMicroDefi).toBe(0);
  });
});
