/**
 * app/business/page.tsx — Page commerciale LinkOffice for Organisations
 * Conforme à la charte visuelle de app/page.tsx :
 * - Animations anim-fade-up, classes globales (container, section, badge-*, gradient-text)
 * - Aucun alert() — erreurs inline
 * - Footer présent
 * - SEO metadata (via export metadata dans layout ou head)
 */
"use client";

import { useState } from "react";
import {
  Building2, Users, BarChart3, ShieldCheck, ArrowRight,
  Check, Zap, Globe, TrendingUp, CheckCircle2, Star,
  AlertCircle, MapPin, HeartPulse, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/* ── Types ──────────────────────────────────────────────────── */
type Plan = "B2B_ENTREPRISE" | "B2G_COLLECTIVITE" | "B2B2C_PARTENAIRE" | null;

/* ── Données ─────────────────────────────────────────────────── */

const STATS = [
  { value: "+500",  label: "Entreprises partenaires" },
  { value: "98%",   label: "Satisfaction client" },
  { value: "48h",   label: "Déploiement garanti" },
  { value: "RGPD",  label: "Conformité totale" },
];

const PLANS: {
  id: NonNullable<Plan>;
  label: string;
  sub: string;
  desc: string;
  bullets: string[];
  color: string;
  glow: string;
  border: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "B2B_ENTREPRISE",
    label: "Modèle B2B",
    sub: "Pour les Entreprises",
    desc: "Bilans relationnels pour vos équipes, dashboard RH anonymisé et prévention des RPS.",
    bullets: ["Dashboard RH anonymisé", "Indice de Charge Relationnelle (ICR)", "Plan d'action collaboratif", "Rapport PDF pour la Direction"],
    color: "#a78bfa",
    glow: "rgba(124,58,237,0.14)",
    border: "#7c3aed",
    icon: <Building2 size={22} />,
  },
  {
    id: "B2G_COLLECTIVITE",
    label: "Modèle B2G",
    sub: "Pour les Collectivités",
    desc: "Baromètre territorial, action publique ciblée et cartographie de l'isolement social.",
    bullets: ["Observatoire du lien social", "Segmentation géographique", "Recommandations de politiques publiques", "Anonymat CNIL garanti"],
    color: "#38bdf8",
    glow: "rgba(14,165,233,0.14)",
    border: "#0ea5e9",
    icon: <Globe size={22} />,
  },
  {
    id: "B2B2C_PARTENAIRE",
    label: "Modèle B2B2C",
    sub: "Mutuelles & Assurances",
    desc: "Financez l'accès Premium ou Premium+ pour vos bénéficiaires. Inclut le Binôme Relationnel IRIS (Premium+).",
    bullets: ["Accès Premium financé", "Entonnoir d'activation suivi", "Orientations vers vos services de soins", "Module Binôme (Premium+)"],
    color: "#fbbf24",
    glow: "rgba(245,158,11,0.14)",
    border: "#f59e0b",
    icon: <HeartPulse size={22} />,
  },
];

const FEATURES = [
  { icon: <BarChart3 size={24} color="#a78bfa" />, label: "Dashboard anonymisé", desc: "Statistiques agrégées RGPD-conformes en temps réel.", badge: "Analyse" },
  { icon: <ShieldCheck size={24} color="#34d399" />, label: "Sécurité garantie", desc: "Seuil d'anonymat à 5 répondants, données hébergées en France.", badge: "Sécurité" },
  { icon: <TrendingUp size={24} color="#38bdf8" />, label: "Rapports détaillés", desc: "ICR, profils IQRH, météo relationnelle et plan d'action.", badge: "Rapports" },
  { icon: <Zap size={24} color="#fbbf24" />, label: "Déploiement rapide", desc: "Sous 48h après signature : code d'accès, QR code et onboarding.", badge: "Rapidité" },
  { icon: <Sparkles size={24} color="#f43f5e" />, label: "IA IRIS intégrée", desc: "Coach IA personnalisé pour chaque bénéficiaire de votre organisation.", badge: "IA" },
  { icon: <Users size={24} color="#c084fc" />, label: "Binôme Relationnel", desc: "Connexion bienveillante entre collaborateurs (offre Premium+).", badge: "Premium+" },
];

const TESTIMONIALS = [
  { name: "Sophie M.", role: "DRH — Groupe Santé", text: "Le dashboard IQRH nous a permis d'identifier des signaux faibles dans nos équipes bien avant que cela devienne un problème RH.", stars: 5 },
  { name: "Jean-Pierre L.", role: "DSI — Collectivité Territoriale", text: "L'observatoire territorial est d'une précision remarquable. Nos élus disposent enfin de données concrètes sur l'isolement.", stars: 5 },
  { name: "Amandine R.", role: "Responsable Prévention — Mutuelle", text: "En 3 mois, 73% de nos bénéficiaires avaient complété leur bilan. Le taux d'engagement est exceptionnel.", stars: 5 },
];

/* ── Composant principal ─────────────────────────────────────── */
export default function BusinessPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [orgName,        setOrgName]        = useState("");
  const [email,          setEmail]          = useState("");
  const [contactName,    setContactName]    = useState("");
  const [phone,          setPhone]          = useState("");
  const [companySize,    setCompanySize]    = useState("");
  const [populationSize, setPopulationSize] = useState("");
  const [beneficiaries,  setBeneficiaries]  = useState("");

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !contactName || !selectedPlan) return;
    setLoading(true);
    setSubmitError(null);
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
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  return (
    <>
      <Navbar />

      {/* Blobs d'arrière-plan */}
      <div className="blob-violet" />
      <div className="blob-cyan" />

      <main style={{ position: "relative", zIndex: 1 }}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section style={{ paddingTop: 140, paddingBottom: 80 }}>
          <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

            <div className="anim-fade-up">
              <span className="badge badge-violet" style={{ marginBottom: 24, fontSize: 13 }}>
                <Building2 size={13} /> Solutions Organisations & Collectivités
              </span>
            </div>

            <h1 className="anim-fade-up delay-1" style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800, fontSize: "clamp(36px, 6vw, 68px)",
              lineHeight: 1.1, color: "var(--text-1)", marginBottom: 24, maxWidth: 860,
            }}>
              Investissez dans le{" "}
              <span className="gradient-text">capital humain</span>
              <br />& relationnel de votre organisation
            </h1>

            <p className="anim-fade-up delay-2" style={{
              color: "var(--text-2)", fontSize: "clamp(15px, 1.8vw, 18px)",
              maxWidth: 620, lineHeight: 1.7, marginBottom: 44,
            }}>
              Déployez l'IQRH au sein de votre structure. Offrez un suivi personnalisé
              à vos collaborateurs et accédez aux statistiques consolidées anonymisées.
            </p>

            <div className="anim-fade-up delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 72 }}>
              <a href="#devis" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
                Demander un devis <ArrowRight size={16} />
              </a>
              <Link href="/auth/register" className="btn btn-secondary btn-lg" style={{
                textDecoration: "none", border: "1px solid rgba(124,58,237,0.3)",
                background: "rgba(124,58,237,0.05)",
              }}>
                Découvrir l'offre B2C
              </Link>
            </div>

            {/* Preview card — dashboard RH anonymisé */}
            <div className="anim-fade-up delay-4" style={{ width: "100%", maxWidth: 500 }}>
              <div className="card" style={{ borderRadius: 28, padding: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "var(--text-2)", fontSize: 13, fontWeight: 600 }}>Score IQRH moyen équipe</span>
                  <span className="badge badge-cyan">⛅ Éclaircies</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 20 }}>
                  <span className="gradient-text" style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>74</span>
                  <span style={{ color: "var(--text-2)", fontSize: 20 }}>/100</span>
                  <span style={{ marginLeft: "auto", color: "#34d399", fontSize: 13, fontWeight: 600 }}>↑ +6 pts</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { label: "Relations sociales",     score: 82, color: "#34d399" },
                    { label: "Relations affectives",   score: 71, color: "#a78bfa" },
                    { label: "Vie sentimentale",       score: 58, color: "#f59e0b" },
                    { label: "Vie professionnelle",    score: 88, color: "#34d399" },
                    { label: "Relation à soi",         score: 70, color: "#a78bfa" },
                  ].map(({ label, score, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "var(--text-3)", fontSize: 12, width: 150, flexShrink: 0 }}>{label}</span>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
                      </div>
                      <span style={{ color: "var(--text-2)", fontSize: 12, fontWeight: 600, width: 24, textAlign: "right" }}>{score}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 16, fontSize: 11, color: "var(--text-3)", textAlign: "center" }}>
                  🔒 Données agrégées anonymisées — 47 collaborateurs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────── */}
        <section style={{
          borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
          background: "rgba(17,24,39,0.5)", padding: "48px 0",
        }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {STATS.map(({ value, label }) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div className="gradient-text" style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.1 }}>{value}</div>
                  <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────── */}
        <section id="features" className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-violet" style={{ marginBottom: 16 }}>Fonctionnalités</span>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)", marginBottom: 16,
              }}>
                Tout ce dont votre organisation{" "}
                <span className="gradient-text">a besoin</span>
              </h2>
              <p style={{ color: "var(--text-2)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Une plateforme complète, sécurisée et déployée en 48h.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {FEATURES.map(({ label, desc, icon, badge }) => (
                <div key={label} className="card card-hover">
                  <div style={{
                    width: 48, height: 48, background: "rgba(124,58,237,0.12)", borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20,
                  }}>
                    {icon}
                  </div>
                  <span className="badge badge-violet" style={{ marginBottom: 12 }}>{badge}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>{label}</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANS & FORMULAIRE ───────────────────────────────── */}
        <section id="devis" className="section" style={{ paddingTop: 0 }}>
          <div className="container">

            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-cyan" style={{ marginBottom: 16 }}>Tarification</span>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)",
              }}>
                Choisissez votre <span className="gradient-text">modèle</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 40, alignItems: "start" }}>

              {/* Cartes de plans */}
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
                        borderColor: isSelected ? `${plan.border}90` : "rgba(255,255,255,0.08)",
                        outline: isSelected ? `2px solid ${plan.border}60` : "none",
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                        <div style={{
                          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                          background: `${plan.color}18`, border: `1px solid ${plan.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: plan.color,
                        }}>
                          {plan.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{plan.label}</h3>
                            <span style={{ fontSize: 12, fontWeight: 600, color: plan.color }}>{plan.sub}</span>
                            {isSelected && (
                              <span style={{
                                marginLeft: "auto", width: 20, height: 20, borderRadius: "50%",
                                background: plan.color, display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <Check size={12} color="#0b0f19" />
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 12 }}>{plan.desc}</p>
                          <ul style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {plan.bullets.map(b => (
                              <li key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-3)" }}>
                                <CheckCircle2 size={12} style={{ color: plan.color, flexShrink: 0 }} />
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <p style={{ marginTop: 8, fontSize: 13, color: "#475569", textAlign: "center" }}>
                  Vous êtes un particulier ?{" "}
                  <Link href="/auth/register" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                    Découvrez l'offre B2C
                  </Link>
                </p>
              </div>

              {/* Formulaire de devis */}
              <div className="card" style={{ position: "sticky", top: 108 }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{
                      width: 68, height: 68, borderRadius: "50%",
                      background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                    }}>
                      <Check size={30} color="#34d399" />
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: "var(--text-1)" }}>
                      Demande envoyée !
                    </h3>
                    <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                      Merci pour votre intérêt. Un expert Link Office vous contactera sous 24h
                      pour définir le dimensionnement de votre observatoire.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setSelectedPlan(null); setSubmitError(null); }}
                      className="btn btn-secondary btn-md"
                    >
                      Nouvelle demande
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 24 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>
                        Demande de devis
                      </h2>
                      <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                        {selectedPlan
                          ? `Modèle sélectionné : ${activePlan?.sub}`
                          : "Sélectionnez un modèle ci-contre pour accéder au formulaire."}
                      </p>
                    </div>

                    {/* Erreur inline — remplace alert() */}
                    {submitError && (
                      <div style={{
                        display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px",
                        borderRadius: 10, marginBottom: 16,
                        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                      }}>
                        <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0, marginTop: 1 }} />
                        <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{submitError}</p>
                      </div>
                    )}

                    {selectedPlan ? (
                      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>
                            {selectedPlan === "B2G_COLLECTIVITE"  ? "Nom de la collectivité *"  :
                             selectedPlan === "B2B2C_PARTENAIRE"  ? "Nom de l'organisme *"       : "Nom de l'entreprise *"}
                          </label>
                          <input
                            type="text" required
                            value={orgName} onChange={e => setOrgName(e.target.value)}
                            placeholder="Ex : Mairie de Lyon, Harmonie Mutuelle..."
                            className="input-field"
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Nom du contact *</label>
                          <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jean Dupont" className="input-field" />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Email professionnel *</label>
                          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@organisation.com" className="input-field" />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Téléphone (optionnel)</label>
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01 23 45 67 89" className="input-field" />
                        </div>

                        {selectedPlan === "B2B_ENTREPRISE" && (
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Taille de l'entreprise</label>
                            <select value={companySize} onChange={e => setCompanySize(e.target.value)} className="input-field" style={{ cursor: "pointer" }}>
                              <option value="" disabled>Sélectionnez une taille</option>
                              <option value="1-50">1 à 50 employés</option>
                              <option value="51-250">51 à 250 employés</option>
                              <option value="250+">Plus de 250 employés</option>
                            </select>
                          </div>
                        )}

                        {selectedPlan === "B2G_COLLECTIVITE" && (
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Population concernée</label>
                            <input type="text" value={populationSize} onChange={e => setPopulationSize(e.target.value)} placeholder="Ex : 50 000 habitants" className="input-field" />
                          </div>
                        )}

                        {selectedPlan === "B2B2C_PARTENAIRE" && (
                          <div>
                            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 6 }}>Bénéficiaires estimés</label>
                            <input type="text" value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} placeholder="Ex : 500 personnes" className="input-field" />
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="btn btn-primary btn-lg"
                          style={{ width: "100%", marginTop: 4 }}
                        >
                          {loading
                            ? "Envoi en cours..."
                            : <><span>Envoyer la demande</span><ArrowRight size={18} /></>}
                        </button>

                        <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center" }}>
                          Vos données sont traitées dans le respect du RGPD.{" "}
                          <Link href="/politique-confidentialite" style={{ color: "var(--text-2)", textDecoration: "underline" }}>
                            Politique de confidentialité
                          </Link>
                        </p>
                      </form>
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
                        <Building2 size={36} style={{ marginBottom: 16, opacity: 0.25 }} />
                        <p style={{ fontSize: 14 }}>Choisissez un modèle ci-contre<br />pour accéder au formulaire.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ──────────────────────────────────────── */}
        <section id="temoignages" className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <span className="badge badge-amber" style={{ marginBottom: 16 }}>Témoignages</span>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)",
              }}>
                Ce que disent nos <span className="gradient-text">partenaires</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
              {TESTIMONIALS.map(({ name, role, text, stars }) => (
                <div key={name} className="card card-hover">
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={15} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                    "{text}"
                  </p>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{name}</p>
                    <p style={{ fontSize: 12, color: "var(--text-3)" }}>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────── */}
        <section style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <div className="card" style={{
              borderRadius: 32, padding: "64px 48px", textAlign: "center",
              background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)",
              border: "1px solid rgba(124,58,237,0.25)",
            }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                fontWeight: 800, fontSize: "clamp(26px, 4vw, 40px)", color: "var(--text-1)", marginBottom: 16,
              }}>
                Prêt à déployer l'IQRH dans votre{" "}
                <span className="gradient-text">organisation</span> ?
              </h2>
              <p style={{ color: "var(--text-2)", marginBottom: 36, fontSize: 16, lineHeight: 1.6 }}>
                Rejoignez les organisations qui ont fait du bien-être relationnel un avantage compétitif.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <a href="#devis" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
                  Demander un devis <ArrowRight size={16} />
                </a>
                <Link href="/auth/register" className="btn btn-secondary btn-lg" style={{
                  textDecoration: "none",
                  border: "1px solid rgba(124,58,237,0.3)",
                  background: "rgba(124,58,237,0.05)",
                }}>
                  Essayer en tant que particulier
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
