/**
 * /dashboard/page.tsx — Tableau de bord principal
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResultService } from "@/lib/iqrh/result-service";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { IQRHRadarChart } from "@/components/dashboard/RadarChart";
import { IERGauge } from "@/components/dashboard/IERGauge";
import { DimensionsList } from "@/components/dashboard/DimensionsList";
import { GamificationSummary } from "@/components/dashboard/GamificationSummary";
import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { Brain, TrendingUp, AlertTriangle, User, ArrowRight, FileQuestion, CheckCircle2, ShieldAlert, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";


export const metadata = {
  title: "Tableau de bord — LinkOffice",
  description: "Votre tableau de bord IQRH personnel",
};

export const dynamic = 'force-dynamic';

const DIMENSIONS_LABELS: Record<string, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie pro. et engagement",
  SELF: "Relation à soi",
};


export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Redirection automatique des comptes administrateurs vers leur portail dédié
  const userRole = session.user.role;
  if (userRole === "ADMIN_B2B") redirect("/dashboard/b2b");
  if (userRole === "ADMIN_B2B2C") redirect("/dashboard/b2b2c");
  if (userRole === "ADMIN_COLLECTIVITE") redirect("/dashboard/collectivites");
  if (userRole === "SUPER_ADMIN") redirect("/admin");

  let data: any = null;
  let hasResults = false;
  let dbUser = null;

  try {
    if (session?.user?.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { badges: { include: { badge: true } } }
      });
    }
    const result = await ResultService.byUser(session.user.id);
    if (result) {
      let weatherIcon = "☀️";
      let weatherLabel = "Épanouissement relationnel élevé";
      let weatherTitle = "Grand soleil";

      if (result.globalScore <= 20) {
        weatherIcon = "⛈️";
        weatherLabel = "Vulnérabilité relationnelle élevée";
        weatherTitle = "Tempête";
      } else if (result.globalScore <= 40) {
        weatherIcon = "🌩️";
        weatherLabel = "Fragilité relationnelle importante";
        weatherTitle = "Orage";
      } else if (result.globalScore <= 60) {
        weatherIcon = "☁️";
        weatherLabel = "Équilibre relationnel à renforcer";
        weatherTitle = "Ciel couvert";
      } else if (result.globalScore <= 80) {
        weatherIcon = "⛅";
        weatherLabel = "Bonne qualité relationnelle";
        weatherTitle = "Éclaircies";
      }

      hasResults = true;
      data = {
         iqrh: {
           score_global: result.globalScore,
           weather: { icon: weatherIcon, label: weatherLabel, title: weatherTitle, text: result.weatherText },
           radar: {
             relations_sociales: result.socialScore,
             relations_affectives: result.affectiveScore,
             vie_sentimentale: result.sentimentalScore,
             vie_professionnelle_engagement: result.professionalScore,
             relation_a_soi_sens: result.selfScore
           },
           dimensions: [
             { code: "D1", nom: "Relations sociales", score: result.socialScore },
             { code: "D2", nom: "Relations affectives", score: result.affectiveScore },
             { code: "D3", nom: "Vie sentimentale", score: result.sentimentalScore },
             { code: "D4", nom: "Vie pro. et engagement", score: result.professionalScore },
             { code: "D5", nom: "Relation à soi", score: result.selfScore }
           ],
           ier_score: result.balanceIndex,
           ier_level: result.balanceIndex > 80 ? "Très équilibré" : result.balanceIndex > 60 ? "Équilibré" : "Déséquilibré",
           best_dimension: result.bestDimension,
           priority_dimension: result.priorityDimension,
           strengths: result.strengths ?? [],
           watchpoints: result.watchpoints ?? [],
           prescription: result.prescription ?? null,
         },

         icr: result.icr ? {
           icr_score: result.icr.score,
           niveau_icr: result.icr.level,
           interpretation_icr: result.icr.interpretation,
           family_complexity: result.icr.familyComplexity,
           professional_complexity: result.icr.professionalComplexity,
           transition_complexity: result.icr.lifeTransitions,
           relational_load: result.icr.relationalLoad,
           protective_resources: result.icr.protectiveResources,
           top_risk_factors: result.icr.riskFactors,
           top_protective_factors: result.icr.protectiveFactors,
           top_resources: result.icr.resources,
           top_vulnerabilities: result.icr.vulnerabilities,
           identified_barriers: result.icr.barriers,
           identified_levers: result.icr.levers,
           dominant_needs: result.icr.dominantNeeds,
         } : undefined,
         profil: result.profile ? {
           profile_primary: result.profile.primaryName,
           profile_secondary: result.profile.secondaryName,
           profile_description: result.profileSummary,
           signature: result.profile.signature,
         } : undefined,
      };
    }
  } catch {
    hasResults = false;
  }

  // ── Aucun résultat ──────────────────────────────────────────────────────
  if (!hasResults) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", paddingTop: 80 }}>
            <div style={{
              width: 80, height: 80, background: "rgba(124,58,237,0.12)", borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", animation: "float 6s ease-in-out infinite",
            }}>
              <FileQuestion style={{ width: 40, height: 40, color: "#a78bfa" }} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", marginBottom: 12 }}>
              Bienvenue, {session.user.name?.split(" ")[0]} !
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
              Vous n'avez pas encore de résultats. Remplissez le questionnaire IQRH pour découvrir votre profil relationnel.
            </p>
            <Link href="/consentement" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#7c3aed", color: "white", fontWeight: 600,
              padding: "16px 32px", borderRadius: 16, textDecoration: "none",
              boxShadow: "0 0 32px rgba(124,58,237,0.35)", fontSize: 15,
              transition: "all 0.2s",
            }}>
              Commencer le questionnaire
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
          </div>
          <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
        </main>
      </>
    );
  }

  const { iqrh, icr, profil } = data!;
  const points = dbUser?.points || 0;
  const badges = dbUser?.badges || [];

  return (
    <>
      <Navbar />
      <main className="page-main">
        {/* Blobs */}
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide">

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 4 }}>
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </p>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 30, color: "#f8fafc" }}>
              Votre tableau de bord
            </h1>
          </div>

          <GamificationSummary points={points} badges={badges} />

          {/* ── Ligne 1 : Score + Météo + IER ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 20 }}>

            {/* Score IQRH */}
            <div className="card card-hover">
              <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Score IQRH</p>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 52,
                  background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>
                  {iqrh?.score_global}
                </span>
                <span style={{ color: "#475569", fontSize: 18, marginBottom: 8 }}>/100</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                  <TrendingUp style={{ width: 15, height: 15, color: "#34d399" }} />
                  Dimension forte : <strong style={{ color: "#f8fafc" }}>{iqrh?.best_dimension ? (DIMENSIONS_LABELS[iqrh.best_dimension] || iqrh.best_dimension) : "-"}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#94a3b8" }}>
                  <AlertTriangle style={{ width: 15, height: 15, color: "#f59e0b" }} />
                  Priorité : <strong style={{ color: "#f8fafc" }}>{iqrh?.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "-"}</strong>
                </div>
              </div>
            </div>

            {/* Météo relationnelle */}
            {iqrh?.weather && (
              <WeatherCard
                icon={iqrh.weather.icon}
                label={iqrh.weather.label}
                title={iqrh.weather.title}
                text={iqrh.weather.text}
                score={iqrh.score_global}
              />
            )}

            {/* IER */}
            {iqrh?.ier_score !== undefined && (
              <div className="card card-hover" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <IERGauge score={iqrh.ier_score} level={iqrh.ier_level} />
                <p style={{ color: "#475569", fontSize: 12, textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  Mesure l'homogénéité de votre profil relationnel
                </p>
              </div>
            )}
          </div>

          {/* ── Ligne 2 : Radar + Dimensions ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
            <div className="card card-hover">
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>Radar IQRH</h3>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Vos 5 dimensions relationnelles</p>
              </div>
              {iqrh?.radar && (
                <IQRHRadarChart data={iqrh.radar} priorityDimension={iqrh.priority_dimension} />
              )}
            </div>

            <div className="card card-hover">
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>Détail des dimensions</h3>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>Scores sur 100</p>
              </div>
              {iqrh?.dimensions && (
                <DimensionsList
                  dimensions={iqrh.dimensions}
                  bestDimension={iqrh.best_dimension}
                  priorityDimension={iqrh.priority_dimension}
                />
              )}
            </div>
          </div>

          {/* ── Ligne 2.5 : Forces & Points de vigilance ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 20 }}>
            {/* Forces */}
            <div className="card card-hover" style={{ borderColor: "rgba(16,185,129,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: "#34d399" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>
                  Vos 3 principales forces
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {iqrh?.strengths && iqrh.strengths.length > 0 ? (
                  iqrh.strengths.map((str: string, idx: number) => (
                    <div key={str} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#cbd5e1" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#34d399", background: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                        0{idx + 1}
                      </span>
                      <span style={{ lineHeight: 1.5 }}>{str}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 13, color: "#64748b" }}>Aucune force majeure enregistrée.</p>
                )}
              </div>
            </div>

            {/* Points de vigilance */}
            <div className="card card-hover" style={{ borderColor: "rgba(245,158,11,0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <ShieldAlert style={{ width: 18, height: 18, color: "#f59e0b" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc" }}>
                  Vos 3 points de vigilance
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {iqrh?.watchpoints && iqrh.watchpoints.length > 0 ? (
                  iqrh.watchpoints.map((wpt: string, idx: number) => (
                    <div key={wpt} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#cbd5e1" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.15)", padding: "2px 8px", borderRadius: 6, flexShrink: 0 }}>
                        0{idx + 1}
                      </span>
                      <span style={{ lineHeight: 1.5 }}>{wpt}</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 13, color: "#64748b" }}>Aucun point de vigilance identifié.</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Ordonnance Relationnelle (Prescriptions) ── */}
          {iqrh?.prescription && (
            <div className="card" style={{ marginBottom: 20, borderColor: "rgba(124,58,237,0.3)", background: "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(124,58,237,0.06) 100%)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(124,58,237,0.2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ListChecks style={{ width: 20, height: 20, color: "#c084fc" }} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 17, color: "#f8fafc" }}>
                      {iqrh.prescription.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 2 }}>{iqrh.prescription.summary}</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(124,58,237,0.2)", color: "#c084fc", padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(124,58,237,0.4)" }}>
                  Priorité : {iqrh.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "-"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                {iqrh.prescription.items.map((item: any) => (
                  <PrescriptionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* ── Ligne 3 : Profil + ICR + IRIS CTA ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>


            {/* Profil */}
            {profil && (
              <div className="card card-hover" style={{ borderColor: "rgba(124,58,237,0.25)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <User style={{ width: 16, height: 16, color: "#a78bfa" }} />
                    <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#f8fafc" }}>Profil relationnel</h3>
                  </div>
                  {profil.signature && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                      background: "rgba(6,182,212,0.15)", color: "#06b6d4",
                      padding: "4px 10px", borderRadius: 8, border: "1px solid rgba(6,182,212,0.3)",
                      display: "inline-flex", alignItems: "center", gap: 4
                    }}>
                      ✨ {profil.signature}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <span style={{
                    display: "inline-block", padding: "4px 12px", borderRadius: 999,
                    background: "rgba(124,58,237,0.18)", color: "#a78bfa",
                    border: "1px solid rgba(124,58,237,0.3)", fontSize: 13, fontWeight: 500,
                  }}>
                    {profil.profile_primary}
                  </span>
                  {profil.profile_secondary && (
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 999,
                      background: "rgba(255,255,255,0.06)", color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 500,
                    }}>
                      {profil.profile_secondary}
                    </span>
                  )}
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{profil.profile_description}</p>
              </div>
            )}

            {/* ICR */}
            {icr && (
              <div className="card card-hover">
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#f8fafc", marginBottom: 8 }}>ICR — Complexité de vie</h3>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 32, fontWeight: 700,
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{icr.icr_score}</span>
                  <span style={{ color: "#475569", fontSize: 13, marginBottom: 4 }}>/100</span>
                </div>
                <span style={{
                  display: "inline-block", padding: "3px 10px", borderRadius: 999,
                  background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                  border: "1px solid rgba(245,158,11,0.25)", fontSize: 12, fontWeight: 500,
                  marginBottom: 10,
                }}>
                  {icr.niveau_icr}
                </span>

                {icr.interpretation_icr && (
                  <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
                    {icr.interpretation_icr}
                  </p>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Complexité familiale", val: icr.family_complexity },
                    { label: "Complexité professionnelle", val: icr.professional_complexity },
                    { label: "Transitions de vie", val: icr.transition_complexity },
                    { label: "Charge relationnelle", val: icr.relational_load },
                    { label: "Ressources protectrices", val: icr.protective_resources },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "#475569" }}>{label}</span>
                      <span style={{ color: "#94a3b8", fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>

                {icr.dominant_needs && icr.dominant_needs.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                    <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Besoins dominants</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {icr.dominant_needs.map((need: string) => (
                        <span key={need} style={{ fontSize: 11, background: "rgba(124,58,237,0.12)", color: "#a78bfa", padding: "2px 8px", borderRadius: 6 }}>
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* IRIS CTA */}
            <div style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(124,58,237,0.25)",
              borderRadius: 20, padding: 24,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
            }}>
              <div>
                <div style={{
                  width: 48, height: 48, background: "rgba(124,58,237,0.2)", borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 16, animation: "float 6s ease-in-out infinite",
                }}>
                  <Brain style={{ width: 24, height: 24, color: "#a78bfa" }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 16, color: "#f8fafc", marginBottom: 8 }}>
                  Parler à IRIS
                </h3>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                  Votre coach IA analyse vos résultats et vous guide personnellement vers plus d'équilibre.
                </p>
              </div>
              <Link href="/iris" className="btn btn-primary" style={{ width: "100%", padding: "14px 20px" }}>
                Commencer avec IRIS
                <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
          </div>
        </div>
        <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }`}</style>
      </main>
    </>
  );
}
