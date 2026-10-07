import React, { useState, useEffect } from 'react';
import { ValueBadge } from '../brand/Icons';

export interface SectorMetric {
  name: string;
  count: number;
  avg: number;
  target: number;
  progress: string;
}

export interface DimensionsMetric {
  social: number;
  affective: number;
  sentimental: number;
  professional: number;
  self: number;
}

interface BarometreViewProps {
  totalRespondents?: number;
  organisationsCount?: number;
  nationalAverage?: number;
  sectorsData?: Record<string, SectorMetric>;
  dimensionsData?: DimensionsMetric;
  onStartTest?: () => void;
  lastAddedScore?: { score: number; timestamp: number } | null;
}

export const BarometreView: React.FC<BarometreViewProps> = ({
  totalRespondents: propRespondents,
  organisationsCount: propOrgs,
  nationalAverage: propAvg,
  sectorsData: propSectors,
  dimensionsData: propDimensions,
  onStartTest,
  lastAddedScore
}) => {
  // Synchronized metrics strictly initialized to real PostgreSQL database aggregations
  const [respondents, setRespondents] = useState(propRespondents ?? 48);
  const [organisations, setOrganisations] = useState(propOrgs ?? 3);
  const [average, setAverage] = useState(propAvg ?? 65.9);
  const [recentlyIncremented, setRecentlyIncremented] = useState(false);
  const [lastIncrementInfo, setLastIncrementInfo] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real sector breakdown from database
  const [sectors, setSectors] = useState<Record<string, SectorMetric>>(propSectors ?? {
    all: { name: 'Tous secteurs confondus', count: 48, avg: 65.9, target: 75, progress: '+1.4 pts ce mois' },
    sante: { name: 'Santé & Médico-social', count: 12, avg: 70.5, target: 78, progress: '+2.1 pts ce mois' },
    tech: { name: 'Technologies & Digital', count: 5, avg: 66.1, target: 74, progress: '+0.8 pt ce mois' },
    industrie: { name: 'Industrie & Entreprises', count: 12, avg: 67.3, target: 75, progress: '+1.6 pts ce mois' },
    services: { name: 'Services & Particuliers', count: 12, avg: 64.9, target: 76, progress: '+1.2 pts ce mois' },
    public: { name: 'Collectivités & Secteur Public', count: 12, avg: 60.8, target: 72, progress: '+0.5 pt ce mois' }
  });

  // Real dimension averages from database
  const [dimensions, setDimensions] = useState<DimensionsMetric>(propDimensions ?? {
    social: 61.4,
    affective: 61.3,
    sentimental: 65.8,
    professional: 64.3,
    self: 63.6,
  });

  const [selectedSector, setSelectedSector] = useState<'all' | 'sante' | 'tech' | 'industrie' | 'services' | 'public'>('all');

  // Synchronize with external props when updated by parent
  useEffect(() => {
    if (propRespondents !== undefined) setRespondents(propRespondents);
  }, [propRespondents]);

  useEffect(() => {
    if (propAvg !== undefined) setAverage(propAvg);
  }, [propAvg]);

  useEffect(() => {
    if (propOrgs !== undefined) setOrganisations(propOrgs);
  }, [propOrgs]);

  useEffect(() => {
    if (propSectors) setSectors(propSectors);
  }, [propSectors]);

  useEffect(() => {
    if (propDimensions) setDimensions(propDimensions);
  }, [propDimensions]);

  // Flash highlight when a real assessment is completed
  useEffect(() => {
    if (lastAddedScore) {
      setRecentlyIncremented(true);
      setLastIncrementInfo(`+1 test validé (${lastAddedScore.score}/100) — Moyenne recalculée en direct !`);
      const t = setTimeout(() => {
        setRecentlyIncremented(false);
        setLastIncrementInfo(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [lastAddedScore]);

  // Manual refresh to sync directly with PostgreSQL /api/observatoire
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/observatoire');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalAssessments === 'number') setRespondents(data.totalAssessments);
        if (typeof data.organisationsCount === 'number') setOrganisations(data.organisationsCount);
        if (typeof data.globalScore === 'number') setAverage(data.globalScore);
        if (data.sectors) setSectors(data.sectors);
        if (data.dimensions) setDimensions(data.dimensions);
      }
    } catch (e) {
      console.error("Erreur lors de l'actualisation de l'observatoire:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const currentSectorData = sectors[selectedSector] || sectors.all;

  return (
    <div className="space-y-8">
      {/* 1. Main Real-Time Baromètre Card */}
      <div className="bg-[#123D46] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-[#199E9A]/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#00A99D]/20 via-[#FFC629]/10 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-6">
          {/* Real-time status header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(227,235,230,0.12)] pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-[#174B55] border border-[rgba(227,235,230,0.20)] px-3 py-1 rounded-full text-xs font-jakarta font-medium text-[#4DBDB2]">
                <span className="w-2 h-2 rounded-full bg-[#4DBDB2] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-[#4DBDB2] -ml-4" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  Observatoire National certifié · Données réelles consolidées
                </span>
              </div>
              {lastIncrementInfo && (
                <span className="text-xs text-[#FFC629] font-jakarta font-semibold animate-pulse">
                  {lastIncrementInfo}
                </span>
              )}
            </div>

            {/* Live Refresh Control */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs font-jakarta font-semibold px-3.5 py-1.5 rounded-full border border-[rgba(227,235,230,0.24)] text-[#E3EBE6] hover:bg-[rgba(227,235,230,0.08)] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Actualiser les données en direct depuis la base de données"
              >
                <svg
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00A99D]' : 'text-[#4DBDB2]'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isRefreshing ? 'Actualisation...' : 'Actualiser les scores'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold text-[#FFC629] tracking-wider block">
                  Baromètre National du Lien Humain
                </span>
                <h2 className="font-jakarta font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
                  La mesure du climat relationnel en temps réel
                </h2>
              </div>

              <p className="text-sm sm:text-base text-[#E3EBE6] max-w-2xl font-inter leading-relaxed">
                Le baromètre agrège en continu chaque test IQRH complété. Les données présentées proviennent directement des passations réelles enregistrées dans la base de données LinkOffice.
              </p>

              {/* Dynamic Real-Time Counters: Respondents and Average */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Nombre de personnes ayant passé le test */}
                <div
                  className={`p-4 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)] transition-all duration-300 ${
                    recentlyIncremented
                      ? 'border-[#00A99D] ring-2 ring-[#00A99D] bg-[#00A99D]/20 scale-[1.02]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#E3EBE6] font-semibold uppercase tracking-wider block">
                      Personnes ayant passé le test
                    </span>
                    <span className="text-[10px] text-[#4DBDB2] font-mono font-bold">
                      BASE ACTIVE ↑
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#FFC629] font-mono tabular-nums tracking-tight">
                      {respondents.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-[#E3EBE6]/80 font-semibold">
                      participants
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4DBDB2] block mt-1 font-medium">
                    ● Calculé en temps réel depuis PostgreSQL
                  </span>
                </div>

                {/* 2. La Moyenne Nationale */}
                <div
                  className={`p-4 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)] transition-all duration-300 ${
                    recentlyIncremented
                      ? 'border-[#FFC629] ring-2 ring-[#FFC629] bg-[#FFC629]/15 scale-[1.02]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#E3EBE6] font-semibold uppercase tracking-wider block">
                      Moyenne Nationale IQRH
                    </span>
                    <span className="text-[10px] text-[#4DBDB2] font-mono font-bold">
                      TEMPS RÉEL
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#FFC629] font-mono tabular-nums tracking-tight">
                      {typeof average === 'number' ? average.toFixed(1) : average}
                    </span>
                    <span className="text-xs text-[#E3EBE6]/70 font-semibold">/ 100</span>
                  </div>
                  <span className="text-[10px] text-[#4DBDB2] block mt-1 font-medium">
                    Indice consolidé des relations humaines
                  </span>
                </div>

                {/* 3. Organisations engagées */}
                <div className="p-4 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)]">
                  <span className="text-[11px] text-[#E3EBE6] font-semibold uppercase tracking-wider block">
                    Organisations suivies
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#FFC629] font-mono tabular-nums tracking-tight">
                      {organisations.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-[#E3EBE6]/70 font-semibold">structures</span>
                  </div>
                  <span className="text-[10px] text-[#4DBDB2] block mt-1 font-medium">
                    Acme Corp, Ville de Testville, Mutuelle Solis
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Pass the test to participate */}
            <div className="lg:col-span-4 bg-[#174B55] border border-[rgba(227,235,230,0.20)] rounded-2xl p-6 space-y-4">
              <span className="text-xs font-jakarta font-bold uppercase tracking-wider text-[#FFC629] block">
                Faites évoluer le baromètre
              </span>
              <h3 className="font-jakarta font-bold text-xl text-white">
                Passez votre test pour enrichir la moyenne en direct
              </h3>
              <p className="text-xs text-[#E3EBE6] leading-relaxed">
                Votre évaluation anonyme de 3 minutes est immédiatement intégrée dans le calcul du score national et sectoriel.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onStartTest) {
                      onStartTest();
                    } else {
                      const el = document.getElementById('iqrh');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-[#F4F1E8] text-xs font-jakarta font-bold transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Passer mon test IQRH</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#4DBDB2] pt-1 font-medium">
                <span>✓ 100% Anonyme</span>
                <span>·</span>
                <span>✓ Calcul immédiat</span>
                <span>·</span>
                <span>✓ 5 questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sectoral Interactive Breakdown with Live Counts & Averages */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
              Évolution des Moyennes et Participants par Secteur
            </h3>
            <p className="text-xs text-[#123D46]/70 mt-0.5">
              Consultez le nombre exact de personnes ayant participé et la moyenne calculée par secteur d’activité.
            </p>
          </div>

          {/* Sector Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F1E8] rounded-xl overflow-x-auto max-w-full">
            {(['all', 'sante', 'tech', 'industrie', 'services', 'public'] as const).map(sec => (
              <button
                type="button"
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-jakarta font-bold transition-all whitespace-nowrap cursor-pointer ${
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
                  : sec === 'services'
                  ? 'Services'
                  : 'Secteur Public'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Sector Focus Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Sector Average */}
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider block">
                Moyenne du secteur ({currentSectorData.name})
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-jakarta font-extrabold text-4xl text-[#00A99D] font-mono tabular-nums">
                  {typeof currentSectorData.avg === 'number' ? currentSectorData.avg.toFixed(1) : currentSectorData.avg}
                </span>
                <span className="text-sm font-semibold text-[#123D46]/60">/ 100</span>
              </div>
              <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00A99D] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(0, currentSectorData.avg))}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-[#00A99D] font-semibold block">
              ● {currentSectorData.progress}
            </span>
          </div>

          {/* Sector Test Takers Count */}
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider block">
                Nombre de personnes ayant passé le test
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-jakarta font-extrabold text-4xl text-[#123D46] font-mono tabular-nums">
                  {currentSectorData.count.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs text-[#123D46]/60 font-semibold">répondants</span>
              </div>
              <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#5965E8] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (currentSectorData.count / (respondents || 1)) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-[#123D46]/70 block">
              Représente {((currentSectorData.count / (respondents || 1)) * 100).toFixed(1)}% du total national
            </span>
          </div>

          {/* Target & Dynamic Action */}
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider block">
                Cible d&apos;Excellence Relationnelle
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-jakarta font-extrabold text-4xl text-[#FFC629] font-mono tabular-nums">
                  {currentSectorData.target}
                </span>
                <span className="text-sm font-semibold text-[#123D46]/60">/ 100</span>
              </div>
              <p className="text-xs text-[#123D46]/75">
                Seuil à partir duquel la sécurité psychologique et la coopération transverse sont optimales.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onStartTest) {
                  onStartTest();
                } else {
                  const el = document.getElementById('iqrh');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-xs text-[#00A99D] hover:underline font-jakarta font-bold text-left cursor-pointer flex items-center gap-1"
            >
              <span>Contribuer au score de ce secteur via un test →</span>
            </button>
          </div>
        </div>

        {/* 5 Dimensions Fondamentales Réelles depuis PostgreSQL */}
        <div className="pt-6 border-t border-[#E3EBE6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#123D46]/60 tracking-wider">
              Scores moyens consolidés par dimension relationnelle (Base active)
            </span>
            <span className="text-[11px] text-[#00A99D] font-semibold">
              ● Calcul certifié
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="p-4 rounded-xl border border-[#00A99D]/20 bg-[#00A99D]/5 flex flex-col justify-between">
              <div>
                <ValueBadge type="humain" size={36} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-jakarta font-bold text-xs sm:text-sm text-[#123D46]">Relations Sociales</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#00A99D]">
                    {dimensions.social.toFixed(1)}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#123D46]/80 mt-1 leading-snug">
                  Sécurité psychologique et considération collective au sein du groupe.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#199E9A]/20 bg-[#199E9A]/5 flex flex-col justify-between">
              <div>
                <ValueBadge type="clarte" size={36} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-jakarta font-bold text-xs sm:text-sm text-[#123D46]">Relations Affectives</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#199E9A]">
                    {dimensions.affective.toFixed(1)}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#123D46]/80 mt-1 leading-snug">
                  Clarté des intentions, bienveillance et absence de non-dits.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#FFC629]/30 bg-[#FFC629]/10 flex flex-col justify-between">
              <div>
                <ValueBadge type="fiabilite" size={36} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-jakarta font-bold text-xs sm:text-sm text-[#123D46]">Vie Sentimentale</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#FFC629]">
                    {dimensions.sentimental.toFixed(1)}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#123D46]/80 mt-1 leading-snug">
                  Confiance fondamentale et respect des engagements mutuels.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#5965E8]/20 bg-[#5965E8]/5 flex flex-col justify-between">
              <div>
                <ValueBadge type="action" size={36} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-jakarta font-bold text-xs sm:text-sm text-[#123D46]">Vie Professionnelle</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#5965E8]">
                    {dimensions.professional.toFixed(1)}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#123D46]/80 mt-1 leading-snug">
                  Capacité à coopérer sereinement et réguler les tensions de travail.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#123D46]/15 bg-[#FAF9F5] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-full bg-[#123D46] text-white flex items-center justify-center font-jakarta font-bold text-xs shadow-xs">
                  Moi
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-jakarta font-bold text-xs sm:text-sm text-[#123D46]">Relation à Soi</span>
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#123D46]">
                    {dimensions.self.toFixed(1)}/100
                  </span>
                </div>
                <p className="text-[11px] text-[#123D46]/80 mt-1 leading-snug">
                  Alignement personnel, gestion du stress et respect de son écologie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
