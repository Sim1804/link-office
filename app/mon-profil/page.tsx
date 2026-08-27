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
  if (userRole === "ADMIN_COLLECTIVITE") redirect("/dashboard/collectivites");
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

  const activePrescriptions = await prisma.relationalPrescription.count({
    where: { userId: user.id, status: "ACTIVE" },
  });

  const stats = [
    { icon: Zap, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", label: "Points totaux", value: totalPoints },
    { icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", label: "Défis complétés", value: completedChallenges.length },
    { icon: Target, color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)", label: "Ordonnances actives", value: activePrescriptions },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide">
          {/* ── Hero Header ── */}
          <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <p style={{ fontSize: 15, color: "#64748b", fontWeight: 500 }}>Gamification & Défis</p>
              </div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 34, color: "#f8fafc", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                Ma{" "}
                <span style={{ background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Progression
                </span>
              </h1>
            </div>
            <Link href="/dashboard" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8", fontSize: 13, fontWeight: 500,
              padding: "10px 16px", borderRadius: 12, textDecoration: "none",
            }}>
              ← Retour au dashboard
            </Link>
          </div>

          {/* ── XP Hero Card ── */}
          <div style={{
            borderRadius: 24,
            background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.06) 100%)",
            border: "1px solid rgba(124,58,237,0.25)",
            padding: "28px 32px", marginBottom: 24,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, position: "relative" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(124,58,237,0.2)", border: "2px solid rgba(124,58,237,0.4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
                <Star size={30} style={{ color: "#a78bfa" }} />
              </div>
              <div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 26, color: "#f8fafc", marginBottom: 4 }}>
                  Niveau {level}
                </h2>
                <p style={{ color: "#64748b", fontSize: 14 }}>
                  Encore <strong style={{ color: "#a78bfa" }}>{xpNeededForNextLevel - currentLevelXp} XP</strong> pour le Niveau {level + 1}
                </p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, marginBottom: 4 }}>Points totaux</p>
                <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 800, fontSize: 32, background: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {totalPoints}
                </span>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{currentLevelXp} XP</span>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{xpNeededForNextLevel} XP</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPercent}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)", borderRadius: 999, boxShadow: "0 0 12px rgba(124,58,237,0.5)", transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 12, color: "#475569" }}>{progressPercent.toFixed(0)}% vers le niveau suivant</span>
              </div>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            {stats.map(({ icon: Icon, color, bg, border, label, value }) => (
              <div key={label} style={{ borderRadius: 20, background: "linear-gradient(145deg, rgba(17,24,39,0.98), rgba(17,24,39,0.7))", border: `1px solid ${border}`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: "#475569", marginBottom: 4, fontWeight: 500 }}>{label}</p>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 26, fontWeight: 800, color }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Badges & Défis ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Badges */}
            <div style={{ borderRadius: 24, border: "1px solid rgba(124,58,237,0.15)", background: "linear-gradient(145deg, rgba(17,24,39,0.98), rgba(30,14,60,0.2))", padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={18} style={{ color: "#a78bfa" }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>Badges obtenus</h3>
                <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 600, color: "#a78bfa", background: "rgba(124,58,237,0.1)", padding: "2px 10px", borderRadius: 999, border: "1px solid rgba(124,58,237,0.2)" }}>
                  {user.badges.length}
                </span>
              </div>
              {user.badges.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 16 }}>
                  {user.badges.map(ub => (
                    <div key={ub.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                      <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                        {ub.badge.icon}
                      </div>
                      <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500, lineHeight: 1.2 }}>{ub.badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Trophy size={24} style={{ color: "#334155" }} />
                  </div>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>Complétez des défis pour débloquer vos premiers badges !</p>
                </div>
              )}
            </div>

            {/* Historique défis */}
            <div style={{ borderRadius: 24, border: "1px solid rgba(52,211,153,0.15)", background: "linear-gradient(145deg, rgba(17,24,39,0.98), rgba(6,46,30,0.2))", padding: 28 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle size={18} style={{ color: "#34d399" }} />
                </div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>Derniers défis réalisés</h3>
              </div>
              {completedChallenges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completedChallenges.map(item => (
                    <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: "2px solid #34d399", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(52,211,153,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle size={14} style={{ color: "#34d399" }} />
                      </div>
                      <div>
                        <h4 style={{ color: "#f8fafc", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.libraryItem.title}</h4>
                        <p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{item.rationale.substring(0, 70)}…</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <p style={{ color: "#64748b", fontSize: 14, marginBottom: 12 }}>Aucun défi terminé pour le moment.</p>
                  <Link href="/dashboard" style={{ color: "#a78bfa", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
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
