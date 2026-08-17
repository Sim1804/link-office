import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { OrganizationType, UserRole } from "@prisma/client";
import { NextRequest } from "next/server";

function generateAccessCode(name: string) {
  return `${name.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const lead = await prisma.lead.findUnique({ where: { id: params.id } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    if (lead.status === "CONVERTED") return NextResponse.json({ error: "Lead already converted" }, { status: 400 });

    const body = await req.json();
    const offer = body.offer || "PREMIUM"; // PREMIUM or PREMIUM_PLUS

    let orgType: OrganizationType = "B2B";
    let userRole: UserRole = "ADMIN_B2B";

    if (lead.planType === "B2G_COLLECTIVITE") {
      orgType = "COLLECTIVITE";
      userRole = "ADMIN_COLLECTIVITE";
    } else if (lead.planType === "B2B2C_PARTENAIRE") {
      orgType = "B2B2C";
      userRole = "ADMIN_B2B2C";
    }

    const codeAccess = generateAccessCode(lead.organization);
    const tempPassword = `LinkOffice2026!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Organization
      const org = await tx.organization.create({
        data: {
          name: lead.organization,
          type: orgType,
          codeAccess,
        }
      });

      // 2. Create User (Admin)
      const user = await tx.user.create({
        data: {
          email: lead.email,
          password: hashedPassword,
          firstName: lead.contactName.split(" ")[0] || "Admin",
          lastName: lead.contactName.split(" ").slice(1).join(" ") || lead.organization,
          role: userRole,
          mustChangePassword: true,
          organizationId: org.id,
        }
      });

      // 3. Create Subscription
      const sub = await tx.subscription.create({
        data: {
          organizationId: org.id,
          status: "ACTIVE", // Or PENDING_PAYMENT if they still need to pay, but as a converted lead they signed the contract
          planType: lead.planType,
        }
      });

      // 4. Create Campaign
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year campaign by default

      const campaign = await tx.campaign.create({
        data: {
          organizationId: org.id,
          title: `Campagne Initiale - ${lead.organization}`,
          startDate,
          endDate,
          status: "ACTIVE",
          offer: offer,
          targetPopulation: parseInt(lead.beneficiaries || lead.companySize || lead.populationSize || "0", 10) || null,
        }
      });

      // 5. Update Lead Status
      await tx.lead.update({
        where: { id: lead.id },
        data: { status: "CONVERTED" }
      });

      return { org, user, campaign };
    });

    return NextResponse.json({
      success: true,
      organization: result.org.name,
      codeAccess: result.org.codeAccess,
      adminEmail: result.user.email,
      tempPassword: tempPassword,
      campaignOffer: result.campaign.offer
    });

  } catch (err: any) {
    console.error("Lead conversion error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
