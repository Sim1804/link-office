import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { calculateLevel } from "@/lib/gamification";
import { Trophy, Star, Target, CheckCircle, Zap, Shield } from "lucide-react";
import Link from "next/link";
import { SituationChangementButton } from "./SituationChangementButton";

export const metadata = {
  title: "Ma Progression — LinkOffice",
  description: "Vos statistiques et progression sur l'indice IQRH",
};

export const dynamic = 'force-dynamic';

export default async function MonProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userRole = session.user.role;
  if (userRole === "ADMIN_B2B") redirect("/dashboard/b2b");
  if (userRole === "ADMIN_B2B2C") redirect("/dashboard/b2b2c");
  if (userRole === "ADMIN_B2G") redirect("/dashboard/b2g");
  if (userRole === "SUPER_ADMIN") redirect("/admin");

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

  const stats = [
    { icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", label: "Points totaux", value: totalPoints },
    { icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", label: "Défis complétés", value: totalCompletedChallenges },
    { icon: Target, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)", label: "Plans actifs", value: activePrescriptions },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-container-wide">
          {/* ── Hero Header ── */}
          <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <p style={{ fontSize: 15, color: "var(--text-3)", fontWeight: 500 }}>Gamification & Défis</p>
              </div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 34, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Ma Progression
              </h1>
            </div>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "transparent", border: "none",
              color: "var(--text-2)", fontSize: 14, fontWeight: 500,
              padding: "8px 12px", borderRadius: 999, textDecoration: "none",
              transition: "all 0.2s"
            }}>
              ← Retour au dashboard
            </Link>
          </div>

          {/* ── XP Hero Card ── */}
          <div className="card" style={{
            padding: "28px 32px", marginBottom: 24,
            position: "relative", overflow: "hidden",
            borderLeft: "3px solid #7c3aed"
          }}>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={30} color="var(--text-2)" />
              </div>
              <div>
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 26, color: "var(--text-1)", marginBottom: 4 }}>
                  Niveau {level}
                </h2>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>
                  Encore <strong style={{ color: "var(--primary)" }}>{xpNeededForNextLevel - currentLevelXp} XP</strong> pour le Niveau {level + 1}
                </p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>Points totaux</p>
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: 32, color: "var(--text-1)" }}>
                  {totalPoints}
                </span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{currentLevelXp} XP</span>
                <span style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 600 }}>{xpNeededForNextLevel} XP</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "var(--surface-2)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPercent}%`, background: "var(--primary)", borderRadius: 4, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{progressPercent.toFixed(0)}% vers le niveau suivant</span>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {stats.map(({ icon: Icon, color, bg, border, label, value }) => (
              <div key={label} className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color="var(--text-2)" />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 4, fontWeight: 500 }}>{label}</p>
                  <div style={{ fontFamily: "Inter, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Badges & Défis ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Badges */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={16} color="var(--text-2)" />
                </div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>Badges obtenus</h3>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "var(--text-2)", background: "rgba(18,61,70,0.05)", padding: "2px 8px", borderRadius: 4, border: "1px solid var(--border)" }}>
                  {user.badges.length}
                </span>
              </div>
              {user.badges.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 16 }}>
                  {user.badges.map(ub => (
                    <div key={ub.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 8, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                        {ub.badge.icon}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, lineHeight: 1.2 }}>{ub.badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--surface)", border: "1px solid var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Trophy size={24} style={{ color: "var(--text-3)" }} />
                  </div>
                  <p style={{ color: "var(--text-3)", fontSize: 14, lineHeight: 1.6 }}>
                    Complétez des défis pour débloquer vos premiers badges !
                  </p>
                  {nextBadge && (
                    <p style={{ color: "var(--primary)", fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                      Plus que {nextBadge.pointsRequired - user.points} points pour le badge : {nextBadge.name}.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Historique défis */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={16} color="var(--text-2)" />
                </div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text-1)" }}>Derniers défis réalisés</h3>
              </div>
              {completedChallenges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completedChallenges.map(item => (
                    <div key={item.id} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderLeft: "3px solid var(--border-strong)", borderRadius: 6, padding: "12px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 24, height: 24, borderRadius: 4, background: "rgba(18,61,70,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle size={14} color="var(--text-2)" />
                      </div>
                      <div>
                        <h4 style={{ color: "var(--text-1)", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.libraryItem.title}</h4>
                        <p style={{ color: "var(--text-3)", fontSize: 12, lineHeight: 1.5 }}>{item.rationale.substring(0, 70)}…</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 12 }}>Aucun défi terminé pour le moment.</p>
                  <Link href="/dashboard" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                    Voir mon ordonnance →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <SituationChangementButton />
        </div>
      </main>
    </>
  );
}
