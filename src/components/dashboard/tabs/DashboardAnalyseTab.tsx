"use client";

import { User, Lock, Brain, Sparkles, BarChart3, Activity } from "lucide-react";
import Link from "next/link";
import { DimensionsList } from "@/components/dashboard/DimensionsList";

const SCORE_CONFIG = (score: number) => {
  if (score >= 80) return { grad: "linear-gradient(135deg, #34d399 0%, #059669 100%)", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
  if (score >= 60) return { grad: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)", color: "var(--primary)", bg: "var(--primary-glow)", border: "var(--border-strong)" };
  if (score >= 40) return { grad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" };
  return { grad: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" };
};

export function DashboardAnalyseTab({ iqrh, profil, icr, isPremium }: { iqrh: any, profil: any, icr: any, isPremium: boolean }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── IRIS CTA Banner ── */}
      <div className="card" style={{
        borderTop: "3px solid var(--primary)",
        padding: "20px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Brain size={24} color="var(--text-3)" />
          </div>
          <div>
            <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>
              Parler à IRIS — Votre coach IA
            </h3>
            <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 2 }}>
              Analyse personnalisée de vos résultats, guidée par l'intelligence artificielle.
            </p>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-iris", { detail: { tab: "coach" } }))} 
            className="btn btn-primary btn-md"
          >
            Commencer avec IRIS
          </button>
        </div>
      </div>

      {/* ── Main 2-col grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Profil relationnel */}
        <div className="card" style={{ padding: 20, position: "relative", overflow: "hidden" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={16} color="var(--text-3)" />
              </div>
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
                Profil Relationnel
              </h3>
            </div>
            {profil?.signature && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 999,
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
                  background: "rgba(18,61,70,0.05)", color: "var(--text-2)",
                  border: "1px solid var(--border)", fontSize: 12, fontWeight: 500,
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
            <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
              {profil?.profile_description || "Description non disponible."}
            </p>
          </div>

          {/* 5 sous-scores accessibles en Freemium */}
          {iqrh?.dimensions && (
            <div style={{ borderTop: "1px solid rgba(18,61,70,0.05)", paddingTop: 16 }}>
              <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 12 }}>
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
              background: "radial-gradient(circle at center, var(--surface) 0%, rgba(11,15,25,0.85) 100%)",
              backdropFilter: "blur(6px)",
              borderRadius: 16, zIndex: 10,
              border: "1px solid rgba(18,61,70,0.05)"
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: "var(--surface-2)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
              }}>
                <Lock size={22} color="var(--text-1)" />
              </div>
              <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Détail du Profil</p>
              <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 20 }}>Accessible en version Premium</p>
              <Link href="/premium" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
                Débloquer
              </Link>
            </div>
          )}
        </div>

        {/* ICR */}
        {icr && (
          <div style={{
            borderRadius: 16,
            border: "1px solid rgba(245,158,11,0.15)",
            background: "var(--surface)",
            padding: 20,
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
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 15, color: "var(--text-1)" }}>
                  ICR — Complexité de vie
                </h3>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>Indice de Charge Relationnelle</p>
              </div>
            </div>

            {/* Score visuel */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(245,158,11,0.08)", border: "2px solid rgba(245,158,11,0.2)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flexShrink: 0
              }}>
                <span style={{
                  fontSize: 24, fontWeight: 800,
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {icr.icr_score}
                </span>
                <span style={{ fontSize: 9, color: "var(--text-3)", fontWeight: 600 }}>/100</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{
                  display: "inline-block", padding: "4px 12px", borderRadius: 999,
                  background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, fontWeight: 600,
                  marginBottom: 6,
                }}>
                  {icr.niveau_icr}
                </span>
                {icr.interpretation_icr && (
                  <p style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.5 }}>
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
                        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-1)" }}>{val}<span style={{ color: "var(--text-3)", fontWeight: 400 }}>/{max}</span></span>
                      </div>
                      <div style={{ height: 5, borderRadius: 999, background: "rgba(18,61,70,0.05)" }}>
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
                <div style={{ borderTop: "1px solid rgba(18,61,70,0.05)", paddingTop: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 10 }}>
                    Besoins dominants
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {icr.dominant_needs.map((need: string) => (
                      <span key={need} style={{
                        fontSize: 12, padding: "5px 14px", borderRadius: 999,
                        background: "var(--primary-glow)", color: "var(--primary)",
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
                background: "radial-gradient(circle at center, var(--surface) 0%, rgba(11,15,25,0.85) 100%)",
                backdropFilter: "blur(6px)",
                borderRadius: 16, zIndex: 10,
                border: "1px solid rgba(18,61,70,0.05)"
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                }}>
                  <Lock size={22} color="var(--text-1)" />
                </div>
                <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Détail ICR Premium</p>
                <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 20 }}>Décomposition complète réservée aux abonnés</p>
                <Link href="/premium" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
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
