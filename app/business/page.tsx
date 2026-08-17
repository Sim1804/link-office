"use client";

import { useState } from "react";
import { Building2, Users, PieChart, ShieldCheck, ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BusinessPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [populationSize, setPopulationSize] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !contactName || !selectedPlan) return;
    setLoading(true);

    try {
      const res = await fetch("/api/v1/business/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: selectedPlan, 
          organization: orgName, 
          email, 
          contactName, 
          phone, 
          companySize, 
          populationSize, 
          beneficiaries 
        }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-main">
      {/* Navbar simplifiée */}
      <header style={{ height: 64, display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", height: "100%" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #7c3aed, #0ea5e9)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={16} color="white" />
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>Link Office <span style={{ color: "#a78bfa" }}>Business</span></span>
          </Link>
          <Link href="/" className="btn btn-secondary btn-sm" style={{ textDecoration: "none" }}>
            Retour à l'accueil
          </Link>
        </div>
      </header>

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
          <div style={{ flex: "1 1 500px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            
            <div 
              onClick={() => setSelectedPlan("B2B_ENTREPRISE")}
              style={{
                background: selectedPlan === "B2B_ENTREPRISE" ? "rgba(124,58,237,0.15)" : "rgba(30,41,59,0.4)",
                border: selectedPlan === "B2B_ENTREPRISE" ? "2px solid #7c3aed" : "2px solid transparent",
                borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Modèle B2B</h3>
              <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600 }}>Pour les Entreprises</span>
              <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 12 }}>Bilans pour les équipes, dashboard RH, prévention RPS. 100% anonymisé.</p>
            </div>
            
            <div 
              onClick={() => setSelectedPlan("B2G_COLLECTIVITE")}
              style={{
                background: selectedPlan === "B2G_COLLECTIVITE" ? "rgba(14,165,233,0.15)" : "rgba(30,41,59,0.4)",
                border: selectedPlan === "B2G_COLLECTIVITE" ? "2px solid #0ea5e9" : "2px solid transparent",
                borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Modèle B2G</h3>
              <span style={{ fontSize: 14, color: "#38bdf8", fontWeight: 600 }}>Pour les Collectivités</span>
              <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 12 }}>Baromètre territorial. Action publique ciblée et cartographie de l'isolement.</p>
            </div>

            <div 
              onClick={() => setSelectedPlan("B2B2C_PARTENAIRE")}
              style={{
                background: selectedPlan === "B2B2C_PARTENAIRE" ? "rgba(245,158,11,0.15)" : "rgba(30,41,59,0.4)",
                border: selectedPlan === "B2B2C_PARTENAIRE" ? "2px solid #f59e0b" : "2px solid transparent",
                borderRadius: 20, padding: 24, cursor: "pointer", transition: "all 0.2s",
                gridColumn: "1 / -1"
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Modèle B2B2C</h3>
              <span style={{ fontSize: 14, color: "#fbbf24", fontWeight: 600 }}>Mutuelles, Assurances, Partenaires Financeurs</span>
              <p style={{ fontSize: 13, color: "#cbd5e1", marginTop: 12 }}>Financez l'accès Premium ou Premium+ pour vos bénéficiaires. Inclut le Binôme Relationnel IRIS (Premium+).</p>
            </div>

            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: 10 }}>
              <p style={{ fontSize: 14, color: "#64748b" }}>
                Vous êtes un particulier ?{" "}
                <Link href="/auth/register" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Découvrez le Modèle B2C</Link>
              </p>
            </div>

          </div>

          {/* Formulaire */}
          <div style={{ flex: "1 1 350px", background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 40 }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ width: 64, height: 64, background: "rgba(16, 185, 129, 0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <Check size={32} color="#10b981" />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Demande envoyée !</h3>
                <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.5 }}>
                  Merci pour votre intérêt. Un expert Link Office va vous contacter sous 24h pour définir le dimensionnement de votre observatoire.
                </p>
                <button 
                  onClick={() => { setSubmitted(false); setSelectedPlan(null); }}
                  style={{
                    marginTop: 30, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "white", padding: "12px 24px", borderRadius: 12, fontWeight: 600, cursor: "pointer"
                  }}
                >
                  Nouvelle demande
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Demande de devis</h2>
                <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 30 }}>
                  {selectedPlan 
                    ? "Remplissez ce formulaire pour être contacté par notre équipe." 
                    : "Sélectionnez un modèle ci-contre pour accéder au formulaire."}
                </p>
                
                {selectedPlan && (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>
                        {selectedPlan === "B2G_COLLECTIVITE" ? "Nom de la collectivité" : 
                         selectedPlan === "B2B2C_PARTENAIRE" ? "Nom de l'organisme (Mutuelle, etc.)" : 
                         "Nom de l'entreprise"}
                      </label>
                      <input 
                        type="text" 
                        value={orgName} onChange={e => setOrgName(e.target.value)}
                        placeholder="Ex: Mairie de Lyon, Harmonie..."
                        required
                        style={{
                          width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Nom du contact principal</label>
                      <input 
                        type="text" 
                        value={contactName} onChange={e => setContactName(e.target.value)}
                        placeholder="Jean Dupont"
                        required
                        style={{
                          width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Email Professionnel</label>
                      <input 
                        type="email" 
                        value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="contact@organisation.com"
                        required
                        style={{
                          width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Téléphone (Optionnel)</label>
                      <input 
                        type="tel" 
                        value={phone} onChange={e => setPhone(e.target.value)}
                        placeholder="01 23 45 67 89"
                        style={{
                          width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                        }}
                      />
                    </div>

                    {selectedPlan === "B2B_ENTREPRISE" && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Taille de l'entreprise</label>
                        <select 
                          value={companySize} onChange={e => setCompanySize(e.target.value)}
                          style={{
                            width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                          }}
                        >
                          <option value="" disabled style={{ background: "#0b0f19", color: "#f8fafc" }}>Sélectionnez une taille</option>
                          <option value="1-50" style={{ background: "#0b0f19", color: "#f8fafc" }}>1 à 50 employés</option>
                          <option value="51-250" style={{ background: "#0b0f19", color: "#f8fafc" }}>51 à 250 employés</option>
                          <option value="250+" style={{ background: "#0b0f19", color: "#f8fafc" }}>Plus de 250 employés</option>
                        </select>
                      </div>
                    )}

                    {selectedPlan === "B2G_COLLECTIVITE" && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Population concernée</label>
                        <input 
                          type="text" 
                          value={populationSize} onChange={e => setPopulationSize(e.target.value)}
                          placeholder="Ex: 50 000 habitants"
                          style={{
                            width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                          }}
                        />
                      </div>
                    )}

                    {selectedPlan === "B2B2C_PARTENAIRE" && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>Bénéficiaires estimés</label>
                        <input 
                          type="text" 
                          value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)}
                          placeholder="Ex: 500 personnes"
                          style={{
                            width: "100%", padding: "14px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.03)", color: "white", fontSize: 15, fontFamily: "inherit"
                          }}
                        />
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading || !selectedPlan}
                      style={{
                        background: "linear-gradient(135deg, #10b981, #059669)",
                        color: "white", padding: 16, borderRadius: 12, fontWeight: 700, fontSize: 16, border: "none",
                        cursor: (loading || !selectedPlan) ? "not-allowed" : "pointer", opacity: (loading || !selectedPlan) ? 0.7 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10
                      }}
                    >
                      {loading ? "Envoi..." : "Envoyer la demande"}
                      {!loading && <ArrowRight size={20} />}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
