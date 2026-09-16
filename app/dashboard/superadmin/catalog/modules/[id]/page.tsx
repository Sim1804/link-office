import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Target, LayoutList } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export const metadata = { title: "Détail du Module Adaptatif — LinkOffice" };

export default async function ModuleDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const isDimension = params.id.startsWith("DIM_");
  let detailItem: any = null;

  if (isDimension) {
    const dimensionName = params.id.replace("DIM_", "");
    const questions = await prisma.question.findMany({
      where: { dimension: dimensionName as any },
      orderBy: { position: "asc" }
    });

    if (questions.length > 0) {
      const dimensionObjectives: Record<string, string> = {
        SOCIAL: "Évaluer la qualité, la fréquence et le niveau de soutien du réseau social.",
        AFFECTIVE: "Mesurer la présence et la qualité des relations de soutien émotionnel.",
        SENTIMENTAL: "Évaluer la qualité de la vie sentimentale et l'intimité.",
        PROFESSIONAL: "Mesurer l'engagement, la reconnaissance et la qualité des relations professionnelles.",
        SELF: "Évaluer l'estime de soi, le sens de la vie et la relation globale à soi-même."
      };

      const versionList = questions.map(q => q.version).filter(v => typeof v === 'number');
      const maxVersion = versionList.length > 0 ? Math.max(...versionList) : 1;

      detailItem = {
        id: params.id,
        title: `Dimension ${dimensionName}`,
        triggerSituation: "Universel",
        objective: dimensionObjectives[dimensionName] || "Évaluer cette dimension",
        version: maxVersion,
        isActive: questions.some(q => q.isActive),
        questions
      };
    }
  } else {
    detailItem = await prisma.adaptiveModule.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { position: "asc" } } }
    });
  }

  if (!detailItem) {
    redirect("/dashboard/superadmin/catalog");
  }

  return (
    <>
      <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: "40px" }}>
        <div style={{ marginBottom: 24 }}>
          <Link href="/dashboard/superadmin/catalog" style={{ color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 14, fontWeight: 500 }}>
            <ArrowLeft size={16} /> Retour au catalogue
          </Link>
        </div>

        <div style={{ background: "var(--surface)", borderRadius: 16, padding: 32, border: "1px solid var(--border)", marginBottom: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14,165,233,0.1)", color: "var(--sky)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>{detailItem.title}</h1>
              <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "monospace", marginTop: 4 }}>ID: {detailItem.id}</div>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 24 }}>
            <div style={{ padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Cible / Déclencheur</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>{detailItem.triggerSituation}</div>
            </div>
            <div style={{ padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Objectif</div>
              <div style={{ fontSize: 14, color: "var(--text-1)", fontWeight: 500 }}>{detailItem.objective}</div>
            </div>
            <div style={{ padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Informations</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge" style={{ fontSize: 12, padding: "2px 8px", background: "var(--surface)", color: "var(--text-2)", border: "1px solid var(--border)" }}>v{detailItem.version}</span>
                <span className="badge" style={{ fontSize: 12, padding: "2px 8px", background: detailItem.isActive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)", color: detailItem.isActive ? "var(--emerald)" : "var(--rose)" }}>
                  {detailItem.isActive ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <LayoutList size={20} color="var(--violet)" />
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Questions du module ({detailItem.questions.length})</h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {detailItem.questions.map((q: any, index: number) => (
            <div key={q.id} style={{ padding: 20, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "var(--text-2)", flexShrink: 0 }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text-1)", marginBottom: 8, lineHeight: 1.5 }}>
                  {q.text}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-3)", background: "var(--bg)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)" }}>
                    {q.id}
                  </span>
                  <span className="badge" style={{ fontSize: 10, padding: "2px 6px", background: "var(--bg)", color: "var(--text-2)", border: "1px solid var(--border)" }}>v{q.version}</span>
                  {!q.isActive && (
                    <span className="badge" style={{ fontSize: 10, padding: "2px 6px", background: "rgba(244,63,94,0.1)", color: "var(--rose)" }}>Inactif</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {detailItem.questions.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
              Ce module ne contient aucune question.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
