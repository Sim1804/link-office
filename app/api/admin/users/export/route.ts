import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Accès refusé. Rôle SUPER_ADMIN requis." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
      orderBy: { createdAt: "desc" }
    });

    function sanitizeCsvValue(val: string | null | undefined): string {
      if (!val) return '""';
      const str = String(val).replace(/"/g, '""');
      // CWE-1236 : Si la cellule débute par =, +, -, @, \t ou \r, préfixer d'une apostrophe pour forcer l'interprétation texte
      if (/^[=+\-@\t\r]/.test(str)) {
        return `"'${str}"`;
      }
      return `"${str}"`;
    }

    const csvHeaders = ["ID", "Prénom", "Nom", "Email", "Rôle", "Organisation", "Date de Création"];
    const csvRows = users.map(u => [
      u.id,
      sanitizeCsvValue(u.firstName),
      sanitizeCsvValue(u.lastName),
      sanitizeCsvValue(u.email),
      u.role,
      sanitizeCsvValue(u.organization?.name),
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
