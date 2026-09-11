import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit2, Trash2, Eye, CheckCircle, XCircle, FileText, Headphones } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Gestion des Médias | Admin LINK OFFICE",
};

export default async function AdminMediaIndex() {
  const mediaItems = await prisma.mediaContent.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true }
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <FileText size={32} color="#c084fc" />
            Médiathèque (CMS)
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Gérez les articles, podcasts et autres contenus publics.</p>
        </div>
        <Link href="/dashboard/superadmin/media/new" style={{ textDecoration: "none" }}>
          <Button>
            <Plus size={16} /> Nouveau Contenu
          </Button>
        </Link>
      </div>

      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(15,23,42,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Titre</th>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Type</th>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Statut</th>
              <th style={{ padding: "16px 20px", textAlign: "left", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Date</th>
              <th style={{ padding: "16px 20px", textAlign: "right", color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mediaItems.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>/{item.slug}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ 
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, 
                    background: item.mediaType === "PODCAST" ? "rgba(192,132,252,0.1)" : "rgba(56,189,248,0.1)", 
                    color: item.mediaType === "PODCAST" ? "#c084fc" : "#38bdf8", fontSize: 12, fontWeight: 600 
                  }}>
                    {item.mediaType === "PODCAST" ? <Headphones size={12} /> : <FileText size={12} />}
                    {item.mediaType.replace("_", " ")}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {item.published ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#34d399", fontSize: 13 }}>
                      <CheckCircle size={14} /> Publié
                    </span>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#f59e0b", fontSize: 13 }}>
                      <XCircle size={14} /> Brouillon
                    </span>
                  )}
                </td>
                <td style={{ padding: "16px 20px", color: "#cbd5e1", fontSize: 13 }}>
                  {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td style={{ padding: "16px 20px", textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                    <Link href={`/media/${item.slug}`} target="_blank" style={{ textDecoration: "none" }}>
                      <Button variant="ghost" size="sm" style={{ padding: 8 }}>
                        <Eye size={16} />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/superadmin/media/${item.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="ghost" size="sm" style={{ padding: 8 }}>
                        <Edit2 size={16} />
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" style={{ padding: 8 }}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {mediaItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "#64748b" }}>
                  Aucun contenu média pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
