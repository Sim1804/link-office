"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DashboardBilanTab } from "./DashboardBilanTab";
import { DashboardOrdonnanceTab } from "./DashboardOrdonnanceTab";
import { DashboardAnalyseTab } from "./DashboardAnalyseTab";
import { DashboardJournalTab } from "./DashboardJournalTab";
import { DashboardRelationsTab } from "./DashboardRelationsTab";
import { DashboardRessourcesTab } from "./DashboardRessourcesTab";
import { UpsellBanner } from "@/components/ui/UpsellBanner";
import { LayoutDashboard, ListChecks, BrainCircuit, History, ChevronRight, Sparkles, Users, Book, Lock } from "lucide-react";
import Link from "next/link";

export function DashboardTabs({ data, isPremium, isPremiumPlus, DIMENSIONS_LABELS }: { data: any, isPremium: boolean, isPremiumPlus?: boolean, DIMENSIONS_LABELS: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const currentTab = searchParams.get("tab") || "sante";

  const tabs = [
    { id: "sante", label: "Santé & Bilans", shortLabel: "Santé", icon: "🩺", description: "Vue d'ensemble" },
    { id: "evolution", label: "Évolution & Historique", shortLabel: "Évolution", icon: "⏱️", description: "Trajectoire" },
    { id: "plan", label: "Mon Plan & Actions", shortLabel: "Plan", icon: "📋", description: "Priorités" },
    { id: "ressources", label: "Ressources & Partenaires", shortLabel: "Ressources", icon: "✨", description: "Soutien" },
    { id: "relations", label: "Mes Relations & Binôme", shortLabel: "Relations", icon: "👥", description: "Entourage" },
    { id: "journal", label: "Mon Journal", shortLabel: "Journal", icon: "📖", description: "Notes" },
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
      {/* ── Navigation en pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto mb-6 pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-jakarta font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#00A99D] text-white shadow-xs'
                  : 'bg-white text-[#123D46]/75 hover:bg-[#FAF9F5] border border-[#E3EBE6]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* ── Fil d'Ariane contextuel ── */}
      <div className="text-xs text-[#123D46]/50 font-medium mb-6">
        Dashboard &gt; <strong className="text-[#123D46]">{activeTabDef.label}</strong>
      </div>

      {/* ── Contenu des onglets ── */}
      <div>
        {currentTab === "sante" && (
          <div className="flex flex-col gap-8">
            <DashboardBilanTab iqrh={iqrh} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
            <div className="mt-4">
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mb-4">Analyse approfondie</h3>
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
          <DashboardRessourcesTab iqrh={iqrh} isPremium={isPremium} DIMENSIONS_LABELS={DIMENSIONS_LABELS} />
        )}
        {currentTab === "relations" && (
          <DashboardRelationsTab isPremium={isPremium} isPremiumPlus={isPremiumPlus} />
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
  { key: "affectiveScore",     label: "Affectif",     color: "var(--primary)", short: "A" },
  { key: "sentimentalScore",   label: "Sentimental",  color: "#f472b6", short: "Se" },
  { key: "professionalScore",  label: "Pro.",          color: "#34d399", short: "P" },
  { key: "selfScore",          label: "Soi",           color: "#fb923c", short: "So" },
];

function ScoreBar({ value, color, previousValue }: { value: number; color: string; previousValue?: number }) {
  const diff = previousValue !== undefined ? Math.round(value - previousValue) : null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#E3EBE6] overflow-hidden">
        <div 
          className="h-full rounded-full opacity-85 transition-all duration-700 ease-out"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }} 
        />
      </div>
      <span className="text-[11px] font-bold text-[#123D46] min-w-[24px] text-right font-mono">
        {Math.round(value)}
      </span>
      {diff !== null && diff !== 0 && (
        <span className={`text-[10px] font-bold min-w-[22px] text-right ${diff > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {diff > 0 ? "+" : ""}{diff}
        </span>
      )}
    </div>
  );
}

function HistoriqueTab({ router, history, isPremium }: { router: any, history: any[], isPremium: boolean }) {
  return (
    <div className="flex flex-col gap-6" style={{ animation: "fadeSlideIn 0.4s ease-out" }}>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                Carnet de Santé Relationnelle
              </h3>
            </div>
            <p className="text-xs text-[#123D46]/70">
              {history?.length ?? 0} passation{(history?.length ?? 0) > 1 ? "s" : ""} enregistrée{(history?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => router.push("/consentement?retake=true")}
            className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
          >
            <span>🔄</span>
            <span>Nouveau test</span>
          </button>
        </div>

        {/* Paywall — UpsellBanner unifié */}
        {!isPremium && (
          <div className="mt-2">
            <UpsellBanner
              variant="freemium"
              featureName="Historique & Évolution"
              description="Comparez vos passations dans le temps et visualisez l'évolution de chaque dimension relationnelle."
            />
          </div>
        )}

        {/* Timeline */}
        <div className={`flex flex-col gap-4 ${!isPremium ? 'blur-[8px] opacity-30 pointer-events-none select-none' : ''}`}>

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
              <div key={item.id} className={`p-5 rounded-3xl relative transition-all ${
                isLatest
                  ? 'bg-white border border-[#00A99D]/40 shadow-xs'
                  : 'bg-white border border-[#E3EBE6] shadow-xs opacity-90'
              }`}>
                {/* Badge actuel */}
                {isLatest && (
                  <div className="absolute -top-3 left-6 bg-[#00A99D] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Passation actuelle
                  </div>
                )}

                {/* Ligne supérieure : météo + score + date */}
                <div className="flex items-start gap-4 mb-4 mt-2">
                  {/* Icône météo */}
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center text-3xl shrink-0">
                    {item.weatherIcon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h4 className="font-jakarta font-extrabold text-base text-[#123D46] m-0">
                        {item.weatherTitle}
                      </h4>
                      {item.assessment?.campaign && (
                        <span className="text-[11px] font-bold bg-[#00A99D]/10 text-[#00A99D] border border-[#00A99D]/20 px-2 py-0.5 rounded-lg">
                          {item.assessment.campaign.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#123D46]/60 m-0">{date}</p>
                  </div>

                  {/* Score global */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="font-jakarta font-extrabold text-3xl leading-none" style={{ color: scoreColor }}>
                        {score}
                      </span>
                      <span className="text-sm font-bold text-[#123D46]/40 font-mono">/100</span>
                    </div>
                    {globalDiff !== null && globalDiff !== 0 && (
                      <div className={`inline-flex items-center gap-1 mt-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                        globalDiff > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                      }`}>
                        {globalDiff > 0 ? "▲" : "▼"} {Math.abs(globalDiff)} pts
                      </div>
                    )}
                    {globalDiff === null && (
                      <p className="text-[11px] font-bold text-[#123D46]/50 mt-1 text-right">
                        1ère passation
                      </p>
                    )}
                  </div>
                </div>

                {/* Séparateur */}
                <div className="h-px bg-[#E3EBE6] mb-4" />

                {/* Barres de dimensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {DIMENSION_CONFIG.map(dim => {
                    const val = item[dim.key] ?? 0;
                    const prevVal = previousItem?.[dim.key];
                    return (
                      <div key={dim.key}>
                        <div className="flex justify-between mb-1">
                          <span className="text-[11px] text-[#123D46]/70 font-medium">
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
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[11px] text-[#123D46]/60">Profil :</span>
                    <span className="text-xs font-semibold text-[#00A99D] bg-[#00A99D]/10 border border-[#00A99D]/20 px-3 py-1 rounded-full">
                      {item.primaryProfile}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {(!history || history.length === 0) && (
            <div className="p-12 text-center bg-white border border-[#E3EBE6] rounded-3xl shadow-xs">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-[#123D46]/70 m-0">
                Aucune passation enregistrée pour le moment.
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
