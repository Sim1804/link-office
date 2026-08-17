/**
 * @file Footer.tsx
 * @module src/components/layout
 * @description Pied de page de LinkOffice — présent sur toutes les pages publiques.
 *
 * Structure en grille 3 colonnes (responsive 1 colonne sur mobile) :
 * - **Colonne 1 (2fr)** : Logo + tagline de l'application
 * - **Colonne 2 (1fr)** : Liens Produit (décoratifs, non cliquables pour l'instant)
 * - **Colonne 3 (1fr)** : Liens Légaux (Politique de confidentialité, Mentions légales, Contact)
 *
 * La responsive est gérée via un `<style>` injecté localement (pas de Tailwind).
 * Sur mobile (< 768px) : passage en grille 1 colonne.
 *
 * @see src/components/layout/Navbar.tsx — Barre de navigation complémentaire
 * @see app/politique-confidentialite/page.tsx — Page liée depuis ce footer
 * @see app/mentions-legales/page.tsx — Page liée depuis ce footer
 */

import Link from "next/link";
import { Brain } from "lucide-react";

/** Liens de la section Produit (informatifs, non encore routés) */
const PRODUCT_LINKS = ["Questionnaire IQRH", "IA IRIS", "Tableau de bord", "Mon profil"];

/** Liens de la section Légal avec leurs routes */
const LEGAL_LINKS = [
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Contact", href: "mailto:contact@link-office.fr" },
];

/**
 * Pied de page de l'application LinkOffice.
 * Affiché sur toutes les pages publiques (landing, auth...).
 */
export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "rgba(17,24,39,0.6)", paddingTop: 56, paddingBottom: 40 }}>
      <div className="container">
        {/* Grille principale : Brand | Produit | Légal */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Bloc Brand : Logo + Tagline */}
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

          {/* Bloc Produit : Liens informatifs (non encore liés à des routes) */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Produit</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {PRODUCT_LINKS.map((productLink) => (
                <li key={productLink}>
                  <span style={{ color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>{productLink}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloc Légal : Politique de confidentialité, Mentions légales, Contact */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Légal</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} style={{ color: "var(--text-2)", fontSize: 13, textDecoration: "none" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barre inférieure : Copyright + mention IA */}
        <div style={{ paddingTop: 32, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "var(--text-3)", fontSize: 13 }}>© 2026 LinkOffice. Tous droits réservés.</p>
          <p style={{ color: "var(--text-3)", fontSize: 12 }}>Propulsé par l&apos;Intelligence Artificielle IRIS</p>
        </div>
      </div>

      {/* Media query responsive : 1 colonne sur mobile */}
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
