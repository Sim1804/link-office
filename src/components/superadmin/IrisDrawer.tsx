"use client";

import { BrainCircuit, X, Activity } from "lucide-react";

export function IrisDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)", zIndex: 9999, transition: "opacity 0.3s" }} 
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "100%", maxWidth: 460, 
        background: "var(--bg)", boxShadow: "-4px 0 24px rgba(0,0,0,0.1)", zIndex: 10000,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex", flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)", color: "var(--text-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(89,101,232,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BrainCircuit size={24} color="var(--action)" />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.2 }}>IRIS Co-pilote</h3>
              <span style={{ fontSize: 12, opacity: 0.8 }}>Moteur Cognitif v4 · Modèle Éthique CNRS</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", transition: "background 0.2s" }}
            onMouseOver={(e) => e.currentTarget.style.background = "var(--border)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 24, flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Predictive Alert */}
          <div style={{ padding: 16, background: "rgba(89,101,232,0.05)", borderRadius: 12, border: "1px solid rgba(89,101,232,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--action)", fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              <BrainCircuit size={16} />
              Recommandation Prédictive Active
            </div>
            <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>
              L&apos;organisation <strong>Harmonie Mutuelle</strong> présente un score de correspondance Baromètre de <strong>94%</strong>. L&apos;offre B2BC « Climat Sérénité » optimise le taux de conversion de 38% si envoyée sous 24h.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 12px", background: "var(--action)", color: "white", borderRadius: 999, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>Générer Proposition IA</button>
              <button style={{ padding: "6px 12px", background: "var(--surface-2)", color: "var(--text-1)", borderRadius: 999, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer" }}>Ignorer</button>
            </div>
          </div>

          {/* Equilibrium */}
          <div style={{ padding: 16, background: "var(--surface-2)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Équilibre Médiathèque</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--action)" }}>Optimal (92%)</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 12 }}>
              18 contenus indexés. Forte demande observée sur le thème « Télétravail et Solitude ».
            </p>
            <div style={{ width: "100%", height: 6, background: "rgba(18,61,70,0.05)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: "92%", height: "100%", background: "var(--action)" }} />
            </div>
          </div>

          {/* Chat History */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Requêtes Gouvernance</span>
            
            <div style={{ alignSelf: "flex-start", maxWidth: "85%", padding: "12px 16px", background: "var(--surface-2)", borderRadius: 16, borderBottomLeftRadius: 4, fontSize: 14, color: "var(--text-1)", lineHeight: 1.5 }}>
              Bonjour Aliénor. Toutes les cohortes sont synchronisées avec le protocole SecNumCloud. Quelle synthèse souhaitez-vous compiler ?
            </div>
            
            <div style={{ alignSelf: "flex-end", maxWidth: "85%", padding: "12px 16px", background: "rgba(89,101,232,0.1)", color: "var(--action)", borderRadius: 16, borderBottomRightRadius: 4, fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
              Liste-moi les organisations n'ayant pas renouvelé de campagne depuis plus de 6 mois.
            </div>

            <div style={{ alignSelf: "flex-start", maxWidth: "85%", padding: "12px 16px", background: "var(--surface-2)", borderRadius: 16, borderBottomLeftRadius: 4, fontSize: 14, color: "var(--text-1)", lineHeight: 1.5 }}>
              Deux structures identifiées : <em>Optima Logistique</em> et <em>Synergie Est</em>. Une relance automatique bienveillante est prête pour validation.
            </div>
          </div>
        </div>

        {/* Input Footer */}
        <div style={{ padding: 24, borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", padding: 8, borderRadius: 999 }}>
            <input 
              type="text" 
              placeholder="Interroger l'algorithme IRIS..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--text-1)", paddingLeft: 12 }} 
            />
            <button style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--action)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "transform 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>
              <Activity size={18} />
            </button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, padding: "0 8px" }}>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>Modèle RGPD · Zéro donnée nominative</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--action)" }}>IR-Engine v4.2</span>
          </div>
        </div>
      </div>
    </>
  );
}
