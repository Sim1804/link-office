/**
 * /dashboard/page.tsx — Tableau de bord principal IQRH
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResultService } from "@/lib/iqrh/result-service";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { MeteoWidget } from "@/src/components/dashboard/MeteoWidget";
import { GamificationSummary } from "@/components/dashboard/GamificationSummary";
import { DashboardTabs } from "@/src/components/dashboard/tabs/DashboardTabs";
import { B2b2cMemberRecommendations } from "@/components/dashboard/B2b2cMemberRecommendations";
import { Brain, Star, Clock, Lock, Sparkles, TrendingUp, Search, User, ArrowRight, FileQuestion, Activity } from "lucide-react";
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
  if (userRole === "ADMIN_COLLECTIVITE") redirect("/dashboard/b2g");
  if (userRole === "SUPER_ADMIN") redirect("/admin");

  const [dbUser, result, history] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        badges: { include: { badge: true } },
        organization: { include: { subscription: true } } 
      }
    }),
    ResultService.byUser(session.user.id),
    ResultService.userHistory(session.user.id)
  ]);

  let data: any = null;
  let hasResults = false;

  // VERIFICATION FIN DE CAMPAGNE (Fallback Freemium)
  let currentSubscriptionTier = dbUser?.subscription || "FREEMIUM";
  if (dbUser?.campaignId && currentSubscriptionTier !== "FREEMIUM") {
    const campaign = await prisma.campaign.findUnique({
      where: { id: dbUser.campaignId },
      select: { endDate: true }
    });
    
    if (campaign?.endDate && new Date(campaign.endDate) < new Date()) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { subscription: "FREEMIUM" }
      });
      currentSubscriptionTier = "FREEMIUM";
    }
  }

  try {
    const subscriptionTier = currentSubscriptionTier;
    if (result) {
      let weatherIcon = result.weatherIcon || "☀️";
      let weatherLabel = result.weatherTitleFull?.includes("—") ? result.weatherTitleFull.split("—")[1].trim() : "Épanouissement relationnel élevé";
      let weatherTitle = result.weatherTitle || result.weather || "Grand soleil";

      hasResults = true;
      data = {
         iqrh: {
           score_global: result.globalScore,
           weather: { icon: result.weatherIcon || weatherIcon, label: weatherLabel, title: result.weatherTitleFull || result.weatherTitle || weatherTitle, text: dbUser?.subscription === "PREMIUM" || dbUser?.subscription === "PREMIUM_PLUS" ? (result.weatherTextPremium || result.weatherText) : result.weatherText },
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
           ier_level: result.balanceLevel,
           best_dimension: result.bestDimension,
           priority_dimension: result.priorityDimension,
           strengths: result.strengths ?? [],
           watchpoints: result.watchpoints ?? [],
           prescription: result.prescription ?? null,
           history,
         },

         icr: result.icr ? {
           icr_score: result.icr.score,
           niveau_icr: result.icr.level,
           interpretation_icr: (subscriptionTier === "PREMIUM" || subscriptionTier === "PREMIUM_PLUS") ? (result.icr.interpretationPremium || result.icr.interpretation) : result.icr.interpretation,
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
         subscriptionTier,
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
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", paddingTop: 64 }}>
            {/* Empty State Hero */}
            <div style={{
              width: 72, height: 72,
              background: "linear-gradient(135deg, rgba(0,169,157,0.12) 0%, rgba(89,101,232,0.08) 100%)",
              borderRadius: 20, border: "1px solid rgba(0,169,157,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
            }}>
              <Activity style={{ width: 32, height: 32, color: "var(--primary)" }} />
            </div>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 800, fontSize: 30, color: "var(--text-1)",
              letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.2,
            }}>
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 8, lineHeight: 1.6 }}>
              Votre espace IQRH est prêt.
            </p>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 36, lineHeight: 1.6 }}>
              Passez votre première évaluation pour découvrir votre profil de santé relationnelle et obtenir vos recommandations personnalisées.
            </p>
            <Link href="/consentement" className="btn btn-primary btn-lg" style={{ textDecoration: "none", display: "inline-flex", gap: 8 }}>
              Commencer mon évaluation
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 16 }}>
              ✓ Anonyme · ✓ Sécurisé · ✓ ~15 minutes
            </p>
          </div>
        </main>
      </>
    );
  }

  const { iqrh, icr, profil } = data!;
  const points = dbUser?.points || 0;
  const badges = dbUser?.badges || [];
  const subscription = dbUser?.subscription || "FREEMIUM";
  const isPremium = subscription === "PREMIUM" || subscription === "PREMIUM_PLUS";
  const isPremiumPlus = subscription === "PREMIUM_PLUS";

  const score = iqrh?.score_global ?? 0;
  const scoreColor = score >= 70 ? "#10b981" : score >= 50 ? "var(--primary)" : score >= 30 ? "#f59e0b" : "#ef4444";
  const scoreLabel = score >= 70 ? "Excellent" : score >= 50 ? "Bon" : score >= 30 ? "À renforcer" : "Priorité";

  const allPrescriptionItems = iqrh?.prescription?.items || [];
  const prescriptionItemsToDisplay = isPremium ? allPrescriptionItems : [
    ...allPrescriptionItems.filter((i: any) => i.kind === "RECOMMENDATION").slice(0, 3),
    ...allPrescriptionItems.filter((i: any) => i.kind === "MICRO_CHALLENGE").slice(0, 3)
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-container-wide">

          {/* ── Hero Header ── */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: "20px 24px",
            marginBottom: 24,
          }}>

            {/* Ligne 1 : Score + Greeting + Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>

              {/* Score Circle — réduit */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="64" height="64" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(18,61,70,0.06)" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke={scoreColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 169.6} 169.6`}
                  />
                </svg>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 16, color: scoreColor, lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: 8, color: "var(--text-3)", fontWeight: 600 }}>/100</span>
                </div>
              </div>

              {/* Greeting + Status */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500, marginBottom: 2 }}>
                  Bonjour, {session.user.name?.split(" ")[0]} 👋
                </p>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800, fontSize: 18, color: "var(--text-1)",
                  letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 5,
                }}>
                  Votre espace IQRH
                </h1>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: `${scoreColor}12`, border: `1px solid ${scoreColor}30` }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: scoreColor }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: scoreColor }}>{scoreLabel}</span>
                </div>
              </div>

              {/* Gamification + Premium — compact à droite */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <GamificationSummary points={points} badges={badges} />
                {isPremiumPlus ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 10px", borderRadius: 999,
                    background: "rgba(0,169,157,0.08)", border: "1px solid rgba(0,169,157,0.2)",
                    fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.04em",
                  }}>
                    ★ Premium+
                  </span>
                ) : isPremium ? (
                  <>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 999,
                      background: "rgba(0,169,157,0.06)", border: "1px solid rgba(0,169,157,0.15)",
                      fontSize: 11, fontWeight: 700, color: "var(--primary)", letterSpacing: "0.04em",
                    }}>
                      ★ Premium
                    </span>
                    <Link href="/premium" style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 10px", borderRadius: 999, textDecoration: "none",
                      background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.3)",
                      fontSize: 11, fontWeight: 700, color: "var(--primary)",
                      whiteSpace: "nowrap", transition: "background 0.15s",
                    }}>
                      Passer à Premium+ →
                    </Link>
                  </>
                ) : (
                  <Link href="/premium" className="btn btn-primary btn-sm" style={{ textDecoration: "none", fontSize: 11, padding: "4px 12px" }}>
                    Premium →
                  </Link>
                )}
              </div>
            </div>

            {/* Séparateur */}
            <div style={{ height: 1, background: "var(--border)", marginBottom: 14 }} />

            {/* Ligne 2 : Météo du jour */}
            <MeteoWidget />

          </div>

          {userRole === "MEMBER" && <B2b2cMemberRecommendations />}

          {/* ── Dashboard Tabs ── */}
          <DashboardTabs data={data} isPremium={isPremium} isPremiumPlus={isPremiumPlus} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />

        </div>
      </main>
    </>
  );
}
