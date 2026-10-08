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

  // Shared live metrics from database: Respondents, organisations, and national average
  const [totalRespondents, setTotalRespondents] = useState<number>(48);
  const [organisationsCount, setOrganisationsCount] = useState<number>(3);
  const [nationalAverage, setNationalAverage] = useState<number>(65.9);
  const [sectorsData, setSectorsData] = useState<any>(null);
  const [dimensionsData, setDimensionsData] = useState<any>(null);
  const [lastAddedScore, setLastAddedScore] = useState<{ score: number; timestamp: number } | null>(null);

  // Fetch real observatory metrics from PostgreSQL database on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchObservatoire() {
      try {
        const res = await fetch('/api/observatoire');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            if (typeof data.totalAssessments === 'number') {
              setTotalRespondents(data.totalAssessments);
            }
            if (typeof data.organisationsCount === 'number') {
              setOrganisationsCount(data.organisationsCount);
            }
            if (typeof data.globalScore === 'number') {
              setNationalAverage(data.globalScore);
            }
            if (data.sectors) {
              setSectorsData(data.sectors);
            }
            if (data.dimensions) {
              setDimensionsData(data.dimensions);
            }
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données de l'observatoire:", err);
      }
    }
    fetchObservatoire();
    return () => { isMounted = false; };
  }, []);

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

  // Called whenever an IQRH test is completed
  const handleTestCompleted = (score: number) => {
    setTotalRespondents(prev => prev + 1);
    setNationalAverage(prevAvg => {
      const currentCount = totalRespondents || 48;
      const updated = Number((((prevAvg * currentCount) + score) / (currentCount + 1)).toFixed(1));
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
          sectorsData={sectorsData}
          dimensionsData={dimensionsData}
          lastAddedScore={lastAddedScore}
          onStartTest={() => scrollToSection('iqrh')}
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
        <OrganisationsSection onContact={() => router.push('/business#devis')} />
      </section>

      {/* ==================== SECTION: TARIFS ==================== */}
      <section id="tarifs" className="scroll-mt-32 pt-6">
        <TarifsSection
          onSelectPlan={plan => {
            if (plan === 'gratuit') {
              scrollToSection('iqrh');
            } else if (plan === 'premium' || plan === 'premium_plus') {
              router.push('/premium');
            } else if (plan === 'equipe' || plan === 'entreprise' || plan === 'b2g' || plan === 'organisation') {
              router.push('/business#devis');
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
            Link Office coopère avec des sociologues, des observatoires du travail et des associations de DRH pour enrichir continuellement la précision de l'indice IQRH.
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
