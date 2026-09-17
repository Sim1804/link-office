"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, HeartPulse, Landmark } from "lucide-react";
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
    <div className="page-container-wide">
      {/* Navigation Tabs Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 6, background: "var(--surface)", borderRadius: 999, border: "1px solid var(--border-strong)", marginBottom: 32, overflowX: "auto" }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
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
                boxShadow: isActive ? "var(--shadow-glow-cyan)" : "none",
              }}>
                <tab.icon size={18} />
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
