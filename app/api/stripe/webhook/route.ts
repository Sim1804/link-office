import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature) throw new Error("Missing stripe-signature");
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("Missing STRIPE_WEBHOOK_SECRET, parsing without verification");
      event = JSON.parse(payload) as Stripe.Event;
    } else {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const organizationId = session.metadata?.organizationId;
      const plan = session.metadata?.plan;
      
      // B2C Premium upgrade
      if (userId && plan === "B2C_PREMIUM") {
        await prisma.user.update({
          where: { id: userId },
          data: { subscription: "PREMIUM" }
        });
        
        // Update UserSubscription
        await prisma.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            status: "ACTIVE",
          },
          update: {
            stripeCustomerId: session.customer as string,
            status: "ACTIVE",
          }
        });
      }
      
      // B2B/B2G Subscription
      if (organizationId && (plan === "B2B_MEDECIN" || plan === "B2B_PSY" || plan === "B2B_PARTNER")) {
        await prisma.subscription.update({
          where: { organizationId },
          data: {
            status: "ACTIVE",
            stripeCustomerId: session.customer as string,
          }
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK_HANDLER_ERROR]", error);
    return new NextResponse("Webhook Handler Error", { status: 500 });
  }
}
