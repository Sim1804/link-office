import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Building2, Users, Eye } from "lucide-react";

export const metadata = { title: "Organisations (Partenaires) — Link Office" };
export const dynamic = "force-dynamic";

export default async function OrganizationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 12;

  const [organizations, totalItems] = await Promise.all([
    prisma.organization.findMany({
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { campaigns: true, users: true } },
        users: {
          where: { role: { in: ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"] } },
          select: { email: true, firstName: true, lastName: true },
          take: 1
        }
      }
    }),
    prisma.organization.count()
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-[#5965E8]" />
            Organisations Partenaires
          </h1>
          <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
            Gérez les Entreprises (B2B), Mutuelles (B2B2C) et Collectivités (B2G).
          </p>
        </div>
        <Link href="/dashboard/superadmin/organizations/new" className="no-underline shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors shadow-xs">
            <Plus className="w-4 h-4" />
            Ajouter un partenaire
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Nom & Code</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Contact Admin</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-center">Campagnes</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-center">Utilisateurs</th>
              <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => {
              const admin = org.users[0];
              const typeBadge =
                org.type === "B2B2C"
                  ? "bg-[#5965E8]/10 text-[#5965E8]"
                  : org.type === "B2G"
                  ? "bg-sky-50 text-sky-600"
                  : "bg-[#00A99D]/10 text-[#00A99D]";
              const typeLabel =
                org.type === "B2B" ? "Entreprises (B2B)"
                : org.type === "B2B2C" ? "Mutuelles (B2B2C)"
                : org.type === "B2G" ? "Collectivités (B2G)"
                : org.type;

              return (
                <tr key={org.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} className="no-underline">
                      <div className="font-semibold text-[#123D46] text-sm hover:text-[#00A99D] transition-colors cursor-pointer">
                        {org.name}
                      </div>
                    </Link>
                    <div className="text-[#00A99D] text-[11px] mt-0.5 font-bold tracking-wider font-mono">{org.codeAccess}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${typeBadge}`}>
                      {typeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {admin ? (
                      <>
                        <div className="text-[#123D46] text-sm font-medium">{admin.firstName} {admin.lastName}</div>
                        <div className="text-[#123D46]/60 text-xs mt-0.5">{admin.email}</div>
                      </>
                    ) : (
                      <span className="text-[#123D46]/40 text-xs italic">Aucun administrateur</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-[#123D46] text-sm font-semibold">
                    {org._count.campaigns}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-[#123D46]/70 text-[13px] font-semibold">
                      <Users className="w-3.5 h-3.5" /> {org._count.users}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} className="no-underline inline-flex items-center justify-center">
                      <button
                        className="w-8 h-8 rounded-lg border border-[#E3EBE6] bg-white hover:border-[#00A99D] hover:bg-[#00A99D]/10 text-[#123D46] hover:text-[#00A99D] inline-flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                        title="Voir l'organisation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {organizations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#123D46]/50 text-sm">
                  Aucune organisation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} organisations
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
                  <Link key={page} href={`/dashboard/superadmin/organizations?page=${page}`} className="no-underline">
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
