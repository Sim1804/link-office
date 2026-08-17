/**
 * @file DimensionsList.tsx
 * @module src/components/dashboard
 * @description Liste premium des 5 dimensions IQRH avec barres de progression colorées.
 */

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

const DIM_ICONS: Record<string, string> = {
  D1: "🤝",
  D2: "💛",
  D3: "💫",
  D4: "⚡",
  D5: "🧘",
};

export function DimensionsList({ dimensions, bestDimension, priorityDimension }: DimensionsListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {dimensions.map((dimension) => {
        const statusInfo = getDimensionStatusInfo(dimension.score);
        const isBest = dimension.nom.toUpperCase().includes(bestDimension) || bestDimension?.includes(dimension.code);
        const isPriority = dimension.nom.toUpperCase().includes(priorityDimension) || priorityDimension?.includes(dimension.code);

        return (
          <div key={dimension.code} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Code badge */}
                <span style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.15)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#a78bfa",
                }}>
                  {DIM_ICONS[dimension.code] || dimension.code}
                </span>
                {/* Name */}
                <span style={{ fontSize: 13, color: "#f8fafc", fontWeight: 600 }}>{dimension.nom}</span>
                {/* Best/Priority badges */}
                {isBest && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                    background: "rgba(52,211,153,0.12)", color: "#34d399",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}>↑ Top</span>
                )}
                {isPriority && !isBest && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6,
                    background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}>⚠ Priorité</span>
                )}
              </div>
              {/* Score */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                  background: statusInfo.bg, color: statusInfo.color,
                  border: `1px solid ${statusInfo.border}`,
                }}>
                  {statusInfo.statusLabel}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: statusInfo.color, minWidth: 30, textAlign: "right" }}>
                  {dimension.score}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.04)", overflow: "hidden", marginLeft: 36 }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: statusInfo.gradient,
                width: `${Math.min(100, Math.max(0, dimension.score))}%`,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
