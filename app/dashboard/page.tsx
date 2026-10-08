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
  if (userRole === "ADMIN_COLLECTIVITE" || userRole === "ADMIN_B2G") redirect("/dashboard/b2g");
  if (userRole === "SUPER_ADMIN") redirect("/dashboard/superadmin");

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
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-col items-center justify-center pt-16 sm:pt-24 pb-16">
          <div className="w-full max-w-lg text-center bg-white border border-[#E3EBE6] rounded-3xl p-8 sm:p-12 shadow-sm">
            {/* Empty State Hero */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#00A99D]/10 to-indigo-50 border border-[#00A99D]/20 flex items-center justify-center mb-8 shadow-xs">
              <Activity className="w-10 h-10 text-[#00A99D]" />
            </div>
            <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46] tracking-tight mb-4 leading-tight">
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[15px] text-[#123D46]/80 font-medium mb-2">
              Votre espace IQRH est prêt.
            </p>
            <p className="text-[14px] text-[#123D46]/60 mb-10 leading-relaxed max-w-md mx-auto">
              Passez votre première évaluation pour découvrir votre profil de santé relationnelle et obtenir vos recommandations personnalisées.
            </p>
            <Link href="/consentement" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-[15px] font-bold transition-all shadow-md w-full sm:w-auto">
              Commencer mon évaluation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs font-medium text-[#123D46]/50 mt-6 flex items-center justify-center gap-3">
              <span>✓ Anonyme</span>
              <span>✓ Sécurisé</span>
              <span>✓ ~8 à 10 minutes</span>
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
    <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] font-inter flex flex-col relative pb-16">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-10 animate-fade-in">
        
        {/* ── Hero Header ── */}
        <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
          
          {/* Ligne 1 : Score + Greeting + Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-5">
            
            {/* Left: Overall Health Ring + Greeting */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 w-16 h-16">
                <svg width="64" height="64" className="-rotate-90">
                  <circle cx="32" cy="32" r="27" fill="none" stroke="#F4F1E8" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="27" fill="none"
                    stroke={scoreColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 169.6} 169.6`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-jakarta font-extrabold text-base leading-none" style={{ color: scoreColor }}>{score}</span>
                  <span className="text-[8px] font-bold text-[#123D46]/50">/100</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-[#123D46]/60 mb-0.5">
                  Bonjour, {session.user.name?.split(" ")[0]} 👋
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-jakarta font-extrabold text-lg text-[#123D46] tracking-tight leading-tight m-0">
                    Votre espace IQRH
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-jakarta font-semibold border" style={{ background: `${scoreColor}10`, borderColor: `${scoreColor}20`, color: scoreColor }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreColor }} />
                    <span>{scoreLabel}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Gamification Summary */}
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 shrink-0">
              <GamificationSummary points={points} badges={badges} />
            </div>
          </div>

          {/* Ligne 2 : Météo du jour */}
          <MeteoWidget />

          </div>

          {userRole === "MEMBER" && <B2b2cMemberRecommendations />}

          {/* ── Dashboard Tabs ── */}
          <DashboardTabs data={data} isPremium={isPremium} isPremiumPlus={isPremiumPlus} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />

      </main>
    </div>
  );
}
