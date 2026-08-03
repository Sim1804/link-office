/**
 * app/dashboard/b2b2c/page.tsx — Dashboard Mutuelles & Assurances (B2B2C)
 */
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Heart, ExternalLink, RefreshCw, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

interface Recommendation {
  trigger: string;
  service: string;
  icon: string;
  priority: "haute" | "normale";
  organizationService?: { id: string; title: string; linkUrl?: string | null };
}

interface OrientationData {
  hasResults: boolean;
  recommendations: Recommendation[];
  scores?: {
    social: number; affective: number; professional: number; self: number; icr: number | null;
  };
}

export default function B2B2CDashboard() {
  const [data, setData] = useState<OrientationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/b2b2c/orientation")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: "rgba(16,185,129,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart style={{ width: 26, height: 26, color: "#34d399" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc" }}>
                Mes recommandations santé
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>Services personnalisés proposés par votre mutuelle</p>
            </div>
          </div>

          {/* RGPD banner */}
          <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={16} style={{ color: "#34d399", flexShrink: 0 }} />
            <p style={{ color: "#6ee7b7", fontSize: 13 }}>
              Ces recommandations sont basées uniquement sur votre profil agrégé. Votre mutuelle ne voit aucune réponse individuelle à votre questionnaire.
            </p>
          </div>

          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "#64748b" }}>
              <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
              <span>Analyse de votre profil…</span>
            </div>
          )}

          {!loading && !data?.hasResults && (
            <div className="card" style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                Questionnaire non complété
              </h2>
              <p style={{ color: "#94a3b8", marginBottom: 20 }}>
                Complétez votre évaluation IQRH pour recevoir des recommandations personnalisées.
              </p>
              <a href="/questionnaire" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
                Faire le test
              </a>
            </div>
          )}

          {!loading && data?.hasResults && (
            <>
              {data.recommendations.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                  <h2 style={{ color: "#f8fafc", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                    Excellent équilibre relationnel !
                  </h2>
                  <p style={{ color: "#94a3b8" }}>
                    Votre profil ne présente pas de fragilité nécessitant une intervention spécifique. Continuez à prendre soin de vous !
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Sparkles size={16} style={{ color: "#a78bfa" }} />
                    <p style={{ color: "#94a3b8", fontSize: 14 }}>
                      {data.recommendations.length} service(s) recommandé(s) en fonction de votre profil
                    </p>
                  </div>

                  {data.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="card card-hover"
                      style={{
                        borderLeft: `3px solid ${rec.priority === "haute" ? "#a78bfa" : "#06b6d4"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ fontSize: 28, flexShrink: 0 }}>{rec.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span className={`badge ${rec.priority === "haute" ? "badge-violet" : "badge-cyan"}`}>
                              Priorité {rec.priority}
                            </span>
                          </div>
                          <h3 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                            {rec.organizationService?.title ?? rec.service}
                          </h3>
                          <p style={{ color: "#64748b", fontSize: 12 }}>
                            <AlertCircle size={11} style={{ display: "inline", marginRight: 4 }} />
                            {rec.trigger}
                          </p>
                        </div>
                        {rec.organizationService?.linkUrl && (
                          <a
                            href={rec.organizationService.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ flexShrink: 0, textDecoration: "none" }}
                          >
                            En savoir plus <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
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
