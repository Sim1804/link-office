import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
      orderBy: { createdAt: "desc" }
    });

    const csvHeaders = ["ID", "Prénom", "Nom", "Email", "Rôle", "Organisation", "Date de Création"];
    const csvRows = users.map(u => [
      u.id,
      `"${(u.firstName || "").replace(/"/g, '""')}"`,
      `"${(u.lastName || "").replace(/"/g, '""')}"`,
      `"${(u.email || "").replace(/"/g, '""')}"`,
      u.role,
      `"${(u.organization?.name || "").replace(/"/g, '""')}"`,
      new Date(u.createdAt).toLocaleDateString("fr-FR")
    ].join(","));

    const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");
    // Add BOM for Excel UTF-8 support
    const bom = "\uFEFF";

    return new NextResponse(bom + csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="export_utilisateurs_linkoffice.csv"'
      }
    });
  } catch (error) {
    console.error("Export users error:", error);
    return NextResponse.json({ error: "Erreur lors de l'export" }, { status: 500 });
  }
}
