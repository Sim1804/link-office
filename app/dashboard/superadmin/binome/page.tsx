import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Handshake, Activity, Clock, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  const evalCount = stats.find(s => s.status === 'EVALUATION')?._count.status || 0;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 12 }}>
            <Handshake size={32} color="var(--primary)" />
            Gestion des Binômes
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Supervisez l'activité et l'état de santé des paires relationnelles.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Actifs", value: activeCount, color: "var(--primary)", icon: Activity },
          { label: "En évaluation", value: evalCount, color: "#f59e0b", icon: Clock },
          { label: "Terminés", value: closedCount, color: "#10b981", icon: CheckCircle },
          { label: "Total", value: totalItems, color: "var(--violet)", icon: Users },
        ].map(stat => (
          <div key={stat.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <span style={{ color: "var(--text-2)", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Utilisateurs (Binôme)</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Statut</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Santé (Score)</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Début</th>
            </tr>
          </thead>
          <tbody>
            {binomes.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{item.userA.firstName} & {item.userB.firstName}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>{item.userA.email} / {item.userB.email}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                    ...(item.status === 'ACTIVE' ? { background: "rgba(0,169,157,0.1)", color: "var(--primary)" } :
                        item.status === 'CLOSED' ? { background: "rgba(16,185,129,0.1)", color: "#10b981" } :
                        { background: "rgba(245,158,11,0.1)", color: "#f59e0b" })
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: "var(--bg)", borderRadius: 999, overflow: "hidden", minWidth: 60 }}>
                      <div style={{ height: "100%", width: `${item.healthScore}%`, background: item.healthScore > 50 ? "var(--primary)" : "#ef4444", borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-2)" }}>{item.healthScore.toFixed(0)}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-2)", fontSize: 13 }}>
                  {new Date(item.startDate).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
            {binomes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)" }}>
                  Aucun binôme actif.
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
                  <Link key={page} href={`/dashboard/superadmin/binome?page=${page}`} style={{ textDecoration: "none" }}>
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
