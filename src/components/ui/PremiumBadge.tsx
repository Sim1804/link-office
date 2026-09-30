/**
 * @file PremiumBadge.tsx
 * @deprecated Utiliser `SubscriptionBadge` à la place — ce fichier est conservé
 * pour la compatibilité ascendante uniquement.
 *
 * @see src/components/ui/SubscriptionBadge.tsx — Composant canonique
 */
import React from "react";
import { SubscriptionBadge, toSubscriptionTier } from "./SubscriptionBadge";

interface PremiumBadgeProps {
  className?: string;
  style?: React.CSSProperties;
  /** "Premium" | "Premium+" | "Freemium" — default: "Premium" */
  label?: string;
}

/**
 * @deprecated Utiliser `<SubscriptionBadge tier="PREMIUM" />` à la place.
 * Conservé pour ne pas casser les imports existants.
 */
export function PremiumBadge({ className = "", style = {}, label = "Premium" }: PremiumBadgeProps) {
  const tier = label.toLowerCase().includes("freemium")
    ? "FREEMIUM"
    : label.includes("+")
    ? "PREMIUM_PLUS"
    : "PREMIUM";

  return (
    <SubscriptionBadge
      tier={tier}
      size="md"
      className={className}
      style={style}
    />
  );
}
