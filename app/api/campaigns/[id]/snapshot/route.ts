import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/campaigns/[id]/snapshot - Genere un snapshot fige des stats aggregees
// GET  /api/campaigns/[id]/snapshot - Recupere le snapshot existant
export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    if (!["ADMIN_B2B","ADMIN_COLLECTIVITE","SUPER_ADMIN"].includes(session.user.role ?? "")) {
      return NextResponse.json({ error: "Droits insuffisants" }, { status: 403 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { organization: true },
    });
    if (!campaign) return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });

    // Recuperer toutes les evaluations soumises pour cette campagne
    const results = await prisma.iqrhResult.findMany({
      where: { assessment: { campaignId: id, status: "SUBMITTED" } },
      include: { icr: true },
    });

    const ANONYMITY_THRESHOLD = 5;
    if (results.length < ANONYMITY_THRESHOLD) {
      return NextResponse.json({
        error: `Anonymat: ${results.length} repondants. Minimum ${ANONYMITY_THRESHOLD} requis.`,
        blocked: true,
      }, { status: 422 });
    }

    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a,b) => a+b, 0) / arr.length) : 0;

    const snapshotData = {
      generatedAt: new Date().toISOString(),
      campaignTitle: campaign.title,
      offer: campaign.offer,
      respondentCount: results.length,
      averages: {
        global:       avg(results.map(r => r.globalScore)),
        social:       avg(results.map(r => r.socialScore)),
        affective:    avg(results.map(r => r.affectiveScore)),
        sentimental:  avg(results.map(r => r.sentimentalScore)),
        professional: avg(results.map(r => r.professionalScore)),
        self:         avg(results.map(r => r.selfScore)),
      },
      icrDistribution: {
        faible:   results.filter(r => r.icr && r.icr.score < 25).length,
        modere:   results.filter(r => r.icr && r.icr.score >= 25 && r.icr.score < 50).length,
        eleve:    results.filter(r => r.icr && r.icr.score >= 50 && r.icr.score < 75).length,
        critique: results.filter(r => r.icr && r.icr.score >= 75).length,
      },
    };

    const snapshot = await prisma.campaignSnapshot.upsert({
      where: { campaignId: id },
      update: { data: snapshotData },
      create: { campaignId: id, data: snapshotData },
    });

    return NextResponse.json({ snapshot, data: snapshotData });
  } catch (e) {
    console.error("POST /campaigns/[id]/snapshot:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    const snapshot = await prisma.campaignSnapshot.findUnique({ where: { campaignId: id } });
    if (!snapshot) return NextResponse.json({ error: "Snapshot non disponible" }, { status: 404 });
    return NextResponse.json(snapshot);
  } catch (e) {
    console.error("GET /campaigns/[id]/snapshot:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}