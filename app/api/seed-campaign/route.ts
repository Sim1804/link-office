import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let org = await prisma.organization.findFirst({
      where: { name: "Collectivité de Test" }
    });

    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: "Collectivité de Test",
          type: "COLLECTIVITE",
          codeAccess: "TEST-ORG"
        }
      });
    }

    const campaign = await prisma.campaign.upsert({
      where: { codeAccess: "TEST-2026" },
      update: {},
      create: {
        organizationId: org.id,
        title: "Campagne de Test B2G",
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        codeAccess: "TEST-2026",
        questionnaireConfig: {
          hiddenDemographics: ["enfants", "habitation"],
          allowedSituations: ["Aidant", "Étudiant"]
        }
      }
    });

    return NextResponse.json({
      message: "✅ Campagne de test créée avec succès !",
      campaignId: campaign.id,
      codeAccess: campaign.codeAccess,
      configUrl: `/dashboard/collectivites/campaigns/${campaign.id}/config`
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur lors du seeding" }, { status: 500 });
  }
}
