"use client";

import { useState } from "react";
import { Building2, Users, PieChart, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BusinessPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !password || !selectedPlan) return;
    setLoading(true);

    try {
      const res = await fetch("/api/v1/business/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, email, password, plan: selectedPlan }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur de souscription");
      }

      // Si Stripe est configuré, l'API renverrait une URL de checkout.
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // En mode simulation/mock, on connecte directement l'utilisateur
        router.push("/auth/login?registered=business");
      }
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f19", color: "#f8fafc", fontFamily: "'Plus Jakarta Sans', Inter, sans-serif" }}>
      {/* Navbar simplifiée */}
      <nav style={{ padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", borderRadius: 8 }} />
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Link Office <span style={{ color: "#a78bfa" }}>Business</span></span>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 20px" }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.03em" }}>
            Investissez dans le capital<br />
            <span style={{ background: "linear-gradient(90deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Humain et Relationnel
            </span>
          </h1>
          <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
            Déployez l'IQRH au sein de votre organisation. Offrez un suivi personnalisé à vos collaborateurs et accédez à des statistiques consolidées anonymisées.
          </p>
        </div>

        {/* Formulaire de Souscription */}
        <div id="pricing" style={{ display: "flex", gap: 60, alignItems: "flex-start", flexWrap: "wrap" }}>
          
          {/* Plans */}
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Choisissez votre offre</h2>
            
            <div 
              onClick={() => setSelectedPlan("standard")}
              style={{
                background: selectedPlan === "standard" ? "rgba(124,58,237,0.15)" : "rgba(30,41,59,0.4)",
                border: selectedPlan === "standard" ? "2px solid #7c3aed" : "2px solid transparent",
                boxShadow: selectedPlan === "standard" ? "0 0 20px rgba(124,58,237,0.2)" : "none",
                borderRadius: 20, padding: 30, cursor: "pointer", transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={(e) => { if (selectedPlan !== "standard") e.currentTarget.style.background = "rgba(30,41,59,0.8)" }}
              onMouseLeave={(e) => { if (selectedPlan !== "standard") e.currentTarget.style.background = "rgba(30,41,59,0.4)" }}
            >
              <div style={{ position: "absolute", top: 30, right: 30, width: 24, height: 24, borderRadius: "50%", border: selectedPlan === "standard" ? "6px solid #7c3aed" : "2px solid #64748b", background: selectedPlan === "standard" ? "white" : "transparent", transition: "all 0.2s" }} />
              <div style={{ marginBottom: 16, paddingRight: 40 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Licence B2B Standard</h3>
                <span style={{ fontSize: 28, fontWeight: 800 }}>499€<span style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>/mois</span></span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Jusqu'à 250 collaborateurs",
                  "Tableau de bord agrégé anonymisé",
                  "Prescriptions collectives",
                  "Support client prioritaire"
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "#cbd5e1" }}>
                    <Check size={16} style={{ color: "#34d399" }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
            
            <div 
              onClick={() => setSelectedPlan("premium")}
              style={{
                background: selectedPlan === "premium" ? "rgba(14,165,233,0.15)" : "rgba(30,41,59,0.4)",
                border: selectedPlan === "premium" ? "2px solid #0ea5e9" : "2px solid transparent",
                boxShadow: selectedPlan === "premium" ? "0 0 20px rgba(14,165,233,0.2)" : "none",
                borderRadius: 20, padding: 30, cursor: "pointer", transition: "all 0.2s",
                position: "relative"
              }}
              onMouseEnter={(e) => { if (selectedPlan !== "premium") e.currentTarget.style.background = "rgba(30,41,59,0.8)" }}
              onMouseLeave={(e) => { if (selectedPlan !== "premium") e.currentTarget.style.background = "rgba(30,41,59,0.4)" }}
            >
              <div style={{ position: "absolute", top: 30, right: 30, width: 24, height: 24, borderRadius: "50%", border: selectedPlan === "premium" ? "6px solid #0ea5e9" : "2px solid #64748b", background: selectedPlan === "premium" ? "white" : "transparent", transition: "all 0.2s" }} />
              <div style={{ marginBottom: 16, paddingRight: 40 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Licence B2B Enterprise</h3>
                <span style={{ fontSize: 28, fontWeight: 800 }}>Sur devis</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  "Collaborateurs illimités",
                  "SSO (Single Sign-On)",
                  "Extraction de données avancées",
                  "Account Manager dédié"
                ].map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "#cbd5e1" }}>
                    <Check size={16} style={{ color: "#38bdf8" }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formulaire */}
          <div style={{ flex: "1 1 400px", background: "rgba(15,23,42,0.6)", borderRadius: 24, padding: 40, border: "1px solid rgba(255,255,255,0.05)" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Créer votre espace</h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 30 }}>Créez votre compte administrateur et générez vos codes d'accès.</p>
            
            <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Nom de l'Organisation</label>
                <input 
                  type="text" 
                  value={orgName} onChange={e => setOrgName(e.target.value)}
                  placeholder="Ex: Acme Corp"
                  required
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Email Professionnel (Administrateur)</label>
                <input 
                  type="email" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="rh@acme.com"
                  required
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Mot de passe</label>
                <input 
                  type="password" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                  }}
                />
              </div>

              <button 
                type="submit"
                disabled={!selectedPlan || loading}
                style={{
                  marginTop: 10,
                  width: "100%", padding: "16px", borderRadius: 12, border: "none",
                  background: (!selectedPlan || loading) ? "#334155" : "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                  color: (!selectedPlan) ? "#94a3b8" : "white", 
                  fontSize: 16, fontWeight: 600, 
                  cursor: (!selectedPlan || loading) ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                  transition: "all 0.2s"
                }}
              >
                {loading ? "En cours..." : !selectedPlan ? "Sélectionnez une offre à gauche" : selectedPlan === "premium" ? "Demander un devis" : "Valider et Payer"}
                {!loading && selectedPlan && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
