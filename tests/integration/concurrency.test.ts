import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma and related dependencies
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: vi.fn(),
      prescriptionItem: {
        updateMany: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      userStats: {
        upsert: vi.fn(),
      },
      badge: {
        findMany: vi.fn(),
      },
      userBadge: {
        create: vi.fn(),
      },
      irisConversation: {
        findUnique: vi.fn(),
      },
      irisMessage: {
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({ id: "msg-1" }),
        count: vi.fn().mockResolvedValue(1),
      },
      iqrhResult: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      prescription: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      binomeRequest: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      binome: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  };
});

vi.mock("@/lib/iris/llm", () => ({
  streamResponse: vi.fn().mockReturnValue(new Response("Streaming mock")),
  generateResponse: vi.fn().mockResolvedValue({ text: "Mock response" }),
}));

vi.mock("@/lib/iris/context-builder", () => ({
  buildIrisContext: vi.fn().mockResolvedValue("Mock context"),
}));

vi.mock("@/lib/logger", () => ({
  EventLogger: { log: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@/lib/notifications", () => ({
  NotificationService: { send: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { GamificationService } from "@/lib/gamification/gamification-service";
import { POST as postIrisMessage } from "../../app/api/iris/conversation/[id]/message/route";
import { auth } from "@/lib/auth";

describe("Tests de Concurrence et Race Conditions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("4.2 Atomicité de GamificationService.completeChallenge()", () => {
    it("garantit qu'une seule requête concurrente réussit et que les autres sont rejetées (1 sur N)", async () => {
      const userId = "user-race-1";
      const prescriptionItemId = "item-race-100";

      // Simulation de l'état interne de la DB avec verrou transactionnel
      let isCompleted = false;
      let totalUserPoints = 100;

      // Mock $transaction pour exécuter le callback séquentiellement ou avec lock atomique
      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          prescriptionItem: {
            updateMany: vi.fn().mockImplementation(async (args: any) => {
              // Vérifie la condition atomique: status: { not: "COMPLETED" }
              if (!isCompleted && args.where.status.not === "COMPLETED") {
                isCompleted = true; // la 1ère transaction passe
                return { count: 1 };
              }
              // Les transactions suivantes voient isCompleted = true -> 0 rows updated
              return { count: 0 };
            }),
            findUniqueOrThrow: vi.fn().mockResolvedValue({
              id: prescriptionItemId,
              libraryItem: { data: { points: 20 } },
            }),
          },
          user: {
            update: vi.fn().mockImplementation(async (args: any) => {
              totalUserPoints += args.data.points.increment;
              return { id: userId, points: totalUserPoints };
            }),
          },
          userStats: {
            upsert: vi.fn().mockResolvedValue({}),
          },
          badge: {
            findMany: vi.fn().mockResolvedValue([]),
          },
        };
        return callback(tx);
      });

      // Lancer 20 requêtes simultanées en concurrence
      type ConcurrentResult =
        | { success: true; res: Awaited<ReturnType<typeof GamificationService.completeChallenge>> }
        | { success: false; error: string };

      const CONCURRENT_REQUESTS = 20;
      const promises: Promise<ConcurrentResult>[] = Array.from({ length: CONCURRENT_REQUESTS }, () =>
        GamificationService.completeChallenge(userId, prescriptionItemId)
          .then((res) => ({ success: true as const, res }))
          .catch((err) => ({ success: false as const, error: err.message }))
      );

      const results = await Promise.all(promises);

      const successes = results.filter((r): r is Extract<ConcurrentResult, { success: true }> => r.success);
      const failures = results.filter((r): r is Extract<ConcurrentResult, { success: false }> => !r.success);

      // Exactement 1 succès
      expect(successes.length).toBe(1);
      expect(successes[0].res.pointsEarned).toBe(20);
      expect(successes[0].res.totalPoints).toBe(120);

      // Exactement N-1 échecs avec message explicite
      expect(failures.length).toBe(CONCURRENT_REQUESTS - 1);
      failures.forEach((f) => {
        expect(f.error).toContain("Défi déjà complété ou non autorisé.");
      });

      // Les points ne sont attribués qu'une seule fois
      expect(totalUserPoints).toBe(120);
    });
  });

  describe("4.2 Atomicité du Quota Freemium IRIS sous forte concurrence", () => {
    it("rejette avec HTTP 402 dès que le quota de 5 est atteint sous 10 requêtes simultanées", async () => {
      const userId = "user-quota-1";
      const conversationId = "conv-1";
      const today = new Date();

      (auth as any).mockResolvedValue({
        user: { id: userId, email: "freemium@test.com" },
      });

      (prisma.irisConversation.findUnique as any).mockResolvedValue({
        id: conversationId,
        userId: userId,
      });

      // L'utilisateur a déjà consommé 4 requêtes sur 5
      let dbIrisUsageCount = 4;

      (prisma.user.findUnique as any).mockImplementation(async () => ({
        id: userId,
        subscription: "FREEMIUM",
        irisUsageCount: dbIrisUsageCount,
        lastIrisUsage: today,
      }));

      // updateMany atomique avec condition { lt: 5 }
      (prisma.user.updateMany as any).mockImplementation(async (args: any) => {
        if (dbIrisUsageCount < 5) {
          dbIrisUsageCount += 1;
          return { count: 1 };
        }
        return { count: 0 };
      });

      // 10 requêtes concurrentes simultanées
      const CONCURRENT_REQUESTS = 10;
      const promises = Array.from({ length: CONCURRENT_REQUESTS }, () => {
        const req = new Request(`http://localhost:3000/api/iris/conversation/${conversationId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_user: "Bonjour IRIS !" }),
        });
        return postIrisMessage(req, { params: Promise.resolve({ id: conversationId }) });
      });

      const responses = await Promise.all(promises);
      const statuses = responses.map((r) => r.status);

      const count402 = statuses.filter((s) => s === 402).length;
      // Exactement 1 seule requête peut faire passer de 4 à 5, les 9 autres doivent recevoir 402
      expect(count402).toBe(9);
      expect(dbIrisUsageCount).toBe(5); // Le compteur n'excède JAMAIS 5
    });
  });
});
