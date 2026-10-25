"use client";

import { useState } from "react";
import { Handshake, Clock, Sparkles, Inbox, Send, UserPlus, CheckCircle2 } from "lucide-react";
import { ActiveBinomeDashboard } from "./ActiveBinomeDashboard";
import { BinomeInviteForm } from "./BinomeInviteForm";
import { BinomeRespondButtons } from "./BinomeRespondButtons";
import { BinomeSettings } from "./BinomeSettings";
import { BinomeSuggest } from "./BinomeSuggest";
import { BinomeDiscovery } from "./BinomeDiscovery";
import { BinomePreferencesForm } from "./BinomePreferencesForm";

interface BinomeTabsViewProps {
  currentUserId: string;
  acceptedPairs: any[];
  pendingReceived: any[];
  pendingSent: any[];
  matchingOptIn: boolean;
  binomePreference: any;
  avatarColors: string[];
}

export function BinomeTabsView({
  currentUserId,
  acceptedPairs,
  pendingReceived,
  pendingSent,
  matchingOptIn,
  binomePreference,
  avatarColors,
}: BinomeTabsViewProps) {
  const [activeTab, setActiveTab] = useState<"active" | "pending" | "explore">(() => {
    if (acceptedPairs.length > 0) return "active";
    if (pendingReceived.length > 0 || pendingSent.length > 0) return "pending";
    return "explore";
  });

  const totalPending = pendingReceived.length + pendingSent.length;
  const hasActiveBinome = acceptedPairs.length > 0;

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* ── Cartes de statistiques rapides interactives ── */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        {hasActiveBinome && (
          <button
            onClick={() => setActiveTab("active")}
            style={{
              background: activeTab === "active" ? "rgba(0,169,157,0.12)" : "var(--surface)",
              border: `1px solid ${activeTab === "active" ? "var(--primary)" : "var(--border)"}`,
              borderRadius: 14,
              padding: "12px 20px",
              textAlign: "center",
              minWidth: 84,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="Afficher votre binôme actif"
          >
            <div style={{ fontSize: 22, fontWeight: 800, color: "var(--primary)" }}>
              {acceptedPairs.length}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
              Actif{acceptedPairs.length > 1 ? "s" : ""}
            </div>
          </button>
        )}

        <button
          onClick={() => setActiveTab("pending")}
          style={{
            background: activeTab === "pending" ? "rgba(245,158,11,0.12)" : "var(--surface)",
            border: `1px solid ${activeTab === "pending" ? "#f59e0b" : "var(--border)"}`,
            borderRadius: 14,
            padding: "12px 20px",
            textAlign: "center",
            minWidth: 84,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          title="Voir les demandes et invitations en attente"
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: totalPending > 0 ? "#f59e0b" : "var(--text-2)" }}>
            {totalPending}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            {totalPending > 0 && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />}
            En attente
          </div>
        </button>
      </div>

      {/* ── Barre d'onglets de navigation ── */}
      <div style={{
        display: "flex",
        gap: 8,
        borderBottom: "1px solid var(--border)",
        paddingBottom: 4,
        overflowX: "auto",
      }}>
        {hasActiveBinome && (
          <button
            onClick={() => setActiveTab("active")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: activeTab === "active" ? "var(--surface)" : "transparent",
              color: activeTab === "active" ? "var(--primary)" : "var(--text-2)",
              fontWeight: activeTab === "active" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
              borderBottom: activeTab === "active" ? "2px solid var(--primary)" : "2px solid transparent",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            <Handshake size={16} />
            Mon Binôme Actif
            <span style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(0,169,157,0.12)",
              color: "var(--primary)",
              fontWeight: 700,
            }}>
              1
            </span>
          </button>
        )}

        <button
          onClick={() => setActiveTab("pending")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: "10px 10px 0 0",
            border: "none",
            background: activeTab === "pending" ? "var(--surface)" : "transparent",
            color: activeTab === "pending" ? "var(--text-1)" : "var(--text-2)",
            fontWeight: activeTab === "pending" ? 700 : 500,
            fontSize: 14,
            cursor: "pointer",
            borderBottom: activeTab === "pending" ? "2px solid #f59e0b" : "2px solid transparent",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          <Clock size={16} />
          Invitations & En attente
          {totalPending > 0 ? (
            <span style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "rgba(245,158,11,0.15)",
              color: "#f59e0b",
              fontWeight: 700,
            }}>
              {totalPending}
            </span>
          ) : (
            <span style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--surface-2)",
              color: "var(--text-3)",
              fontWeight: 600,
            }}>
              0
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("explore")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: "10px 10px 0 0",
            border: "none",
            background: activeTab === "explore" ? "var(--surface)" : "transparent",
            color: activeTab === "explore" ? "var(--text-1)" : "var(--text-2)",
            fontWeight: activeTab === "explore" ? 700 : 500,
            fontSize: 14,
            cursor: "pointer",
            borderBottom: activeTab === "explore" ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          <Sparkles size={16} />
          Découvrir & Suggestions IRIS
        </button>
      </div>

      {/* ── Contenu de l'onglet actif ── */}
      {activeTab === "active" && hasActiveBinome && (
        <ActiveBinomeDashboard
          binome={acceptedPairs[0]}
          currentUserId={currentUserId}
        />
      )}

      {activeTab === "pending" && (
        <div style={{ display: "grid", gap: 24 }}>
          {/* 1. Invitations reçues */}
          <section style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "24px 28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Inbox size={18} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <h2 style={{ color: "var(--text-1)", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Invitations reçues
                  <span style={{
                    marginLeft: 8, fontSize: 12, fontWeight: 700,
                    background: pendingReceived.length > 0 ? "rgba(245,158,11,0.15)" : "var(--surface-2)",
                    color: pendingReceived.length > 0 ? "#f59e0b" : "var(--text-3)",
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    {pendingReceived.length}
                  </span>
                </h2>
                <p style={{ color: "var(--text-3)", fontSize: 13, margin: "2px 0 0" }}>
                  Collègues souhaitant s'associer avec vous
                </p>
              </div>
            </div>

            {pendingReceived.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {pendingReceived.map((pair, i) => {
                  const p = pair.userA;
                  const initial = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <div key={pair.id} style={{
                      display: "flex", alignItems: "center", gap: 16,
                      background: "linear-gradient(135deg, rgba(251,191,36,0.05) 0%, var(--surface) 100%)",
                      border: "1px solid rgba(251,191,36,0.2)",
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
            ) : (
              <div style={{
                background: "var(--bg)",
                border: "1px dashed var(--border)",
                borderRadius: 14,
                padding: "24px",
                textAlign: "center",
              }}>
                <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>
                  Aucune invitation en attente reçue. Lorsque des collègues vous inviteront, ils apparaîtront ici.
                </p>
              </div>
            )}
          </section>

          {/* 2. Invitations envoyées */}
          <section style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "24px 28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "rgba(56,189,248,0.12)",
                border: "1px solid rgba(56,189,248,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Send size={18} style={{ color: "#38bdf8" }} />
              </div>
              <div>
                <h2 style={{ color: "var(--text-1)", fontSize: 16, fontWeight: 700, margin: 0 }}>
                  Invitations envoyées
                  <span style={{
                    marginLeft: 8, fontSize: 12, fontWeight: 700,
                    background: pendingSent.length > 0 ? "rgba(56,189,248,0.15)" : "var(--surface-2)",
                    color: pendingSent.length > 0 ? "#38bdf8" : "var(--text-3)",
                    padding: "2px 8px", borderRadius: 999,
                  }}>
                    {pendingSent.length}
                  </span>
                </h2>
                <p style={{ color: "var(--text-3)", fontSize: 13, margin: "2px 0 0" }}>
                  Demandes en attente de réponse de vos collègues
                </p>
              </div>
            </div>

            {pendingSent.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {pendingSent.map((pair, i) => {
                  const p = pair.userB;
                  const initial = `${p.firstName?.[0] || ""}${p.lastName?.[0] || ""}`.toUpperCase();
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <div key={pair.id} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: "var(--bg)",
                      border: "1px solid var(--border)",
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
                      }}>
                        En attente de réponse
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                background: "var(--bg)",
                border: "1px dashed var(--border)",
                borderRadius: 14,
                padding: "24px",
                textAlign: "center",
              }}>
                <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>
                  Vous n'avez envoyé aucune invitation en attente.
                </p>
              </div>
            )}
          </section>

          {/* 3. Inviter un collègue */}
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
                  Inviter un collègue par email
                </h2>
                <p style={{ color: "var(--text-3)", fontSize: 13, margin: 0 }}>
                  Invitez directement un collègue ou membre de votre organisation
                </p>
              </div>
            </div>
            <BinomeInviteForm />
          </section>
        </div>
      )}

      {activeTab === "explore" && (
        <div style={{ display: "grid", gap: 24 }}>
          {!binomePreference ? (
            <BinomeDiscovery />
          ) : (binomePreference.expectations?.length || 0) === 0 ? (
            <BinomePreferencesForm initialData={binomePreference} />
          ) : (
            <>
              {/* Paramètres IRIS */}
              <BinomeSettings initialOptIn={matchingOptIn} />

              {/* Suggestions IRIS */}
              <BinomeSuggest optIn={matchingOptIn} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
