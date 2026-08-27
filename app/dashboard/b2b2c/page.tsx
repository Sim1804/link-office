"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import {
  Users, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, AlertTriangle,
  BarChart3, RefreshCw, Crown, Zap, Activity, HeartPulse, AlertCircle, LineChart
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, PieChart, Pie, Legend
} from "recharts";
import Link from "next/link";

interface B2BStats {
  anonymityBlocked?: boolean;
  respondentCount: number;
  registeredUsersCount?: number;
  threshold: number;
  message?: string;
  subscriptionStatus?: string;
  isSnapshot?: boolean;
  campaignsList?: { id: string; title: string; status: string }[];
  averages?: {
    global: number; social: number; affective: number;
    sentimental: number; professional: number; self: number;
  };
  icrDistribution?: { faible: number; modere: number; eleve: number; critique: number };
  topRiskFactors?: Array<{ label: string; count: number; pct: number }>;
  topProtectiveFactors?: Array<{ label: string; count: number; pct: number }>;
  topDominantNeeds?: Array<{ label: string; count: number; pct: number }>;
  weatherDistribution?: Record<string, number>;
  activationFunnel?: { eligible: number; activated: number; started: number; completed: number };
  orientationsCount?: { psychological: number; social: number; professional: number };
}

const DIMENSION_LABELS: Record<string, string> = {
  social: "Relations sociales",
  affective: "Relations affectives",
  sentimental: "Vie sentimentale",
  professional: "Vie pro & engagement",
  self: "Relation à soi",
};

const ICR_COLORS = ["#34d399", "#f59e0b", "#f97316", "#f43f5e"];
const WEATHER_ICONS: Record<string, string> = {
  "Grand soleil": "☀️", "Éclaircies": "⛅", "Ciel couvert": "☁️",
  "Orage": "🌩️", "Tempête": "⛈️",
};

export default function B2B2CDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<B2BStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [activeTab, setActiveTab] = useState<"barometre" | "risques">("barometre");

  useEffect(() => {
    setLoading(true);
    const url = selectedCampaignId ? `/api/b2b/stats?campaignId=${selectedCampaignId}` : "/api/b2b/stats";
    fetch(url)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [selectedCampaignId]);

  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor = globalScore >= 80 ? "#34d399" : globalScore >= 60 ? "#a78bfa" : globalScore >= 40 ? "#f59e0b" : "#f43f5e";

  const radarData = stats?.averages
    ? Object.entries(DIMENSION_LABELS).map(([key, label]) => ({
        dimension: label,
        score: (stats.averages as any)[key] ?? 0,
        fullMark: 100,
      }))
    : [];

  const icrData = stats?.icrDistribution
    ? [
        { name: "Faible", value: stats.icrDistribution.faible, color: ICR_COLORS[0] },
        { name: "Modéré", value: stats.icrDistribution.modere, color: ICR_COLORS[1] },
        { name: "Élevé", value: stats.icrDistribution.eleve, color: ICR_COLORS[2] },
        { name: "Critique", value: stats.icrDistribution.critique, color: ICR_COLORS[3] },
      ].filter((d) => d.value > 0)
    : [];

  const weatherData = stats?.weatherDistribution
    ? Object.entries(stats.weatherDistribution)
        .map(([label, count]) => ({ label: `${WEATHER_ICONS[label] || ""} ${label}`, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  const orientationsData = stats?.orientationsCount
    ? [
        { name: "Soutien Psychologique", count: stats.orientationsCount.psychological, color: "#a78bfa" },
        { name: "Lien Social & Isolement", count: stats.orientationsCount.social, color: "#38bdf8" },
        { name: "RPS & Soutien Pro", count: stats.orientationsCount.professional, color: "#fbbf24" },
      ]
    : [];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" style={{ background: "rgba(16,185,129,0.1)" }} />
        <div className="blob-cyan" style={{ background: "rgba(124,58,237,0.1)" }} />

        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: "rgba(16,185,129,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(16,185,129,0.2)" }}>
                <ShieldCheck style={{ width: 26, height: 26, color: "#34d399" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", marginBottom: 4 }}>
                  Vue d'ensemble Partenaire (B2B2C)
                </h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Données agrégées • Anonymat garanti
                  {stats && <> • {stats.respondentCount} bénéficiaire(s)</>}
                </p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard/b2b2c/campaigns" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Gérer mes campagnes
              </Link>
              <Link href="/dashboard/actions" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Recommandations (Plan)
              </Link>
              
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {stats?.campaignsList && stats.campaignsList.length > 0 && (
                  <select 
                    value={selectedCampaignId} 
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#f8fafc", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", height: 36 }}
                  >
                    <option value="">Toutes les campagnes</option>
                    {stats.campaignsList.map(c => (
                      <option key={c.id} value={c.id}>{c.title} {c.status === "CLOSED" ? "(Clôturée)" : ""}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => { setLoading(true); const url = selectedCampaignId ? `/api/b2b/stats?campaignId=${selectedCampaignId}` : "/api/b2b/stats"; fetch(url).then(r => r.json()).then(setStats).finally(() => setLoading(false)); }}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#94a3b8", fontSize: 13, cursor: "pointer", transition: "all 0.2s", height: 36 }}
                  className="hover-bg-glass"
                >
                  <RefreshCw size={14} /> Actualiser
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: 4, marginBottom: 28, background: "rgba(17,24,39,0.5)", padding: 4, borderRadius: 12, width: "fit-content" }}>
            {([
              { key: "barometre", label: "Tableau de bord IQRH", icon: BarChart3 },
              { key: "risques", label: "Risques & Leviers", icon: TrendingDown },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8, border: "none",
                  fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                  cursor: "pointer", transition: "all 0.2s",
                  background: activeTab === key ? "var(--primary)" : "transparent",
                  color: activeTab === key ? "white" : "#94a3b8",
                  boxShadow: activeTab === key ? "0 0 16px rgba(124,58,237,0.3)" : "none",
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {stats?.isSnapshot && (
                <div style={{ marginBottom: 24, padding: "12px 16px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
                  <AlertCircle size={18} color="#fbbf24" />
                  <p style={{ color: "#fbbf24", fontSize: 14 }}>
                    <strong>Campagne Clôturée :</strong> Ces données sont un snapshot historique figé (elles ne changeront plus).
                  </p>
                </div>
              )}

              {stats?.activationFunnel && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={16} color="#3b82f6" /> Suivi d'Activation (Anonymat préservé)
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                    <div className="card" style={{ background: "rgba(59,130,246,0.1)", borderColor: "rgba(59,130,246,0.2)" }}>
                      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Éligibles (Quota)</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#93c5fd" }}>{stats.activationFunnel.eligible}</p>
                    </div>
                    <div className="card">
                      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Inscrits (Comptes Créés)</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{stats.activationFunnel.activated}</p>
                      <div style={{ width: "100%", background: "rgba(255,255,255,0.1)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.eligible ? (stats.activationFunnel.activated / stats.activationFunnel.eligible) * 100 : 0}%`, background: "#3b82f6", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div className="card">
                      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Questionnaires Commencés</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{stats.activationFunnel.started}</p>
                      <div style={{ width: "100%", background: "rgba(255,255,255,0.1)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.activated ? (stats.activationFunnel.started / stats.activationFunnel.activated) * 100 : 0}%`, background: "#8b5cf6", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div className="card">
                      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Questionnaires Complétés</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{stats.activationFunnel.completed}</p>
                      <div style={{ width: "100%", background: "rgba(255,255,255,0.1)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.started ? (stats.activationFunnel.completed / stats.activationFunnel.started) * 100 : 0}%`, background: "#10b981", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats?.anonymityBlocked ? (
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                  <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données non disponibles — Anonymat protégé</h2>
                  <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>{stats.message}</p>
                </div>
              ) : stats?.averages ? (
                <>
                  {activeTab === "barometre" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      
                      {/* Top KPIs */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(124,58,237,0.05) 100%)", borderColor: "rgba(16,185,129,0.2)" }}>
                          <div style={{ background: "rgba(16,185,129,0.2)", padding: 12, borderRadius: 12 }}><Users size={24} color="#34d399" /></div>
                          <div>
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Bénéficiaires analysés</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: "#f8fafc", lineHeight: 1 }}>{stats.respondentCount}</p>
                          </div>
                        </div>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ background: "rgba(124,58,237,0.15)", padding: 12, borderRadius: 12 }}><HeartPulse size={24} color="#a78bfa" /></div>
                          <div>
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Score IQRH Global</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{globalScore}<span style={{ fontSize: 16, color: "#475569" }}>/100</span></p>
                          </div>
                        </div>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ background: "rgba(244,63,94,0.15)", padding: 12, borderRadius: 12 }}><AlertCircle size={24} color="#f43f5e" /></div>
                          <div>
                            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Bénéficiaires à Risque Élevé</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: "#f43f5e", lineHeight: 1 }}>{(stats.icrDistribution?.eleve || 0) + (stats.icrDistribution?.critique || 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Radar */}
                        <div className="card">
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                            <BarChart3 size={16} color="#34d399" /> Radar de Cohorte
                          </h3>
                          <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748b" }} />
                                <Radar dataKey="score" stroke="#34d399" fill="#34d399" fillOpacity={0.25} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Orientations Funnel */}
                        <div className="card">
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                            <LineChart size={16} color="#06b6d4" /> Entonnoir de Prévention (Orientations)
                          </h3>
                          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Besoins de prévention primaires détectés pour ré-orientation vers vos services de soins.</p>
                          <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={orientationsData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} width={160} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                  {orientationsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* ICR */}
                        <div className="card">
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Charge Relationnelle (Indice ICR)</h3>
                          {icrData.length > 0 ? (
                            <div style={{ height: 300 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {icrData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                                  <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          ) : <p style={{ color: "#475569", fontSize: 13 }}>Aucune donnée ICR.</p>}
                        </div>

                        {/* Météo */}
                        {weatherData.length > 0 ? (
                          <div className="card">
                            <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                            <div style={{ height: 300 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weatherData} layout="vertical">
                                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                                  <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} width={140} />
                                  <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                                  <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ) : (
                          <div className="card">
                            <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                            <p style={{ color: "#475569", fontSize: 13 }}>Aucune donnée Météo.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "risques" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                      <div className="card">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                          <TrendingDown size={18} style={{ color: "#f43f5e" }} />
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Top Facteurs de Risque</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(stats.topRiskFactors ?? []).slice(0, 8).map((f, i) => (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ color: "#94a3b8", fontSize: 13 }}>{f.label}</span>
                                <span style={{ color: "#f43f5e", fontSize: 12, fontWeight: 600 }}>{f.pct}%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${f.pct}%`, background: "#f43f5e" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                          <TrendingUp size={18} style={{ color: "#34d399" }} />
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Top Facteurs Protecteurs</h3>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {(stats.topProtectiveFactors ?? []).slice(0, 8).map((f, i) => (
                            <div key={i}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ color: "#94a3b8", fontSize: 13 }}>{f.label}</span>
                                <span style={{ color: "#34d399", fontSize: 12, fontWeight: 600 }}>{f.pct}%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${f.pct}%`, background: "#34d399" }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card" style={{ gridColumn: "span 2" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                          <Users size={18} style={{ color: "#a78bfa" }} />
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Besoins Dominants des Bénéficiaires</h3>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                          {(stats.topDominantNeeds ?? []).map((n, i) => (
                            <div key={i} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 500 }}>{n.label}</span>
                              <span className="badge badge-violet">{n.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
