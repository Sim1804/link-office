import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        organization: { select: { name: true, type: true } },
        CampaignVariable: true,
        snapshot: true,
        _count: { select: { assessments: true, users: true, invites: true } },
        parentCampaign: { select: { id: true, title: true, offer: true } },
        childCampaigns: { select: { id: true, title: true, offer: true, status: true, startDate: true } },
      },
    });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    if (campaign.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
    const completedCount = await prisma.assessment.count({ where: { campaignId: id, status: "SUBMITTED" } });
    const startedCount   = await prisma.assessment.count({ where: { campaignId: id } });
    const activatedCount = await prisma.campaignInvite.count({ where: { campaignId: id, status: { in: ["ACTIVATED", "STARTED", "COMPLETED"] } } });
    const invitedCount   = await prisma.campaignInvite.count({ where: { campaignId: id } });
    return NextResponse.json({
      campaign,
      participation: {
        invited: invitedCount, activated: activatedCount, started: startedCount, completed: completedCount,
        completionRate: invitedCount > 0 ? Math.round((completedCount / invitedCount) * 100) : 0,
        activationRate: invitedCount > 0 ? Math.round((activatedCount / invitedCount) * 100) : 0,
      },
    });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    if (campaign.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
    const data = await req.json();
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(data.title            !== undefined && { title: data.title }),
        ...(data.description      !== undefined && { description: data.description }),
        ...(data.startDate        !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate          !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.status           !== undefined && { status: data.status }),
        ...(data.targetPopulation !== undefined && { targetPopulation: parseInt(data.targetPopulation) }),
        ...(data.questionnaireConfig !== undefined && { questionnaireConfig: data.questionnaireConfig }),
      },
    });
    return NextResponse.json({ campaign: updated });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Erreur serveur" }, { status: 500 }); }
}