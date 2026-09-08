/**
 * @file GamificationSummary.tsx
 * @module src/components/dashboard
 * @description Section Gamification & Progression — design premium harmonisé.
 *
 * Affiche deux métriques clés :
 * 1. Total de points accumulés avec une barre de progression vers le prochain niveau
 * 2. Badges débloqués sous forme de chips premium
 */

"use client";

import Link from "next/link";
import { Star, Award, ChevronRight, Trophy } from "lucide-react";

interface GamificationSummaryProps {
  points: number;
  badges: any[];
}

function getLevel(points: number) {
  if (points >= 500) return { label: "Expert", next: null, progress: 100, color: "#fbbf24", nextPoints: 500 };
  if (points >= 250) return { label: "Avancé", next: "Expert", progress: (points - 250) / 250 * 100, color: "#a78bfa", nextPoints: 500 };
  if (points >= 100) return { label: "Actif", next: "Avancé", progress: (points - 100) / 150 * 100, color: "#34d399", nextPoints: 250 };
  return { label: "Débutant", next: "Actif", progress: points / 100 * 100, color: "#06b6d4", nextPoints: 100 };
}

export function GamificationSummary({ points, badges }: GamificationSummaryProps) {
  const level = getLevel(points);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}>
        {/* ── Points Card ── */}
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(28,21,60,0.6) 100%)",
          border: "1px solid rgba(251,191,36,0.15)",
          padding: "22px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Background orb */}
          <div style={{
            position: "absolute", bottom: -30, right: -30, width: 120, height: 120,
            background: "radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Star size={18} style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Points</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>Progression</p>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8,
              background: `rgba(251,191,36,0.1)`, color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.2)",
            }}>
              {level.label}
            </span>
          </div>

          {/* Score */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16, position: "relative" }}>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800, fontSize: 38,
              background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>{points}</span>
            <span style={{ color: "#475569", fontSize: 14, fontWeight: 500 }}>pts</span>
          </div>

          {/* Progress bar */}
          {level.next && (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#475569" }}>Vers {level.next}</span>
                <span style={{ fontSize: 11, color: "#475569" }}>{level.nextPoints} pts</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.05)" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${Math.min(100, level.progress)}%`,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                  transition: "width 0.8s ease-out",
                  boxShadow: "0 0 8px rgba(251,191,36,0.4)",
                }} />
              </div>
            </div>
          )}

          {!level.next && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trophy size={14} style={{ color: "#fbbf24" }} />
              <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>Niveau maximum atteint 🎉</span>
            </div>
          )}
        </div>

        {/* ── Badges Card ── */}
        <div style={{
          borderRadius: 20,
          background: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(6,28,45,0.5) 100%)",
          border: "1px solid rgba(56,189,248,0.15)",
          padding: "22px 24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", bottom: -30, right: -30, width: 120, height: 120,
            background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Award size={18} style={{ color: "#38bdf8" }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Badges</p>
                <p style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{badges.length} obtenu{badges.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <Link href="/mon-profil" style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "#38bdf8", textDecoration: "none", fontWeight: 500,
            }}>
              Voir tout <ChevronRight size={12} />
            </Link>
          </div>

          <div style={{ position: "relative" }}>
            {badges.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {badges.map((userBadge: any) => (
                  <div
                    key={userBadge.id}
                    title={userBadge.badge.description}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 12px", borderRadius: 10,
                      background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)",
                      fontSize: 12, color: "#cbd5e1", fontWeight: 500,
                      transition: "all 0.2s",
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{userBadge.badge.icon}</span>
                    <span>{userBadge.badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", paddingTop: 8 }}>
                <div style={{
                  width: 44, height: 44, margin: "0 auto 10px",
                  borderRadius: 12, background: "rgba(255,255,255,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Award size={20} style={{ color: "#334155" }} />
                </div>
                <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>
                  Complétez vos défis pour débloquer vos premiers badges !
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
