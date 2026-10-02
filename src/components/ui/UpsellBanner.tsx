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
import { SubscriptionBadge, SubscriptionTier } from "@/components/ui/SubscriptionBadge";

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
    badge: null as SubscriptionTier | null,
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
    badge: "PREMIUM_PLUS" as SubscriptionTier,
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
    <div className={`rounded-3xl p-8 sm:p-10 border shadow-xs flex flex-col items-center justify-center text-center space-y-4 ${variant === "premium" ? "bg-gradient-to-b from-[#FAF9F5] to-[#F0FDF4] border-[#00A99D]/20" : "bg-white border-[#E3EBE6]"}`}>
      {v.badge && (
        <div className="mb-2">
          <SubscriptionBadge tier={v.badge} size="md" />
        </div>
      )}

      {/* Icône */}
      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl ${variant === "premium" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-[#FAF9F5] border-[#E3EBE6]"}`}>
        {variant === "freemium" ? "🔒" : "✨"}
      </div>

      {/* Texte */}
      <div className="max-w-[460px]">
        <h4 className="font-jakarta font-extrabold text-lg sm:text-xl text-[#123D46] mb-2">
          {v.title(featureName)}
        </h4>
        <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
          {description || v.description}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={v.ctaHref}
        className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2"
      >
        <span>{v.cta}</span>
        <ArrowRight size={16} />
      </Link>

      <span className="text-[11px] text-[#123D46]/50">
        {variant === "freemium" ? "✓ Sans engagement · Résiliable à tout moment" : "✓ Mise à niveau instantanée · Différence pro-rata"}
      </span>
    </div>
  );
}
