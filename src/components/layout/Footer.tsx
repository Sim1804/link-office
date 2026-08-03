import Link from "next/link";
import { Brain } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "rgba(17,24,39,0.6)", paddingTop: 56, paddingBottom: 40 }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={16} color="white" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>
                Link<span className="gradient-text">Office</span>
              </span>
            </Link>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, maxWidth: 320 }}>
              Évaluez votre qualité de vie relationnelle avec l&apos;IQRH.
              Guidé par l&apos;IA IRIS, développez vos relations et votre équilibre.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Produit</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {["Questionnaire IQRH", "IA IRIS", "Tableau de bord", "Mon profil"].map((item) => (
                <li key={item}>
                  <span style={{ color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Légal</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Politique de confidentialité", href: "/politique-confidentialite" },
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "Contact", href: "mailto:contact@link-office.fr" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: "var(--text-2)", fontSize: 13, textDecoration: "none" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>© 2026 LinkOffice. Tous droits réservés.</p>
          <p style={{ color: "var(--text-3)", fontSize: 12 }}>Propulsé par l&apos;Intelligence Artificielle IRIS</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
