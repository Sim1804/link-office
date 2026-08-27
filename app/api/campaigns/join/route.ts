import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { codeAccess } = await request.json();
    if (!codeAccess) {
      return NextResponse.json({ error: "Code manquant" }, { status: 400 });
    }

    // Rechercher l'organisation correspondant au code d'accès
    const org = await prisma.organization.findUnique({
      where: { codeAccess }
    });

    if (!org) {
      return NextResponse.json({ error: "Code d'accès invalide ou expiré" }, { status: 404 });
    }

    // Trouver la campagne active (ou planifiée) pour cette organisation
    const campaign = await prisma.campaign.findFirst({
      where: { 
        organizationId: org.id,
        status: { in: ["ACTIVE", "PLANIFIEE"] }
      },
      orderBy: { startDate: "desc" }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Aucune campagne active pour ce code d'accès" }, { status: 404 });
    }

    // Rattacher le user (et son dernier assessment) à cette campagne
    let assessment = await prisma.assessment.findFirst({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" }
    });

    if (!assessment) {
      assessment = await prisma.assessment.create({
        data: { userId: session.user.id, status: "DRAFT", campaignId: campaign.id }
      });
    } else {
      await prisma.assessment.update({
        where: { id: assessment.id },
        data: { campaignId: campaign.id }
      });
    }

    // Mettre à jour le rattachement direct de l'utilisateur
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        campaignId: campaign.id,
        organizationId: org.id,
        subscription: campaign.offer as any // Cast for TS, should match SubscriptionTier enum
      }
    });

    // Mettre à jour le statut de l'invitation si elle existe (passe à ACTIVATED)
    if (session.user.email) {
      const invite = await prisma.campaignInvite.findUnique({
        where: { campaignId_email: { campaignId: campaign.id, email: session.user.email } }
      });
      if (invite && invite.status === "INVITED") {
        await prisma.campaignInvite.update({
          where: { campaignId_email: { campaignId: campaign.id, email: session.user.email } },
          data: { status: "ACTIVATED" }
        });
      }
    }

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
