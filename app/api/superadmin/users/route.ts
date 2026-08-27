import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Fetch all users with their organizations and campaigns
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        organization: { select: { name: true, type: true } },
        campaign: { select: { title: true } },
        _count: { select: { assessments: true } },
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/superadmin/users:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
