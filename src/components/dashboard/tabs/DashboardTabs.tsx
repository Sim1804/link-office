"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DashboardBilanTab } from "./DashboardBilanTab";
import { DashboardOrdonnanceTab } from "./DashboardOrdonnanceTab";
import { DashboardAnalyseTab } from "./DashboardAnalyseTab";
import { DashboardJournalTab } from "./DashboardJournalTab";
import { DashboardRelationsTab } from "./DashboardRelationsTab";
import { LayoutDashboard, ListChecks, BrainCircuit, History, ChevronRight, Sparkles, Users, Book, Lock } from "lucide-react";
import Link from "next/link";

export function DashboardTabs({ data, isPremium, DIMENSIONS_LABELS }: { data: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentTab = searchParams.get("tab") || "sante";

  const tabs = [
    { id: "sante", label: "Santé & Bilans", shortLabel: "Santé", icon: LayoutDashboard, description: "Vue d'ensemble" },
    { id: "evolution", label: "Évolution & Historique", shortLabel: "Évolution", icon: History, description: "Trajectoire" },
    { id: "plan", label: "Mon Plan & Actions", shortLabel: "Plan", icon: ListChecks, description: "Priorités" },
    { id: "ressources", label: "Ressources & Prescription", shortLabel: "Ressources", icon: Sparkles, description: "Soutien" },
    { id: "relations", label: "Mes Relations & Binôme", shortLabel: "Relations", icon: Users, description: "Entourage" },
    { id: "journal", label: "Mon Journal", shortLabel: "Journal", icon: Book, description: "Notes" },
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
        {currentTab === "sante" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <DashboardBilanTab iqrh={iqrh} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
            <div style={{ marginTop: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#f8fafc", marginBottom: "16px" }}>Analyse approfondie</h3>
              <DashboardAnalyseTab iqrh={iqrh} profil={profil} icr={icr} isPremium={isPremium} />
            </div>
          </div>
        )}
        {currentTab === "plan" && (
          <DashboardOrdonnanceTab iqrh={iqrh} isPremium={isPremium} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
        )}
        {currentTab === "evolution" && (
          <HistoriqueTab router={router} history={iqrh.history} isPremium={isPremium} />
        )}
        {currentTab === "ressources" && (
          <div style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>
            Bibliothèque de ressources et prescription (En construction)
          </div>
        )}
        {currentTab === "relations" && (
          <DashboardRelationsTab isPremium={isPremium} />
        )}
        {currentTab === "journal" && (
          <DashboardJournalTab isPremium={isPremium} />
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

const DIMENSION_CONFIG = [
  { key: "socialScore",        label: "Social",       color: "#38bdf8", short: "S" },
  { key: "affectiveScore",     label: "Affectif",     color: "#a78bfa", short: "A" },
  { key: "sentimentalScore",   label: "Sentimental",  color: "#f472b6", short: "Se" },
  { key: "professionalScore",  label: "Pro.",          color: "#34d399", short: "P" },
  { key: "selfScore",          label: "Soi",           color: "#fb923c", short: "So" },
];

function ScoreBar({ value, color, previousValue }: { value: number; color: string; previousValue?: number }) {
  const diff = previousValue !== undefined ? Math.round(value - previousValue) : null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1, height: 5, borderRadius: 3,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${Math.min(value, 100)}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
          opacity: 0.85,
          transition: "width 0.6s ease-out",
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#f8fafc", minWidth: 24, textAlign: "right" }}>
        {Math.round(value)}
      </span>
      {diff !== null && diff !== 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700,
          color: diff > 0 ? "#10b981" : "#ef4444",
          minWidth: 22, textAlign: "right",
        }}>
          {diff > 0 ? "+" : ""}{diff}
        </span>
      )}
    </div>
  );
}

function HistoriqueTab({ router, history, isPremium }: { router: any, history: any[], isPremium: boolean }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
          background: "linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(30,27,75,0.6) 100%)",
          padding: "24px 28px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
                color: "#f8fafc", fontSize: 20, fontWeight: 800, margin: 0,
              }}>
                Carnet de Santé Relationnelle
              </h3>
            </div>
            <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
              {history?.length ?? 0} passation{(history?.length ?? 0) > 1 ? "s" : ""} enregistrée{(history?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/consentement?retake=true")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
              color: "#fff", fontWeight: 600, padding: "11px 22px", borderRadius: 12,
              border: "none", cursor: "pointer", fontSize: 13,
              boxShadow: "0 4px 20px rgba(124,58,237,0.35)", transition: "all 0.2s",
            }}
          >
            🔄 Nouveau test
          </button>
        </div>

        {/* Paywall */}
        {!isPremium && (
          <div style={{
            marginTop: 8,
            borderRadius: 24,
            border: "1px solid rgba(124,58,237,0.2)",
            overflow: "hidden",
            position: "relative",
          }}>
            {/* Blurred preview content */}
            <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "24px", pointerEvents: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ width: 150, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
                  <div style={{ width: 80, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
                </div>
                <div style={{ width: "100%", height: 120, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              </div>
            </div>
            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 50%)",
            }} />
            {/* CTA */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
              padding: "40px 32px 32px",
              textAlign: "center",
            }}>
              <div style={{
                width: 48, height: 48, margin: "0 auto 16px",
                borderRadius: 12, background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Lock size={20} color="#94a3b8" />
              </div>
              <h4 style={{ fontFamily: "Inter, sans-serif", color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Historique réservé aux abonnés Premium
              </h4>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
                Comparez vos passations dans le temps et visualisez l'évolution de chaque dimension relationnelle.
              </p>
              <Link href="/premium" style={{
                display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, textDecoration: "none"
              }}>
                Débloquer l'historique →
              </Link>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div style={!isPremium ? {
          filter: "blur(8px)", opacity: 0.3,
          pointerEvents: "none", userSelect: "none",
          display: "flex", flexDirection: "column", gap: 16,
        } : { display: "flex", flexDirection: "column", gap: 16 }}>

          {history?.map((item: any, index: number) => {
            const date = new Date(item.assessment?.submittedAt || item.createdAt)
              .toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
            const isLatest = index === 0;
            const previousItem = history[index + 1];
            const globalDiff = previousItem ? Math.round(item.globalScore - previousItem.globalScore) : null;
            const score = Math.round(item.globalScore);

            // Couleur du score global
            const scoreColor = score >= 70 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

            return (
              <div key={item.id} style={{
                background: isLatest
                  ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(17,24,39,0.7) 100%)"
                  : "rgba(17,24,39,0.5)",
                border: isLatest
                  ? "1px solid rgba(124,58,237,0.2)"
                  : "1px solid rgba(255,255,255,0.05)",
                padding: "22px 24px",
                borderRadius: 20,
                position: "relative",
                transition: "border-color 0.2s",
              }}>
                {/* Badge actuel */}
                {isLatest && (
                  <div style={{
                    position: "absolute", top: -11, left: 20,
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "white", fontSize: 10, fontWeight: 800,
                    padding: "3px 12px", borderRadius: 999,
                    textTransform: "uppercase", letterSpacing: "0.06em",
                    boxShadow: "0 2px 12px rgba(124,58,237,0.4)",
                  }}>
                    Passation actuelle
                  </div>
                )}

                {/* Ligne supérieure : météo + score + date */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
                  {/* Icône météo */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 14,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, flexShrink: 0,
                  }}>
                    {item.weatherIcon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                      <h4 style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700, margin: 0 }}>
                        {item.weatherTitle}
                      </h4>
                      {item.assessment?.campaign && (
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                          border: "1px solid rgba(124,58,237,0.2)",
                          padding: "2px 8px", borderRadius: 6,
                        }}>
                          {item.assessment.campaign.title}
                        </span>
                      )}
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{date}</p>
                  </div>

                  {/* Score global */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                        {score}
                      </span>
                      <span style={{ fontSize: 13, color: "#475569" }}>/100</span>
                    </div>
                    {globalDiff !== null && globalDiff !== 0 && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 3, marginTop: 4,
                        fontSize: 12, fontWeight: 700,
                        color: globalDiff > 0 ? "#10b981" : "#ef4444",
                        background: globalDiff > 0 ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                        padding: "2px 8px", borderRadius: 6,
                      }}>
                        {globalDiff > 0 ? "▲" : "▼"} {Math.abs(globalDiff)} pts
                      </div>
                    )}
                    {globalDiff === null && (
                      <p style={{ color: "#334155", fontSize: 11, margin: "4px 0 0", textAlign: "right" }}>
                        1ère passation
                      </p>
                    )}
                  </div>
                </div>

                {/* Séparateur */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 16 }} />

                {/* Barres de dimensions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                  {DIMENSION_CONFIG.map(dim => {
                    const val = item[dim.key] ?? 0;
                    const prevVal = previousItem?.[dim.key];
                    return (
                      <div key={dim.key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 500 }}>
                            {dim.label}
                          </span>
                        </div>
                        <ScoreBar value={val} color={dim.color} previousValue={prevVal} />
                      </div>
                    );
                  })}
                </div>

                {/* Profil */}
                {item.primaryProfile && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#475569" }}>Profil :</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: "#a78bfa",
                      background: "rgba(167,139,250,0.08)",
                      border: "1px solid rgba(167,139,250,0.15)",
                      padding: "2px 10px", borderRadius: 6,
                    }}>
                      {item.primaryProfile}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {(!history || history.length === 0) && (
            <div style={{
              padding: "48px 32px", textAlign: "center",
              background: "rgba(255,255,255,0.015)",
              border: "1px dashed rgba(255,255,255,0.07)",
              borderRadius: 20,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
                Aucune passation enregistrée pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
