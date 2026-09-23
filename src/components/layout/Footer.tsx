/**
 * @file Footer.tsx
 * @module src/components/layout
 * @description Pied de page de LinkOffice — présent sur toutes les pages publiques.
 *
 * Structure en grille 4 colonnes (responsive 2 colonnes sur tablette, 1 sur mobile) :
 * - **Colonne 1 (2fr)** : Logo + tagline de l'application
 * - **Colonne 2 (1fr)** : Liens Produit
 * - **Colonne 3 (1fr)** : Liens Ressources
 * - **Colonne 4 (1fr)** : Liens Légaux
 *
 * @see src/components/layout/Navbar.tsx — Barre de navigation complémentaire
 * @see app/politique-confidentialite/page.tsx — Page liée depuis ce footer
 * @see app/mentions-legales/page.tsx — Page liée depuis ce footer
 */

"use client";

import Link from "next/link";
import { Brain, Sparkles } from "lucide-react";

/** Liens de la section Produit avec leurs routes */
const PRODUCT_LINKS = [
  { label: "Questionnaire IQRH", href: "/questionnaire" },
  { label: "IA IRIS",            href: "/#iris" },
  { label: "Tableau de bord",    href: "/dashboard" },
  { label: "Mon profil",         href: "/mon-profil" },
  { label: "Pour les organisations", href: "/business" },
];

/** Liens de la section Ressources */
const RESOURCE_LINKS = [
  { label: "Médias & Actualités", href: "/media" },
  { label: "Baromètre National",  href: "/#observatoire" },
  { label: "Nos offres Premium ★", href: "/premium", highlight: true },
];

/** Liens de la section Légal avec leurs routes */
const LEGAL_LINKS = [
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Mentions légales",             href: "/mentions-legales" },
  { label: "Contact",                      href: "mailto:contact@link-office.fr" },
];

/**
 * Pied de page de l'application LinkOffice.
 * Affiché sur toutes les pages publiques (landing, auth...).
 */
export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg)", paddingTop: 56, paddingBottom: 40 }}>
      <div className="container">
        {/* Grille principale : Brand | Produit | Ressources | Légal */}
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>

          {/* Bloc Brand : Logo + Tagline */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={16} color="white" />
              </div>
              <span style={{ fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>
                Link<span className="gradient-text">Office</span>
              </span>
            </Link>
            <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.7, maxWidth: 300 }}>
              Évaluez votre qualité de vie relationnelle avec l&apos;IQRH.
              Guidé par l&apos;IA IRIS, développez vos relations et votre équilibre.
            </p>
          </div>

          {/* Bloc Produit */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Produit</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloc Ressources */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Ressources</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {RESOURCE_LINKS.map(({ label, href, highlight }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="footer-link"
                    style={highlight ? { color: "var(--primary)", fontWeight: 700 } : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bloc Légal */}
          <div>
            <h4 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Légal</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">{label}</Link>
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

      {/* Media query responsive */}
      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 540px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
