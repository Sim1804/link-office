"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, HeartPulse, Landmark, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

export function PartnerPortalsNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Only render for SUPER_ADMIN
  if (session?.user?.role !== "SUPER_ADMIN") return null;

  const tabs = [
    { name: "Entreprises (B2B)", href: "/dashboard/b2b", icon: Building2 },
    { name: "Mutuelles (B2B2C)", href: "/dashboard/b2b2c", icon: HeartPulse },
    { name: "Collectivités (B2G)", href: "/dashboard/b2g", icon: Landmark },
  ];

  return (
    <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-[#E3EBE6] rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2 px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-[#FFC629] animate-pulse" />
          <span className="text-xs font-jakarta font-bold text-[#123D46]">Vue Super Admin</span>
          <span className="text-[11px] text-[#123D46]/60 hidden sm:inline">— Inspection des portails partenaires :</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-jakarta transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#123D46] text-white font-bold shadow-xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46] hover:bg-[#F4F1E8] font-medium'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
          <div className="h-4 w-px bg-[#E3EBE6] mx-1 hidden sm:block" />
          <Link
            href="/dashboard/superadmin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-jakarta font-bold text-[#00A99D] hover:bg-[#00A99D]/10 transition-colors whitespace-nowrap"
          >
            <span>Retour Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
