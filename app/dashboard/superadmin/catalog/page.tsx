import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen, Edit2, Eye } from "lucide-react";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { Select } from "@/components/ui/Select";
import { CatalogImportButton } from "@/components/admin/CatalogImportButton";

export const metadata = { title: "Catalogue (Back-Office) — Link Office" };
export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ filter?: string, page?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const filter = params.filter || "ALL";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 20;

  const allowedLibraries = ["Recommandations", "Micro-défis", "Partenaires"];
  const isQuestionFilter = filter === "Questions IQRH";
  const isModuleFilter = filter === "Modules Adaptatifs";
  const isStandardFilter = !isQuestionFilter && !isModuleFilter;

  const whereClause = filter !== "ALL" && isStandardFilter
    ? { library: filter } 
    : { library: { in: allowedLibraries } };

  let items: any[] = [];
  let totalItems = 0;

  if (isQuestionFilter) {
    const qItems = await prisma.question.findMany({
      orderBy: { position: "asc" },
    });
    
    const dimensionObjectives: Record<string, string> = {
      SOCIAL: "Évaluer la qualité, la fréquence et le niveau de soutien du réseau social.",
      AFFECTIVE: "Mesurer la présence et la qualité des relations de soutien émotionnel.",
      SENTIMENTAL: "Évaluer la qualité de la vie sentimentale et l'intimité.",
      PROFESSIONAL: "Mesurer l'engagement, la reconnaissance et la qualité des relations professionnelles.",
      SELF: "Évaluer l'estime de soi, le sens de la vie et la relation globale à soi-même."
    };

    const grouped = qItems.reduce((acc, q) => {
      if (!acc[q.dimension]) acc[q.dimension] = [];
      acc[q.dimension].push(q);
      return acc;
    }, {} as Record<string, any[]>);

    items = Object.keys(grouped).map(dim => {
      const versionList = grouped[dim].map(q => q.version).filter(v => typeof v === 'number');
      const maxVersion = versionList.length > 0 ? Math.max(...versionList) : 1;
      
      const dimensionLabels: Record<string, string> = {
        SOCIAL: "Social & Relations",
        AFFECTIVE: "Affectif",
        SENTIMENTAL: "Sentimental",
        PROFESSIONAL: "Professionnel",
        SELF: "Rapport à Soi"
      };

      return {
        id: `DIM_${dim}`,
        dimensionName: dim,
        dimensionLabel: dimensionLabels[dim] || dim,
        isDimensionGroup: true,
        triggerSituation: "Universel",
        objective: dimensionObjectives[dim] || "Évaluer cette dimension",
        questions: grouped[dim],
        version: maxVersion,
        isActive: grouped[dim].some(q => q.isActive)
      };
    });
    
    // Manual pagination since we grouped in memory
    totalItems = items.length;
    items = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  } else if (isModuleFilter) {
    const [mItems, mCount] = await Promise.all([
      prisma.adaptiveModule.findMany({
        orderBy: { position: "asc" },
        include: { questions: { orderBy: { position: "asc" } } },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.adaptiveModule.count()
    ]);
    items = mItems;
    totalItems = mCount;
  } else {
    const [lItems, lCount] = await Promise.all([
      prisma.libraryItem.findMany({
        where: whereClause,
        orderBy: { library: "asc" },
        skip: (currentPage - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      prisma.libraryItem.count({ where: whereClause })
    ]);
    items = lItems;
    totalItems = lCount;
  }

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#123D46] flex items-center gap-2.5">
            <BookOpen size={24} color="var(--primary)" />
            Catalogue Central
          </h1>
          <p className="text-[#123D46]/70 text-sm">Gérez les recommandations, les micro-défis et la liste des partenaires.</p>
        </div>
        
        <div className="flex gap-3">
          <CatalogImportButton />
          <Link href="/dashboard/superadmin/catalog/new" className="no-underline">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs sm:text-sm transition-colors shadow-xs">
              <Plus className="w-4 h-4" />
              <span>Ajouter un élément</span>
            </button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-6 border-b border-[#E3EBE6]">
        {["ALL", "Recommandations", "Micro-défis", "Partenaires", "Questions IQRH", "Modules Adaptatifs"].map(f => {
          const isActive = filter === f;
          return (
            <Link key={f} href={`/dashboard/superadmin/catalog?filter=${f}`} className="no-underline">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all whitespace-nowrap inline-flex items-center ${
                isActive
                  ? 'bg-[#00A99D]/12 text-[#00A99D] ring-1 ring-[#00A99D]/30 font-bold shadow-2xs'
                  : 'bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70'
              }`}>
                {f === "ALL" ? "Tout voir" : f}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6] text-[#123D46]/60 font-jakarta font-bold uppercase tracking-wider text-[10px]">
              {isQuestionFilter || isModuleFilter ? (
                <>
                  <th className="px-6 py-4">ID & {isQuestionFilter ? "Dimension" : "Cible"}</th>
                  <th className="px-6 py-4">Objectif</th>
                  <th className="px-6 py-4">Questions / Version</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">ID & Type</th>
                  <th className="px-6 py-4">Titre</th>
                  <th className="px-6 py-4">Catégorie</th>
                  <th className="px-6 py-4">Ciblage & Détails</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              if (item.isDimensionGroup || isModuleFilter) {
                return (
                  <tr key={item.id} className="table-row-hover" >
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#F4F1E8] text-[#123D46]/60 rounded-full border border-[#E3EBE6]">
                          {item.id}
                        </span>
                        {item.isDimensionGroup ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.dimensionName === "SOCIAL" ? "bg-[#00A99D]/10 text-[#00A99D]" : item.dimensionName === "AFFECTIVE" ? "bg-[#199E9A]/10 text-[#199E9A]" : item.dimensionName === "SENTIMENTAL" ? "bg-[#FFC629]/20 text-[#B8870A]" : item.dimensionName === "PROFESSIONAL" ? "bg-[#5965E8]/10 text-[#5965E8]" : item.dimensionName === "SELF" ? "bg-[#4DBDB2]/15 text-[#123D46]" : "bg-[#00A99D]/10 text-[#00A99D]"}`}>
                            {item.dimensionLabel}
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#00A99D]/10 text-[#00A99D]">
                            {item.triggerSituation || "Universel"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#123D46]/70 text-[13px]">{item.objective}</td>
                    <td className="px-6 py-4 text-[#123D46]/70 text-[13px]">
                      {item.questions?.length || 0} questions (v{item.version})
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                        {item.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center">
                        <Link href={`/dashboard/superadmin/catalog/modules/${item.id}`} className="no-underline inline-flex items-center justify-center">
                          <button
                            className="w-8 h-8 rounded-lg border border-[#E3EBE6] bg-white hover:border-[#00A99D] hover:bg-[#00A99D]/10 text-[#123D46] hover:text-[#00A99D] inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                            title="Voir les questions du module"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              }

              const data = item.data as any || {};
              return (
              <tr key={item.id} className="table-row-hover" >
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#F4F1E8] text-[#123D46]/60 rounded-full border border-[#E3EBE6]">
                      {item.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.library === "Micro-défis" ? "bg-[#00A99D]/10 text-[#00A99D]" : item.library === "Partenaires" ? "bg-[#FFC629]/20 text-[#B8870A]" : "bg-[#5965E8]/10 text-[#5965E8]"}`}>
                      {item.library}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#123D46] font-medium text-[13px]">{item.title}</td>
                <td className="px-6 py-4 text-[#123D46]/70 text-[13px]">{item.category || "—"}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {item.library === "Recommandations" && data.impact_attendu_1_5 && (
                      <span className="text-[11px] px-2 py-0.5 border border-emerald-300 text-emerald-600 bg-emerald-50 rounded-full">⭐ Impact {data.impact_attendu_1_5}</span>
                    )}
                    {item.library === "Micro-défis" && data.points && (
                      <span className="text-[11px] px-2 py-0.5 border border-cyan-300 text-cyan-500 bg-cyan-50 rounded-full">💎 {data.points} pts</span>
                    )}
                    {item.library === "Partenaires" && data.territoire && (
                      <span className="text-[11px] px-2 py-0.5 border border-orange-300 text-orange-500 bg-orange-50 rounded-full">📍 {data.territoire}</span>
                    )}
                    {(data.difficulte) && (
                      <span className="text-[11px] px-2 py-0.5 border border-[#E3EBE6] text-[#123D46]/70 bg-[#F8F9FA] rounded-full">⏳ {data.difficulte}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-1.5">
                    <Link href={`/dashboard/superadmin/catalog/${item.id}`} className="no-underline inline-flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-lg bg-[#123D46]/5 hover:bg-[#00A99D]/15 hover:text-[#00A99D] text-[#123D46] inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                        title="Modifier cet élément"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                    <DeleteConfirmButton endpoint={`/api/admin/catalog/${item.id}`} title={`Supprimer ${item.id}`} />
                  </div>
                </td>
              </tr>
            )})}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-[#123D46]/50">Aucun élément trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} éléments
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                  if (page === 4 || page === totalPages - 2) return <span key={page} className="px-1 text-[#123D46]/50">…</span>;
                  return null;
                }
                return (
                  <Link key={page} href={`/dashboard/superadmin/catalog?filter=${filter}&page=${page}`} className="no-underline">
                    <button className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold cursor-pointer transition-colors ${isActive ? "bg-[#00A99D] text-white" : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#FAF9F5]"}`}>
                      {page}
                    </button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
