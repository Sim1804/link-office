import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Crown, Lock } from "lucide-react";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";
import { BinomeTabsView } from "./BinomeTabsView";

export const metadata = {
  title: "Binôme Relationnel — Link Office",
  description: "Connectez-vous avec un partenaire de développement pour progresser ensemble.",
};

// Rôles autorisés — cohérent avec les guards API
const BINOME_ALLOWED_ROLES = ["CITIZEN", "MEMBER", "EMPLOYEE", "SUPER_ADMIN"];

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
      campaign: { select: { offer: true, status: true, endDate: true } },
      binomePreference: true,
    },
  });

  // Guard rôle — MEMBER et CITIZEN exclus
  const roleAllowed = BINOME_ALLOWED_ROLES.includes(user?.role ?? "");

  const isCampaignOngoing = (c: { status: string; endDate: Date | null } | null | undefined) =>
    !!c && (
      c.status === "ACTIVE" ||
      c.status === "EN_CLOTURE" ||
      (c.status === "CLOSED" && (!c.endDate || new Date(c.endDate) >= new Date()))
    );

  const isPremiumPlus =
    user?.subscription === "PREMIUM_PLUS" ||
    (user?.campaign?.offer === "PREMIUM_PLUS" && isCampaignOngoing(user.campaign));

  const isPremium =
    user?.subscription === "PREMIUM" ||
    user?.subscription === "PREMIUM_PLUS" ||
    ((user?.campaign?.offer === "PREMIUM" || user?.campaign?.offer === "PREMIUM_PLUS") && isCampaignOngoing(user?.campaign));

  // Écran de refus unifié (rôle non autorisé OU pas Premium+)
  if (!roleAllowed || !isPremiumPlus) {
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

            <SubscriptionBadge tier="PREMIUM_PLUS" size="md" style={{ marginBottom: 16 }} />

            <h1 style={{
              fontSize: 26, fontWeight: 800, color: "var(--text-1)",
              marginBottom: 14, lineHeight: 1.2,
            }}>
              {isRoleIssue ? "Fonctionnalité non disponible" : isPremium ? "Passez à Premium+" : "Découvrez Premium+"}
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              {isRoleIssue
                ? "Le programme Binôme Relationnel est réservé aux bénéficiaires de la plateforme (Particuliers, Employés). Les comptes administrateurs spécifiques (B2B, B2G) n'y accèdent pas de cette manière."
                : `Le programme Binôme Relationnel est une exclusivité Premium+. ${isPremium ? "Passez à l'offre supérieure" : "Rejoignez Premium+"} pour vous associer à un collègue de confiance, partager vos défis et progresser ensemble.`}
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
                {isPremium ? "Passer à Premium+" : "Découvrir Premium+"}
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
        checkins: { orderBy: { date: "desc" } },
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
        <div className="page-container" style={{ maxWidth: 840 }}>

          {/* ── Hero Header ── */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <SubscriptionBadge tier="PREMIUM_PLUS" size="sm" />
            </div>

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
          </div>

          {/* ── Vue Interactive avec Onglets (Actif, En attente, Découverte) ── */}
          <BinomeTabsView
            currentUserId={userId}
            acceptedPairs={acceptedPairs}
            pendingReceived={pendingReceived}
            pendingSent={pendingSent}
            matchingOptIn={user.matchingOptIn}
            binomePreference={user.binomePreference}
            avatarColors={avatarColors}
          />
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeSlideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        `}</style>
      </main>
    </>
  );
}
