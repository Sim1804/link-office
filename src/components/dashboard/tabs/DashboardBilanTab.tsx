"use client";

import { WeatherCard } from "@/components/dashboard/WeatherCard";
import { RadarChart } from "@/components/dashboard/RadarChart";
import { IERGauge } from "@/components/dashboard/IERGauge";
import { TrendingUp, AlertTriangle, Zap, ShieldCheck } from "lucide-react";

const SCORE_CONFIG = (score: number) => {
  if (score >= 80) return { grad: "linear-gradient(135deg, #34d399 0%, #059669 100%)", glow: "rgba(52,211,153,0.4)", text: "Excellent", color: "#34d399" };
  if (score >= 60) return { grad: "linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)", glow: "rgba(0,169,157,0.4)", text: "Bon", color: "#00A99D" };
  if (score >= 40) return { grad: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", glow: "rgba(245,158,11,0.4)", text: "À renforcer", color: "#f59e0b" };
  return { grad: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", glow: "rgba(239,68,68,0.4)", text: "Priorité", color: "#ef4444" };
};

export function DashboardBilanTab({ iqrh, DIMENSIONS_LABELS }: { iqrh: any, DIMENSIONS_LABELS: any }) {
  const score = iqrh?.score_global ?? 0;
  const scoreConfig = SCORE_CONFIG(score);

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>

      {/* ── Row 1 : Hero Score Card + Météo + IER ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Card 1: Score IQRH Global */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
            Score IQRH Global
          </span>
          <div className="flex items-center gap-4 my-2">
            <div className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center shrink-0">
              <svg width="80" height="80" className="absolute inset-0 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(18,61,70,0.06)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none"
                  stroke={scoreConfig.color || "var(--primary)"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
              <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono tabular-nums leading-none">
                {score}
              </span>
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold"
                    style={{ background: `${scoreConfig.color}15`, borderColor: `${scoreConfig.color}30`, color: scoreConfig.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: scoreConfig.color }} />
                <span>{scoreConfig.text}</span>
              </span>
              <div className="text-xs text-[#123D46]/60">sur 100 points</div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E3EBE6] space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 text-emerald-800">
              <span className="font-medium flex items-center gap-1.5"><TrendingUp size={14} /> Point fort</span>
              <strong className="font-jakarta truncate max-w-[120px] text-right" title={iqrh?.best_dimension ? (DIMENSIONS_LABELS[iqrh.best_dimension] || iqrh.best_dimension) : "—"}>
                {iqrh?.best_dimension ? (DIMENSIONS_LABELS[iqrh.best_dimension] || iqrh.best_dimension) : "—"}
              </strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 text-amber-800">
              <span className="font-medium flex items-center gap-1.5"><AlertTriangle size={14} /> Priorité</span>
              <strong className="font-jakarta truncate max-w-[120px] text-right" title={iqrh?.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "—"}>
                {iqrh?.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "—"}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Météo Relationnelle */}
        {iqrh?.weather ? (
          <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
              Météo Relationnelle
            </span>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{iqrh.weather.icon}</span>
                <div>
                  <span className="text-[11px] font-bold uppercase" style={{ color: scoreConfig.color }}>
                    {iqrh.weather.label}
                  </span>
                  <h3 className="font-jakarta font-extrabold text-base text-[#123D46]">
                    {iqrh.weather.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter pt-1">
                {iqrh.weather.text}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E3EBE6] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#123D46]/70">Score global</span>
                <span className="font-mono font-bold text-[#123D46]">{score} / 100</span>
              </div>
              <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: scoreConfig.color || "var(--primary)" }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-center items-center">
            <span className="text-3xl mb-2">☁️</span>
            <p className="text-xs text-[#123D46]/60">Données météo indisponibles</p>
          </div>
        )}

        {/* Card 3: Équilibre IER */}
        {iqrh?.ier_score !== undefined ? (
          <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
              Équilibre IER
            </span>
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#00A99D] flex flex-col items-center justify-center">
                <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono tabular-nums leading-none">
                  {Math.round(iqrh.ier_score)}
                </span>
                <span className="text-[9px] text-[#123D46]/60">/ 100</span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-semibold mt-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                <span>{iqrh.ier_level}</span>
              </span>
            </div>
            <div className="pt-3 border-t border-[#E3EBE6] text-center text-xs text-[#123D46]/70">
              Homogénéité de votre profil relationnel
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-center items-center">
            <p className="text-xs text-[#123D46]/60">Indice IER indisponible</p>
          </div>
        )}
      </div>

      {/* ── Row 2 : Radar full-width ── */}
      {iqrh?.radar && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left: Interactive Radar Chart (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                Radar Relationnel
              </h3>
              <p className="text-xs text-[#123D46]/70">
                Vue d'ensemble de vos 5 dimensions
              </p>
            </div>
            <div className="flex items-center justify-center py-2">
              <RadarChart dimensions={(iqrh.dimensions || []).map((d: any) => ({
                key: d.code,
                label: d.nom,
                score: d.score
              }))} size={280} />
            </div>
            <div className="text-[11px] text-center text-[#123D46]/60 pt-2 border-t border-[#E3EBE6]">
              Aperçu visuel de vos équilibres
            </div>
          </div>
          
          {/* Right: Détail des Scores (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-5">
            <div>
              <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                Détail des Scores
              </h3>
              <p className="text-xs text-[#123D46]/70">
                Score de 0 à 100 par dimension
              </p>
            </div>
            {iqrh.dimensions && (
              <div className="space-y-4 pt-1">
                {iqrh.dimensions.map((dim: any) => {
                  const cfg = SCORE_CONFIG(dim.score);
                  return (
                    <div key={dim.code} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-jakarta">
                        <span className="font-semibold text-[#123D46]">{dim.nom}</span>
                        <span className="font-mono font-bold text-[#123D46]">{Math.round(dim.score)}/100</span>
                      </div>
                      <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, background: cfg.color || "var(--primary)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Row 3 : Forces & Vigilances ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vos Forces */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap size={20} />
            </div>
            <div>
              <h4 className="font-jakarta font-bold text-base text-[#123D46]">Vos Forces</h4>
              <span className="text-xs text-[#123D46]/60">{iqrh?.strengths?.length || 0} points d'appui identifiés</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {iqrh?.strengths?.length > 0 ? iqrh.strengths.map((str: string, idx: number) => (
              <div key={str} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-mono font-bold flex items-center justify-center shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-[#123D46] pt-0.5 leading-relaxed">{str}</p>
              </div>
            )) : (
              <p className="text-xs text-[#123D46]/60">Aucune force spécifique à afficher.</p>
            )}
          </div>
        </div>

        {/* Points de Vigilance */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="font-jakarta font-bold text-base text-[#123D46]">Points de Vigilance</h4>
              <span className="text-xs text-[#123D46]/60">{iqrh?.watchpoints?.length || 0} zones à cultiver</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {iqrh?.watchpoints?.length > 0 ? iqrh.watchpoints.map((wpt: string, idx: number) => (
              <div key={wpt} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-mono font-bold flex items-center justify-center shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-[#123D46] pt-0.5 leading-relaxed">{wpt}</p>
              </div>
            )) : (
              <p className="text-xs text-[#123D46]/60">Aucun point de vigilance majeur.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .bilan-row1 { grid-template-columns: 1fr !important; }
          .bilan-row3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
