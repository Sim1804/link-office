import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Fetch all users with their organizations and campaigns (exclut formellement password et twoFactorSecret)
    const [users, organizations, campaigns] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          subscription: true,
          createdAt: true,
          organizationId: true,
          campaignId: true,
          isTwoFactorEnabled: true,
          mustChangePassword: true,
          organization: { select: { id: true, name: true, type: true } },
          campaign: { select: { id: true, title: true } },
          _count: { select: { assessments: true } },
        }
      }),
      prisma.organization.findMany({
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" }
      }),
      prisma.campaign.findMany({
        select: { id: true, title: true, organizationId: true },
        orderBy: { title: "asc" }
      })
    ]);

    return NextResponse.json({ users, organizations, campaigns });
  } catch (error) {
    console.error("GET /api/superadmin/users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
