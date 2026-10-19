"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import {
  LayoutDashboard, Building2, Wallet, Newspaper, Users, Handshake, FolderTree, ShieldCheck,
  ArrowUpRight, ChevronDown, LogOut, Sparkles, Plus, Search, CheckCircle2, AlertTriangle, FileSpreadsheet
} from "lucide-react";

interface SuperAdminHeaderProps {
  stats: any;
}

export function SuperAdminHeader({ stats }: SuperAdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const tabs = [
    { key: "dashboard", name: "Dashboard 360", href: "/dashboard/superadmin", exact: true, icon: LayoutDashboard },
    { key: "devis", name: "Devis", href: "/dashboard/superadmin/leads", icon: FileSpreadsheet, badge: stats?.leadsUrgent > 0 ? stats.leadsUrgent : undefined },
    { key: "organisations", name: "Organisations", href: "/dashboard/superadmin/organizations", icon: Building2 },
    { key: "finances", name: "Finances", href: "/dashboard/superadmin/billing", icon: Wallet },
    { key: "medias", name: "Médias", href: "/dashboard/superadmin/media", icon: Newspaper },
    { key: "utilisateurs", name: "Utilisateurs", href: "/dashboard/superadmin/users", icon: Users },
    { key: "binomes", name: "Binômes", href: "/dashboard/superadmin/binome", icon: Handshake },
    { key: "catalogues", name: "Catalogues", href: "/dashboard/superadmin/catalog", icon: FolderTree },
    { key: "securite", name: "Sécurité", href: "/dashboard/superadmin/security", icon: ShieldCheck },
  ];

  return (
    <>
      {/* 1. TOP HEADER */}
      <header className="sticky top-0 z-40 h-16 min-h-16 max-h-16 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 shadow-2xs w-full flex items-center box-border transition-all">
        <div className="max-w-[1440px] mx-auto w-full h-full flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center text-decoration-none shrink-0 hover:opacity-90 transition-opacity">
            <Logo size="navbar" showTagline={false} />
          </Link>

          {/* Center: Top Level Switcher (Console Administrateur vs Portails Partenaires) */}
          <nav className="flex items-center gap-4 sm:gap-8 font-jakarta text-sm font-semibold">
            <Link
              href="/dashboard/superadmin"
              className="relative py-2 transition-colors text-[#00A99D] font-bold"
            >
              <span>Console administrateur</span>
              <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#00A99D] rounded-full" />
            </Link>

            <Link
              href="/dashboard/b2b"
              className="relative py-2 transition-colors text-[#123D46]/60 hover:text-[#123D46]"
            >
              <span>Portails partenaires</span>
            </Link>
          </nav>

          {/* Right: Notifications & Super Admin Profile */}
          <div className="flex items-center gap-3 relative">
            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1 text-xs text-[#123D46]/60 hover:text-[#00A99D] font-medium mr-1"
              title="Retourner au site public SaaS"
            >
              <span>Site public</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <NotificationBell />

            <div className="w-px h-6 bg-[#E3EBE6] mx-1 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 h-9 px-2 rounded-full border border-[#E3EBE6] hover:bg-[#F4F1E8]/50 transition-colors cursor-pointer shadow-2xs"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#123D46] to-[#1a5663] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  SA
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[11px] font-bold text-[#123D46] leading-none">Super Admin</span>
                  <span className="text-[10px] text-[#00A99D] font-semibold mt-0.5">Console active</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#123D46]/50 ml-1 hidden sm:block" />
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-2 z-50 animate-scale-in text-xs">
                  <div className="px-3 py-2 border-b border-[#E3EBE6] mb-2">
                    <div className="font-bold text-[#123D46]">Super Administrateur</div>
                    <div className="text-[#123D46]/60">admin@linkoffice.fr</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      router.push('/dashboard/b2b');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#123D46] hover:bg-[#F4F1E8] font-medium transition-colors flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#123D46]/50" />
                    <span>Voir portails partenaires</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowAdminMenu(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium transition-colors flex items-center gap-2 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. HORIZONTAL SUB-NAVIGATION TABS */}
      <div className="bg-white border-b border-[#E3EBE6] px-4 sm:px-8 overflow-x-auto scrollbar-none py-2.5">
        <div className="max-w-[1440px] mx-auto flex items-center gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-jakarta transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#00A99D]/12 text-[#00A99D] ring-1 ring-[#00A99D]/30 font-bold shadow-2xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 font-semibold'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.badge && (
                  <span className="w-4 h-4 rounded-full bg-[#FFC629] text-[#123D46] text-[10px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
