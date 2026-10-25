import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PRICING_PLANS } from "@/lib/pricing";
import { OrganizationType, UserRole } from "@prisma/client";
import { checkDistributedRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIP =
      (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = await checkDistributedRateLimit(`biz_register:${clientIP}`, { limit: 5, windowMs: 60_000 });
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Trop de tentatives. Veuillez patienter avant de réessayer." }, { status: 429 });
    }

    const { orgName, email, password, plan } = await req.json();

    if (!orgName || !email || !password || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Le mot de passe doit comporter au moins 8 caractères." }, { status: 400 });
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

    // Generate unique code access with high cryptographic entropy (8 hex chars = 4 billion combinations)
    const slug = (orgName.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') || "ORGA").padEnd(4, 'X');
    const randomSuffix = crypto.randomBytes(4).toString("hex").toUpperCase();
    const codeAccess = `${slug}-${randomSuffix}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine type and role
    let orgType: OrganizationType = "B2B";
    let userRole: UserRole = "ADMIN_B2B";
    
    if (selectedPlan.id === "B2G") {
      orgType = "B2G";
      userRole = "ADMIN_B2G";
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
                unit_amount: (selectedPlan as any).monthly?.price || 0,
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
        checkoutUrl = `${appUrl}/mock-checkout?success_url=${encodeURIComponent(successUrl)}&amount=${(selectedPlan as any).monthly?.price || "0"}`;
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
