import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notifications";

describe("C7 — Alerte de baisse de 15 points (T7.2)", () => {
  const testSuffix = Date.now();
  const testUserId = `c7_user_${testSuffix}`;
  const assessmentIds: string[] = [];
  const resultIds: string[] = [];

  afterAll(async () => {
    await prisma.notification.deleteMany({ where: { userId: testUserId } });
    for (const rid of resultIds) {
      await prisma.relationalPrescription.deleteMany({ where: { iqrhResultId: rid } });
      await prisma.icrResult.deleteMany({ where: { iqrhResultId: rid } });
      await prisma.profileResult.deleteMany({ where: { iqrhResultId: rid } });
      await prisma.iqrhResult.deleteMany({ where: { id: rid } });
    }
    for (const aid of assessmentIds) {
      await prisma.assessment.deleteMany({ where: { id: aid } });
    }
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  // Helper pour simuler l'enregistrement d'un résultat IQRH et le déclenchement de l'alerte
  async function recordResultAndCheckAlert(score: number) {
    const aid = `c7_ass_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const rid = `c7_res_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    assessmentIds.push(aid);
    resultIds.push(rid);

    await prisma.assessment.create({
      data: {
        id: aid,
        userId: testUserId,
        status: "SUBMITTED",
      },
    });

    // Recherche du dernier résultat antérieur du même utilisateur
    const previousResult = await prisma.iqrhResult.findFirst({
      where: {
        assessment: { userId: testUserId },
      },
      orderBy: { createdAt: "desc" },
      select: { globalScore: true },
    });

    const currentResult = await prisma.iqrhResult.create({
      data: {
        id: rid,
        assessmentId: aid,
        globalScore: score,
        socialScore: score,
        affectiveScore: score,
        sentimentalScore: score,
        professionalScore: score,
        selfScore: score,
        weather: "Éclaircies",
        balanceIndex: 10,
        priorityDimension: "SOCIAL",
        strengths: [],
        watchpoints: [],
        primaryProfile: "Profil A",
        secondaryProfile: "Profil B",
        profileSummary: "Résumé",
      },
    });

    // Appel de l'alerte comme requis par C7
    if (previousResult) {
      try {
        await NotificationService.checkScoreDropAlert(
          testUserId,
          currentResult.globalScore,
          previousResult.globalScore
        );
      } catch (err) {
        console.error("Alert error", err);
      }
    }

    return currentResult;
  }

  it("1. Première évaluation (score 80) → aucune notification", async () => {
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `c7_${testSuffix}@example.com`,
        firstName: "Score",
        lastName: "Drop",
        subscription: "FREEMIUM",
      },
    });

    await recordResultAndCheckAlert(80);

    const count = await prisma.notification.count({ where: { userId: testUserId } });
    expect(count).toBe(0);
  });

  it("2. Deuxième évaluation de 80 à 70 (baisse de 10 points < 15) → aucune notification", async () => {
    await recordResultAndCheckAlert(70);

    const count = await prisma.notification.count({ where: { userId: testUserId } });
    expect(count).toBe(0);
  });

  it("3. Troisième évaluation de 80 à 64 (baisse de 16 points >= 15) → une notification", async () => {
    // Score précédent était 80 (ou 70 par rapport au dernier, simulons 80 -> 64)
    // Ici le résultat antérieur est 70, donc créons un utilisateur dédié pour tester 80 -> 64
    const userPairId = `c7_pair_${testSuffix}`;
    await prisma.user.create({
      data: {
        id: userPairId,
        email: `c7_pair_${testSuffix}@example.com`,
        firstName: "Pair",
        lastName: "Test",
      },
    });

    // Évaluation 1 : 80
    const a1 = `c7_a1_${testSuffix}`;
    const r1 = `c7_r1_${testSuffix}`;
    assessmentIds.push(a1);
    resultIds.push(r1);
    await prisma.assessment.create({ data: { id: a1, userId: userPairId, status: "SUBMITTED" } });
    await prisma.iqrhResult.create({
      data: {
        id: r1,
        assessmentId: a1,
        globalScore: 80,
        socialScore: 80,
        affectiveScore: 80,
        sentimentalScore: 80,
        professionalScore: 80,
        selfScore: 80,
        weather: "Grand soleil",
        balanceIndex: 5,
        priorityDimension: "SOCIAL",
        strengths: [],
        watchpoints: [],
        primaryProfile: "P",
        secondaryProfile: "S",
        profileSummary: "Sum",
      },
    });

    // Évaluation 2 : 64 (baisse de 16 points)
    const prev = await prisma.iqrhResult.findFirst({
      where: { assessment: { userId: userPairId } },
      orderBy: { createdAt: "desc" },
    });
    expect(prev?.globalScore).toBe(80);

    const a2 = `c7_a2_${testSuffix}`;
    const r2 = `c7_r2_${testSuffix}`;
    assessmentIds.push(a2);
    resultIds.push(r2);
    await prisma.assessment.create({ data: { id: a2, userId: userPairId, status: "SUBMITTED" } });
    await prisma.iqrhResult.create({
      data: {
        id: r2,
        assessmentId: a2,
        globalScore: 64,
        socialScore: 64,
        affectiveScore: 64,
        sentimentalScore: 64,
        professionalScore: 64,
        selfScore: 64,
        weather: "Éclaircies",
        balanceIndex: 10,
        priorityDimension: "SOCIAL",
        strengths: [],
        watchpoints: [],
        primaryProfile: "P",
        secondaryProfile: "S",
        profileSummary: "Sum",
      },
    });

    await NotificationService.checkScoreDropAlert(userPairId, 64, 80);

    const count = await prisma.notification.count({ where: { userId: userPairId } });
    expect(count).toBe(1);

    const notif = await prisma.notification.findFirst({ where: { userId: userPairId } });
    expect(notif?.title).toBe("Alerte Équilibre Relationnel");
    expect(notif?.message).toContain("16 points");

    // Nettoyage de l'utilisateur dédié
    await prisma.notification.deleteMany({ where: { userId: userPairId } });
    await prisma.user.delete({ where: { id: userPairId } });
  });

  it("4. Troisième notification dans la semaine → refusée par le plafond de 2", async () => {
    // testUserId a actuellement 0 notification
    // Ajoutons 2 notifications cette semaine pour atteindre le plafond
    for (let i = 1; i <= 2; i++) {
      await prisma.notification.create({
        data: {
          id: `c7_notif_seed_${testSuffix}_${i}`,
          userId: testUserId,
          type: "QUESTIONNAIRE_REMINDER",
          title: `Notif ${i}`,
          message: `Message ${i}`,
          createdAt: new Date(),
        },
      });
    }

    const countBefore = await prisma.notification.count({ where: { userId: testUserId } });
    expect(countBefore).toBe(2);

    // Une nouvelle baisse de 20 points (de 70 à 50) est soumise
    const alertResult = await NotificationService.checkScoreDropAlert(testUserId, 50, 70);

    // La 3ème notification dans la semaine doit être refusée
    expect(alertResult.alerted).toBe(false);

    const countAfter = await prisma.notification.count({ where: { userId: testUserId } });
    expect(countAfter).toBe(2); // toujours 2, la 3ème a été refusée
  });
});
