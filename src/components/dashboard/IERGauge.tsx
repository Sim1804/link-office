/**
 * @file IERGauge.tsx
 * @module src/components/dashboard
 * @description Jauge circulaire SVG de l'IER — design premium avec double arc et halo.
 */

"use client";

interface IERGaugeProps {
  score: number;
  level: string;
}

function getIerTheme(score: number) {
  if (score >= 81) return { color: "#34d399", glow: "rgba(52,211,153,0.4)", label: "Excellent" };
  if (score >= 61) return { color: "#06b6d4", glow: "rgba(6,182,212,0.4)", label: "Bon" };
  if (score >= 41) return { color: "#f59e0b", glow: "rgba(245,158,11,0.4)", label: "Modéré" };
  if (score >= 21) return { color: "#f97316", glow: "rgba(249,115,22,0.4)", label: "Faible" };
  return { color: "#f43f5e", glow: "rgba(244,63,94,0.4)", label: "Critique" };
}

export function IERGauge({ score, level }: IERGaugeProps) {
  const RADIUS = 50;
  const circumference = 2 * Math.PI * RADIUS;
  const strokeOffset = circumference - (score / 100) * circumference;
  const theme = getIerTheme(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg
          viewBox="0 0 120 120"
          style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
        >
          {/* Piste de fond */}
          <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          {/* Second ring léger décoratif */}
          <circle cx="60" cy="60" r={RADIUS - 12} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
          {/* Arc principal */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={theme.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            style={{
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)",
              filter: `drop-shadow(0 0 10px ${theme.glow})`,
            }}
          />
        </svg>

        {/* Centre */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
            fontWeight: 800, fontSize: 26, color: theme.color,
            lineHeight: 1,
          }}>
            {score}
          </span>
          <span style={{ fontSize: 10, color: "#475569", fontWeight: 500, marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Label */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <p style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 4 }}>
          Équilibre IER
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `rgba(0,0,0,0.2)`, padding: "4px 12px", borderRadius: 999,
          border: `1px solid ${theme.color}20`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.color, boxShadow: `0 0 6px ${theme.glow}` }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{level}</span>
        </div>
      </div>
    </div>
  );
}
