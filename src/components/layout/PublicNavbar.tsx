"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X } from "lucide-react";

const publicLinks = [
  { href: "/#iqrh",         label: "La méthode" },
  { href: "/#iris",         label: "Coach IRIS" },
  { href: "/#observatoire", label: "Baromètre" },
  { href: "/#partenaires",  label: "Partenaires" },
  { href: "/media",         label: "Média" },
  { href: "/business",      label: "Pour les organisations" },
  { href: "/premium",       label: "Tarifs" },
];

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) return false; // Anchor links — need scroll spy to track accurately
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="global-navbar" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(245, 247, 246, 0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 19, color: "var(--text-1)" }}>
            Link<span className="gradient-text">Office</span>
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav style={{ display: "flex", gap: 28, flex: 1, justifyContent: "center" }} className="hide-mobile">
          {publicLinks.map(({ href, label }) => {
            const active = isLinkActive(href);
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? "var(--primary)" : "var(--text-1)",
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  position: "relative",
                  paddingBottom: 4,
                }}
                onMouseOver={(e) => e.currentTarget.style.color = "var(--primary)"}
                onMouseOut={(e) => e.currentTarget.style.color = active ? "var(--primary)" : "var(--text-1)"}
              >
                {label}
                {/* Active indicator — soulignement animé */}
                {active && (
                  <span style={{
                    position: "absolute",
                    bottom: -2,
                    left: 0,
                    right: 0,
                    height: 2,
                    borderRadius: 999,
                    background: "var(--primary)",
                  }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }} className="hide-mobile">
          <Link href="/auth/login"    className="btn btn-ghost btn-sm"   style={{ textDecoration: "none" }}>Connexion</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Commencer gratuitement</Link>
        </div>

        {/* Hamburger Mobile */}
        <button
          className="show-mobile"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", padding: 8 }}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, background: "rgba(245,247,246,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          {publicLinks.map(({ href, label }) => {
            const active = isLinkActive(href);
            return (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: "10px 14px", borderRadius: 10, fontSize: 15, fontWeight: 600, color: active ? "var(--primary)" : "var(--text-1)", background: active ? "rgba(0,169,157,0.06)" : "transparent", textDecoration: "none", display: "block" }}>
                {label}
              </Link>
            );
          })}
          <Link href="/premium" onClick={() => setIsMobileMenuOpen(false)}
            style={{ padding: "10px 14px", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "var(--primary)", background: "rgba(0,169,157,0.06)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} /> Premium
          </Link>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            <Link href="/auth/login"    onClick={() => setIsMobileMenuOpen(false)} className="btn btn-secondary btn-md" style={{ textDecoration: "none", textAlign: "center" }}>Connexion</Link>
            <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary btn-md"   style={{ textDecoration: "none", textAlign: "center" }}>Commencer gratuitement</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
      `}</style>
    </header>
  );
}
