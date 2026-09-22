"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2, MessageCircle, CalendarDays, Rocket, Info, ChevronRight, Handshake } from "lucide-react";
import { BinomeCheckinModal } from "./BinomeCheckinModal";

export function ActiveBinomeDashboard({ binome, currentUserId }: { binome: any, currentUserId: string }) {
  const [showCheckin, setShowCheckin] = useState(false);

  const partner = binome.userAId === currentUserId ? binome.userB : binome.userA;
  const startDate = new Date(binome.startDate);
  const daysElapsed = differenceInDays(new Date(), startDate);
  const daysTotal = 30;
  const daysRemaining = Math.max(0, daysTotal - daysElapsed);
  const progressPercent = Math.min(100, Math.max(0, (daysElapsed / daysTotal) * 100));

  return (
    <>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, rgba(0,169,157,0.08) 0%, rgba(0,169,157,0.04) 100%)",
          padding: "28px 32px",
          borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Avatar */}
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(0,169,157,0.12)",
                border: "2px solid rgba(0,169,157,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--primary)", fontWeight: 800, fontSize: 22,
                flexShrink: 0,
              }}>
                {partner.firstName[0].toUpperCase()}{partner.lastName[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-1)", margin: "0 0 6px" }}>
                  Votre Binôme avec {partner.firstName}
                </h2>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(0,169,157,0.12)", color: "var(--primary)",
                    padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    border: "1px solid rgba(0,169,157,0.25)",
                  }}>
                    <CheckCircle2 size={12} /> Actif
                  </span>
                  <span style={{ color: "var(--text-2)", fontSize: 13 }}>
                    Démarré le {format(startDate, "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            {/* Compteur jours */}
            <div style={{
              background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "12px 20px", textAlign: "center", minWidth: 90,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-1)", lineHeight: 1 }}>
                {daysElapsed}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-2)", fontWeight: 500, marginTop: 4 }}>
                / {daysTotal} jours
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                {daysRemaining} restants
              </div>
            </div>
          </div>

          {/* Barre de progression */}
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>Progression</span>
              <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>{progressPercent.toFixed(0)}%</span>
            </div>
            <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progressPercent}%`,
                background: "var(--primary)",
                borderRadius: 999,
                transition: "width 1s ease-in-out",
              }} />
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div style={{ padding: "28px 32px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 28 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Bouton check-in */}
            <button
              onClick={() => setShowCheckin(true)}
              className="btn btn-primary btn-md"
              style={{ width: "100%", justifyContent: "center", gap: 8, borderRadius: 999 }}
            >
              <MessageCircle size={16} />
              Faire un Check-in
            </button>

            {/* Timeline */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={16} style={{ color: "var(--primary)" }} />
                Timeline partagée
              </h3>
              
              {binome.checkins && binome.checkins.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {binome.checkins.map((checkin: any) => {
                    const isCurrentUser = checkin.userId === currentUserId;
                    const author = isCurrentUser ? "Vous" : partner.firstName;
                    const checkinDate = format(new Date(checkin.date), "dd MMM à HH:mm", { locale: fr });
                    
                    return (
                      <div key={checkin.id} style={{
                        background: "var(--bg)", border: "1px solid var(--border)",
                        borderRadius: 14, padding: "16px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>
                            {author} a fait un check-in
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                            {checkinDate}
                          </span>
                        </div>
                        
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: checkin.encouragement ? 12 : 0 }}>
                          {checkin.actionStatus && (
                            <span style={{
                              fontSize: 12, fontWeight: 600,
                              background: "rgba(0,169,157,0.1)", color: "var(--primary)",
                              padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(0,169,157,0.2)"
                            }}>
                              Action : {checkin.actionStatus}
                            </span>
                          )}
                          {checkin.checkinType === "RAPIDE" && (
                            <span style={{
                              fontSize: 12, fontWeight: 600,
                              background: "rgba(148,163,184,0.1)", color: "var(--text-2)",
                              padding: "2px 8px", borderRadius: 999,
                            }}>
                              Check-in rapide
                            </span>
                          )}
                        </div>
                        
                        {checkin.encouragement && (
                          <div style={{
                            background: "var(--surface)", padding: "10px 14px",
                            borderRadius: 10, fontSize: 13, color: "var(--text-2)",
                            borderLeft: "3px solid var(--primary)",
                            fontStyle: "italic"
                          }}>
                            "{checkin.encouragement}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: 14, padding: "24px", textAlign: "center",
                }}>
                  <Rocket size={22} style={{ color: "var(--text-3)", margin: "0 auto 10px" }} />
                  <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0 }}>
                    Les check-ins et encouragements apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Objectif */}
            <div style={{ background: "var(--bg)", padding: 18, borderRadius: 14, border: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <Handshake size={14} style={{ color: "var(--primary)" }} />
                Objectif du Binôme
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, margin: 0 }}>
                S'encourager mutuellement à passer à l'action sur vos recommandations IRIS.
              </p>
            </div>

            {/* Aide IRIS */}
            <div style={{
              background: "rgba(0,169,157,0.05)", padding: 18,
              borderRadius: 14, border: "1px solid rgba(0,169,157,0.2)",
            }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                <Info size={14} />
                Besoin d'aide ?
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5, margin: "0 0 12px" }}>
                IRIS peut vous aider à relancer la discussion.
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-iris", { detail: { tab: "coach" } }))}
                className="btn btn-tertiary btn-sm"
                style={{ width: "100%", justifyContent: "space-between", borderRadius: 999 }}
              >
                Demander conseil à IRIS <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showCheckin && (
        <BinomeCheckinModal binomeId={binome.id} onClose={() => setShowCheckin(false)} />
      )}
    </>
  );
}
