import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { GET } from "../../app/api/cron/cleanup/route";

const TEST_CRON_SECRET = "cron_secret_test_passe8_mock";

describe("C9 — Rétention des transcriptions (T7.7)", () => {
  const originalSecret = process.env.CRON_SECRET;
  const originalRetention = process.env.IRIS_TRANSCRIPT_RETENTION_DAYS;
  const testSuffix = Date.now();
  const testUserId = `c9_user_${testSuffix}`;

  beforeEach(() => {
    process.env.CRON_SECRET = TEST_CRON_SECRET;
    process.env.IRIS_TRANSCRIPT_RETENTION_DAYS = "90";
  });

  afterAll(async () => {
    process.env.CRON_SECRET = originalSecret;
    process.env.IRIS_TRANSCRIPT_RETENTION_DAYS = originalRetention;
    await prisma.irisMessage.deleteMany({
      where: { conversation: { userId: testUserId } },
    });
    await prisma.irisConversation.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it("1. Rejette un appel sans jeton ou avec un jeton invalide (HTTP 401)", async () => {
    // Sans header Authorization
    const reqNoAuth = new Request("http://localhost:3000/api/cron/cleanup");
    const resNoAuth = await GET(reqNoAuth);
    expect(resNoAuth.status).toBe(401);

    // Avec mauvais jeton
    const reqBadAuth = new Request("http://localhost:3000/api/cron/cleanup", {
      headers: { authorization: "Bearer wrong_token" },
    });
    const resBadAuth = await GET(reqBadAuth);
    expect(resBadAuth.status).toBe(401);
  });

  it("2. Supprime uniquement les conversations de plus de 90 jours (ex: 100 jours) et conserve celles de 10 jours", async () => {
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `c9_${testSuffix}@example.com`,
        firstName: "Cron",
        lastName: "Cleanup",
      },
    });

    const conv10DaysId = `c9_conv_10d_${testSuffix}`;
    const conv100DaysId = `c9_conv_100d_${testSuffix}`;

    const date10DaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const date100DaysAgo = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);

    // Création conversation 10 jours
    await prisma.irisConversation.create({
      data: {
        id: conv10DaysId,
        userId: testUserId,
        title: "Conversation récente (10j)",
        createdAt: date10DaysAgo,
        updatedAt: date10DaysAgo,
        messages: {
          create: [
            {
              role: "user",
              content: "Message récent",
              createdAt: date10DaysAgo,
            },
            {
              role: "assistant",
              content: "Réponse récente",
              aiGenerated: true,
              createdAt: date10DaysAgo,
            },
          ],
        },
      },
    });

    // Création conversation 100 jours
    await prisma.irisConversation.create({
      data: {
        id: conv100DaysId,
        userId: testUserId,
        title: "Conversation ancienne (100j)",
        createdAt: date100DaysAgo,
        updatedAt: date100DaysAgo,
        messages: {
          create: [
            {
              role: "user",
              content: "Message ancien",
              createdAt: date100DaysAgo,
            },
            {
              role: "assistant",
              content: "Réponse ancienne",
              aiGenerated: true,
              createdAt: date100DaysAgo,
            },
          ],
        },
      },
    });

    // Appel avec le bon jeton cron
    const req = new Request("http://localhost:3000/api/cron/cleanup", {
      headers: { authorization: `Bearer ${TEST_CRON_SECRET}` },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.deletedConversations).toBeGreaterThanOrEqual(1);

    // Vérification en BDD : celle de 100 jours a disparu
    const conv100 = await prisma.irisConversation.findUnique({ where: { id: conv100DaysId } });
    expect(conv100).toBeNull();

    const msg100 = await prisma.irisMessage.findMany({ where: { conversationId: conv100DaysId } });
    expect(msg100.length).toBe(0);

    // Vérification en BDD : celle de 10 jours est toujours présente
    const conv10 = await prisma.irisConversation.findUnique({ where: { id: conv10DaysId } });
    expect(conv10).not.toBeNull();
    expect(conv10?.id).toBe(conv10DaysId);

    const msg10 = await prisma.irisMessage.findMany({ where: { conversationId: conv10DaysId } });
    expect(msg10.length).toBe(2);
  });
});
