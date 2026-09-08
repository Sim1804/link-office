import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const userId = session.user.id;

    // 1. Fetch the latest submitted assessment for this user
    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId, status: "SUBMITTED" },
      orderBy: { submittedAt: "desc" },
      include: { demographic: true, campaign: true }
    });

    if (!latestAssessment || !latestAssessment.demographic) {
      return NextResponse.json({ error: "Aucun profil précédent trouvé" }, { status: 400 });
    }

    const { demographic, campaign } = latestAssessment;

    let newCampaignId = latestAssessment.campaignId;
    if (campaign) {
      const isExpired = new Date() > new Date(campaign.endDate);
      if (campaign.status === "CLOSED" || campaign.status === "RENOUVELEE" || isExpired) {
        newCampaignId = null;
      }
    }

    // 2. Create a new Assessment in DRAFT status
    const newAssessment = await prisma.assessment.create({
      data: {
        userId,
        campaignId: newCampaignId,
        status: "DRAFT",
        demographic: {
          create: {
            gender: demographic.gender,
            ageRange: demographic.ageRange,
            country: demographic.country,
            department: demographic.department,
            occupation: demographic.occupation,
            organizationSize: demographic.organizationSize,
            relationshipStatus: demographic.relationshipStatus,
            children: demographic.children,
            childrenCount: demographic.childrenCount,
            livingSituation: demographic.livingSituation,
            livingSituationOther: demographic.livingSituationOther,
            selectedSituations: demographic.selectedSituations,
            primarySituation: demographic.primarySituation,
          }
        }
      }
    });

    return NextResponse.json({ success: true, assessmentId: newAssessment.id });
  } catch (error: any) {
    console.error("[DEMOGRAPHICS_RENEW]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
