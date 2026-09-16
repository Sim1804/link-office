import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Building2, Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Organisations (Partenaires) — LinkOffice" };
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
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
            <Building2 size={24} color="var(--violet)" />
            Organisations (Partenaires)
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Gérez les Entreprises (B2B), Mutuelles (B2B2C) et Collectivités (B2G).</p>
        </div>
        
        <Link href="/dashboard/superadmin/organizations/new" style={{ textDecoration: "none" }}>
          <Button>
            <Plus size={18} /> Ajouter un partenaire
          </Button>
        </Link>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom & Code</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Admin</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Campagnes</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Utilisateurs</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => {
              const admin = org.users[0];
              return (
                <tr key={org.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14, cursor: "pointer" }}>{org.name}</div>
                    </Link>
                    <div style={{ color: "var(--violet)", fontSize: 11, marginTop: 4, fontWeight: 700, letterSpacing: "0.05em" }}>{org.codeAccess}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: 6, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: org.type === "B2B2C" ? "rgba(245,158,11,0.15)" : org.type === "B2G" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
                      color: org.type === "B2B2C" ? "#fcd34d" : org.type === "B2G" ? "#7dd3fc" : "var(--violet)",
                    }}>
                      {org.type === "B2B" ? "Entreprises (B2B)" : org.type === "B2B2C" ? "Mutuelles (B2B2C)" : org.type === "B2G" ? "Collectivités (B2G)" : org.type}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {admin ? (
                      <>
                        <div style={{ color: "var(--text-2)", fontSize: 13 }}>{admin.firstName} {admin.lastName}</div>
                        <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>{admin.email}</div>
                      </>
                    ) : (
                      <span style={{ color: "var(--text-3)", fontSize: 12, fontStyle: "italic" }}>Aucun administrateur</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center", color: "var(--text-1)", fontSize: 14, fontWeight: 600 }}>
                    {org._count.campaigns}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 13, fontWeight: 600 }}>
                      <Users size={14} /> {org._count.users}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ padding: "6px" }} title="Voir l'organisation">
                        <Eye size={14} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {organizations.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)" }}>
                  Aucune organisation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div style={{ padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-3)", fontSize: 13, fontWeight: 500 }}>
              Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} éléments
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                  if (page === 4 || page === totalPages - 2) return <span key={page} style={{ padding: "0 4px", color: "var(--text-3)" }}>…</span>;
                  return null;
                }
                return (
                  <Link key={page} href={`/dashboard/superadmin/organizations?page=${page}`} style={{ textDecoration: "none" }}>
                    <button style={{ 
                      width: 32, height: 32, borderRadius: "50%", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "var(--primary)" : "transparent", 
                      border: isActive ? "none" : "1px solid var(--border)", 
                      color: isActive ? "white" : "var(--text-2)", 
                      fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
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
