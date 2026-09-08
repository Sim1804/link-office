/**
 * GET /api/campaigns/[id]/stats
 *
 * Baromètre agrégé anonymisé pour une campagne individuelle B2G.
 * Réservé aux ADMIN_COLLECTIVITE, ADMIN_B2B, ADMIN_B2B2C, SUPER_ADMIN.
 * Seuil d'anonymat : 5 répondants minimum.
 *
 * Retourne :
 *  - averages (IQRH global + 5 dimensions)
 *  - icrDistribution (faible/modéré/élevé/critique)
 *  - weatherDistribution
 *  - topProfiles (top 5)
 *  - dominantNeeds (top 5 besoins collectifs)
 *  - participation (invités/commencés/terminés)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN_COLLECTIVITE", "ADMIN_B2B", "ADMIN_B2B2C", "SUPER_ADMIN"];
const ANONYMITY_THRESHOLD = 5;

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

    // ── Participation ────────────────────────────────────────────────────────
    const [invited, started, completed] = await Promise.all([
      prisma.campaignInvite.count({ where: { campaignId: id } }),
      prisma.assessment.count({ where: { campaignId: id } }),
      prisma.assessment.count({ where: { campaignId: id, status: "SUBMITTED" } }),
    ]);

    // ── Résultats IQRH soumis ────────────────────────────────────────────────
    const results = await prisma.iqrhResult.findMany({
      where: { assessment: { campaignId: id, status: "SUBMITTED" } },
      include: { icr: true },
    });

    if (results.length < ANONYMITY_THRESHOLD) {
      return NextResponse.json({
        anonymityBlocked: true,
        respondentCount: results.length,
        threshold: ANONYMITY_THRESHOLD,
        participation: { invited, started, completed },
      });
    }

    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

    // ── Moyennes IQRH ────────────────────────────────────────────────────────
    const averages = {
      global:       avg(results.map(r => r.globalScore)),
      social:       avg(results.map(r => r.socialScore)),
      affective:    avg(results.map(r => r.affectiveScore)),
      sentimental:  avg(results.map(r => r.sentimentalScore)),
      professional: avg(results.map(r => r.professionalScore)),
      self:         avg(results.map(r => r.selfScore)),
    };

    // ── ICR distribution ─────────────────────────────────────────────────────
    const icrDistribution = {
      faible:   results.filter(r => r.icr && r.icr.score < 25).length,
      modere:   results.filter(r => r.icr && r.icr.score >= 25 && r.icr.score < 50).length,
      eleve:    results.filter(r => r.icr && r.icr.score >= 50 && r.icr.score < 75).length,
      critique: results.filter(r => r.icr && r.icr.score >= 75).length,
    };

    // ── Météo collective ─────────────────────────────────────────────────────
    const weatherDistribution: Record<string, number> = {};
    results.forEach(r => {
      weatherDistribution[r.weather] = (weatherDistribution[r.weather] ?? 0) + 1;
    });

    // ── Top profils ──────────────────────────────────────────────────────────
    const profileCount: Record<string, number> = {};
    results.forEach(r => {
      profileCount[r.primaryProfile] = (profileCount[r.primaryProfile] ?? 0) + 1;
    });
    const topProfiles = Object.entries(profileCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([profile, count]) => ({ profile, count, pct: Math.round((count / results.length) * 100) }));

    // ── Besoins dominants collectifs ─────────────────────────────────────────
    const needsCount: Record<string, number> = {};
    results.forEach(r => {
      if (r.icr?.dominantNeeds) {
        (r.icr.dominantNeeds as string[]).forEach(need => {
          needsCount[need] = (needsCount[need] ?? 0) + 1;
        });
      }
    });
    const dominantNeeds = Object.entries(needsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([need, count]) => ({ need, count, pct: Math.round((count / results.length) * 100) }));

    // ── Facteurs vulnérabilité / protection collectifs ───────────────────────
    const riskCount: Record<string, number> = {};
    const protectiveCount: Record<string, number> = {};
    results.forEach(r => {
      if (r.icr) {
        (r.icr.riskFactors as string[]).forEach(f => { riskCount[f] = (riskCount[f] ?? 0) + 1; });
        (r.icr.protectiveFactors as string[]).forEach(f => { protectiveCount[f] = (protectiveCount[f] ?? 0) + 1; });
      }
    });
    const topRiskFactors = Object.entries(riskCount)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([factor, count]) => ({ factor, count, pct: Math.round((count / results.length) * 100) }));
    const topProtectiveFactors = Object.entries(protectiveCount)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([factor, count]) => ({ factor, count, pct: Math.round((count / results.length) * 100) }));

    return NextResponse.json({
      anonymityBlocked: false,
      respondentCount: results.length,
      threshold: ANONYMITY_THRESHOLD,
      participation: {
        invited,
        started,
        completed,
        completionRate: started > 0 ? Math.round((completed / started) * 100) : 0,
        activationRate: invited > 0 ? Math.round((started / invited) * 100) : 0,
      },
      averages,
      icrDistribution,
      weatherDistribution,
      topProfiles,
      dominantNeeds,
      topRiskFactors,
      topProtectiveFactors,
    });
  } catch (e) {
    console.error("GET /api/campaigns/[id]/stats:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
