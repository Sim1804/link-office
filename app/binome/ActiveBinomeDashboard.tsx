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
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        overflow: "hidden",
      }}>
        {/* Header Dashboard */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.08) 100%)",
          padding: "32px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "rgba(16,185,129,0.15)",
                border: "2px solid rgba(16,185,129,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#10b981", fontWeight: 800, fontSize: 28,
                boxShadow: "0 0 30px rgba(16,185,129,0.2)",
              }}>
                {partner.firstName[0].toUpperCase()}{partner.lastName[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>
                  Votre Binôme avec {partner.firstName}
                </h2>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(16,185,129,0.15)", color: "#34d399",
                    padding: "4px 10px", borderRadius: 8, fontSize: 13, fontWeight: 700
                  }}>
                    <CheckCircle2 size={14} /> Actif
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: 14 }}>
                    Démarré le {format(startDate, "d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#f8fafc", lineHeight: 1 }}>
                Jour {daysElapsed} <span style={{ fontSize: 18, color: "#64748b", fontWeight: 600 }}>/ 30</span>
              </div>
              <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                {daysRemaining} jours restants
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: 24 }}>
            <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ 
                height: "100%", 
                width: `${progressPercent}%`, 
                background: "linear-gradient(90deg, #10b981, #34d399)",
                borderRadius: 999,
                transition: "width 1s ease-in-out"
              }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 32 }}>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                onClick={() => setShowCheckin(true)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#fff", border: "none", padding: "16px", borderRadius: 14,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)"
                }}
              >
                <MessageCircle size={18} />
                Faire un Check-in
              </button>
            </div>

            {/* Timeline Placeholder */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarDays size={18} style={{ color: "#38bdf8" }} />
                Timeline partagée
              </h3>
              <div style={{ 
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", 
                borderRadius: 16, padding: "24px", textAlign: "center" 
              }}>
                <Rocket size={24} style={{ color: "#64748b", margin: "0 auto 12px" }} />
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Les check-ins et encouragements apparaîtront ici.</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
             {/* Objectifs */}
             <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
               <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                 <Handshake size={16} style={{ color: "#a855f7" }} />
                 Objectif du Binôme
               </h3>
               <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                 S'encourager mutuellement à passer à l'action sur vos recommandations IRIS.
               </p>
             </div>

             {/* Aide IRIS */}
             <div style={{ background: "rgba(168,85,247,0.05)", padding: 20, borderRadius: 16, border: "1px solid rgba(168,85,247,0.15)" }}>
               <h3 style={{ fontSize: 14, fontWeight: 700, color: "#c084fc", margin: "0 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
                 <Info size={16} />
                 Besoin d'aide ?
               </h3>
               <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5, margin: "0 0 12px" }}>
                 IRIS peut vous aider à relancer la discussion ou à gérer une difficulté.
               </p>
               <button
                 onClick={() => window.dispatchEvent(new CustomEvent("open-iris", { detail: { tab: "coach" } }))}
                 style={{
                   background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "none",
                   padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, width: "100%",
                   cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                   transition: "background 0.2s",
                 }}
               >
                 Demander conseil à IRIS <ChevronRight size={14} />
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
