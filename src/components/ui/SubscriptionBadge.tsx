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
import Link from "next/link";
import { Zap, Crown, Circle, Sparkles, ArrowRight } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionTier = "FREEMIUM" | "PREMIUM" | "PREMIUM_PLUS";

export interface SubscriptionBadgeProps {
  /** Le niveau d'abonnement à afficher */
  tier: SubscriptionTier;
  /**
   * Taille du badge.
   * - `xs` : ultra-compact (navigation dense, mobiles)
   * - `sm` : compact (tables, listes, navbar)
   * - `md` : standard (cards, profil) ← défaut
   * - `lg` : hero (pages premium, tarification)
   */
  size?: "xs" | "sm" | "md" | "lg";
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
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(156, 163, 175, 0.25)",
    color: "var(--text-2, #9ca3af)",
    title: "Accès gratuit — fonctionnalités de base",
    upgradeLabel: "Passer à Premium",
    nextTier: "PREMIUM" as SubscriptionTier,
  },
  PREMIUM: {
    label: "Premium",
    icon: Zap,
    iconColor: "var(--primary, #00a99d)",
    background: "rgba(0, 169, 157, 0.08)",
    border: "rgba(0, 169, 157, 0.28)",
    color: "var(--primary, #00a99d)",
    title: "Accès Premium — coaching IRIS, ordonnance complète",
    upgradeLabel: "Passer à Premium+",
    nextTier: "PREMIUM_PLUS" as SubscriptionTier,
  },
  PREMIUM_PLUS: {
    label: "Premium+",
    icon: Crown,
    iconColor: "var(--amber, #f59e0b)",
    background: "rgba(245, 158, 11, 0.10)",
    border: "rgba(245, 158, 11, 0.32)",
    color: "var(--amber, #f59e0b)",
    title: "Accès Premium+ — inclut le programme Binôme Relationnel",
    upgradeLabel: null,
    nextTier: null,
  },
} as const satisfies Record<SubscriptionTier, {
  label: string;
  icon: React.ElementType;
  iconColor: string;
  background: string;
  border: string;
  color: string;
  title: string;
  upgradeLabel: string | null;
  nextTier: SubscriptionTier | null;
}>;

// ── Tokens de taille ──────────────────────────────────────────────────────────

const SIZE_CONFIG = {
  xs: {
    padding: "2px 7px",
    fontSize: 10,
    gap: 3,
    iconSize: 9,
    fontWeight: 600,
    letterSpacing: "0.02em",
  },
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

// ── Composant Badge ───────────────────────────────────────────────────────────

/**
 * Badge d'abonnement uniforme — à utiliser partout dans l'application.
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

// ── Bouton d'évolution / Upgrade Proposé ──────────────────────────────────────

export interface SubscriptionUpgradeButtonProps {
  tier: SubscriptionTier;
  size?: "xs" | "sm" | "md";
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Bouton d'upgrade contextuel selon le plan actuel de l'utilisateur :
 * - Si FREEMIUM → propose "Passer à Premium"
 * - Si PREMIUM  → propose "Passer à Premium+"
 * - Si PREMIUM_PLUS → ne rend rien (déjà au niveau maximal)
 */
export function SubscriptionUpgradeButton({
  tier,
  size = "sm",
  className = "",
  style = {},
  onClick,
}: SubscriptionUpgradeButtonProps) {
  if (tier === "PREMIUM_PLUS") {
    return null;
  }

  const isFreemium = tier === "FREEMIUM";

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5 gap-1",
    sm: "text-[11px] px-2.5 py-1 gap-1.5",
    md: "text-xs px-3.5 py-1.5 gap-2",
  }[size];

  const iconSize = size === "xs" ? 10 : size === "sm" ? 12 : 14;

  if (isFreemium) {
    return (
      <Link
        href="/premium"
        onClick={onClick}
        title="Passer à LinkOffice Premium"
        className={`inline-flex items-center rounded-full font-jakarta font-bold transition-all whitespace-nowrap shadow-xs hover:shadow-sm ${sizeClasses} ${className}`}
        style={{
          background: "linear-gradient(135deg, #00A99D 0%, #008f85 100%)",
          color: "#ffffff",
          textDecoration: "none",
          ...style,
        }}
      >
        <Sparkles size={iconSize} className="shrink-0" />
        <span>Passer à Premium</span>
        <ArrowRight size={iconSize} className="shrink-0 opacity-80" />
      </Link>
    );
  }

  // Utilisateur PREMIUM -> Proposer PREMIUM_PLUS
  return (
    <Link
      href="/premium"
      onClick={onClick}
      title="Passer à LinkOffice Premium+"
      className={`inline-flex items-center rounded-full font-jakarta font-bold transition-all whitespace-nowrap shadow-xs hover:shadow-sm ${sizeClasses} ${className}`}
      style={{
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#ffffff",
        textDecoration: "none",
        ...style,
      }}
    >
      <Crown size={iconSize} className="shrink-0" />
      <span>Passer à Premium+</span>
      <ArrowRight size={iconSize} className="shrink-0 opacity-80" />
    </Link>
  );
}

// ── Composant consolidé : Badge + Bouton d'évolution ─────────────────────────

export interface UserPlanStatusProps {
  tier: SubscriptionTier;
  size?: "xs" | "sm" | "md";
  showUpgrade?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClickUpgrade?: () => void;
}

/**
 * Affiche le statut d'abonnement uniforme avec proposition d'évolution :
 * Badge (Freemium / Premium / Premium+) + Bouton d'upgrade selon le plan.
 */
export function UserPlanStatus({
  tier,
  size = "sm",
  showUpgrade = true,
  className = "",
  style = {},
  onClickUpgrade,
}: UserPlanStatusProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ verticalAlign: "middle", ...style }}
    >
      <SubscriptionBadge tier={tier} size={size === "xs" ? "xs" : size} />
      {showUpgrade && (
        <SubscriptionUpgradeButton
          tier={tier}
          size={size}
          onClick={onClickUpgrade}
        />
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convertit une valeur brute de BDD en `SubscriptionTier` valide.
 * Retourne `"FREEMIUM"` pour toute valeur inconnue ou manquante.
 */
export function toSubscriptionTier(value: string | null | undefined): SubscriptionTier {
  if (value === "PREMIUM_PLUS") return "PREMIUM_PLUS";
  if (value === "PREMIUM") return "PREMIUM";
  return "FREEMIUM";
}

/**
 * Retourne le niveau d'abonnement supérieur immédiat, ou null si déjà au maximum.
 */
export function getNextSubscriptionTier(tier: SubscriptionTier): SubscriptionTier | null {
  return TIER_CONFIG[tier].nextTier;
}

/**
 * Retourne le label d'évolution (ex: "Passer à Premium"), ou null si au niveau maximum.
 */
export function getSubscriptionUpgradeLabel(tier: SubscriptionTier): string | null {
  return TIER_CONFIG[tier].upgradeLabel;
}

