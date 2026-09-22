"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Building2, Inbox, Users, Newspaper,
  LayoutDashboard, ListChecks, CreditCard, Handshake, Shield
} from "lucide-react";
import { IrisDrawer } from "@/components/superadmin/IrisDrawer";

interface SuperAdminNavigationProps {
  stats: {
    orgsTotal: number;
    orgsB2B: number;
    orgsB2B2C: number;
    orgsB2G: number;
    leadsUrgent: number;
    leadsTotal: number;
    usersTotal: number;
    mediaTotal: number;
  };
}

export function SuperAdminNavigation({ stats }: SuperAdminNavigationProps) {
  const pathname = usePathname();
  const [isIrisOpen, setIsIrisOpen] = useState(false);

  const tabs = [
    { name: "Dashboard 360", href: "/dashboard/superadmin", exact: true, icon: LayoutDashboard },
    { name: "Devis", href: "/dashboard/superadmin/leads", badge: stats.leadsUrgent > 0 ? stats.leadsUrgent.toString() : undefined, icon: Inbox },
    { name: "Organisations", href: "/dashboard/superadmin/organizations", icon: Building2 },
    { name: "Finances", href: "/dashboard/superadmin/billing", icon: CreditCard },
    { name: "Médias", href: "/dashboard/superadmin/media", icon: Newspaper },
    { name: "Utilisateurs", href: "/dashboard/superadmin/users", icon: Users },
    { name: "Binômes", href: "/dashboard/superadmin/binome", icon: Handshake },
    { name: "Catalogues", href: "/dashboard/superadmin/catalog", icon: ListChecks },
    { name: "Sécurité", href: "/dashboard/superadmin/security", icon: Shield },
  ];

  return (
    <>
      {/* Subtle Ambient Glow Canvas Decorator */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, left: "25%", width: 400, height: 400, borderRadius: "50%", background: "rgba(0,169,157,0.05)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", top: 200, right: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(90,102,233,0.05)", filter: "blur(80px)" }} />
      </div>

      <div className="page-container-wide">
        {/* Navigation Tabs Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, background: "var(--surface)", borderRadius: 999, border: "1px solid var(--border-strong)", marginBottom: 32, marginTop: 32, overflowX: "auto" }}>
          {tabs.map((tab) => {
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link key={tab.href} href={tab.href} style={{ textDecoration: "none", flexShrink: 0 }}>
                <span style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 20px", fontSize: 14, fontWeight: isActive ? 600 : 500,
                  color: isActive ? "white" : "var(--text-2)",
                  background: isActive ? "var(--primary)" : "transparent",
                  borderRadius: 999,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  boxShadow: isActive ? "0 2px 8px rgba(0,169,157,0.2)" : "none"
                }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "rgba(18,61,70,0.03)"; e.currentTarget.style.color = "var(--text-1)"; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  <tab.icon size={18} />
                  {tab.name}
                  {tab.badge && (
                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: isActive ? "white" : "#f59e0b", color: isActive ? "var(--primary)" : "white", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginLeft: 4 }}>
                      {tab.badge}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <IrisDrawer isOpen={isIrisOpen} onClose={() => setIsIrisOpen(false)} />
    </>
  );
}
