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
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        
        <div className="page-container-wide">
          <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ marginBottom: 32 }}>
        <Link href="/dashboard/superadmin/catalog" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14, marginBottom: 16 }}>
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
          <BookPlus size={28} color="#c084fc" />
          Ajouter un élément
        </h1>
        <p style={{ color: "#94a3b8", marginTop: 8 }}>Créez une nouvelle recommandation, un défi ou un partenaire.</p>
      </div>

      <div className="mt-8">
        <CatalogForm isEdit={false} />
      </div>
          </div>
        </div>
      </main>
    </>
  );
}
