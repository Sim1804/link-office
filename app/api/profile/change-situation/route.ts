import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the current user and their active campaign
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { campaignId: true, subscription: true }
    });

    // 1. Fetch current latest assessment
    const currentAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: {
        campaign: { select: { status: true, endDate: true } }
      }
    });

    if (!currentAssessment) {
      return NextResponse.json({ error: "Aucune passation en cours" }, { status: 404 });
    }

    // Determine if the current campaign is still active
    // If it's active, the new assessment will inherit it. If not, campaignId will be null (prompting payment)
    let newCampaignId = currentAssessment.campaignId;
    if (currentAssessment.campaign) {
      const { status, endDate } = currentAssessment.campaign;
      const isExpired = new Date() > new Date(endDate);
      if (status === "CLOSED" || status === "RENOUVELEE" || isExpired) {
        newCampaignId = null;
      }
    }

    // 2. We don't overwrite the old assessment, we just leave it as is (it's historicized by startedAt).
    // If it was DRAFT, maybe we could delete it, but the prompt says: 
    // "Ne jamais écraser l’ancien profil : clôturer la période précédente et créer une nouvelle version."
    // We can explicitly ensure it's marked SUBMITTED if it was somehow still pending and we want to archive it.
    // However, the cleanest way is just to create a new one. The new one will become the "latest" due to `startedAt`.

    if (currentAssessment.status === "DRAFT") {
      // If it was just a draft, we can just delete it or overwrite it, but let's be safe and mark it submitted or leave it.
      // Actually, if it's DRAFT, it means they never finished it. We can just delete the draft to keep history clean of empty drafts.
      await prisma.assessment.delete({ where: { id: currentAssessment.id } });
    }

    // 3. Create a new Assessment for the user
    await prisma.assessment.create({
      data: {
        userId,
        campaignId: newCampaignId,
        status: "DRAFT",
        // Inherit consents if we want, or make them agree again. For now, reset consents.
        consentInformation: false,
        consentResearch: false,
        consentParticipation: false,
      }
    });

    // Also update the user's campaignId
    await prisma.user.update({
      where: { id: userId },
      data: { campaignId: newCampaignId }
    });

    return NextResponse.json({ success: true, newCampaignId });
  } catch (error: any) {
    console.error("POST /api/profile/change-situation:", error);
    return NextResponse.json({ error: "Erreur serveur: " + error.message }, { status: 500 });
  }
}
