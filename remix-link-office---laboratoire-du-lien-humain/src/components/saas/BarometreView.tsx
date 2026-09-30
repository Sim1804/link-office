import React, { useState } from 'react';
import { DataCircles, TrajectoryGraphic, PointLumineux } from '../brand/GraphicElements';
import { ValueBadge } from '../brand/Icons';

export const BarometreView: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<'all' | 'sante' | 'tech' | 'industrie' | 'services'>('all');

  const sectorData = {
    all: { name: 'Moyenne Nationale', score: 68, confidence: 74, cooperation: 63, evolution: '+18%' },
    sante: { name: 'Santé & Médico-social', score: 71, confidence: 79, cooperation: 75, evolution: '+22%' },
    tech: { name: 'Technologies & Digital', score: 65, confidence: 68, cooperation: 62, evolution: '+14%' },
    industrie: { name: 'Industrie & Manufacturier', score: 69, confidence: 73, cooperation: 66, evolution: '+16%' },
    services: { name: 'Services & Conseil', score: 67, confidence: 71, cooperation: 64, evolution: '+19%' }
  };

  const current = sectorData[selectedSector];

  return (
    <div className="space-y-8">
      {/* Hero Book / Study Presentation */}
      <div className="bg-[#123D46] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-[#199E9A]/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#00A99D]/20 via-[#FFC629]/10 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#00A99D] text-white rounded-full text-xs font-jakarta font-bold uppercase tracking-wider">
                Édition 2024
              </span>
              <span className="text-xs text-[#E3EBE6] font-inter">
                Étude annuelle menée auprès de 1 234 organisations en France
              </span>
            </div>

            <h2 className="font-jakarta font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              BAROMÈTRE DU LIEN HUMAIN
            </h2>
            <p className="text-sm sm:text-base text-[#E3EBE6] max-w-xl font-inter leading-relaxed">
              « Et si le lien humain devenait le premier indicateur de santé globale et de pérennité des organisations ? »
              Découvrez l’état des dynamiques interpersonnelles, de la solitude au travail et des leviers d’action collective en 2024.
            </p>

            {/* Quick Metrics from Section 10 */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10">
                <span className="text-[11px] text-[#FFC629] font-medium block">Participants audités</span>
                <span className="font-jakarta font-extrabold text-2xl text-white">1 234</span>
                <span className="text-[10px] text-[#E3EBE6] block mt-0.5">organisations en 2024</span>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10">
                <span className="text-[11px] text-[#FFC629] font-medium block">Évolution annuelle</span>
                <span className="font-jakarta font-extrabold text-2xl text-[#00A99D]">+18%</span>
                <span className="text-[10px] text-[#E3EBE6] block mt-0.5">d'initiatives collectives</span>
              </div>

              <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-[#FFC629] font-medium block">Indice Moyen France</span>
                <span className="font-jakarta font-extrabold text-2xl text-white">68 / 100</span>
                <span className="text-[10px] text-[#E3EBE6] block mt-0.5">Indice IQRH National</span>
              </div>
            </div>
          </div>

          {/* Book 3D Cover Mockup like shown in Section 13 */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="w-56 h-76 bg-gradient-to-b from-[#123D46] via-[#00A99D] to-[#123D46] rounded-r-xl rounded-l-xs p-6 shadow-2xl border-l-4 border-l-[#FFC629] border-t border-r border-b border-white/20 flex flex-col justify-between relative transform hover:-rotate-1 transition-transform">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold tracking-[0.25em] text-[#FFC629] uppercase">
                  LINK OFFICE
                </span>
                <span className="text-[8px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                  2024
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-jakarta font-extrabold text-lg text-white leading-tight">
                  BAROMÈTRE DU LIEN HUMAIN
                </h3>
                <p className="text-[10px] text-[#E3EBE6] font-medium">
                  État des liens en France 2024
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#FFC629] animate-pulse" />
                  <span className="text-[9px] text-[#E3EBE6]">Rapport intégral</span>
                </div>
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                  84 pages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sector filter & Interactive explorer */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E3EBE6] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-jakarta font-bold text-xl text-[#123D46]">
              Explorateur par Secteur d’Activité
            </h3>
            <p className="text-xs text-[#123D46]/70 mt-0.5 font-inter">
              Comparez les dynamiques d’écoute, de confiance et d’action selon les filières économiques.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F1E8] rounded-xl overflow-x-auto max-w-full">
            {(['all', 'sante', 'tech', 'industrie', 'services'] as const).map(sec => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-jakarta font-semibold transition-all whitespace-nowrap ${
                  selectedSector === sec
                    ? 'bg-[#00A99D] text-white shadow-xs'
                    : 'text-[#123D46]/70 hover:text-[#123D46]'
                }`}
              >
                {sec === 'all'
                  ? 'Tous secteurs'
                  : sec === 'sante'
                  ? 'Santé'
                  : sec === 'tech'
                  ? 'Tech'
                  : sec === 'industrie'
                  ? 'Industrie'
                  : 'Services'}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Comparison Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#123D46]/60 uppercase tracking-wider">
              {current.name}
            </span>
            <div className="my-4 flex items-baseline gap-2">
              <span className="font-jakarta font-extrabold text-4xl text-[#00A99D]">
                {current.score}
              </span>
              <span className="text-sm text-[#123D46]/60 font-semibold font-jakarta">/ 100</span>
            </div>
            <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#00A99D] h-full rounded-full transition-all duration-500"
                style={{ width: `${current.score}%` }}
              />
            </div>
            <span className="text-[11px] text-[#123D46]/70 mt-2">
              Score moyen de santé relationnelle dans ce secteur
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#123D46]/60 uppercase tracking-wider">
              Confiance Managériale
            </span>
            <div className="my-4 flex items-baseline gap-2">
              <span className="font-jakarta font-extrabold text-4xl text-[#123D46]">
                {current.confidence}%
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Taux positif</span>
            </div>
            <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#199E9A] h-full rounded-full transition-all duration-500"
                style={{ width: `${current.confidence}%` }}
              />
            </div>
            <span className="text-[11px] text-[#123D46]/70 mt-2">
              Salariés déclarant pouvoir échanger en toute confiance
            </span>
          </div>

          <div className="p-5 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col justify-between">
            <span className="text-xs font-semibold text-[#123D46]/60 uppercase tracking-wider">
              Coopération Transverse
            </span>
            <div className="my-4 flex items-baseline gap-2">
              <span className="font-jakarta font-extrabold text-4xl text-[#5965E8]">
                {current.cooperation}%
              </span>
              <span className="text-xs text-amber-600 font-semibold">Axe de progrès</span>
            </div>
            <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5965E8] h-full rounded-full transition-all duration-500"
                style={{ width: `${current.cooperation}%` }}
              />
            </div>
            <span className="text-[11px] text-[#123D46]/70 mt-2">
              Fluidité des projets collaboratifs inter-services
            </span>
          </div>
        </div>

        {/* 4 Pillars Insight from Study */}
        <div className="pt-6 border-t border-[#E3EBE6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#00A99D]/30 bg-[#00A99D]/5">
            <ValueBadge type="humain" size={44} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">
              Le sentiment d’isolement
            </h4>
            <p className="text-xs text-[#123D46]/80 mt-1">
              34% des collaborateurs en télétravail hybride déplorent une raréfaction des échanges informels créateurs de lien.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#199E9A]/30 bg-[#199E9A]/5">
            <ValueBadge type="clarte" size={44} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">
              La clarté des objectifs
            </h4>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Quand les priorités sont explicites, le niveau de conflit interpersonnel baisse immédiatement de 41%.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#FFC629]/40 bg-[#FFC629]/10">
            <ValueBadge type="fiabilite" size={44} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">
              Rigueur de mesure
            </h4>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Les entreprises mesurant régulièrement la qualité relationnelle constatent une baisse de 27% du turnover.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#5965E8]/30 bg-[#5965E8]/5">
            <ValueBadge type="action" size={44} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">
              Pouvoir d’action local
            </h4>
            <p className="text-xs text-[#123D46]/80 mt-1">
              82% des améliorations pérennes proviennent d'initiatives menées directement à l'échelle de la petite équipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
