"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { Select } from "@/components/ui/Select";
import {
  Users, ShieldAlert, TrendingUp, TrendingDown, AlertTriangle,
  Activity, BarChart3, Target, PieChart as PieChartIcon, User, Briefcase, Sparkles, Lightbulb
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid, Tooltip as RechartsTooltip, PolarRadiusAxis
} from "recharts";
import Link from "next/link";
import {
  buildIcrData,
  buildRadarData,
  buildWeatherData,
} from "@/lib/constants/dashboard";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";

export default function B2BDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [gender, setGender] = useState("");
  const [activeTab, setActiveTab] = useState<"generale" | "tendances" | "recommandations">("generale");
  const [addingActionId, setAddingActionId] = useState<string | null>(null);
  const [addedActionIds, setAddedActionIds] = useState<string[]>([]);

  const handleAddToActionPlan = async (rec: any) => {
    setAddingActionId(rec.id);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.title,
          description: rec.description,
          status: "PROPOSEE",
          priority: "MEDIUM",
          campaignId: selectedCampaignId || undefined,
        })
      });
      if (res.ok) {
        setAddedActionIds(prev => [...prev, rec.id]);
      }
    } finally {
      setAddingActionId(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCampaignId) params.append("campaignId", selectedCampaignId);
    if (ageRange) params.append("ageRange", ageRange);
    if (gender) params.append("gender", gender);

    fetch(`/api/b2b/stats?${params.toString()}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [selectedCampaignId, ageRange, gender]);

  const radarData = buildRadarData(stats?.averages ?? {});
  const icrData = stats?.icrDistribution ? buildIcrData(stats.icrDistribution) : [];
  const weatherData = stats?.weatherDistribution ? buildWeatherData(stats.weatherDistribution) : [];
  
  // Find top and flop dimension
  const dims = [
    { name: "Social", score: stats?.averages?.social || 0 },
    { name: "Affectif", score: stats?.averages?.affective || 0 },
    { name: "Sentimental", score: stats?.averages?.sentimental || 0 },
    { name: "Pro", score: stats?.averages?.professional || 0 },
    { name: "Soi", score: stats?.averages?.self || 0 }
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
          
          {/* ── HEADER & FILTRES ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-family-display)", display: "flex", alignItems: "center", gap: 12 }}>
                <BarChart3 color="var(--primary)" size={36} /> 
                Observatoire de la Qualité Relationnelle
              </h1>
              <p style={{ color: "var(--text-2)", fontSize: 16, margin: 0 }}>
                Analysez l'écosystème relationnel de vos collaborateurs et identifiez les leviers d'action.
              </p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 16 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", background: "var(--surface)", padding: 12, borderRadius: 16, border: "1px solid var(--border)" }}>
                {stats?.campaignsList && stats.campaignsList.length > 0 && (
                  <Select 
                    value={selectedCampaignId}
                    onChange={setSelectedCampaignId}
                    placeholder="Toutes les campagnes"
                    options={[
                      { value: "", label: "Toutes les campagnes" },
                      ...stats.campaignsList.map((c: any) => ({ value: c.id, label: c.title }))
                    ]}
                    style={{ width: 200 }}
                  />
                )}
                <Select 
                  value={ageRange}
                  onChange={setAgeRange}
                  placeholder="Tous âges"
                  options={[
                    { value: "", label: "Tous âges" },
                    { value: "18-25", label: "18-25 ans" },
                    { value: "26-35", label: "26-35 ans" },
                    { value: "36-45", label: "36-45 ans" },
                    { value: "46+", label: "46 ans et +" }
                  ]}
                  style={{ width: 140 }}
                />
                <Select 
                  value={gender}
                  onChange={setGender}
                  placeholder="Tous genres"
                  options={[
                    { value: "", label: "Tous genres" },
                    { value: "Homme", label: "Hommes" },
                    { value: "Femme", label: "Femmes" }
                  ]}
                  style={{ width: 140 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href="/dashboard/b2b/campaigns" className="btn btn-tertiary btn-sm">
                  Gérer les campagnes
                </Link>
                <Link href="/dashboard/b2b/actions" className="btn btn-primary btn-sm">
                  Plan d'action
                </Link>
              </div>
            </div>
          </div>

          {/* ── TABS ── */}
          <DashboardTabs
            tabs={[
              { key: "generale", label: "Vue Générale", icon: Activity },
              { key: "tendances", label: "Tendances & Profils", icon: PieChartIcon },
              { key: "recommandations", label: "Recommandations & Leviers", icon: ShieldAlert },
            ]}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as any)}
          />

          {loading ? (
            <DashboardSkeleton />
          ) : stats?.anonymityBlocked ? (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Données non disponibles — Anonymat protégé
              </h2>
              <p style={{ color: "var(--text-3)", maxWidth: 500, margin: "0 auto 20px", lineHeight: 1.6 }}>
                {stats.message}
              </p>
              <Link href="/dashboard/b2b/campaigns" className="btn btn-primary btn-md">
                Gérer mes campagnes
              </Link>
            </div>
          ) : stats && stats.averages ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeSlideIn 0.4s ease-out" }}>
              
              {/* ── ROW 1: KPIs Principaux (Toujours affichés) ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                {/* KPI 1 : Score */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24, background: "linear-gradient(135deg, var(--surface) 0%, rgba(0,169,157,0.05) 100%)", border: "1px solid rgba(0,169,157,0.2)" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={32} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>IQRH Moyen</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>{stats.averages.global}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-3)" }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* KPI 2 : Participants */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Users size={32} color="#6366f1" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Collaborateurs Évalués</p>
                    <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-1)", fontFamily: "var(--font-family-display)", lineHeight: 1 }}>
                      {stats.respondentCount}
                    </div>
                  </div>
                </div>

                {/* KPI 3 : Top Dimension */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Target size={32} color="#10b981" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Point Fort</p>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
                      {topDim?.name || "N/A"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, color: "#10b981", fontWeight: 700 }}>
                      <Sparkles size={14} /> {topDim?.score || 0}/100
                    </div>
                  </div>
                </div>

                {/* KPI 4 : Flop Dimension */}
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, padding: 24 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(244,63,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldAlert size={32} color="#f43f5e" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", marginBottom: 4 }}>Fragilité</p>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", lineHeight: 1.2 }}>
                      {flopDim?.name || "N/A"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 13, color: "#f43f5e", fontWeight: 700 }}>
                      <TrendingDown size={14} /> {flopDim?.score || 0}/100
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
                      <PieChartIcon size={20} color="var(--primary)" /> Équilibre (Radar)
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                          <PolarGrid stroke="var(--border)" />
                          <PolarAngleAxis dataKey="dimension" tick={{ fill: 'var(--text-2)', fontSize: 11, fontWeight: 600 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                          <Radar name="Score" dataKey="score" stroke="var(--primary)" strokeWidth={2} fill="var(--primary)" fillOpacity={0.25} />
                          <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ICR Pie */}
                  <div className="card" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                      <Activity size={20} color="var(--primary)" /> Indice de Complexité Relationnelle (ICR)
                    </h3>
                    {icrData.length > 0 ? (
                      <div style={{ width: "100%", height: 300 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                              {icrData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip formatter={(v) => `${v} collaborateur(s)`} contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <p style={{ color: "var(--text-3)", fontSize: 14 }}>Aucune donnée ICR disponible.</p>
                    )}
                  </div>

                  {/* Weather */}
                  {weatherData.length > 0 && (
                    <div className="card" style={{ gridColumn: "span 2", padding: 32 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>Distribution Météo Relationnelle</h3>
                      <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weatherData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
                            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                            <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "var(--text-2)" }} width={120} />
                            <RechartsTooltip 
                              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} 
                              formatter={(value: number) => [`${value} collaborateur(s)`, "Quantité"]}
                            />
                            <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2 : Tendances & Profils */}
              {activeTab === "tendances" && (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                  {/* Évolution */}
                  <div className="card" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                      <TrendingUp size={20} color="var(--primary)" /> Évolution de l'IQRH
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <LineChart data={stats.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="month" stroke="var(--text-3)" fontSize={12} tickMargin={10} />
                          <YAxis stroke="var(--text-3)" fontSize={12} tickMargin={10} domain={['dataMin - 5', 'dataMax + 5']} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }} 
                            itemStyle={{ color: "var(--primary)" }}
                          />
                          <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Profils Relationnels */}
                  <div className="card" style={{ padding: 32 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                      <User size={20} color="var(--primary)" /> Profils
                    </h3>
                    <div style={{ width: "100%", height: 220, marginBottom: 16 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie data={stats.profils || []} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                            {(stats.profils || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {(stats.profils || []).map((p: any) => (
                        <div key={p.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                            <span style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500 }}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{p.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Moments de vie */}
                  <div className="card" style={{ padding: 32, gridColumn: "span 2" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
                      <Briefcase size={20} color="var(--primary)" /> IQRH moyen selon les Moments de Vie
                    </h3>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={stats.momentsVie || []} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-2)', fontSize: 12 }} width={200} />
                          <RechartsTooltip 
                            cursor={{fill: 'var(--surface-2)'}} 
                            contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12 }} 
                            formatter={(value: number) => [`${value}/100`, "Score IQRH"]}
                          />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={24}>
                            {(stats.momentsVie || []).map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.score < 50 ? "#f43f5e" : entry.score < 60 ? "#f59e0b" : "var(--primary)"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3 : Recommandations & Leviers */}
              {activeTab === "recommandations" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Risques */}
                  <div className="card" style={{ padding: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                      <TrendingDown size={20} style={{ color: "var(--rose)" }} />
                      <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>Top Vulnérabilités (Risques)</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(stats.topRiskFactors ?? []).map((f: any, i: number) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "var(--text-3)", fontSize: 14 }}>{f.label}</span>
                            <span style={{ color: "var(--rose)", fontSize: 14, fontWeight: 700 }}>{f.pct}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: 6 }}>
                            <div className="progress-fill" style={{ width: `${f.pct}%`, background: "var(--rose)" }} />
                          </div>
                        </div>
                      ))}
                      {(stats.topRiskFactors?.length === 0) && <p style={{ color: "var(--text-3)" }}>Aucune donnée.</p>}
                    </div>
                  </div>

                  {/* Protections */}
                  <div className="card" style={{ padding: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                      <TrendingUp size={20} style={{ color: "var(--emerald)" }} />
                      <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>Top Forces (Protections)</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(stats.topProtectiveFactors ?? []).map((f: any, i: number) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "var(--text-3)", fontSize: 14 }}>{f.label}</span>
                            <span style={{ color: "var(--emerald)", fontSize: 14, fontWeight: 700 }}>{f.pct}%</span>
                          </div>
                          <div className="progress-bar" style={{ height: 6 }}>
                            <div className="progress-fill" style={{ width: `${f.pct}%`, background: "var(--emerald)" }} />
                          </div>
                        </div>
                      ))}
                      {(stats.topProtectiveFactors?.length === 0) && <p style={{ color: "var(--text-3)" }}>Aucune donnée.</p>}
                    </div>
                  </div>

                  {/* Besoins */}
                  <div className="card" style={{ padding: 32, gridColumn: "span 2" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                      <Users size={20} style={{ color: "var(--primary)" }} />
                      <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>Besoins Dominants des Collaborateurs</h3>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                      {(stats.topDominantNeeds ?? []).map((n: any, i: number) => (
                        <div key={i} style={{ background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ color: "var(--primary)", fontSize: 14, fontWeight: 600 }}>{n.label}</span>
                          <span className="badge badge-violet" style={{ fontSize: 13 }}>{n.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="card" style={{ padding: 32, gridColumn: "span 2" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                      <Lightbulb size={20} style={{ color: "#f59e0b" }} />
                      <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, margin: 0 }}>Recommandations d'Actions</h3>
                      <span className="badge badge-amber" style={{ marginLeft: "auto", fontSize: 13 }}>Généré automatiquement</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      {(stats.recommendations ?? []).map((rec: any) => (
                        <div key={rec.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 16, padding: 20, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
                           <div style={{ fontSize: 32, textAlign: "center", paddingTop: 4 }}>{rec.icon}</div>
                           <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
                                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>{rec.title}</h4>
                                <button 
                                  onClick={() => handleAddToActionPlan(rec)}
                                  disabled={addingActionId === rec.id || addedActionIds.includes(rec.id)}
                                  className={addedActionIds.includes(rec.id) ? "btn btn-sm" : "btn btn-secondary btn-sm"}
                                  style={{ whiteSpace: "nowrap", ...(addedActionIds.includes(rec.id) ? { background: "rgba(124,58,237,0.1)", color: "var(--primary)", border: "1px solid rgba(124,58,237,0.3)" } : {}) }}
                                >
                                  {addingActionId === rec.id ? "Ajout..." : addedActionIds.includes(rec.id) ? "✓ Ajoutée" : "Ajouter au plan"}
                                </button>
                              </div>
                              <p style={{ margin: 0, fontSize: 14, color: "var(--text-3)", lineHeight: 1.5 }}>{rec.description}</p>
                           </div>
                        </div>
                      ))}
                      {(stats.recommendations?.length === 0) && (
                        <div className="card" style={{ padding: 32, textAlign: "center" }}>
                          <p style={{ color: "var(--text-3)", margin: 0 }}>Aucune recommandation disponible.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ) : null}

        </div>
      </main>
    </>
  );
}
