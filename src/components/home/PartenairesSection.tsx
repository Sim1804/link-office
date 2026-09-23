import React from "react";

/**
 * ── LOGOS DES PARTENAIRES ──
 * Les images ont été téléchargées localement (fichiers SVG fictifs très propres).
 * L'administrateur pourra remplacer ces fichiers ou ces URLs plus tard.
 */
const PARTNERS_LOGOS = [
  { id: 1, name: "Nexus Assurance", logoUrl: "/images/partners/logo-1.svg", color: "var(--indigo)" },
  { id: 2, name: "Synergy Mutuelle", logoUrl: "/images/partners/logo-2.svg", color: "var(--cyan)" },
  { id: 3, name: "Financia", logoUrl: "/images/partners/logo-3.svg", color: "var(--primary)" },
  { id: 4, name: "Vertex", logoUrl: "/images/partners/logo-4.svg", color: "var(--rose)" },
  { id: 5, name: "Omni Corp", logoUrl: "/images/partners/logo-5.svg", color: "#f59e0b" },
];

export function PartenairesSection() {
  return (
    <section id="partenaires" className="section" style={{ background: "linear-gradient(180deg, rgba(89,101,232,0.02) 0%, rgba(0,169,157,0.03) 100%)", paddingTop: 96, paddingBottom: 96, borderBottom: "1px solid var(--border)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="badge badge-outline" style={{ marginBottom: 16 }}>Confiance</span>
          <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 800, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--text-1)", marginBottom: 16 }}>
            Ils intègrent la santé <span style={{ color: "var(--cyan)" }}>relationnelle</span>
          </h2>
          <p style={{ color: "var(--text-2)", maxWidth: 650, margin: "0 auto", lineHeight: 1.7 }}>
            Mutuelles, banques et entreprises pionnières utilisent l'IQRH pour offrir un service à forte valeur ajoutée à leurs adhérents, collaborateurs et clients.
          </p>
        </div>

        {/* ── LOGO CLOUD ── */}
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: "clamp(32px, 5vw, 56px)", 
          maxWidth: 1100, 
          margin: "0 auto" 
        }}>
          {PARTNERS_LOGOS.map((partner) => (
            <div 
              key={partner.id} 
              title={partner.name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 180, // Logos plus grands (avant 140)
                color: partner.color // Permet aux SVGs d'utiliser 'currentColor' avec de belles teintes
              }}
            >
              <img 
                src={partner.logoUrl} 
                alt={`Logo ${partner.name}`}
                style={{ 
                  width: "100%", 
                  height: "auto",
                  objectFit: "contain",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                className="partner-logo"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* Logos avec de la couleur native, juste légèrement adoucis pour l'intégration, puis éclatants au survol */
        .partner-logo {
          opacity: 0.7;
          filter: saturate(0.8);
        }
        .partner-logo:hover {
          opacity: 1;
          filter: saturate(1.2) drop-shadow(0 10px 20px rgba(0,0,0,0.05));
          transform: translateY(-4px) scale(1.05);
        }
      `}</style>
    </section>
  );
}
