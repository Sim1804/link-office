import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { calculateLevel } from "@/lib/gamification";
import { Trophy, Star, Target, CheckCircle, Zap, Shield } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Ma Progression — LinkOffice",
  description: "Vos statistiques et progression sur l'indice IQRH",
};

export const dynamic = 'force-dynamic';

export default async function MonProfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  // Redirection des admins car la gamification ne les concerne pas directement (sauf s'ils veulent jouer, mais on garde la séparation stricte)
  const userRole = session.user.role;
  if (userRole === "ADMIN_B2B") redirect("/dashboard/b2b");
  if (userRole === "ADMIN_B2B2C") redirect("/dashboard/b2b2c");
  if (userRole === "ADMIN_COLLECTIVITE") redirect("/dashboard/collectivites");
  if (userRole === "SUPER_ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      badges: {
        include: { badge: true }
      }
    }
  });

  if (!user) redirect("/auth/login");

  const { level, currentLevelXp, xpNeededForNextLevel, progressPercent, totalPoints } = calculateLevel(user.points);

  const completedChallenges = await prisma.prescriptionItem.findMany({
    where: {
      prescription: { userId: user.id },
      status: "COMPLETED"
    },
    include: {
      libraryItem: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  const activePrescriptions = await prisma.relationalPrescription.count({
    where: { userId: user.id, status: "ACTIVE" }
  });

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container-wide">
          {/* Header (Aligné avec Dashboard) */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 14, color: "#475569", marginBottom: 4 }}>
              Gamification & Défis
            </p>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 30, color: "#f8fafc" }}>
              Ma Progression
            </h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
            
            {/* XP Gauge Card */}
            <div className="card" style={{ gridColumn: "1 / -1", background: "linear-gradient(135deg, rgba(26, 34, 54, 0.9) 0%, rgba(124, 58, 237, 0.1) 100%)", border: "1px solid rgba(124, 58, 237, 0.3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(124, 58, 237, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(124, 58, 237, 0.5)" }}>
                  <Star style={{ width: 28, height: 28, color: "#a78bfa" }} />
                </div>
                <div>
                  <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc", margin: 0 }}>
                    Niveau {level}
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>
                    Encore <strong style={{ color: "#f8fafc" }}>{xpNeededForNextLevel - currentLevelXp} XP</strong> pour atteindre le Niveau {level + 1}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ position: "relative", height: 12, background: "rgba(0,0,0,0.3)", borderRadius: 999, overflow: "hidden", marginBottom: 12 }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${progressPercent}%`,
                  background: "linear-gradient(90deg, #7c3aed 0%, #06b6d4 100%)",
                  borderRadius: 999,
                  boxShadow: "0 0 12px rgba(124,58,237,0.5)",
                  transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)"
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                <span>{currentLevelXp} XP</span>
                <span>{xpNeededForNextLevel} XP</span>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(245, 158, 11, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap style={{ width: 24, height: 24, color: "#f59e0b" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Points totaux</p>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{totalPoints}</div>
              </div>
            </div>

            <div className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle style={{ width: 24, height: 24, color: "#34d399" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Défis complétés</p>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{completedChallenges.length}</div>
              </div>
            </div>

            <div className="card card-hover" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(6, 182, 212, 0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Target style={{ width: 24, height: 24, color: "#06b6d4" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Ordonnances actives</p>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc" }}>{activePrescriptions}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            
            {/* Badges Section */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <Shield style={{ width: 20, height: 20, color: "#a78bfa" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 18, color: "#f8fafc" }}>
                  Badges obtenus
                </h3>
              </div>
              
              {user.badges.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 16 }}>
                  {user.badges.map(ub => (
                    <div key={ub.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                        {ub.badge.icon}
                      </div>
                      <span style={{ fontSize: 12, color: "#f8fafc", fontWeight: 500, lineHeight: 1.2 }}>{ub.badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Trophy style={{ width: 24, height: 24, color: "#64748b" }} />
                  </div>
                  <p style={{ color: "#94a3b8", fontSize: 14 }}>Vous n'avez pas encore débloqué de badge.</p>
                  <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Complétez des défis pour en obtenir !</p>
                </div>
              )}
            </div>

            {/* Historique des défis */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <CheckCircle style={{ width: 20, height: 20, color: "#34d399" }} />
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 18, color: "#f8fafc" }}>
                  Derniers défis réalisés
                </h3>
              </div>

              {completedChallenges.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {completedChallenges.map(item => (
                    <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52, 211, 153, 0.15)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CheckCircle style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <h4 style={{ color: "#f8fafc", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.libraryItem.title}</h4>
                        <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
                          {item.rationale.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun défi terminé pour le moment.</p>
                  <Link href="/dashboard" style={{ display: "inline-block", marginTop: 12, color: "#a78bfa", fontSize: 14, fontWeight: 500 }}>
                    Voir mon ordonnance relationnelle →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
