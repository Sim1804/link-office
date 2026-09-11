"use client";

import { useState, useEffect } from "react";
import { BrainCircuit, Save, Sliders, Target, AlertTriangle } from "lucide-react";

export default function MatchingConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/matching/config")
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/matching/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSuccessMsg("Configuration sauvegardée avec succès !");
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      setErrorMsg("Erreur réseau. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "#64748b", textAlign: "center" }}>Chargement...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "linear-gradient(135deg, rgba(17,24,39,0.95), rgba(30,27,75,0.6))",
        padding: "24px 32px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)"
      }}>
        <div>
          <h1 style={{ color: "#f8fafc", fontSize: 24, fontWeight: 800, margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: 10 }}>
            <BrainCircuit color="#a78bfa" />
            Paramètres du Matching IRIS
          </h1>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: 14 }}>
            Définissez les règles globales, les seuils et les poids de l'algorithme du Binôme Relationnel.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", border: "none", padding: "12px 24px", borderRadius: 12,
            fontWeight: 600, cursor: saving ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "all 0.2s"
          }}
        >
          <Save size={18} /> {saving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </div>

      {successMsg && (
        <div style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", padding: "12px 24px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Card: Critères d'éligibilité */}
        <div className="card" style={{ background: "rgba(17,24,39,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Target size={18} color="#38bdf8" />
            Seuils & Éligibilité
          </h3>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Seuil de compatibilité minimum (%)
            </label>
            <input
              type="number"
              min="0" max="100"
              value={config.minimumThreshold}
              onChange={(e) => setConfig({ ...config, minimumThreshold: Number(e.target.value) })}
              style={{
                width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc", padding: "10px 14px", borderRadius: 10
              }}
            />
            <p style={{ color: "#64748b", fontSize: 11, marginTop: 6 }}>
              Score minimal requis pour proposer un binôme. En dessous, IRIS considérera qu'aucun partenaire n'est disponible.
            </p>
          </div>
        </div>

        {/* Card: Poids des dimensions */}
        <div className="card" style={{ background: "rgba(17,24,39,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h3 style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={18} color="#f59e0b" />
            Poids Algorithmiques
          </h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Poids de la Synergie (Complémentarité Fort/Faible)
            </label>
            <input
              type="range"
              min="0" max="100"
              value={config.synergyWeight}
              onChange={(e) => setConfig({ ...config, synergyWeight: Number(e.target.value) })}
              style={{ width: "100%", accentColor: "#f59e0b" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#f8fafc", fontSize: 12, marginTop: 6 }}>
              <span>Ignoré (0%)</span>
              <span style={{ fontWeight: 700, color: "#f59e0b" }}>{config.synergyWeight}%</span>
              <span>Prioritaire (100%)</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Poids de la Similarité (Profils miroirs)
            </label>
            <input
              type="range"
              min="0" max="100"
              value={config.similarityWeight}
              onChange={(e) => setConfig({ ...config, similarityWeight: Number(e.target.value) })}
              style={{ width: "100%", accentColor: "#38bdf8" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#f8fafc", fontSize: 12, marginTop: 6 }}>
              <span>Ignoré (0%)</span>
              <span style={{ fontWeight: 700, color: "#38bdf8" }}>{config.similarityWeight}%</span>
              <span>Prioritaire (100%)</span>
            </div>
          </div>
          
          <div style={{ background: "rgba(245,158,11,0.1)", padding: "12px", borderRadius: 8, display: "flex", gap: 8, alignItems: "flex-start", marginTop: 24 }}>
            <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: "#f59e0b", fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              La somme des poids devrait idéalement être proche de 100%. IRIS normalisera automatiquement ces valeurs lors de la comparaison des profils.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
