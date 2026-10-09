/**
 * @file LockedContentOverlay.tsx
 * @module src/components/ui
 * @description Composant canonique d'upsell et de contenu bloqué (paywall in-line).
 * Utilisé sur l'ensemble des sous-onglets du tableau de bord pour harmoniser
 * la présentation, les libellés, les icônes et la micro-réassurance.
 *
 * Libellés canoniques SaaS :
 * - Contenu bloqué (in-line paywall) : "Débloquer avec Premium" / "Débloquer avec Premium+"
 * - Bannière de montée en gamme : "Passer à Premium" / "Passer à Premium+"
 */
"use client";

import React from "react";
import Link from "next/link";
import { Lock, Zap, Crown, ArrowRight } from "lucide-react";
import { SubscriptionBadge, SubscriptionTier } from "@/components/ui/SubscriptionBadge";

export interface LockedContentOverlayProps {
  /** Niveau d'abonnement requis pour débloquer ce contenu (défaut : "PREMIUM") */
  tier?: SubscriptionTier;
  /** Titre principal de la fonctionnalité bloquée */
  title: string;
  /** Description ou bénéfice lié au déblocage */
  description?: string;
  /**
   * Libellé du bouton d'action.
   * Par défaut : "Débloquer avec Premium" (pour PREMIUM) ou "Débloquer avec Premium+" (pour PREMIUM_PLUS).
   */
  actionLabel?: string;
  /** Lien de redirection (défaut : "/premium") */
  href?: string;
  /** Afficher le badge officiel du tier (défaut : true) */
  showBadge?: boolean;
  /** Version compacte pour cartes de hauteur modérée (défaut : false) */
  compact?: boolean;
  /** Texte de micro-réassurance affiché sous le bouton */
  guaranteeText?: string;
  /** Classes CSS supplémentaires pour le conteneur d'overlay */
  className?: string;
  /**
   * Si des enfants sont fournis, le composant agit comme un "Gate Wrapper" :
   * il affiche les enfants floutés en arrière-plan avec l'overlay centré par-dessus.
   */
  children?: React.ReactNode;
}

export function LockedContentOverlay({
  tier = "PREMIUM",
  title,
  description,
  actionLabel,
  href = "/premium",
  showBadge = true,
  compact = false,
  guaranteeText,
  className = "",
  children,
}: LockedContentOverlayProps) {
  const isPremiumPlus = tier === "PREMIUM_PLUS";

  // Libellé d'action canonique conforme SaaS
  const defaultActionLabel = isPremiumPlus ? "Débloquer avec Premium+" : "Débloquer avec Premium";
  const finalActionLabel = actionLabel || defaultActionLabel;

  // Texte de réassurance par défaut
  const defaultGuarantee = isPremiumPlus
    ? "✓ Activation instantanée · Différence au pro-rata"
    : "✓ Sans engagement · Résiliable à tout moment";
  const finalGuarantee = guaranteeText !== undefined ? guaranteeText : defaultGuarantee;

  // Icône totem du plan
  const TotemIcon = isPremiumPlus ? Crown : Zap;

  // Overlay centré avec design system Link Office
  const overlayContent = (
    <div
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center text-center backdrop-blur-md transition-all select-none ${
        compact ? "p-4 sm:p-5" : "py-8 sm:py-10 px-6 sm:px-8"
      } ${
        isPremiumPlus
          ? "bg-gradient-to-b from-amber-50/85 via-white/94 to-white/98"
          : "bg-gradient-to-b from-white/88 via-white/94 to-[#FAF9F5]/98"
      } ${!children ? className : ""}`}
    >
      {/* Badge du niveau requis */}
      {showBadge && (
        <div className={compact ? "mb-2" : "mb-3"}>
          <SubscriptionBadge tier={tier} size={compact ? "xs" : "sm"} />
        </div>
      )}

      {/* Icône de cadenas stylisée */}
      <div
        className={`rounded-2xl border flex items-center justify-center shadow-xs shrink-0 ${
          compact ? "w-10 h-10 mb-2.5" : "w-12 h-12 mb-3.5"
        } ${
          isPremiumPlus
            ? "bg-gradient-to-br from-amber-500/15 to-amber-500/5 text-[#D97706] border-amber-500/25"
            : "bg-gradient-to-br from-[#00A99D]/12 to-[#00A99D]/5 text-[#00A99D] border-[#00A99D]/20"
        }`}
      >
        <Lock size={compact ? 18 : 22} className={isPremiumPlus ? "text-[#D97706]" : "text-[#00A99D]"} />
      </div>

      {/* Titre & Description */}
      <div className={`max-w-md ${compact ? "mb-2.5" : "mb-3.5"}`}>
        <h4
          className={`font-jakarta font-extrabold text-[#123D46] leading-snug ${
            compact ? "text-sm sm:text-base mb-1" : "text-base sm:text-lg mb-1.5"
          }`}
        >
          {title}
        </h4>
        {description && (
          <p
            className={`text-[#123D46]/70 font-inter leading-relaxed ${
              compact ? "text-[11px] max-w-xs" : "text-xs max-w-sm"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {/* Bouton CTA d'action de déblocage */}
      <Link
        href={href}
        className={`group inline-flex items-center justify-center font-jakarta font-bold rounded-full transition-all duration-200 active:scale-95 shadow-xs hover:shadow-md ${
          compact ? "px-4 py-2 text-xs gap-1.5" : "px-6 py-2.5 text-xs gap-2"
        }`}
        style={
          isPremiumPlus
            ? {
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                color: "#ffffff",
                boxShadow: "0 2px 6px rgba(245, 158, 11, 0.35)",
                border: "1px solid rgba(217, 119, 6, 0.4)",
              }
            : {
                background: "linear-gradient(135deg, #00A99D 0%, #008f85 100%)",
                color: "#ffffff",
                boxShadow: "0 2px 6px rgba(0, 169, 157, 0.3)",
                border: "1px solid rgba(0, 169, 157, 0.35)",
              }
        }
      >
        <TotemIcon size={compact ? 13 : 14} className="shrink-0" />
        <span>{finalActionLabel}</span>
        <ArrowRight
          size={compact ? 13 : 14}
          className="shrink-0 opacity-80 group-hover:translate-x-0.5 transition-transform"
        />
      </Link>

      {/* Micro-réassurance avec espacement aéré vers le bas */}
      {finalGuarantee && (
        <span
          className={`text-[#123D46]/60 font-inter tracking-tight leading-normal ${
            compact ? "text-[10px] mt-2" : "text-[11px] mt-3"
          }`}
        >
          {finalGuarantee}
        </span>
      )}
    </div>
  );

  // Si des enfants sont fournis, agir comme un wrapper avec flou et hauteur confortable garantie
  if (children) {
    return (
      <div
        className={`relative rounded-3xl overflow-hidden border border-[#E3EBE6] bg-white min-h-[350px] sm:min-h-[370px] flex flex-col justify-center ${className}`}
      >
        <div className="blur-[6px] opacity-40 pointer-events-none select-none w-full min-h-[350px] sm:min-h-[370px] flex items-center justify-center">
          {children}
        </div>
        {overlayContent}
      </div>
    );
  }

  // Sinon, retourner l'overlay direct (pour injection dans une card relative)
  return overlayContent;
}
