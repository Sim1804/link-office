"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/src/components/brand/Logo";
import { Bell, ChevronDown, LogOut, ArrowUpRight, ShieldCheck, Building2 } from "lucide-react";
import { PartnerPortalsNavigation } from "@/src/components/superadmin/PartnerPortalsNavigation";

export interface PartnerAdminTabItem {
  id: string;
  label: string;
  href?: string;
}

export interface PartnerAdminHeaderProps {
  portalType: "B2B" | "B2B2C" | "B2G";
  themeColor?: string;
  adminTitle?: string;
  adminSubtitle?: string;
  tabs?: PartnerAdminTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  hidePortalNav?: boolean;
}

const PORTAL_CONFIG: Record<
  "B2B" | "B2B2C" | "B2G",
  {
    themeColor: string;
    adminTitle: string;
    adminSubtitle: string;
    label: string;
    defaultTabs: PartnerAdminTabItem[];
  }
> = {
  B2B: {
    themeColor: "#00A99D",
    adminTitle: "RH Admin B2B",
    adminSubtitle: "Espace Entreprise",
    label: "Portail Entreprises",
    defaultTabs: [
      { id: "observatoire", label: "Observatoire", href: "/dashboard/b2b" },
      { id: "campagnes", label: "Campagnes", href: "/dashboard/b2b/campaigns" },
      { id: "actions", label: "Plan d'actions", href: "/dashboard/b2b/actions" },
    ],
  },
  B2B2C: {
    themeColor: "#5965E8",
    adminTitle: "Admin Mutuelle B2B2C",
    adminSubtitle: "Espace Mutuelle",
    label: "Portail Mutuelles",
    defaultTabs: [
      { id: "observatoire", label: "Observatoire", href: "/dashboard/b2b2c" },
      { id: "campagnes", label: "Campagnes", href: "/dashboard/b2b2c/campaigns" },
      { id: "actions", label: "Plan d'actions", href: "/dashboard/b2b2c/actions" },
    ],
  },
  B2G: {
    themeColor: "#F26D35",
    adminTitle: "Admin Collectivité B2G",
    adminSubtitle: "Observatoire Territoire",
    label: "Portail Collectivités",
    defaultTabs: [
      { id: "observatoire", label: "Observatoire", href: "/dashboard/b2g" },
      { id: "consultations", label: "Consultations Citoyennes", href: "/dashboard/b2g/campaigns" },
      { id: "actions", label: "Plan d'actions", href: "/dashboard/b2g/actions" },
    ],
  },
};

export function PartnerAdminHeader({
  portalType,
  themeColor,
  adminTitle,
  adminSubtitle,
  tabs,
  activeTab,
  onTabChange,
  hidePortalNav = false
}: PartnerAdminHeaderProps) {
  const pathname = usePathname() || "";
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const config = PORTAL_CONFIG[portalType];

  const effectiveThemeColor = themeColor || config.themeColor;
  const effectiveAdminTitle = adminTitle || config.adminTitle;
  const effectiveAdminSubtitle = adminSubtitle || config.adminSubtitle;
  const effectiveTabs = tabs && tabs.length > 0 ? tabs : config.defaultTabs;

  const resolvedActiveTab = activeTab || (() => {
    if (pathname.includes("/actions")) return "actions";
    if (pathname.includes("/campaigns")) return portalType === "B2G" ? "consultations" : "campagnes";
    return "observatoire";
  })();

  const portalLabel = config.label;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-decoration-none shrink-0 hover:opacity-90 transition-opacity">
            <Logo size="navbar" showTagline={false} />
          </Link>

          <nav className="hidden sm:flex items-center gap-8 sm:gap-12 font-jakarta text-sm font-semibold">
            {effectiveTabs.map((tab) => {
              const isTabActive = resolvedActiveTab === tab.id;
              const isParentPath = pathname === `/dashboard/${portalType.toLowerCase()}`;
              const shouldUseButton = !!onTabChange && (!tab.href || (isParentPath && (tab.id === 'observatoire' || tab.id === 'campagnes' || tab.id === 'consultations')));

              if (shouldUseButton || !tab.href) {
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={`relative py-2 transition-colors cursor-pointer ${
                      isTabActive ? 'font-bold' : 'text-[#123D46]/65 hover:text-[#123D46]'
                    }`}
                    style={{ color: isTabActive ? effectiveThemeColor : undefined }}
                  >
                    <span>{tab.label}</span>
                    {isTabActive && (
                      <span 
                        className="absolute bottom-0 left-0 w-full h-[2.5px] rounded-full" 
                        style={{ backgroundColor: effectiveThemeColor }}
                      />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative py-2 transition-colors cursor-pointer ${
                    isTabActive ? 'font-bold' : 'text-[#123D46]/65 hover:text-[#123D46]'
                  }`}
                  style={{ color: isTabActive ? effectiveThemeColor : undefined }}
                >
                  <span>{tab.label}</span>
                  {isTabActive && (
                    <span 
                      className="absolute bottom-0 left-0 w-full h-[2.5px] rounded-full" 
                      style={{ backgroundColor: effectiveThemeColor }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link
                href="/"
                className="hidden lg:inline-flex items-center gap-1 text-xs text-[#123D46]/60 hover:text-[#00A99D] font-medium mr-1"
                title="Retourner au site public SaaS"
              >
                <span>Site public</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {isSuperAdmin && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFC629] ring-2 ring-white animate-pulse" />
                )}
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-[#E3EBE6] bg-white hover:bg-[#F4F1E8]/50 transition-colors shadow-2xs"
              >
                {isSuperAdmin ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#123D46] to-[#1a5663] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    SA
                  </div>
                ) : (
                  <div 
                    className="w-7 h-7 rounded-full text-white font-jakarta font-bold text-xs flex items-center justify-center"
                    style={{ backgroundColor: effectiveThemeColor }}
                  >
                    {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
                  </div>
                )}

                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-jakarta font-bold text-[#123D46]">
                    {isSuperAdmin ? "Super Admin" : effectiveAdminTitle}
                  </div>
                  <div
                    className="text-[10px] font-semibold mt-0.5"
                    style={{ color: effectiveThemeColor }}
                  >
                    {isSuperAdmin ? `Inspection ${portalType}` : effectiveAdminSubtitle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#123D46]/50 ml-1" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-2.5 z-50 animate-scale-in text-xs">
                  <div className="px-3 py-2 border-b border-[#E3EBE6] mb-2">
                    <div className="font-bold text-[#123D46]">
                      {isSuperAdmin ? "Super Administrateur" : (effectiveAdminTitle || "Administrateur")}
                    </div>
                    <div className="text-[#123D46]/60 truncate font-mono text-[11px]">
                      {session?.user?.email || "admin@linkoffice.fr"}
                    </div>
                    {isSuperAdmin && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFC629]/15 text-[#123D46] font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
                        <span>{portalLabel} (Inspection)</span>
                      </div>
                    )}
                  </div>

                  {isSuperAdmin && (
                    <div className="space-y-1 mb-2">
                      <Link
                        href="/dashboard/superadmin"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#00A99D] bg-[#00A99D]/10 hover:bg-[#00A99D]/15 font-bold transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Console Super Admin</span>
                      </Link>

                      <Link
                        href="/"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-3 py-2 rounded-xl text-[#123D46] hover:bg-[#F4F1E8] font-medium transition-colors flex items-center gap-2"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#123D46]/50 shrink-0" />
                        <span>Voir site public SaaS</span>
                      </Link>
                    </div>
                  )}

                  <div className="h-px bg-[#E3EBE6] my-1" />

                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut({ callbackUrl: '/' });
                    }} 
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center gap-2"
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

      {isSuperAdmin && !hidePortalNav && (
        <PartnerPortalsNavigation />
      )}
    </>
  );
}
