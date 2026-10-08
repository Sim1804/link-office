import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { checkDistributedRateLimit, getDistributedRetryAfterSeconds } from "@/lib/rate-limit";

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

describe("Tests de Rate Limiting Distribué PostgreSQL (Sliding Window)", { timeout: 20000 }, () => {
  const testKeyA = `test:ratelimit:${Date.now()}:userA`;
  const testKeyB = `test:ratelimit:${Date.now()}:userB`;

  beforeAll(async () => {
    // Nettoyer les clés de test
    await prisma.rateLimitAttempt.deleteMany({
      where: { key: { in: [testKeyA, testKeyB] } },
    });
  });

  afterAll(async () => {
    await prisma.rateLimitAttempt.deleteMany({
      where: { key: { in: [testKeyA, testKeyB] } },
    });
  });

  it("1. Autorise les requêtes jusqu'au seuil configuré et décrémente remaining", async () => {
    const res1 = await checkDistributedRateLimit(testKeyA, { limit: 3, windowMs: 10_000 });
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = await checkDistributedRateLimit(testKeyA, { limit: 3, windowMs: 10_000 });
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = await checkDistributedRateLimit(testKeyA, { limit: 3, windowMs: 10_000 });
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4e requête : doit être formellement rejetée
    const res4 = await checkDistributedRateLimit(testKeyA, { limit: 3, windowMs: 10_000 });
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.resetSeconds).toBeGreaterThan(0);
  });

  it("2. Cloisonne strictement les clés différentes (indépendance des IP / utilisateurs)", async () => {
    // testKeyB doit être complètement indépendant de testKeyA
    const resB = await checkDistributedRateLimit(testKeyB, { limit: 3, windowMs: 10_000 });
    expect(resB.success).toBe(true);
    expect(resB.remaining).toBe(2);
  });

  it("3. Les tentatives sont bien persistées dans la table RateLimitAttempt de PostgreSQL", async () => {
    const attempts = await prisma.rateLimitAttempt.findMany({
      where: { key: testKeyA },
    });
    // Exactement 3 tentatives insérées (les 3 premières qui ont réussi)
    expect(attempts.length).toBe(3);
  });

  it("4. Calcule le temps d'attente restant (Retry-After)", async () => {
    const retryAfter = await getDistributedRetryAfterSeconds(testKeyA, 10_000);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(10);
  });

  it("5. Test HTTP Réel : GET /api/auth/verify renvoie HTTP 429 avec header Retry-After après 10 requêtes", async () => {
    const fakeIp = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    const url = `${BASE_URL}/api/auth/verify?token=invalid-probe-token`;

    let lastStatus = 0;
    let got429 = false;
    let retryAfterHeader = null;

    for (let i = 0; i < 12; i++) {
      const res = await fetch(url, {
        headers: { "x-forwarded-for": fakeIp },
      });
      lastStatus = res.status;
      if (res.status === 429) {
        got429 = true;
        retryAfterHeader = res.headers.get("retry-after");
        break;
      }
    }

    expect(got429).toBe(true);
    expect(lastStatus).toBe(429);
    expect(retryAfterHeader).not.toBeNull();
  });
});
