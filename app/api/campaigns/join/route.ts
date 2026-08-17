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

    const campaign = await prisma.campaign.findUnique({
      where: { codeAccess }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Code d'accès invalide ou expiré" }, { status: 404 });
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

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
