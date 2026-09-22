"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, LockOpen, AlertCircle } from "lucide-react";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const [loading, setLoading] = useState<"PREMIUM" | "PREMIUM_PLUS" | false>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const router = useRouter();

  const handleCheckout = async (tier: "PREMIUM" | "PREMIUM_PLUS") => {
    setCheckoutError(null);
    try {
      setLoading(tier);
      const res = await fetch("/api/stripe/checkout", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, billing })
      });
      if (!res.ok) throw new Error("Erreur lors de la création de la session de paiement.");
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL de paiement invalide. Veuillez réessayer.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const isPremiumLoading = loading === "PREMIUM";
  const isPremiumPlusLoading = loading === "PREMIUM_PLUS";

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px 80px", position: "relative", zIndex: 10 }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <PremiumBadge style={{ marginBottom: 24 }} />
            
            <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Prenez le contrôle de votre <br />
              <span style={{
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                capital relationnel
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "var(--text-2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Débloquez l'analyse approfondie de votre Indice de Complexité Relationnelle (ICR) et accédez à l'intégralité de votre ordonnance personnalisée.
            </p>
          </div>

          {/* Billing Toggle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", background: "var(--surface)",
              border: "1px solid var(--border)", borderRadius: 999, padding: 4, position: "relative"
            }}>
              <button
                onClick={() => setBilling("monthly")}
                style={{
                  padding: "10px 24px", borderRadius: 999, border: "none",
                  background: billing === "monthly" ? "var(--bg)" : "transparent",
                  color: billing === "monthly" ? "var(--text-1)" : "var(--text-3)",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  boxShadow: billing === "monthly" ? "0 2px 8px rgba(0,0,0,0.05)" : "none"
                }}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBilling("annual")}
                style={{
                  padding: "10px 24px", borderRadius: 999, border: "none",
                  background: billing === "annual" ? "var(--primary)" : "transparent",
                  color: billing === "annual" ? "white" : "var(--text-3)",
                  fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: billing === "annual" ? "0 4px 12px rgba(0,169,157,0.2)" : "none"
                }}
              >
                Annuel
                <span style={{
                  background: billing === "annual" ? "white" : "var(--primary)",
                  color: billing === "annual" ? "var(--primary)" : "white",
                  padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800
                }}>
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center" }}>
            {/* Features */}
            <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 24 }}>
              <FeatureItem 
                icon={<LockOpen size={24} color="var(--primary)" />}
                title="Analyse ICR complète"
                description="Découvrez vos facteurs de vulnérabilité, vos dynamiques profondes et vos besoins dominants."
              />
              <FeatureItem 
                icon={<Zap size={24} color="#38bdf8" />}
                title="Ordonnance illimitée"
                description="Accédez à l'ensemble des recommandations, micro-défis et parcours personnalisés par l'IA."
              />
              <FeatureItem 
                icon={<ShieldCheck size={24} color="#34d399" />}
                title="Soutien de votre profil"
                description="Descriptions étendues de vos profils primaires et secondaires, pour une meilleure introspection."
              />
            </div>

            {/* Premium Pricing Card */}
            <div className="card" style={{ flex: "1 1 350px", padding: 40, position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--text-2), var(--text-3))" }} />
              
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pass Premium</h2>
              <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 30 }}>Accès à vie à vos résultats détaillés.</p>
              
              <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{billing === "annual" ? "95.90€" : "9.99€"}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 15, fontWeight: 500, paddingBottom: 6 }}>{billing === "annual" ? "/an" : "/mois"}</span>
                </div>
                {billing === "annual" && (
                  <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>Soit l'équivalent de 7,99 € / mois</span>
                )}
              </div>

              <ul style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {["Détail des forces et vigilances", "Facteurs de vulnérabilité ICR", "Besoins dominants décodés", "Ordonnance relationnelle Premium"].map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "var(--text-2)" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={14} color="var(--primary)" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout("PREMIUM")}
                disabled={loading !== false}
                className="btn btn-secondary"
                style={{
                  width: "100%", padding: "18px", borderRadius: 999, border: "1px solid var(--border-strong)",
                  background: isPremiumLoading ? "var(--bg)" : "transparent",
                  color: "var(--text-1)", fontSize: 16, fontWeight: 700, 
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                  transition: "all 0.2s"
                }}
              >
                {isPremiumLoading ? "Redirection..." : "S'abonner à Premium"}
                {!isPremiumLoading && <ArrowRight size={18} />}
              </button>

              {checkoutError && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: 8,
                  padding: "12px 14px", borderRadius: 10, marginTop: 12,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                }}>
                  <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{checkoutError}</p>
                </div>
              )}

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 16 }}>
                Paiement sécurisé par Stripe
              </p>
            </div>

            {/* Premium Plus Pricing Card */}
            <div className="card" style={{ flex: "1 1 350px", padding: 40, position: "relative", overflow: "hidden", border: "2px solid var(--primary)", boxShadow: "0 20px 40px rgba(0,169,157,0.15)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, var(--primary), #0ea5e9)" }} />
              <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(0,169,157,0.1)", color: "var(--primary)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                RECOMMANDÉ
              </div>
              
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Premium +</h2>
              <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 30 }}>L'expérience relationnelle intégrale.</p>
              
              <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>{billing === "annual" ? "143.90€" : "14.99€"}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 15, fontWeight: 500, paddingBottom: 6 }}>{billing === "annual" ? "/an" : "/mois"}</span>
                </div>
                {billing === "annual" && (
                  <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>Soit l'équivalent de 11,99 € / mois</span>
                )}
              </div>

              <ul style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {["Tout le contenu Premium", "Accès exclusif au Binôme Relationnel", "Suggestions de partenaires par IRIS", "Check-ins et gamification"].map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "var(--text-1)", fontWeight: i >= 1 ? 600 : 400 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={14} color="white" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout("PREMIUM_PLUS")}
                disabled={loading !== false}
                className="btn btn-primary"
                style={{
                  width: "100%", padding: "18px", borderRadius: 999, border: "none",
                  background: isPremiumPlusLoading ? "var(--text-3)" : "linear-gradient(135deg, var(--primary), #0ea5e9)",
                  color: "white", fontSize: 16, fontWeight: 700, 
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                  boxShadow: "0 10px 30px rgba(0,169,157,0.3)"
                }}
              >
                {isPremiumPlusLoading ? "Redirection..." : "Débloquer Premium +"}
                {!isPremiumPlusLoading && <Sparkles size={18} />}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-3)", marginTop: 16 }}>
                Paiement sécurisé par Stripe
              </p>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "var(--surface)", padding: 24, borderRadius: 20, border: "1px solid rgba(18,61,70,0.05)", transition: "all 0.2s" }}
         onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(18,61,70,0.05)" }}
         onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)" }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(18,61,70,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--text-1)" }}>{title}</h3>
        <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  )
}
