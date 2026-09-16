import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const ALLOWED_ROLES = ["ADMIN_B2G", "ADMIN_B2B", "ADMIN_B2B2C", "SUPER_ADMIN"];
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

    const results = await prisma.iqrhResult.findMany({
      where: { assessment: { campaignId: id, status: "SUBMITTED" } },
      include: { icr: true },
    });

    if (results.length < ANONYMITY_THRESHOLD) {
      return NextResponse.json({ error: `Le seuil d'anonymat n'est pas atteint (${results.length}/${ANONYMITY_THRESHOLD})` }, { status: 403 });
    }

    const csvHeaders = [
      "ID Anonyme", 
      "Score Global", 
      "Social", 
      "Affectif", 
      "Sentimental", 
      "Professionnel", 
      "Moi", 
      "Météo",
      "Niveau ICR",
      "Score ICR",
      "Facteurs de Risques",
      "Facteurs Protecteurs"
    ];

    const csvRows = results.map((r, i) => [
      `"R-${i + 1}"`,
      r.globalScore.toFixed(1),
      r.socialScore.toFixed(1),
      r.affectiveScore.toFixed(1),
      r.sentimentalScore.toFixed(1),
      r.professionalScore.toFixed(1),
      r.selfScore.toFixed(1),
      `"${r.weather}"`,
      `"${r.icr?.level || ""}"`,
      r.icr?.score || "",
      `"${(r.icr?.riskFactors || []).join("; ")}"`,
      `"${(r.icr?.protectiveFactors || []).join("; ")}"`
    ].join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const bom = "\uFEFF";

    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export_campagne_${id}.csv"`
      }
    });

  } catch (error) {
    console.error("Export campaign error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
