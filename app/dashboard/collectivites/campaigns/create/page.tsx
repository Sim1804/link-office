"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Plus, ArrowLeft, Calendar, Users, Briefcase, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [targetPopulation, setTargetPopulation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, startDate, endDate, targetPopulation
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Rediriger vers la page de config de la nouvelle campagne
        router.push(`/dashboard/collectivites/campaigns/${data.campaign.id}/config`);
      } else {
        setError(data.error || "Une erreur s'est produite");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        {/* Effets Glass */}
        <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour
          </button>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", margin: 0 }}>
              Créer une nouvelle campagne
            </h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              Définissez les paramètres de base de votre nouvelle évaluation. Vous pourrez ensuite personnaliser le questionnaire.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 8, fontWeight: 500 }}>
                Titre de la campagne *
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: 14, left: 14, color: "#64748b" }}><Briefcase size={16} /></div>
                <input
                  type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Qualité de vie au travail 2026"
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px 12px 40px", color: "#f8fafc", outline: "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 8, fontWeight: 500 }}>
                  Date de début *
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, left: 14, color: "#64748b" }}><Calendar size={16} /></div>
                  <input
                    type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px 12px 40px", color: "#f8fafc", outline: "none", colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 8, fontWeight: 500 }}>
                  Date de fin *
                </label>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", top: 14, left: 14, color: "#64748b" }}><Calendar size={16} /></div>
                  <input
                    type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                    style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px 12px 40px", color: "#f8fafc", outline: "none", colorScheme: "dark" }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 8, fontWeight: 500 }}>
                Population cible estimée (Optionnel)
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: 14, left: 14, color: "#64748b" }}><Users size={16} /></div>
                <input
                  type="number" min={1} value={targetPopulation} onChange={e => setTargetPopulation(e.target.value)}
                  placeholder="Ex: 500"
                  style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px 12px 40px", color: "#f8fafc", outline: "none" }}
                />
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>Permet de mesurer le taux de participation à la fin de la campagne.</p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#f43f5e", fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", color: "white",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)", opacity: loading ? 0.7 : 1, transition: "all 0.2s"
              }}
            >
              {loading ? "Création en cours..." : <>Créer la campagne <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
