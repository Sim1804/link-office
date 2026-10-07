import React, { useState } from 'react';
import { ValueBadge, IconMoiNous, IconObservation, IconMesure, IconAction, IconBienveillance, IconSecurite } from '../brand/Icons';
import { PointLumineux } from '../brand/GraphicElements';
import { IrisMark } from '../brand/IrisLogo';
import Link from 'next/link';

interface HeroModernProps {
  onStartTest: () => void;
  onExploreMethode: () => void;
}

export const HeroModern: React.FC<HeroModernProps> = ({ onStartTest, onExploreMethode }) => {
  const [activeDimension, setActiveDimension] = useState<'tous' | 'p1' | 'p2' | 'p3' | 'p4' | 'p5'>('tous');
  const [activeViewMode, setActiveViewMode] = useState<'equipe' | 'diagnostic' | 'iris'>('equipe');

  const dimensionData = {
    tous: {
      score: 78,
      status: 'Vitalité Collective Élevée',
      statLabel: 'Indice Moyen Global',
      trend: '+12% ce trimestre',
      quote: '« La confiance est le premier levier de performance durable. »',
      author: 'Observatoire LinkOffice 2024'
    },
    p1: {
      score: 86,
      status: 'Confiance & Sécurité',
      statLabel: 'Moi / Nous',
      trend: '95% d’ouverture',
      quote: '« Dans quelle mesure vous sentez-vous libre d’exprimer un désaccord ou un doute sans crainte de jugement au sein de votre équipe ? »',
      author: 'Pilier 1 sur 5'
    },
    p2: {
      score: 74,
      status: 'Clarté des Échanges',
      statLabel: 'Observation & Écoute',
      trend: '80% de limpidité',
      quote: '« Comment qualifieriez-vous la limpidité des informations et la franchise des retours au quotidien ? »',
      author: 'Pilier 2 sur 5'
    },
    p3: {
      score: 81,
      status: 'Soutien & Entraide',
      statLabel: 'Bienveillance & Respect',
      trend: '82% de solidarité',
      quote: '« Face à une charge de travail imprévue ou une difficulté personnelle, sur quel soutien pouvez-vous compter ? »',
      author: 'Pilier 3 sur 5'
    },
    p4: {
      score: 89,
      status: 'Alignement & Coopération',
      statLabel: 'Mesure & Compréhension',
      trend: '92% de synergie',
      quote: '« Les relations entre départements ou métiers favorisent-elles la réalisation des objectifs partagés ? »',
      author: 'Pilier 4 sur 5'
    },
    p5: {
      score: 76,
      status: 'Capacité d’Action',
      statLabel: 'Action & Transformation',
      trend: '79% d’agilité',
      quote: '« Lorsque des dysfonctionnements relationnels sont identifiés, quelle est la capacité du collectif à agir concrètement ? »',
      author: 'Pilier 5 sur 5'
    }
  };

  const current = dimensionData[activeDimension];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-[#E3EBE6] bg-gradient-to-br from-white via-[#FAF9F5] to-[#F4F1E8]/50 shadow-sm p-6 sm:p-10 lg:p-12">
      {/* 1. Subtle warm organic background glows - 100% Charter Colors (No dark sci-fi AI clichés) */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#FFC629]/10 via-[#00A99D]/8 to-transparent rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-[#00A99D]/8 via-[#5965E8]/6 to-transparent rounded-full blur-2xl pointer-events-none -ml-24 -mb-24" />

      {/* 2. Micro Dot Pattern Overlay for scientific precision feel */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#123D46 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* 3. Main Grid Layout: Editorial Power Left / Human Relational Radar Right */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* ================= LEFT COLUMN: EDITORIAL & PROMISE (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-7">
          {/* Badge officiel de laboratoire */}
          <div className="inline-flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-full border border-[#E3EBE6] shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A99D] animate-pulse" />
            <span className="text-xs font-jakarta font-bold text-[#123D46] tracking-wide">
              Laboratoire du lien humain
            </span>
            <span className="text-[#123D46]/30">|</span>
            <span className="text-[11px] font-jakarta font-medium text-[#199E9A]">
              Sociologie & Pratique RH
            </span>
          </div>

          {/* Le Grand Titre Fondateur */}
          <div className="space-y-3">
            <h1 className="font-jakarta font-extrabold text-3xl sm:text-5xl lg:text-[52px] text-[#123D46] tracking-tight leading-[1.14]">
              Et si le lien humain<br />
              devenait un indicateur<br />
              de{' '}
              <span className="relative inline-block text-[#00A99D]">
                notre santé ?
                {/* Handcrafted fluid underline trajectory curve */}
                <svg
                  className="absolute -bottom-2.5 left-0 w-full overflow-visible"
                  height="10"
                  viewBox="0 0 240 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7C45 2 95 9 140 4C180 0 215 5 238 7"
                    stroke="#FFC629"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="238" cy="7" r="3.5" fill="#00A99D" />
                </svg>
              </span>
            </h1>

            {/* Le Mantra Quadriptyque Officiel : Comprendre. Observer. Mesurer. Agir. */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#123D46]/50 mr-1">
                Les 5 piliers :
              </span>
              <button
                onClick={() => setActiveDimension('p1')}
                className={`px-3 py-1 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-1.5 ${
                  activeDimension === 'p1'
                    ? 'bg-[#00A99D] text-white shadow-xs'
                    : 'bg-white text-[#123D46] border border-[#E3EBE6] hover:border-[#00A99D]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                <span>P1</span>
              </button>
              <button
                onClick={() => setActiveDimension('p2')}
                className={`px-3 py-1 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-1.5 ${
                  activeDimension === 'p2'
                    ? 'bg-[#199E9A] text-white shadow-xs'
                    : 'bg-white text-[#123D46] border border-[#E3EBE6] hover:border-[#199E9A]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#199E9A]" />
                <span>P2</span>
              </button>
              <button
                onClick={() => setActiveDimension('p3')}
                className={`px-3 py-1 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-1.5 ${
                  activeDimension === 'p3'
                    ? 'bg-[#FFC629] text-white shadow-xs'
                    : 'bg-white text-[#123D46] border border-[#E3EBE6] hover:border-[#FFC629]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629]" />
                <span>P3</span>
              </button>
              <button
                onClick={() => setActiveDimension('p4')}
                className={`px-3 py-1 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-1.5 ${
                  activeDimension === 'p4'
                    ? 'bg-[#5965E8] text-white shadow-xs'
                    : 'bg-white text-[#123D46] border border-[#E3EBE6] hover:border-[#5965E8]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5965E8]" />
                <span>P4</span>
              </button>
              <button
                onClick={() => setActiveDimension('p5')}
                className={`px-3 py-1 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-1.5 ${
                  activeDimension === 'p5'
                    ? 'bg-[#123D46] text-white shadow-xs'
                    : 'bg-white text-[#123D46] border border-[#E3EBE6] hover:border-[#123D46]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#123D46]" />
                <span>P5</span>
              </button>
            </div>
          </div>

          {/* Prose Éditoriale Humaniste */}
          <p className="text-base sm:text-lg text-[#123D46]/85 max-w-xl font-inter leading-relaxed">
            Première plateforme scientifique dédiée à la santé relationnelle des collectifs. Nous mesurons l’invisible — confiance, écoute, coopération — pour aider dirigeants et équipes à cultiver des relations saines et durables.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              href="/auth/register"
              className="px-7 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-3 group no-underline"
            >
              <span>Faire mon test IQRH</span>
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>

            <button
              onClick={onExploreMethode}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#F4F1E8] text-[#123D46] font-jakarta font-semibold text-sm sm:text-base border border-[#E3EBE6] shadow-2xs hover:border-[#00A99D] transition-all flex items-center gap-2"
            >
              <span>Découvrir la méthode</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          </div>

          {/* Micro-Garanties & Écosystème */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#123D46]/70 font-medium pt-2">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Évaluation gratuite en 3 min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Restitution immédiate du score</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A99D" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>100% anonyme & confidentiel</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: OBSERVATOIRE RELATIONNEL INTERACTIF (5 cols) ================= */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-lg relative overflow-hidden space-y-6">
            
            {/* Header du Widget Produit SaaS */}
            <div className="flex items-center justify-between border-b border-[#E3EBE6] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center font-bold">
                  <IconMoiNous size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-jakarta font-bold text-[#00A99D] uppercase tracking-wider block">
                    Observatoire en direct
                  </span>
                  <span className="text-xs font-jakarta font-bold text-[#123D46]">
                    Cartographie du Lien Humain
                  </span>
                </div>
              </div>

              {/* View Mode Switcher */}
              <div className="flex bg-[#F4F1E8] p-0.5 rounded-full text-[10px] font-jakarta font-bold">
                <button
                  onClick={() => setActiveViewMode('equipe')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeViewMode === 'equipe' ? 'bg-white text-[#123D46] shadow-2xs' : 'text-[#123D46]/60 hover:text-[#123D46]'
                  }`}
                >
                  Équipe
                </button>
                <button
                  onClick={() => setActiveViewMode('diagnostic')}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activeViewMode === 'diagnostic' ? 'bg-white text-[#123D46] shadow-2xs' : 'text-[#123D46]/60 hover:text-[#123D46]'
                  }`}
                >
                  IQRH
                </button>
                <button
                  onClick={() => setActiveViewMode('iris')}
                  className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                    activeViewMode === 'iris' ? 'bg-white text-[#5965E8] shadow-2xs' : 'text-[#123D46]/60 hover:text-[#5965E8]'
                  }`}
                >
                  <IrisMark size={11} isAnimated={false} />
                  <span>IRIS</span>
                </button>
              </div>
            </div>

            {/* Visual Canvas: Real Human Nodes Orbit & Continuous Brand Trajectory */}
            <div className="relative h-[250px] w-full rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6]/80 flex items-center justify-center overflow-hidden">
              
              {/* Organic Brand SVG Wave & Connecting Links */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 380 250">
                <defs>
                  <linearGradient id="linkCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00A99D" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#5965E8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFC629" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* Brand Trajectory weaving organically across colleagues */}
                <path
                  d="M 50 180 C 100 230, 130 90, 190 125 C 250 160, 290 60, 330 80"
                  fill="none"
                  stroke="url(#linkCurveGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Connection lines between human nodes */}
                <line x1="80" y1="70" x2="190" y2="125" stroke="#E3EBE6" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="300" y1="180" x2="190" y2="125" stroke="#E3EBE6" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="110" y1="190" x2="190" y2="125" stroke="#E3EBE6" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="280" y1="65" x2="190" y2="125" stroke="#E3EBE6" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>

              {/* Central Heart: Live IQRH Score Dial */}
              <div
                onClick={() => onStartTest()}
                className="cursor-pointer group relative z-10 w-24 h-24 rounded-full bg-white border-2 border-[#00A99D] shadow-md flex flex-col items-center justify-center p-2 text-center transition-transform hover:scale-105"
              >
                <span className="text-[9px] font-jakarta font-bold text-[#00A99D] uppercase tracking-wider">
                  IQRH
                </span>
                <span className="text-2xl font-jakarta font-black text-[#123D46] leading-none">
                  {current.score}
                </span>
                <span className="text-[8px] font-bold text-[#199E9A] mt-0.5">
                  / 100
                </span>
                <div className="absolute -bottom-2 bg-[#FFC629] text-[#123D46] font-jakarta font-black text-[8px] px-2 py-0.5 rounded-full shadow-2xs">
                  {current.trend}
                </div>
              </div>

              {/* Human Node 1: Top Left - Direction & Vision */}
              <div className="absolute top-4 left-6 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#E3EBE6] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#00A99D] text-white text-[10px] font-black flex items-center justify-center">
                  SL
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#123D46] block leading-none">Sophie</span>
                  <span className="text-[8px] text-[#00A99D] font-medium">Direction</span>
                </div>
              </div>

              {/* Human Node 2: Top Right - Point Lumineux & Épanouissement */}
              <div className="absolute top-5 right-6 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#E3EBE6] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#FFC629] text-[#123D46] text-[10px] font-black flex items-center justify-center">
                  MT
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#123D46] block leading-none">Marc</span>
                  <span className="text-[8px] text-[#B8870A] font-medium">Manager</span>
                </div>
              </div>

              {/* Human Node 3: Bottom Left - Coopération */}
              <div className="absolute bottom-4 left-8 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#E3EBE6] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#5965E8] text-white text-[10px] font-black flex items-center justify-center">
                  AK
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#123D46] block leading-none">Amina</span>
                  <span className="text-[8px] text-[#5965E8] font-medium">RH & Talents</span>
                </div>
              </div>

              {/* Human Node 4: Bottom Right - Confiance */}
              <div className="absolute bottom-5 right-8 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#E3EBE6] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#4DBDB2] text-[#123D46] text-[10px] font-black flex items-center justify-center">
                  TR
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#123D46] block leading-none">Thomas</span>
                  <span className="text-[8px] text-[#199E9A] font-medium">Équipe Projet</span>
                </div>
              </div>
            </div>

            {/* Dynamic Status Strip according to active pillar */}
            <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E3EBE6] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00A99D]" />
                  <span className="font-jakarta font-bold text-[#123D46]">
                    {current.status}
                  </span>
                </div>
                <span className="text-[11px] font-jakarta font-semibold text-[#00A99D]">
                  {current.statLabel}
                </span>
              </div>
              <p className="text-xs text-[#123D46]/75 italic font-inter leading-relaxed">
                {current.quote}
              </p>
              <div className="text-[10px] text-[#123D46]/50 font-bold uppercase tracking-wider text-right">
                {current.author}
              </div>
            </div>

            {/* Quick interactive test launcher inside the widget */}
            <Link
              href="/auth/register"
              className="w-full py-2.5 rounded-full bg-white hover:bg-[#00A99D] hover:text-white text-[#123D46] text-xs font-jakarta font-bold border border-[#E3EBE6] hover:border-[#00A99D] transition-all flex items-center justify-center gap-2 group shadow-2xs no-underline"
            >
              <span>Évaluer mon équipe avec l’IQRH</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
