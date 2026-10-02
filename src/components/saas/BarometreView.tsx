import React, { useState, useEffect } from 'react';
import { ValueBadge } from '../brand/Icons';

interface BarometreViewProps {
  totalRespondents?: number;
  organisationsCount?: number;
  nationalAverage?: number;
  onSimulateTest?: (score: number) => void;
  onStartTest?: () => void;
  lastAddedScore?: { score: number; timestamp: number } | null;
}

export const BarometreView: React.FC<BarometreViewProps> = ({
  totalRespondents: propRespondents,
  organisationsCount: propOrgs,
  nationalAverage: propAvg,
  onSimulateTest,
  onStartTest,
  lastAddedScore
}) => {
  // Local state if not controlled externally, or synchronized with props
  const [respondents, setRespondents] = useState(propRespondents ?? 48392);
  const [organisations, setOrganisations] = useState(propOrgs ?? 1248);
  const [average, setAverage] = useState(propAvg ?? 68.4);
  const [isAutoLive, setIsAutoLive] = useState(true);
  const [recentlyIncremented, setRecentlyIncremented] = useState(false);
  const [lastIncrementInfo, setLastIncrementInfo] = useState<string | null>(null);

  // Sector breakdown with live counts & averages
  const [sectors, setSectors] = useState({
    all: { name: 'Tous secteurs confondus', count: 48392, avg: 68.4, target: 75, progress: '+1.4 pts ce mois' },
    sante: { name: 'Santé & Médico-social', count: 12450, avg: 71.2, target: 78, progress: '+2.1 pts ce mois' },
    tech: { name: 'Technologies & Digital', count: 10830, avg: 66.1, target: 74, progress: '+0.8 pt ce mois' },
    industrie: { name: 'Industrie & Ingénierie', count: 11210, avg: 69.3, target: 75, progress: '+1.6 pts ce mois' },
    services: { name: 'Services & Conseil', count: 9140, avg: 67.8, target: 76, progress: '+1.2 pts ce mois' },
    public: { name: 'Collectivités & Secteur Public', count: 4762, avg: 66.5, target: 72, progress: '+0.5 pt ce mois' }
  });

  const [selectedSector, setSelectedSector] = useState<'all' | 'sante' | 'tech' | 'industrie' | 'services' | 'public'>('all');

  // Synchronize with external props when available
  useEffect(() => {
    if (propRespondents !== undefined) setRespondents(propRespondents);
  }, [propRespondents]);

  useEffect(() => {
    if (propAvg !== undefined) setAverage(propAvg);
  }, [propAvg]);

  useEffect(() => {
    if (propOrgs !== undefined) setOrganisations(propOrgs);
  }, [propOrgs]);

  // Flash when lastAddedScore comes in
  useEffect(() => {
    if (lastAddedScore) {
      setRecentlyIncremented(true);
      setLastIncrementInfo(`+1 test validé (${lastAddedScore.score}/100) — Moyenne recalculée !`);
      const t = setTimeout(() => {
        setRecentlyIncremented(false);
        setLastIncrementInfo(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [lastAddedScore]);

  // Core function to register a new test passage and re-compute average & respondents
  const registerNewTest = (score: number, sectorKey: 'sante' | 'tech' | 'industrie' | 'services' | 'public' = 'services') => {
    setRespondents(prevCount => {
      const nextCount = prevCount + 1;
      setAverage(prevAvg => {
        // Effective perceptible calculation for UI demonstrations
        const weight = Math.min(prevCount, 300);
        const newAvg = Number((((prevAvg * weight) + score) / (weight + 1)).toFixed(2));
        return newAvg;
      });
      return nextCount;
    });

    // Update specific sector
    setSectors(prev => {
      const sec = prev[sectorKey];
      const nextSecCount = sec.count + 1;
      const weight = Math.min(sec.count, 150);
      const nextSecAvg = Number((((sec.avg * weight) + score) / (weight + 1)).toFixed(2));

      return {
        ...prev,
        all: {
          ...prev.all,
          count: prev.all.count + 1,
          avg: Number((((prev.all.avg * 250) + score) / 251).toFixed(2))
        },
        [sectorKey]: {
          ...sec,
          count: nextSecCount,
          avg: nextSecAvg
        }
      };
    });

    setRecentlyIncremented(true);
    setLastIncrementInfo(`+1 test enregistré (${score} pts) — Total : ${(respondents + 1).toLocaleString('fr-FR')} personnes`);
    setTimeout(() => {
      setRecentlyIncremented(false);
    }, 2000);

    if (onSimulateTest) {
      onSimulateTest(score);
    }
  };

  // Real-time automatic increase of test takers and dynamic average adjustment
  useEffect(() => {
    if (!isAutoLive) return;

    const interval = setInterval(() => {
      const randomScore = Math.floor(60 + Math.random() * 32); // Between 60 and 92
      const sectorKeys: ('sante' | 'tech' | 'industrie' | 'services' | 'public')[] = [
        'sante',
        'tech',
        'industrie',
        'services',
        'public'
      ];
      const randomSector = sectorKeys[Math.floor(Math.random() * sectorKeys.length)];

      registerNewTest(randomScore, randomSector);
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoLive, respondents, average]);

  const currentSectorData = sectors[selectedSector];

  return (
    <div className="space-y-8">
      {/* 1. Main Real-Time Baromètre Card */}
      <div className="bg-[#123D46] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-lg border border-[#199E9A]/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-[#00A99D]/20 via-[#FFC629]/10 to-transparent rounded-full pointer-events-none blur-2xl" />

        <div className="relative z-10 space-y-6">
          {/* Real-time status header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-jakarta font-medium text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 -ml-4" />
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  {isAutoLive ? 'Comptabilisation en direct active' : 'Direct en pause'}
                </span>
              </div>
              {lastIncrementInfo && (
                <span className="text-xs text-[#FFC629] font-jakarta font-semibold animate-pulse">
                  {lastIncrementInfo}
                </span>
              )}
            </div>

            {/* Live Controls */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsAutoLive(!isAutoLive)}
                className="text-xs font-jakarta font-medium px-3 py-1.5 rounded-lg border border-white/20 text-[#E3EBE6] hover:bg-white/10 transition-colors"
                title={isAutoLive ? 'Mettre en pause l’incrémentation automatique' : 'Activer l’incrémentation automatique'}
              >
                {isAutoLive ? '⏸ Pause' : '▶ Reprendre direct'}
              </button>
              <button
                onClick={() => {
                  const score = Math.floor(65 + Math.random() * 25);
                  registerNewTest(score);
                }}
                className="text-xs font-jakarta font-bold px-3.5 py-1.5 rounded-lg bg-[#00A99D] hover:bg-[#199E9A] text-white transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>+ Ajouter un test</span>
                <span className="text-[10px] opacity-80">(+1 personne)</span>
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
                Le baromètre agrège en continu chaque test IQRH complété.
                Le nombre de personnes ayant passé le test augmente en direct et la moyenne nationale s'ajuste immédiatement à chaque nouvelle contribution.
              </p>

              {/* Dynamic Real-Time Counters: Respondents and Average */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Nombre de personnes ayant passé le test */}
                <div
                  className={`p-4 bg-white/10 backdrop-blur-xs rounded-2xl border transition-all duration-300 ${
                    recentlyIncremented
                      ? 'border-[#00A99D] ring-2 ring-[#00A99D] bg-[#00A99D]/20 scale-[1.02]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#FFC629] font-medium block">
                      Personnes ayant passé le test
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      EN HAUSSE ↑
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white font-mono tabular-nums tracking-tight">
                      {respondents.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-emerald-300 font-semibold">
                      participants
                    </span>
                  </div>
                  <span className="text-[10px] text-[#E3EBE6]/80 block mt-1">
                    ● Mis à jour en continu à chaque réponse
                  </span>
                </div>

                {/* 2. La Moyenne Nationale */}
                <div
                  className={`p-4 bg-white/10 backdrop-blur-xs rounded-2xl border transition-all duration-300 ${
                    recentlyIncremented
                      ? 'border-[#FFC629] ring-2 ring-[#FFC629] bg-[#FFC629]/15 scale-[1.02]'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#FFC629] font-medium block">
                      Moyenne Nationale IQRH
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      TEMPS RÉEL
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white font-mono tabular-nums tracking-tight">
                      {typeof average === 'number' ? average.toFixed(1) : average}
                    </span>
                    <span className="text-xs text-[#E3EBE6]/60">/ 100</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 block mt-1">
                    Indice consolidé des relations humaines
                  </span>
                </div>

                {/* 3. Organisations engagées */}
                <div className="p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
                  <span className="text-[11px] text-[#FFC629] font-medium block">
                    Organisations suivies
                  </span>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white font-mono tabular-nums tracking-tight">
                      {organisations.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-xs text-[#E3EBE6]/60">structures</span>
                  </div>
                  <span className="text-[10px] text-[#E3EBE6]/80 block mt-1">
                    PME, ETI, Collectivités & Groupes
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Pass the test to participate */}
            <div className="lg:col-span-4 bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm space-y-4">
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
                  onClick={() => {
                    if (onStartTest) {
                      onStartTest();
                    } else {
                      const el = document.getElementById('iqrh');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full py-3 px-4 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-md flex items-center justify-center gap-2 group"
                >
                  <span>Passer mon test IQRH</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#E3EBE6]/70 pt-1">
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
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1.5 rounded-lg text-xs font-jakarta font-bold transition-all whitespace-nowrap ${
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
                  style={{ width: `${currentSectorData.avg}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold block">
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
                  style={{ width: `${Math.min(100, (currentSectorData.count / respondents) * 100 * 2.5)}%` }}
                />
              </div>
            </div>
            <span className="text-[11px] text-[#123D46]/70 block">
              Représente {((currentSectorData.count / respondents) * 100).toFixed(1)}% du total national
            </span>
          </div>

          {/* Target & Dynamic Action */}
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#123D46]/60 uppercase tracking-wider block">
                Cible d'Excellence Relationnelle
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-jakarta font-extrabold text-4xl text-[#B8870A] font-mono tabular-nums">
                  {currentSectorData.target}
                </span>
                <span className="text-sm font-semibold text-[#123D46]/60">/ 100</span>
              </div>
              <p className="text-xs text-[#123D46]/75">
                Seuil à partir duquel la sécurité psychologique et la coopération transverse sont optimales.
              </p>
            </div>
            <button
              onClick={() => {
                const score = Math.floor(68 + Math.random() * 22);
                registerNewTest(score, selectedSector === 'all' ? 'services' : selectedSector);
              }}
              className="text-xs text-[#00A99D] hover:underline font-jakarta font-bold text-left"
            >
              + Simuler une nouvelle réponse dans ce secteur →
            </button>
          </div>
        </div>

        {/* 4 Pillars National Real-Time Status */}
        <div className="pt-6 border-t border-[#E3EBE6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#00A99D]/20 bg-[#00A99D]/5">
            <ValueBadge type="humain" size={40} />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-jakarta font-bold text-sm text-[#123D46]">Pilier Humain</span>
              <span className="font-mono font-bold text-sm text-[#00A99D]">
                {(average * 1.05).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Sécurité psychologique et considération de la personne au travail.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#199E9A]/20 bg-[#199E9A]/5">
            <ValueBadge type="clarte" size={40} />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-jakarta font-bold text-sm text-[#123D46]">Pilier Clarté</span>
              <span className="font-mono font-bold text-sm text-[#199E9A]">
                {(average * 0.98).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Absence de non-dits et explicitation des objectifs partagés.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#FFC629]/30 bg-[#FFC629]/10">
            <ValueBadge type="fiabilite" size={40} />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-jakarta font-bold text-sm text-[#123D46]">Pilier Fiabilité</span>
              <span className="font-mono font-bold text-sm text-[#B8870A]">
                {(average * 1.03).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Entraide face aux difficultés et respect des engagements mutuels.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[#5965E8]/20 bg-[#5965E8]/5">
            <ValueBadge type="action" size={40} />
            <div className="mt-3 flex items-center justify-between">
              <span className="font-jakarta font-bold text-sm text-[#123D46]">Pilier Action</span>
              <span className="font-mono font-bold text-sm text-[#5965E8]">
                {(average * 0.94).toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-[#123D46]/80 mt-1">
              Capacité réelle des équipes à réguler et résoudre les tensions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
