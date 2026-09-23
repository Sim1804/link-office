import { BarChart3, Users, Activity, TrendingUp, ShieldCheck } from "lucide-react";
import { BarometreClientCharts } from "./BarometreClientCharts";

async function getObservatoireData() {
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

export async function ObservatoireSection() {
  const data = await getObservatoireData();

  const radarData = [
    { subject: "Social", score: data.dimensions.social },
    { subject: "Affectif", score: data.dimensions.affective },
    { subject: "Sentimental", score: data.dimensions.sentimental },
    { subject: "Pro", score: data.dimensions.professional },
    { subject: "Soi", score: data.dimensions.self },
  ];

  // Données fictives pour la V1
  const lineData = [
    { month: "Jan", score: 62 }, { month: "Fév", score: 63 }, { month: "Mar", score: 65 },
    { month: "Avr", score: 66 }, { month: "Mai", score: 65 }, { month: "Juin", score: 68 },
    { month: "Juil", score: 67 }, { month: "Août", score: 69 }, { month: "Sep", score: data.globalScore || 70 }
  ];

  const profilsData = [
    { name: "Connecté", value: 38, color: "#10b981" },
    { name: "Sélectif", value: 24, color: "var(--primary)" },
    { name: "Solitaire", value: 18, color: "#f59e0b" },
    { name: "Isolé", value: 12, color: "#ef4444" },
    { name: "En transition", value: 8, color: "#a855f7" }
  ];

  return (
    <section id="observatoire" className="section" style={{ background: "linear-gradient(180deg, var(--bg) 0%, rgba(0,169,157,0.02) 100%)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "64px 0" }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="badge badge-outline" style={{ marginBottom: 12, fontSize: 11, padding: "4px 12px" }}>En temps réel</span>
          <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(24px, 3vw, 36px)", color: "var(--text-1)", marginBottom: 12 }}>
            Baromètre <span style={{ color: "var(--primary)" }}>National</span>
          </h2>
          <p style={{ color: "var(--text-2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6, fontSize: 15 }}>
            Découvrez les grandes tendances de la santé relationnelle mises à jour par notre algorithme.
          </p>
        </div>

        {/* Colonne de gauche : KPIs compacts en Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
          {/* Global Score */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, background: "var(--surface)", borderTop: "3px solid var(--primary)", borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={28} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 4 }}>IQRH National</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.globalScore || "--"}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, background: "var(--surface)", borderTop: "3px solid var(--indigo)", borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={28} color="var(--indigo)" />
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 4 }}>Participants</h3>
              <div style={{ fontSize: 32, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                {data.totalAssessments > 0 ? data.totalAssessments.toLocaleString('fr-FR') : "--"}
              </div>
            </div>
          </div>

          {/* Point Fort */}
          <div className="card" style={{ padding: 24, background: "linear-gradient(135deg, var(--indigo) 0%, var(--primary) 100%)", borderRadius: 16, color: "white", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <ShieldCheck size={16} /> Point Fort National
            </h3>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-family-display)", lineHeight: 1.2 }}>
              {data.leadingDimension !== "N/A" ? data.leadingDimension : "En attente"}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", gap: 6 }}>
              <TrendingUp size={16} /> Dimension préservée
            </div>
          </div>
        </div>

        {/* Colonne de droite : Graphiques compacts (Radar, Tendance, Profils) */}
        <BarometreClientCharts radarData={radarData} lineData={lineData} profilsData={profilsData} />

      </div>
    </section>
  );
}
