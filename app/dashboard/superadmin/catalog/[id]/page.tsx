import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CatalogForm } from "@/components/admin/CatalogForm";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Éditer au catalogue — Link Office" };

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
    <div className="max-w-[860px] mx-auto pb-10">
      <div className="mb-6">
        <Link href="/dashboard/superadmin/catalog" className="text-[#123D46]/70 flex items-center gap-1 hover:text-[#123D46] transition-colors text-sm font-medium">
          <ArrowLeft size={16} /> Retour au catalogue
        </Link>
      </div>

      <CatalogForm initialData={itemData} isEdit={true} />
    </div>
  );
}
