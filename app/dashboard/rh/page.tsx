/**
 * app/dashboard/b2b/page.tsx — Dashboard RH (B2B)
 * ─────────────────────────────────────────────────────────
 * Tableau de bord réservé aux responsables RH et dirigeants.
 * Affiche les indicateurs agrégés IQRH/ICR de leurs collaborateurs.
 * RGPD : Aucune donnée individuelle n'est affichée (seuil anonymat = 5).
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import {
  Users, ShieldAlert, TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle2, BarChart3, QrCode, Link2, Copy, Download,
  RefreshCw, Building2, ChevronRight, Lock
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
  averages?: {
    global: number; social: number; affective: number;
    sentimental: number; professional: number; self: number;
  };
  icrDistribution?: { faible: number; modere: number; eleve: number; critique: number };
  topRiskFactors?: Array<{ label: string; count: number; pct: number }>;
  topProtectiveFactors?: Array<{ label: string; count: number; pct: number }>;
  topDominantNeeds?: Array<{ label: string; count: number; pct: number }>;
  weatherDistribution?: Record<string, number>;
}

interface InviteData {
  organizationName: string;
  codeAccess: string;
  inviteUrl: string;
  qrCode: string;
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

export default function B2BDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<B2BStats | null>(null);
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"barometre" | "risques" | "invitation">("barometre");

  useEffect(() => {
    fetch("/api/b2b/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const loadInvite = async () => {
    setInviteLoading(true);
    try {
      const r = await fetch("/api/b2b/invite");
      const data = await r.json();
      setInvite(data);
      setShowQR(true);
    } finally {
      setInviteLoading(false);
    }
  };

  const copyLink = () => {
    if (invite?.inviteUrl) {
      navigator.clipboard.writeText(invite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    if (!invite?.qrCode) return;
    const a = document.createElement("a");
    a.href = invite.qrCode;
    a.download = `qrcode-${invite.codeAccess}.png`;
    a.click();
  };

  const radarData = stats?.averages
    ? Object.entries(DIMENSION_LABELS).map(([key, name]) => ({
        dimension: name,
        score: stats.averages![key as keyof typeof stats.averages] ?? 0,
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
    ? Object.entries(stats.weatherDistribution).map(([label, count]) => ({
        label: `${WEATHER_ICONS[label] ?? "🌡️"} ${label}`,
        count,
      }))
    : [];

  const globalScore = stats?.averages?.global ?? 0;
  const scoreColor =
    globalScore >= 80 ? "#34d399" :
    globalScore >= 60 ? "#a78bfa" :
    globalScore >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: "rgba(124,58,237,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.2)" }}>
                <Building2 style={{ width: 26, height: 26, color: "#a78bfa" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", marginBottom: 4 }}>
                  Tableau de bord RH
                </h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Données agrégées • Anonymat garanti
                  {stats && <> • {stats.respondentCount} répondant(s)</>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="badge badge-violet" style={{ padding: "8px 12px", fontSize: 13, height: "100%" }}>
                <ShieldAlert size={14} /> RGPD Conforme
              </span>
              <Link href="/dashboard/rh/campaigns" className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Campagnes
              </Link>
              <Link href="/dashboard/actions" className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>
                Plan d'action
              </Link>
              <button
                onClick={() => { setLoading(true); fetch("/api/b2b/stats").then(r => r.json()).then(setStats).finally(() => setLoading(false)); }}
                className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}
              >
                <RefreshCw size={14} />
                Actualiser
              </button>
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

          {/* ── Loading ── */}
          {loading && <DashboardSkeleton />}

          {/* Notification Devis en cours */}
          {stats && stats.subscriptionStatus === "PENDING_QUOTE" && (
            <div style={{
              background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
              padding: "16px 24px", borderRadius: 12, marginBottom: 30,
              display: "flex", alignItems: "flex-start", gap: 16
            }}>
              <div style={{ background: "rgba(245,158,11,0.2)", width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={20} color="#fbbf24" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fcd34d", marginBottom: 4 }}>Demande de devis Enterprise en cours de traitement</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5 }}>
                  Notre équipe commerciale analyse actuellement vos besoins. Nous vous contacterons sous 24h pour activer vos accès illimités.
                  Vous pouvez cependant commencer à configurer votre espace.
                </p>
              </div>
            </div>
          )}

          {/* ── Anonymity blocked ── */}
          {!loading && stats?.anonymityBlocked && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                Données non disponibles — Anonymat protégé
              </h2>
              <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto 20px", lineHeight: 1.6 }}>
                {stats.message}
              </p>
              <Link href="/dashboard/rh/campaigns" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
                Gérer mes campagnes
              </Link>
            </div>
          )}

          {/* ── Contenu principal ── */}
          {!loading && !stats?.anonymityBlocked && stats?.averages && (
            <>
              {/* ── TAB : Tableau de bord ── */}
              {activeTab === "barometre" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                  {/* Score global + Météo */}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200, padding: 20, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16 }}>
                      <div style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Collaborateurs inscrits</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fafc" }}>{stats?.registeredUsersCount || 0}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 200, padding: 20, background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 16 }}>
                      <div style={{ color: "#38bdf8", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Évaluations (IQRH) complétées</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: "#f8fafc" }}>{stats?.respondentCount || 0}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <div className="card" style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 24, background: `linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)`, border: "1px solid rgba(124,58,237,0.25)" }}>
                      <div>
                        <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Score IQRH moyen équipe</p>
                        <p style={{ fontSize: 52, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                          {globalScore}<span style={{ fontSize: 20, color: "#475569" }}>/100</span>
                        </p>
                        <p style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>{stats.respondentCount} collaborateurs évalués</p>
                      </div>
                    </div>
                    {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
                      const score = stats.averages![key as keyof typeof stats.averages] ?? 0;
                      const color = score >= 70 ? "#34d399" : score >= 50 ? "#a78bfa" : "#f59e0b";
                      return (
                        <div key={key} className="card">
                          <p style={{ color: "#64748b", fontSize: 11, marginBottom: 6 }}>{label}</p>
                          <p style={{ fontSize: 28, fontWeight: 700, color }}>{score}<span style={{ fontSize: 12, color: "#475569" }}>/100</span></p>
                          <div className="progress-bar" style={{ marginTop: 12 }}>
                            <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Radar + ICR */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="card">
                      <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Radar Relationnel Équipe</h3>
                      <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card">
                      <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Répartition ICR</h3>
                      {icrData.length > 0 ? (
                        <div style={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name: string; percent?: number }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                                {icrData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                              </Pie>
                              <Tooltip formatter={(v) => `${v} collaborateur(s)`} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : <p style={{ color: "#475569", fontSize: 13 }}>Aucune donnée ICR disponible.</p>}
                    </div>
                  </div>

                  {/* Météo distribution */}
                  {weatherData.length > 0 && (
                    <div className="card">
                      <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                      <div style={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weatherData} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} width={140} />
                            <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                            <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB : Risques & Leviers ── */}
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
                      <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Besoins Dominants des Collaborateurs</h3>
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
          )}



        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
