import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, BookOpen, Edit2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeleteConfirmButton } from "@/components/ui/DeleteConfirmButton";
import { Select } from "@/components/ui/Select";
import { CatalogImportButton } from "@/components/admin/CatalogImportButton";

export const metadata = { title: "Catalogue (Back-Office) — LinkOffice" };
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
            <BookOpen size={24} color="var(--primary)" />
            Catalogue Central
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-2)" }}>Gérez les recommandations, les micro-défis et la liste des partenaires.</p>
        </div>
        
        <div style={{ display: "flex", gap: 12 }}>
          <CatalogImportButton />
          <Link href="/dashboard/superadmin/catalog/new" style={{ textDecoration: "none" }}>
            <Button style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Plus size={18} /> Ajouter un élément
            </Button>
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--surface)", paddingBottom: 16, overflowX: "auto" }}>
        {["ALL", "Recommandations", "Micro-défis", "Partenaires", "Questions IQRH", "Modules Adaptatifs"].map(f => (
          <Link key={f} href={`/dashboard/superadmin/catalog?filter=${f}`} style={{ textDecoration: "none" }}>
            <span style={{ 
              padding: "6px 16px", 
              borderRadius: 16, 
              fontSize: 13, 
              fontWeight: 600,
              background: filter === f ? "rgba(0,169,157,0.1)" : "var(--surface)",
              color: filter === f ? "var(--primary)" : "var(--text-2)",
              border: filter === f ? "1px solid rgba(0,169,157,0.3)" : "1px solid var(--surface)",
              transition: "all 0.2s"
            }}>
              {f === "ALL" ? "Tout voir" : f}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
              {isQuestionFilter || isModuleFilter ? (
                <>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>ID & {isQuestionFilter ? "Dimension" : "Cible"}</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Objectif</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase" }}>Questions / Version</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", textAlign: "right" }}>Statut</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                </>
              ) : (
                <>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Titre & Type</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Thèmes</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ciblage</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              if (item.isDimensionGroup || isModuleFilter) {
                return (
                  <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                        <span className="badge" style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, padding: "2px 8px", background: "var(--surface)", color: "var(--text-3)", borderRadius: 12, border: "1px solid var(--border)" }}>
                          {item.id}
                        </span>
                        {item.isDimensionGroup ? (
                          <span className="badge" style={{ 
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, 
                            background: item.dimensionName === "SOCIAL" ? "rgba(0,169,157,0.1)" :
                                        item.dimensionName === "AFFECTIVE" ? "rgba(244,63,94,0.1)" :
                                        item.dimensionName === "SENTIMENTAL" ? "rgba(89,101,232,0.1)" :
                                        item.dimensionName === "PROFESSIONAL" ? "rgba(255,198,41,0.1)" :
                                        item.dimensionName === "SELF" ? "rgba(14,165,233,0.1)" :
                                        "rgba(52,211,153,0.1)",
                            color: item.dimensionName === "SOCIAL" ? "var(--primary)" :
                                   item.dimensionName === "AFFECTIVE" ? "var(--rose)" :
                                   item.dimensionName === "SENTIMENTAL" ? "var(--indigo)" :
                                   item.dimensionName === "PROFESSIONAL" ? "var(--amber)" :
                                   item.dimensionName === "SELF" ? "var(--cyan)" :
                                   "var(--success)"
                          }}>
                            {item.dimensionLabel}
                          </span>
                        ) : (
                          <span className="badge" style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: "rgba(0,169,157,0.1)", color: "var(--primary)" }}>
                            {item.triggerSituation || "Universel"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "var(--text-2)", fontSize: 13 }}>{item.objective}</td>
                    <td style={{ padding: "16px 24px", color: "var(--text-2)", fontSize: 13 }}>
                      {item.questions?.length || 0} questions (v{item.version})
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <span className="badge" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: item.isActive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: item.isActive ? "var(--emerald)" : "var(--rose)" }}>
                        {item.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                        <Link href={`/dashboard/superadmin/catalog/modules/${item.id}`} style={{ textDecoration: "none" }}>
                          <Button variant="secondary" size="sm" style={{ padding: "6px" }} title="Voir les questions">
                            <Eye size={14} />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              }

              const data = item.data as any || {};
              return (
              <tr key={item.id} className="table-row-hover" style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
                    <span className="badge" style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 600, padding: "2px 8px", background: "var(--surface)", color: "var(--text-3)", borderRadius: 12, border: "1px solid var(--border)" }}>
                      {item.id}
                    </span>
                    <span className="badge" style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
                      background: item.library === "Micro-défis" ? "rgba(0,169,157,0.1)" : item.library === "Partenaires" ? "rgba(255,198,41,0.15)" : "rgba(89,101,232,0.1)",
                      color: item.library === "Micro-défis" ? "var(--cyan)" : item.library === "Partenaires" ? "var(--amber)" : "var(--indigo)",
                    }}>
                      {item.library}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "var(--text-1)", fontWeight: 500, fontSize: 13 }}>{item.title}</td>
                <td style={{ padding: "16px 24px", color: "var(--text-2)", fontSize: 13 }}>{item.category || "—"}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {item.library === "Recommandations" && data.impact_attendu_1_5 && (
                      <span className="badge" style={{ fontSize: 11, padding: "2px 8px", borderColor: "rgba(16,185,129,0.3)", color: "var(--emerald)", background: "rgba(16,185,129,0.1)" }}>⭐ Impact {data.impact_attendu_1_5}</span>
                    )}
                    {item.library === "Micro-défis" && data.points && (
                      <span className="badge" style={{ fontSize: 11, padding: "2px 8px", borderColor: "rgba(56,189,248,0.3)", color: "var(--cyan)", background: "rgba(56,189,248,0.1)" }}>💎 {data.points} pts</span>
                    )}
                    {item.library === "Partenaires" && data.territoire && (
                      <span className="badge" style={{ fontSize: 11, padding: "2px 8px", borderColor: "rgba(249,115,22,0.3)", color: "#f97316", background: "rgba(249,115,22,0.1)" }}>📍 {data.territoire}</span>
                    )}
                    {(data.difficulte) && (
                      <span className="badge" style={{ fontSize: 11, padding: "2px 8px", borderColor: "var(--border-strong)", color: "var(--text-2)", background: "var(--surface)" }}>⏳ {data.difficulte}</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    <Link href={`/dashboard/superadmin/catalog/${item.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm" style={{ padding: "6px" }} title="Modifier">
                        <Edit2 size={14} />
                      </Button>
                    </Link>
                    <DeleteConfirmButton endpoint={`/api/admin/catalog/${item.id}`} title={`Supprimer ${item.id}`} />
                  </div>
                </td>
              </tr>
            )})}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)" }}>Aucun élément trouvé.</td>
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
                  <Link key={page} href={`/dashboard/superadmin/catalog?filter=${filter}&page=${page}`} style={{ textDecoration: "none" }}>
                    <button style={{ 
                      width: 32, height: 32, borderRadius: "50%", 
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "var(--primary)" : "transparent", 
                      border: isActive ? "none" : "1px solid var(--border)", 
                      color: isActive ? "white" : "var(--text-2)", 
                      fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                    }}>
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
