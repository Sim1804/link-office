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
import { Logo } from "../brand/Logo";

/** Union des rôles utilisateur reconnus par la Navbar */
type RoleType = "EMPLOYEE" | "CITIZEN" | "MEMBER" | "ADMIN_B2B" | "ADMIN_B2B2C" | "ADMIN_B2G" | "ADMIN_COLLECTIVITE" | "SUPER_ADMIN";

const ROLE_BADGES: Record<string, { label: string; bg: string; color: string; border: string }> = {
  EMPLOYEE: { label: "Membre", bg: "rgba(18,61,70,0.05)", color: "#123D46", border: "rgba(18,61,70,0.1)" },
  MEMBER: { label: "Membre", bg: "rgba(18,61,70,0.05)", color: "#123D46", border: "rgba(18,61,70,0.1)" },
  CITIZEN: { label: "Citoyen", bg: "rgba(77,189,178,0.1)", color: "#4DBDB2", border: "rgba(77,189,178,0.2)" },
  ADMIN_B2B: { label: "Administrateur B2B", bg: "rgba(89,101,232,0.1)", color: "#5965E8", border: "rgba(89,101,232,0.2)" },
  ADMIN_B2B2C: { label: "Administrateur Mutuelle", bg: "rgba(0,169,157,0.1)", color: "#00A99D", border: "rgba(0,169,157,0.2)" },
  ADMIN_B2G: { label: "Administrateur Territoire", bg: "rgba(77,189,178,0.1)", color: "#4DBDB2", border: "rgba(77,189,178,0.2)" },
  ADMIN_COLLECTIVITE: { label: "Administrateur Territoire", bg: "rgba(77,189,178,0.1)", color: "#4DBDB2", border: "rgba(77,189,178,0.2)" },
  SUPER_ADMIN: { label: "Super Administrateur", bg: "rgba(255,198,41,0.15)", color: "#B45309", border: "rgba(255,198,41,0.3)" },
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
        { href: "/dashboard/b2b", label: "Tableau de bord B2B", icon: Building2 }
      ];
    } else if (userRole === "ADMIN_B2B2C") {
      return [
        { href: "/dashboard/b2b2c", label: "Tableau de bord B2B2C", icon: HeartPulse }
      ];
    } else if (userRole === "ADMIN_COLLECTIVITE" || userRole === "ADMIN_B2G") {
      return [
        { href: "/dashboard/b2g", label: "Tableau de bord B2G", icon: Landmark }
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3.5 shadow-2xs">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">

        {/* Logo LinkOffice — redirige vers le bon point d'entrée selon le rôle */}
        <Link href={session ? (userRole === "SUPER_ADMIN" ? "/dashboard/superadmin" : userRole.startsWith("ADMIN_") ? navLinks[0].href : "/dashboard") : "/"}
          className="flex items-center text-decoration-none shrink-0"
        >
          {(session?.user as any)?.logoUrl ? (
            <div className="h-[34px] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={(session?.user as any).logoUrl} alt="Logo Partenaire" className="max-h-full max-w-[120px] object-contain" />
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </Link>

        {/* Navigation Desktop — liens actifs surlignés selon la route courante */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-jakarta font-semibold">
          {navLinks.map(({ href, label }) => {
            const isActivePage = href === "/dashboard" 
              ? currentPathname === "/dashboard" 
              : currentPathname.startsWith(href);
            
            return (
              <Link key={href} href={href} 
                className={`relative py-2 transition-colors ${
                  isActivePage
                    ? 'text-[#00A99D] font-bold'
                    : 'text-[#123D46]/70 hover:text-[#123D46]'
                } ${!isAuthenticated ? 'uppercase tracking-wide text-xs' : ''}`}
              >
                <span>{label}</span>
                {isActivePage && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Espace Utilisateur Desktop */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {session ? (
            <>
              <NotificationBell />
              
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#00A99D] transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center shadow-2xs">
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  
                  <div>
                    <div className="font-jakarta font-bold text-xs text-[#123D46] leading-none mb-0.5">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </div>
                    <div className="text-[10px] font-medium" style={{ color: roleBadge.color }}>
                      {roleBadge.label}
                    </div>
                  </div>
                  
                  <ChevronDown size={14} className={`text-[#123D46]/50 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Menu Déroulant Profil */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E3EBE6] py-2 z-50 animate-fade-in text-xs">
                    <div className="px-4 py-3 border-b border-[#E3EBE6] mb-2">
                      <div className="font-bold text-[#123D46]">{session.user?.name}</div>
                      <div className="text-[11px] text-[#123D46]/60 truncate">{session.user?.email}</div>
                      <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold" 
                            style={{ background: roleBadge.bg, color: roleBadge.color, border: `1px solid ${roleBadge.border}` }}>
                        {roleBadge.label}
                      </span>
                    </div>

                  {/* Liens Utilisateur Standard (non-admin) */}
                  {!userRole.startsWith("ADMIN_") && userRole !== "SUPER_ADMIN" && (
                    <div className="py-1">
                      <Link href="/mon-profil" onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF9F5] text-[#123D46] font-medium transition-colors"
                      >
                        <User size={15} className="text-[#00A99D]" /> Ma Progression
                      </Link>
                      <Link href="/profil" onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF9F5] text-[#123D46] font-medium transition-colors"
                      >
                        <Shield size={15} className="text-[#123D46]/70" /> Infos Personnelles
                      </Link>
                    </div>
                  )}

                  <div className="border-t border-[#E3EBE6] my-1" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 text-red-600 font-bold transition-colors text-left"
                  >
                    <LogOut size={15} /> Déconnexion
                  </button>
                </div>
              )}
              </div>
            </>
          ) : isLoading ? (
            <div className="w-[120px] h-[36px] bg-[#123D46]/5 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="hidden sm:block text-xs font-jakarta font-bold text-[#123D46] hover:text-[#00A99D] transition-colors uppercase tracking-wider">
                Espace Client
              </Link>
              <Link href="/auth/login" className="px-5 py-2.5 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-xs shadow-md transition-all">
                Se connecter
              </Link>
            </div>
          )}
        </div>

        {/* Toggle du menu hamburger mobile */}
        <button className="md:hidden ml-auto p-2 text-[#123D46]/70 hover:text-[#00A99D] transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu Mobile — visible uniquement sur petits écrans */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3EBE6] px-5 py-4 flex flex-col gap-2 bg-[#FAF9F5]/95 backdrop-blur-md">
          {/* Résumé du compte (si connecté) */}
          {session && (
            <div className="p-3 mb-2 bg-white rounded-xl border border-[#E3EBE6]">
              <div className="text-sm font-bold text-[#123D46]">{session.user?.name}</div>
              <div className="text-xs font-bold mt-1" style={{ color: roleBadge.color }}>{roleBadge.label}</div>
            </div>
          )}

          {navLinks.map(({ href, label }) => {
            const isActivePage = href === "/dashboard" 
              ? currentPathname === "/dashboard" 
              : currentPathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-jakarta font-bold transition-colors ${
                  isActivePage 
                    ? 'bg-[#00A99D]/10 text-[#00A99D]' 
                    : 'text-[#123D46]/80 hover:bg-white'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <div className="mt-3 pt-3 border-t border-[#E3EBE6] flex flex-col gap-2">
            {isLoading ? (
              <div className="h-10 bg-[#123D46]/5 rounded-xl animate-pulse" />
            ) : session ? (
              <button onClick={() => { signOut({ callbackUrl: "/" }); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-sm text-red-600 font-bold px-3 py-2 hover:bg-red-50 rounded-lg transition-colors text-left"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full py-2.5 rounded-full border border-[#E3EBE6] bg-white text-[#123D46] font-jakarta font-bold text-sm text-center shadow-sm">
                  Connexion
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)} 
                  className="w-full py-2.5 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-sm text-center shadow-md">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
