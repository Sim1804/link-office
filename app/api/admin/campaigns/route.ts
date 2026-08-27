import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const data = await request.json();
    if (!data.title || !data.startDate || !data.endDate || !data.organizationId) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const offer = data.offer ?? "PREMIUM";
    if (!["PREMIUM", "PREMIUM_PLUS"].includes(offer)) {
      return NextResponse.json({ error: "Offre invalide" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title: data.title,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        targetPopulation: data.targetPopulation ? parseInt(data.targetPopulation) : null,
        offer,
        status: "PLANIFIEE",
        organizationId: data.organizationId,
        questionnaireConfig: { hiddenDemographics: [], allowedSituations: null },
      },
    });

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/campaigns:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}
