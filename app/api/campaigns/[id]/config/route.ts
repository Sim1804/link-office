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
    
    const updateData: any = {};
    if (data.questionnaireConfig !== undefined) {
      updateData.questionnaireConfig = data.questionnaireConfig;
    }
    
    if (data.codeAccess !== undefined) {
      updateData.codeAccess = data.codeAccess || null;
    }

    let campaign;
    if (Object.keys(updateData).length > 0) {
      campaign = await prisma.campaign.update({
        where: { id: params.id },
        data: updateData
      });
    } else {
      campaign = await prisma.campaign.findUnique({ where: { id: params.id } });
    }

    if (data.variable) {
      await prisma.campaignVariable.upsert({
        where: { id: `${params.id}_${data.variable.id}` },
        update: {
          question: data.variable.question,
          options: data.variable.options || [],
          required: data.variable.required || false,
        },
        create: {
          id: `${params.id}_${data.variable.id}`, // Ensure unique ID
          campaignId: params.id,
          question: data.variable.question,
          options: data.variable.options || [],
          required: data.variable.required || false,
        }
      });
    }

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}
