import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PRICING_PLANS } from "@/lib/pricing";
import { OrganizationType, UserRole } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { orgName, email, password, plan } = await req.json();

    if (!orgName || !email || !password || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Identify plan
    const selectedPlan = Object.values(PRICING_PLANS).find(p => p.id === plan);
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Generate unique code access
    const slug = orgName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const codeAccess = `${slug}-${randomCode}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine type and role
    let orgType: OrganizationType = "B2B";
    let userRole: UserRole = "ADMIN_B2B";
    
    if (selectedPlan.id === "B2G_COLLECTIVITE") {
      orgType = "COLLECTIVITE";
      userRole = "ADMIN_COLLECTIVITE";
    } else if (selectedPlan.id === "B2B2C_PARTENAIRE") {
      orgType = "B2B2C";
      userRole = "ADMIN_B2B2C";
    }

    // Transaction to create Org + User + Subscription
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          type: orgType,
          codeAccess,
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: "Admin",
          lastName: orgName,
          role: userRole,
          organizationId: org.id,
        }
      });

      const sub = await tx.subscription.create({
        data: {
          organizationId: org.id,
          status: (selectedPlan as any).custom ? "PENDING_QUOTE" : "PENDING_PAYMENT", 
          stripePriceId: (selectedPlan as any).stripePriceId || null,
          planType: selectedPlan.id,
        }
      });

      return { org, user, sub };
    });

    let checkoutUrl = null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!(selectedPlan as any).custom) {
      if (process.env.STRIPE_SECRET_KEY) {
        const stripe = (await import("@/lib/stripe")).stripe;
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${appUrl}/auth/login?registered=business&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/business`,
          payment_method_types: ["card"],
          mode: "subscription",
          customer_email: email,
          line_items: [
            {
              price_data: {
                currency: (selectedPlan as any).currency,
                product_data: {
                  name: selectedPlan.name,
                  description: selectedPlan.description,
                },
                unit_amount: selectedPlan.price!,
                recurring: {
                  interval: "month",
                },
              },
              quantity: 1,
            },
          ],
          metadata: {
            organizationId: result.org.id,
            plan: selectedPlan.id,
          },
        });
        checkoutUrl = stripeSession.url;
      } else {
        // Mock Stripe checkout
        console.warn("Stripe mock mode: redirecting directly to login page and updating DB");
        
        await prisma.subscription.update({
          where: { organizationId: result.org.id },
          data: { status: "ACTIVE" }
        });

        const successUrl = `${appUrl}/auth/login?registered=business&mock=true`;
        checkoutUrl = `${appUrl}/mock-checkout?success_url=${encodeURIComponent(successUrl)}&amount=${selectedPlan.price || "0"}`;
      }
    } else {
        // Mode devis (custom) -> on redirige juste vers le login
        checkoutUrl = `${appUrl}/auth/login?registered=quote`;
    }

    return NextResponse.json({ 
      success: true, 
      organization: result.org,
      message: "Organization and admin created successfully",
      checkoutUrl: checkoutUrl
    });

  } catch (error: any) {
    console.error("B2B Register Error:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Une organisation avec ces identifiants existe déjà." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
