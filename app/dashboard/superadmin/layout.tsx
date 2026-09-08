"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Building2, Inbox, BookOpen, Users } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Organisations", href: "/dashboard/superadmin/organizations", icon: Building2 },
    { name: "Utilisateurs", href: "/dashboard/superadmin/users", icon: Users },
    { name: "Prospects", href: "/dashboard/superadmin/leads", icon: Inbox },
    { name: "Catalogue", href: "/dashboard/superadmin/catalog", icon: BookOpen },
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        
        <div className="page-container-wide">
          {/* Menu de navigation secondaire Super Admin */}
          <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 16 }}>
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              return (
                <Link key={tab.href} href={tab.href} style={{ textDecoration: "none" }}>
                  <span style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
                    background: isActive ? "rgba(192,132,252,0.15)" : "transparent",
                    color: isActive ? "#c084fc" : "#94a3b8",
                    border: isActive ? "1px solid rgba(192,132,252,0.3)" : "1px solid transparent",
                    transition: "all 0.2s ease-in-out",
                    cursor: "pointer",
                  }}>
                    <tab.icon size={18} />
                    {tab.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {children}
        </div>
      </main>
    </>
  );
}
