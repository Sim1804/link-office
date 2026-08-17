"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DashboardBilanTab } from "./DashboardBilanTab";
import { DashboardOrdonnanceTab } from "./DashboardOrdonnanceTab";
import { DashboardAnalyseTab } from "./DashboardAnalyseTab";
import { LayoutDashboard, ListChecks, BrainCircuit, History, ChevronRight } from "lucide-react";
import Link from "next/link";

export function DashboardTabs({ data, isPremium, DIMENSIONS_LABELS }: { data: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentTab = searchParams.get("tab") || "bilan";

  const tabs = [
    { id: "bilan", label: "Mon Bilan", shortLabel: "Bilan", icon: LayoutDashboard, description: "Vue d'ensemble" },
    { id: "ordonnance", label: "Mon Ordonnance", shortLabel: "Ordonnance", icon: ListChecks, description: "Plan d'action" },
    { id: "analyse", label: "Analyse Profonde", shortLabel: "Analyse", icon: BrainCircuit, description: "Psychologie" },
    { id: "historique", label: "Mon Historique", shortLabel: "Historique", icon: History, description: "Évolution" },
  ];

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const { iqrh, icr, profil } = data;
  const activeTabDef = tabs.find(t => t.id === currentTab) || tabs[0];

  return (
    <div>
      {/* ── Navigation Pills ── */}
      <div style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        marginBottom: 32,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        padding: "4px",
        background: "rgba(255,255,255,0.025)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 14,
                flex: "1 1 auto",
                justifyContent: "center",
                background: isActive
                  ? "linear-gradient(135deg, rgba(124,58,237,0.9) 0%, rgba(109,40,217,0.9) 100%)"
                  : "transparent",
                color: isActive ? "#fff" : "#64748b",
                border: "none",
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 4px 16px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
                letterSpacing: isActive ? "0.01em" : "0",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                <span>{tab.shortLabel}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Breadcrumb du contexte actif ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, marginLeft: 2 }}>
        <span style={{ color: "#334155", fontSize: 12, fontWeight: 500 }}>Dashboard</span>
        <ChevronRight size={12} style={{ color: "#334155" }} />
        <span style={{ color: "#a78bfa", fontSize: 12, fontWeight: 600 }}>{activeTabDef.label}</span>
      </div>

      {/* ── Contenu des onglets ── */}
      <div>
        {currentTab === "bilan" && (
          <DashboardBilanTab iqrh={iqrh} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
        )}
        {currentTab === "ordonnance" && (
          <DashboardOrdonnanceTab iqrh={iqrh} isPremium={isPremium} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
        )}
        {currentTab === "analyse" && (
          <DashboardAnalyseTab iqrh={iqrh} profil={profil} icr={icr} isPremium={isPremium} />
        )}
        {currentTab === "historique" && (
          <HistoriqueTab router={router} history={iqrh.history} isPremium={isPremium} />
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function HistoriqueTab({ router, history, isPremium }: { router: any, history: any[], isPremium: boolean }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{
        display: "flex", flexDirection: "column", gap: 24,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(30,27,75,0.6) 100%)",
          padding: "24px 32px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <div>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", color: "#f8fafc", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
              Carnet de Santé Relationnelle
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>
              Suivez l'évolution de votre équilibre relationnel au fil du temps.
            </p>
          </div>
          <button
            onClick={() => router.push("/consentement?retake=true")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#fff", fontWeight: 600, padding: "12px 24px", borderRadius: 14,
              border: "none", cursor: "pointer", fontSize: 14,
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "all 0.2s",
            }}
          >
            Ma situation a changé — Nouveau test
          </button>
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!isPremium && (
            <div style={{
              background: "rgba(11,15,25,0.8)", border: "1px solid rgba(124,58,237,0.3)",
              padding: "40px", borderRadius: 20, textAlign: "center",
            }}>
              <h4 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Historique Premium</h4>
              <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20 }}>L'accès à l'historique complet de vos passations est réservé aux abonnés Premium.</p>
              <Link href="/premium" style={{
                display: "inline-block",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
                fontWeight: 600, padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                textDecoration: "none"
              }}>
                Débloquer l'historique
              </Link>
            </div>
          )}
          <div style={!isPremium ? { filter: "blur(6px)", opacity: 0.4, pointerEvents: "none", userSelect: "none", display: "flex", flexDirection: "column", gap: 16 } : { display: "flex", flexDirection: "column", gap: 16 }}>
          {history?.map((item: any, index: number) => {
            const date = new Date(item.assessment?.submittedAt || item.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
            const isLatest = index === 0;
            const previousItem = history[index + 1];
            const diff = previousItem ? (item.globalScore - previousItem.globalScore) : null;
            
            return (
              <div key={item.id} style={{
                background: "rgba(17,24,39,0.5)", border: "1px solid rgba(255,255,255,0.05)",
                padding: "24px", borderRadius: 20, display: "flex", alignItems: "center", gap: 24,
                position: "relative",
              }}>
                {isLatest && (
                  <div style={{
                    position: "absolute", top: -10, left: 24, background: "#7c3aed",
                    color: "white", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, textTransform: "uppercase"
                  }}>
                    Actuel
                  </div>
                )}
                
                <div style={{ flexShrink: 0, textAlign: "center", width: 80 }}>
                  <div style={{ fontSize: 32 }}>{item.weatherIcon}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: 500 }}>{date}</div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h4 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 600 }}>{item.weatherTitle}</h4>
                    {item.assessment?.campaign && (
                      <span className="badge" style={{ background: "rgba(124,58,237,0.1)", color: "#a78bfa", borderColor: "rgba(124,58,237,0.3)" }}>
                        Campagne : {item.assessment.campaign.title}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Score global</span>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>{item.globalScore}</span>
                        <span style={{ fontSize: 14, color: "#94a3b8" }}>/ 100</span>
                        {diff !== null && diff !== 0 && (
                          <span style={{ fontSize: 13, fontWeight: 600, color: diff > 0 ? "#10b981" : "#ef4444" }}>
                            {diff > 0 ? "+" : ""}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
                    <div>
                      <span style={{ fontSize: 13, color: "#64748b" }}>Profil</span>
                      <div style={{ fontSize: 15, fontWeight: 500, color: "#e2e8f0" }}>{item.primaryProfile}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
          {(!history || history.length === 0) && (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Aucun historique disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
