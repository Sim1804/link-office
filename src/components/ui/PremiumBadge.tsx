/**
 * @file PremiumBadge.tsx
 * @description Badge d'abonnement compact — style pill uniforme sur toute l'app.
 * Utilisé pour indiquer visuellement le niveau Premium ou Premium+ d'un utilisateur.
 *
 * Design : pill fine, fond turquoise très léger, ★ prefix, texte 11px bold.
 */
import React from "react";

interface PremiumBadgeProps {
  className?: string;
  style?: React.CSSProperties;
  /** "Premium" | "Premium+" — default: "Premium" */
  label?: string;
}

export function PremiumBadge({ className = "", style = {}, label = "Premium" }: PremiumBadgeProps) {
  const isPremiumPlus = label.includes("+");

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 999,
        background: isPremiumPlus
          ? "rgba(0,169,157,0.08)"
          : "rgba(0,169,157,0.06)",
        border: isPremiumPlus
          ? "1px solid rgba(0,169,157,0.25)"
          : "1px solid rgba(0,169,157,0.15)",
        fontSize: 11,
        fontWeight: 700,
        color: "var(--primary)",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        ...style,
      }}
    >
      ★ {label}
    </span>
  );
}
