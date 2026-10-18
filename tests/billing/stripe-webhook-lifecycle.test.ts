import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { POST } from "../../app/api/stripe/webhook/route";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const TEST_SECRET = "whsec_test_mock_secret_for_unit_tests";

describe("C5 — Webhook Stripe : Idempotence et cycle de vie", () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = TEST_SECRET;
  });

  afterAll(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  function createSignedRequest(eventPayload: object, invalidSig = false) {
    const rawPayload = JSON.stringify(eventPayload);
    const signature = invalidSig
      ? "t=12345678,v1=invalidsignaturebadbadbad"
      : stripe.webhooks.generateTestHeaderString({
          payload: rawPayload,
          secret: TEST_SECRET,
        });

    return new Request("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      headers: {
        "stripe-signature": signature,
        "content-type": "application/json",
      },
      body: rawPayload,
    });
  }

  it("1. Rejette une requête avec signature invalide (HTTP 400)", async () => {
    const fakeEvent = {
      id: "evt_invalid_sig_test",
      type: "checkout.session.completed",
      data: { object: {} },
    };

    const req = createSignedRequest(fakeEvent, true);
    const res = await POST(req);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("Webhook Error");
  });

  it("2. Idempotence : un événement dupliqué ne produit qu'un seul effet et renvoie { received: true, duplicate: true }", async () => {
    const testUserId = "c5_test_user_idempotence_" + Date.now();
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `c5_test_${Date.now()}@example.com`,
        firstName: "Idem",
        lastName: "Potence",
        subscription: "FREEMIUM",
      },
    });

    const eventId = "evt_dup_" + Date.now();
    const eventPayload = {
      id: eventId,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_" + Date.now(),
          customer: "cus_idem_" + Date.now(),
          metadata: {
            userId: testUserId,
            plan: "B2C_PREMIUM",
          },
        },
      },
    };

    // Premier envoi : traité
    const req1 = createSignedRequest(eventPayload);
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);
    const json1 = await res1.json();
    expect(json1.received).toBe(true);
    expect(json1.duplicate).toBeUndefined();

    // Utilisateur passé à PREMIUM
    const userAfterFirst = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(userAfterFirst?.subscription).toBe("PREMIUM");

    // Second envoi avec le même event.id : doit être reconnu comme duplicate
    const req2 = createSignedRequest(eventPayload);
    const res2 = await POST(req2);
    expect(res2.status).toBe(200);
    const json2 = await res2.json();
    expect(json2.received).toBe(true);
    expect(json2.duplicate).toBe(true);

    // Nettoyage
    await prisma.userSubscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    if ((prisma as any).stripeEvent) {
      await (prisma as any).stripeEvent.deleteMany({ where: { id: eventId } });
    }
  });

  it("3. Cycle de vie : customer.subscription.deleted rétrograde le compte à FREEMIUM", async () => {
    const testUserId = "c5_test_user_cancel_" + Date.now();
    const testCustId = "cus_cancel_" + Date.now();
    const testSubId = "sub_cancel_" + Date.now();

    await prisma.user.create({
      data: {
        id: testUserId,
        email: `c5_cancel_${Date.now()}@example.com`,
        firstName: "Alice",
        lastName: "Cancel",
        subscription: "PREMIUM",
      },
    });

    await prisma.userSubscription.create({
      data: {
        id: testUserId + "_sub",
        userId: testUserId,
        stripeCustomerId: testCustId,
        stripeSubscriptionId: testSubId,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    const eventId = "evt_sub_del_" + Date.now();
    const eventPayload = {
      id: eventId,
      object: "event",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: testSubId,
          customer: testCustId,
          metadata: {
            userId: testUserId,
          },
        },
      },
    };

    const req = createSignedRequest(eventPayload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const userAfterCancel = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(userAfterCancel?.subscription).toBe("FREEMIUM");

    const userSubAfterCancel = await prisma.userSubscription.findUnique({ where: { userId: testUserId } });
    expect(userSubAfterCancel?.status).toBe("CANCELED");

    // Nettoyage
    await prisma.userSubscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    if ((prisma as any).stripeEvent) {
      await (prisma as any).stripeEvent.deleteMany({ where: { id: eventId } });
    }
  });

  it("4. Cycle de vie : invoice.payment_failed passe le statut à PAST_DUE sans rétrograder immédiatement", async () => {
    const testUserId = "c5_test_user_fail_" + Date.now();
    const testCustId = "cus_fail_" + Date.now();
    const testSubId = "sub_fail_" + Date.now();

    await prisma.user.create({
      data: {
        id: testUserId,
        email: `c5_fail_${Date.now()}@example.com`,
        firstName: "Bob",
        lastName: "FailedInvoice",
        subscription: "PREMIUM_PLUS",
      },
    });

    await prisma.userSubscription.create({
      data: {
        id: testUserId + "_sub",
        userId: testUserId,
        stripeCustomerId: testCustId,
        stripeSubscriptionId: testSubId,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    const eventId = "evt_inv_fail_" + Date.now();
    const eventPayload = {
      id: eventId,
      object: "event",
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "in_test_fail_" + Date.now(),
          customer: testCustId,
          subscription: testSubId,
          metadata: {
            userId: testUserId,
          },
        },
      },
    };

    const req = createSignedRequest(eventPayload);
    const res = await POST(req);
    expect(res.status).toBe(200);

    // Ne doit PAS rétrograder immédiatement : User reste PREMIUM_PLUS
    const userAfterFail = await prisma.user.findUnique({ where: { id: testUserId } });
    expect(userAfterFail?.subscription).toBe("PREMIUM_PLUS");

    // Marquage : UserSubscription passe à PAST_DUE
    const userSubAfterFail = await prisma.userSubscription.findUnique({ where: { userId: testUserId } });
    expect(userSubAfterFail?.status).toBe("PAST_DUE");

    // Nettoyage
    await prisma.userSubscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    if ((prisma as any).stripeEvent) {
      await (prisma as any).stripeEvent.deleteMany({ where: { id: eventId } });
    }
  });
});
