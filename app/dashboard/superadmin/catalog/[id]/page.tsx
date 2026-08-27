import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CatalogForm } from "@/components/admin/CatalogForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";

export const metadata = { title: "Éditer au catalogue — LinkOffice" };

export default async function EditCatalogItemPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const item = await prisma.libraryItem.findUnique({
    where: { id: params.id }
  });

  if (!item) {
    redirect("/dashboard/superadmin/catalog");
  }

  // Conversion propre pour être passé en props client
  const itemData = {
    ...item,
    data: item.data as any,
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard/superadmin/catalog" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14 }}>
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>
      </div>

      <CatalogForm initialData={itemData} isEdit={true} />
    </div>
  );
}
