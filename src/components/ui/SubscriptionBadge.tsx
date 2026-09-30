/**
 * @file SubscriptionBadge.tsx
 * @module src/components/ui
 * @description Composant unique et canonique pour afficher le niveau d'abonnement
 * d'un utilisateur (Freemium · Premium · Premium+).
 *
 * Design System :
 * ┌───────────────┬──────────────────────────────────────────────────────────┐
 * │ Tier          │ Couleur       │ Icône │ Label affiché                    │
 * ├───────────────┼──────────────┼───────┼──────────────────────────────────┤
 * │ FREEMIUM      │ Gris neutre  │ —     │ Freemium                         │
 * │ PREMIUM       │ Vert-cyan    │ Zap   │ Premium                          │
 * │ PREMIUM_PLUS  │ Ambre/doré   │ Crown │ Premium+                         │
 * └───────────────┴──────────────────────────────────────────────────────────┘
 *
 * Caractéristiques UX :
 * - Pill uniforme (border-radius: 999px) sur toutes les tailles
 * - Bord (border) fin pour profondeur sans surcharge
 * - Icône de 10–12px cohérente avec la taille du texte
 * - 3 tailles : sm (tag compact), md (standard), lg (hero/page)
 * - Tooltip accessible via title HTML
 *
 * @example
 * // Usage standard
 * <SubscriptionBadge tier="PREMIUM_PLUS" />
 *
 * // Usage compact dans une table
 * <SubscriptionBadge tier="FREEMIUM" size="sm" />
 *
 * // Usage hero (page tarification)
 * <SubscriptionBadge tier="PREMIUM" size="lg" />
 */

import React from "react";
import { Zap, Crown, Circle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "FREEMIUM" | "PREMIUM" | "PREMIUM_PLUS";

export interface SubscriptionBadgeProps {
  /** Le niveau d'abonnement à afficher */
  tier: SubscriptionTier;
  /**
   * Taille du badge.
   * - `sm`  : compact (tables, listes), px-2 py-0.5, text 10px
   * - `md`  : standard (cards, profil), px-2.5 py-1, text 11px  ← défaut
   * - `lg`  : hero (pages premium, tarification), px-4 py-1.5, text 13px
   */
  size?: "sm" | "md" | "lg";
  /** Classes CSS supplémentaires */
  className?: string;
  /** Styles inline additionnels */
  style?: React.CSSProperties;
}

// ── Tokens de design par tier ─────────────────────────────────────────────────

const TIER_CONFIG = {
  FREEMIUM: {
    label: "Freemium",
    icon: Circle,
    iconColor: "var(--text-2, #9ca3af)",
    background: "rgba(255, 255, 255, 0.04)",
    border: "rgba(156, 163, 175, 0.25)",
    color: "var(--text-2, #9ca3af)",
    title: "Accès gratuit — fonctionnalités de base",
  },
  PREMIUM: {
    label: "Premium",
    icon: Zap,
    iconColor: "var(--primary, #00a99d)",
    background: "rgba(0, 169, 157, 0.08)",
    border: "rgba(0, 169, 157, 0.28)",
    color: "var(--primary, #00a99d)",
    title: "Accès Premium — coaching IRIS, ordonnance complète",
  },
  PREMIUM_PLUS: {
    label: "Premium+",
    icon: Crown,
    iconColor: "var(--amber, #f59e0b)",
    background: "rgba(245, 158, 11, 0.10)",
    border: "rgba(245, 158, 11, 0.32)",
    color: "var(--amber, #f59e0b)",
    title: "Accès Premium+ — inclut le programme Binôme Relationnel",
  },
} as const satisfies Record<SubscriptionTier, {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  background: string;
  border: string;
  color: string;
  title: string;
}>;

// ── Tokens de taille ──────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  sm: {
    padding: "2px 8px",
    fontSize: 10,
    gap: 3,
    iconSize: 10,
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  md: {
    padding: "3px 10px",
    fontSize: 11,
    gap: 4,
    iconSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
  lg: {
    padding: "6px 14px",
    fontSize: 13,
    gap: 6,
    iconSize: 13,
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
} as const satisfies Record<NonNullable<SubscriptionBadgeProps["size"]>, {
  padding: string;
  fontSize: number;
  gap: number;
  iconSize: number;
  fontWeight: number;
  letterSpacing: string;
}>;

// ── Composant ─────────────────────────────────────────────────────────────────

/**
 * Badge d'abonnement uniforme — à utiliser partout dans l'application.
 * Remplace `PremiumBadge` et les badges inline dispersés.
 */
export function SubscriptionBadge({
  tier,
  size = "md",
  className = "",
  style = {},
}: SubscriptionBadgeProps) {
  const t = TIER_CONFIG[tier];
  const s = SIZE_CONFIG[size];
  const Icon = t.icon;

  return (
    <span
      className={className}
      title={t.title}
      aria-label={`Abonnement ${t.label}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: s.gap,
        padding: s.padding,
        borderRadius: 999,
        background: t.background,
        border: `1px solid ${t.border}`,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: "inherit",
        color: t.color,
        letterSpacing: s.letterSpacing,
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "opacity 0.15s ease",
        ...style,
      }}
    >
      <Icon
        size={s.iconSize}
        color={t.iconColor}
        strokeWidth={tier === "FREEMIUM" ? 1.5 : 2}
        aria-hidden
      />
      {t.label}
    </span>
  );
}

// ── Helper : dérive le tier depuis la chaîne BDD ──────────────────────────────

/**
 * Convertit une valeur brute de BDD en `SubscriptionTier` valide.
 * Retourne `"FREEMIUM"` pour toute valeur inconnue ou manquante.
 */
export function toSubscriptionTier(value: string | null | undefined): SubscriptionTier {
  if (value === "PREMIUM_PLUS") return "PREMIUM_PLUS";
  if (value === "PREMIUM") return "PREMIUM";
  return "FREEMIUM";
}
