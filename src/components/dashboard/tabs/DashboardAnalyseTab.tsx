"use client";

import { User, Lock, Brain, Sparkles, BarChart3, Activity } from "lucide-react";
import Link from "next/link";
import { DimensionsList } from "@/components/dashboard/DimensionsList";

const SCORE_CONFIG = (score: number) => {
  if (score >= 80) return { grad: "linear-gradient(135deg, #34d399 0%, #059669 100%)", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
  if (score >= 60) return { grad: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)", color: "#a78bfa", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.2)" };
  if (score >= 40) return { grad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" };
  return { grad: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" };
};

export function DashboardAnalyseTab({ iqrh, profil, icr, isPremium }: { iqrh: any, profil: any, icr: any, isPremium: boolean }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── IRIS CTA Banner ── */}
      <div style={{
        borderRadius: 24,
        background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 50%, rgba(124,58,237,0.05) 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        position: "relative", overflow: "hidden",
      }}>
        {/* Animated orbs */}
        <div style={{
          position: "absolute", top: -30, right: 80, width: 120, height: 120,
          background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          borderRadius: "50%", animation: "orbFloat 6s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "orbFloat 6s ease-in-out infinite",
          }}>
            <Brain size={24} style={{ color: "#a78bfa" }} />
          </div>
          <div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>
              Parler à IRIS — Votre coach IA
            </h3>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
              Analyse personnalisée de vos résultats, guidée par l'intelligence artificielle.
            </p>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <Link href="/iris" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            color: "#fff", fontWeight: 600, padding: "12px 24px", borderRadius: 14,
            border: "none", cursor: "pointer", fontSize: 14, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
          }}>
            Commencer avec IRIS
          </Link>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Profil relationnel */}
        <div style={{
          borderRadius: 24,
          border: "1px solid rgba(124,58,237,0.15)",
          background: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(30,27,75,0.3) 100%)",
          padding: 28,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", bottom: -40, right: -40, width: 160, height: 160,
            background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={18} style={{ color: "#a78bfa" }} />
              </div>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>
                Profil Relationnel
              </h3>
            </div>
            {profil?.signature && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
                background: "rgba(6,182,212,0.1)", color: "#06b6d4",
                border: "1px solid rgba(6,182,212,0.2)",
              }}>
                ✨ {profil.signature}
              </span>
            )}
          </div>

          {profil && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              <span style={{
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(124,58,237,0.15)", color: "#c084fc",
                border: "1px solid rgba(124,58,237,0.25)", fontSize: 13, fontWeight: 600,
              }}>
                {profil.profile_primary}
              </span>
              {profil.profile_secondary && (
                <span style={{
                  padding: "5px 12px", borderRadius: 999,
                  background: "rgba(255,255,255,0.05)", color: "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 500,
                }}>
                  {profil.profile_secondary}
                </span>
              )}
            </div>
          )}

          {/* Short description visible to everyone */}
          <div style={{ marginBottom: 20 }}>
            {/* Si Freemium, on n'affiche que les tags principaux/secondaires (déjà fait au-dessus) */}
          </div>

          <div style={!isPremium ? { filter: "blur(4px)", opacity: 0.4, userSelect: "none", pointerEvents: "none" } : {}}>
            <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              {profil?.profile_description || "Description non disponible."}
            </p>
          </div>

          {/* 5 sous-scores accessibles en Freemium */}
          {iqrh?.dimensions && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
              <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
                Détail des scores
              </p>
              <DimensionsList
                dimensions={iqrh.dimensions}
                bestDimension={iqrh.best_dimension}
                priorityDimension={iqrh.priority_dimension}
              />
            </div>
          )}

          {!isPremium && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              background: "rgba(11,15,25,0.5)", backdropFilter: "blur(2px)",
              borderRadius: 24, zIndex: 10,
            }}>
              <Lock size={28} style={{ color: "#a78bfa", marginBottom: 12 }} />
              <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Analyse Premium</p>
              <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Profil détaillé réservé aux abonnés</p>
              <Link href="/premium" style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff", fontWeight: 600, padding: "10px 20px",
                borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13,
                boxShadow: "0 4px 16px rgba(124,58,237,0.4)", textDecoration: "none"
              }}>
                <Sparkles size={14} style={{ marginRight: 6, verticalAlign: "text-bottom" }} />
                Débloquer
              </Link>
            </div>
          )}
        </div>

        {/* ICR */}
        {icr && (
          <div style={{
            borderRadius: 24,
            border: "1px solid rgba(245,158,11,0.15)",
            background: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(41,30,6,0.2) 100%)",
            padding: 28,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Activity size={18} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>
                  ICR — Complexité de vie
                </h3>
                <p style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Indice de Charge Relationnelle</p>
              </div>
            </div>

            {/* Score visuel */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.2)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontSize: 24, fontWeight: 800,
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {icr.icr_score}
                </span>
                <span style={{ fontSize: 9, color: "#64748b", fontWeight: 600 }}>/100</span>
              </div>
              <div>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999,
                  background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, fontWeight: 600,
                  marginBottom: 6,
                }}>
                  {icr.niveau_icr}
                </span>
                {icr.interpretation_icr && (
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, maxWidth: 200 }}>
                    {icr.interpretation_icr}
                  </p>
                )}
              </div>
            </div>

            <div style={!isPremium ? { filter: "blur(4px)", opacity: 0.4, userSelect: "none", pointerEvents: "none" } : {}}>
              {/* Composantes ICR */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {[
                  { label: "Complexité familiale", val: icr.family_complexity, max: 20 },
                  { label: "Complexité professionnelle", val: icr.professional_complexity, max: 20 },
                  { label: "Transitions de vie", val: icr.transition_complexity, max: 20 },
                  { label: "Charge relationnelle", val: icr.relational_load, max: 25 },
                  { label: "Ressources protectrices", val: icr.protective_resources, max: 15, inverse: true },
                ].map(({ label, val, max, inverse }) => {
                  const pct = Math.min(100, (val / max) * 100);
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>{val}<span style={{ color: "#475569", fontWeight: 400 }}>/{max}</span></span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.05)" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, borderRadius: 999,
                          background: inverse
                            ? "linear-gradient(90deg, #34d399, #059669)"
                            : pct > 70 ? "linear-gradient(90deg, #f87171, #ef4444)" : "linear-gradient(90deg, #fbbf24, #f59e0b)",
                          transition: "width 0.8s ease-out",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dominant needs */}
              {icr.dominant_needs && icr.dominant_needs.length > 0 && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
                  <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 10 }}>
                    Besoins dominants
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {icr.dominant_needs.map((need: string) => (
                      <span key={need} style={{
                        fontSize: 12, padding: "4px 12px", borderRadius: 8,
                        background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                        border: "1px solid rgba(124,58,237,0.15)", fontWeight: 500,
                      }}>
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isPremium && (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: "rgba(11,15,25,0.5)", backdropFilter: "blur(2px)",
                borderRadius: 24, zIndex: 10,
              }}>
                <Lock size={28} style={{ color: "#f59e0b", marginBottom: 12 }} />
                <p style={{ color: "#f8fafc", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Détail ICR Premium</p>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Décomposition complète réservée aux abonnés</p>
                <Link href="/premium" style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#fff", fontWeight: 600, padding: "10px 20px",
                  borderRadius: 12, border: "none", cursor: "pointer", fontSize: 13,
                  boxShadow: "0 4px 16px rgba(124,58,237,0.4)", textDecoration: "none"
                }}>
                  Débloquer
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
