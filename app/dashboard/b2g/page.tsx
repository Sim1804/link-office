"use client";

import { useState, useEffect } from "react";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { Select } from "@/components/ui/Select";
import { 
  MapPin, Users, TrendingUp, Lightbulb, ShieldAlert, Activity, Heart, Briefcase, Target, Map
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip
} from "recharts";
import {
  buildRadarData,
  buildWeatherData
} from "@/lib/constants/dashboard";

interface PolicyRecommendation {
  constat: string; indicateur: string; action: string; icon: string;
}
interface CollectiviteData {
  anonymityBlocked?: boolean;
  respondentCount: number;
  threshold: number;
  averages?: { global: number; social: number; affective: number; sentimental: number; professional: number; self: number };
  weatherDistribution?: Record<string, number>;
  topProfiles?: Array<{ profile: string; count: number; pct: number }>;
  recommendations?: PolicyRecommendation[];
  cartography?: Array<{ label: string; question: string; respondentCount: number; avgScore: number }>;
  demographics?: { retireeCount: number; youngCount: number; aidantCount: number };
  campaignsList?: Array<{ id: string; title: string; status: string }>;
}

export default function B2GDashboard() {
  const [data, setData] = useState<CollectiviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"generale" | "carto" | "politiques">("generale");
  const [addingActionId, setAddingActionId] = useState<number | null>(null);
  const [addedActionIds, setAddedActionIds] = useState<number[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const handleAddToActionPlan = async (rec: any, index: number) => {
    setAddingActionId(index);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.action,
          description: rec.constat + " - " + rec.indicateur,
          status: "PROPOSEE",
          priority: "MEDIUM",
        })
      });
      if (res.ok) {
        setAddedActionIds(prev => [...prev, index]);
      }
    } finally {
      setAddingActionId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch("/api/b2g/stats" + (selectedCampaignId ? `?campaignId=${selectedCampaignId}` : ""))
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [selectedCampaignId]);

  const radarData = buildRadarData(data?.averages as Record<string, number> ?? {});
  const weatherData = data?.weatherDistribution ? buildWeatherData(data.weatherDistribution, true) : [];

  const dims = [
    { name: "Social", score: data?.averages?.social || 0 },
    { name: "Affectif", score: data?.averages?.affective || 0 },
    { name: "Sentimental", score: data?.averages?.sentimental || 0 },
    { name: "Pro", score: data?.averages?.professional || 0 },
    { name: "Soi", score: data?.averages?.self || 0 }
  ];
  const sortedDims = [...dims].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const flopDim = sortedDims[sortedDims.length - 1];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PartnerPortalsNavigation />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1, paddingBottom: 64 }}>

          {/* ── HEADER ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-family-display)", display: "flex", alignItems: "center", gap: 12 }}>
                <MapPin color="#4DBDB2" size={36} /> 
                Observatoire Territorial (B2G)
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 16, margin: 0 }}>
                Données territoriales agrégées pour l'élaboration de politiques publiques sociales.
              </p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", background: "var(--surface)", padding: 12, borderRadius: 16, border: "1px solid var(--border)" }}>
                {data?.campaignsList && data.campaignsList.length > 0 && (
                  <Select 
                    value={selectedCampaignId}
                    onChange={setSelectedCampaignId}
                    placeholder="Toutes les campagnes"
                    options={[
                      { value: "", label: "Toutes les campagnes" },
                      ...data.campaignsList.map((c: any) => ({ value: c.id, label: c.title }))
                    ]}
                    style={{ width: 200 }}
                  />
                )}
                <Link href="/dashboard/b2g/campaigns" className="btn btn-tertiary btn-sm">
                  Gérer les campagnes
                </Link>
                <Link href="/dashboard/b2g/actions" className="btn btn-primary btn-sm">
                  Plan d'action
                </Link>
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <DashboardTabs
            tabs={[
              { key: "generale", label: "Vue Générale", icon: Activity },
              { key: "carto", label: "Cartographie & Profils", icon: Map },
              { key: "politiques", label: "Politiques Publiques", icon: Lightbulb },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as any)}
          />

          {loading ? (
            <DashboardSkeleton />
          ) : data?.anonymityBlocked ? (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Données insuffisantes
              </h2>
              <p style={{ color: "var(--text-3)", maxWidth: 500, margin: "0 auto 20px", lineHeight: 1.6 }}>
                Au moins {data.threshold} citoyens doivent avoir complété leur évaluation pour que l'observatoire affiche des données ({data.respondentCount} actuellement).
              </p>
              <Link href="/dashboard/b2g/campaigns" className="btn btn-primary btn-md">
                Gérer mes campagnes
              </Link>
            </div>
          ) : data && data.averages ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeSlideIn 0.4s ease-out" }}>
              
              {/* ── ROW 1: KPIs Principaux ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                {/* Score */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, background: "linear-gradient(135deg, var(--surface) 0%, rgba(77,189,178,0.05) 100%)", border: "1px solid rgba(77,189,178,0.2)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(77,189,178,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={32} color="#4DBDB2" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>IQRH Moyen</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{data.averages.global}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={32} color="#6366f1" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Citoyens Évalués</p>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                      {data.respondentCount}
                    </div>
                  </div>
                </div>

                {/* Aidants */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Heart size={32} color="#f43f5e" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Profils Aidants</p>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#f43f5e", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                      {data.demographics?.aidantCount || 0}
                    </div>
                  </div>
                </div>

                {/* Seniors */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Target size={32} color="#f59e0b" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Seniors / Retraités</p>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "#f59e0b", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                      {data.demographics?.retireeCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CONTENU PAR ONGLET ── */}
              
              {/* TAB 1 : Vue Générale */}
              {activeTab === "generale" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Radar */}
                  <div className="card" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Activity size={20} color="var(--primary)" /> Radar Territorial
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }} />
                          <Radar name="Score" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Weather */}
                  {weatherData.length > 0 && (
                    <div className="card" style={{ padding: 32 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>Distribution Météo Relationnelle</h3>
                      <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weatherData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                            <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "var(--text-2)" }} width={120} />
                            <Tooltip 
                              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} 
                              formatter={(value: number) => [`${value} citoyen(s)`, "Quantité"]}
                            />
                            <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2 : Cartographie & Profils */}
              {activeTab === "carto" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                  {/* Top profils */}
                  {(data.topProfiles ?? []).length > 0 && (
                    <div className="card" style={{ padding: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                        <ShieldAlert size={20} style={{ color: "var(--primary)" }} />
                        <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>Profils Relationnels Dominants</h3>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        {(data.topProfiles ?? []).map((p, i) => (
                          <div key={i} style={{ background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600 }}>{p.profile}</span>
                            <span className="badge badge-violet" style={{ fontSize: 13 }}>{p.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cartographie Relationnelle */}
                  {(data.cartography ?? []).length > 0 && (
                    <div className="card" style={{ padding: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <MapPin size={20} style={{ color: "var(--primary)" }} />
                        <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>
                          Cartographie Relationnelle (Segmentation)
                        </h3>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {(data.cartography ?? []).map((carto, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                            <div>
                              <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{carto.label}</p>
                              <p style={{ color: "var(--text-3)", fontSize: 13 }}>{carto.question}</p>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ color: "var(--text-3)", fontSize: 12, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Répondants</p>
                                <p style={{ color: "var(--text-1)", fontWeight: 800, fontSize: 16 }}>{carto.respondentCount}</p>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <p style={{ color: "var(--text-3)", fontSize: 12, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Score IQRH moyen</p>
                                <p style={{ color: "var(--primary)", fontWeight: 800, fontSize: 20 }}>{carto.avgScore}/100</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 24, display: "flex", alignItems: "center", gap: 8 }}>
                        <ShieldAlert size={14} /> Seuls les segments ayant atteint le seuil d'anonymat de {data.threshold} citoyens sont affichés.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3 : Politiques Publiques */}
              {activeTab === "politiques" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
                  {/* Recommandations de politiques publiques */}
                  {(data.recommendations ?? []).length > 0 && (
                    <div className="card" style={{ padding: 32 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                        <Lightbulb size={20} style={{ color: "#f59e0b" }} />
                        <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>
                          Recommandations de Politiques Publiques
                        </h3>
                        <span className="badge badge-amber" style={{ marginLeft: "auto", fontSize: 13 }}>
                          Généré automatiquement par l'IA
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {(data.recommendations ?? []).map((rec, i) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, padding: 20, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
                            <div style={{ fontSize: 32, textAlign: "center", paddingTop: 4 }}>{rec.icon}</div>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                <p style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 16, margin: 0 }}>{rec.constat}</p>
                                <span className="badge badge-amber" style={{ fontSize: 11 }}>Constat</span>
                              </div>
                              <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                <TrendingUp size={14} />
                                {rec.indicateur}
                              </p>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                                <p style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600, margin: 0, padding: "10px 14px", background: "rgba(0,169,157,0.1)", borderRadius: 8, display: "inline-block" }}>
                                  → {rec.action}
                                </p>
                                <button 
                                  onClick={() => handleAddToActionPlan(rec, i)}
                                  disabled={addingActionId === i || addedActionIds.includes(i)}
                                  className={addedActionIds.includes(i) ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                                  style={{ whiteSpace: "nowrap", ...(addedActionIds.includes(i) ? { background: "rgba(124,58,237,0.1)", color: "var(--primary)", border: "1px solid rgba(124,58,237,0.3)" } : {}) }}
                                >
                                  {addingActionId === i ? "Ajout..." : addedActionIds.includes(i) ? "✓ Ajoutée" : "Ajouter au plan"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {(data.recommendations ?? []).length === 0 && (
                    <div className="card" style={{ padding: 32, textAlign: "center" }}>
                      <p style={{ color: "var(--text-3)" }}>Aucune recommandation générée pour le moment.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}

        </div>
      </main>
    </>
  );
}
