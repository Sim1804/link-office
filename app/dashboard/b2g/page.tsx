/**
 * app/dashboard/b2g/page.tsx — Observatoire Territorial
 */
"use client";

import { useState, useEffect } from "react";
import { PartnerPortalsNavigation } from "@/components/superadmin/PartnerPortalsNavigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { MapPin, RefreshCw, Users, TrendingUp, Lightbulb, ShieldAlert } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import {
  buildRadarData,
  buildWeatherData,
  RECHARTS_TOOLTIP_STYLE,
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
}

// DIMENSION_LABELS importé depuis @/lib/constants/dashboard

export default function B2GDashboard() {
  const [data, setData] = useState<CollectiviteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/b2g/stats").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const radarData = buildRadarData(data?.averages as Record<string, number> ?? {});
  const weatherData = data?.weatherDistribution ? buildWeatherData(data.weatherDistribution, false) : [];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <PartnerPortalsNavigation />
        <div className="blob-violet" /><div className="blob-cyan" />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, background: "var(--primary)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MapPin style={{ width: 26, height: 26, color: "white" }} />
              </div>
              <div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "var(--text-1)" }}>
                  Observatoire du Lien Social
                </h1>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                  Données territoriales agrégées • Anonymat garanti
                  {data && <> • {data.respondentCount} citoyens</>}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

              <Link href="/dashboard/b2g/campaigns" className="btn btn-tertiary btn-sm">
                Gérer les campagnes
              </Link>
              <Link href="/dashboard/b2g/actions" className="btn btn-primary btn-sm">
                Plan d'action
              </Link>
            </div>
          </div>

          {loading && <DashboardSkeleton />}

          {!loading && data?.anonymityBlocked && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Données insuffisantes</h2>
              <p style={{ color: "var(--text-2)", maxWidth: 460, margin: "0 auto" }}>
                Au moins {data.threshold} citoyens doivent avoir complété leur évaluation pour que l&apos;observatoire affiche des données ({data.respondentCount} actuellement).
              </p>
            </div>
          )}

          {!loading && !data?.anonymityBlocked && data?.averages && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Score + radar */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div className="card" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(0,169,157,0.08) 100%)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Users size={16} style={{ color: "var(--primary)" }} />
                    <span style={{ color: "var(--text-2)", fontSize: 12 }}>Score IQRH territorial moyen</span>
                  </div>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>
                    {data.averages.global}<span style={{ fontSize: 18, color: "var(--text-3)" }}>/100</span>
                  </p>
                </div>

                {data.demographics && (
                  <>
                    {[
                      { label: "Seniors / Retraités", count: data.demographics.retireeCount, color: "#f59e0b" },
                      { label: "Profils Aidants", count: data.demographics.aidantCount, color: "#f43f5e" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="card">
                        <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>{label}</p>
                        <p style={{ fontSize: 36, fontWeight: 700, color }}>{count}</p>
                        <p style={{ color: "var(--text-3)", fontSize: 12 }}>citoyens détectés</p>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Radar + Météo */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Radar Relationnel Territorial</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--border)" />
                        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "var(--text-3)" }} />
                        <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.22} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ color: "var(--text-1)", fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Distribution Météo Relationnelle</h3>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weatherData} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-3)" }} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: "var(--text-2)" }} width={120} />
                        <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }} />
                        <Bar dataKey="count" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Cartographie Relationnelle */}
              {(data.cartography ?? []).length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <MapPin size={18} style={{ color: "var(--primary)" }} />
                    <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 16 }}>
                      Cartographie Relationnelle (Segmentation)
                    </h3>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(data.cartography ?? []).map((carto, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--bg)" }}>
                        <div>
                          <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{carto.label}</p>
                          <p style={{ color: "var(--text-3)", fontSize: 12 }}>{carto.question}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ color: "var(--text-2)", fontSize: 11 }}>Répondants</p>
                            <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{carto.respondentCount}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ color: "var(--text-2)", fontSize: 11 }}>Score IQRH moyen</p>
                            <p style={{ color: "var(--primary)", fontWeight: 700, fontSize: 18 }}>{carto.avgScore}/100</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={12} /> Seuls les segments ayant atteint le seuil d'anonymat de {data.threshold} citoyens sont affichés.
                  </p>
                </div>
              )}

              {/* Recommandations de politiques publiques */}
              {(data.recommendations ?? []).length > 0 && (
                <div className="card">
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <Lightbulb size={18} style={{ color: "#f59e0b" }} />
                    <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 16 }}>
                      Recommandations de Politiques Publiques
                    </h3>
                    <span className="badge badge-amber" style={{ marginLeft: "auto" }}>
                      Généré automatiquement
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {(data.recommendations ?? []).map((rec, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--bg)" }}>
                        <div style={{ fontSize: 24, textAlign: "center", paddingTop: 2 }}>{rec.icon}</div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{rec.constat}</p>
                            <span className="badge badge-amber" style={{ fontSize: 10 }}>Constat</span>
                          </div>
                          <p style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 6 }}>
                            <TrendingUp size={10} style={{ display: "inline", marginRight: 4 }} />
                            {rec.indicateur}
                          </p>
                          <p style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500 }}>→ {rec.action}</p>
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
                    <ShieldAlert size={16} style={{ color: "var(--primary)" }} />
                    <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15 }}>Profils Relationnels Dominants</h3>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {(data.topProfiles ?? []).map((p, i) => (
                      <div key={i} style={{ background: "rgba(0,169,157,0.08)", border: "1px solid rgba(0,169,157,0.15)", borderRadius: 10, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--primary)", fontSize: 13, fontWeight: 500 }}>{p.profile}</span>
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
