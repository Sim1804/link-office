"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import {
  ArrowLeft, FileText, Download, AlertTriangle,
  CheckCircle2, TrendingUp, Users, Calendar, MapPin,
} from "lucide-react";
import { buildRadarData } from "@/lib/constants/dashboard";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer,
} from "recharts";

/* ── Types ──────────────────────────────────────────────────────── */
interface CampaignStats {
  anonymityBlocked?: boolean;
  respondentCount: number;
  threshold: number;
  participation: { invited: number; started: number; completed: number; completionRate: number };
  averages?: { global: number; social: number; affective: number; sentimental: number; professional: number; self: number };
  icrDistribution?: { faible: number; modere: number; eleve: number; critique: number };
  dominantNeeds?: Array<{ need: string; count: number; pct: number }>;
  topRiskFactors?: Array<{ factor: string; count: number; pct: number }>;
  topProtectiveFactors?: Array<{ factor: string; count: number; pct: number }>;
  topProfiles?: Array<{ profile: string; count: number; pct: number }>;
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
  description?: string;
  organization: { name: string };
}

/* ── Helpers ────────────────────────────────────────────────────── */
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ background: "rgba(17,24,39,0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        {icon}
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f8fafc", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

/* ── Composant ──────────────────────────────────────────────────── */
export default function CampaignReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then(r => r.json()),
      fetch(`/api/campaigns/${id}/stats`).then(r => r.json()),
    ]).then(([c, s]) => {
      if (c.campaign) setCampaign(c.campaign);
      setStats(s);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <><Navbar />
        <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 88, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 32, height: 32, border: "3px solid rgba(6,182,212,0.3)", borderTopColor: "#06b6d4", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
      </>
    );
  }

  const radarData = stats?.averages ? buildRadarData(stats.averages as Record<string, number>) : [];
  const part = stats?.participation;
  const generatedAt = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 88, paddingBottom: 64, position: "relative" }}>
        <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

          {/* Navigation */}
          <button onClick={() => router.push(`/dashboard/collectivites/campaigns/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", background: "none", border: "none", cursor: "pointer", marginBottom: 24, fontSize: 14 }}>
            <ArrowLeft size={16} /> Retour au tableau de bord
          </button>

          {/* En-tête du rapport */}
          <div style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.08), rgba(124,58,237,0.05))", border: "1px solid rgba(6,182,212,0.15)", borderRadius: 20, padding: 32, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <FileText size={20} style={{ color: "#06b6d4" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>Rapport de campagne</span>
                </div>
                <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 26, color: "#f8fafc", marginBottom: 8 }}>
                  {campaign?.title ?? "Campagne"}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 13, color: "#64748b" }}>
                  {campaign?.organization && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Users size={13} /> {campaign.organization.name}</span>}
                  {campaign?.territory && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={13} /> {campaign.territory}</span>}
                  {campaign?.startDate && campaign?.endDate && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar size={13} />
                      {new Date(campaign.startDate).toLocaleDateString("fr-FR")} → {new Date(campaign.endDate).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 10 }}>Rapport généré le {generatedAt} • Données anonymisées et agrégées</p>
              </div>
              <button
                onClick={() => window.print()}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4", padding: "9px 16px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                <Download size={14} /> Imprimer / PDF
              </button>
            </div>
          </div>

          {/* ── Bloc anonymat ── */}
          {stats?.anonymityBlocked && (
            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 16, padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <h2 style={{ color: "#f59e0b", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Seuil d'anonymat non atteint</h2>
              <p style={{ color: "#94a3b8", maxWidth: 460, margin: "0 auto" }}>
                Le rapport ne peut pas être généré avec moins de <strong style={{ color: "#f8fafc" }}>{stats.threshold} répondants</strong>.
                Actuellement : {stats.respondentCount} répondant(s).
              </p>
            </div>
          )}

          {/* ── Rapport complet ── */}
          {!stats?.anonymityBlocked && stats?.averages && (
            <>
              {/* 1. Contexte */}
              <Section title="1. Contexte et méthodologie" icon={<FileText size={16} style={{ color: "#06b6d4" }} />}>
                {campaign?.description && <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{campaign.description}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Questionnaire", val: "IQRH V1 — 30 questions + adaptatif" },
                    { label: "Offre", val: campaign?.offer === "PREMIUM_PLUS" ? "PREMIUM+ avec Binôme" : "PREMIUM" },
                    { label: "Seuil d'anonymat", val: `≥ ${stats.threshold} répondants` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 4px" }}>{label}</p>
                      <p style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500, margin: 0 }}>{val}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* 2. Participation */}
              <Section title="2. Participation" icon={<Users size={16} style={{ color: "#a78bfa" }} />}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Invités", val: part?.invited ?? "—", color: "#94a3b8" },
                    { label: "Commencés", val: part?.started ?? "—", color: "#a78bfa" },
                    { label: "Terminés", val: part?.completed ?? "—", color: "#34d399" },
                    { label: "Taux de complétion", val: `${part?.completionRate ?? 0}%`, color: "#06b6d4" },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: "center", padding: "16px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 24, fontWeight: 800, color, margin: 0 }}>{val}</p>
                      <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{label}</p>
                    </div>
                  ))}
                </div>
                {campaign?.targetPopulation && (
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>
                    Population cible : <strong style={{ color: "#f8fafc" }}>{campaign.targetPopulation.toLocaleString("fr-FR")}</strong> bénéficiaires.
                    Taux d'atteinte de l'objectif : <strong style={{ color: "#06b6d4" }}>
                      {Math.min(100, Math.round(((part?.completed ?? 0) / campaign.targetPopulation) * 100))}%
                    </strong>
                  </p>
                )}
              </Section>

              {/* 3. Résultats IQRH */}
              <Section title="3. Résultats IQRH collectifs" icon={<TrendingUp size={16} style={{ color: "#34d399" }} />}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>Score global collectif</p>
                    <p style={{ fontSize: 52, fontWeight: 800, color: "#f8fafc", margin: 0, lineHeight: 1 }}>
                      {stats.averages.global}
                      <span style={{ fontSize: 18, color: "#64748b", fontWeight: 400 }}>/100</span>
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                      {stats.respondentCount} répondant{stats.respondentCount > 1 ? "s" : ""} • Données anonymisées
                    </p>
                    <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[
                        { label: "Lien Social", val: stats.averages.social, color: "#06b6d4" },
                        { label: "Vie Affective", val: stats.averages.affective, color: "#a78bfa" },
                        { label: "Vie Sentimentale", val: stats.averages.sentimental, color: "#f472b6" },
                        { label: "Vie Professionnelle", val: stats.averages.professional, color: "#34d399" },
                        { label: "Rapport à Soi", val: stats.averages.self, color: "#fbbf24" },
                      ].map(({ label, val, color }) => (
                        <div key={label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: "#94a3b8" }}>{label}</span>
                            <span style={{ color, fontWeight: 600 }}>{val}/100</span>
                          </div>
                          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                            <div style={{ height: "100%", width: `${val}%`, background: color, borderRadius: 999 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.08)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.18} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Section>

              {/* 4. ICR */}
              {stats.icrDistribution && (
                <Section title="4. Complexité Relationnelle (ICR)" icon={<AlertTriangle size={16} style={{ color: "#fbbf24" }} />}>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
                    L'ICR mesure le niveau de complexité situationnelle des bénéficiaires.
                    Un score élevé ou critique indique une charge relationnelle importante nécessitant une attention particulière.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      { label: "Faible", val: stats.icrDistribution.faible, color: "#34d399", desc: "Situation relationnelle stable" },
                      { label: "Modéré", val: stats.icrDistribution.modere, color: "#fbbf24", desc: "Quelques tensions à surveiller" },
                      { label: "Élevé", val: stats.icrDistribution.eleve, color: "#fb923c", desc: "Fragilité relationnelle notable" },
                      { label: "Critique", val: stats.icrDistribution.critique, color: "#f87171", desc: "Intervention recommandée" },
                    ].map(({ label, val, color, desc }) => (
                      <div key={label} style={{ textAlign: "center", padding: "16px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: `1px solid ${color}33` }}>
                        <p style={{ fontSize: 28, fontWeight: 800, color, margin: 0 }}>{val}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color, margin: "4px 0" }}>{label}</p>
                        <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* 5. Forces et fragilités */}
              {(stats.topProtectiveFactors?.length || stats.topRiskFactors?.length) && (
                <Section title="5. Forces et fragilités collectives" icon={<CheckCircle2 size={16} style={{ color: "#34d399" }} />}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {stats.topProtectiveFactors && stats.topProtectiveFactors.length > 0 && (
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#34d399", marginBottom: 12 }}>✅ Facteurs protecteurs</p>
                        {stats.topProtectiveFactors.map((f, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(52,211,153,0.04)", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(52,211,153,0.1)" }}>
                            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{f.factor}</span>
                            <span style={{ fontSize: 12, color: "#34d399", fontWeight: 600 }}>{f.pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {stats.topRiskFactors && stats.topRiskFactors.length > 0 && (
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#f87171", marginBottom: 12 }}>⚠️ Facteurs de vulnérabilité</p>
                        {stats.topRiskFactors.map((f, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(248,113,113,0.04)", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(248,113,113,0.1)" }}>
                            <span style={{ fontSize: 13, color: "#e2e8f0" }}>{f.factor}</span>
                            <span style={{ fontSize: 12, color: "#f87171", fontWeight: 600 }}>{f.pct}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* 6. Besoins prioritaires */}
              {stats.dominantNeeds && stats.dominantNeeds.length > 0 && (
                <Section title="6. Besoins prioritaires de la population" icon={<TrendingUp size={16} style={{ color: "#a78bfa" }} />}>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
                    Ces besoins émergent de l'analyse agrégée. Ils constituent la base des recommandations institutionnelles.
                  </p>
                  {stats.dominantNeeds.map((n, i) => (
                    <div key={i} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{n.need}</span>
                        <span style={{ color: "#a78bfa", fontWeight: 600 }}>{n.pct}% des répondants</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${n.pct}%`, background: "linear-gradient(90deg, #7c3aed, #a78bfa)", borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </Section>
              )}

              {/* 7. Actions recommandées */}
              <Section title="7. Orientations recommandées" icon={<TrendingUp size={16} style={{ color: "#06b6d4" }} />}>
                <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 16 }}>
                  Sur la base de cette analyse, les actions suivantes peuvent être envisagées.
                  Ces recommandations sont générées à partir des résultats agrégés et ne permettent aucune identification individuelle.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    stats.averages.social < 50 && { icon: "🤝", titre: "Renforcement du lien social", action: "Créer des espaces de rencontre, événements de quartier, associations de voisinage." },
                    (stats.icrDistribution?.critique ?? 0) > 0 && { icon: "🆘", titre: "Dispositifs d'urgence relationnelle", action: "Mettre en place des cellules d'écoute et d'orientation pour les situations critiques." },
                    stats.averages.self < 50 && { icon: "🌱", titre: "Soutien au rapport à soi", action: "Proposer ateliers d'estime de soi, méditation, développement personnel." },
                    stats.averages.professional < 50 && { icon: "💼", titre: "Accompagnement professionnel", action: "Renforcer les dispositifs d'insertion, de reconversion et de soutien au travail." },
                  ].filter(Boolean).map((rec, i) => rec && (
                    <div key={i} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "rgba(6,182,212,0.04)", borderRadius: 12, border: "1px solid rgba(6,182,212,0.1)" }}>
                      <span style={{ fontSize: 20 }}>{rec.icon}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", margin: "0 0 4px" }}>{rec.titre}</p>
                        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>{rec.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Footer rapport */}
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
                <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
                  Ce rapport est strictement anonymisé et agrégé. Aucune donnée individuelle n'est accessible à l'institution.
                  Les résultats sont produits par le moteur LINK OFFICE à partir des {stats.respondentCount} évaluations soumises.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <button onClick={() => router.push("/dashboard/actions")}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", border: "none", padding: "12px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
                  <TrendingUp size={16} /> Construire le plan d'action
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
