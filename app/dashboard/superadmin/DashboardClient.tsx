"use client";

import { Building2, Handshake, Users, ChevronRight, Activity, BookOpen, LayoutDashboard, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DashboardTabs } from "@/components/ui/DashboardTabs";
import { BarometreDashboard } from "@/components/superadmin/barometre/BarometreDashboard";

interface DashboardClientProps {
  stats: {
    orgsTotal: number;
    orgsB2B: number;
    orgsB2B2C: number;
    orgsB2G: number;
    leadsUrgent: number;
    leadsTotal: number;
    usersTotal: number;
    mediaTotal: number;
    recentLeads?: any[];
  };
  availableRegions: string[];
}

const KPI_CARDS = [
  {
    key: "orgs",
    label: "Organisations",
    accentColor: "#00A99D",
    icon: Building2,
    badge: "+12% T1",
    badgeColor: "#00A99D",
  },
  {
    key: "leads",
    label: "Devis Entrants",
    accentColor: "#f59e0b",
    icon: Handshake,
    badge: null,
    badgeColor: "#f59e0b",
  },
  {
    key: "users",
    label: "Comptes Rattachés",
    accentColor: "#6366f1",
    icon: Users,
    badge: null,
    badgeColor: "#6366f1",
  },
  {
    key: "media",
    label: "Médias Actifs",
    accentColor: "#10b981",
    icon: BookOpen,
    badge: null,
    badgeColor: "#10b981",
  },
];

export function DashboardClient({ stats, availableRegions }: DashboardClientProps) {
  const [mainTab, setMainTab] = useState("general");

  const kpiValues: Record<string, { value: string | number; sub?: string }> = {
    orgs: {
      value: stats.orgsTotal,
      sub: `${stats.orgsB2B} B2B · ${stats.orgsB2B2C} Mutuelles · ${stats.orgsB2G} Collectivités`,
    },
    leads: {
      value: stats.leadsTotal,
      sub: stats.leadsUrgent > 0 ? `${stats.leadsUrgent} nécessitent une action urgente` : "Tous traités · Aucun en attente",
    },
    users: {
      value: stats.usersTotal.toLocaleString("fr-FR"),
      sub: "Employés, DRH et bénéficiaires",
    },
    media: {
      value: stats.mediaTotal,
      sub: "Articles, podcasts et recommandations",
    },
  };

  return (
    <>
      {/* Page Title */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          Gouvernance & Laboratoire du Lien Humain
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
          Pilotage unifié · Modélisation IQRH · Pipeline commercial · Co-pilotage IRIS
        </p>
      </div>

      {/* Tab Navigation */}
      <DashboardTabs
        tabs={[
          { key: "general", label: "Vue Générale", icon: LayoutDashboard },
          { key: "barometre", label: "Baromètre National", icon: Activity },
        ]}
        activeTab={mainTab}
        onTabChange={setMainTab}
      />

      {mainTab === "general" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {KPI_CARDS.map((card) => {
              const { value, sub } = kpiValues[card.key];
              const Icon = card.icon;
              const isLeadsUrgent = card.key === "leads" && stats.leadsUrgent > 0;

              return (
                <div key={card.key} style={{
                  background: "var(--surface)",
                  borderRadius: 14,
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${card.accentColor}`,
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "box-shadow 0.2s",
                }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(18,61,70,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {card.label}
                    </span>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${card.accentColor}14`, display: "flex", alignItems: "center", justifyContent: "center", color: card.accentColor }}>
                      <Icon size={15} />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontSize: 32, fontWeight: 900, color: isLeadsUrgent ? card.accentColor : "var(--text-1)", fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {value}
                    </span>
                    {card.badge && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: card.accentColor }}>{card.badge}</span>
                    )}
                  </div>

                  {sub && (
                    <p style={{ fontSize: 11, color: isLeadsUrgent ? "#f59e0b" : "var(--text-3)", lineHeight: 1.4, margin: 0 }}>
                      {sub}
                    </p>
                  )}

                  {/* Breakdown for orgs */}
                  {card.key === "orgs" && stats.orgsTotal > 0 && (
                    <div style={{ height: 3, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}>
                      <div style={{ width: `${(stats.orgsB2B / stats.orgsTotal) * 100}%`, height: "100%", background: card.accentColor, borderRadius: 99 }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pipeline Entrant */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <Handshake size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Pipeline Entrant</h3>
                  <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0 }}>Nouvelles demandes à traiter</p>
                </div>
              </div>
              <Link href="/dashboard/superadmin/leads">
                <button className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                  Voir tout <ChevronRight size={12} />
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
              {stats.recentLeads && stats.recentLeads.length > 0 ? (
                stats.recentLeads.map((lead: any) => (
                  <div key={lead.id} style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "14px 16px",
                    display: "flex", flexDirection: "column", gap: 8,
                    transition: "border-color 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,169,157,0.3)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{lead.organization}</div>
                      <span className="badge badge-violet" style={{ fontSize: 10 }}>{lead.planType}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={11} />
                      {lead.companySize || lead.populationSize || lead.beneficiaries || "N/A"} personnes
                    </div>
                    <Link href="/dashboard/superadmin/leads" style={{ marginTop: 4 }}>
                      <button className="btn btn-primary" style={{ width: "100%", padding: "7px", fontSize: 12 }}>
                        Inspecter & Convertir
                      </button>
                    </Link>
                  </div>
                ))
              ) : (
                <div style={{ padding: "24px", textAlign: "center", color: "var(--text-3)", fontSize: 13, gridColumn: "1/-1", border: "1px dashed var(--border)", borderRadius: 10 }}>
                  Aucun lead entrant en attente.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {mainTab === "barometre" && (
        <BarometreDashboard availableRegions={availableRegions} />
      )}
    </>
  );
}
