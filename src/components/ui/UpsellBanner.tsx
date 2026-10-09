/**
 * @file UpsellBanner.tsx
 * @description Bannière d'upsell réutilisable et canonique.
 * - Freemium → propose Premium (turquoise Link Office, icône Zap)
 * - Premium  → propose Premium+ (ambre doré, icône Crown)
 * Utilise le design system global et les tokens officiels.
 */
"use client";

import React from "react";
import Link from "next/link";
import { Lock, Zap, Crown, ArrowRight } from "lucide-react";
import { SubscriptionBadge, SubscriptionTier } from "@/components/ui/SubscriptionBadge";

interface UpsellBannerProps {
  /** "freemium" : l'utilisateur n'a pas d'abonnement → proposer Premium */
  /** "premium"  : l'utilisateur est Premium → proposer Premium+ */
  variant: "freemium" | "premium";
  /** Titre de la section bloquée, affiché dans le message */
  featureName?: string;
  /** Texte descriptif optionnel */
  description?: string;
  /** Libellé optionnel personnalisé pour le bouton CTA */
  ctaLabel?: string;
  /** Afficher un fond flou derrière la bannière (pour les paywalls) */
  withBlur?: boolean;
}

export function UpsellBanner({
  variant,
  featureName,
  description,
  ctaLabel,
}: UpsellBannerProps) {
  const isPremiumVariant = variant === "premium";

  // Configuration par variante
  const config = {
    freemium: {
      tier: "PREMIUM" as SubscriptionTier,
      badge: "PREMIUM" as SubscriptionTier,
      title: (f?: string) =>
        f ? `${f} réservé aux abonnés Premium` : "Fonctionnalité réservée aux abonnés Premium",
      defaultDescription:
        "Passez à Premium pour débloquer l'accès complet à cette section et à l'ensemble de vos analyses.",
      cta: "Passer à Premium",
      ctaStyle: {
        background: "linear-gradient(135deg, #00A99D 0%, #008f85 100%)",
        color: "#ffffff",
        border: "1px solid rgba(0, 169, 157, 0.40)",
        boxShadow: "0 2px 6px rgba(0, 169, 157, 0.30)",
      },
      TotemIcon: Zap,
      guarantee: "✓ Sans engagement · Résiliable à tout moment",
    },
    premium: {
      tier: "PREMIUM_PLUS" as SubscriptionTier,
      badge: "PREMIUM_PLUS" as SubscriptionTier,
      title: (f?: string) =>
        f ? `${f} exclusif à l'offre Premium+` : "Fonctionnalité exclusive Premium+",
      defaultDescription:
        "Vous êtes déjà Premium 🎉 — passez à Premium+ pour accéder au Binôme Relationnel, aux suggestions IRIS et à l'accompagnement avancé.",
      cta: "Passer à Premium+",
      ctaStyle: {
        background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
        color: "#ffffff",
        border: "1px solid rgba(217, 119, 6, 0.45)",
        boxShadow: "0 2px 6px rgba(245, 158, 11, 0.32)",
      },
      TotemIcon: Crown,
      guarantee: "✓ Activation instantanée · Différence au pro-rata",
    },
  }[variant];

  const TotemIcon = config.TotemIcon;
  const finalCta = ctaLabel || config.cta;

  return (
    <div
      className={`rounded-3xl p-8 sm:p-10 border shadow-xs flex flex-col items-center justify-center text-center space-y-4 transition-all ${
        isPremiumVariant
          ? "bg-gradient-to-b from-[#FFFBEB]/45 via-white to-[#FAF9F5] border-amber-200/80"
          : "bg-white border-[#E3EBE6]"
      }`}
    >
      {/* Badge officiel de tier */}
      <div className="mb-1">
        <SubscriptionBadge tier={config.badge} size="sm" />
      </div>

      {/* Icône SVG vectorielle */}
      <div
        className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs ${
          isPremiumVariant
            ? "bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-[#D97706] border-amber-500/25"
            : "bg-gradient-to-br from-[#00A99D]/12 to-[#00A99D]/5 text-[#00A99D] border-[#00A99D]/20"
        }`}
      >
        {isPremiumVariant ? (
          <Crown size={26} className="text-[#D97706]" />
        ) : (
          <Lock size={24} className="text-[#00A99D]" />
        )}
      </div>

      {/* Titre & Description */}
      <div className="max-w-[480px]">
        <h4 className="font-jakarta font-extrabold text-lg sm:text-xl text-[#123D46] mb-2 leading-snug">
          {config.title(featureName)}
        </h4>
        <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
          {description || config.defaultDescription}
        </p>
      </div>

      {/* Bouton CTA */}
      <Link
        href="/premium"
        className="group px-6 py-3 rounded-full text-xs font-jakarta font-bold transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md flex items-center gap-2"
        style={config.ctaStyle}
      >
        <TotemIcon size={14} className="shrink-0" />
        <span>{finalCta}</span>
        <ArrowRight
          size={14}
          className="shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform"
        />
      </Link>

      {/* Micro-réassurance */}
      <span className="text-[11px] text-[#123D46]/55 font-inter tracking-tight">
        {config.guarantee}
      </span>
    </div>
  );
}
