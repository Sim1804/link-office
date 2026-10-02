"use client";

import { User, Lock, Sparkles, BarChart3, Activity } from "lucide-react";
import Link from "next/link";
import { DimensionsList } from "@/components/dashboard/DimensionsList";
import { IrisMark } from "@/components/brand/IrisLogo";

const SCORE_CONFIG = (score: number) => {
  if (score >= 80) return { grad: "linear-gradient(135deg, #34d399 0%, #059669 100%)", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" };
  if (score >= 60) return { grad: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)", color: "var(--primary)", bg: "var(--primary-glow)", border: "var(--border-strong)" };
  if (score >= 40) return { grad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" };
  return { grad: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", color: "#f87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" };
};

export function DashboardAnalyseTab({ iqrh, profil, icr, isPremium }: { iqrh: any, profil: any, icr: any, isPremium: boolean }) {
  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out", display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── IRIS CTA Banner ── */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#00A99D]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#FAF9F5] rounded-2xl border border-[#E3EBE6] flex items-center justify-center shrink-0">
            <IrisMark size={40} isAnimated={true} />
          </div>
          <div>
            <h5 className="font-jakarta font-bold text-base text-[#123D46]">
              Parler à IRIS — Votre coach IA
            </h5>
            <p className="text-xs text-[#123D46]/70 mt-0.5">
              Analyse personnalisée de vos résultats, guidée par l'intelligence relationnelle LinkOffice.
            </p>
          </div>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent("open-iris", { detail: { tab: "coach" } }))} 
          className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
        >
          Commencer avec IRIS
        </button>
      </div>

      {/* ── Main 2-col grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Profil relationnel */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs relative overflow-hidden flex flex-col h-full">

          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center shrink-0">
                <User size={20} className="text-[#123D46]/70" />
              </div>
              <h3 className="font-jakarta font-extrabold text-base text-[#123D46]">
                Profil Relationnel
              </h3>
            </div>
            {profil?.signature && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 text-xs font-bold">
                ✨ {profil.signature}
              </span>
            )}
          </div>

          {profil && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold">
                {profil.profile_primary}
              </span>
              {profil.profile_secondary && (
                <span className="px-3 py-1.5 rounded-full bg-[#FAF9F5] text-[#123D46]/70 border border-[#E3EBE6] text-xs font-semibold">
                  {profil.profile_secondary}
                </span>
              )}
            </div>
          )}

          <div className={`${!isPremium ? "blur-[4px] opacity-40 select-none pointer-events-none" : ""} flex-grow`}>
            <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter mb-5">
              {profil?.profile_description || "Description non disponible."}
            </p>
          </div>

          {/* 5 sous-scores */}
          {iqrh?.dimensions && (
            <div className="pt-4 border-t border-[#E3EBE6] mt-auto">
              <p className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider mb-3">
                Détail des scores
              </p>
              <DimensionsList
                dimensions={iqrh.dimensions}
                bestDimension={iqrh.best_dimension}
                priorityDimension={iqrh.priority_dimension}
              />
            </div>
          )}

          {!isPremium && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/90 to-[#FAF9F5]/95 backdrop-blur-sm z-10 p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E3EBE6] flex items-center justify-center text-xl mb-3">
                🔒
              </div>
              <p className="font-jakarta font-bold text-base text-[#123D46] mb-1">Détail du Profil</p>
              <p className="text-xs text-[#123D46]/60 mb-5">Accessible en version Premium</p>
              <Link href="/premium" className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs">
                Débloquer
              </Link>
            </div>
          )}
        </div>

        {/* ICR */}
        {icr && (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-jakarta font-extrabold text-base text-[#123D46]">
                  ICR — Complexité de vie
                </h3>
                <p className="text-[11px] text-[#123D46]/60 mt-0.5">Indice de Charge Relationnelle</p>
              </div>
            </div>

            {/* Score visuel */}
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex flex-col items-center justify-center shrink-0">
                <span className="font-jakarta font-extrabold text-xl text-[#123D46] font-mono tabular-nums leading-none">
                  {icr.icr_score}
                </span>
                <span className="text-[9px] text-[#123D46]/60">/ 100</span>
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold mb-2">
                  {icr.niveau_icr}
                </span>
                {icr.interpretation_icr && (
                  <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                    {icr.interpretation_icr}
                  </p>
                )}
              </div>
            </div>

            <div className={`${!isPremium ? "blur-[4px] opacity-40 select-none pointer-events-none" : ""} flex-grow flex flex-col`}>
              {/* Composantes ICR */}
              <div className="space-y-3 mb-5">
                {[
                  { label: "Complexité familiale", val: icr.family_complexity, max: 20 },
                  { label: "Complexité professionnelle", val: icr.professional_complexity, max: 20 },
                  { label: "Transitions de vie", val: icr.transition_complexity, max: 20 },
                  { label: "Charge relationnelle", val: icr.relational_load, max: 25 },
                  { label: "Ressources protectrices", val: icr.protective_resources, max: 15, inverse: true },
                ].map(({ label, val, max, inverse }) => {
                  const pct = Math.min(100, (val / max) * 100);
                  const barColor = inverse
                    ? "bg-emerald-500"
                    : pct > 70 ? "bg-rose-500" : "bg-amber-500";

                  return (
                    <div key={label}>
                      <div className="flex justify-between items-center mb-1 text-[11px] font-jakarta">
                        <span className="text-[#123D46]/70">{label}</span>
                        <span className="font-mono font-bold text-[#123D46]">{val}<span className="text-[#123D46]/40 font-normal">/{max}</span></span>
                      </div>
                      <div className="w-full bg-[#E3EBE6] h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dominant needs */}
              {icr.dominant_needs && icr.dominant_needs.length > 0 && (
                <div className="pt-4 border-t border-[#E3EBE6] mt-auto">
                  <p className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider mb-3">
                    Besoins dominants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {icr.dominant_needs.map((need: string) => (
                      <span key={need} className="px-3 py-1.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-[11px] font-bold border border-[#00A99D]/20">
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!isPremium && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/90 to-[#FAF9F5]/95 backdrop-blur-sm z-10 p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E3EBE6] flex items-center justify-center text-xl mb-3">
                  🔒
                </div>
                <p className="font-jakarta font-bold text-base text-[#123D46] mb-1">Détail ICR Premium</p>
                <p className="text-xs text-[#123D46]/60 mb-5">Décomposition complète réservée aux abonnés</p>
                <Link href="/premium" className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs">
                  Débloquer
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
