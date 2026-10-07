"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard, Building2, Wallet, Newspaper, Users, Handshake, FolderTree, ShieldCheck,
  Bell, ArrowUpRight, ChevronDown, LogOut, Sparkles, Plus, Search, CheckCircle2, AlertTriangle, FileSpreadsheet
} from "lucide-react";

interface SuperAdminHeaderProps {
  stats: any;
}

export function SuperAdminHeader({ stats }: SuperAdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const [showNotifications, setShowNotifications] = useState(false);
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-[1480px] mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
              <Logo size="sm" showTagline={false} />
            </Link>
          </div>

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
              className="hidden lg:inline-flex items-center gap-1 text-xs text-[#123D46]/60 hover:text-[#00A99D] font-medium mr-2"
              title="Retourner au site public SaaS"
            >
              <span>Site public</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFC629] ring-2 ring-white animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-4 z-50 animate-scale-in text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E3EBE6]">
                    <span className="font-jakarta font-bold text-[#123D46]">Centre de Notifications</span>
                    <span className="text-[10px] font-bold text-[#00A99D] bg-[#00A99D]/10 px-2 py-0.5 rounded-full">
                      2 non lues
                    </span>
                  </div>
                  <div className="divide-y divide-[#E3EBE6]/60 mt-2 max-h-60 overflow-y-auto space-y-2">
                    <div className="pt-2 text-[#123D46]">
                      <div className="flex items-center gap-1.5 font-bold text-[#123D46]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                        <span>Nouveau devis entrant</span>
                      </div>
                      <p className="text-[11px] text-[#123D46]/70 mt-0.5">
                        Groupe Méridien (450 salariés) a demandé un chiffrage B2B.
                      </p>
                      <span className="text-[10px] text-[#123D46]/40">Hier à 16:40</span>
                    </div>
                    <div className="pt-2 text-[#123D46]">
                      <div className="flex items-center gap-1.5 font-bold text-[#123D46]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
                        <span>Alerte Binôme</span>
                      </div>
                      <p className="text-[11px] text-[#123D46]/70 mt-0.5">
                        Le score IQRH global est passé sous les 70 points.
                      </p>
                      <span className="text-[10px] text-[#123D46]/40">Il y a 2 jours</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-[#E3EBE6] mx-1 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#E3EBE6] hover:bg-[#F4F1E8]/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#123D46] to-[#1a5663] text-white flex items-center justify-center font-bold text-xs shadow-xs">
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
        <div className="max-w-[1480px] mx-auto flex items-center gap-1.5 sm:gap-2">
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
                {tab.key === 'organisations' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-[#00A99D]/20 text-[#00A99D]' : 'bg-[#123D46]/5 text-[#123D46]/70'
                  }`}>
                    {stats?.totalOrganizations || 0}
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
