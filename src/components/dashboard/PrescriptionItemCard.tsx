/**
 * @file PrescriptionItemCard.tsx
 * @module src/components/dashboard
 * @description Carte interactive d'un élément de l'ordonnance relationnelle — design premium.
 */

"use client";

import { useState } from "react";
import { Check, Loader2, Target, BookOpen, Handshake, Clock, Zap, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";

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
      Icon: Target,
      label: "Micro-défi",
      color: "#38bdf8",
      bg: "rgba(56,189,248,0.08)",
      border: "rgba(56,189,248,0.15)",
      cardBorder: isAlreadyCompleted ? "rgba(52,211,153,0.25)" : "rgba(56,189,248,0.15)",
      cardBg: isAlreadyCompleted
        ? "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(6,46,30,0.25) 100%)"
        : "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(6,28,45,0.25) 100%)",
    },
    RECOMMENDATION: {
      Icon: BookOpen,
      label: "Recommandation",
      color: "#c084fc",
      bg: "rgba(192,132,252,0.08)",
      border: "rgba(192,132,252,0.15)",
      cardBorder: "rgba(124,58,237,0.15)",
      cardBg: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(30,14,60,0.25) 100%)",
    },
    PARTNER: {
      Icon: Handshake,
      label: "Partenaire",
      color: "#fb923c",
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.15)",
      cardBorder: "rgba(249,115,22,0.15)",
      cardBg: "linear-gradient(145deg, rgba(17,24,39,0.98) 0%, rgba(45,18,5,0.2) 100%)",
    },
  };

  const t = theme[item.kind as keyof typeof theme] || theme.RECOMMENDATION;
  const Icon = t.Icon;

  return (
    <div style={{
      borderRadius: 20,
      background: t.cardBg,
      border: `1px solid ${t.cardBorder}`,
      padding: "20px 20px 16px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      position: "relative",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
    }}
    >
      {/* Completed orb */}
      {isAlreadyCompleted && (
        <div style={{
          position: "absolute", top: -30, right: -30, width: 100, height: 100,
          background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
          borderRadius: "50%", pointerEvents: "none",
        }} />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: t.bg, border: `1px solid ${t.border}`,
            padding: "4px 10px", borderRadius: 8,
          }}>
            <Icon size={12} style={{ color: t.color }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: t.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isAlreadyCompleted && item.kind === "MICRO_CHALLENGE" ? "✓ Validé" : t.label}
            </span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#334155", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 6 }}>
            #{item.position}
          </span>
        </div>

        {/* Title */}
        <h4 style={{
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontSize: 15, fontWeight: 700,
          color: isAlreadyCompleted ? "#34d399" : "#f8fafc",
          marginBottom: 10, lineHeight: 1.4
        }}>
          {item.libraryItem?.title}
        </h4>

        {/* Description */}
        {item.libraryItem?.data?.description && (
          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8, lineHeight: 1.6 }}>
            {item.libraryItem.data.description}
          </p>
        )}

        {/* Objectif */}
        {item.libraryItem?.data?.objectif && (
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <Target size={13} style={{ color: t.color, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              <strong style={{ color: "#cbd5e1" }}>Objectif :</strong> {item.libraryItem.data.objectif}
            </p>
          </div>
        )}

        {/* Rationale */}
        <div style={{
          background: "rgba(255,255,255,0.03)", padding: "10px 14px",
          borderRadius: 10, marginTop: 12,
          borderLeft: `2px solid ${t.color}40`,
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <Lightbulb size={13} style={{ color: t.color, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, flex: 1 }}>
              {item.rationale}
            </p>
          </div>
        </div>

        {/* Metadata chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {item.kind === "PARTNER" ? (
            <>
              {item.libraryItem?.data?.categorie && (
                <span style={{ fontSize: 11, background: "rgba(249,115,22,0.08)", color: "#f97316", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(249,115,22,0.15)" }}>
                  🏢 {item.libraryItem.data.categorie}
                </span>
              )}
              {item.libraryItem?.data?.territoire && (
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", color: "#94a3b8", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)" }}>
                  📍 {item.libraryItem.data.territoire}
                </span>
              )}
              {item.libraryItem?.data?.public_cible && (
                <span style={{ fontSize: 11, background: "rgba(124,58,237,0.08)", color: "#a78bfa", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(124,58,237,0.15)" }}>
                  👥 {item.libraryItem.data.public_cible}
                </span>
              )}
            </>
          ) : (
            <>
              {item.libraryItem?.data?.difficulte && (
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.04)", color: "#94a3b8", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} />
                  {item.libraryItem.data.temps_estime ? `${item.libraryItem.data.temps_estime} · ` : ''}{item.libraryItem.data.difficulte}
                </span>
              )}
              {item.libraryItem?.data?.impact_attendu_1_5 && (
                <span style={{ fontSize: 11, background: "rgba(52,211,153,0.06)", color: "#34d399", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(52,211,153,0.12)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Zap size={10} />
                  Impact {item.libraryItem.data.impact_attendu_1_5}/5
                </span>
              )}
              {(item.libraryItem?.data?.besoin_cible || item.libraryItem?.data?.besoins_couverts) && (
                <span style={{ fontSize: 11, background: "rgba(124,58,237,0.08)", color: "#a78bfa", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(124,58,237,0.12)" }}>
                  {item.libraryItem.data.besoin_cible || item.libraryItem.data.besoins_couverts}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Button — Micro-défis only */}
      {item.kind === "MICRO_CHALLENGE" && (
        <button
          onClick={handleCompleteChallenge}
          disabled={isAlreadyCompleted || isValidating}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "12px 16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            borderRadius: 12, fontWeight: 600, fontSize: 13, cursor: isAlreadyCompleted ? "default" : "pointer",
            border: "none", transition: "all 0.2s",
            background: isAlreadyCompleted
              ? "rgba(52,211,153,0.1)"
              : "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            color: isAlreadyCompleted ? "#34d399" : "#fff",
            boxShadow: isAlreadyCompleted ? "none" : "0 4px 16px rgba(124,58,237,0.35)",
            ...(isAlreadyCompleted ? { border: "1px solid rgba(52,211,153,0.2)" } : {}),
          }}
        >
          {isValidating ? (
            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
          ) : isAlreadyCompleted ? (
            <>
              <Check size={16} />
              Défi validé (+{challengeRewardPoints} pts)
            </>
          ) : (
            <>
              <Target size={16} />
              Relever le défi (+{challengeRewardPoints} pts)
            </>
          )}
        </button>
      )}
    </div>
  );
}
