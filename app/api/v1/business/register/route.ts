import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { orgName, email, password, plan } = await req.json();

    if (!orgName || !email || !password || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Transaction to create Org + User + Subscription
    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          type: "B2B", // Defaulting to B2B
          codeAccess,
        }
      });

      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: "Admin",
          lastName: orgName,
          role: "ADMIN_B2B",
          organizationId: org.id,
        }
      });

      const sub = await tx.subscription.create({
        data: {
          organizationId: org.id,
          status: plan === "premium" ? "PENDING_QUOTE" : "ACTIVE", // ACTIVE mocked for standard
          stripePriceId: plan === "standard" ? "price_standard" : "price_premium",
        }
      });

      return { org, user, sub };
    });

    // In a real app, we would create a Stripe Checkout Session here and return its URL
    // For now, we mock the success.
    return NextResponse.json({ 
      success: true, 
      organization: result.org,
      message: "Organization and admin created successfully" 
      // checkoutUrl: "https://checkout.stripe.com/c/pay/..."
    });

  } catch (error: any) {
    console.error("B2B Register Error:", error);
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Une organisation avec ces identifiants existe déjà." }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
