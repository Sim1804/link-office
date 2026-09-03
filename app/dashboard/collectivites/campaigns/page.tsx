"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Plus, Settings, Users, ArrowRight, ArrowLeft, Copy, Archive, AlertCircle, X, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:     { label: "Active",      color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  PLANIFIEE:  { label: "Planifiée",   color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  EN_CLOTURE: { label: "En clôture", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  CLOSED:     { label: "Clôturée",   color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  RENOUVELEE: { label: "Renouvellée",color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  DRAFT:      { label: "Brouillon",  color: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export default function CampaignsListPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/campaigns")
      .then(res => res.json())
      .then(data => {
        if (data.campaigns) setCampaigns(data.campaigns);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleClose = async (id: string) => {
    // Protection anti double-clic : on demande confirmation via un état
    setClosingId(id);
  };

  const confirmClose = async (id: string) => {
    setCloseError(null);
    setClosingId(null);
    try {
      const res = await fetch(`/api/campaigns/${id}/close`, { method: "POST" });
      if (res.ok) {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "CLOSED" } : c));
      } else {
        setCloseError("Erreur lors de la clôture de la campagne.");
      }
    } catch {
      setCloseError("Erreur réseau. Vérifiez votre connexion et réessayez.");
    }
  };

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

          {/* Erreur clôture */}
          {closeError && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              marginBottom: 20, borderRadius: 10,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            }}>
              <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
              <p style={{ color: "#f87171", fontSize: 13, margin: 0, flex: 1 }}>{closeError}</p>
              <button onClick={() => setCloseError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Modal de confirmation clôture */}
          {closingId && (
            <div style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)", zIndex: 50,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                background: "rgba(15,23,42,0.97)", border: "1px solid rgba(244,63,94,0.25)",
                borderRadius: 20, padding: 32, maxWidth: 420, width: "90%",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Archive size={20} style={{ color: "#fb7185" }} />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Clôturer la campagne ?</h3>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                  Un rapport final sera généré et la campagne sera archivée. Cette action est irréversible.
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setClosingId(null)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#94a3b8", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => confirmClose(closingId)}
                    style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "rgba(244,63,94,0.85)", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Confirmer la clôture
                  </button>
                </div>
              </div>
            </div>
          )}

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
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {campaigns.map((camp) => {
                const completed = camp._count?.assessments ?? 0;
                const target = camp.targetPopulation;
                const completionPct = target ? Math.min(100, Math.round((completed / target) * 100)) : null;
                const s = STATUS_LABELS[camp.status] ?? STATUS_LABELS.DRAFT;
                return (
                  <div key={camp.id} style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 0 }}>
                    {/* Header card */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", margin: "0 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{camp.title}</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ background: s.bg, color: s.color, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                          {camp.territory && <span style={{ fontSize: 12, color: "#64748b" }}>📍 {camp.territory}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Infos */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13, marginBottom: 14 }}>
                      <span style={{ color: "#64748b" }}>Période</span>
                      <span style={{ color: "#e2e8f0", textAlign: "right" }}>{new Date(camp.startDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })} → {new Date(camp.endDate).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</span>
                      <span style={{ color: "#64748b" }}>Répondants</span>
                      <span style={{ color: "#06b6d4", fontWeight: 700, textAlign: "right" }}>{completed}</span>
                    </div>

                    {/* Barre de progression objectif */}
                    {target && (
                      <div style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                          <span style={{ color: "#64748b" }}>Atteinte de l'objectif</span>
                          <span style={{ color: completionPct! >= 80 ? "#34d399" : completionPct! >= 50 ? "#fbbf24" : "#94a3b8", fontWeight: 600 }}>{completed} / {target} ({completionPct}%)</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${completionPct}%`, background: completionPct! >= 80 ? "linear-gradient(90deg, #34d399, #06b6d4)" : completionPct! >= 50 ? "#fbbf24" : "#94a3b8", borderRadius: 999, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {/* Tableau de bord — CTA principal */}
                      <button
                        onClick={() => router.push(`/dashboard/collectivites/campaigns/${camp.id}`)}
                        style={{ flex: "1 1 100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.12))", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                      >
                        <BarChart2 size={14} /> Tableau de bord
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/collectivites/campaigns/${camp.id}/config`)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
                      >
                        <Settings size={13} /> Configurer
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/collectivites/campaigns/${camp.id}/renew`)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", color: "#a78bfa", padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
                      >
                        <Copy size={13} /> Dupliquer
                      </button>
                      {(camp.status === "ACTIVE" || camp.status === "PLANIFIEE") && (
                        <button
                          onClick={() => handleClose(camp.id)}
                          style={{ flex: "1 1 100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(244,63,94,0.07)", border: "1px solid rgba(244,63,94,0.15)", color: "#fb7185", padding: "8px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}
                        >
                          <Archive size={13} /> Clôturer la campagne
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
