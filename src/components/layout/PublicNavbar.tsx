"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "../brand/Logo";

export interface NavLink {
  href: string;
  sectionId?: string;
  label: string;
  isIris?: boolean;
  isPro?: boolean;
  hasPing?: boolean;
}

const publicLinks: NavLink[] = [
  { href: "/#methode",   sectionId: "methode",   label: "La méthode" },
  { href: "/#iqrh",      sectionId: "iqrh",      label: "L'IQRH & Baromètre" },
  { href: "/#iris",      sectionId: "iris",      label: "Coach IRIS", isIris: true },
  { href: "/business",                           label: "Solutions PRO", isPro: true },
  { href: "/media",                              label: "Médias" },
  { href: "/#tarifs",    sectionId: "tarifs",    label: "Tarifs" },
];

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("accueil");
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // ScrollSpy on homepage to highlight section in viewport
  useEffect(() => {
    if (!isHomepage) return;

    const sections = ["accueil", "methode", "barometre", "iqrh", "iris", "tarifs", "partenaires"];

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 100;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomepage]);

  const scrollTo = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const navOffset = 72;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveSection(sectionId);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link: NavLink) => {
    setIsMobileMenuOpen(false);
    if (isHomepage && link.sectionId) {
      e.preventDefault();
      scrollTo(link.sectionId);
      window.history.pushState(null, "", link.href);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (isHomepage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("accueil");
      window.history.pushState(null, "", "/");
    }
  };

  const isLinkActive = (link: NavLink) => {
    if (link.href === "/business") {
      return pathname === "/business" || pathname.startsWith("/business/");
    }
    if (link.href === "/media") {
      return pathname === "/media" || pathname.startsWith("/media/");
    }
    if (isHomepage && link.sectionId) {
      if (link.sectionId === "iqrh") {
        return activeSection === "iqrh" || activeSection === "barometre";
      }
      return activeSection === link.sectionId;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3.5 shadow-2xs w-full">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Zone 1: Logo LinkOffice (conforme au design standard Navbar) */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center text-decoration-none shrink-0"
        >
          <Logo size="sm" />
        </Link>

        {/* Zone 2: Desktop Nav (Alignée sur le standard Navbar avec soulignement actif) */}
        <nav className="hidden lg:flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-jakarta font-semibold">
          {publicLinks.map((link) => {
            const active = isLinkActive(link);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`relative py-2 transition-colors ${
                  active
                    ? "text-[#00A99D] font-bold"
                    : "text-[#123D46]/70 hover:text-[#123D46]"
                }`}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D] rounded-full" />
                )}
                {link.hasPing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1 inline-block align-middle" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Identiques aux boutons capsules des autres pages) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/auth/login"
            className="hidden sm:inline-flex text-xs font-jakarta font-semibold text-[#123D46]/75 hover:text-[#123D46] px-4 py-2 rounded-full border border-[#E3EBE6] hover:border-[#00A99D] bg-[#FAF9F5] transition-all no-underline shadow-2xs"
          >
            Connexion
          </Link>
          <Link
            href="/auth/register"
            className="px-4 sm:px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap no-underline"
          >
            <span>Faire mon test IQRH</span>
            <ArrowRight size={13} className="hidden sm:inline" />
          </Link>

          {/* Mobile Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
            className="lg:hidden p-2 text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#FAF9F5] rounded-full transition-colors border border-[#E3EBE6]"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-[#E3EBE6] p-4 sm:p-6 shadow-xl flex flex-col gap-2 z-50 animate-fade-in">
            {publicLinks.map((link) => {
              const active = isLinkActive(link);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link)}
                  className={`px-4 py-2.5 rounded-full font-jakarta font-bold text-sm no-underline flex items-center justify-between transition-colors ${
                    active
                      ? "bg-[#00A99D] text-white"
                      : "text-[#123D46]/80 hover:bg-[#F4F1E8]"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.hasPing && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </Link>
              );
            })}
            <div className="mt-2 pt-3 border-t border-[#E3EBE6] flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-full font-jakarta font-bold text-sm text-center text-[#123D46] bg-[#FAF9F5] border border-[#E3EBE6] no-underline hover:bg-slate-100 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-full font-jakarta font-bold text-sm text-center text-white bg-[#00A99D] hover:bg-[#199E9A] no-underline transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Faire mon test IQRH</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
