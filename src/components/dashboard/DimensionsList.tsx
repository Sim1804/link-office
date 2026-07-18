/**
 * DimensionsList.tsx — Liste des 5 dimensions avec barres de progression
 */
"use client";

interface Dimension {
  code: string;
  nom: string;
  score: number;
}

interface DimensionsListProps {
  dimensions: Dimension[];
  bestDimension: string;
  priorityDimension: string;
}

export function DimensionsList({ dimensions, bestDimension, priorityDimension }: DimensionsListProps) {
  const getBarGradient = (score: number) => {
    if (score >= 75) return "linear-gradient(90deg, #10b981, #06b6d4)";
    if (score >= 50) return "linear-gradient(90deg, #7c3aed, #06b6d4)";
    if (score >= 30) return "linear-gradient(90deg, #f59e0b, #f97316)";
    return "linear-gradient(90deg, #f43f5e, #dc2626)";
  };

  const getStatus = (nom: string) => {
    if (nom === bestDimension || nom.includes(bestDimension) || bestDimension.includes(nom)) return "force";
    if (nom === priorityDimension || nom.includes(priorityDimension) || priorityDimension.includes(nom)) return "priorité";
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {dimensions.map((dim) => {
        const status = getStatus(dim.nom);
        return (
          <div key={dim.code}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#a78bfa",
                  background: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: 6,
                }}>
                  {dim.code}
                </span>
                <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{dim.nom}</span>
                {status === "force" && (
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                    background: "rgba(16,185,129,0.15)", color: "#34d399",
                    border: "1px solid rgba(16,185,129,0.25)",
                  }}>Force</span>
                )}
                {status === "priorité" && (
                  <span style={{
                    fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 999,
                    background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.25)",
                  }}>Priorité</span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", flexShrink: 0, marginLeft: 8 }}>
                {dim.score}<span style={{ color: "#475569", fontWeight: 400 }}>/100</span>
              </span>
            </div>

            <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: getBarGradient(dim.score),
                width: `${dim.score}%`, transition: "width 0.7s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
