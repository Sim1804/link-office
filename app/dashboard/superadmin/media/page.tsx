import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, FileText, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";

export const metadata = {
  title: "Gestion des Médias | Admin LINK OFFICE",
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
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 12 }}>
            <FileText size={32} color="var(--violet)" />
            Médiathèque (CMS)
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Gérez les articles, podcasts et autres contenus publics.</p>
        </div>
        <Link href="/dashboard/superadmin/media/new" style={{ textDecoration: "none" }}>
          <Button style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={16} /> Nouveau Contenu
          </Button>
        </Link>
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Titre</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Type</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Statut</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Date</th>
              <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mediaItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>/{item.slug}</div>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  <span className="badge" style={{ 
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px", borderRadius: 12, 
                    background: item.mediaType === "PODCAST" ? "rgba(89,101,232,0.1)" : "rgba(14,165,233,0.1)", 
                    color: item.mediaType === "PODCAST" ? "var(--indigo)" : "var(--cyan)", fontSize: 11, fontWeight: 700 
                  }}>
                    {item.mediaType === "PODCAST" ? <Headphones size={12} /> : <FileText size={12} />}
                    {item.mediaType.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "16px 24px" }}>
                  {item.published ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={14} /> Publié
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#f59e0b", fontSize: 13, fontWeight: 600 }}>
                      <XCircle size={14} /> Brouillon
                    </span>
                  )}
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-2)", fontSize: 13 }}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <Link href={`/media/${item.slug}`} target="_blank" style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ padding: "6px" }} title="Voir">
                        <Eye size={14} />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/superadmin/media/${item.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ padding: "6px" }} title="Modifier">
                        <Edit2 size={14} />
                      </Button>
                    </Link>
                    <DeleteConfirmButton endpoint={`/api/admin/media/${item.id}`} title="Supprimer" />
                  </div>
                </td>
              </tr>
            ))}
            {mediaItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)" }}>
                  Aucun contenu média pour le moment.
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
                  <Link key={page} href={`/dashboard/superadmin/media?page=${page}`} style={{ textDecoration: "none" }}>
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
