"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
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
import {
  DIMENSION_LABELS,
  buildIcrData,
  buildRadarData,
  buildWeatherData,
  scoreToColor,
  RECHARTS_TOOLTIP_STYLE,
} from "@/lib/constants/dashboard";

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

// Constantes DIMENSION_LABELS, ICR_COLORS, WEATHER_ICONS importées depuis @/lib/constants/dashboard

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

  const radarData = buildRadarData(stats?.averages as Record<string, number> ?? {});
  const icrData = stats?.icrDistribution ? buildIcrData(stats.icrDistribution) : [];
  const weatherData = stats?.weatherDistribution ? buildWeatherData(stats.weatherDistribution) : [];
  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor = scoreToColor(globalScore);

  const orientationsData = stats?.orientationsCount
    ? [
      { name: "Soutien Psychologique", count: stats.orientationsCount.psychological, color: "var(--primary)" },
      { name: "Lien Social & Isolement", count: stats.orientationsCount.social, color: "var(--primary)" },
      { name: "RPS & Soutien Pro", count: stats.orientationsCount.professional, color: "#fbbf24" },
    ]
    : [];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PartnerPortalsNavigation />
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck style={{ width: 26, height: 26, color: "white" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "var(--text-1)", marginBottom: 4 }}>
                  Vue d'ensemble Partenaire (B2B2C)
                </h1>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                  Données agrégées • Anonymat garanti
                  {stats && <> • {stats.respondentCount} bénéficiaire(s)</>}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/dashboard/b2b2c/campaigns" className="btn btn-tertiary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Gérer mes campagnes
              </Link>
              <Link href="/dashboard/actions" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Plan d'action
              </Link>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {stats?.campaignsList && stats.campaignsList.length > 0 && (
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text-1)", padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none", height: 36 }}
                  >
                    <option value="">Toutes les campagnes</option>
                    {stats.campaignsList.map(c => (
                      <option key={c.id} value={c.id}>{c.title} {c.status === "CLOSED" ? "(Clôturée)" : ""}</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => { setLoading(true); const url = selectedCampaignId ? `/api/b2b/stats?campaignId=${selectedCampaignId}` : "/api/b2b/stats"; fetch(url).then(r => r.json()).then(setStats).finally(() => setLoading(false)); }}
                  className="btn btn-tertiary btn-sm"
                >
                  <RefreshCw size={14} /> Actualiser
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <DashboardTabs
            tabs={[
              { key: "barometre", label: "Tableau de bord IQRH", icon: BarChart3 },
              { key: "risques", label: "Risques & Leviers", icon: TrendingDown },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as any)}
          />

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
                  <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                    <Activity size={16} color="#3b82f6" /> Suivi d'Activation (Anonymat préservé)
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                    <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderColor: "var(--border)" }}>
                      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Éligibles (Quota)</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{stats.activationFunnel.eligible}</p>
                    </div>
                    <div className="card">
                      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Inscrits (Comptes Créés)</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>{stats.activationFunnel.activated}</p>
                      <div style={{ width: "100%", background: "var(--bg)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.eligible ? (stats.activationFunnel.activated / stats.activationFunnel.eligible) * 100 : 0}%`, background: "var(--primary)", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div className="card">
                      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Questionnaires Commencés</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>{stats.activationFunnel.started}</p>
                      <div style={{ width: "100%", background: "var(--bg)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.activated ? (stats.activationFunnel.started / stats.activationFunnel.activated) * 100 : 0}%`, background: "var(--primary)", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                    <div className="card">
                      <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Questionnaires Complétés</p>
                      <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>{stats.activationFunnel.completed}</p>
                      <div style={{ width: "100%", background: "var(--bg)", height: 4, borderRadius: 2, marginTop: 8 }}>
                        <div style={{ width: `${stats.activationFunnel.started ? (stats.activationFunnel.completed / stats.activationFunnel.started) * 100 : 0}%`, background: "var(--emerald)", height: "100%", borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stats?.anonymityBlocked ? (
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                  <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données non disponibles — Anonymat protégé</h2>
                  <p style={{ color: "var(--text-2)", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>{stats.message}</p>
                </div>
              ) : stats?.averages ? (
                <>
                  {activeTab === "barometre" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                      {/* Top KPIs */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, background: "linear-gradient(135deg, rgba(0,169,157,0.1) 0%, rgba(89,101,232,0.05) 100%)", border: "1px solid var(--border)", borderColor: "rgba(0,169,157,0.2)", position: "relative" }}>
                          <div style={{ position: "absolute", top: 12, right: 12 }}>
                            <span className="badge badge-emerald" style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", fontSize: 10 }}>
                              <ShieldAlert size={10} /> Anonymat garanti
                            </span>
                          </div>
                          <div style={{ background: "rgba(0,169,157,0.2)", padding: 12, borderRadius: 12 }}><Users size={24} color="var(--primary)" /></div>
                          <div>
                            <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Bénéficiaires analysés</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", lineHeight: 1 }}>{stats.respondentCount}</p>
                          </div>
                        </div>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ background: "rgba(89,101,232,0.15)", padding: 12, borderRadius: 12 }}><HeartPulse size={24} color="#5965E8" /></div>
                          <div>
                            <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Score IQRH Global</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{globalScore}<span style={{ fontSize: 16, color: "var(--text-3)" }}>/100</span></p>
                          </div>
                        </div>
                        <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                          <div style={{ background: "rgba(244,63,94,0.15)", padding: 12, borderRadius: 12 }}><AlertCircle size={24} color="#f43f5e" /></div>
                          <div>
                            <p style={{ color: "var(--text-2)", fontSize: 13, marginBottom: 4 }}>Bénéficiaires à Risque Élevé</p>
                            <p style={{ fontSize: 32, fontWeight: 800, color: "#f43f5e", lineHeight: 1 }}>{(stats.icrDistribution?.eleve || 0) + (stats.icrDistribution?.critique || 0)}</p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        {/* Radar */}
                        <div className="card">
                          <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                            <BarChart3 size={16} color="var(--primary)" /> Radar de Cohorte
                          </h3>
                          <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                                <Radar dataKey="score" stroke="#34d399" fill="#34d399" fillOpacity={0.25} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Orientations Funnel */}
                        <div className="card">
                          <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
                            <LineChart size={16} color="var(--primary)" /> Entonnoir de Prévention (Orientations)
                          </h3>
                          <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 20 }}>Besoins de prévention primaires détectés pour ré-orientation vers vos services de soins.</p>
                          <div style={{ height: 260 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={orientationsData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--text-2)" }} width={160} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: "var(--bg)" }} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
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
                          <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Charge Relationnelle (Indice ICR)</h3>
                          {icrData.length > 0 ? (
                            <div style={{ height: 300 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {icrData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                  </Pie>
                                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
                                  <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                          ) : <p style={{ color: "var(--text-3)", fontSize: 13 }}>Aucune donnée ICR.</p>}
                        </div>

                        {/* Météo */}
                        {weatherData.length > 0 ? (
                          <div className="card">
                            <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                            <div style={{ height: 300 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weatherData} layout="vertical">
                                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                                  <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "var(--text-2)" }} width={140} />
                                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
                                  <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ) : (
                          <div className="card">
                            <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                            <p style={{ color: "var(--text-3)", fontSize: 13 }}>Aucune donnée Météo.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "risques" && (
                    <>
                      <div style={{ background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <AlertTriangle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                          <strong style={{ color: "var(--text-1)" }}>À quoi servent ces données ?</strong> Les facteurs de risque et de protection sont issus de l'Indice de Complexité Relationnelle (ICR). Ils vous permettent d'identifier les causes profondes du mal-être ou du bien-être des bénéficiaires, afin d'orienter précisément vos <strong>Plans de Prévention</strong> (ex: déploiement de cellules d'écoute, partenariats spécifiques).
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div className="card">
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                            <TrendingDown size={18} style={{ color: "#f43f5e" }} />
                            <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15 }}>Top Facteurs de Risque (Vulnérabilités)</h3>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {(stats.topRiskFactors ?? []).slice(0, 8).map((f, i) => (
                              <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ color: "var(--text-2)", fontSize: 13 }}>{f.label}</span>
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
                            <TrendingUp size={18} style={{ color: "var(--primary)" }} />
                            <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15 }}>Top Facteurs Protecteurs (Forces)</h3>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {(stats.topProtectiveFactors ?? []).slice(0, 8).map((f, i) => (
                              <div key={i}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                  <span style={{ color: "var(--text-2)", fontSize: 13 }}>{f.label}</span>
                                  <span style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600 }}>{f.pct}%</span>
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
                            <Users size={18} style={{ color: "var(--primary)" }} />
                            <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15 }}>Besoins Dominants des Bénéficiaires</h3>
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                            {(stats.topDominantNeeds ?? []).map((n, i) => (
                              <div key={i} style={{ background: "rgba(89,101,232,0.1)", border: "1px solid rgba(89,101,232,0.2)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500 }}>{n.label}</span>
                                <span className="badge badge-violet">{n.pct}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
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
