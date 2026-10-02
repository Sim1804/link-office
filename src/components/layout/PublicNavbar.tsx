"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "../brand/Logo";

const publicLinks = [
  { href: "/#methode",     label: "La méthode" },
  { href: "/#barometre",   label: "Baromètre en direct", hasPing: true },
  { href: "/#iqrh",        label: "IQRH" },
  { href: "/#iris",        label: "Coach IRIS", isIris: true },
  { href: "/business",     label: "Solutions" },
  { href: "/media",        label: "Médias" },
  { href: "/#partenaires", label: "Partenaires" },
  { href: "/#tarifs",      label: "Tarifs" },
];

export function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) return false; // In a real app, use IntersectionObserver for hash links
    if (href === "/" && pathname !== "/") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <div className="fixed top-4 left-4 right-4 z-50 max-w-[1440px] mx-auto">
        <header className="bg-white/95 backdrop-blur-md border border-[#E3EBE6] px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs rounded-2xl">
          
          {/* Zone 1: Logo */}
          <Link href="/" className="flex items-center shrink-0 pr-4 no-underline group">
            <Logo size="md" />
          </Link>

          {/* Zone 2: Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 text-[13px] font-jakarta font-semibold text-[#123D46]/80">
            {publicLinks.map(({ href, label, hasPing, isIris }) => {
              const active = isLinkActive(href);
              
              if (isIris) {
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 no-underline ${
                      active ? 'text-[#5965E8] font-bold bg-[#5965E8]/10' : 'hover:text-[#5965E8] hover:bg-[#5965E8]/8'
                    }`}
                  >
                    <span>{label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 no-underline ${
                    active ? 'text-[#00A99D] font-bold bg-[#00A99D]/10' : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
                  }`}
                >
                  <span>{label}</span>
                  {hasPing && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/auth/login"
              className="hidden md:flex text-xs font-jakarta font-semibold text-[#123D46]/75 hover:text-[#123D46] px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors no-underline"
            >
              Connexion
            </Link>
            <Link
              href="/auth/register"
              className="px-4 sm:px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-2 group whitespace-nowrap no-underline"
            >
              <span>Faire mon test</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform hidden sm:block">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            
            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#123D46]/70 hover:bg-slate-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border border-[#E3EBE6] rounded-2xl p-4 shadow-lg flex flex-col gap-2">
            {publicLinks.map(({ href, label, isIris }) => {
              const active = isLinkActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl font-jakarta font-bold text-sm no-underline ${
                    active 
                      ? (isIris ? 'bg-[#5965E8] text-white' : 'bg-[#00A99D] text-white')
                      : 'text-[#123D46]/80 hover:bg-[#F4F1E8]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="mt-2 pt-4 border-t border-[#E3EBE6] flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2.5 rounded-xl font-jakarta font-bold text-sm text-center text-[#123D46] bg-[#FAF9F5] border border-[#E3EBE6] no-underline"
              >
                Connexion
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
