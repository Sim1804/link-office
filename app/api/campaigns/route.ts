import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // On s'assure de récupérer l'organisation de l'utilisateur (ou en créer une si admin test)
    let user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

    let orgId = user.organizationId;
    if (!orgId) {
      // Pour la démo, on rattache l'utilisateur à l'organisation de test s'il n'en a pas
      let testOrg = await prisma.organization.findFirst({ where: { name: "Collectivité de Test" }});
      if (!testOrg) {
        testOrg = await prisma.organization.create({ data: { name: "Collectivité de Test", type: "COLLECTIVITE", codeAccess: "TEST-ORG" }});
      }
      await prisma.user.update({ where: { id: user.id }, data: { organizationId: testOrg.id }});
      orgId = testOrg.id;
    }

    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      orderBy: { startDate: "desc" },
      include: { _count: { select: { assessments: true } } }
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Erreur GET campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    let user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !user.organizationId) {
       return NextResponse.json({ error: "Aucune organisation associée" }, { status: 400 });
    }

    const data = await request.json();
    if (!data.title || !data.startDate || !data.endDate) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const newCampaign = await prisma.campaign.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetPopulation: data.targetPopulation ? parseInt(data.targetPopulation) : null,
        organizationId: user.organizationId,
        questionnaireConfig: {
          hiddenDemographics: [],
          allowedSituations: null // Sera géré dans /config
        }
      }
    });

    return NextResponse.json({ campaign: newCampaign });
  } catch (error) {
    console.error("Erreur POST campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
