import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { GamificationService } from "@/lib/gamification/gamification-service";

describe("Tests de Concurrence Réelle PostgreSQL (Docker)", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("A1. Atomicité de GamificationService.completeChallenge() sous 50 requêtes concurrentes réelles", () => {
    it("garantit qu'exactement 1 requête sur 50 réussit et que les points ne sont crédités qu'une seule fois dans PostgreSQL", async () => {
      const timestamp = Date.now();
      const testUserId = `real-race-user-${timestamp}`;
      const testLibraryId = `real-race-lib-${timestamp}`;
      const testPrescriptionId = `real-race-presc-${timestamp}`;
      const testItemId = `real-race-item-${timestamp}`;
      const testAssessmentId = `real-race-assess-${timestamp}`;
      const testIqrhId = `real-race-iqrh-${timestamp}`;

      try {
        // Fixtures réelles insérées dans PostgreSQL
        await prisma.user.create({
          data: {
            id: testUserId,
            email: `${testUserId}@linkoffice-concurrency.test`,
            firstName: "Concur",
            lastName: "User",
            role: "EMPLOYEE",
            points: 0,
          },
        });

        await prisma.assessment.create({
          data: {
            id: testAssessmentId,
            userId: testUserId,
            status: "SUBMITTED",
          },
        });

        await prisma.iqrhResult.create({
          data: {
            id: testIqrhId,
            assessmentId: testAssessmentId,
            globalScore: 70,
            socialScore: 70,
            affectiveScore: 70,
            sentimentalScore: 70,
            professionalScore: 70,
            selfScore: 70,
            weather: "PLUTOT_BIEN",
            balanceIndex: 7.0,
            priorityDimension: "PROFESSIONAL",
            primaryProfile: "Connecté",
            secondaryProfile: "Solidaire",
            profileSummary: "Concurrence test",
          },
        });

        await prisma.libraryItem.create({
          data: {
            id: testLibraryId,
            library: "Micro-défis",
            title: "Défi Concurrence Réelle",
            data: { points: 25 },
          },
        });

        await prisma.relationalPrescription.create({
          data: {
            id: testPrescriptionId,
            userId: testUserId,
            iqrhResultId: testIqrhId,
            title: "Prescription Concurrence",
            summary: "Test Concurrence",
            priorityDimension: "PROFESSIONAL",
            status: "ACTIVE",
          },
        });

        await prisma.prescriptionItem.create({
          data: {
            id: testItemId,
            prescriptionId: testPrescriptionId,
            libraryItemId: testLibraryId,
            kind: "MICRO_DEFI",
            position: 1,
            rationale: "Rationale",
            status: "PROPOSED",
          },
        });

        const CONCURRENT_REQUESTS = 50;

        type ConcurrentOutcome =
          | { success: true; res: Awaited<ReturnType<typeof GamificationService.completeChallenge>> }
          | { success: false; error: string };

        const promises: Promise<ConcurrentOutcome>[] = Array.from({ length: CONCURRENT_REQUESTS }, () =>
          GamificationService.completeChallenge(testUserId, testItemId)
            .then((res) => ({ success: true as const, res }))
            .catch((err) => ({ success: false as const, error: err.message }))
        );

        const results = await Promise.all(promises);

        const successes = results.filter((r): r is Extract<ConcurrentOutcome, { success: true }> => r.success);
        const failures = results.filter((r): r is Extract<ConcurrentOutcome, { success: false }> => !r.success);

        // Exactement 1 requête sur 50 réussit
        expect(successes.length).toBe(1);
        expect(successes[0].res.pointsEarned).toBe(25);
        expect(successes[0].res.totalPoints).toBe(25);

        // Les 49 autres requêtes sont formellement rejetées
        expect(failures.length).toBe(CONCURRENT_REQUESTS - 1);
        failures.forEach((f) => {
          expect(f.error).toMatch(/Défi déjà complété ou non autorisé/);
        });

        // Preuve réelle dans la base de données PostgreSQL
        const dbUser = await prisma.user.findUnique({ where: { id: testUserId } });
        const dbItem = await prisma.prescriptionItem.findUnique({ where: { id: testItemId } });

        expect(dbUser?.points).toBe(25);
        expect(dbItem?.status).toBe("COMPLETED");
      } finally {
        // Nettoyage complet des tables de test
        await prisma.prescriptionItem.deleteMany({ where: { id: testItemId } });
        await prisma.relationalPrescription.deleteMany({ where: { id: testPrescriptionId } });
        await prisma.libraryItem.deleteMany({ where: { id: testLibraryId } });
        await prisma.iqrhResult.deleteMany({ where: { id: testIqrhId } });
        await prisma.assessment.deleteMany({ where: { id: testAssessmentId } });
        await prisma.user.deleteMany({ where: { id: testUserId } });
      }
    }, 15000);
  });

  describe("A1. Atomicité du Quota Freemium IRIS sous 50 requêtes concurrentes réelles", () => {
    it("garantit qu'une seule requête incrémente de 4 à 5 et que les 49 autres sont rejetées par la condition SQL atomique", async () => {
      const timestamp = Date.now();
      const quotaUserId = `real-quota-user-${timestamp}`;

      try {
        await prisma.user.create({
          data: {
            id: quotaUserId,
            email: `${quotaUserId}@linkoffice-quota.test`,
            firstName: "Quota",
            lastName: "Tester",
            role: "CITIZEN",
            subscription: "FREEMIUM",
            irisUsageCount: 4, // Déjà à 4/5
          },
        });

        const CONCURRENT_REQUESTS = 50;

        // 50 requêtes SQL concurrentes sur la condition atomique { irisUsageCount: { lt: 5 } }
        const promises = Array.from({ length: CONCURRENT_REQUESTS }, async () => {
          const res = await prisma.user.updateMany({
            where: {
              id: quotaUserId,
              irisUsageCount: { lt: 5 },
            },
            data: {
              irisUsageCount: { increment: 1 },
            },
          });
          return res.count;
        });

        const counts = await Promise.all(promises);

        const successes = counts.filter((c) => c === 1);
        const rejections = counts.filter((c) => c === 0);

        // Exactement 1 mise à jour réussie
        expect(successes.length).toBe(1);
        // Exactement 49 rejets par verrouillage SQL
        expect(rejections.length).toBe(CONCURRENT_REQUESTS - 1);

        // Preuve réelle dans PostgreSQL
        const dbUser = await prisma.user.findUnique({ where: { id: quotaUserId } });
        expect(dbUser?.irisUsageCount).toBe(5);
      } finally {
        await prisma.user.deleteMany({ where: { id: quotaUserId } });
      }
    }, 15000);
  });
});
