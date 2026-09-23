/**
 * @file UpsellBanner.tsx
 * @description Bannière d'upsell réutilisable.
 * - Freemium → propose Premium
 * - Premium → propose Premium+
 * Utilise le design system global (btn, tokens CSS).
 */
"use client";

import Link from "next/link";
import { Lock, Sparkles, ArrowRight, Star } from "lucide-react";
import { PremiumBadge } from "@/components/ui/PremiumBadge";

interface UpsellBannerProps {
  /** "freemium" : l'utilisateur n'a pas d'abonnement → proposer Premium */
  /** "premium"  : l'utilisateur est Premium → proposer Premium+ */
  variant: "freemium" | "premium";
  /** Titre de la section bloquée, affiché dans le message */
  featureName?: string;
  /** Texte descriptif optionnel */
  description?: string;
  /** Afficher un fond flou derrière la bannière (pour les paywalls) */
  withBlur?: boolean;
}

const VARIANTS = {
  freemium: {
    icon: Lock,
    iconBg: "rgba(18,61,70,0.06)",
    iconColor: "var(--text-2)",
    badge: null,
    title: (f?: string) => f ? `${f} réservé aux abonnés Premium` : "Fonctionnalité Premium",
    description: "Passez à Premium pour débloquer l'accès complet à cette section.",
    cta: "Passer à Premium",
    ctaHref: "/premium",
    ctaClass: "btn btn-primary btn-md",
    borderColor: "var(--border-strong)",
  },
  premium: {
    icon: Sparkles,
    iconBg: "rgba(0,169,157,0.08)",
    iconColor: "var(--primary)",
    badge: "PREMIUM+",
    title: (f?: string) => f ? `${f} inclus dans Premium+` : "Fonctionnalité exclusive Premium+",
    description: "Vous êtes déjà Premium 🎉 — passez à Premium+ pour accéder au Binôme Relationnel, aux suggestions IRIS et à la gamification avancée.",
    cta: "Découvrir Premium+",
    ctaHref: "/premium",
    ctaClass: "btn btn-primary btn-md",
    borderColor: "rgba(0,169,157,0.3)",
  },
};

export function UpsellBanner({
  variant,
  featureName,
  description,
  withBlur = false,
}: UpsellBannerProps) {
  const v = VARIANTS[variant];
  const Icon = v.icon;

  return (
    <div style={{
      borderRadius: 16,
      border: `1px solid ${v.borderColor}`,
      background: variant === "premium"
        ? "linear-gradient(135deg, rgba(0,169,157,0.04) 0%, rgba(6,182,212,0.02) 100%)"
        : "var(--surface)",
      padding: "32px 28px",
      textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
    }}>
      {/* Badge optionnel */}
      {v.badge && (
        <PremiumBadge label={v.badge} />
      )}

      {/* Icône */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: v.iconBg, border: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} color={v.iconColor} />
      </div>

      {/* Texte */}
      <div style={{ maxWidth: 460 }}>
        <h4 style={{
          fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
          fontSize: 17, fontWeight: 700, color: "var(--text-1)",
          marginBottom: 8,
        }}>
          {v.title(featureName)}
        </h4>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
          {description || v.description}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={v.ctaHref}
        className={v.ctaClass}
        style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        {v.cta}
        <ArrowRight size={16} />
      </Link>

      <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>
        {variant === "freemium" ? "✓ Sans engagement · Résiliable à tout moment" : "✓ Mise à niveau instantanée · Différence pro-rata"}
      </p>
    </div>
  );
}
