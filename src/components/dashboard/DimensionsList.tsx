import { getDimensionStatusInfo } from "@/lib/iqrh/types";

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

export function DimensionsList({ dimensions }: DimensionsListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {dimensions.map((dim) => {
        const info = getDimensionStatusInfo(dim.score);
        return (
          <div key={dim.code}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: "#a78bfa",
                  background: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: 6,
                }}>
                  {dim.code}
                </span>
                <span style={{ fontSize: 13, color: "#f8fafc", fontWeight: 600 }}>{dim.nom}</span>
                
                {/* Badge de Statut Officiel IQRH */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 999,
                  background: info.bg, color: info.color, border: `1px solid ${info.border}`,
                }}>
                  <span>{info.icon}</span>
                  <span>{info.statusLabel}</span>
                  <span style={{ opacity: 0.75, fontWeight: 400, marginLeft: 2 }}>({info.levelLabel})</span>
                </span>
              </div>

              <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", flexShrink: 0 }}>
                {dim.score}<span style={{ color: "#64748b", fontWeight: 400 }}>/100</span>
              </span>
            </div>

            <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: info.gradient,
                width: `${Math.min(100, Math.max(0, dim.score))}%`, transition: "width 0.7s ease",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

