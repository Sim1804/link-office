"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Plus, Zap, Crown, Calendar, Info, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

const B2B_SITUATIONS_REMOVED = ["Entrepreneur","Retraite","Demandeur d'emploi","Création d'entreprise"];

const CAMPAIGN_VARIABLES_LIBRARY = [
  { id: "service",        question: "Quel est votre service ou direction ?",              options: ["Direction Générale","RH","Finance","Commercial","IT","Opérations","Marketing","Autre"] },
  { id: "site",           question: "Sur quel site ou établissement travaillez-vous ?",   options: [] },
  { id: "anciennete_org", question: "Depuis combien de temps êtes-vous dans l'organisation ?", options: ["Moins d'1 an","1 à 3 ans","3 à 5 ans","5 à 10 ans","Plus de 10 ans"] },
  { id: "anciennete_eq",  question: "Depuis combien de temps êtes-vous dans votre équipe actuelle ?", options: ["Moins d'1 an","1 à 3 ans","3 à 5 ans","Plus de 5 ans"] },
  { id: "mode_travail",   question: "Quel est votre mode de travail principal ?",          options: ["Présentiel uniquement","Hybride","Télétravail majoritaire","Itinérant"] },
  { id: "travail_seul",   question: "Travaillez-vous principalement seul ou en équipe ?", options: ["Principalement seul","Mix 50/50","Principalement en équipe"] },
  { id: "equipe_local",   question: "Votre équipe est-elle localisée ou dispersée ?",      options: ["Localisée sur un site","Dispersée sur plusieurs sites","Internationale"] },
  { id: "rythme",         question: "Comment décririez-vous votre rythme de travail ?",    options: ["Régulier et prévisible","Variable selon les périodes","Intense et soutenu","Très intense"] },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<1|2|3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    offer: "" as "PREMIUM" | "PREMIUM_PLUS" | "",
    startDate: "",
    endDate: "",
    targetPopulation: "",
    logoUrl: "",
  });
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [customVar, setCustomVar] = useState("");

  const toggleVar = (id: string) => {
    setSelectedVars(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm(f => ({ ...f, logoUrl: data.url }));
      } else {
        alert(data.error || "Erreur d'upload");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'upload");
    }
  };

  const handleSubmit = async () => {
    if (!form.offer) { setError("Veuillez choisir une offre."); return; }
    setSaving(true); setError(null);
    try {
      const vars = CAMPAIGN_VARIABLES_LIBRARY.filter(v => selectedVars.includes(v.id));
      if (customVar.trim()) vars.push({ id: "custom_" + Date.now(), question: customVar.trim(), options: [] });

      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description || null,
            offer: form.offer,
            startDate: form.startDate,
            endDate: form.endDate,
            targetPopulation: form.targetPopulation || null,
            logoUrl: form.logoUrl || null,
            status: "PLANIFIEE",
          }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur création");

      const campaignId = data.campaign.id;

      // Creer les variables complementaires si selectionnees
      if (vars.length > 0) {
        for (const v of vars) {
          await fetch(`/api/campaigns/${campaignId}/config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionnaireConfig: { hiddenDemographics: [], allowedSituations: null },
              variable: { id: v.id, question: v.question, options: v.options, required: false },
            }),
          });
        }
      }

      router.push(`/dashboard/rh/campaigns/${campaignId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <Link href="/dashboard/rh/campaigns" style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
              <ArrowLeft size={15} /> Mes campagnes
            </Link>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans',Inter,sans-serif", fontWeight: 800, fontSize: 26, color: "#f8fafc" }}>
              Nouvelle campagne IQRH
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              Etape {step}/3 — {step === 1 ? "Choix de l'offre" : step === 2 ? "Parametres" : "Variables complementaires"}
            </p>
          </div>

          {/* Progress steps */}
          <div style={{ display: "flex", gap: 0, marginBottom: 36 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ flex: 1, display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  background: step >= s ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(255,255,255,0.06)",
                  color: step >= s ? "white" : "#475569",
                  boxShadow: step === s ? "0 0 16px rgba(124,58,237,0.4)" : "none",
                }}>{s}</div>
                {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.06)" }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Choix offre */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 12, padding: "14px 18px" }}>
                <Info size={14} style={{ display: "inline", marginRight: 6, color: "#a78bfa" }} />
                En B2B, l'offre choisie s'applique automatiquement à tous les bénéficiaires de la campagne. Il n'y a pas de formule Freemium.
              </p>

              {[
                { id: "PREMIUM", icon: Zap, color: "#a78bfa", border: "#7c3aed", bg: "rgba(124,58,237,0.12)",
                  title: "PREMIUM", sub: "Parcours individuel Premium complet",
                  features: ["IQRH complet — 30 questions + adaptatif","Ordonnance relationnelle personnalisee","5 recommandations du catalogue","Dashboard anonymisé et agrégé","Plan d action et recommandations collectives","Rapport de campagne"] },
                { id: "PREMIUM_PLUS", icon: Crown, color: "#fbbf24", border: "#f59e0b", bg: "rgba(245,158,11,0.12)",
                  title: "PREMIUM+", sub: "Toutes les fonctionnalites Premium + Binome Relationnel",
                  features: ["Tout ce qu'inclut PREMIUM","Module Binôme Relationnel IRIS","Matching par IA entre bénéficiaires consentants","Défis communs et suivi de binôme"] },
              ].map(plan => {
                const isSelected = form.offer === plan.id;
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setForm(f => ({ ...f, offer: plan.id as any }))}
                    className="card"
                    style={{
                      cursor: "pointer", transition: "all 0.25s",
                      background: isSelected ? plan.bg : "rgba(17,24,39,0.65)",
                      borderColor: isSelected ? `${plan.border}80` : "rgba(255,255,255,0.08)",
                      outline: isSelected ? `2px solid ${plan.border}60` : "none",
                      outlineOffset: 2,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${plan.color}20`, border: `1px solid ${plan.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={22} style={{ color: plan.color }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc" }}>{plan.title}</h3>
                          <span style={{ fontSize: 12, color: plan.color, fontWeight: 600 }}>{plan.sub}</span>
                          {isSelected && (
                            <div style={{ marginLeft: "auto", width: 22, height: 22, borderRadius: "50%", background: plan.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "#0b0f19", fontSize: 12, fontWeight: 900 }}>✓</span>
                            </div>
                          )}
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                          {plan.features.map((f, i) => (
                            <li key={i} style={{ fontSize: 13, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: plan.color, fontSize: 10 }}>●</span> {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => { if (!form.offer) { setError("Choisissez une offre."); return; } setError(null); setStep(2); }}
                className="btn btn-primary btn-lg"
                style={{ alignSelf: "flex-end" }}
              >
                Continuer <ChevronRight size={16} />
              </button>
              {error && <p style={{ color: "#f43f5e", fontSize: 13 }}>{error}</p>}
            </div>
          )}

          {/* STEP 2 — Paramètres */}
          {step === 2 && (
            <div className="card">
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc", marginBottom: 24 }}>Paramètres de la campagne</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Nom de la campagne *</label>
                  <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Baromètre RH 2024 — Site Paris" className="input-field" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Description (optionnelle)</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Contexte, objectifs de cette campagne..." className="input-field" style={{ minHeight: 80, resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Date de début *</label>
                    <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Date de fin *</label>
                    <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Population cible (nombre de bénéficiaires)</label>
                  <input type="number" min="1" value={form.targetPopulation} onChange={e => setForm(f => ({ ...f, targetPopulation: e.target.value }))} placeholder="Ex: 200" className="input-field" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Logo spécifique de la campagne (Optionnel)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      className="input-field" 
                      style={{ flex: 1 }} 
                    />
                    {form.logoUrl && (
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: "hidden", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #334155" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.logoUrl} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>S'il n'y a pas de logo, le logo par défaut de l'organisation sera utilisé.</p>
                </div>
              </div>
              {error && <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, color: "#f43f5e", fontSize: 13 }}><AlertCircle size={14} />{error}</div>}
              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary btn-md"><ArrowLeft size={14} /> Retour</button>
                <button
                  onClick={() => {
                    if (!form.title || !form.startDate || !form.endDate) { setError("Remplissez tous les champs obligatoires."); return; }
                    if (new Date(form.endDate) <= new Date(form.startDate)) { setError("La date de fin doit être après la date de début."); return; }
                    setError(null); setStep(3);
                  }}
                  className="btn btn-primary btn-md"
                  style={{ marginLeft: "auto" }}
                >
                  Variables complémentaires <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Variables */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="card">
                <h2 style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Variables complémentaires</h2>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                  Ces questions seront posées aux bénéficiaires après le questionnaire IQRH. Elles enrichissent l'analyse collective (dashboard, plan d'action) mais ne modifient pas les scores IQRH, IER ou ICR.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CAMPAIGN_VARIABLES_LIBRARY.map(v => (
                    <label key={v.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", padding: "12px 14px", borderRadius: 12, border: `1px solid ${selectedVars.includes(v.id) ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`, background: selectedVars.includes(v.id) ? "rgba(124,58,237,0.08)" : "transparent", transition: "all 0.2s" }}>
                      <input type="checkbox" checked={selectedVars.includes(v.id)} onChange={() => toggleVar(v.id)} style={{ marginTop: 2, accentColor: "#7c3aed" }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", margin: 0 }}>{v.question}</p>
                        {v.options.length > 0 && <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Options: {v.options.slice(0,3).join(", ")}{v.options.length > 3 ? `... (+${v.options.length-3})` : ""}</p>}
                      </div>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Question personnalisée (optionnelle)</label>
                  <input type="text" value={customVar} onChange={e => setCustomVar(e.target.value)} placeholder="Ex: Participez-vous à des projets transverses ?" className="input-field" />
                </div>
              </div>

              {error && <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#f43f5e", fontSize: 13 }}><AlertCircle size={14} />{error}</div>}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary btn-md"><ArrowLeft size={14} /> Retour</button>
                <button onClick={handleSubmit} disabled={saving} className="btn btn-primary btn-lg" style={{ marginLeft: "auto" }}>
                  {saving ? "Création en cours..." : <><Plus size={16} /> Créer la campagne</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}