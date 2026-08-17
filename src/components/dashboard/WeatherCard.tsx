/**
 * @file WeatherCard.tsx
 * @module src/components/dashboard
 * @description Carte de la Météo Relationnelle — design premium harmonisé.
 */

"use client";

interface WeatherCardProps {
  icon: string;
  label: string;
  title: string;
  text: string;
  score: number;
}

function getWeatherTheme(score: number) {
  if (score >= 81) return {
    gradient: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(35,30,8,0.4) 100%)",
    border: "rgba(251,191,36,0.2)",
    orb: "rgba(251,191,36,0.15)",
    bar: "linear-gradient(90deg, #fbbf24, #f59e0b)",
    score: "#fbbf24",
  };
  if (score >= 61) return {
    gradient: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(6,28,45,0.4) 100%)",
    border: "rgba(6,182,212,0.2)",
    orb: "rgba(6,182,212,0.12)",
    bar: "linear-gradient(90deg, #06b6d4, #0284c7)",
    score: "#06b6d4",
  };
  if (score >= 41) return {
    gradient: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(20,20,30,0.4) 100%)",
    border: "rgba(100,116,139,0.2)",
    orb: "rgba(100,116,139,0.1)",
    bar: "linear-gradient(90deg, #94a3b8, #64748b)",
    score: "#94a3b8",
  };
  if (score >= 21) return {
    gradient: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(45,18,5,0.4) 100%)",
    border: "rgba(249,115,22,0.2)",
    orb: "rgba(249,115,22,0.12)",
    bar: "linear-gradient(90deg, #f97316, #ef4444)",
    score: "#f97316",
  };
  return {
    gradient: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(40,5,15,0.4) 100%)",
    border: "rgba(244,63,94,0.2)",
    orb: "rgba(244,63,94,0.12)",
    bar: "linear-gradient(90deg, #f43f5e, #e11d48)",
    score: "#f43f5e",
  };
}

export function WeatherCard({ icon, label, title, text, score }: WeatherCardProps) {
  const theme = getWeatherTheme(score);

  return (
    <div style={{
      background: theme.gradient,
      border: `1px solid ${theme.border}`,
      borderRadius: 24,
      padding: 24,
      position: "relative",
      overflow: "hidden",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    }}>
      {/* Background glow orb */}
      <div style={{
        position: "absolute", bottom: -40, right: -40, width: 150, height: 150,
        background: `radial-gradient(circle, ${theme.orb} 0%, transparent 70%)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />
      {/* Giant faint emoji watermark */}
      <div style={{
        position: "absolute", right: -4, top: -4, fontSize: 90,
        opacity: 0.07, userSelect: "none", pointerEvents: "none", lineHeight: 1,
      }}>
        {icon}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <p style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 16 }}>
          Météo Relationnelle
        </p>

        {/* Icon + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 40, lineHeight: 1, animation: "weatherFloat 6s ease-in-out infinite" }}>{icon}</span>
          <div>
            <p style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 2 }}>{label}</p>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 700, fontSize: 20, color: "#f8fafc",
            }}>
              {title}
            </h3>
          </div>
        </div>

        {/* Text */}
        <p style={{ color: "#64748b", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>{text}</p>
      </div>

      {/* Score bar */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "#475569", fontWeight: 500 }}>Score global</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: theme.score }}>{score}<span style={{ fontSize: 11, color: "#475569", fontWeight: 400 }}>/100</span></span>
        </div>
        <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 999,
            background: theme.bar, width: `${score}%`,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: `0 0 8px ${theme.orb}`,
          }} />
        </div>
      </div>

      <style>{`
        @keyframes weatherFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
