/**
 * IERGauge.tsx — Jauge circulaire IER
 */
"use client";

interface IERGaugeProps {
  score: number;
  level: string;
}

export function IERGauge({ score, level }: IERGaugeProps) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 81) return "#10B981";
    if (score >= 61) return "#06B6D4";
    if (score >= 41) return "#F59E0B";
    if (score >= 21) return "#F97316";
    return "#F43F5E";
  };

  const color = getColor();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }} viewBox="0 0 120 120">
          {/* Fond */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progression */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s ease-out", filter: `drop-shadow(0 0 8px ${color}60)` }}
          />
        </svg>
        {/* Texte centré */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc" }}>
            {score}
          </span>
          <span style={{ fontSize: 11, color: "#475569" }}>/100</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>IER</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>{level}</p>
      </div>
    </div>
  );
}
