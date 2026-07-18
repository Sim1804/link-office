/**
 * Navbar.tsx — Navigation principale responsive
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X, Brain, LayoutDashboard, FileQuestion, MessageCircle, User, LogOut } from "lucide-react";

const publicLinks = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#methode", label: "La méthode" },
  { href: "/#temoignages", label: "Témoignages" },
];

const appLinks = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/iris", label: "IA IRIS", icon: MessageCircle },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const isApp = !!session;

  const navLinks = isApp ? appLinks : publicLinks;

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(26,34,54,0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>

        {/* Logo */}
        <Link href={session ? "/dashboard" : "/"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: "var(--primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
            <Brain size={16} color="white" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>
            Link<span className="gradient-text">Office</span>
          </span>
        </Link>

        {/* Desktop nav — centered */}
        <nav style={{ display: "flex", gap: 4, flex: 1, justifyContent: "center" }} className="hide-mobile">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500,
                color: active ? "#a78bfa" : "var(--text-2)",
                background: active ? "rgba(124,58,237,0.12)" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-1)"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* CTA desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }} className="hide-mobile">
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-2)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--rose)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-2)")}
            >
              <LogOut size={15} /> Déconnexion
            </button>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Connexion</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Commencer gratuitement</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="show-mobile"
          onClick={() => setOpen(!open)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", padding: 8 }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}
              onClick={() => setOpen(false)}
              style={{ padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--text-2)", textDecoration: "none", display: "block" }}
            >
              {label}
            </Link>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            {session ? (
              <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--rose)", background: "none", border: "none", cursor: "pointer", padding: "8px 16px" }}>
                <LogOut size={15} /> Déconnexion
              </button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="btn btn-secondary btn-md" style={{ textDecoration: "none", textAlign: "center" }}>Connexion</Link>
                <Link href="/auth/register" onClick={() => setOpen(false)} className="btn btn-primary btn-md" style={{ textDecoration: "none", textAlign: "center" }}>Commencer gratuitement</Link>
              </>
            )}
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
