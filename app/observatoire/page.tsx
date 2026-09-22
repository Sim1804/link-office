import { BarChart3, Users, Target, Brain, Info } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Observatoire de la Santé Relationnelle | LinkOffice",
  description: "Découvrez en temps réel les indicateurs de santé relationnelle mesurés par l'IQRH.",
};

// Next.js ISR (Incremental Static Regeneration)
export const revalidate = 300; // 5 minutes

async function getObservatoireData() {
  // En SSR/ISR, on doit utiliser l'URL absolue ou appeler la BDD directement.
  // Pour éviter les problèmes d'URL absolue en build, appel direct Prisma ici :
  const { prisma } = await import("@/lib/prisma");

  const aggregations = await prisma.iqrhResult.aggregate({
    _avg: {
      globalScore: true,
      socialScore: true,
      affectiveScore: true,
      sentimentalScore: true,
      professionalScore: true,
      selfScore: true,
    },
    _count: { id: true },
  });

  if (aggregations._count.id === 0) {
    return {
      totalAssessments: 0,
      globalScore: 0,
      dimensions: { social: 0, affective: 0, sentimental: 0, professional: 0, self: 0 },
      leadingDimension: "N/A",
    };
  }

  const scores = {
    "Relations sociales": aggregations._avg.socialScore || 0,
    "Relations affectives": aggregations._avg.affectiveScore || 0,
    "Vie sentimentale": aggregations._avg.sentimentalScore || 0,
    "Vie professionnelle": aggregations._avg.professionalScore || 0,
    "Relation à soi": aggregations._avg.selfScore || 0,
  };

  const leadingDimension = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0];

  return {
    totalAssessments: aggregations._count.id,
    globalScore: Math.round(aggregations._avg.globalScore || 0),
    dimensions: {
      social: Math.round(aggregations._avg.socialScore || 0),
      affective: Math.round(aggregations._avg.affectiveScore || 0),
      sentimental: Math.round(aggregations._avg.sentimentalScore || 0),
      professional: Math.round(aggregations._avg.professionalScore || 0),
      self: Math.round(aggregations._avg.selfScore || 0),
    },
    leadingDimension,
  };
}

export default async function ObservatoirePage() {
  const data = await getObservatoireData();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="container" style={{ maxWidth: 1100 }}>
          
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64, animation: "fadeSlideUp 0.6s ease-out" }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "var(--text-1)", marginBottom: 16, fontFamily: "var(--font-family-display)" }}>
              Observatoire en direct
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 18, maxWidth: 700, margin: "0 auto", lineHeight: 1.6 }}>
              La santé relationnelle mesurée en temps réel. Découvrez les indicateurs de notre baromètre national, mis à jour au fur et à mesure des évaluations IQRH.
            </p>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 64 }}>
            {/* Global Score */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", background: "linear-gradient(135deg, var(--surface) 0%, rgba(124,58,237,0.05) 100%)", border: "1px solid rgba(124,58,237,0.1)" }}>
              <BarChart3 size={40} color="var(--primary)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 8 }}>Score Global Moyen</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 64, fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.globalScore}</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
              </div>
            </div>

            {/* Total Assessments */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
              <Users size={40} color="var(--violet, #7c3aed)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 8 }}>Évaluations Réalisées</h3>
              <span style={{ fontSize: 48, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.totalAssessments.toLocaleString('fr-FR')}</span>
              <p style={{ fontSize: 14, color: "var(--text-3)", marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)", animation: "pulse 2s infinite" }}></span>
                Mise à jour en direct
              </p>
            </div>

            {/* Leading Dimension */}
            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
              <Target size={40} color="var(--rose)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 8 }}>Dimension Phare du moment</h3>
              <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1.2 }}>{data.leadingDimension}</span>
            </div>
          </div>

          {/* Details by Dimension */}
          <div className="card" style={{ padding: 48, marginBottom: 64, borderRadius: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              Météo par dimension
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", columnGap: 64, rowGap: 32 }}>
              {[
                { label: "Relations sociales", score: data.dimensions.social, color: "#5965E8" },
                { label: "Relations affectives", score: data.dimensions.affective, color: "#00A99D" },
                { label: "Vie sentimentale", score: data.dimensions.sentimental, color: "#f43f5e" },
                { label: "Vie professionnelle", score: data.dimensions.professional, color: "#eab308" },
                { label: "Relation à soi", score: data.dimensions.self, color: "#a855f7" },
              ].map((dim) => (
                <div key={dim.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>{dim.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: dim.color }}>{dim.score}/100</span>
                  </div>
                  <div style={{ width: "100%", height: 12, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                    <div 
                      style={{ height: "100%", borderRadius: 999, transition: "width 1s ease-out", width: `${dim.score}%`, backgroundColor: dim.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nouveaux indicateurs : Météos et Besoins/Risques */}
          {(data.weatherDistribution || data.topDominantNeeds) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, marginBottom: 64 }}>
              
              {/* Distribution des Météos */}
              <div className="card" style={{ padding: 32, borderRadius: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <BarChart3 size={16} color="var(--primary)" />
                  </span>
                  Distribution Météo (National)
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(data.weatherDistribution || {})
                    .sort((a: any, b: any) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([weather, count]: [string, any], index) => {
                      const percentage = Math.round((count / data.totalAssessments) * 100);
                      return (
                        <div key={weather}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{weather}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>{percentage}%</span>
                          </div>
                          <div style={{ width: "100%", height: 8, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                            <div style={{ height: "100%", borderRadius: 999, width: `${percentage}%`, background: index === 0 ? "var(--primary)" : "var(--primary-light)" }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Besoins Dominants & Facteurs de Risque */}
              <div className="card" style={{ padding: 32, borderRadius: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={16} color="var(--rose)" />
                  </span>
                  Besoins Dominants & Risques
                </h3>
                
                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 12 }}>Besoins exprimés</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                  {(data.topDominantNeeds || []).map((need: any) => (
                    <span key={need.label} className="badge badge-cyan" style={{ fontSize: 13, padding: "6px 12px" }}>
                      {need.label} <span style={{ opacity: 0.7, marginLeft: 4 }}>{need.pct}%</span>
                    </span>
                  ))}
                </div>

                <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 12 }}>Facteurs de tension</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(data.topRiskFactors || []).map((risk: any) => (
                    <span key={risk.label} className="badge badge-rose" style={{ fontSize: 13, padding: "6px 12px" }}>
                      {risk.label} <span style={{ opacity: 0.7, marginLeft: 4 }}>{risk.pct}%</span>
                    </span>
                  ))}
                </div>
              </div>
              
            </div>
          )}

          {/* Méthodologie et Explications */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            <div className="card" style={{ padding: 32, borderRadius: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Info size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", marginBottom: 16 }}>La méthode scientifique (IQRH)</h3>
              <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.6 }}>
                L'Indice de Qualité Relationnelle Humaine (IQRH) est un référentiel scientifique propriétaire. Il évalue la santé relationnelle à travers 5 dimensions fondamentales. Les données présentées sur cet observatoire sont strictement anonymisées et agrégées pour garantir la confidentialité absolue de nos utilisateurs, conformément au RGPD.
              </p>
            </div>

            <div className="card" style={{ padding: 32, borderRadius: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(89,101,232,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Brain size={24} color="var(--indigo, #5965E8)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", marginBottom: 16 }}>Le rôle de l'IA (Iris)</h3>
              <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.6 }}>
                Au-delà de la simple collecte de données, notre Intelligence Artificielle "Iris" analyse les corrélations subtiles entre vos différents écosystèmes (familial, professionnel, intime). Elle permet de générer des prescriptions relationnelles sur-mesure et d'alimenter cet observatoire en détectant les tendances macros de la société.
              </p>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
