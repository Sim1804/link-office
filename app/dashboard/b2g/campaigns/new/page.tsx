"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Calendar, Save, Search, CheckCircle2, Settings, List, Plus, Trash2, ArrowLeft, ArrowRight, Activity, Target, HelpCircle, AlertCircle, Info, Users, MapPin, Zap, Crown, ChevronRight } from "lucide-react";
import { Stepper } from "@/components/ui/Stepper";
import { OfferCard } from "@/components/ui/OfferCard";
import Link from "next/link";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";

/* ── Données statiques ──────────────────────────────────────────── */
const VARIABLE_LIBRARY = [
  { id: "commune", question: "Dans quelle commune ou quartier résidez-vous ?" },
  { id: "statut_etablissement", question: "Quel est votre statut dans cet établissement ?" },
  { id: "anciennete", question: "Depuis combien de temps vivez-vous sur ce territoire ?" },
  { id: "mobilite", question: "Comment vous déplacez-vous principalement ?" },
  { id: "acces_services", question: "Avez-vous facilement accès aux services publics de proximité ?" },
  { id: "participation_locale", question: "Participez-vous à la vie locale (associations, conseils, événements) ?" },
  { id: "logement", question: "Quel est votre type de logement ?" },
  { id: "revenus", question: "Dans quelle tranche situez-vous vos revenus mensuels du foyer ?" },
];

const PUBLIC_TYPES = [
  "Population générale", "Jeunes (18-30 ans)", "Seniors (60 ans et +)",
  "Agents territoriaux", "Étudiants", "Habitants d'un quartier prioritaire",
  "Personnes en situation de handicap", "Aidants familiaux", "Autre",
];

/* ── Composant ──────────────────────────────────────────────────── */
export default function CreateB2GCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", startDate: "", endDate: "",
    targetPopulation: "", publicType: "", publicTypeOther: "",
    territory: "", offer: "PREMIUM" as "PREMIUM" | "PREMIUM_PLUS",
  });
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [customVar, setCustomVar] = useState("");

  const update = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }));
  const toggleVar = (id: string) => setSelectedVars(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);

  const canProceedStep1 =
    form.title.trim() && form.startDate && form.endDate &&
    new Date(form.endDate) > new Date(form.startDate) && form.publicType;

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    try {
      const vars = VARIABLE_LIBRARY.filter(v => selectedVars.includes(v.id));
      if (customVar.trim()) vars.push({ id: `custom_${Date.now()}`, question: customVar.trim() });

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          startDate: form.startDate,
          endDate: form.endDate,
          targetPopulation: form.targetPopulation ? parseInt(form.targetPopulation) : null,
          territory: form.territory || null,
          offer: form.offer,
          status: "PLANIFIEE",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création");

      if (vars.length > 0) {
        await fetch(`/api/campaigns/${data.campaign.id}/variables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables: vars }),
        });
      }
      router.push(`/dashboard/b2g/campaigns/${data.campaign.id}`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setSaving(false);
    }
  };

  const cardStyle = { background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 32 };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        <PartnerPortalsNavigation />
        
        

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <Link href="/dashboard/b2g/campaigns" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 14, textDecoration: "none", marginBottom: 28 }}>
            <ArrowLeft size={15} /> Retour aux campagnes
          </Link>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text-1)", marginBottom: 6 }}>
              Nouvelle campagne B2G
            </h1>
            <p style={{ color: "var(--text-3)", fontSize: 14 }}>
              Déployez LINK OFFICE auprès d'une population et obtenez un baromètre relationnel agrégé et anonymisé.
            </p>
          </div>

          <Stepper currentStep={step} steps={[{ label: "Campagne" }, { label: "Variables" }, { label: "Offre" }]} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Calendar size={20} style={{ color: "var(--primary)" }} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Paramètres de la campagne</h2>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Nom de la campagne *</label>
                <input className="input-field" placeholder="Ex : Baromètre Lien Social – Quartier Bellevue 2026" value={form.title} onChange={e => update("title", e.target.value)} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Objectif / description</label>
                <textarea className="input-field" placeholder="Contexte et objectifs de cette campagne..." value={form.description} onChange={e => update("description", e.target.value)} style={{ minHeight: 72, resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Date de début *</label>
                  <input type="date" className="input-field" value={form.startDate} onChange={e => update("startDate", e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Date de fin *</label>
                  <input type="date" className="input-field" value={form.endDate} onChange={e => update("endDate", e.target.value)} />
                </div>
              </div>
              {form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate) && (
                <p style={{ color: "#f87171", fontSize: 12 }}>⚠ La date de fin doit être postérieure à la date de début.</p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Population cible (nombre)</label>
                  <input type="number" min="5" className="input-field" placeholder="Ex : 500" value={form.targetPopulation} onChange={e => update("targetPopulation", e.target.value)} />
                  <p style={{ fontSize: 11, color: "var(--text-2)", marginTop: 4 }}>Minimum 5 pour garantir l'anonymat</p>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>
                    <MapPin size={12} style={{ display: "inline", marginRight: 4 }} />
                    Territoire / Périmètre
                  </label>
                  <input className="input-field" placeholder="Ex : Quartier Bellevue, Lyon 3e" value={form.territory} onChange={e => update("territory", e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 10 }}>Type de public ciblé *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PUBLIC_TYPES.map(pt => (
                    <label key={pt} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                      borderRadius: 10, cursor: "pointer", fontSize: 13,
                      border: form.publicType === pt ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--surface-2)",
                      background: form.publicType === pt ? "rgba(124,58,237,0.08)" : "var(--surface-2)",
                      color: form.publicType === pt ? "#c4b5fd" : "var(--text-2)", transition: "all 0.15s",
                    }}>
                      <input type="radio" name="publicType" checked={form.publicType === pt} onChange={() => update("publicType", pt)} style={{ accentColor: "#7c3aed" }} />
                      {pt}
                    </label>
                  ))}
                </div>
                {form.publicType === "Autre" && (
                  <input className="input-field" style={{ marginTop: 10 }} placeholder="Précisez le type de public..." value={form.publicTypeOther} onChange={e => update("publicTypeOther", e.target.value)} />
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                  className="btn btn-primary btn-md">
                  Continuer <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Users size={20} style={{ color: "#06b6d4" }} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Variables complémentaires B2G</h2>
              </div>
              <p style={{ color: "var(--text-3)", fontSize: 13, lineHeight: 1.6 }}>
                Ces questions enrichissent le baromètre et le rapport sans jamais modifier les scores IQRH.
              </p>

              {VARIABLE_LIBRARY.map(v => {
                const active = selectedVars.includes(v.id);
                return (
                  <label key={v.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
                    borderRadius: 12, cursor: "pointer",
                    border: active ? "1px solid rgba(6,182,212,0.35)" : "1px solid var(--surface-2)",
                    background: active ? "rgba(6,182,212,0.06)" : "var(--surface-2)", transition: "all 0.15s",
                  }}>
                    <input type="checkbox" checked={active} onChange={() => toggleVar(v.id)} style={{ accentColor: "#06b6d4", marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: active ? "#67e8f9" : "var(--text-2)", lineHeight: 1.5 }}>{v.question}</span>
                  </label>
                );
              })}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>Ajouter une question spécifique (optionnel)</label>
                <input className="input-field" placeholder="Ex : Fréquentez-vous les équipements culturels de la commune ?" value={customVar} onChange={e => setCustomVar(e.target.value)} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(1)} className="btn btn-tertiary btn-md">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary btn-md">
                  Continuer <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Zap size={20} style={{ color: "var(--primary)" }} />
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Fonctionnalités du dispositif</h2>
              </div>

              {[
                {
                  id: "PREMIUM", icon: Zap, color: "var(--primary)", border: "#7c3aed", bg: "rgba(124,58,237,0.12)", title: "PREMIUM",
                  sub: "Parcours individuel + baromètre collectif anonymisé",
                  features: ["IQRH complet — 30 questions + adaptatif", "Restitution individuelle anonyme", "Baromètre B2G agrégé (5 dimensions)", "Météo collective et besoins dominants", "Plan d'action et recommandations institutionnelles", "Rapport de campagne"],
                },
                {
                  id: "PREMIUM_PLUS", icon: Crown, color: "var(--amber)", border: "#f59e0b", bg: "rgba(245,158,11,0.12)", title: "PREMIUM+",
                  sub: "Tout PREMIUM + Binôme Relationnel IRIS",
                  features: ["Tout ce qu'inclut PREMIUM", "Module Binôme Relationnel par IRIS", "Consentement explicite de chaque bénéficiaire", "Matching uniquement entre bénéficiaires de la même campagne", "Accompagnement IRIS du binôme", "L'institution ne voit jamais la composition des binômes"],
                },
              ].map(plan => (
                <OfferCard
                  key={plan.id}
                  plan={plan}
                  isSelected={form.offer === plan.id}
                  onSelect={(id) => update("offer", id)}
                />
              ))}

              {/* Récapitulatif */}
              <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--surface-2)", border: "1px solid var(--surface-2)" }}>
                <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Récapitulatif</p>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 13 }}>
                  {[
                    ["Campagne", form.title || "—"],
                    ["Public", form.publicType || "—"],
                    ["Territoire", form.territory || "Non précisé"],
                    ["Population cible", form.targetPopulation || "—"],
                    ["Période", form.startDate && form.endDate ? `${new Date(form.startDate).toLocaleDateString("fr-FR")} → ${new Date(form.endDate).toLocaleDateString("fr-FR")}` : "—"],
                    ["Variables B2G", `${selectedVars.length + (customVar.trim() ? 1 : 0)} activées`],
                  ].map(([k, v]) => (
                    <>
                      <span style={{ color: "var(--text-3)" }}>{k} :</span>
                      <span style={{ color: "var(--text-2)", fontWeight: 500 }}>{v}</span>
                    </>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
                  <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{error}</p>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(2)} className="btn btn-tertiary btn-md">
                  <ArrowLeft size={16} /> Retour
                </button>
                <button onClick={handleSubmit} disabled={saving} className="btn btn-primary btn-md">
                  {saving ? "Création en cours..." : <><CheckCircle2 size={17} /> Créer la campagne</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
