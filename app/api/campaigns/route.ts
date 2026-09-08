/**
 * app/api/campaigns/route.ts
 * GET  — Liste les campagnes de l organisation
 * POST — Cree une nouvelle campagne (ADMIN_B2B / SUPER_ADMIN uniquement)
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const GET_ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];
const POST_ALLOWED_ROLES = ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!GET_ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) return NextResponse.json({ error: "Aucune organisation associee" }, { status: 400 });

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { startDate: "desc" },
      include: {
        _count: { select: { assessments: true, users: true, invites: true } },
        snapshot: { select: { createdAt: true } },
      },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("GET /api/campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!POST_ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.organizationId) return NextResponse.json({ error: "Aucune organisation associee" }, { status: 400 });

    const data = await request.json();
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Champs manquants: title, startDate, endDate" }, { status: 400 });
    }

    const offer = data.offer ?? "PREMIUM";
    if (!["PREMIUM", "PREMIUM_PLUS"].includes(offer)) {
      return NextResponse.json({ error: "Offre invalide. Choisissez PREMIUM ou PREMIUM_PLUS." }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetPopulation: data.targetPopulation ? parseInt(data.targetPopulation) : null,
        offer,
        status: data.status ?? "DRAFT",
        organizationId: user.organizationId,
        parentCampaignId: data.parentCampaignId ?? null,
        questionnaireConfig: { hiddenDemographics: [], allowedSituations: null },
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}
