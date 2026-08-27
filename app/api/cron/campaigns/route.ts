import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sécurité basique pour le cron (en production, utiliser un webhook secret)
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const cronSecret = url.searchParams.get("secret");
    
    // Dans un vrai projet: if (cronSecret !== process.env.CRON_SECRET) return 401
    
    const now = new Date();

    // 1. Fetch campaigns that are ACTIVE and whose endDate is passed
    const expiredCampaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
        endDate: { lte: now }
      },
      include: {
        users: {
          include: {
            assessments: {
              orderBy: { startedAt: "desc" },
              take: 1,
              include: { result: { include: { icr: true } }, demographic: true },
            }
          }
        }
      }
    });

    const results = [];

    for (const campaign of expiredCampaigns) {
      // 2. Generate stats for the snapshot
      const allMembers = campaign.users;
      
      const eligibleCount = campaign.targetPopulation || campaign.quota || 0;
      const activatedCount = allMembers.length;
      const startedCount = allMembers.filter(u => u.assessments.length > 0).length;
      const respondents = allMembers.filter((u) => u.assessments.length > 0 && u.assessments[0].status === "SUBMITTED" && u.assessments[0].result);
      const respondentCount = respondents.length;

      const activationFunnel = {
        eligible: eligibleCount > 0 ? eligibleCount : activatedCount,
        activated: activatedCount,
        started: startedCount,
        completed: respondentCount,
      };

      const snapshotData: any = {
        activationFunnel,
        respondentCount,
        timestamp: now.toISOString(),
      };

      if (respondentCount >= 5) {
        let totalGlobal = 0, totalSocial = 0, totalAffective = 0, totalProfessional = 0, totalSelf = 0, totalSentimental = 0;
        const icrDistribution = { faible: 0, modere: 0, eleve: 0, critique: 0 };
        const weatherDistribution: Record<string, number> = {};
        
        const orientationsCount = {
          psychological: 0,
          social: 0,
          professional: 0,
        };

        for (const respondent of respondents) {
          const result = respondent.assessments[0].result!;
          totalGlobal += result.globalScore;
          totalSocial += result.socialScore;
          totalAffective += result.affectiveScore;
          totalProfessional += result.professionalScore;
          totalSelf += result.selfScore;
          totalSentimental += result.sentimentalScore;

          const weatherKey = result.weatherTitle || result.weather;
          if (weatherKey) {
            weatherDistribution[weatherKey] = (weatherDistribution[weatherKey] || 0) + 1;
          }

          if (result.icr) {
            const s = result.icr.score;
            if (s < 25) icrDistribution.faible++;
            else if (s < 50) icrDistribution.modere++;
            else if (s < 75) icrDistribution.eleve++;
            else icrDistribution.critique++;
          }

          if (result.selfScore < 40) orientationsCount.psychological++;
          if (result.socialScore < 40) orientationsCount.social++;
          if (result.professionalScore < 40) orientationsCount.professional++;
        }

        snapshotData.averages = {
          global: Math.round(totalGlobal / respondentCount),
          social: Math.round(totalSocial / respondentCount),
          affective: Math.round(totalAffective / respondentCount),
          sentimental: Math.round(totalSentimental / respondentCount),
          professional: Math.round(totalProfessional / respondentCount),
          self: Math.round(totalSelf / respondentCount),
        };
        snapshotData.icrDistribution = icrDistribution;
        snapshotData.weatherDistribution = weatherDistribution;
        snapshotData.orientationsCount = orientationsCount;
      }

      // 3. Update Campaign status and create Snapshot in a transaction
      await prisma.$transaction([
        prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: "CLOSED" }
        }),
        prisma.campaignSnapshot.create({
          data: {
            campaignId: campaign.id,
            data: snapshotData
          }
        })
      ]);

      results.push({ campaignId: campaign.id, status: "CLOSED", snapshotCreated: true });
    }

    // Optional: Fetch campaigns that expire in exactly 30 days or 7 days to send notifications
    // const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    // console.log("Emails de relance J-30 à envoyer à...");

    return NextResponse.json({ success: true, processed: results.length, details: results });
  } catch (error: any) {
    console.error("[CRON_CAMPAIGNS_ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
