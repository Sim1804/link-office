"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Plus, Settings, Users, ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        if (data.campaigns) setCampaigns(data.campaigns);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        {/* Effets Glass */}
        <div style={{ position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "fixed", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
          <button onClick={() => router.push('/dashboard/collectivites')} style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour à l'Observatoire
          </button>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", margin: 0 }}>
                Mes Campagnes
              </h1>
              <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                Gérez vos campagnes d'évaluation B2G en cours ou passées.
              </p>
            </div>
            <button 
              onClick={() => router.push('/dashboard/collectivites/campaigns/create')}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", color: "white", padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}
            >
              <Plus size={16} />
              Nouvelle Campagne
            </button>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: "#94a3b8" }}>
              Chargement des campagnes...
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 48, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "rgba(124,58,237,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto" }}>
                <Users size={24} color="#a78bfa" />
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: "#f8fafc", marginBottom: 8 }}>Aucune campagne pour l'instant</h2>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, maxWidth: 400, margin: "0 auto 24px auto" }}>
                Vous n'avez pas encore créé de campagne B2G. Lancez votre première campagne pour récolter des données.
              </p>
              <button 
                onClick={() => router.push('/dashboard/collectivites/campaigns/create')}
                style={{ background: "#7c3aed", color: "white", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Créer ma première campagne
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {campaigns.map((camp) => (
                <div key={camp.id} style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", margin: 0 }}>{camp.title}</h3>
                    <span style={{ background: camp.status === "ACTIVE" ? "rgba(52,211,153,0.1)" : "rgba(148,163,184,0.1)", color: camp.status === "ACTIVE" ? "#34d399" : "#94a3b8", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {camp.status}
                    </span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>Période :</span>
                    <span style={{ color: "#e2e8f0" }}>{new Date(camp.startDate).toLocaleDateString()} - {new Date(camp.endDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                    <span>Population cible :</span>
                    <span style={{ color: "#e2e8f0" }}>{camp.targetPopulation || "Non définie"}</span>
                  </div>
                  <div style={{ color: "#64748b", fontSize: 13, marginBottom: 24, display: "flex", justifyContent: "space-between" }}>
                    <span>Répondants actuels :</span>
                    <span style={{ color: "#06b6d4", fontWeight: 600 }}>{camp._count?.assessments || 0}</span>
                  </div>
                  
                  <div style={{ marginTop: "auto", display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => router.push(`/dashboard/collectivites/campaigns/${camp.id}/config`)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", padding: "8px", borderRadius: 8, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <Settings size={14} /> Configuration
                    </button>
                    <button 
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4", padding: "8px 12px", borderRadius: 8, fontSize: 13, cursor: "not-allowed", opacity: 0.7 }}
                      title="Résultats détaillés (prochainement)"
                    >
                      Voir <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
