import React, { useState, useEffect } from 'react';
import { Logo } from '../brand/Logo';
import { IrisMark } from '../brand/IrisLogo';
import { HeroModern } from './HeroModern';
import { LuminousTunnelBanner } from '../brand/GraphicElements';
import { IconMoiNous, IconMesure, IconAction } from '../brand/Icons';
import { IQRHAssessment } from './IQRHAssessment';
import { CoachIRIS } from './CoachIRIS';
import { MethodeSection } from './MethodeSection';
import { OrganisationsSection } from './OrganisationsSection';
import { TarifsSection } from './TarifsSection';
import { BarometreView } from './BarometreView';
import { AuthModal } from './AuthModal';
import { Building2, ShieldCheck } from 'lucide-react';

export const SaaSPlatform: React.FC<{
  onLogin?: (user: { name: string; email: string }) => void;
  onOpenAdmin?: () => void;
  onOpenRHAdmin?: () => void;
}> = ({ onLogin, onOpenAdmin, onOpenRHAdmin }) => {
  const [activeSection, setActiveSection] = useState<string>('accueil');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Shared live metrics: Respondents, organisations, and national average
  const [totalRespondents, setTotalRespondents] = useState<number>(48392);
  const [organisationsCount, setOrganisationsCount] = useState<number>(1248);
  const [nationalAverage, setNationalAverage] = useState<number>(68.4);
  const [lastAddedScore, setLastAddedScore] = useState<{ score: number; timestamp: number } | null>(null);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

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
    const sections = ['accueil', 'methode', 'barometre', 'iqrh', 'iris', 'organisations', 'tarifs'];

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
          <Logo size="sm" showTagline={false} />
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
            <IrisMark size={15} isAnimated={true} />
            <span>Coach IRIS</span>
          </button>

          <button
            onClick={() => scrollToSection('organisations')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSection === 'organisations'
                ? 'text-[#00A99D] font-bold bg-[#00A99D]/10'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Pour les organisations
          </button>

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
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => openAuth('login')}
            className="text-xs font-jakarta font-semibold text-[#123D46]/80 hover:text-[#00A99D] px-3.5 py-2 rounded-xl hover:bg-[#F4F1E8]/70 transition-colors"
          >
            Connexion
          </button>

          <button
            onClick={() => scrollToSection('iqrh')}
            className="px-4 sm:px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs hover:shadow-md active:scale-[0.98] transition-all flex items-center gap-2 group whitespace-nowrap"
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
          </button>
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
          { id: 'organisations', label: 'Organisations' },
          { id: 'tarifs', label: 'Tarifs' }
        ].map(item => (
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
        ))}
      </div>

      {/* ==================== SECTION: ACCUEIL & HERO ==================== */}
      <section id="accueil" className="scroll-mt-28 space-y-12">
        <HeroModern
          onStartTest={() => scrollToSection('iqrh')}
          onExploreMethode={() => scrollToSection('methode')}
        />

        {/* ==================== KPI PROOF DOCK ==================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Live National IQRH Metric */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="#E3EBE6" strokeWidth="5" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="#00A99D"
                  strokeWidth="5"
                  strokeDasharray={163}
                  strokeDashoffset={163 - (163 * nationalAverage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute font-jakarta font-black text-sm text-[#123D46] font-mono tabular-nums">
                {nationalAverage.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#00A99D] tracking-wider block">
                Moyenne Nationale IQRH
              </span>
              <span className="font-jakarta font-bold text-base text-[#123D46] block">
                Santé Relationnelle
              </span>
              <span className="text-xs text-[#123D46]/60 font-medium block">
                Recalculée en temps réel
              </span>
            </div>
          </div>

          {/* Live Participants Count */}
          <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 font-bold">
              <IconMoiNous size={28} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                Tests Passés en Direct
              </span>
              <span className="font-jakarta font-black text-2xl text-[#123D46] block font-mono tabular-nums">
                {totalRespondents.toLocaleString('fr-FR')}
              </span>
              <span className="text-xs text-[#00A99D] font-medium block">
                participants comptabilisés
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center shrink-0 font-bold">
              <IconAction size={28} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5965E8] tracking-wider block">
                Dynamique Collective
              </span>
              <span className="font-jakarta font-black text-2xl text-[#5965E8] block font-mono tabular-nums">
                +18%
              </span>
              <span className="text-xs text-[#123D46]/60 font-medium block">
                d’initiatives d’équipe
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center shrink-0 font-bold">
              <IconMesure size={28} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#B8870A] tracking-wider block">
                Cadre Scientifique
              </span>
              <span className="font-jakarta font-black text-2xl text-[#123D46] block">
                4 Piliers
              </span>
              <span className="text-xs text-[#123D46]/60 font-medium block">
                Humain · Clarté · Fiabilité · Action
              </span>
            </div>
          </div>
        </div>
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

      {/* ==================== SECTION: ORGANISATIONS ==================== */}
      <section id="organisations" className="scroll-mt-28">
        <OrganisationsSection onContact={() => openAuth('register')} />
      </section>

      {/* ==================== SECTION: TARIFS ==================== */}
      <section id="tarifs" className="scroll-mt-32 pt-6">
        <TarifsSection
          onSelectPlan={plan => {
            if (plan === 'gratuit') {
              scrollToSection('iqrh');
            } else {
              openAuth('register');
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

      {/* ==================== AUTH / DEMO MODAL ==================== */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onLoginSuccess={onLogin}
        onSelectSpace={(space) => {
          if (space === 'super_admin' && onOpenAdmin) onOpenAdmin();
          else if (space === 'rh_admin' && onOpenRHAdmin) onOpenRHAdmin();
          else if (onLogin) onLogin({ name: 'Camille Demo', email: 'camille.demo@linkoffice.fr' });
        }}
      />
    </div>
  );
};
