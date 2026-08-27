import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Example function to calculate stats, same logic as /api/b2b/stats
async function calculateCampaignStats(campaignId: string) {
  const stats = { respondentCount: 0, averages: {} };
  // A simplified placeholder. In reality, we could just fetch the same logic 
  // from a shared service, or just let the B2B dashboard compute on the fly if snapshot is empty.
  // Actually, we can fetch all completed assessments for this campaign and compute.
  const assessments = await prisma.assessment.findMany({
    where: { campaignId, status: "SUBMITTED" },
    include: { result: true }
  });

  stats.respondentCount = assessments.length;

  if (assessments.length > 0) {
    const totals = { global: 0, social: 0, affective: 0, sentimental: 0, professional: 0, self: 0 };
    let resultCount = 0;

    assessments.forEach(a => {
      if (a.result) {
        totals.global += a.result.globalScore;
        totals.social += a.result.socialScore;
        totals.affective += a.result.affectiveScore;
        totals.sentimental += a.result.sentimentalScore;
        totals.professional += a.result.professionalScore;
        totals.self += a.result.selfScore;
        resultCount++;
      }
    });

    if (resultCount > 0) {
      stats.averages = {
        global: Math.round(totals.global / resultCount),
        social: Math.round(totals.social / resultCount),
        affective: Math.round(totals.affective / resultCount),
        sentimental: Math.round(totals.sentimental / resultCount),
        professional: Math.round(totals.professional / resultCount),
        self: Math.round(totals.self / resultCount),
      };
    }
  }

  return stats;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // Check cron authorization if CRON_SECRET is configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // 1. Find campaigns to close (ACTIVE or PLANIFIEE that passed their end date)
    const campaignsToClose = await prisma.campaign.findMany({
      where: {
        status: { in: ["ACTIVE", "PLANIFIEE", "EN_CLOTURE"] },
        endDate: { lt: now }
      },
      select: { id: true, title: true }
    });

    if (campaignsToClose.length === 0) {
      return NextResponse.json({ success: true, message: "No campaigns to close." });
    }

    const closedIds: string[] = [];

    for (const campaign of campaignsToClose) {
      // Calculate final stats snapshot
      const finalStats = await calculateCampaignStats(campaign.id);

      // Create snapshot
      await prisma.campaignSnapshot.upsert({
        where: { campaignId: campaign.id },
        update: { data: finalStats },
        create: {
          campaignId: campaign.id,
          data: finalStats
        }
      });

      // Update campaign status
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "CLOSED" }
      });

      closedIds.push(campaign.id);
    }

    return NextResponse.json({
      success: true,
      message: `Closed ${closedIds.length} campaigns.`,
      closedIds
    });
  } catch (error: any) {
    console.error("[CRON_CLOSE_CAMPAIGNS]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
