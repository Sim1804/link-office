import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Users, UserPlus, Crown, Lock, Clock, Handshake, Sparkles } from "lucide-react";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { BinomeInviteForm } from "./BinomeInviteForm";
import { BinomeRespondButtons } from "./BinomeRespondButtons";
import { BinomeSettings } from "./BinomeSettings";
import { BinomeSuggest } from "./BinomeSuggest";
import { BinomeDiscovery } from "./BinomeDiscovery";
import { BinomePreferencesForm } from "./BinomePreferencesForm";
import { ActiveBinomeDashboard } from "./ActiveBinomeDashboard";

export const metadata = {
  title: "Binôme Relationnel — LinkOffice",
  description: "Connectez-vous avec un partenaire de développement pour progresser ensemble.",
};

// Rôles autorisés — cohérent avec les guards API
const BINOME_ALLOWED_ROLES = ["EMPLOYEE", "SUPER_ADMIN"];

export default async function BinomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      matchingOptIn: true,
      subscription: true,
      campaignId: true,
      campaign: { select: { offer: true, status: true } },
      binomePreference: true,
    },
  });

  // Guard rôle — MEMBER et CITIZEN exclus
  const roleAllowed = BINOME_ALLOWED_ROLES.includes(user?.role ?? "");

  const isPremium = user?.campaign
    ? (user.campaign.offer === "PREMIUM_PLUS" || user.campaign.offer === "PREMIUM") && user.campaign.status === "ACTIVE"
    : (user?.subscription === "PREMIUM_PLUS" || user?.subscription === "PREMIUM");

  // Écran de refus unifié (rôle non autorisé OU pas Premium)
  if (!roleAllowed || !isPremium) {
    const isRoleIssue = !roleAllowed;
    return (
      <>
        <Navbar />
        <main className="page-main">
          <div className="blob-violet" />
          <div className="page-container" style={{ maxWidth: 560, textAlign: "center", paddingTop: 80 }}>
            {/* Icon */}
            <div style={{
              width: 80, height: 80,
              background: "linear-gradient(135deg, rgba(0,169,157,0.15), rgba(109,40,217,0.08))",
              borderRadius: 24,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
              border: "1px solid rgba(0,169,157,0.2)",
              boxShadow: "0 0 48px rgba(0,169,157,0.15)",
            }}>
              {isRoleIssue
                ? <Lock style={{ width: 36, height: 36, color: "var(--primary)" }} />
                : <Crown style={{ width: 36, height: 36, color: "var(--primary)" }} />
              }
            </div>

            <PremiumBadge style={{ marginBottom: 16 }} />

            <h1 style={{
              fontSize: 26, fontWeight: 800, color: "var(--text-1)",
              marginBottom: 14, lineHeight: 1.2,
            }}>
              {isRoleIssue ? "Fonctionnalité non disponible" : "Passez à Premium"}
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              {isRoleIssue
                ? "Le programme Binôme Relationnel est réservé aux utilisateurs individuels (particuliers) disposant d'un abonnement Premium. Les comptes mutuelle et collectivité n'ont pas accès à cette fonctionnalité."
                : "Le programme Binôme Relationnel vous permet de vous associer à un collègue de confiance pour partager vos défis et progresser ensemble sur vos dimensions relationnelles."}
            </p>

            {!isRoleIssue && (
              <a
                href="/premium"
                className="btn btn-primary btn-md"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  borderRadius: 999, padding: "14px 32px", fontSize: 15,
                  textDecoration: "none"
                }}
              >
                <Crown size={18} />
                Découvrir Premium
              </a>
            )}
          </div>
        </main>
      </>
    );
  }

  // Fetch data
  const [pendingReceived, pendingSent, acceptedPairs] = await Promise.all([
    prisma.binomeSuggestion.findMany({
      where: { userBId: userId, responseB: "PENDING" },
      include: { userA: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { suggestionDate: "desc" },
    }),
    prisma.binomeSuggestion.findMany({
      where: { userAId: userId, responseA: "ACCEPTED", responseB: "PENDING" },
      include: { userB: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { suggestionDate: "desc" },
    }),
    prisma.binome.findMany({
      where: {
        OR: [
          { userAId: userId, status: "ACTIVE" },
          { userBId: userId, status: "ACTIVE" },
        ],
      },
      include: {
        userA: { select: { id: true, firstName: true, lastName: true } },
        userB: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const totalNotifs = pendingReceived.length;
  const avatarColors = ["#a855f7", "var(--primary)", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container" style={{ maxWidth: 820 }}>

          {/* ── Hero Header ── */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <PremiumBadge />
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{
                  fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                  fontWeight: 800, fontSize: 32, color: "var(--text-1)",
                  letterSpacing: "-0.02em", lineHeight: 1.1, margin: "0 0 10px",
                }}>
                  Binôme{" "}
                  <span style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>
                    Relationnel
                  </span>
                </h1>
                <p style={{ color: "var(--text-3)", fontSize: 15, margin: 0 }}>
                  Progressez ensemble sur vos dimensions relationnelles
                </p>
              </div>

              {/* Stats rapides */}
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "Actifs", value: acceptedPairs.length, color: "var(--primary)" },
                  { label: "En attente", value: totalNotifs, color: "var(--text-2)" },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "12px 20px",
                    textAlign: "center",
                    minWidth: 72,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 24 }}>

            {/* ── 0. State Management (Discovery / Preferences / Dashboard) ── */}
            {acceptedPairs.length > 0 ? (
               <ActiveBinomeDashboard 
                  binome={acceptedPairs[0]} 
                  currentUserId={userId} 
               />
            ) : !user?.binomePreference ? (
               <BinomeDiscovery />
            ) : (user.binomePreference.expectations?.length || 0) === 0 ? (
               <BinomePreferencesForm initialData={user.binomePreference} />
            ) : (
              <>
                {/* ── 1. Paramètre IRIS ── */}
                <BinomeSettings initialOptIn={user.matchingOptIn} />

                {/* ── 2. Suggestions IRIS ── */}
                <BinomeSuggest optIn={user.matchingOptIn} />

            {/* ── 3. Invitations reçues (en attente) ── */}
            {pendingReceived.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#f59e0b",
                    boxShadow: "0 0 8px #f59e0b",
                  }} />
                  <h2 style={{ color: "var(--text-1)", fontSize: 15, fontWeight: 700, margin: 0 }}>
                    Invitations reçues
                    <span style={{
                      marginLeft: 8, fontSize: 12, fontWeight: 700,
                      background: "rgba(251,191,36,0.12)",
                      color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)",
                      padding: "2px 8px", borderRadius: 999,
                    }}>
                      {pendingReceived.length}
                    </span>
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pendingReceived.map((pair, i) => {
                    const p = pair.userA;
                    const initial = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                    const color = avatarColors[i % avatarColors.length];
                    return (
                      <div key={pair.id} style={{
                        display: "flex", alignItems: "center", gap: 16,
                        background: "linear-gradient(135deg, rgba(251,191,36,0.05) 0%, var(--surface) 100%)",
                        border: "1px solid rgba(251,191,36,0.15)",
                        padding: "16px 20px", borderRadius: 16,
                        flexWrap: "wrap",
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: "50%",
                          background: `${color}20`,
                          border: `2px solid ${color}50`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color, fontWeight: 700, fontSize: 16, flexShrink: 0,
                        }}>
                          {initial}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15, margin: "0 0 2px" }}>
                            {p.firstName} {p.lastName}
                          </p>
                          <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>{p.email}</p>
                        </div>
                        <BinomeRespondButtons pairId={pair.id} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── 4. Invitation manuelle ── */}
            <section style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "24px 28px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(56,189,248,0.12)",
                  border: "1px solid rgba(56,189,248,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserPlus size={18} style={{ color: "#38bdf8" }} />
                </div>
                <div>
                  <h2 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 15, margin: "0 0 2px" }}>
                    Inviter par email
                  </h2>
                  <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                    Invitez directement un collègue ou ami Premium
                  </p>
                </div>
              </div>
              <BinomeInviteForm />
            </section>

            {/* ── 5. Invitations envoyées ── */}
            {pendingSent.length > 0 && (
              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <Clock size={14} style={{ color: "var(--text-2)" }} />
                  <h2 style={{ color: "var(--text-2)", fontSize: 14, fontWeight: 600, margin: 0 }}>
                    Invitations envoyées
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pendingSent.map((pair, i) => {
                    const p = pair.userB;
                    const initial = `${p.firstName[0]}${p.lastName[0]}`.toUpperCase();
                    const color = avatarColors[i % avatarColors.length];
                    return (
                      <div key={pair.id} style={{
                        display: "flex", alignItems: "center", gap: 14,
                        background: "var(--surface)",
                        border: "1px solid rgba(18,61,70,0.05)",
                        padding: "14px 18px", borderRadius: 14,
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: `${color}15`,
                          border: `1px solid ${color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color, fontWeight: 700, fontSize: 14, flexShrink: 0,
                        }}>
                          {initial}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ color: "var(--text-1)", fontWeight: 500, fontSize: 14, margin: "0 0 2px" }}>
                            {p.firstName} {p.lastName}
                          </p>
                          <p style={{ color: "var(--text-2)", fontSize: 12, margin: 0 }}>{p.email}</p>
                        </div>
                        <span style={{
                          fontSize: 12, fontWeight: 600, color: "#f59e0b",
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.2)",
                          padding: "4px 10px", borderRadius: 8,
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <Clock size={11} />
                          En attente
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── État vide (aucune invitation ni binôme) ── */}
            {pendingReceived.length === 0 && pendingSent.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "48px 32px",
                background: "var(--surface)",
                border: "1px dashed var(--border)",
                borderRadius: 20,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "rgba(0,169,157,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 16px",
                }}>
                  <Users size={26} style={{ color: "var(--primary)" }} />
                </div>
                <p style={{ color: "var(--text-3)", fontSize: 15, margin: "0 0 6px", fontWeight: 600 }}>
                  Aucun binôme pour le moment
                </p>
                <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>
                  Activez les suggestions IRIS ou invitez directement un collègue pour commencer.
                </p>
              </div>
            )}

            </>
            )}

          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      </main>
    </>
  );
}
