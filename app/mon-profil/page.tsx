import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { calculateLevel } from "@/lib/gamification";
import Link from "next/link";
import { SituationChangementButton } from "./SituationChangementButton";
import { ArrowLeft, ArrowRight, Trophy, Zap, Target, CheckCircle2, Shield } from "lucide-react";

export const metadata = {
  title: "Ma Progression — Link Office",
  description: "Vos statistiques et progression sur l'indice IQRH",
};

export const dynamic = 'force-dynamic';

export default async function MonProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userRole = session.user.role;
  if (userRole === "ADMIN_B2B") redirect("/dashboard/b2b");
  if (userRole === "ADMIN_B2B2C") redirect("/dashboard/b2b2c");
  if (userRole === "ADMIN_COLLECTIVITE" || userRole === "ADMIN_B2G") redirect("/dashboard/b2g");
  if (userRole === "SUPER_ADMIN") redirect("/dashboard/superadmin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { badges: { include: { badge: true } } }
  });

  if (!user) redirect("/auth/login");

  const { level, currentLevelXp, xpNeededForNextLevel, progressPercent, totalPoints } = calculateLevel(user.points);

  const completedChallenges = await prisma.prescriptionItem.findMany({
    where: { prescription: { userId: user.id }, status: "COMPLETED" },
    include: { libraryItem: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const totalCompletedChallenges = await prisma.prescriptionItem.count({
    where: { prescription: { userId: user.id }, status: "COMPLETED" },
  });

  const activePrescriptions = await prisma.relationalPrescription.count({
    where: { userId: user.id, status: "ACTIVE" },
  });

  const nextBadge = await prisma.badge.findFirst({
    where: { pointsRequired: { gt: user.points } },
    orderBy: { pointsRequired: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6 sm:py-10 animate-fade-in font-inter">
        <div className="space-y-7">
          
          {/* Header & Back Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E3EBE6] rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-jakarta font-bold bg-[#00A99D]/10 text-[#00A99D] border border-[#00A99D]/20">
                  <Trophy size={13} />
                  Gamification & Défis IQRH
                </span>
              </div>
              <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46] tracking-tight">
                Ma Progression
              </h1>
              <p className="text-xs sm:text-sm text-[#123D46]/70">
                Suivez votre évolution relationnelle, accumulez des points XP et relevez vos défis personnalisés.
              </p>
            </div>

            <div className="shrink-0 self-start sm:self-auto">
              <Link
                href="/dashboard"
                className="px-4 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:border-[#00A99D] hover:text-[#00A99D] hover:bg-[#FAF9F5] font-jakarta font-bold text-xs shadow-2xs inline-flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} className="text-[#00A99D]" />
                Retour au tableau de bord
              </Link>
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  ⭐
                </div>
                <div>
                  <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                    Niveau {level}
                  </h3>
                  <p className="text-xs text-[#00A99D] font-semibold mt-1">
                    Encore {Math.max(0, xpNeededForNextLevel - currentLevelXp)} XP pour atteindre le Niveau {level + 1}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-[#123D46]/50 block tracking-wider">
                  Points Totaux
                </span>
                <span className="font-jakarta font-extrabold text-3xl text-[#123D46] font-mono tabular-nums">
                  {totalPoints}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="w-full bg-[#E3EBE6] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00A99D] to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#123D46]/60 font-mono">
                <span>{currentLevelXp} XP</span>
                <span className="font-sans font-semibold text-[#123D46]/80">{progressPercent.toFixed(0)}% vers le niveau suivant</span>
                <span>{xpNeededForNextLevel} XP</span>
              </div>
            </div>
          </div>

          {/* Stat Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-6 rounded-3xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-xl shrink-0">
                <Zap size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                  Points Totaux
                </span>
                <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                  {totalPoints}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                  Défis Complétés
                </span>
                <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                  {totalCompletedChallenges}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center text-xl shrink-0">
                <Target size={22} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                  Plans & Ordonnances Actifs
                </span>
                <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                  {activePrescriptions}
                </span>
              </div>
            </div>
          </div>

          {/* Badges & Recent Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Badges */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4">
              <h4 className="font-jakarta font-bold text-base text-[#123D46] flex items-center gap-2">
                <Shield size={18} className="text-[#00A99D]" />
                <span>Badges Obtenus ({user.badges.length})</span>
              </h4>
              
              {user.badges.length > 0 ? (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {user.badges.map(ub => (
                    <div key={ub.id} className="p-3.5 rounded-2xl bg-[#00A99D]/10 border border-[#00A99D]/30 text-center space-y-1.5 shadow-2xs">
                      <span className="text-2xl block">{ub.badge.icon}</span>
                      <span className="text-[11px] font-jakarta font-bold text-[#00A99D] block leading-tight">{ub.badge.name}</span>
                    </div>
                  ))}
                  {nextBadge && (
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-dashed border-[#E3EBE6] text-center space-y-1 opacity-60 flex flex-col justify-center">
                      <span className="text-xl block">🔒</span>
                      <span className="text-[10px] font-bold text-[#123D46] block">{nextBadge.name}</span>
                      <span className="text-[9px] text-[#123D46]/60 block">{nextBadge.pointsRequired - user.points} pts requis</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] flex items-center justify-center mx-auto mb-3 text-2xl border border-[#E3EBE6]">
                    🏆
                  </div>
                  <p className="text-[#123D46]/70 text-xs leading-relaxed max-w-[80%] mx-auto">
                    Complétez des défis et réalisez vos bilans pour débloquer vos premiers badges d'excellence relationnelle !
                  </p>
                  {nextBadge && (
                    <p className="text-[#00A99D] text-xs mt-3 font-semibold">
                      Plus que {nextBadge.pointsRequired - user.points} points pour débloquer : {nextBadge.name}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Historique défis */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h4 className="font-jakarta font-bold text-base text-[#123D46] flex items-center gap-2">
                  <span>📋</span>
                  <span>Derniers défis réalisés</span>
                </h4>
                
                {completedChallenges.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {completedChallenges.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs space-y-1">
                        <div className="flex items-center justify-between text-emerald-700 font-bold">
                          <span>✓ {item.libraryItem.title}</span>
                          <span className="font-mono text-[10px] opacity-70">Complété</span>
                        </div>
                        <p className="text-[#123D46]/70 text-[11px] leading-relaxed">
                          {item.rationale.length > 90 ? item.rationale.substring(0, 90) + '…' : item.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#123D46]/70 text-xs mb-4">Aucun défi terminé pour le moment.</p>
                    <Link
                      href="/dashboard?tab=plan"
                      className="px-4 py-2 rounded-full border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white font-jakarta font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      Voir mon ordonnance & défis <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Situation personnelle / Changement de poste */}
          <SituationChangementButton />

        </div>
      </main>
    </>
  );
}
