import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Catalogue (Back-Office) — LinkOffice" };
export const dynamic = "force-dynamic";

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ filter?: string, page?: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const filter = params.filter || "ALL";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 20;

  const whereClause = filter !== "ALL" ? { library: filter } : undefined;

  const [items, totalItems] = await Promise.all([
    prisma.libraryItem.findMany({
      where: whereClause,
      orderBy: { library: "asc" },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.libraryItem.count({ where: whereClause })
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        
        <div className="page-container-wide">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Link href="/dashboard" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14 }}>
              <ArrowLeft size={16} /> Retour
            </Link>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <BookOpen size={32} color="#c084fc" />
            Catalogue 
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Gérez les recommandations, les défis et les partenaires de l'application.</p>
        </div>
        
        <Link href="/dashboard/superadmin/catalog/new" style={{ textDecoration: "none" }}>
          <Button>
            <Plus size={18} /> Ajouter un élément
          </Button>
        </Link>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        {["ALL", "Recommandations", "Micro-défis", "Partenaires"].map((f) => (
          <Link key={f} href={`/dashboard/superadmin/catalog?filter=${f}`} style={{ textDecoration: "none" }}>
            <span style={{
              padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: 600,
              background: filter === f ? "rgba(192,132,252,0.2)" : "rgba(30,41,59,0.5)",
              color: filter === f ? "#c084fc" : "#cbd5e1",
              border: filter === f ? "1px solid rgba(192,132,252,0.4)" : "1px solid transparent",
              transition: "all 0.2s"
            }}>
              {f === "ALL" ? "Tout voir" : f}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>ID</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Type</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Titre</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Catégorie</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Détails clés</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const data = item.data as any || {};
              return (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 24px", color: "#cbd5e1", fontFamily: "monospace", fontSize: 13 }}>
                  {item.id}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                    background: item.library === "Micro-défis" ? "rgba(56,189,248,0.15)" : item.library === "Partenaires" ? "rgba(249,115,22,0.15)" : "rgba(192,132,252,0.15)",
                    color: item.library === "Micro-défis" ? "#38bdf8" : item.library === "Partenaires" ? "#f97316" : "#c084fc",
                  }}>
                    {item.library}
                  </span>
                </td>
                <td style={{ padding: "16px 24px", color: "#f8fafc", fontWeight: 500, fontSize: 14, textTransform: item.library === "Partenaires" ? "capitalize" : "none" }}>{item.library === "Partenaires" ? item.title.toLowerCase() : item.title}</td>
                <td style={{ padding: "16px 24px", color: "#94a3b8", fontSize: 14 }}>{item.category || "—"}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {item.library === "Recommandations" && data.impact_attendu_1_5 && (
                      <span className="badge" style={{ borderColor: "rgba(16,185,129,0.3)", color: "#34d399", background: "rgba(16,185,129,0.1)" }}>⭐ Impact {data.impact_attendu_1_5}</span>
                    )}
                    {item.library === "Micro-défis" && data.points && (
                      <span className="badge" style={{ borderColor: "rgba(56,189,248,0.3)", color: "#38bdf8", background: "rgba(56,189,248,0.1)" }}>💎 {data.points} pts</span>
                    )}
                    {item.library === "Partenaires" && data.territoire && (
                      <span className="badge" style={{ borderColor: "rgba(249,115,22,0.3)", color: "#f97316", background: "rgba(249,115,22,0.1)" }}>📍 {data.territoire}</span>
                    )}
                    {(data.difficulte) && (
                      <span className="badge" style={{ borderColor: "rgba(255,255,255,0.1)", color: "#cbd5e1", background: "rgba(255,255,255,0.05)" }}>⏳ {data.difficulte}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <Link href={`/dashboard/superadmin/catalog/${item.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ padding: "8px" }}>
                        <Edit2 size={16} />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            )})}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>Aucun élément trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: "0 8px" }}>
          <div style={{ color: "#94a3b8", fontSize: 14 }}>
            Affichage de <strong>{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> à <strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> sur <strong>{totalItems}</strong> éléments
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link 
              href={currentPage > 1 ? `/dashboard/superadmin/catalog?filter=${filter}&page=${currentPage - 1}` : "#"} 
              style={{ pointerEvents: currentPage <= 1 ? "none" : "auto", textDecoration: "none" }}
            >
              <Button variant="secondary" size="sm" style={{ opacity: currentPage <= 1 ? 0.5 : 1 }}>
                Précédent
              </Button>
            </Link>
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 8px" }}>
              <span style={{ fontSize: 14, color: "#f8fafc", fontWeight: 500 }}>Page {currentPage} / {totalPages}</span>
            </div>

            <Link 
              href={currentPage < totalPages ? `/dashboard/superadmin/catalog?filter=${filter}&page=${currentPage + 1}` : "#"} 
              style={{ pointerEvents: currentPage >= totalPages ? "none" : "auto", textDecoration: "none" }}
            >
              <Button variant="secondary" size="sm" style={{ opacity: currentPage >= totalPages ? 0.5 : 1 }}>
                Suivant
              </Button>
            </Link>
          </div>
        </div>
      )}

    </div>
    </main>
    </>
  );
}
