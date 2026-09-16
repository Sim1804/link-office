import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    });

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Aucune organisation associée" }, { status: 404 });
    }

    if (user.role !== "ADMIN_B2B" && user.role !== "ADMIN_B2G" && user.role !== "ADMIN_B2B2C" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    const whereClause: any = { organizationId: user.organizationId };
    if (campaignId && campaignId !== "ALL") {
      whereClause.campaignId = campaignId;
    }

    const actions = await prisma.actionItem.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        Campaign: { select: { title: true } },
      }
    });

    const csvHeaders = ["Titre", "Description", "Statut", "Priorité", "Pilote", "Date d'échéance", "Campagne", "Créé le"];
    const csvRows = actions.map(a => [
      `"${(a.title || "").replace(/"/g, '""')}"`,
      `"${(a.description || "").replace(/"/g, '""')}"`,
      a.status,
      a.priority,
      `"${(a.pilot || "").replace(/"/g, '""')}"`,
      a.dueDate ? new Date(a.dueDate).toLocaleDateString("fr-FR") : "",
      `"${(a.Campaign?.title || "").replace(/"/g, '""')}"`,
      new Date(a.createdAt).toLocaleDateString("fr-FR")
    ].join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    const bom = "\uFEFF";

    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="export_plan_action.csv"'
      }
    });
  } catch (error) {
    console.error("Export actions error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
