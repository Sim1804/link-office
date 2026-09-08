import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE", "SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });

    // Calculer le snapshot
    const assessments = await prisma.assessment.findMany({
      where: { campaignId: id, status: "SUBMITTED" },
      include: { result: true }
    });

    const stats = { respondentCount: assessments.length, averages: {} as any };

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

    await prisma.$transaction([
      prisma.campaignSnapshot.upsert({
        where: { campaignId: id },
        update: { data: stats },
        create: { campaignId: id, data: stats }
      }),
      prisma.campaign.update({
        where: { id },
        data: { status: "CLOSED" }
      })
    ]);

    return NextResponse.json({ success: true, message: "Campagne clôturée avec succès" }, { status: 200 });
  } catch (e) {
    console.error("POST /campaigns/[id]/close:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
