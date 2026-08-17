import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    // On récupère aussi la liste des modules adaptatifs pour les situations possibles
    const adaptiveModules = await prisma.adaptiveModule.findMany({
      select: { triggerSituation: true, title: true }
    });

    return NextResponse.json({
      campaign,
      availableSituations: adaptiveModules.map((m: { triggerSituation: string }) => m.triggerSituation)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    
    // Si l'utilisateur passe un nouveau code d'accès, on le met à jour
    const updateData: any = {
      questionnaireConfig: data.questionnaireConfig
    };
    
    if (data.codeAccess !== undefined) {
      updateData.codeAccess = data.codeAccess || null;
    }

    const campaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
