import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Users, UserPlus, Check, X, ShieldAlert } from "lucide-react";
import { BinomeInviteForm } from "./BinomeInviteForm";
import { BinomeRespondButtons } from "./BinomeRespondButtons";
import { BinomeSettings } from "./BinomeSettings";
import { BinomeSuggest } from "./BinomeSuggest";

export const metadata = {
  title: "Binôme Relationnel — LinkOffice",
};

export default async function BinomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { matchingOptIn: true, subscription: true, campaignId: true, campaign: { select: { offer: true, status: true } } }
  });

  const isPremiumPlus = user?.campaign 
    ? (user.campaign.offer === "PREMIUM_PLUS" && user.campaign.status === "ACTIVE")
    : (user?.subscription === "PREMIUM_PLUS");

  if (!isPremiumPlus) {
    return (
      <>
        <Navbar />
        <main className="page-main">
          <div className="blob-violet" />
          <div className="page-container" style={{ maxWidth: 600, textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 64, height: 64, background: "rgba(124,58,237,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <ShieldAlert style={{ width: 32, height: 32, color: "#a78bfa" }} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 24, fontWeight: 700, color: "#f8fafc", marginBottom: 16 }}>
              Fonctionnalité Premium+
            </h1>
            <p style={{ color: "#94a3b8", fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Le programme Binôme Relationnel est réservé aux abonnés Premium+. Il vous permet de vous associer à un collègue de confiance pour partager vos défis et progresser ensemble.
            </p>
            <button style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
              fontWeight: 600, padding: "12px 28px", borderRadius: 14, border: "none", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)"
            }}>
              Découvrir Premium+
            </button>
          </div>
        </main>
      </>
    );
  }

  // 1. Fetch pending received invitations
  const pendingReceived = await prisma.relationalPair.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { initiator: true }
  });

  // 2. Fetch sent invitations
  const pendingSent = await prisma.relationalPair.findMany({
    where: { initiatorId: userId, status: "PENDING" },
    include: { receiver: true }
  });

  // 3. Fetch accepted pairs
  const acceptedPairs = await prisma.relationalPair.findMany({
    where: {
      OR: [
        { initiatorId: userId, status: "ACCEPTED" },
        { receiverId: userId, status: "ACCEPTED" }
      ]
    },
    include: { initiator: true, receiver: true }
  });

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container" style={{ maxWidth: 800 }}>
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: 24, height: 24, color: "#a78bfa" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "#f8fafc" }}>
                Binôme Relationnel
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 15, marginTop: 4 }}>
                Connectez-vous avec un partenaire pour partager vos défis et progresser ensemble.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <BinomeSettings initialOptIn={user?.matchingOptIn ?? false} />
            
            <BinomeSuggest optIn={user?.matchingOptIn ?? false} />

            {/* Formulaire d'invitation */}
            <div className="card">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus style={{ width: 18, height: 18, color: "#38bdf8" }} />
                Inviter un Binôme
              </h3>
              <BinomeInviteForm />
            </div>

            {/* Invitations reçues */}
            {pendingReceived.length > 0 && (
              <div className="card" style={{ borderColor: "rgba(251,191,36,0.3)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldAlert style={{ width: 18, height: 18, color: "#fbbf24" }} />
                  Invitations en attente
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pendingReceived.map(pair => (
                    <div key={pair.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 12 }}>
                      <div>
                        <p style={{ color: "#f8fafc", fontWeight: 500, fontSize: 15 }}>{pair.initiator.firstName} {pair.initiator.lastName}</p>
                        <p style={{ color: "#94a3b8", fontSize: 13 }}>{pair.initiator.email}</p>
                      </div>
                      <BinomeRespondButtons pairId={pair.id} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invitations envoyées */}
            {pendingSent.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16 }}>
                  Invitations envoyées
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {pendingSent.map(pair => (
                    <div key={pair.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12 }}>
                      <div>
                        <p style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 15 }}>{pair.receiver.firstName} {pair.receiver.lastName}</p>
                        <p style={{ color: "#64748b", fontSize: 13 }}>{pair.receiver.email}</p>
                      </div>
                      <span style={{ fontSize: 12, color: "#fbbf24", background: "rgba(251,191,36,0.1)", padding: "4px 10px", borderRadius: 999 }}>En attente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Binômes actifs */}
            {acceptedPairs.length > 0 && (
              <div className="card" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <Users style={{ width: 18, height: 18, color: "#34d399" }} />
                  Vos Binômes Actifs
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {acceptedPairs.map(pair => {
                    const partner = pair.initiatorId === userId ? pair.receiver : pair.initiator;
                    return (
                      <div key={pair.id} style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(16,185,129,0.05)", padding: 16, borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", color: "#064e3b", fontWeight: 700 }}>
                          {partner.firstName[0]}{partner.lastName[0]}
                        </div>
                        <div>
                          <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>{partner.firstName} {partner.lastName}</p>
                          <p style={{ color: "#34d399", fontSize: 13 }}>Partenaire de développement</p>
                        </div>
                        <button style={{ marginLeft: "auto", background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s" }}>
                          Voir le défi commun
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  );
}
