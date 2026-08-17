/**
 * app/dashboard/b2b2c/page.tsx — Dashboard Admin Mutuelles & Assurances (B2B2C)
 */
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ShieldCheck, Users, Activity, RefreshCw, BarChart3, AlertCircle, HeartPulse, LineChart } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

interface B2B2CStats {
  anonymityBlocked?: boolean;
  respondentCount: number;
  threshold: number;
  message?: string;
  averages?: { global: number; social: number; affective: number; sentimental: number; professional: number; self: number };
  icrDistribution?: { faible: number; modere: number; eleve: number; critique: number };
  weatherDistribution?: Record<string, number>;
  orientationsCount?: { psychological: number; social: number; professional: number };
}

const DIMENSION_LABELS: Record<string, string> = {
  social: "Social", affective: "Affectif", sentimental: "Sentimental", professional: "Pro & Engmt", self: "Soi & Sens",
};
const ICR_COLORS = ["#34d399", "#f59e0b", "#f97316", "#f43f5e"];
const WEATHER_ICONS: Record<string, string> = {
  "Grand soleil": "☀️", "Éclaircies": "⛅", "Ciel couvert": "☁️", "Orage": "🌩️", "Tempête": "⛈️",
};

export default function B2B2CDashboard() {
  const [stats, setStats] = useState<B2B2CStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/b2b2c/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const radarData = stats?.averages
    ? Object.entries(DIMENSION_LABELS).map(([key, name]) => ({
        dimension: name,
        score: stats.averages![key as keyof typeof stats.averages] ?? 0,
        fullMark: 100,
      }))
    : [];

  const icrData = stats?.icrDistribution
    ? [
        { name: "Faible risque", value: stats.icrDistribution.faible, color: ICR_COLORS[0] },
        { name: "Risque modéré", value: stats.icrDistribution.modere, color: ICR_COLORS[1] },
        { name: "Risque élevé", value: stats.icrDistribution.eleve, color: ICR_COLORS[2] },
        { name: "Critique", value: stats.icrDistribution.critique, color: ICR_COLORS[3] },
      ].filter((d) => d.value > 0)
    : [];

  const weatherData = stats?.weatherDistribution
    ? Object.entries(stats.weatherDistribution).map(([label, count]) => ({
        label: `${WEATHER_ICONS[label] ?? "🌡️"} ${label}`,
        count,
      }))
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
                  Tableau de bord Prévention & Santé
                </h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Analyse de cohorte • ROI Prévention
                  {stats && <> • {stats.respondentCount} adhérent(s) modélisés</>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setLoading(true); fetch("/api/b2b2c/stats").then(r => r.json()).then(setStats).finally(() => setLoading(false)); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#94a3b8", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
                className="hover-bg-glass"
              >
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <DashboardSkeleton />
          ) : stats?.anonymityBlocked ? (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données non disponibles — Anonymat protégé</h2>
              <p style={{ color: "#94a3b8", maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>{stats.message}</p>
            </div>
          ) : stats?.averages ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Top KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(124,58,237,0.05) 100%)", borderColor: "rgba(16,185,129,0.2)" }}>
                  <div style={{ background: "rgba(16,185,129,0.2)", padding: 12, borderRadius: 12 }}><Users size={24} color="#34d399" /></div>
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Adhérents analysés</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#f8fafc", lineHeight: 1 }}>{stats.respondentCount}</p>
                  </div>
                </div>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ background: "rgba(124,58,237,0.15)", padding: 12, borderRadius: 12 }}><HeartPulse size={24} color="#a78bfa" /></div>
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Score de Santé Globale (IQRH)</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa", lineHeight: 1 }}>{stats.averages.global}<span style={{ fontSize: 16, color: "#475569" }}>/100</span></p>
                  </div>
                </div>
                <div className="card" style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ background: "rgba(244,63,94,0.15)", padding: 12, borderRadius: 12 }}><AlertCircle size={24} color="#f43f5e" /></div>
                  <div>
                    <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 4 }}>Adhérents à Risque Élevé</p>
                    <p style={{ fontSize: 32, fontWeight: 800, color: "#f43f5e", lineHeight: 1 }}>{stats.icrDistribution?.eleve! + stats.icrDistribution?.critique!}</p>
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

              {/* ICR & Weather */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div className="card">
                  <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Charge Relationnelle (Indice ICR)</h3>
                  {icrData.length > 0 ? (
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={icrData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                            {icrData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <p style={{ color: "#475569", fontSize: 13 }}>Aucune donnée ICR.</p>}
                </div>

                {weatherData.length > 0 && (
                  <div className="card">
                    <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Météos Relationnelles</h3>
                    <div style={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weatherData}>
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                          <YAxis hide />
                          <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                          <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : null}
        </div>
      </main>
      <style>{`
        .hover-bg-glass:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>
    </>
  );
}
