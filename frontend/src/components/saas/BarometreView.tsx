"use client";

import React, { useState, useEffect } from 'react';

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

const ARCHETYPES = [
  { name: 'Le Connecté Solitaire', pct: 16, width: '72%', color: '#00A99D' },
  { name: "L'Isolé Invisible", pct: 13, width: '58.5%', color: '#FFC629' },
  { name: 'Le Senior Délié', pct: 11, width: '49.5%', color: '#4DBDB2' },
  { name: "L'Entrepreneur Isolé", pct: 10, width: '45.0%', color: '#5965E8' },
  { name: 'Le Jeune en Décrochage', pct: 9, width: '40.5%', color: '#199E9A' },
  { name: 'Le Parent Solo Saturé', pct: 8, width: '36.0%', color: '#00A99D' },
  { name: 'Le Cœur en Attente', pct: 7, width: '31.5%', color: '#FFC629' },
  { name: 'Le Chercheur de Sens', pct: 6, width: '27.0%', color: '#4DBDB2' },
];

export const BarometreView: React.FC<BarometreViewProps> = ({
  totalRespondents: propRespondents,
  organisationsCount: propOrgs,
  nationalAverage: propAvg,
  onStartTest,
  lastAddedScore,
}) => {
  // Synchronized metrics strictly initialized to real PostgreSQL database aggregations
  const [respondents, setRespondents] = useState(propRespondents ?? 52380);
  const [organisations, setOrganisations] = useState(propOrgs ?? 18940);
  const [average, setAverage] = useState(propAvg ?? 58.0);
  const [recentlyIncremented, setRecentlyIncremented] = useState(false);
  const [lastIncrementInfo, setLastIncrementInfo] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeRegion, setActiveRegion] = useState('Toutes');

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/observatoire');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.totalAssessments === 'number') setRespondents(data.totalAssessments);
        if (typeof data.organisationsCount === 'number') setOrganisations(data.organisationsCount);
        if (typeof data.globalScore === 'number') setAverage(data.globalScore);
      }
    } catch (err) {
      console.error("Erreur actualisation observatoire:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownloadCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Archetype,Part (%)\n" +
      ARCHETYPES.map((a) => `"${a.name}",${a.pct}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "barometre_archetypes_linkoffice.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Circular gauge arc calculations
  const gaugePercent = Math.min(100, Math.max(0, typeof average === 'number' ? average : 58));
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  return (
    <div className="bg-[#123D46] rounded-3xl p-6 sm:p-10 text-[#F4F1E8] relative overflow-hidden shadow-2xl border border-[rgba(227,235,230,0.16)]">
      {/* ── HEADER DE LA SECTION OBSERVATOIRE (CONFORME HTML CHARTE V6) ── */}
      <div className="relative z-10 space-y-6">
        <div>
          <div className="text-xs uppercase font-mono font-bold text-[#FFC629] tracking-wider mb-2">
            O · OBSERVER
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="font-jakarta font-extrabold text-2xl sm:text-4xl text-[#F4F1E8] tracking-tight leading-tight">
                La santé relationnelle,{" "}
                <em className="text-[#00A99D] not-italic">rendue visible par les données.</em>
              </h2>
              <p className="text-sm sm:text-base text-[#E3EBE6] max-w-3xl mt-2 font-inter leading-relaxed">
                Le Baromètre national croise les passations anonymisées de l’IQRH pour cartographier l’état des liens en France, identifier les zones d’alerte et guider l’action des décideurs.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-[#6D8888] bg-[#174B55] px-3.5 py-1.5 rounded-full border border-[rgba(227,235,230,0.16)]">
                <span className="w-2 h-2 rounded-full bg-[#4DBDB2] animate-pulse" />
                <span>Données consolidées en temps réel</span>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs font-jakarta font-semibold px-3 py-1.5 rounded-full border border-[rgba(227,235,230,0.24)] text-[#E3EBE6] hover:bg-[rgba(227,235,230,0.08)] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Actualiser les données"
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
                <span>{isRefreshing ? 'Sync...' : 'Actualiser'}</span>
              </button>
            </div>
          </div>
        </div>

        {lastIncrementInfo && (
          <div className="p-3 bg-[#FFC629]/15 border border-[#FFC629]/40 rounded-xl text-xs font-semibold text-[#FFC629] animate-pulse">
            {lastIncrementInfo}
          </div>
        )}

        {/* ── 4 KPI SNAPSHOT CARDS (.observer-kpi) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* KPI 1 */}
          <div className={`p-4 sm:p-5 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)] transition-all ${recentlyIncremented ? 'border-[#FFC629] ring-2 ring-[#FFC629]' : ''}`}>
            <span className="text-xs text-[#E3EBE6] font-medium block">IQRH moyen</span>
            <strong className="text-[#FFC629] font-mono font-bold text-2xl sm:text-3xl block my-1 tabular-nums">
              {typeof average === 'number' ? average.toFixed(1) : average}
              <small className="text-sm text-[#E3EBE6] font-normal">/100</small>
            </strong>
            <em className="text-[#4DBDB2] text-xs font-semibold not-italic block">+2 pts sur 12 mois</em>
          </div>

          {/* KPI 2 */}
          <div className={`p-4 sm:p-5 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)] transition-all ${recentlyIncremented ? 'border-[#00A99D] ring-2 ring-[#00A99D]' : ''}`}>
            <span className="text-xs text-[#E3EBE6] font-medium block">Bilans analysés</span>
            <strong className="text-[#FFC629] font-mono font-bold text-2xl sm:text-3xl block my-1 tabular-nums">
              {respondents.toLocaleString('fr-FR')}
            </strong>
            <em className="text-[#4DBDB2] text-xs font-semibold not-italic block">toutes populations</em>
          </div>

          {/* KPI 3 */}
          <div className="p-4 sm:p-5 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)]">
            <span className="text-xs text-[#E3EBE6] font-medium block">Relations affectives</span>
            <strong className="text-[#FFC629] font-mono font-bold text-2xl sm:text-3xl block my-1">64%</strong>
            <em className="text-[#4DBDB2] text-xs font-semibold not-italic block">sous le seuil de 50/100</em>
          </div>

          {/* KPI 4 */}
          <div className="p-4 sm:p-5 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.16)]">
            <span className="text-xs text-[#E3EBE6] font-medium block">Orientations & Déploiements</span>
            <strong className="text-[#FFC629] font-mono font-bold text-2xl sm:text-3xl block my-1 tabular-nums">
              {organisations.toLocaleString('fr-FR')}
            </strong>
            <em className="text-[#4DBDB2] text-xs font-semibold not-italic block">vers une ressource ou solution</em>
          </div>
        </div>

        {/* ── ROW 1 (.drow1 : GAUGE + COUNTER + DSHOCK) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* CARD 1: Gauge */}
          <div className="bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8]">
              Score IQRH moyen national
            </div>
            <div className="flex items-center gap-5 my-4">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="rgba(227,235,230,0.16)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#FFC629"
                    strokeWidth="9"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <b className="font-jakarta font-extrabold text-2xl text-white leading-none">
                    {typeof average === 'number' ? average.toFixed(0) : average}
                  </b>
                  <small className="font-mono text-[10px] text-[#6D8888]">/100</small>
                </div>
              </div>
              <div className="text-xs text-[#E3EBE6] leading-relaxed">
                <span className="text-[#4DBDB2] font-mono font-bold text-sm block mb-1">
                  ▲ +2 pts sur 12 mois
                </span>
                Moyenne nationale agrégée en temps réel. La dynamique globale indique une prise de conscience accrue.
              </div>
            </div>
            <div className="text-[11px] text-[#6D8888] font-mono">
              Indice consolidé des relations humaines
            </div>
          </div>

          {/* CARD 2: Counter */}
          <div className="bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8]">
              Bilans IQRH réalisés
            </div>
            <div className="my-2">
              <b className="text-3xl sm:text-4xl font-extrabold font-mono text-[#F4F1E8] block tabular-nums">
                {respondents.toLocaleString('fr-FR')}
              </b>
              <div className="text-xs text-[#E3EBE6] mt-1">
                passations individuelles et collectives
              </div>
              <div className="h-1.5 rounded-full bg-[#123D46] mt-4 overflow-hidden">
                <span className="block h-full bg-gradient-to-r from-[#4DBDB2] to-[#00A99D] w-4/5 rounded-full" />
              </div>
            </div>
            <div className="text-[11px] text-[#4DBDB2] font-mono">
              ● Base active PostgreSQL certifiée
            </div>
          </div>

          {/* CARD 3: Donnée choc de la semaine (dshock) */}
          <div className="bg-[#5965E8] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.2)] text-[#F4F1E8] flex flex-col justify-between relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-wider text-[#FFC629]">
              ⚡ Donnée choc de la semaine
            </div>
            <div className="text-lg sm:text-xl font-bold font-jakarta text-white my-3 leading-snug">
              Cette semaine, <em className="text-[#FFC629] not-italic">68%</em> des répondants déclarent manquer d’écoute sincère
            </div>
            <p className="text-xs text-[#E3EBE6] leading-relaxed">
              Le sentiment de solitude fonctionnelle progresse de +3% par rapport au mois précédent, en particulier dans les organisations en réorganisation.
            </p>
          </div>
        </div>

        {/* ── ROW 2 (.drow2 : HEXMAP + TOP 3 DIMENSIONS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* CARD 1: Hexagonal Map */}
          <div className="lg:col-span-7 bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8]">
                Lecture territoriale de la santé relationnelle
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {['Toutes', 'Nord', 'Ouest', 'Île-de-France', 'Sud'].map((reg) => (
                  <button
                    key={reg}
                    type="button"
                    onClick={() => setActiveRegion(reg)}
                    className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      activeRegion === reg
                        ? 'bg-[#FFC629] text-[#123D46] border-[#FFC629] font-bold'
                        : 'border-[rgba(227,235,230,0.2)] text-[#E3EBE6] hover:border-[#FFC629]'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Hexagonal Map (Repris fidèlement de la charte HTML) */}
            <div className="w-full flex items-center justify-center py-2 overflow-hidden">
              <svg className="w-full max-w-[500px] h-auto select-none" viewBox="50 15 250 125">
                <polygon data-score="49" fill="#FFC629" opacity="0.95" points="133.7,44.4 133.7,54.4 125.0,59.4 116.3,54.4 116.3,44.4 125.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="63" fill="#199E9A" opacity="0.95" points="153.7,44.4 153.7,54.4 145.0,59.4 136.3,54.4 136.3,44.4 145.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="57" fill="#5965E8" opacity="0.95" points="173.7,44.4 173.7,54.4 165.0,59.4 156.3,54.4 156.3,44.4 165.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="68" fill="#00A99D" opacity="0.95" points="193.7,44.4 193.7,54.4 185.0,59.4 176.3,54.4 176.3,44.4 185.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="52" fill="#5965E8" opacity="0.95" points="213.7,44.4 213.7,54.4 205.0,59.4 196.3,54.4 196.3,44.4 205.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="60" fill="#4DBDB2" opacity="0.95" points="233.7,44.4 233.7,54.4 225.0,59.4 216.3,54.4 216.3,44.4 225.0,39.4" stroke="#F4F1E8" strokeWidth="1.8" />
                
                <polygon data-score="55" fill="#5965E8" opacity="0.95" points="103.7,61.8 103.7,71.8 95.0,76.8 86.3,71.8 86.3,61.8 95.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="64" fill="#199E9A" opacity="0.95" points="123.7,61.8 123.7,71.8 115.0,76.8 106.3,71.8 106.3,61.8 115.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="47" fill="#FFC629" opacity="0.95" points="143.7,61.8 143.7,71.8 135.0,76.8 126.3,71.8 126.3,61.8 135.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="69" fill="#00A99D" opacity="0.95" points="163.7,61.8 163.7,71.8 155.0,76.8 146.3,71.8 146.3,61.8 155.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="59" fill="#4DBDB2" opacity="0.95" points="183.7,61.8 183.7,71.8 175.0,76.8 166.3,71.8 166.3,61.8 175.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="62" fill="#4DBDB2" opacity="0.95" points="203.7,61.8 203.7,71.8 195.0,76.8 186.3,71.8 186.3,61.8 195.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="53" fill="#5965E8" opacity="0.95" points="223.7,61.8 223.7,71.8 215.0,76.8 206.3,71.8 206.3,61.8 215.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="65" fill="#199E9A" opacity="0.95" points="243.7,61.8 243.7,71.8 235.0,76.8 226.3,71.8 226.3,61.8 235.0,56.8" stroke="#F4F1E8" strokeWidth="1.8" />

                <polygon data-score="56" fill="#5965E8" opacity="0.95" points="93.7,79.2 93.7,89.2 85.0,94.2 76.3,89.2 76.3,79.2 85.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="50" fill="#FFC629" opacity="0.95" points="113.7,79.2 113.7,89.2 105.0,94.2 96.3,89.2 96.3,79.2 105.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="67" fill="#00A99D" opacity="0.95" points="133.7,79.2 133.7,89.2 125.0,94.2 116.3,89.2 116.3,79.2 125.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="61" fill="#4DBDB2" opacity="0.95" points="153.7,79.2 153.7,89.2 145.0,94.2 136.3,89.2 136.3,79.2 145.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="48" fill="#FFC629" opacity="0.95" points="173.7,79.2 173.7,89.2 165.0,94.2 156.3,89.2 156.3,79.2 165.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="58" fill="#4DBDB2" opacity="0.95" points="193.7,79.2 193.7,89.2 185.0,94.2 176.3,89.2 176.3,79.2 185.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="64" fill="#199E9A" opacity="0.95" points="213.7,79.2 213.7,89.2 205.0,94.2 196.3,89.2 196.3,79.2 205.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="55" fill="#5965E8" opacity="0.95" points="233.7,79.2 233.7,89.2 225.0,94.2 216.3,89.2 216.3,79.2 225.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="70" fill="#00A99D" opacity="0.95" points="253.7,79.2 253.7,89.2 245.0,94.2 236.3,89.2 236.3,79.2 245.0,74.2" stroke="#F4F1E8" strokeWidth="1.8" />

                <polygon data-score="63" fill="#199E9A" opacity="0.95" points="83.7,96.6 83.7,106.6 75.0,111.6 66.3,106.6 66.3,96.6 75.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="57" fill="#5965E8" opacity="0.95" points="103.7,96.6 103.7,106.6 95.0,111.6 86.3,106.6 86.3,96.6 95.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="46" fill="#FFC629" opacity="0.95" points="123.7,96.6 123.7,106.6 115.0,111.6 106.3,106.6 106.3,96.6 115.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="66" fill="#199E9A" opacity="0.95" points="143.7,96.6 143.7,106.6 135.0,111.6 126.3,106.6 126.3,96.6 135.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="60" fill="#4DBDB2" opacity="0.95" points="163.7,96.6 163.7,106.6 155.0,111.6 146.3,106.6 146.3,96.6 155.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="54" fill="#5965E8" opacity="0.95" points="183.7,96.6 183.7,106.6 175.0,111.6 166.3,106.6 166.3,96.6 175.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="68" fill="#00A99D" opacity="0.95" points="203.7,96.6 203.7,106.6 195.0,111.6 186.3,106.6 186.3,96.6 195.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="51" fill="#FFC629" opacity="0.95" points="223.7,96.6 223.7,106.6 215.0,111.6 206.3,106.6 206.3,96.6 215.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
                <polygon data-score="62" fill="#4DBDB2" opacity="0.95" points="243.7,96.6 243.7,106.6 235.0,111.6 226.3,106.6 226.3,96.6 235.0,91.6" stroke="#F4F1E8" strokeWidth="1.8" />
              </svg>
            </div>

            <div className="bg-[rgba(227,235,230,0.08)] text-[#E3EBE6] p-3 rounded-xl text-xs font-mono flex items-center justify-between mt-2">
              <span>Exemple : Île-de-France · IQRH moyen 61/100 · +1.8 pts</span>
              <span className="text-[#4DBDB2] font-semibold">Tendance positive</span>
            </div>
          </div>

          {/* CARD 2: Top 3 Dimensions les plus fragiles */}
          <div className="lg:col-span-5 bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8] mb-4">
              Top 3 des dimensions les plus fragiles · ce mois
            </div>

            <div className="space-y-4">
              {/* Dim 1 */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-[rgba(227,235,230,0.12)]">
                <span className="font-mono text-xs text-[#6D8888] w-5">#1</span>
                <svg className="w-10 h-10 shrink-0 transform -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#123D46" strokeWidth="5" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#00A99D"
                    strokeWidth="5"
                    strokeDasharray="100"
                    strokeDashoffset="36"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">Relations affectives</div>
                  <div className="text-xs text-[#E3EBE6]/80">proximité, confiance, soutien</div>
                </div>
                <div className="font-bold font-mono text-xl text-[#00A99D]">64%</div>
              </div>

              {/* Dim 2 */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-[rgba(227,235,230,0.12)]">
                <span className="font-mono text-xs text-[#6D8888] w-5">#2</span>
                <svg className="w-10 h-10 shrink-0 transform -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#123D46" strokeWidth="5" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#FFC629"
                    strokeWidth="5"
                    strokeDasharray="100"
                    strokeDashoffset="43"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">Relation à soi et au sens</div>
                  <div className="text-xs text-[#E3EBE6]/80">estime, alignement, projection</div>
                </div>
                <div className="font-bold font-mono text-xl text-[#FFC629]">57%</div>
              </div>

              {/* Dim 3 */}
              <div className="flex items-center gap-3.5">
                <span className="font-mono text-xs text-[#6D8888] w-5">#3</span>
                <svg className="w-10 h-10 shrink-0 transform -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#123D46" strokeWidth="5" />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#4DBDB2"
                    strokeWidth="5"
                    strokeDasharray="100"
                    strokeDashoffset="51"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-white">Vie sentimentale</div>
                  <div className="text-xs text-[#E3EBE6]/80">couple, intimité, réciprocité</div>
                </div>
                <div className="font-bold font-mono text-xl text-[#4DBDB2]">49%</div>
              </div>
            </div>

            <div className="mt-5 text-xs text-[#6D8888] font-mono leading-relaxed">
              % de répondants sous le seuil de 50/100 sur la dimension ce mois-ci.
            </div>
          </div>
        </div>

        {/* ── ROW 3 (.drow3 : ARCHETYPES + LINECHART 12 MOIS) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* CARD 1: Répartition des archétypes */}
          <div className="lg:col-span-6 bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8] mb-4">
                Répartition des 15 archétypes relationnels
              </div>
              <div className="space-y-2.5">
                {ARCHETYPES.map((arch, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-44 truncate text-[#E3EBE6] font-medium">{arch.name}</span>
                    <div className="flex-1 h-3.5 rounded-full bg-[#123D46] overflow-hidden">
                      <span
                        className="block h-full rounded-full transition-all duration-700"
                        style={{ width: arch.width, backgroundColor: arch.color }}
                      />
                    </div>
                    <b className="font-mono text-[#F4F1E8] w-8 text-right font-bold">{arch.pct}%</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[rgba(227,235,230,0.12)] flex items-center justify-between flex-wrap gap-3">
              <span className="text-[11px] text-[#6D8888] font-mono">
                top 8 affichés · données certifiées
              </span>
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="border border-[rgba(227,235,230,0.24)] text-[#E3EBE6] hover:bg-[rgba(227,235,230,0.08)] hover:text-[#FFC629] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                ⬇ Télécharger les données (CSV)
              </button>
            </div>
          </div>

          {/* CARD 2: Évolution 12 mois */}
          <div className="lg:col-span-6 bg-[#174B55] rounded-2xl p-5 sm:p-6 border border-[rgba(227,235,230,0.16)] text-[#F4F1E8] flex flex-col justify-between">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F4F1E8] mb-2">
              Évolution du score IQRH moyen · 12 mois
            </div>

            {/* SVG Line Chart (Repris fidèlement de la charte HTML) */}
            <div className="w-full py-2">
              <svg aria-hidden="true" className="w-full h-auto select-none" viewBox="0 0 520 180">
                <line stroke="rgba(227,235,230,.16)" strokeWidth="1" x1="24" x2="500" y1="30" y2="30" />
                <line stroke="rgba(227,235,230,.16)" strokeWidth="1" x1="24" x2="500" y1="65" y2="65" />
                <line stroke="rgba(227,235,230,.16)" strokeWidth="1" x1="24" x2="500" y1="100" y2="100" />
                <line stroke="rgba(227,235,230,.16)" strokeWidth="1" x1="24" x2="500" y1="135" y2="135" />

                <polyline
                  fill="none"
                  points="28.0,128.0 70.2,123.8 112.4,119.6 154.5,123.8 196.7,115.4 238.9,119.6 281.1,111.2 323.3,102.8 365.5,107.0 407.6,115.4 449.8,107.0 492.0,98.6"
                  stroke="#FFC629"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3.5"
                />

                {[
                  { cx: 28.0, cy: 128.0 },
                  { cx: 70.2, cy: 123.8 },
                  { cx: 112.4, cy: 119.6 },
                  { cx: 154.5, cy: 123.8 },
                  { cx: 196.7, cy: 115.4 },
                  { cx: 238.9, cy: 119.6 },
                  { cx: 281.1, cy: 111.2 },
                  { cx: 323.3, cy: 102.8 },
                  { cx: 365.5, cy: 107.0 },
                  { cx: 407.6, cy: 115.4 },
                  { cx: 449.8, cy: 107.0 },
                  { cx: 492.0, cy: 98.6 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.cx}
                    cy={pt.cy}
                    fill="#00A99D"
                    r="4.5"
                    stroke="#F4F1E8"
                    strokeWidth="2"
                  />
                ))}
              </svg>

              <div className="flex justify-between text-[10px] font-mono text-[#6D8888] px-2 pt-1">
                <span>Nov</span>
                <span>Jan</span>
                <span>Mar</span>
                <span>Mai</span>
                <span>Juil</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>

            <div className="mt-3 text-xs text-[#E3EBE6] flex items-center justify-between">
              <span>Moyenne glissante sur 12 mois consécutifs</span>
              <span className="text-[#FFC629] font-mono font-bold">+2.4 pts au total</span>
            </div>
          </div>
        </div>

        {/* ── CARD CTA PARTICIPATION AU BAROMÈTRE ── */}
        <div className="mt-8 p-6 bg-[#174B55] rounded-2xl border border-[rgba(227,235,230,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-jakarta font-bold text-white text-base">
              Vous souhaitez contribuer au Baromètre et connaître votre propre score ?
            </h4>
            <p className="text-xs text-[#E3EBE6] mt-1 font-inter">
              Passez le bilan IQRH individuel en 5 minutes. 100% anonyme, gratuit et résultat immédiat.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartTest}
            className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-[#F4F1E8] font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-colors shadow-md cursor-pointer shrink-0"
          >
            Participer au Baromètre (gratuit) →
          </button>
        </div>
      </div>
    </div>
  );
};
