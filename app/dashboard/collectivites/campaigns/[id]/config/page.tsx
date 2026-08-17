"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Settings, Save, CheckCircle, ShieldAlert, ArrowLeft, Layers, Key } from "lucide-react";

export default function CampaignConfigPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);
  
  const [codeAccess, setCodeAccess] = useState("");
  const [hiddenDemographics, setHiddenDemographics] = useState<string[]>([]);
  const [allowedSituations, setAllowedSituations] = useState<string[]>([]);
  
  const [allSituations, setAllSituations] = useState<string[]>([]);

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
      if (res.ok) {
        alert("Configuration sauvegardée avec succès.");
      } else {
        alert("Erreur lors de la sauvegarde.");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau.");
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
