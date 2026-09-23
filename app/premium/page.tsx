"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useSession } from "next-auth/react";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
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
        <main className="page-main">
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
            }}>
              <Star size={28} color="var(--primary)" />
            </div>
            <PremiumBadge label="Premium+" style={{ marginBottom: 20 }} />
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
              Vous bénéficiez déjà de Premium+
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.6 }}>
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
      <main className="page-main" style={{ position: "relative", overflow: "hidden" }}>
        {/* Ambient glow */}
        <div style={{ position: "absolute", top: -100, left: "30%", width: 500, height: 500, borderRadius: "50%", background: "rgba(0,169,157,0.04)", filter: "blur(80px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 20px 80px", position: "relative", zIndex: 10 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            {isAlreadyPremium ? (
              <>
                <PremiumBadge label="Premium" style={{ marginBottom: 20 }} />
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: 16 }}>
                  Débloquez le Binôme Relationnel
                </h1>
                <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
                  Vous êtes déjà Premium 🎉 Passez à Premium+ pour accéder au Binôme, aux suggestions IRIS et à la gamification avancée.
                </p>
              </>
            ) : (
              <>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px",
                  borderRadius: 999, background: "rgba(0,169,157,0.08)", border: "1px solid rgba(0,169,157,0.25)",
                  fontSize: 12, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.06em", marginBottom: 20,
                }}>
                  <Sparkles size={11} /> LINK OFFICE PREMIUM
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 40, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 16 }}>
                  Prenez le contrôle de votre{" "}
                  <span style={{ background: "linear-gradient(135deg, var(--primary) 0%, #0ea5e9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    capital relationnel
                  </span>
                </h1>
                <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
                  Débloquez l'analyse approfondie de votre IQRH, votre ordonnance complète et, avec Premium+, votre Binôme Relationnel.
                </p>
              </>
            )}
          </div>

          {/* Billing Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <div style={{
              display: "inline-flex", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 999, padding: 4,
            }}>
              {(["monthly", "annual"] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  style={{
                    padding: "8px 22px", borderRadius: 999, border: "none",
                    background: billing === b ? (b === "annual" ? "var(--primary)" : "var(--bg)") : "transparent",
                    color: billing === b ? (b === "annual" ? "white" : "var(--text-1)") : "var(--text-3)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 8,
                    boxShadow: billing === b && b === "annual" ? "0 2px 12px rgba(0,169,157,0.2)" : "none",
                    fontFamily: "inherit",
                  }}
                >
                  {b === "monthly" ? "Mensuel" : "Annuel"}
                  {b === "annual" && (
                    <span style={{
                      background: billing === "annual" ? "white" : "var(--primary)",
                      color: billing === "annual" ? "var(--primary)" : "white",
                      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                    }}>
                      -20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Cards */}
          <div style={{ display: "grid", gridTemplateColumns: isAlreadyPremium ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, maxWidth: isAlreadyPremium ? 480 : "100%", margin: "0 auto" }}>

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
                accentColor="var(--text-2)"
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
              accentColor="var(--primary)"
            />
          </div>

          {/* Trust strip */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 40, flexWrap: "wrap" }}>
            {["Paiement sécurisé Stripe", "Sans engagement", "Résiliable à tout moment"].map(t => (
              <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>
                <Check size={12} color="var(--primary)" /> {t}
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
  accentColor: string;
}

function PricingCard({
  title, subtitle, price, period, savings, features,
  featureStyle, ctaLabel, ctaVariant, onCta, loading, disabled, error, recommended, accentColor,
}: PricingCardProps) {
  return (
    <div style={{
      background: "var(--surface)", borderRadius: 18,
      border: recommended ? `2px solid var(--primary)` : "1px solid var(--border)",
      boxShadow: recommended ? "0 8px 32px rgba(0,169,157,0.12)" : "none",
      padding: "32px 28px", position: "relative", overflow: "hidden",
    }}>
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: recommended
          ? "linear-gradient(90deg, var(--primary), #0ea5e9)"
          : "var(--border)",
      }} />

      {recommended && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(0,169,157,0.1)", color: "var(--primary)",
          padding: "3px 12px", borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
        }}>
          RECOMMANDÉ
        </div>
      )}

      <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-1)", marginBottom: 6 }}>
        {title}
      </h2>
      <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 24 }}>{subtitle}</p>

      {/* Price */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 44, fontWeight: 900, lineHeight: 1, color: "var(--text-1)" }}>
            {price}
          </span>
          <span style={{ color: "var(--text-3)", fontSize: 14, paddingBottom: 6 }}>{period}</span>
        </div>
        {savings && (
          <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, marginTop: 4, display: "block" }}>
            {savings}
          </span>
        )}
      </div>

      {/* Features */}
      <ul style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28, padding: 0, listStyle: "none" }}>
        {features.map((feat, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-2)" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
              background: featureStyle === "gradient"
                ? "linear-gradient(135deg, var(--primary), #0ea5e9)"
                : "rgba(0,169,157,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Check size={11} color={featureStyle === "gradient" ? "white" : "var(--primary)"} />
            </div>
            {feat}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={onCta}
        disabled={disabled}
        className={`btn ${ctaVariant === "primary" ? "btn-primary" : "btn-secondary"}`}
        style={{
          width: "100%", padding: "14px",
          display: "flex", justifyContent: "center", alignItems: "center", gap: 8,
          fontSize: 15, fontWeight: 700,
          opacity: disabled && !loading ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirection en cours..." : ctaLabel}
        {!loading && <ArrowRight size={16} />}
      </button>

      {error && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8,
          padding: "10px 12px", borderRadius: 10, marginTop: 10,
          background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
        }}>
          <AlertCircle size={13} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 14 }}>
        Paiement sécurisé par Stripe
      </p>
    </div>
  );
}
