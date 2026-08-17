/**
 * /dashboard/page.tsx — Tableau de bord principal
 */
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResultService } from "@/lib/iqrh/result-service";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { GamificationSummary } from "@/components/dashboard/GamificationSummary";
import { DashboardTabs } from "@/src/components/dashboard/tabs/DashboardTabs";
import { B2b2cMemberRecommendations } from "@/components/dashboard/B2b2cMemberRecommendations";
import { ArrowRight, FileQuestion, Sparkles, Crown } from "lucide-react";
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
  if (userRole === "ADMIN_B2B") redirect("/dashboard/rh");
  if (userRole === "ADMIN_B2B2C") redirect("/dashboard/b2b2c");
  if (userRole === "ADMIN_COLLECTIVITE") redirect("/dashboard/collectivites");
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

  try {
    const subscriptionTier = dbUser?.subscription || "FREEMIUM";
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

  const subscription = dbUser?.subscription || "FREEMIUM";
  const isPremium = subscription === "PREMIUM" || subscription === "PREMIUM_PLUS";

  const allPrescriptionItems = iqrh?.prescription?.items || [];
  const prescriptionItemsToDisplay = isPremium ? allPrescriptionItems : [
    ...allPrescriptionItems.filter((i: any) => i.kind === "RECOMMENDATION").slice(0, 3),
    ...allPrescriptionItems.filter((i: any) => i.kind === "MICRO_CHALLENGE").slice(0, 3)
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        {/* Blobs */}
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide">

          {/* Premium Hero Header */}
          <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>👋</span>
                <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>
                  Bonjour, <span style={{ color: "#94a3b8", fontWeight: 600 }}>{session.user.name?.split(" ")[0]}</span>
                </p>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 34, color: "#f8fafc", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Votre espace
                <span style={{
                  background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}> IQRH</span>
              </h1>
              <p style={{ fontSize: 13, color: "#334155", marginTop: 8 }}>
                Dernière mise à jour — {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            {/* Subscription Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isPremium ? (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(6,182,212,0.1) 100%)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  padding: "10px 18px", borderRadius: 14,
                }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>
                    {subscription === "PREMIUM_PLUS" ? "Premium+" : "Premium"}
                  </span>
                </div>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                  padding: "10px 18px", borderRadius: 14,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#475569" }}>Freemium</span>
                  <span style={{ color: "#334155", fontSize: 13 }}>—</span>
                  <Link href="/premium" style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>Passer à Premium →</Link>
                </div>
              )}
            </div>
          </div>

          {userRole === "MEMBER" && <B2b2cMemberRecommendations />}

          <GamificationSummary points={points} badges={badges} />

          <DashboardTabs data={data} isPremium={isPremium} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
        </div>
      </main>
    </>
  );
}
