import { describe, it, expect, vi } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock de la session auth pour injecter dynamiquement l'utilisateur test
let mockUserId = "test-user-c1";
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: mockUserId, email: `${mockUserId}@test.local` },
  })),
}));

// Mock du LLM pour éviter tout appel externe pendant les tests de quota
vi.mock("@/lib/iris/llm", () => ({
  generateResponse: vi.fn(async () => ({
    text: "Conseil IRIS de test pour coaching.",
    degraded: false,
    latencyMs: 10,
    model: "mock-model",
  })),
  streamResponse: vi.fn(),
}));

// Mock du filtre de sécurité pour des tests déterministes indépendants du réseau
vi.mock("@/lib/iris/safety", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/iris/safety")>();
  return {
    ...actual,
    evaluateInputSafetyCascaded: vi.fn(async (content: string) => {
      if (content.toLowerCase().includes("suicide") || content.toLowerCase().includes("crise")) {
        return {
          safe: false,
          category: "CRISIS",
          escalationResponse: "En cas d'urgence ou de détresse, composez le 3114 (numéro national de prévention du suicide) ou le 15 (SAMU).",
          matchedPattern: "REGEX_CRISIS_TEST",
          decisiveLayer: "LAYER_1_REGEX",
          confidence: 1.0,
          failSafe: false,
          model: "none",
          layer2LatencyMs: 0,
        };
      }
      return {
        safe: true,
        decisiveLayer: "LAYER_2_LLM",
        confidence: 0.95,
        failSafe: false,
        model: "mock-llm",
        layer2LatencyMs: 5,
      };
    }),
  };
});

// Import de la route POST après les mocks
import { POST } from "../../app/api/iris/conversation/[id]/message/route";

describe("C1 — Quota Freemium vs Filtre de Sécurité IRIS (E01)", () => {
  let testUserId = `user-c1-${Date.now()}`;
  let testConvId = `conv-c1-${Date.now()}`;

  async function setupUserAndConversation(initialUsage: number) {
    const idSuffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    testUserId = `user-c1-${idSuffix}`;
    testConvId = `conv-c1-${idSuffix}`;
    mockUserId = testUserId;

    await prisma.user.create({
      data: {
        id: testUserId,
        email: `${testUserId}@example.com`,
        firstName: "Test",
        lastName: "Freemium",
        subscription: "FREEMIUM",
        irisUsageCount: initialUsage,
        lastIrisUsage: new Date(),
      },
    });

    await prisma.irisConversation.create({
      data: {
        id: testConvId,
        userId: testUserId,
        title: "Test Quota Safety",
      },
    });
  }

  function createRequest(messageText: string) {
    return new Request(`http://localhost:3000/api/iris/conversation/${testConvId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_user: messageText }),
    });
  }

  it("Test 1 : utilisateur à 4/5 envoie un message de crise → réponse d'escalade, compteur reste à 4", async () => {
    await setupUserAndConversation(4);

    const req = createRequest("Je pense au suicide");
    const res = await POST(req, { params: Promise.resolve({ id: testConvId }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.safetyEscalation).toBe(true);
    expect(body.message_iris).toContain("3114");

    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { irisUsageCount: true },
    });
    // Le message de crise NE DOIT PAS avoir consommé le 5e message
    expect(updatedUser?.irisUsageCount).toBe(4);
  });

  it("Test 2 : utilisateur à 5/5 envoie un message de crise → réponse d'escalade, pas de 402", async () => {
    await setupUserAndConversation(5);

    const req = createRequest("C'est une crise d'angoisse majeure");
    const res = await POST(req, { params: Promise.resolve({ id: testConvId }) });

    // L'escalade d'urgence ne doit JAMAIS renvoyer 402
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.safetyEscalation).toBe(true);
    expect(body.message_iris).toContain("3114");
  });

  it("Test 3 : utilisateur à 5/5 envoie un message normal → 402", async () => {
    await setupUserAndConversation(5);

    const req = createRequest("Comment puis-je mieux communiquer avec mes collègues ?");
    const res = await POST(req, { params: Promise.resolve({ id: testConvId }) });

    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.error).toContain("Quota journalier atteint");
  });

  it("Test 4 : 20 requêtes concurrentes d'un utilisateur à 3/5 → jamais plus de 5 messages normaux acceptés", async () => {
    await setupUserAndConversation(3);

    const requests = Array.from({ length: 20 }, (_, i) =>
      POST(createRequest(`Message normal concurrent n°${i}`), {
        params: Promise.resolve({ id: testConvId }),
      })
    );

    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status);

    const count200 = statuses.filter((s) => s === 200).length;
    const count402 = statuses.filter((s) => s === 402).length;

    // L'utilisateur était à 3/5, donc au maximum 2 requêtes peuvent passer à 200 (pour atteindre 5)
    expect(count200).toBeLessThanOrEqual(2);
    expect(count200 + count402).toBe(20);

    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId },
      select: { irisUsageCount: true },
    });
    expect(updatedUser?.irisUsageCount).toBe(5);
  });
});
