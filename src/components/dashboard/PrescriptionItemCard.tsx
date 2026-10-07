/**
 * @file PrescriptionItemCard.tsx
 * @module src/components/dashboard
 * @description Carte interactive d'un élément de l'ordonnance relationnelle — design premium.
 */

"use client";

import { useState } from "react";
import { Check, Loader2, Target, BookOpen, Handshake, Clock, Zap, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";

const formatList = (str: any) => {
  if (typeof str !== 'string') return str;
  return str.split(";").join("; ");
};

export function PrescriptionItemCard({ item }: { item: any }) {
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const isAlreadyCompleted = item.status === "COMPLETED";
  const challengeRewardPoints = item.libraryItem?.data?.points || 50;

  const handleCompleteChallenge = async () => {
    if (isAlreadyCompleted || item.kind !== "MICRO_CHALLENGE") return;
    setIsValidating(true);
    try {
      const response = await fetch("/api/gamification/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionItemId: item.id }),
      });
      if (response.ok) router.refresh();
    } catch (error) {
      console.error("[CHALLENGE_COMPLETE_ERROR]:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // Thème selon le type
  const theme = {
    MICRO_CHALLENGE: {
      emoji: "🎯",
      label: "Micro-défi",
      textClass: "text-[#00A99D]",
    },
    RECOMMENDATION: {
      emoji: "📖",
      label: "Recommandation",
      textClass: "text-[#5965E8]",
    },
    PARTNER: {
      emoji: "🤝",
      label: "Partenaire",
      textClass: "text-[#B8870A]",
    },
  };

  const t = theme[item.kind as keyof typeof theme] || theme.RECOMMENDATION;

  return (
    <div 
      className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${isAlreadyCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#E3EBE6]'}`}
    >
      <div className="space-y-3 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isAlreadyCompleted ? 'text-emerald-600' : t.textClass}`}>
            {t.emoji} {isAlreadyCompleted && item.kind === "MICRO_CHALLENGE" ? "Validé" : t.label}
          </span>
          <span className="font-mono text-xs font-bold text-[#123D46]/40">
            #{String(item.position).padStart(2, '0')}
          </span>
        </div>

        {/* Title */}
        <h4 className={`font-jakarta font-bold text-base leading-snug ${isAlreadyCompleted ? 'text-emerald-700' : 'text-[#123D46]'}`}>
          {item.libraryItem?.title}
        </h4>

        {/* Description */}
        {item.libraryItem?.data?.description && (
          <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
            {item.libraryItem.data.description}
          </p>
        )}

        {/* Objectif */}
        {item.libraryItem?.data?.objectif && (
          <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs space-y-1 border border-[#E3EBE6]/50">
            <strong className="text-[#123D46] block">🎯 Objectif :</strong>
            <p className="text-[#123D46]/75">
              {item.libraryItem.data.objectif}
            </p>
          </div>
        )}

        {/* Rationale */}
        {item.rationale && (
          <div className="p-3 rounded-xl text-xs space-y-1 bg-[#FAF9F5]">
             <strong className="text-[#123D46] block">💡 Pourquoi pour vous :</strong>
             <p className="text-[#123D46]/75">
               {item.rationale}
             </p>
          </div>
        )}
      </div>

      {/* CTA Button — Partenaire */}
      {item.kind === "PARTNER" && (
        <button className="mt-2 w-full px-4 py-2.5 rounded-full border border-[#E3EBE6] bg-[#FAF9F5] hover:border-[#B8870A] hover:text-[#B8870A] text-xs font-jakarta font-bold text-[#123D46] transition-all flex items-center justify-between cursor-pointer shadow-2xs">
          <span>Consulter les fiches contacts</span>
          <span>→</span>
        </button>
      )}

      {/* CTA Button — Micro-défis only */}
      {item.kind === "MICRO_CHALLENGE" && (
        <button
          onClick={handleCompleteChallenge}
          disabled={isAlreadyCompleted || isValidating}
          className={`mt-2 w-full py-2.5 rounded-full transition-all text-xs font-jakarta font-bold text-center ${
            isAlreadyCompleted 
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
              : 'border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white cursor-pointer'
          }`}
        >
          {isValidating ? (
            "Validation en cours..."
          ) : isAlreadyCompleted ? (
            `✓ Défi validé (+${challengeRewardPoints} pts)`
          ) : (
            `Activer cette action (+${challengeRewardPoints} pts)`
          )}
        </button>
      )}
    </div>
  );
}
