/**
 * @file Navbar.tsx
 * @module src/components/layout
 * @description Barre de navigation principale de LinkOffice — responsive et RBAC.
 *
 * La Navbar adapte dynamiquement son contenu selon le statut de session et le rôle :
 *
 * | Statut           | Liens affichés                                          |
 * | ---------------- | ------------------------------------------------------- |
 * | Non connecté     | Liens publics (Features, Méthode, Business, Témo...)    |
 * | EMPLOYEE/MEMBER  | Mon Évaluation, Ma Progression, IA IRIS                 |
 * | ADMIN_B2B        | Tableau de bord B2B                                      |
 * | ADMIN_B2B2C      | Portail Mutuelle                                        |
 * | ADMIN_COLLECTIVITE | Observatoire Territoire                               |
 * | SUPER_ADMIN      | Console Admin + Démonstrations tous dashboards          |
 *
 * Fonctionnalités :
 * - Menu hamburger mobile
 * - Dropdown profil avec avatar initiales + badge rôle
 * - Détection de la route active pour surligner le lien courant
 * - Fermeture automatique du dropdown au clic extérieur
 *
 * @see src/components/layout/Footer.tsx — Pied de page complémentaire
 * @see lib/auth.ts — Configuration NextAuth qui définit les rôles
 */
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu, X, Brain, LayoutDashboard, MessageCircle, User, LogOut,
  ChevronDown, Shield, Building2, HeartPulse, Landmark, BookOpen, Users, BarChart3
} from "lucide-react";
import { NotificationBell } from "./NotificationBell";

/** Union des rôles utilisateur reconnus par la Navbar */
type RoleType = "EMPLOYEE" | "ADMIN_B2B" | "ADMIN_B2B2C" | "ADMIN_COLLECTIVITE" | "SUPER_ADMIN";

const ROLE_BADGES: Record<RoleType, { label: string; bg: string; color: string; border: string }> = {
  EMPLOYEE: { label: "Membre", bg: "rgba(18,61,70,0.05)", color: "var(--text-2)", border: "rgba(18,61,70,0.1)" },
  ADMIN_B2B: { label: "Administrateur B2B", bg: "rgba(89,101,232,0.1)", color: "#5965E8", border: "rgba(89,101,232,0.2)" },
  ADMIN_B2B2C: { label: "Administrateur mutuelle", bg: "rgba(0,169,157,0.1)", color: "#00A99D", border: "rgba(0,169,157,0.2)" },
  ADMIN_COLLECTIVITE: { label: "Administrateur territoire", bg: "rgba(77,189,178,0.1)", color: "#4DBDB2", border: "rgba(77,189,178,0.2)" },
  SUPER_ADMIN: { label: "Super administrateur", bg: "rgba(255,198,41,0.15)", color: "#FFC629", border: "rgba(255,198,41,0.3)" },
};

/**
 * Barre de navigation principale de l'application (Espace Connecté).
 */
export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const currentPathname = usePathname();
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  
  const isAuthenticated = !!session;
  const userRole = (session?.user?.role as RoleType) ?? "EMPLOYEE";
  const roleBadge = ROLE_BADGES[userRole] || ROLE_BADGES.EMPLOYEE;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    if (userRole === "ADMIN_B2B") {
      return [
        { href: "/dashboard/b2b", label: "Observatoire", icon: Building2 },
        { href: "/dashboard/b2b/campaigns", label: "Campagnes", icon: Users },
      ];
    } else if (userRole === "ADMIN_B2B2C") {
      return [
        { href: "/dashboard/b2b2c", label: "Portail Mutuelle", icon: HeartPulse },
        { href: "/dashboard/b2b2c/campaigns", label: "Campagnes", icon: Users },
      ];
    } else if (userRole === "ADMIN_COLLECTIVITE") {
      return [
        { href: "/dashboard/b2g", label: "Observatoire Territorial", icon: Landmark },
        { href: "/dashboard/b2g/campaigns", label: "Campagnes", icon: Users },
      ];
    } else if (userRole === "SUPER_ADMIN") {
      return [
        { href: "/dashboard/superadmin", label: "Console administrateur", icon: Shield },
        { href: "/dashboard/b2b", label: "Portails partenaires", icon: Building2 },
      ];
    } else {
      const subscription = (session?.user as any)?.subscription ?? "FREEMIUM";
      const isPremiumPlus = subscription === "PREMIUM_PLUS";
      const links = [
        { href: "/dashboard", label: "Mon évaluation", icon: LayoutDashboard },
        { href: "/mon-profil", label: "Ma progression", icon: User },
        { href: "/media", label: "Espace média", icon: BookOpen },
      ];
      if (isPremiumPlus) {
        links.push({ href: "/binome", label: "Binôme", icon: Users });
      }
      return links;
    }
  };

  const navLinks = getNavLinks();

  if (!isAuthenticated && !isLoading) {
    return null; // Do not render AppNavbar if not authenticated. PublicNavbar handles public routes.
  }

  return (
    <header className="global-navbar" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      background: "rgba(245, 247, 246, 0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>

        {/* Logo LinkOffice — redirige vers le bon point d'entrée selon le rôle */}
        <Link href={session ? (userRole === "SUPER_ADMIN" ? "/dashboard/superadmin" : userRole.startsWith("ADMIN_") ? navLinks[0].href : "/dashboard") : "/"}
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          {(session?.user as any)?.logoUrl ? (
            <div style={{ height: 34, display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(session?.user as any).logoUrl} alt="Logo Partenaire" style={{ maxHeight: "100%", maxWidth: 120, objectFit: "contain" }} />
            </div>
          ) : (
            <>
              <div style={{ width: 34, height: 34, background: "var(--primary)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={18} color="white" />
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 19, color: "var(--text-1)" }}>
                Link<span className="gradient-text">Office</span>
              </span>
            </>
          )}
        </Link>

        {/* Navigation Desktop — liens actifs surlignés selon la route courante */}
        <nav style={{ display: "flex", gap: 24, flex: 1, justifyContent: "center" }} className="hide-mobile">
          {navLinks.map(({ href, label }) => {
            const isPortailLink = label === "Portails Partenaires" && (currentPathname.startsWith("/dashboard/b2b") || currentPathname.startsWith("/dashboard/b2b2c") || currentPathname.startsWith("/dashboard/b2g"));
            // Logique de surbrillance stricte pour éviter les conflits
            let isActivePage = false;
            if (isPortailLink) {
              isActivePage = true;
            } else if (href === "/dashboard/b2b" || href === "/dashboard/b2b2c" || href === "/dashboard/b2g") {
              // Pour les racines des portails, on exige une correspondance exacte (ou avec un paramètre mais pas un sous-menu)
              isActivePage = currentPathname === href;
            } else if (href === "/dashboard") {
              isActivePage = currentPathname === "/dashboard";
            } else {
              // Pour les autres pages (ex: /dashboard/b2b/campaigns), on peut faire un startsWith
              isActivePage = currentPathname.startsWith(href);
            }
            return (
              <Link key={href} href={href} style={{
                padding: "8px 12px", fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: isAuthenticated ? "none" : "uppercase",
                color: isActivePage ? "var(--primary)" : "var(--text-1)",
                borderBottom: isActivePage ? "2px solid var(--primary)" : "2px solid transparent",
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
            <>
              <NotificationBell />
              <div style={{ position: "relative" }} ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "4px 12px 4px 6px", borderRadius: 9999,
                  background: "rgba(18,61,70,0.03)",
                  border: "1px solid var(--border)",
                  color: "var(--text-1)", cursor: "pointer", transition: "all 0.2s"
                }}
              >
                {/* Avatar initiales */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "white"
                }}>
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.2 }}>
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </div>
                  <div style={{ fontSize: 10, color: roleBadge.color, fontWeight: 700 }}>
                    {roleBadge.label}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: "var(--text-2)", transform: isProfileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>

              {/* Menu Déroulant Profil — visible uniquement si le dropdown est ouvert */}
              {isProfileDropdownOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, width: 240,
                  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid var(--border)",
                  borderRadius: 16, padding: 8, boxShadow: "var(--shadow-card)",
                  zIndex: 100
                }}>
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{session.user?.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis" }}>{session.user?.email}</div>
                    <span style={{
                      display: "inline-block", marginTop: 6, padding: "2px 10px", borderRadius: 9999,
                      fontSize: 10, fontWeight: 700, background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}`
                    }}>
                      {roleBadge.label}
                    </span>
                  </div>

                  {/* Liens Utilisateur Standard (non-admin) */}
                  {!userRole.startsWith("ADMIN_") && userRole !== "SUPER_ADMIN" && (
                    <>
                      <Link href="/mon-profil" onClick={() => setIsProfileDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          borderRadius: 10, fontSize: 13, color: "var(--text-1)", textDecoration: "none",
                          transition: "background 0.2s"
                        }}>
                        <User size={15} style={{ color: "#34d399" }} /> Ma Progression
                      </Link>
                      <Link href="/profil" onClick={() => setIsProfileDropdownOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          borderRadius: 10, fontSize: 13, color: "var(--text-2)", textDecoration: "none",
                          transition: "background 0.2s"
                        }}>
                        <Shield size={15} style={{ color: "var(--text-2)" }} /> Infos Personnelles
                      </Link>
                    </>
                  )}

                  {/* Section Sélecteur de Démonstrations (Super Admin uniquement) */}
                  {userRole === "SUPER_ADMIN" && (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-3)", padding: "8px 12px 4px", textTransform: "uppercase" }}>Sélecteur Démos</div>
                      <Link href="/dashboard/b2b" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                        <Building2 size={14} /> Entreprises (B2B)
                      </Link>
                      <Link href="/dashboard/b2b2c" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#34d399", textDecoration: "none" }}>
                        <HeartPulse size={14} /> Mutuelles (B2B2C)
                      </Link>
                      <Link href="/dashboard/b2g" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                        <Landmark size={14} /> Collectivités (B2G)
                      </Link>
                    </>
                  )}

                  <div style={{ borderTop: "1px solid var(--border)", marginTop: 6, paddingTop: 6 }}>
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
            </>
          ) : isLoading ? (
            <div style={{ width: 120, height: 36, background: "rgba(18,61,70,0.05)", borderRadius: 8, animation: "pulse 2s infinite" }} />
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm" style={{ textDecoration: "none" }}>Connexion</Link>
              <Link href="/auth/register" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>Commencer gratuitement</Link>
            </>
          )}
        </div>

        {/* Toggle du menu hamburger mobile */}
        <button className="show-mobile" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-2)", cursor: "pointer", padding: 8 }}>
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Mobile — visible uniquement sur petits écrans */}
      {isMobileMenuOpen && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 6, background: "rgba(245,247,246,0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          {/* Résumé du compte (si connecté) */}
          {session && (
            <div style={{ padding: "8px 12px", marginBottom: 8, background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{session.user?.name}</div>
              <div style={{ fontSize: 11, color: roleBadge.color, fontWeight: 700 }}>{roleBadge.label}</div>
            </div>
          )}

          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
              style={{ padding: "10px 14px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--text-1)", textDecoration: "none", display: "block" }}>
              {label}
            </Link>
          ))}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
            {isLoading ? (
              <div style={{ height: 40, background: "rgba(18,61,70,0.05)", borderRadius: 10, animation: "pulse 2s infinite" }} />
            ) : session ? (
              <button onClick={() => { signOut({ callbackUrl: "/" }); setIsMobileMenuOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#f43f5e", background: "none", border: "none", cursor: "pointer", padding: "8px 14px" }}>
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-secondary btn-md" style={{ textDecoration: "none", textAlign: "center" }}>Connexion</Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary btn-md" style={{ textDecoration: "none", textAlign: "center" }}>Commencer gratuitement</Link>
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
