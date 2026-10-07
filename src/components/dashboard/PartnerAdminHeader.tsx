"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/src/components/brand/Logo";
import { Bell, ChevronDown, LogOut } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
}

interface PartnerAdminHeaderProps {
  portalType: "B2B" | "B2B2C" | "B2G";
  themeColor: string;
  adminTitle: string;
  adminSubtitle: string;
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function PartnerAdminHeader({
  portalType,
  themeColor,
  adminTitle,
  adminSubtitle,
  tabs,
  activeTab,
  onTabChange
}: PartnerAdminHeaderProps) {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3 shadow-2xs">
      <div className="max-w-[1480px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="cursor-pointer hover:opacity-90 transition-opacity">
            <Logo size="sm" showTagline={false} />
          </Link>
        </div>

        <nav className="hidden sm:flex items-center gap-8 sm:gap-12 font-jakarta text-sm font-semibold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-2 transition-colors ${
                activeTab === tab.id ? 'font-bold' : 'text-[#123D46]/65 hover:text-[#123D46]'
              }`}
              style={{ color: activeTab === tab.id ? themeColor : undefined }}
            >
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span 
                  className="absolute bottom-0 left-0 w-full h-[2.5px] rounded-full" 
                  style={{ backgroundColor: themeColor }}
                />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8]/70 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-[#E3EBE6] bg-white hover:bg-[#F4F1E8]/50 transition-colors shadow-2xs"
            >
              <div 
                className="w-7 h-7 rounded-full text-white font-jakarta font-bold text-xs flex items-center justify-center"
                style={{ backgroundColor: themeColor }}
              >
                {session?.user?.name ? session.user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-xs font-jakarta font-bold text-[#123D46]">{adminTitle}</div>
                <div className="text-[10px] font-medium" style={{ color: themeColor }}>
                  {adminSubtitle}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#123D46]/50 ml-1" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E3EBE6] rounded-2xl shadow-xl p-3 z-50 animate-scale-in">
                <div className="px-3 py-2 border-b border-[#E3EBE6] mb-1">
                  <div className="font-bold text-[#123D46] text-xs">Administrateur</div>
                  <div className="text-[11px] text-[#123D46]/60">{session?.user?.email}</div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors flex items-center gap-2 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
