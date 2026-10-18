import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

const {
  mockGenerateResponse,
  mockStreamResponse,
  mockSafetyCascaded,
  getMockUserId,
  setMockUserId,
} = vi.hoisted(() => {
  let uid = "test-user-v6";
  return {
    getMockUserId: () => uid,
    setMockUserId: (id: string) => { uid = id; },
    mockSafetyCascaded: vi.fn(async (content: string) => {
      if (content.toLowerCase().includes("suicider") || content.toLowerCase().includes("crise")) {
        return {
          safe: false,
          category: "CRISIS",
          escalationResponse: "En cas d'urgence, composez le 3114 ou le 15.",
          matchedPattern: "REGEX_CRISIS",
          failSafe: false,
        };
      }
      return { safe: true };
    }),
    mockGenerateResponse: vi.fn(async () => ({
      content: "Réponse simulée",
      degraded: false,
      latencyMs: 10,
      model: "mock-model",
    })),
    mockStreamResponse: vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 200));
      return {
        textStream: new ReadableStream({
          start(controller) {
            controller.enqueue("Bonjour ! ");
            controller.enqueue("Comment puis-je vous aider ?");
            controller.close();
          },
        }),
      };
    }),
  };
});

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: getMockUserId(), email: `${getMockUserId()}@test.local`, role: "EMPLOYEE" },
  })),
}));

vi.mock("@/lib/iris/safety", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/iris/safety")>();
  return {
    ...actual,
    evaluateInputSafetyCascaded: mockSafetyCascaded,
  };
});

vi.mock("@/lib/iris/llm", () => ({
  generateResponse: mockGenerateResponse,
  streamResponse: mockStreamResponse,
}));

import { POST } from "../../app/api/iris/conversation/[id]/message/route";
import { prisma } from "@/lib/prisma";

describe("V6 — Premier token : chargement en parallèle, sans spéculation", () => {
  const testUserId = `user-v6-${Date.now()}`;
  const testConvId = `conv-v6-${Date.now()}`;
  const origKey = process.env.GROQ_API_KEY;

  beforeAll(async () => {
    process.env.GROQ_API_KEY = "gsk_mock_test_key_for_unit_tests";
    setMockUserId(testUserId);

    await prisma.user.upsert({
      where: { id: testUserId },
      create: {
        id: testUserId,
        email: `${testUserId}@test.local`,
        firstName: "Test",
        lastName: "V6",
        subscription: "PREMIUM",
      },
      update: {},
    });

    await prisma.irisConversation.upsert({
      where: { id: testConvId },
      create: {
        id: testConvId,
        userId: testUserId,
        title: "Test V6",
      },
      update: {},
    });
  });

  afterAll(async () => {
    if (origKey) process.env.GROQ_API_KEY = origKey;
    else delete process.env.GROQ_API_KEY;
    await prisma.irisMessage.deleteMany({ where: { conversationId: testConvId } });
    await prisma.irisConversation.deleteMany({ where: { id: testConvId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it("Test 1 : Un message de crise ne déclenche aucun appel au modèle de génération (espion)", async () => {
    mockGenerateResponse.mockClear();
    mockStreamResponse.mockClear();

    const req = new Request(`http://localhost:3000/api/iris/conversation/${testConvId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message_user: "Je veux me suicider, tout est fini." }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: testConvId }) });
    const data = await res.json();

    // 1. L'escalade d'urgence doit être déclenchée
    expect(res.status).toBe(200);
    expect(data.safetyEscalation).toBe(true);
    expect(data.category).toBe("CRISIS");
    expect(data.message_iris).toContain("3114");

    // 2. Le modèle de génération ne doit JAMAIS avoir été appelé (aucun token spéculatif)
    expect(mockGenerateResponse).not.toHaveBeenCalled();
    expect(mockStreamResponse).not.toHaveBeenCalled();
  });

  it("Test 2 : Un message sûr produit le même premier token qu'avant (fournisseur simulé à 200ms)", async () => {
    mockGenerateResponse.mockClear();
    mockStreamResponse.mockClear();

    const req = new Request(`http://localhost:3000/api/iris/conversation/${testConvId}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ message_user: "Comment puis-je améliorer ma communication en réunion ?" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: testConvId }) });
    expect(res.status).toBe(200);

    const reader = res.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    const firstChunk = await reader!.read();
    expect(firstChunk.done).toBe(false);

    const firstTokenText = decoder.decode(firstChunk.value);
    // Doit contenir le premier token émis
    expect(firstTokenText).toContain("Bonjour ! ");
    expect(mockStreamResponse).toHaveBeenCalledTimes(1);
  });
});
