"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSession } from "next-auth/react";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";
import {
  Check, Sparkles, ArrowRight, ShieldCheck, Zap,
  LockOpen, AlertCircle, Star, Handshake, Brain
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Feature lists
// ─────────────────────────────────────────────────────────────────────────────
const PREMIUM_FEATURES = [
  "Détail de vos forces et vigilances relationnelles",
  "Analyse ICR : facteurs de vulnérabilité",
  "Besoins dominants décodés par l'IA",
  "Ordonnance relationnelle complète & illimitée",
];

const PREMIUM_PLUS_FEATURES = [
  { label: "Tout le contenu Premium", base: true },
  { label: "Binôme Relationnel exclusif", base: false },
  { label: "Suggestions de partenaires par IRIS", base: false },
  { label: "Check-ins hebdomadaires & gamification avancée", base: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// Billing prices
// ─────────────────────────────────────────────────────────────────────────────
const PRICES = {
  PREMIUM:      { monthly: "9,99 €", annual: "95,90 €", annualMonthly: "7,99 €" },
  PREMIUM_PLUS: { monthly: "14,99 €", annual: "143,90 €", annualMonthly: "11,99 €" },
};

export default function PremiumPage() {
  const { data: session } = useSession();
  const subscription = (session?.user as any)?.subscription ?? "FREEMIUM";
  const isAlreadyPremium = subscription === "PREMIUM";
  const isAlreadyPremiumPlus = subscription === "PREMIUM_PLUS";

  const [loading, setLoading] = useState<"PREMIUM" | "PREMIUM_PLUS" | false>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const handleCheckout = async (tier: "PREMIUM" | "PREMIUM_PLUS") => {
    setCheckoutError(null);
    try {
      setLoading(tier);
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billing }),
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la session de paiement.");
      const { url } = await res.json();
      if (url) window.location.href = url;
      else throw new Error("URL de paiement invalide. Veuillez réessayer.");
    } catch (err: any) {
      setCheckoutError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // ── Si déjà Premium+ ──────────────────────────────────────────────────────
  if (isAlreadyPremiumPlus) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center pt-24 pb-16">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[#00A99D]/10 border border-[#00A99D]/20 flex items-center justify-center mx-auto mb-6">
              <Star size={28} className="text-[#00A99D]" />
            </div>
            <SubscriptionBadge tier="PREMIUM_PLUS" size="lg" className="mb-5 inline-block" />
            <h1 className="font-jakarta font-extrabold text-3xl text-[#123D46] mb-3">
              Vous bénéficiez déjà de Premium+
            </h1>
            <p className="text-[#123D46]/70 text-sm leading-relaxed">
              Toutes les fonctionnalités sont débloquées. Accédez à votre espace depuis le tableau de bord.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F9FA] relative overflow-hidden pt-20 pb-24">
        {/* Removed ambient glow to match other pages */}

        <div className="max-w-[960px] mx-auto px-4 sm:px-6 relative z-10">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 animate-fade-in">
            {isAlreadyPremium ? (
              <>
                <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider block">
                  Link Office Premium
                </span>
                <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
                  Débloquez le Binôme Relationnel
                </h2>
                <p className="text-sm text-[#123D46]/70 font-inter">
                  Vous êtes déjà Premium 🎉 Passez à Premium+ pour accéder au Binôme, aux suggestions IRIS et à la gamification avancée.
                </p>
              </>
            ) : (
              <>
                <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider block flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> Link Office Premium
                </span>
                <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
                  Prenez le contrôle de votre capital relationnel
                </h2>
                <p className="text-sm text-[#123D46]/70 font-inter">
                  Débloquez l'analyse approfondie de votre IQRH, votre ordonnance complète et, avec Premium+, votre Binôme Relationnel.
                </p>
              </>
            )}
          </div>

          {/* Toggle monthly / annual */}
          <div className="pt-2 flex items-center justify-center gap-3 mb-12 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className={`text-xs font-semibold ${billing === "monthly" ? 'text-[#123D46]' : 'text-[#123D46]/60'}`}>
              Mensuel
            </span>
            <button
              onClick={() => setBilling(billing === "annual" ? "monthly" : "annual")}
              className="w-12 h-6 rounded-full bg-[#00A99D] p-1 flex items-center transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  billing === "annual" ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-semibold flex items-center gap-1.5 ${billing === "annual" ? 'text-[#00A99D]' : 'text-[#123D46]/60'}`}>
              Annuel
              <span className="px-2 py-0.5 rounded-full bg-[#FFC629]/20 text-[#123D46] text-[10px] font-bold">
                -20%
              </span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className={`grid grid-cols-1 ${isAlreadyPremium ? 'max-w-[480px] mx-auto' : 'md:grid-cols-2 gap-6 max-w-4xl mx-auto'} animate-fade-in`} style={{ animationDelay: "200ms" }}>

            {/* Card Premium — cachée si déjà Premium */}
            {!isAlreadyPremium && (
              <PricingCard
                title="Pass Premium"
                subtitle="Accès complet à vos résultats détaillés."
                price={billing === "annual" ? PRICES.PREMIUM.annual : PRICES.PREMIUM.monthly}
                period={billing === "annual" ? "/an" : "/mois"}
                savings={billing === "annual" ? `Soit ${PRICES.PREMIUM.annualMonthly} / mois` : undefined}
                features={PREMIUM_FEATURES}
                featureStyle="check"
                ctaLabel={loading === "PREMIUM" ? "Redirection..." : "S'abonner à Premium"}
                ctaVariant="secondary"
                onCta={() => handleCheckout("PREMIUM")}
                loading={loading === "PREMIUM"}
                disabled={loading !== false}
                error={checkoutError}
              />
            )}

            {/* Card Premium+ */}
            <PricingCard
              title="Premium +"
              subtitle={isAlreadyPremium ? "Mise à niveau depuis votre abonnement Premium." : "L'expérience relationnelle intégrale."}
              price={billing === "annual" ? PRICES.PREMIUM_PLUS.annual : PRICES.PREMIUM_PLUS.monthly}
              period={billing === "annual" ? "/an" : "/mois"}
              savings={billing === "annual" ? `Soit ${PRICES.PREMIUM_PLUS.annualMonthly} / mois` : undefined}
              features={PREMIUM_PLUS_FEATURES.map(f => f.label)}
              featureStyle="gradient"
              ctaLabel={loading === "PREMIUM_PLUS" ? "Redirection..." : (isAlreadyPremium ? "Passer à Premium+ →" : "Débloquer Premium +")}
              ctaVariant="primary"
              onCta={() => handleCheckout("PREMIUM_PLUS")}
              loading={loading === "PREMIUM_PLUS"}
              disabled={loading !== false}
              error={checkoutError}
              recommended={!isAlreadyPremium}
            />
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: "300ms" }}>
            {["Paiement sécurisé Stripe", "Sans engagement", "Résiliable à tout moment"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-[#123D46]/60 font-medium">
                <Check size={12} className="text-[#00A99D]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PricingCard sub-component
// ─────────────────────────────────────────────────────────────────────────────
interface PricingCardProps {
  title: string;
  subtitle: string;
  price: string;
  period: string;
  savings?: string;
  features: string[];
  featureStyle: "check" | "gradient";
  ctaLabel: string;
  ctaVariant: "primary" | "secondary";
  onCta: () => void;
  loading: boolean;
  disabled: boolean;
  error?: string | null;
  recommended?: boolean;
}

function PricingCard({
  title, subtitle, price, period, savings, features,
  featureStyle, ctaLabel, ctaVariant, onCta, loading, disabled, error, recommended,
}: PricingCardProps) {
  return (
    <div className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col relative overflow-hidden transition-all ${
      recommended 
        ? "border-2 border-[#00A99D] shadow-lg shadow-[#00A99D]/5" 
        : "border border-[#E3EBE6] shadow-sm"
    }`}>
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        recommended ? "bg-gradient-to-r from-[#00A99D] to-[#0ea5e9]" : "bg-[#E3EBE6]"
      }`} />

      {recommended && (
        <div className="absolute top-4 right-4 bg-[#00A99D]/10 text-[#00A99D] px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase">
          Recommandé
        </div>
      )}

      <div className="mb-6 mt-2">
        <h2 className="font-jakarta font-extrabold text-2xl text-[#123D46] mb-1">
          {title}
        </h2>
        <p className="text-xs text-[#123D46]/70 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1.5">
          <span className="font-jakarta font-black text-4xl text-[#123D46] tracking-tight">
            {price}
          </span>
          <span className="text-xs text-[#123D46]/60 font-medium">
            {period}
          </span>
        </div>
        {savings && (
          <span className="text-[11px] text-[#00A99D] font-bold block mt-1.5">
            {savings}
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3.5 mb-8 flex-1">
        {features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3 text-[13px] text-[#123D46]/80 leading-snug">
            <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
              featureStyle === "gradient"
                ? "bg-gradient-to-br from-[#00A99D] to-[#0ea5e9] text-white"
                : "bg-[#00A99D]/10 text-[#00A99D]"
            }`}>
              <Check size={11} strokeWidth={3} />
            </div>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCta}
        disabled={disabled}
        className={`w-full py-2.5 rounded-full font-jakarta font-bold text-xs transition-all text-center ${
          ctaVariant === "primary" 
            ? "bg-[#00A99D] hover:bg-[#199E9A] text-white shadow-xs" 
            : "border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D]/10"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {loading ? "Redirection..." : ctaLabel}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mt-3">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-600 font-medium leading-snug">{error}</p>
        </div>
      )}

      <p className="text-center text-[10px] text-[#123D46]/40 mt-4 font-medium uppercase tracking-wide">
        Paiement sécurisé par Stripe
      </p>
    </div>
  );
}
