import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CatalogForm } from "@/components/admin/CatalogForm";
import Link from "next/link";
import { ArrowLeft, BookPlus } from "lucide-react";


export const metadata = { title: "Ajouter au catalogue — LinkOffice" };

export default async function NewCatalogItemPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return (
    <div className="max-w-[700px] mx-auto pb-10">
      <div className="flex items-center gap-3 mb-7">
        <Link href="/dashboard/superadmin/catalog" className="text-[#123D46]/70 flex items-center gap-1 hover:text-[#123D46] transition-colors text-[13px]">
          <ArrowLeft size={15} /> Retour au catalogue
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight mb-2">Ajouter au catalogue</h1>
      <p className="text-[#123D46]/70 mb-8 text-sm">Créez de nouvelles recommandations, défis et partenaires pour l'IA.</p>

      <CatalogForm isEdit={false} />
    </div>
  );
}
