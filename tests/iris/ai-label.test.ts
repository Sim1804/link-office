import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import { POST } from "../../app/api/iris/conversation/[id]/message/route";

// Mock de l'authentification
let currentUserId = "test_ai_label_user";
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => ({
    user: { id: currentUserId, email: "ai-label@test.com", role: "EMPLOYEE" },
  })),
}));

// Mock rate limiting
vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({ success: true })),
  getDistributedRetryAfterSeconds: vi.fn(async () => 0),
}));

describe("C8 — Étiquette d'origine IA sur chaque message (T7.4)", () => {
  const testSuffix = Date.now();
  currentUserId = `c8_user_${testSuffix}`;
  const conversationId = `c8_conv_${testSuffix}`;

  beforeEach(() => {
    // nothing special
  });

  afterAll(async () => {
    await prisma.irisMessage.deleteMany({ where: { conversationId } });
    await prisma.irisConversation.deleteMany({ where: { id: conversationId } });
    await prisma.user.deleteMany({ where: { id: currentUserId } });
  });

  it("1. Après un échange normal, la base contient aiGenerated=true pour le message assistant et false pour l'utilisateur", async () => {
    await prisma.user.create({
      data: {
        id: currentUserId,
        email: `c8_${testSuffix}@example.com`,
        firstName: "AI",
        lastName: "Label",
        subscription: "PREMIUM",
      },
    });

    await prisma.irisConversation.create({
      data: {
        id: conversationId,
        userId: currentUserId,
        title: "Test AI Label",
      },
    });

    const req = new Request(`http://localhost:3000/api/iris/conversation/${conversationId}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message_user: "Comment fonctionne le coaching IA IRIS ?" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: conversationId }) });
    expect(res.status).toBe(200);

    const messages = await prisma.irisMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    expect(messages.length).toBe(2);

    const userMsg = messages.find((m) => m.role === "user");
    const assistantMsg = messages.find((m) => m.role === "assistant");

    expect(userMsg).toBeDefined();
    expect((userMsg as any).aiGenerated).toBe(false);

    expect(assistantMsg).toBeDefined();
    expect((assistantMsg as any).aiGenerated).toBe(true);
  });

  it("2. Pour un message d'escalade d'urgence, le message assistant en base contient aussi aiGenerated=true", async () => {
    const crisisConvId = `c8_crisis_conv_${testSuffix}`;
    await prisma.irisConversation.create({
      data: {
        id: crisisConvId,
        userId: currentUserId,
        title: "Crise",
      },
    });

    const req = new Request(`http://localhost:3000/api/iris/conversation/${crisisConvId}/message`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message_user: "j'ai des idees noires envie d'en finir" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: crisisConvId }) });
    expect(res.status).toBe(200);

    const messages = await prisma.irisMessage.findMany({
      where: { conversationId: crisisConvId },
      orderBy: { createdAt: "asc" },
    });

    const assistantMsg = messages.find((m) => m.role === "assistant");
    expect(assistantMsg).toBeDefined();
    expect((assistantMsg as any).aiGenerated).toBe(true);

    await prisma.irisMessage.deleteMany({ where: { conversationId: crisisConvId } });
    await prisma.irisConversation.deleteMany({ where: { id: crisisConvId } });
  });

  it("3. Le composant IrisWidget contient la mention 'Généré par IA' pour les bulles assistant", async () => {
    const fs = await import("fs");
    const widgetContent = fs.readFileSync("src/components/iris/IrisWidget.tsx", "utf-8");
    expect(widgetContent).toContain("Généré par IA");
  });
});
