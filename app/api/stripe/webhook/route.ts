import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe Webhook Error: STRIPE_WEBHOOK_SECRET is not configured");
    return new NextResponse("Webhook secret is not configured", { status: 500 });
  }

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Vérification préalable d'idempotence
  const alreadyProcessed = await prisma.stripeEvent.findUnique({
    where: { id: event.id },
  });
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Insertion de l'identifiant AVANT le traitement dans la même transaction
      await tx.stripeEvent.create({
        data: {
          id: event.id,
          type: event.type,
          receivedAt: new Date(),
        },
      });

      // 2. Traitement selon le type d'événement
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        const organizationId = session.metadata?.organizationId;
        const plan = session.metadata?.plan;
        const subId = typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id;
        
        // B2C Premium / Premium+ upgrade
        if (userId && (plan === "B2C_PREMIUM" || plan === "B2C_PREMIUM_PLUS" || session.metadata?.tier)) {
          const targetTier = session.metadata?.tier === "PREMIUM_PLUS" || plan === "B2C_PREMIUM_PLUS"
            ? "PREMIUM_PLUS"
            : "PREMIUM";
          await tx.user.update({
            where: { id: userId },
            data: { subscription: targetTier as any }
          });
          
          // Update UserSubscription
          await tx.userSubscription.upsert({
            where: { userId },
            create: {
              id: userId + "_sub",
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subId,
              status: "ACTIVE",
              updatedAt: new Date(),
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subId,
              status: "ACTIVE",
              updatedAt: new Date(),
            }
          });
        }
        
        // B2B/B2G Subscription
        if (organizationId && (plan === "B2B_PARTNER")) {
          await tx.subscription.update({
            where: { organizationId },
            data: {
              status: "ACTIVE",
              stripeCustomerId: session.customer as string,
              updatedAt: new Date(),
            }
          });
        }
      } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        const subscriptionId = subscription.id;
        const userId = subscription.metadata?.userId;
        const organizationId = subscription.metadata?.organizationId;

        console.log(`[STRIPE_WEBHOOK] Processing subscription cancellation: sub=${subscriptionId}, customer=${customerId}, user=${userId}`);

        // Détermination de l'utilisateur à rétrograder
        let targetUserId = userId;
        if (!targetUserId && (subscriptionId || customerId)) {
          const userSub = await tx.userSubscription.findFirst({
            where: {
              OR: [
                ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
                ...(customerId ? [{ stripeCustomerId: customerId }] : []),
              ],
            },
          });
          if (userSub) {
            targetUserId = userSub.userId;
          }
        }

        if (targetUserId) {
          await tx.user.update({
            where: { id: targetUserId },
            data: { subscription: "FREEMIUM" },
          });
          await tx.userSubscription.updateMany({
            where: { userId: targetUserId },
            data: {
              status: "CANCELED",
              updatedAt: new Date(),
            },
          });
        }

        // Rétrogradation B2B / Organisation
        let targetOrgId = organizationId;
        if (!targetOrgId && customerId) {
          const orgSub = await tx.subscription.findFirst({
            where: { stripeCustomerId: customerId },
          });
          if (orgSub) {
            targetOrgId = orgSub.organizationId;
          }
        }

        if (targetOrgId) {
          await tx.subscription.updateMany({
            where: { organizationId: targetOrgId },
            data: {
              status: "CANCELED",
              planType: "FREE",
              updatedAt: new Date(),
            },
          });
          await tx.campaign.updateMany({
            where: { organizationId: targetOrgId, status: "ACTIVE" },
            data: { status: "CLOSED" },
          });
        }
      } else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        const rawSub = (invoice as any).subscription;
        const subscriptionId = typeof rawSub === "string" ? rawSub : rawSub?.id;
        const userId = invoice.metadata?.userId;
        const organizationId = invoice.metadata?.organizationId;

        // Journalisation
        console.warn(`[STRIPE_WEBHOOK] Payment failed for invoice ${invoice.id}, customer: ${customerId}, sub: ${subscriptionId}`);

        // Marquage PAST_DUE sans rétrogradation immédiate du compte
        if (userId) {
          await tx.userSubscription.updateMany({
            where: { userId },
            data: { status: "PAST_DUE", updatedAt: new Date() },
          });
        } else if (subscriptionId || customerId) {
          await tx.userSubscription.updateMany({
            where: {
              OR: [
                ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
                ...(customerId ? [{ stripeCustomerId: customerId }] : []),
              ],
            },
            data: { status: "PAST_DUE", updatedAt: new Date() },
          });
        }

        if (organizationId) {
          await tx.subscription.updateMany({
            where: { organizationId },
            data: { status: "PAST_DUE", updatedAt: new Date() },
          });
        } else if (customerId) {
          await tx.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "PAST_DUE", updatedAt: new Date() },
          });
        }
      }
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    const isStripeEventDuplicate =
      error?.code === "P2002" &&
      (error?.meta?.modelName === "StripeEvent" ||
        (Array.isArray(error?.meta?.target) && error?.meta?.target.includes("id")) ||
        String(error?.message).includes("StripeEvent"));

    if (isStripeEventDuplicate) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }
    console.error("[WEBHOOK_HANDLER_ERROR]", error);
    return new NextResponse("Webhook Handler Error", { status: 500 });
  }
}
