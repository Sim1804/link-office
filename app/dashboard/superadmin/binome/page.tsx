import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Activity, Clock, CheckCircle2, Users } from "lucide-react";

export const metadata = {
  title: "Gestion des Binômes | Admin LINK OFFICE",
};

export default async function AdminBinomeIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 12;

  const [binomes, totalItems, stats] = await Promise.all([
    prisma.binome.findMany({
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        userA: { select: { firstName: true, lastName: true, email: true } },
        userB: { select: { firstName: true, lastName: true, email: true } }
      }
    }),
    prisma.binome.count(),
    prisma.binome.groupBy({
      by: ['status'],
      _count: { status: true }
    })
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const activeCount = stats.find(s => s.status === 'ACTIVE')?._count.status || 0;
  const closedCount = stats.find(s => s.status === 'CLOSED')?._count.status || 0;
  const evalCount = stats.find(s => s.status === 'AWAITING_USER_B')?._count.status || 0;

  const kpiCards = [
    { label: "Actifs",        value: activeCount, accentColor: "#00A99D", bgColor: "bg-[#00A99D]/10", textColor: "text-[#00A99D]", leftBorder: "border-l-4 border-[#00A99D]", icon: Activity },
    { label: "En évaluation", value: evalCount,   accentColor: "#f59e0b", bgColor: "bg-amber-50",     textColor: "text-amber-500",  leftBorder: "border-l-4 border-amber-400", icon: Clock },
    { label: "Terminés",      value: closedCount, accentColor: "#10b981", bgColor: "bg-emerald-50",   textColor: "text-emerald-500", leftBorder: "border-l-4 border-emerald-400", icon: CheckCircle2 },
    { label: "Total",         value: totalItems,  accentColor: "#5965E8", bgColor: "bg-[#5965E8]/10", textColor: "text-[#5965E8]",  leftBorder: "border-l-4 border-[#5965E8]", icon: Users },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
          <Handshake className="w-7 h-7 text-[#00A99D]" />
          Gestion des Binômes
        </h1>
        <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
          Supervisez l&apos;activité et l&apos;état de santé des paires relationnelles.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(stat => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border border-[#E3EBE6] ${stat.leftBorder} p-5 shadow-xs hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${stat.bgColor} ${stat.textColor} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono tracking-tight leading-none">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Utilisateurs (Binôme)</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Santé (Score)</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Début</th>
            </tr>
          </thead>
          <tbody>
            {binomes.map(item => {
              const statusStyle =
                item.status === 'ACTIVE'
                  ? "bg-[#00A99D]/10 text-[#00A99D]"
                  : item.status === 'CLOSED'
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-500";
              const statusLabel =
                item.status === 'ACTIVE' ? 'Actif'
                : item.status === 'CLOSED' ? 'Terminé'
                : 'En évaluation';

              return (
                <tr key={item.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#123D46] text-sm">{item.userA.firstName} & {item.userB.firstName}</div>
                    <div className="text-[#123D46]/50 text-xs mt-0.5">{item.userA.email} / {item.userB.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${statusStyle}`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#F8F9FA] rounded-full overflow-hidden min-w-[60px]">
                        <div
                          className={`h-full rounded-full ${item.healthScore > 50 ? "bg-[#00A99D]" : "bg-rose-500"}`}
                          style={{ width: `${item.healthScore}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-bold text-[#123D46]/70 w-8 text-right">{item.healthScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#123D46]/70 text-[13px]">
                    {new Date(item.startDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              );
            })}
            {binomes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[#123D46]/50 text-sm">
                  Aucun binôme actif.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} binômes
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
                  <Link key={page} href={`/dashboard/superadmin/binome?page=${page}`} className="no-underline">
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
