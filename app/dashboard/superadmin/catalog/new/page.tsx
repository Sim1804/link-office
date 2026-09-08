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
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/superadmin/catalog" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14 }}>
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>
      </div>

      <CatalogForm isEdit={false} />
    </div>
  );
}
