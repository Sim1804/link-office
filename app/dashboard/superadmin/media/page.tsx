import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, Eye, CheckCircle2, Clock, FileText, Headphones } from "lucide-react";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export const metadata = {
  title: "Médiathèque (CMS) | Admin LINK OFFICE",
};

export default async function AdminMediaIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 12;

  const [mediaItems, totalItems] = await Promise.all([
    prisma.mediaContent.findMany({
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: { categories: true }
    }),
    prisma.mediaContent.count()
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#5965E8]" />
            Médiathèque (CMS)
          </h1>
          <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
            Gérez les articles, podcasts et autres contenus publics.
          </p>
        </div>
        <Link href="/dashboard/superadmin/media/new" className="no-underline shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors shadow-xs cursor-pointer">
            <Plus className="w-4 h-4" />
            Nouveau Contenu
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mediaItems.map(item => (
              <tr key={item.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-[#123D46] text-sm">{item.title}</div>
                  <div className="text-[#123D46]/50 text-[11px] mt-0.5 font-mono">/{item.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    item.mediaType === "PODCAST"
                      ? "bg-[#5965E8]/10 text-[#5965E8]"
                      : "bg-sky-50 text-sky-600"
                  }`}>
                    {item.mediaType === "PODCAST" ? <Headphones className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {item.mediaType.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {item.published ? (
                    <span className="inline-flex items-center gap-1.5 text-[#00A99D] text-[13px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Publié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-500 text-[13px] font-semibold">
                      <Clock className="w-3.5 h-3.5" /> Brouillon
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-[#123D46]/70 text-[13px]">
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={`/media/${item.slug}`} target="_blank" className="no-underline inline-flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-lg border border-[#E3EBE6] bg-white hover:border-[#00A99D] hover:bg-[#00A99D]/10 text-[#123D46] hover:text-[#00A99D] inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                        title="Voir l'article"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                    <Link href={`/dashboard/superadmin/media/${item.id}`} className="no-underline inline-flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-lg bg-[#123D46]/5 hover:bg-[#00A99D]/15 hover:text-[#00A99D] text-[#123D46] inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                        title="Modifier ce média"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <DeleteConfirmButton endpoint={`/api/admin/media/${item.id}`} title="Supprimer" />
                  </div>
                </td>
              </tr>
            ))}
            {mediaItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#123D46]/50 text-sm">
                  Aucun contenu média pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} éléments
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                  if (page === 4 || page === totalPages - 2) return <span key={page} className="px-1 text-[#123D46]/40">…</span>;
                  return null;
                }
                return (
                  <Link key={page} href={`/dashboard/superadmin/media?page=${page}`} className="no-underline">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#00A99D] text-white border-none"
                        : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#F8F9FA]"
                    }`}>
                      {page}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
