/**
 * WeatherCard.tsx — Carte Météo Relationnelle
 */
"use client";

interface WeatherCardProps {
  icon: string;
  label: string;
  title: string;
  text: string;
  score: number;
}

export function WeatherCard({ icon, label, title, text, score }: WeatherCardProps) {
  const getGradient = () => {
    if (score >= 81) return "linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(234,179,8,0.06) 100%)";
    if (score >= 61) return "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.06) 100%)";
    if (score >= 41) return "linear-gradient(135deg, rgba(100,116,139,0.12) 0%, rgba(71,85,105,0.06) 100%)";
    if (score >= 21) return "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(239,68,68,0.06) 100%)";
    return "linear-gradient(135deg, rgba(244,63,94,0.12) 0%, rgba(225,29,72,0.06) 100%)";
  };

  const getBorderColor = () => {
    if (score >= 81) return "rgba(251,191,36,0.2)";
    if (score >= 61) return "rgba(6,182,212,0.2)";
    if (score >= 41) return "rgba(100,116,139,0.2)";
    if (score >= 21) return "rgba(249,115,22,0.2)";
    return "rgba(244,63,94,0.2)";
  };

  return (
    <div style={{
      background: getGradient(),
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: `1px solid ${getBorderColor()}`,
      borderRadius: 20,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Emoji décoratif fond */}
      <div style={{
        position: "absolute", right: -8, top: -8,
        fontSize: 80, opacity: 0.08,
        userSelect: "none", pointerEvents: "none",
        lineHeight: 1,
      }}>
        {icon}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <span style={{ fontSize: 44, lineHeight: 1, animation: "float 6s ease-in-out infinite" }}>{icon}</span>
          <div>
            <p style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 4 }}>
              Météo relationnelle
            </p>
            <p style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}>{label}</p>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "#f8fafc" }}>{title}</h3>
          </div>
        </div>

        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{text}</p>

        {/* Barre de score */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999,
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
              width: `${score}%`, transition: "width 0.7s ease",
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", flexShrink: 0 }}>{score}/100</span>
        </div>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}
