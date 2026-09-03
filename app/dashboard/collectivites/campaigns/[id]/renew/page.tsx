"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Save } from "lucide-react";
import { use } from "react";

export default function RenewCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);
  const [parent, setParent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    offer: "PREMIUM"
  });

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.campaign) {
          setParent(data.campaign);
          setFormData({
            title: `${data.campaign.title} (Renouvellement)`,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            offer: data.campaign.offer
          });
        }
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRenewError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/dashboard/collectivites/campaigns");
        router.refresh();
      } else {
        const error = await res.json();
        setRenewError(error.error || "Erreur lors du renouvellement de la campagne.");
      }
    } catch {
      setRenewError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (!parent) return null;

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ minHeight: "100vh", paddingTop: 88, paddingBottom: 64 }}>
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container-wide" style={{ maxWidth: 800 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour
          </button>
          
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Renouveler : {parent.title}</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 32 }}>
            Une nouvelle campagne sera créée avec la même configuration de questionnaire.
            L'historique de l'ancienne campagne sera conservé.
          </p>

          <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 8 }}>Nom de la nouvelle campagne</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="input-field" 
                required 
              />
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 8 }}>Date de début</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="input-field" 
                  required 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 14, color: "#cbd5e1", marginBottom: 8 }}>Date de fin</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="input-field" 
                  required 
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Save size={18} /> {loading ? "Création en cours..." : "Dupliquer la campagne"}
            </button>

            {renewError && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "12px 16px", borderRadius: 10,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{renewError}</p>
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
