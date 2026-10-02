"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { IrisMark } from '../brand/IrisLogo';
import { HeroModern } from './HeroModern';
import { LuminousTunnelBanner } from '../brand/GraphicElements';
import { IconMoiNous, IconMesure, IconAction } from '../brand/Icons';
import { IQRHAssessment } from './IQRHAssessment';
import { CoachIRIS } from './CoachIris';
import { MethodeSection } from './MethodeSection';
import { OrganisationsSection } from './OrganisationsSection';
import { TarifsSection } from './TarifsSection';
import { BarometreView } from './BarometreView';


export const SaaSPlatform: React.FC<{
  onLogin?: (user: { name: string; email: string }) => void;
}> = ({ onLogin }) => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('accueil');

  // Shared live metrics: Respondents, organisations, and national average
  const [totalRespondents, setTotalRespondents] = useState<number>(48392);
  const [organisationsCount, setOrganisationsCount] = useState<number>(1248);
  const [nationalAverage, setNationalAverage] = useState<number>(68.4);
  const [lastAddedScore, setLastAddedScore] = useState<{ score: number; timestamp: number } | null>(null);



  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(id);
    }
  };

  // Called whenever an IQRH test is completed or simulated
  const handleTestCompleted = (score: number) => {
    setTotalRespondents(prev => prev + 1);
    setNationalAverage(prevAvg => {
      const weight = 300;
      const updated = Number((((prevAvg * weight) + score) / (weight + 1)).toFixed(1));
      return updated;
    });
    setLastAddedScore({ score, timestamp: Date.now() });
  };

  // Scroll spy to highlight active section in the top bar
  useEffect(() => {
    const sections = ['accueil', 'methode', 'barometre', 'iqrh', 'iris', 'solutions', 'tarifs', 'partenaires'];

    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 140;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ==================== 1. TOP HEADER NAVIGATION ==================== */}
      <header className="sticky top-4 z-50 bg-white/95 backdrop-blur-md border border-[#E3EBE6] px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs rounded-2xl">
        {/* Zone 1: Official Logo LINK OFFICE */}
        <div
          onClick={() => scrollToSection('accueil')}
          className="cursor-pointer group flex items-center shrink-0 pr-4"
        >
          <Logo size="md" />
        </div>

        {/* Zone 2: Section Anchors */}
        <nav className="hidden lg:flex items-center gap-1 text-[13px] font-jakarta font-semibold text-[#123D46]/80">
          <button
            onClick={() => scrollToSection('methode')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'methode'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            La méthode
          </button>

          <button
            onClick={() => scrollToSection('barometre')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSection === 'barometre'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            <span>Baromètre</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            onClick={() => scrollToSection('iqrh')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'iqrh'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            IQRH
          </button>

          <button
            onClick={() => scrollToSection('iris')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeSection === 'iris'
                ? 'text-[#5965E8] font-bold bg-[#5965E8]/10'
                : 'hover:text-[#5965E8] hover:bg-[#5965E8]/8'
            }`}
          >
            <span>Coach IRIS</span>
          </button>

          <Link
            href="/business"
            className={`px-3 py-1.5 rounded-lg transition-colors hover:text-[#00A99D] hover:bg-[#F4F1E8]/70 text-[#123D46]/80 no-underline ${
              activeSection === 'solutions' ? 'text-[#00A99D] font-bold bg-[#00A99D]/10' : ''
            }`}
          >
            Solutions
          </Link>

          <button
            onClick={() => scrollToSection('partenaires')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'partenaires'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Partenaires
          </button>

          <Link
            href="/media"
            className="px-3 py-1.5 rounded-lg transition-colors hover:text-[#00A99D] hover:bg-[#F4F1E8]/70 text-[#123D46]/80 no-underline"
          >
            Médias
          </Link>

          <button
            onClick={() => scrollToSection('tarifs')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'tarifs'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Tarifs
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">


          <Link
            href="/auth/login"
            className="text-xs font-jakarta font-semibold text-[#123D46]/75 hover:text-[#123D46] px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            Connexion
          </Link>

          <Link
            href="/auth/register"
            className="px-4 sm:px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-2 group whitespace-nowrap no-underline"
          >
            <span>Faire mon test IQRH</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Mobile quick-nav scroll bar */}
      <div className="lg:hidden sticky top-20 z-40 bg-white/95 backdrop-blur-md rounded-xl p-2 border border-[#E3EBE6] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-jakarta font-semibold">
        {[
          { id: 'accueil', label: 'Accueil' },
          { id: 'methode', label: 'La méthode' },
          { id: 'barometre', label: 'Baromètre en direct' },
          { id: 'iqrh', label: 'IQRH' },
          { id: 'iris', label: 'Coach IRIS' },
          { id: 'solutions', label: 'Solutions' },
          { id: 'partenaires', label: 'Partenaires' },
          { id: 'tarifs', label: 'Tarifs' }
        ].map(item => {
          if (item.id === 'solutions') {
            return (
              <Link
                key={item.id}
                href="/business"
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors no-underline ${
                  activeSection === item.id
                    ? 'bg-[#00A99D] text-white font-bold'
                    : 'text-[#123D46]/70 hover:bg-[#F4F1E8]'
                }`}
              >
                {item.label}
              </Link>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                activeSection === item.id
                  ? 'bg-[#00A99D] text-white font-bold'
                  : 'text-[#123D46]/70 hover:bg-[#F4F1E8]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* ==================== SECTION: ACCUEIL & HERO ==================== */}
      <section id="accueil" className="scroll-mt-28 space-y-12">
        <HeroModern
          onStartTest={() => router.push('/auth/register')}
          onExploreMethode={() => scrollToSection('methode')}
        />

      </section>

      {/* ==================== SECTION: LA MÉTHODE ==================== */}
      <section id="methode" className="scroll-mt-28">
        <MethodeSection onStartTest={() => scrollToSection('iqrh')} />
      </section>

      {/* ==================== SECTION: BAROMÈTRE EN DIRECT ==================== */}
      <section id="barometre" className="scroll-mt-28">
        <BarometreView
          totalRespondents={totalRespondents}
          organisationsCount={organisationsCount}
          nationalAverage={nationalAverage}
          lastAddedScore={lastAddedScore}
          onStartTest={() => scrollToSection('iqrh')}
          onSimulateTest={score => handleTestCompleted(score)}
        />
      </section>

      {/* ==================== SECTION: IQRH DIAGNOSTIC ==================== */}
      <section id="iqrh" className="scroll-mt-28">
        <IQRHAssessment onComplete={handleTestCompleted} />
      </section>

      {/* ==================== SECTION: COACH IRIS ==================== */}
      <section id="iris" className="scroll-mt-28">
        <CoachIRIS onStartTest={() => scrollToSection('iqrh')} />
      </section>

      <section id="solutions" className="scroll-mt-28">
        <OrganisationsSection onContact={() => router.push('/auth/register')} />
      </section>

      {/* ==================== SECTION: TARIFS ==================== */}
      <section id="tarifs" className="scroll-mt-28">
        <TarifsSection
          onSelectPlan={plan => {
            if (plan === 'gratuit') {
              scrollToSection('iqrh');
            } else {
              router.push('/auth/register');
            }
          }}
        />
      </section>

      {/* ==================== SECTION: PARTENAIRES & RECHERCHE ==================== */}
      <section id="partenaires" className="scroll-mt-28 bg-white rounded-3xl p-8 sm:p-12 border border-[#E3EBE6] shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
            Écosystème Scientifique & Institutionnel
          </span>
          <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
            Partenaires de Recherche & Réseaux Professionnels
          </h2>
          <p className="text-xs sm:text-sm text-[#123D46]/70 font-inter">
            LinkOffice coopère avec des sociologues, des observatoires du travail et des associations de DRH pour enrichir continuellement la précision de l'indice IQRH.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2">
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
            <span className="font-jakarta font-extrabold text-base text-[#123D46]">ANACT</span>
            <span className="text-[11px] text-[#123D46]/60 mt-1">Qualité de Vie au Travail</span>
          </div>
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
            <span className="font-jakarta font-extrabold text-base text-[#123D46]">Labo Sociologie</span>
            <span className="text-[11px] text-[#123D46]/60 mt-1">Sciences Comportementales</span>
          </div>
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
            <span className="font-jakarta font-extrabold text-base text-[#123D46]">ANDRH</span>
            <span className="text-[11px] text-[#123D46]/60 mt-1">Réseau des Dirigeants RH</span>
          </div>
          <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
            <span className="font-jakarta font-extrabold text-base text-[#123D46]">Santé & Travail</span>
            <span className="text-[11px] text-[#123D46]/60 mt-1">Prévention des Risques</span>
          </div>
        </div>
      </section>

      {/* Signature Banner */}
      <section className="space-y-3 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#123D46]/60">
            Signature Visuelle du Cheminement
          </span>
          <span className="text-xs text-[#00A99D] font-medium">De la conscience vers le changement</span>
        </div>
        <LuminousTunnelBanner />
      </section>


    </div>
  );
};
