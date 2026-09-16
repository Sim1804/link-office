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
  if (points >= 250) return { label: "Avancé", next: "Expert", progress: (points - 250) / 250 * 100, color: "var(--primary)", nextPoints: 500 };
  if (points >= 100) return { label: "Actif", next: "Avancé", progress: (points - 100) / 150 * 100, color: "#34d399", nextPoints: 250 };
  return { label: "Débutant", next: "Actif", progress: points / 100 * 100, color: "#06b6d4", nextPoints: 100 };
}

export function GamificationSummary({ points, badges }: GamificationSummaryProps) {
  const level = getLevel(points);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        borderRadius: 16,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        padding: "16px 24px",
      }}>
        {/* ── Points & Level ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, flex: 1, minWidth: 280 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Star size={16} style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 18,
                  background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{points}</span>
                <span style={{ color: "var(--text-3)", fontSize: 12, fontWeight: 500 }}>pts</span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-3)" }}>Progression</p>
            </div>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: level.color }}>{level.label}</span>
              {level.next && <span style={{ fontSize: 10, color: "var(--text-3)" }}>Vers {level.next}</span>}
            </div>
            {level.next && (
              <div style={{ height: 4, borderRadius: 999, background: "rgba(18,61,70,0.05)" }}>
                <div style={{
                  height: "100%", borderRadius: 999,
                  width: `${Math.min(100, level.progress)}%`,
                  background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                }} />
              </div>
            )}
          </div>
        </div>

        {/* ── Vertical Divider ── */}
        <div style={{ width: 1, height: 32, background: "var(--surface-2)", display: "block" }} />

        {/* ── Badges ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Trophy size={16} color="var(--text-3)" />
            <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>Badges</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {badges.length === 0 ? (
              <span style={{ fontSize: 12, color: "var(--text-3)", fontStyle: "italic" }}>Aucun badge</span>
            ) : (
              badges.slice(0, 3).map(b => (
                <div key={b.id} title={b.badge.description} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 999,
                  background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)",
                }}>
                  <Award size={12} color="var(--primary)" />
                  <span style={{ fontSize: 11, color: "#c084fc", fontWeight: 600 }}>{b.badge.name}</span>
                </div>
              ))
            )}
            {badges.length > 3 && (
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>+{badges.length - 3}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
