/**
 * GET /api/campaigns/[id]/participation
 *
 * Suivi de participation détaillé pour une campagne.
 * Retourne : invités, activés, commencés, terminés, taux.
 * Réservé aux admins de l'organisation ou SUPER_ADMIN.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN_COLLECTIVITE", "ADMIN_B2B", "ADMIN_B2B2C", "SUPER_ADMIN"];

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!ALLOWED_ROLES.includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    if (campaign.organizationId !== user?.organizationId && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const [invited, activated, started, completed] = await Promise.all([
      prisma.campaignInvite.count({ where: { campaignId: id } }),
      prisma.campaignInvite.count({ where: { campaignId: id, status: { in: ["ACTIVATED", "STARTED", "COMPLETED"] } } }),
      prisma.assessment.count({ where: { campaignId: id } }),
      prisma.assessment.count({ where: { campaignId: id, status: "SUBMITTED" } }),
    ]);

    // Evolution dans le temps (7 derniers jours)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCompletions = await prisma.assessment.findMany({
      where: { campaignId: id, status: "SUBMITTED", submittedAt: { gte: sevenDaysAgo } },
      select: { submittedAt: true },
      orderBy: { submittedAt: "asc" },
    });

    // Regrouper par jour
    const byDay: Record<string, number> = {};
    recentCompletions.forEach(a => {
      if (a.submittedAt) {
        const day = a.submittedAt.toISOString().split("T")[0];
        byDay[day] = (byDay[day] ?? 0) + 1;
      }
    });
    const trend = Object.entries(byDay).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      invited,
      activated,
      started,
      completed,
      target: campaign.targetPopulation ?? null,
      completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
      activationRate: invited > 0 ? Math.round((activated / invited) * 100) : 0,
      targetRate: campaign.targetPopulation ? Math.round((completed / campaign.targetPopulation) * 100) : null,
      trend,
    });
  } catch (e) {
    console.error("GET /api/campaigns/[id]/participation:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
