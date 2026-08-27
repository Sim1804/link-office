import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/campaigns/[id]/renew
// Cree une nouvelle campagne liee a l ancienne (renouvellement)
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const parent = await prisma.campaign.findUnique({ where: { id } });
    if (!parent) return NextResponse.json({ error: "Campagne parente introuvable" }, { status: 404 });
    if (parent.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const data = await req.json();
    if (!data.title || !data.startDate || !data.endDate || !data.offer) {
      return NextResponse.json({ error: "Champs manquants: title, startDate, endDate, offer" }, { status: 400 });
    }
    if (!["PREMIUM", "PREMIUM_PLUS"].includes(data.offer)) {
      return NextResponse.json({ error: "Offre invalide" }, { status: 400 });
    }

    // Archiver la campagne parente si encore active
    if (["ACTIVE", "EN_CLOTURE"].includes(parent.status)) {
      await prisma.campaign.update({ where: { id }, data: { status: "RENOUVELEE" } });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        offer: data.offer,
        status: "DRAFT",
        organizationId: parent.organizationId,
        parentCampaignId: id,
        targetPopulation: data.targetPopulation ? parseInt(data.targetPopulation) : parent.targetPopulation,
        questionnaireConfig: parent.questionnaireConfig ?? { hiddenDemographics: [], allowedSituations: null },
      },
    });

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (e) {
    console.error("POST /campaigns/[id]/renew:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}