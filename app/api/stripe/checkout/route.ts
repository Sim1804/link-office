import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { PRICING_PLANS } from "@/lib/pricing";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Si la clé secrète n'est pas définie (mode mock), on renvoie une URL simulée
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("Stripe mock mode: redirecting directly to success page and updating DB");
      
      const { prisma } = await import("@/lib/prisma");
      await prisma.user.update({
        where: { id: session.user.id },
        data: { subscription: "PREMIUM" }
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const successUrl = `${appUrl}/premium/success?mock=true`;
      return NextResponse.json({ url: `${appUrl}/mock-checkout?success_url=${encodeURIComponent(successUrl)}&amount=49,00` });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const plan = PRICING_PLANS.B2C_PREMIUM;

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: `${appUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/premium/cancel`,
      payment_method_types: ["card"],
      mode: "subscription", // Abonnement récurrent
      billing_address_collection: "auto",
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: plan.price!, // 999
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: session.user.id,
        plan: plan.id,
        tier: "PREMIUM",
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
