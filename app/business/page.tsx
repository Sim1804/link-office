/**
 * app/business/page.tsx - Page commerciale B2B/B2G/B2B2C
 * Formulaire de demande de devis pour les organisations.
 */
"use client";

import { useState } from "react";
import {
  Building2, Users, BarChart3, ShieldCheck, ArrowRight,
  Check, Zap, Globe, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

type Plan = "B2B_ENTREPRISE" | "B2G_COLLECTIVITE" | "B2B2C_PARTENAIRE" | null;

const PLANS: { id: NonNullable<Plan>; label: string; sub: string; desc: string; color: string; glow: string; border: string; icon: React.ReactNode }[] = [
  {
    id: "B2B_ENTREPRISE",
    label: "Modele B2B",
    sub: "Pour les Entreprises",
    desc: "Bilans relationnels pour vos equipes, dashboard RH anonymise et prevention des RPS.",
    color: "#a78bfa",
    glow: "rgba(124,58,237,0.18)",
    border: "#7c3aed",
    icon: <Building2 size={20} />,
  },
  {
    id: "B2G_COLLECTIVITE",
    label: "Modele B2G",
    sub: "Pour les Collectivites",
    desc: "Barometre territorial, action publique ciblee et cartographie de l isolement social.",
    color: "#38bdf8",
    glow: "rgba(14,165,233,0.18)",
    border: "#0ea5e9",
    icon: <Globe size={20} />,
  },
  {
    id: "B2B2C_PARTENAIRE",
    label: "Modele B2B2C",
    sub: "Mutuelles & Assurances",
    desc: "Financez l acces Premium ou Premium+ pour vos beneficiaires. Inclut le Binome Relationnel IRIS (Premium+).",
    color: "#fbbf24",
    glow: "rgba(245,158,11,0.18)",
    border: "#f59e0b",
    icon: <Users size={20} />,
  },
];

const FEATURES = [
  { icon: <BarChart3 size={18} />, label: "Dashboard anonymise", desc: "Statistiques agregees RGPD-conformes" },
  { icon: <ShieldCheck size={18} />, label: "Securite garantie", desc: "Seuil d anonymat a 5 repondants" },
  { icon: <TrendingUp size={18} />, label: "Rapports detailles", desc: "ICR, profils IQRH, plan d action" },
  { icon: <Zap size={18} />, label: "Deploiement rapide", desc: "Sous 48h apres signature" },
];

export default function BusinessPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [orgName,      setOrgName]      = useState("");
  const [email,        setEmail]        = useState("");
  const [contactName,  setContactName]  = useState("");
  const [phone,        setPhone]        = useState("");
  const [companySize,  setCompanySize]  = useState("");
  const [populationSize, setPopulationSize] = useState("");
  const [beneficiaries,  setBeneficiaries]  = useState("");

  const [loading,   setLoading]   = useState(false);
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
          beneficiaries,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l envoi");
      setSubmitted(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ paddingTop: 108 }}>
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>

          {/* Hero */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24,
              padding: "6px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
              background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa"
            }}>
              <Building2 size={13} /> Solutions Organisations &amp; Collectivites
            </div>
            <h1 style={{
              fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", marginBottom: 20
            }}>
              Investissez dans le capital<br />
              <span style={{ background: "linear-gradient(90deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Humain &amp; Relationnel
              </span>
            </h1>
            <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 600, margin: "0 auto", lineHeight: 1.7 }}>
              Deployez l IQRH au sein de votre organisation. Offrez un suivi personnalise a vos collaborateurs et
              acces aux statistiques consolides anonymisees.
            </p>
          </div>

          {/* Features strip */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 64
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ padding: "20px 20px", textAlign: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: "0 auto 12px",
                  background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa"
                }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc", marginBottom: 4 }}>{f.label}</p>
                <p style={{ fontSize: 12, color: "#64748b" }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Main layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 32, alignItems: "start" }}>

            {/* Plans */}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 20 }}>
                Choisissez votre modele
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {PLANS.map(plan => {
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className="card card-hover"
                      style={{
                        cursor: "pointer", transition: "all 0.25s",
                        background: isSelected ? plan.glow : "rgba(17,24,39,0.65)",
                        borderColor: isSelected ? `${plan.border}80` : "rgba(255,255,255,0.08)",
                        outline: isSelected ? `2px solid ${plan.border}60` : "none",
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{
                          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                          background: `${plan.color}18`, border: `1px solid ${plan.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: plan.color
                        }}>
                          {plan.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>{plan.label}</h3>
                            <span style={{ fontSize: 12, fontWeight: 600, color: plan.color }}>{plan.sub}</span>
                            {isSelected && (
                              <span style={{
                                marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
                                background: plan.color, display: "flex", alignItems: "center", justifyContent: "center"
                              }}>
                                <Check size={12} color="#0b0f19" />
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{plan.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p style={{ marginTop: 20, fontSize: 13, color: "#475569", textAlign: "center" }}>
                Vous etes un particulier ?{" "}
                <Link href="/auth/register" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                  Decouvrez l offre B2C
                </Link>
              </p>
            </div>

            {/* Form */}
            <div className="card" style={{ position: "sticky", top: 108 }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
                  }}>
                    <Check size={28} color="#34d399" />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "#f8fafc" }}>Demande envoyee !</h3>
                  <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    Merci pour votre interet. Un expert Link Office vous contactera sous 24h pour definir le dimensionnement de votre observatoire.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setSelectedPlan(null); }}
                    className="btn btn-secondary btn-md"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>
                      Demande de devis
                    </h2>
                    <p style={{ color: "#64748b", fontSize: 13 }}>
                      {selectedPlan
                        ? `Modele selectionne : ${activePlan?.sub}`
                        : "Selectionnez un modele ci-contre pour acceder au formulaire."}
                    </p>
                  </div>

                  {selectedPlan && (
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>
                          {selectedPlan === "B2G_COLLECTIVITE"  ? "Nom de la collectivite *"  :
                           selectedPlan === "B2B2C_PARTENAIRE" ? "Nom de l organisme *"        : "Nom de l entreprise *"}
                        </label>
                        <input
                          type="text" required
                          value={orgName} onChange={e => setOrgName(e.target.value)}
                          placeholder="Ex: Mairie de Lyon, Harmonie Mutuelle..."
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Nom du contact *</label>
                        <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jean Dupont" className="input-field" />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Email Professionnel *</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@organisation.com" className="input-field" />
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Telephone (Optionnel)</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01 23 45 67 89" className="input-field" />
                      </div>

                      {selectedPlan === "B2B_ENTREPRISE" && (
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Taille de l entreprise</label>
                          <select value={companySize} onChange={e => setCompanySize(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                            <option value="" disabled>Selectionnez une taille</option>
                            <option value="1-50">1 a 50 employes</option>
                            <option value="51-250">51 a 250 employes</option>
                            <option value="250+">Plus de 250 employes</option>
                          </select>
                        </div>
                      )}

                      {selectedPlan === "B2G_COLLECTIVITE" && (
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Population concernee</label>
                          <input type="text" value={populationSize} onChange={e => setPopulationSize(e.target.value)} placeholder="Ex: 50 000 habitants" className="input-field" />
                        </div>
                      )}

                      {selectedPlan === "B2B2C_PARTENAIRE" && (
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Beneficiaires estimes</label>
                          <input type="text" value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} placeholder="Ex: 500 personnes" className="input-field" />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || !selectedPlan}
                        className="btn btn-primary btn-lg"
                        style={{ width: "100%", marginTop: 4 }}
                      >
                        {loading ? "Envoi..." : <><span>Envoyer la demande</span><ArrowRight size={18} /></>}
                      </button>

                      <p style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>
                        Vos donnees sont traitees dans le respect du RGPD.{" "}
                        <Link href="/politique-confidentialite" style={{ color: "#64748b", textDecoration: "underline" }}>
                          Politique de confidentialite
                        </Link>
                      </p>
                    </form>
                  )}

                  {!selectedPlan && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "#475569" }}>
                      <Building2 size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                      <p style={{ fontSize: 13 }}>Choisissez un modele pour acceder au formulaire.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
