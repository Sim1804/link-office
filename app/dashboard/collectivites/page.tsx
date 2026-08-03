/**
 * app/dashboard/collectivites/page.tsx — Observatoire Territorial
 */
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin, RefreshCw, Users, TrendingUp, Lightbulb, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

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
  demographics?: { retireeCount: number; youngCount: number; aidantCount: number };
}

const DIMENSION_LABELS: Record<string, string> = {
  social: "Relations sociales", affective: "Relations affectives",
  sentimental: "Vie sentimentale", professional: "Vie pro", self: "Relation à soi",
};

export default function CollectivitesDashboard() {
  const [data, setData] = useState<CollectiviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/collectivites/stats").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const radarData = data?.averages
    ? Object.entries(DIMENSION_LABELS).map(([key, name]) => ({ dimension: name, score: data.averages![key as keyof typeof data.averages] ?? 0, fullMark: 100 }))
    : [];

  const weatherData = data?.weatherDistribution
    ? Object.entries(data.weatherDistribution).map(([label, count]) => ({ label, count }))
    : [];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" /><div className="blob-cyan" />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: "rgba(6,182,212,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MapPin style={{ width: 26, height: 26, color: "#06b6d4" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc" }}>
                Observatoire du Lien Social
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Données territoriales agrégées • Anonymat garanti
                {data && <> • {data.respondentCount} citoyens</>}
              </p>
            </div>
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: 12, color: "#64748b" }}>
              <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
              Chargement des données territoriales…
            </div>
          )}

          {!loading && data?.anonymityBlocked && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données insuffisantes</h2>
              <p style={{ color: "#94a3b8", maxWidth: 460, margin: "0 auto" }}>
                Au moins {data.threshold} citoyens doivent avoir complété leur évaluation pour que l&apos;observatoire affiche des données ({data.respondentCount} actuellement).
              </p>
            </div>
          )}

          {!loading && !data?.anonymityBlocked && data?.averages && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Score + radar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="card" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(124,58,237,0.08) 100%)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Users size={16} style={{ color: "#06b6d4" }} />
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>Score IQRH territorial moyen</span>
                  </div>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#06b6d4", lineHeight: 1 }}>
                    {data.averages.global}<span style={{ fontSize: 18, color: "#475569" }}>/100</span>
                  </p>
                </div>

                {data.demographics && (
                  <>
                    {[
                      { label: "Seniors / Retraités", count: data.demographics.retireeCount, color: "#f59e0b" },
                      { label: "Profils Aidants", count: data.demographics.aidantCount, color: "#f43f5e" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="card">
                        <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 36, fontWeight: 700, color }}>{count}</p>
                        <p style={{ color: "#475569", fontSize: 12 }}>citoyens détectés</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Radar + Météo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Radar Relationnel Territorial</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.06)" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#64748b" }} />
                        <Radar dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.22} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ color: "#f8fafc", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weatherData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} width={120} />
                        <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8 }} />
                        <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recommandations de politiques publiques */}
              {(data.recommendations ?? []).length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <Lightbulb size={18} style={{ color: "#f59e0b" }} />
                    <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16 }}>
                      Recommandations de Politiques Publiques
                    </h3>
                    <span className="badge badge-amber" style={{ marginLeft: "auto" }}>
                      Généré automatiquement
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {(data.recommendations ?? []).map((rec, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: 24, textAlign: "center", paddingTop: 2 }}>{rec.icon}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{rec.constat}</p>
                            <span className="badge badge-amber" style={{ fontSize: 10 }}>Constat</span>
                          </div>
                          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 6 }}>
                            <TrendingUp size={10} style={{ display: "inline", marginRight: 4 }} />
                            {rec.indicateur}
                          </p>
                          <p style={{ color: "#a78bfa", fontSize: 13, fontWeight: 500 }}>→ {rec.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top profils */}
              {(data.topProfiles ?? []).length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <ShieldAlert size={16} style={{ color: "#a78bfa" }} />
                    <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Profils Relationnels Dominants</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(data.topProfiles ?? []).map((p, i) => (
                      <div key={i} style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#a78bfa", fontSize: 13, fontWeight: 500 }}>{p.profile}</span>
                        <span className="badge badge-violet">{p.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
