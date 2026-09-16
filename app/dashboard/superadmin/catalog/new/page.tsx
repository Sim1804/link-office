import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CatalogForm } from "@/components/admin/CatalogForm";
import Link from "next/link";
import { ArrowLeft, BookPlus } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";

export const metadata = { title: "Ajouter au catalogue — LinkOffice" };

export default async function NewCatalogItemPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Link href="/dashboard/superadmin/catalog" style={{ color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Retour au catalogue
        </Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Ajouter au catalogue</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 32 }}>Créez de nouvelles recommandations, défis et partenaires pour l'IA.</p>

      <CatalogForm isEdit={false} />
    </div>
  );
}
