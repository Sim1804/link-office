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
    <a
      href="/mon-profil"
      className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#E3EBE6] shadow-2xs hover:border-[#00A99D]/50 hover:shadow-xs transition-all cursor-pointer group no-underline text-[#123D46]"
      title="Voir ma progression et mes défis"
    >
      {/* Points */}
      <div className="flex items-center gap-1.5">
        <Star size={13} className="text-[#FFC629] fill-[#FFC629]" />
        <span className="font-jakarta font-extrabold text-sm text-[#123D46] tabular-nums">
          {points}
        </span>
        <span className="text-[10px] text-[#123D46]/50 font-bold uppercase">pts</span>
      </div>

      {/* Divider */}
      <div className="w-px h-3.5 bg-[#E3EBE6]" />

      {/* Level */}
      <span
        className="text-[10px] font-jakarta font-bold px-2 py-0.5 rounded-full border leading-tight"
        style={{
          color: level.color,
          background: `${level.color}14`,
          borderColor: `${level.color}30`,
        }}
      >
        {level.label}
      </span>

      {/* Badges count */}
      {badges.length > 0 && (
        <>
          <div className="w-px h-3.5 bg-[#E3EBE6]" />
          <div className="flex items-center gap-1 text-[#123D46]/60 group-hover:text-[#00A99D] transition-colors">
            <Trophy size={12} />
            <span className="text-xs font-jakarta font-bold text-[#123D46]">{badges.length}</span>
          </div>
        </>
      )}
    </a>
  );
}
