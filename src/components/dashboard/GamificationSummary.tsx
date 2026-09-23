/**
 * @file GamificationSummary.tsx
 * Version compacte pour intégration dans le header du dashboard.
 */

"use client";

import { Star, Trophy, Award } from "lucide-react";

interface GamificationSummaryProps {
  points: number;
  badges: any[];
}

function getLevel(points: number) {
  if (points >= 500) return { label: "Expert", color: "#fbbf24", progress: 100, next: null, nextPoints: 500 };
  if (points >= 250) return { label: "Avancé", color: "var(--primary)", progress: (points - 250) / 250 * 100, next: "Expert", nextPoints: 500 };
  if (points >= 100) return { label: "Actif", color: "#34d399", progress: (points - 100) / 150 * 100, next: "Avancé", nextPoints: 250 };
  return { label: "Débutant", color: "#06b6d4", progress: points / 100 * 100, next: "Actif", nextPoints: 100 };
}

export function GamificationSummary({ points, badges }: GamificationSummaryProps) {
  const level = getLevel(points);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "var(--bg)", border: "1px solid var(--border)",
      padding: "8px 14px", borderRadius: 12,
    }}>
      {/* Points */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Star size={14} color="#fbbf24" />
        <span style={{
          fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16,
          color: "var(--text-1)"
        }}>{points}</span>
        <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500 }}>pts</span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: "var(--border)" }} />

      {/* Level */}
      <span style={{
        fontSize: 11, fontWeight: 700, color: level.color,
        padding: "2px 8px", borderRadius: 999,
        background: `${level.color}12`, border: `1px solid ${level.color}25`,
      }}>
        {level.label}
      </span>

      {/* Badges count */}
      {badges.length > 0 && (
        <>
          <div style={{ width: 1, height: 20, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Trophy size={12} color="var(--text-3)" />
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-2)" }}>{badges.length}</span>
          </div>
        </>
      )}
    </div>
  );
}
