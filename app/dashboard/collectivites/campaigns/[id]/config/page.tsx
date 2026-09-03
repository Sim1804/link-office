"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Settings, Save, CheckCircle, ShieldAlert, ArrowLeft, Layers, Key, Plus, Trash2 } from "lucide-react";

export default function CampaignConfigPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | "network-error" | null>(null);
  const [campaign, setCampaign] = useState<any>(null);
  
  const [codeAccess, setCodeAccess] = useState("");
  const [hiddenDemographics, setHiddenDemographics] = useState<string[]>([]);
  const [allowedSituations, setAllowedSituations] = useState<string[]>([]);
  
  const [allSituations, setAllSituations] = useState<string[]>([]);
  const [variables, setVariables] = useState<any[]>([]);

  const DEMOGRAPHICS_FIELDS = [
    { id: "sexe", label: "Genre" },
    { id: "age_range", label: "Tranche d'âge" },
    { id: "pays", label: "Pays" },
    { id: "departement", label: "Département" },
    { id: "situation_professionnelle", label: "Situation Professionnelle" },
    { id: "taille_organisation", label: "Taille de l'organisation" },
    { id: "situation_sentimentale", label: "Situation Sentimentale" },
    { id: "enfants", label: "Enfants (Oui/Non et Nombre)" },
    { id: "habitation", label: "Type d'habitation" },
  ];

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}/config`)
      .then(r => r.json())
      .then(data => {
        if (data.campaign) {
          setCampaign(data.campaign);
          setCodeAccess(data.campaign.codeAccess || "");
          
          const config = data.campaign.questionnaireConfig || {};
          setHiddenDemographics(config.hiddenDemographics || []);
          setAllowedSituations(config.allowedSituations || data.availableSituations);
          setAllSituations(data.availableSituations || []);
        }
      });
      
    fetch(`/api/campaigns/${params.id}/variables`)
      .then(r => r.json())
      .then(data => {
        if (data.variables) setVariables(data.variables);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const toggleDemographic = (id: string) => {
    setHiddenDemographics(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSituation = (sit: string) => {
    setAllowedSituations(prev => 
      prev.includes(sit) ? prev.filter(x => x !== sit) : [...prev, sit]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${params.id}/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeAccess,
          questionnaireConfig: {
            hiddenDemographics,
            allowedSituations
          }
        })
      });
      
      const resVar = await fetch(`/api/campaigns/${params.id}/variables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables })
      });

      if (res.ok && resVar.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus(null), 4000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error(err);
      setSaveStatus("network-error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#94a3b8" }}>Chargement de la configuration...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        {/* Effets Glass */}
        <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Settings size={24} color="#a78bfa" />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc", margin: 0 }}>
                  Configuration B2G
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                  Campagne : {campaign?.title}
                </p>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: saving ? "not-allowed" : "pointer", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
              {saving ? <div className="spinner" style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
              Sauvegarder
            </button>
          </div>

          {/* Feedback sauvegarde */}
          {saveStatus && (
            <div style={{
              padding: "12px 16px", borderRadius: 10, marginBottom: 16,
              display: "flex", alignItems: "center", gap: 10,
              background: saveStatus === "success" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
              border: `1px solid ${saveStatus === "success" ? "rgba(52,211,153,0.25)" : "rgba(239,68,68,0.25)"}`,
            }}>
              <span style={{ fontSize: 14 }}>{saveStatus === "success" ? "✅" : "⚠️"}</span>
              <p style={{ color: saveStatus === "success" ? "#34d399" : "#f87171", fontSize: 13, margin: 0 }}>
                {saveStatus === "success" && "Configuration sauvegardée avec succès."}
                {saveStatus === "error" && "Erreur lors de la sauvegarde. Vérifiez les champs et réessayez."}
                {saveStatus === "network-error" && "Erreur réseau. Vérifiez votre connexion et réessayez."}
              </p>
            </div>
          )}

          <div style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Key size={18} color="#06b6d4" /> Accès à la campagne
            </h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>Code d'accès spécifique (Optionnel)</label>
              <input
                type="text"
                value={codeAccess}
                onChange={e => setCodeAccess(e.target.value)}
                placeholder="Ex: CAMPAGNE-2026"
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px", color: "#f8fafc", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={18} color="#a78bfa" /> Profil Démographique (Contexte)
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
              Sélectionnez les champs que vous souhaitez masquer pour les bénéficiaires de cette campagne.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {DEMOGRAPHICS_FIELDS.map(field => {
                const isHidden = hiddenDemographics.includes(field.id);
                return (
                  <label key={field.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 10, cursor: "pointer", border: isHidden ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
                    <input
                      type="checkbox"
                      checked={isHidden}
                      onChange={() => toggleDemographic(field.id)}
                      style={{ accentColor: "#f43f5e", width: 16, height: 16 }}
                    />
                    <span style={{ color: isHidden ? "#f43f5e" : "#e2e8f0", fontSize: 14 }}>
                      Masquer "{field.label}"
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Layers size={18} color="#f59e0b" /> Variables Complémentaires (Ciblage)
              </h2>
              <button 
                onClick={() => setVariables([...variables, { question: "", options: [], required: true }])}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)", padding: "6px 12px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
              >
                <Plus size={14} /> Ajouter une variable
              </button>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
              Créez des questions personnalisées pour cette campagne (ex: "Quel est votre quartier ?"). Elles permettront de filtrer le baromètre relationnel par la suite.
            </p>
            
            {variables.length === 0 ? (
              <div style={{ background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 10, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                Aucune variable spécifique pour le moment.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {variables.map((v, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: 16, position: "relative" }}>
                    <button 
                      onClick={() => setVariables(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#f43f5e", cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{ marginBottom: 12, paddingRight: 32 }}>
                      <label style={{ display: "block", fontSize: 12, color: "#cbd5e1", marginBottom: 4 }}>Question (ex: Votre quartier ?)</label>
                      <input 
                        type="text" 
                        value={v.question}
                        onChange={e => {
                          const newV = [...variables];
                          newV[i].question = e.target.value;
                          setVariables(newV);
                        }}
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "white", outline: "none", fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#cbd5e1", marginBottom: 4 }}>Options (séparées par une virgule)</label>
                      <input 
                        type="text" 
                        value={v.options.join(", ")}
                        onChange={e => {
                          const newV = [...variables];
                          newV[i].options = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
                          setVariables(newV);
                        }}
                        placeholder="Ex: Centre-ville, Nord, Sud"
                        style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "white", outline: "none", fontSize: 13 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={18} color="#34d399" /> Situations à Fort Impact (Adaptatif)
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}>
              Désactivez les situations qui ne sont pas pertinentes pour le public visé par cette campagne (ex: masquer "Manager" pour une campagne "Étudiants").
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {allSituations.map(sit => {
                const isAllowed = allowedSituations.includes(sit);
                return (
                  <label key={sit} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: 10, cursor: "pointer", border: isAllowed ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
                    <input
                      type="checkbox"
                      checked={isAllowed}
                      onChange={() => toggleSituation(sit)}
                      style={{ accentColor: "#34d399", width: 16, height: 16 }}
                    />
                    <span style={{ color: isAllowed ? "#34d399" : "#64748b", fontSize: 14 }}>
                      {sit}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
