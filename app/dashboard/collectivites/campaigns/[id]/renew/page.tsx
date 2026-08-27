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
    setLoading(true);
    try {
      const res = await fetch(`/api/campaigns/${id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        router.push("/dashboard/collectivites/campaigns");
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Erreur de renouvellement");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
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
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#7c3aed", color: "white", padding: "12px", borderRadius: 10, fontSize: 15, fontWeight: 600, border: "none", cursor: loading ? "not-allowed" : "pointer" }}
            >
              <Save size={18} /> {loading ? "Création..." : "Dupliquer la campagne"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
