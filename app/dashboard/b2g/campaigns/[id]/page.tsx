"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  Users, TrendingUp, AlertTriangle, Settings,
  FileText, RefreshCw, ShieldAlert, Zap, Crown,
  CheckCircle2, MapPin, Calendar,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { buildRadarData, RECHARTS_TOOLTIP_STYLE } from "@/lib/constants/dashboard";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";

/* ── Types ──────────────────────────────────────────────────────── */
interface CampaignStats {
  anonymityBlocked?: boolean;
  respondentCount: number;
  threshold: number;
  participation: { invited: number; started: number; completed: number; completionRate: number; activationRate: number };
  averages?: { global: number; social: number; affective: number; sentimental: number; professional: number; self: number };
  icrDistribution?: { faible: number; modere: number; eleve: number; critique: number };
  weatherDistribution?: Record<string, number>;
  topProfiles?: Array<{ profile: string; count: number; pct: number }>;
  dominantNeeds?: Array<{ need: string; count: number; pct: number }>;
  topRiskFactors?: Array<{ factor: string; count: number; pct: number }>;
  topProtectiveFactors?: Array<{ factor: string; count: number; pct: number }>;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
  offer: string;
  startDate: string;
  endDate: string;
  targetPopulation?: number;
  territory?: string;
  questionnaireConfig?: { allowedSituations?: string[] | null };
  organization: { name: string };
}

/* ── Helpers ────────────────────────────────────────────────────── */
const WEATHER_COLORS: Record<string, string> = {
  "Ensoleillé": "var(--amber)", "Nuageux": "var(--text-2)", "Pluvieux": "#60a5fa",
  "Orageux": "#f87171", "Brumeux": "var(--primary)", "Variable": "var(--emerald)",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:      { label: "Active",      color: "var(--emerald)", bg: "rgba(52,211,153,0.1)" },
  PLANIFIEE:   { label: "Planifiée",   color: "var(--primary)", bg: "rgba(167,139,250,0.1)" },
  EN_CLOTURE:  { label: "En clôture", color: "var(--amber)", bg: "rgba(251,191,36,0.1)" },
  CLOSED:      { label: "Clôturée",   color: "var(--text-3)", bg: "rgba(148,163,184,0.1)" },
  RENOUVELEE:  { label: "Renouvelée", color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  DRAFT:       { label: "Brouillon",  color: "var(--text-3)", bg: "rgba(100,116,139,0.1)" },
};

const ICR_BARS = [
  { key: "faible",   label: "Faible",   color: "var(--emerald)" },
  { key: "modere",   label: "Modéré",   color: "var(--amber)" },
  { key: "eleve",    label: "Élevé",    color: "#fb923c" },
  { key: "critique", label: "Critique", color: "#f87171" },
];

/* ── Composant ──────────────────────────────────────────────────── */
export default function CampaignDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [campaignRes, statsRes] = await Promise.all([
        fetch(`/api/campaigns/${id}`),
        fetch(`/api/campaigns/${id}/stats`),
      ]);
      const campaignData = await campaignRes.json();
      const statsData = await statsRes.json();
      if (campaignData.campaign) setCampaign(campaignData.campaign);
      setStats(statsData);
    } catch (e) {
      console.error("Dashboard campagne :", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const refresh = async () => { setRefreshing(true); await loadData(); };

  if (loading) {
    return (
      <><Navbar />
        <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PartnerPortalsNavigation />
          <div style={{ width: 36, height: 36, border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </>
    );
  }

  const status = campaign?.status ? STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.DRAFT : STATUS_CONFIG.DRAFT;
  const radarData = stats?.averages ? buildRadarData(stats.averages as Record<string, number>) : [];
  const icrData = stats?.icrDistribution
    ? ICR_BARS.map(b => ({ name: b.label, value: stats.icrDistribution![b.key as keyof typeof stats.icrDistribution], color: b.color }))
    : [];
  const weatherData = stats?.weatherDistribution
    ? Object.entries(stats.weatherDistribution).map(([name, value]) => ({ name, value }))
    : [];

  const part = stats?.participation;
  const completionPct = part?.completionRate ?? 0;
  const targetPct = campaign?.targetPopulation && part?.completed
    ? Math.min(100, Math.round((part.completed / campaign.targetPopulation) * 100)) : 0;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        
        

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

          <Breadcrumb
            homeHref="/dashboard/b2g"
            items={[
              { label: "Observatoire Territoire", href: "/dashboard/b2g" },
              { label: "Campagnes", href: "/dashboard/b2g/campaigns" },
              { label: campaign?.title ?? "Campagne" },
            ]}
          />

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 16, background: status.bg, color: status.color, letterSpacing: "0.05em" }}>
                  {status.label}
                </span>
                <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 16, background: campaign?.offer === "PREMIUM_PLUS" ? "rgba(251,191,36,0.1)" : "rgba(124,58,237,0.1)", color: campaign?.offer === "PREMIUM_PLUS" ? "var(--amber)" : "var(--primary)", display: "flex", alignItems: "center", gap: 4 }}>
                  {campaign?.offer === "PREMIUM_PLUS" ? <><Crown size={11} /> PREMIUM+</> : <><Zap size={11} /> PREMIUM</>}
                </span>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 28, color: "var(--text-1)", marginBottom: 6 }}>
                {campaign?.title ?? "Campagne"}
              </h1>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--text-3)" }}>
                {campaign?.territory && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={13} /> {campaign.territory}
                  </span>
                )}
                {campaign?.startDate && campaign?.endDate && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={13} />
                    {new Date(campaign.startDate).toLocaleDateString("fr-FR")} → {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                  </span>
                )}
                {campaign?.targetPopulation && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Users size={13} /> Cible : {campaign.targetPopulation.toLocaleString("fr-FR")} bénéficiaires
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={refresh} disabled={refreshing}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", color: "var(--text-3)", padding: "9px 14px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                <RefreshCw size={14} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
                Actualiser
              </button>
              <button onClick={() => router.push(`/dashboard/b2g/campaigns/${id}/config`)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "var(--primary)", padding: "9px 14px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                <Settings size={14} /> Configurer
              </button>
              <button onClick={() => router.push(`/dashboard/b2g/campaigns/${id}/report`)}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4", padding: "9px 14px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                <FileText size={14} /> Rapport
              </button>
            </div>
          </div>

          {/* ── Bloc anonymat insuffisant ── */}
          {stats?.anonymityBlocked && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 40, textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données insuffisantes pour l'affichage</h2>
              <p style={{ color: "var(--text-3)", maxWidth: 500, margin: "0 auto 20px" }}>
                Au moins <strong style={{ color: "var(--text-1)" }}>{stats.threshold} bénéficiaires</strong> doivent avoir complété leur évaluation pour garantir l'anonymat.
                Actuellement : <strong style={{ color: "var(--amber)" }}>{stats.respondentCount}</strong> répondant(s).
              </p>
              {/* Participation même sous le seuil */}
              <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 14 }}>
                {part && [
                  { label: "Invités", val: part.invited, color: "var(--text-3)" },
                  { label: "Commencés", val: part.started, color: "var(--primary)" },
                  { label: "Terminés", val: part.completed, color: "var(--emerald)" },
                ].map(({ label, val, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0 }}>{val}</p>
                    <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Dashboard principal ── */}
          {!stats?.anonymityBlocked && stats?.averages && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── Participation ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { label: "Invités", val: part?.invited ?? 0, color: "var(--text-3)", icon: "📨" },
                  { label: "Commencés", val: part?.started ?? 0, color: "var(--primary)", icon: "✏️" },
                  { label: "Terminés", val: part?.completed ?? 0, color: "var(--emerald)", icon: "✅" },
                  { label: "Taux de complétion", val: `${completionPct}%`, color: "#06b6d4", icon: "📊" },
                ].map(({ label, val, color, icon }) => (
                  <div key={label} style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 20px" }}>
                    <p style={{ fontSize: 22, margin: "0 0 4px" }}>{icon}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color, margin: 0 }}>{val}</p>
                    <p style={{ color: "var(--text-3)", fontSize: 12, margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Barre objectif */}
              {campaign?.targetPopulation && (
                <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: "var(--text-3)" }}>Objectif de participation</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: targetPct >= 80 ? "var(--emerald)" : targetPct >= 50 ? "var(--amber)" : "#f87171" }}>
                      {part?.completed ?? 0} / {campaign.targetPopulation} ({targetPct}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${targetPct}%`, borderRadius: 999, background: targetPct >= 80 ? "linear-gradient(90deg, var(--emerald), #06b6d4)" : targetPct >= 50 ? "linear-gradient(90deg, var(--amber), #f59e0b)" : "#f87171", transition: "width 0.6s ease" }} />
                  </div>
                </div>
              )}

              {/* ── IQRH global + Radar ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
                {/* Score global */}
                <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>IQRH Collectif moyen</p>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="120" height="120" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad)" strokeWidth="10" strokeLinecap="round"
                        strokeDasharray={`${(stats.averages.global / 100) * 314} 314`}
                        transform="rotate(-90 60 60)" />
                      <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{ position: "absolute", textAlign: "center" }}>
                      <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", margin: 0 }}>{stats.averages.global}</p>
                      <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>/100</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", margin: 0 }}>
                    Basé sur {stats.respondentCount} répondant{stats.respondentCount > 1 ? "s" : ""} • Anonymisé
                  </p>
                </div>

                {/* Radar 5 dimensions */}
                <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 8 }}>Les 5 dimensions relationnelles</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--border)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "var(--text-2)", fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} strokeWidth={2} dot={{ r: 3, fill: "var(--primary)" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ── ICR + Besoins dominants ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* ICR Distribution */}
                {stats.icrDistribution && (
                  <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 16 }}>ICR — Complexité Relationnelle</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={icrData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: "var(--text-2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "var(--text-2)", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={RECHARTS_TOOLTIP_STYLE} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {icrData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Besoins dominants */}
                {stats.dominantNeeds && stats.dominantNeeds.length > 0 && (
                  <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 16 }}>Besoins dominants collectifs</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {stats.dominantNeeds.slice(0, 5).map((n, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                            <span style={{ color: "var(--text-2)" }}>{n.need}</span>
                            <span style={{ color: "#06b6d4", fontWeight: 600 }}>{n.pct}%</span>
                          </div>
                          <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 999 }}>
                            <div style={{ height: "100%", width: `${n.pct}%`, background: "linear-gradient(90deg, #06b6d4, #7c3aed)", borderRadius: 999 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Météo collective + Top profils ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Météo */}
                {weatherData.length > 0 && (
                  <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 16 }}>Météo relationnelle collective</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {weatherData.sort((a, b) => b.value - a.value).map(({ name, value }) => {
                        const total = weatherData.reduce((s, w) => s + w.value, 0);
                        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                        const color = WEATHER_COLORS[name] ?? "var(--text-2)";
                        return (
                          <div key={name}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                              <span style={{ color: "var(--text-2)" }}>{name}</span>
                              <span style={{ color, fontWeight: 600 }}>{pct}%</span>
                            </div>
                            <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 999 }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Facteurs */}
                {(stats.topRiskFactors?.length || stats.topProtectiveFactors?.length) && (
                  <div style={{ background: "var(--surface)", backdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-3)", marginBottom: 12 }}>Facteurs collectifs</p>
                    {stats.topRiskFactors?.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12 }}>
                        <AlertTriangle size={12} style={{ color: "#f87171", flexShrink: 0 }} />
                        <span style={{ color: "var(--text-2)", flex: 1 }}>{f.factor}</span>
                        <span style={{ color: "#f87171", fontWeight: 600 }}>{f.pct}%</span>
                      </div>
                    ))}
                    {stats.topProtectiveFactors?.slice(0, 3).map((f, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12 }}>
                        <CheckCircle2 size={12} style={{ color: "var(--emerald)", flexShrink: 0 }} />
                        <span style={{ color: "var(--text-2)", flex: 1 }}>{f.factor}</span>
                        <span style={{ color: "var(--emerald)", fontWeight: 600 }}>{f.pct}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Actions ── */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
                <button onClick={() => router.push(`/dashboard/b2g/campaigns/${id}/report`)}
                  className="btn btn-primary btn-md" style={{ boxShadow: "0 4px 14px rgba(6,182,212,0.3)" }}>
                  <FileText size={16} /> Générer le rapport
                </button>
                <button onClick={() => router.push("/dashboard/actions")}
                  className="btn btn-action btn-md" style={{ boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                  <TrendingUp size={16} /> Plan d'action
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
