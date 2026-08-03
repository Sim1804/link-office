/**
 * Navbar.tsx — Navigation principale responsive avec Sélecteur d'Espace & RBAC
 * ─────────────────────────────────────────────────────────────────────────────
 * Architecture B2B SaaS Professionnelle (Séparation Espace Pro / Espace Perso).
 */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu, X, Brain, LayoutDashboard, MessageCircle, User, LogOut,
  ChevronDown, Shield, Building2, HeartPulse, Landmark
} from "lucide-react";

const publicLinks = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#methode", label: "La méthode" },
  { href: "/business", label: "Pour les Entreprises" },
  { href: "/#temoignages", label: "Témoignages" },
];

type RoleType = "EMPLOYEE" | "ADMIN_B2B" | "ADMIN_B2B2C" | "ADMIN_COLLECTIVITE" | "SUPER_ADMIN";

const ROLE_BADGES: Record<RoleType, { label: string; bg: string; color: string; border: string }> = {
  EMPLOYEE: { label: "Membre", bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
  ADMIN_B2B: { label: "RH Admin", bg: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "rgba(124,58,237,0.3)" },
  ADMIN_B2B2C: { label: "Mutuelle Admin", bg: "rgba(52,211,153,0.15)", color: "#34d399", border: "rgba(52,211,153,0.3)" },
  ADMIN_COLLECTIVITE: { label: "Territoire Admin", bg: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "rgba(6,182,212,0.3)" },
  SUPER_ADMIN: { label: "Super Admin", bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" },
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { data: session } = useSession();
  const isApp = !!session;
  const role = (session?.user?.role as RoleType) ?? "EMPLOYEE";
  const badge = ROLE_BADGES[role] || ROLE_BADGES.EMPLOYEE;

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Définition des liens selon le rôle
  const getNavLinks = () => {
    if (!isApp) return publicLinks;

    if (role === "ADMIN_B2B") {
      return [{ href: "/dashboard/b2b", label: "Tableau de bord RH", icon: Building2 }];
    } else if (role === "ADMIN_B2B2C") {
      return [{ href: "/dashboard/b2b2c", label: "Portail Mutuelle", icon: HeartPulse }];
    } else if (role === "ADMIN_COLLECTIVITE") {
      return [{ href: "/dashboard/collectivites", label: "Observatoire", icon: Landmark }];
    } else if (role === "SUPER_ADMIN") {
      return [
        { href: "/admin", label: "Console Admin", icon: Shield },
        { href: "/dashboard/b2b", label: "Démo Tableau de bord B2B", icon: Building2 },
      ];
    } else {
      // Utilisateurs standard : EMPLOYEE, MEMBER, CITIZEN
      return [
        { href: "/dashboard", label: "Mon Évaluation", icon: LayoutDashboard },
        { href: "/mon-profil", label: "Ma Progression", icon: User },
        { href: "/iris", label: "IA IRIS", icon: MessageCircle },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(11,15,25,0.85)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>

        {/* Logo LinkOffice */}
        <Link href={session ? (role === "SUPER_ADMIN" ? "/admin" : role.startsWith("ADMIN_") ? navLinks[0].href : "/dashboard") : "/"}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(124,58,237,0.4)" }}>
            <Brain size={18} color="white" />
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 19, color: "#f8fafc" }}>
            Link<span className="gradient-text">Office</span>
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav style={{ display: "flex", gap: 6, flex: 1, justifyContent: "center" }} className="hide-mobile">
          {navLinks.map(({ href, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{
                padding: "8px 14px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
                color: active ? "#a78bfa" : "#94a3b8",
                background: active ? "rgba(124,58,237,0.15)" : "transparent",
                border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Espace Utilisateur Desktop */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }} className="hide-mobile">
          {session ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "6px 12px", borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#f8fafc", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {/* Avatar initiales */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "white"
                }}>
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", lineHeight: 1.2 }}>
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </div>
                  <div style={{ fontSize: 10, color: badge.color, fontWeight: 700 }}>
                    {badge.label}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: "#94a3b8", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {/* Menu Déroulant Profil */}
              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
                  background: "#111827", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: 8, boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                  zIndex: 100
                }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{session.user?.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user?.email}</div>
                    <span style={{
                      display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 6,
                      fontSize: 10, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                    }}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Liens Utilisateur Standard */}
                  {!role.startsWith("ADMIN_") && role !== "SUPER_ADMIN" && (
                    <>
                      <Link href="/mon-profil" onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          borderRadius: 10, fontSize: 13, color: "#f8fafc", textDecoration: "none",
                          transition: "background 0.2s"
                        }}>
                        <User size={15} style={{ color: "#34d399" }} /> Ma Progression
                      </Link>
                      <Link href="/profil" onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          borderRadius: 10, fontSize: 13, color: "#94a3b8", textDecoration: "none",
                          transition: "background 0.2s"
                        }}>
                        <Shield size={15} style={{ color: "#94a3b8" }} /> Infos Personnelles
                      </Link>
                    </>
                  )}

                  {role === "SUPER_ADMIN" && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", padding: "8px 12px 4px", textTransform: "uppercase" }}>Sélecteur Démos</div>
                      <Link href="/dashboard/b2b" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#a78bfa", textDecoration: "none" }}>
                        <Building2 size={14} /> Dashboard RH B2B
                      </Link>
                      <Link href="/dashboard/b2b2c" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#34d399", textDecoration: "none" }}>
                        <HeartPulse size={14} /> Dashboard Mutuelle B2B2C
                      </Link>
                      <Link href="/dashboard/collectivites" onClick={() => setDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#06b6d4", textDecoration: "none" }}>
                        <Landmark size={14} /> Observatoire Territoire
                      </Link>
                    </>
                  )}

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 6, paddingTop: 6 }}>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 10, fontSize: 13,
                        color: "#f43f5e", background: "transparent", border: "none",
                        cursor: "pointer", textAlign: "left"
                      }}
                    >
                      <LogOut size={15} /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Connexion</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Commencer gratuitement</Link>
            </>
          )}
        </div>

        {/* Toggle Mobile */}
        <button className="show-mobile" onClick={() => setOpen(!open)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 8 }}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, background: "#0b0f19" }}>
          {session && (
            <div style={{ padding: "8px 12px", marginBottom: 8, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{session.user?.name}</div>
              <div style={{ fontSize: 11, color: badge.color, fontWeight: 700 }}>{badge.label}</div>
            </div>
          )}

          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "#f8fafc", textDecoration: "none", display: "block" }}>
              {label}
            </Link>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            {session ? (
              <button onClick={() => { signOut({ callbackUrl: "/" }); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#f43f5e", background: "none", border: "none", cursor: "pointer", padding: "8px 14px" }}>
                <LogOut size={16} /> Déconnexion
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
