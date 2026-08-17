"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, LockOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!res.ok) throw new Error("Erreur lors de la création de la session");
      
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("URL invalide");
      }
    } catch (err) {
      alert("Une erreur s'est produite lors de la redirection vers le paiement.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ position: "relative", overflow: "hidden" }}>
        {/* Blobs for premium effect */}
        <div className="blob-violet" style={{ top: "-10%", right: "-10%", width: 600, height: 600, opacity: 0.5 }} />
        <div className="blob-cyan" style={{ bottom: "-10%", left: "-10%", width: 600, height: 600, opacity: 0.5 }} />

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 20px", position: "relative", zIndex: 10 }}>
          
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)",
              border: "1px solid rgba(124,58,237,0.3)",
              padding: "10px 18px", borderRadius: 20,
              marginBottom: 24,
            }}>
              <Sparkles size={16} color="#a78bfa" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.05em" }}>LinkOffice Premium</span>
            </div>
            
            <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              Prenez le contrôle de votre <br />
              <span style={{
                background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>
                capital relationnel
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Débloquez l'analyse approfondie de votre Indice de Complexité Relationnelle (ICR) et accédez à l'intégralité de votre ordonnance personnalisée.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center" }}>
            {/* Features */}
            <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 24 }}>
              <FeatureItem 
                icon={<LockOpen size={24} color="#a78bfa" />}
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

            {/* Pricing Card */}
            <div className="card" style={{ flex: "1 1 350px", padding: 40, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #7c3aed, #0ea5e9)" }} />
              
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Pass Premium</h2>
              <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 30 }}>Accès à vie à vos résultats détaillés.</p>
              
              <div style={{ marginBottom: 30, display: "flex", alignItems: "flex-end", gap: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 800, lineHeight: 1 }}>49€</span>
                <span style={{ color: "#64748b", fontSize: 15, fontWeight: 500, paddingBottom: 6 }}>paiement unique</span>
              </div>

              <ul style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                {["Détail des forces et vigilances", "Facteurs de vulnérabilité ICR", "Besoins dominants décodés", "Ordonnance relationnelle Premium"].map((feat, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, color: "#cbd5e1" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(124,58,237,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Check size={14} color="#a78bfa" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: "100%", padding: "18px", borderRadius: 16, border: "none",
                  background: loading ? "#334155" : "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                  color: "white", fontSize: 16, fontWeight: 700, 
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                  boxShadow: "0 10px 30px rgba(124,58,237,0.3)"
                }}
              >
                {loading ? "Redirection..." : "Débloquer le Premium"}
                {!loading && <ArrowRight size={18} />}
              </button>
              
              <p style={{ textAlign: "center", fontSize: 12, color: "#64748b", marginTop: 16 }}>
                Paiement sécurisé par Stripe
              </p>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "rgba(255,255,255,0.02)", padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.2s" }}
         onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
         onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)" }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: "#f8fafc" }}>{title}</h3>
        <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>{description}</p>
      </div>
    </div>
  )
}
