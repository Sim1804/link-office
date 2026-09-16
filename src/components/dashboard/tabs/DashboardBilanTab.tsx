"use client";

import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { IQRHRadarChart } from "@/components/dashboard/RadarChart";
import { IERGauge } from "@/components/dashboard/IERGauge";
import { TrendingUp, AlertTriangle, Zap, ShieldCheck } from "lucide-react";

const SCORE_CONFIG = (score: number) => {
  if (score >= 80) return { grad: "linear-gradient(135deg, #34d399 0%, #059669 100%)", glow: "rgba(52,211,153,0.4)", text: "Excellent" };
  if (score >= 60) return { grad: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)", glow: "rgba(0,169,157,0.4)", text: "Bon" };
  if (score >= 40) return { grad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", glow: "rgba(245,158,11,0.4)", text: "À renforcer" };
  return { grad: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", glow: "rgba(239,68,68,0.4)", text: "Priorité" };
};

export function DashboardBilanTab({ iqrh, DIMENSIONS_LABELS }: { iqrh: any, DIMENSIONS_LABELS: any }) {
  const score = iqrh?.score_global ?? 0;
  const scoreConfig = SCORE_CONFIG(score);

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>

      {/* ── Row 1 : Hero Score Card + Météo ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
        
        {/* Hero Score */}
        <div style={{
          gridColumn: "1 / 2",
          borderRadius: 16,
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Glow orb */}
          <div style={{
            position: "absolute", bottom: -30, right: -30, width: 160, height: 160,
            background: `radial-gradient(circle, ${scoreConfig.glow} 0%, transparent 70%)`,
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginBottom: 20 }}>
              Score IQRH Global
            </p>
            {/* Score arc display */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
              <div style={{ position: "relative" }}>
                <svg width="90" height="90" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(18,61,70,0.05)" strokeWidth="6" />
                  <circle
                    cx="45" cy="45" r="38" fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 238.76} 238.76`}
                    style={{ transition: "stroke-dasharray 1s ease-out" }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transform: "rotate(0deg)",
                }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                    fontWeight: 800, fontSize: 22,
                    background: scoreConfig.grad,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{score}</span>
                </div>
              </div>
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--primary-glow)", border: "1px solid var(--border-strong)",
                  padding: "4px 12px", borderRadius: 999, marginBottom: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: scoreConfig.grad }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>{scoreConfig.text}</span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>sur 100 points</p>
              </div>
            </div>

            {/* Dimension stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 18px", borderRadius: 999,
                background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.12)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <TrendingUp size={14} style={{ color: "#34d399" }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Point fort</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#34d399" }}>
                  {iqrh?.best_dimension ? (DIMENSIONS_LABELS[iqrh.best_dimension] || iqrh.best_dimension) : "—"}
                </span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 18px", borderRadius: 999,
                background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
                  <span style={{ fontSize: 12, color: "var(--text-2)" }}>Priorité</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b" }}>
                  {iqrh?.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Météo */}
        {iqrh?.weather && (
          <div style={{ gridColumn: "2 / 3" }}>
            <WeatherCard
              icon={iqrh.weather.icon}
              label={iqrh.weather.label}
              title={iqrh.weather.title}
              text={iqrh.weather.text}
              score={iqrh.score_global}
            />
          </div>
        )}

        {/* IER */}
        {iqrh?.ier_score !== undefined && (
          <div style={{
            gridColumn: "3 / 4",
            borderRadius: 16,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            padding: 20,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <IERGauge score={iqrh.ier_score} level={iqrh.ier_level} />
            <p style={{ color: "var(--text-3)", fontSize: 12, textAlign: "center", marginTop: 14, lineHeight: 1.6, maxWidth: 180 }}>
              Homogénéité de votre profil relationnel
            </p>
          </div>
        )}
      </div>

      {/* ── Row 2 : Radar full-width ── */}
      {iqrh?.radar && (
        <div style={{
          marginBottom: 20,
          borderRadius: 16,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          padding: "20px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Left: Radar chart */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-1)", marginBottom: 4 }}>
                  Radar Relationnel
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Vue d'ensemble de vos 5 dimensions</p>
              </div>
              <IQRHRadarChart data={iqrh.radar} priorityDimension={iqrh.priority_dimension} />
            </div>
            {/* Right: Dimension bars */}
            <div>
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 17, color: "var(--text-1)", marginBottom: 4 }}>
                  Détail des Scores
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Score de 0 à 100 par dimension</p>
              </div>
              {iqrh.dimensions && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
                  {iqrh.dimensions.map((dim: any) => {
                    const cfg = SCORE_CONFIG(dim.score);
                    return (
                      <div key={dim.code}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 500 }}>{dim.nom}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{dim.score}<span style={{ color: "var(--text-1)", fontSize: 11, fontWeight: 400 }}>/100</span></span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${dim.score}%`, borderRadius: 999,
                            background: cfg.grad,
                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3 : Forces & Vigilances — Cards premium ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Forces */}
        <div style={{
          borderRadius: 16,
          border: "1px solid rgba(52,211,153,0.15)",
          background: "var(--surface)",
          padding: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 100, height: 100,
            background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={18} style={{ color: "#34d399" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
                Vos Forces
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>3 points d'appui identifiés</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
            {iqrh?.strengths?.length > 0 ? iqrh.strengths.map((str: string, idx: number) => (
              <div key={str} style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  background: "rgba(52,211,153,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: "#34d399",
                }}>
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, flex: 1 }}>{str}</p>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Aucune force identifiée.</p>
            )}
          </div>
        </div>

        {/* Vigilances */}
        <div style={{
          borderRadius: 16,
          border: "1px solid rgba(245,158,11,0.15)",
          background: "var(--surface)",
          padding: 20,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -20, right: -20, width: 100, height: 100,
            background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldCheck size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
                Points de Vigilance
              </h3>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>Zones à cultiver en priorité</p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
            {iqrh?.watchpoints?.length > 0 ? iqrh.watchpoints.map((wpt: string, idx: number) => (
              <div key={wpt} style={{ display: "flex", gap: 12 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  background: "rgba(245,158,11,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 800, color: "#f59e0b",
                }}>
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, flex: 1 }}>{wpt}</p>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: "var(--text-3)" }}>Aucun point de vigilance identifié.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .bilan-row1 { grid-template-columns: 1fr !important; }
          .bilan-row3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
