import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { IrisLogo, IrisMark } from '../brand/IrisLogo';
import { HeroAtmosphere } from '../brand/HeroAtmosphere';
import { HeroModern } from './HeroModern';
import { LuminousTunnelBanner, TrajectoryGraphic, PointLumineux, DataCircles, DotPatternGrid } from '../brand/GraphicElements';
import { ValueBadge, IconMoiNous, IconObservation, IconMesure, IconAction, IconBienveillance, IconSecurite } from '../brand/Icons';
import { IQRHAssessment } from './IQRHAssessment';
import { CoachIRIS } from './CoachIRIS';
import { MethodeSection } from './MethodeSection';
import { OrganisationsSection } from './OrganisationsSection';
import { TarifsSection } from './TarifsSection';
import { BarometreView } from './BarometreView';
import { AuthModal } from './AuthModal';

export const SaaSPlatform: React.FC<{
  onOpenCharte?: () => void;
}> = ({ onOpenCharte }) => {
  const [activeTab, setActiveTab] = useState<
    'accueil' | 'methode' | 'iris' | 'barometre' | 'partenaires' | 'media' | 'organisations' | 'tarifs' | 'test'
  >('accueil');

  const [heroVariant, setHeroVariant] = useState<'modern' | 'panoramic'>('modern');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="space-y-12">
      {/* ==================== 1. TOP HEADER NAVIGATION (SaaS Industry Best Practice & Charter Compliance) ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-5 sm:px-8 lg:px-10 py-3 flex items-center justify-between shadow-2xs rounded-2xl">
        {/* Zone 1: Official Logo LINK OFFICE */}
        <div
          onClick={() => setActiveTab('accueil')}
          className="cursor-pointer group flex items-center shrink-0 pr-6"
        >
          <Logo size="sm" showTagline={false} />
        </div>

        {/* Zone 2: Navigation Links - Natural SaaS Sentence Case, Plus Jakarta Sans, Interactive State */}
        <nav className="hidden xl:flex items-center gap-1.5 text-[13.5px] font-jakarta font-medium text-[#123D46]/85">
          <button
            onClick={() => setActiveTab('methode')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'methode'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            La méthode
          </button>

          <button
            onClick={() => setActiveTab('barometre')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'barometre'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Baromètre
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'test'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            IQRH
          </button>

          <button
            onClick={() => setActiveTab('iris')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'iris'
                ? 'text-[#5965E8] font-semibold bg-[#5965E8]/10 shadow-2xs'
                : 'hover:text-[#5965E8] hover:bg-[#5965E8]/8 text-[#123D46]/85'
            }`}
          >
            <IrisMark size={16} isAnimated={true} />
            <span>Coach IRIS</span>
          </button>

          <button
            onClick={() => setActiveTab('organisations')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'organisations'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Pour les organisations
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'media'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Média
          </button>

          <button
            onClick={() => setActiveTab('tarifs')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'tarifs'
                ? 'text-[#00A99D] font-semibold bg-[#00A99D]/8 shadow-2xs'
                : 'hover:text-[#00A99D] hover:bg-[#F4F1E8]/70'
            }`}
          >
            Tarifs
          </button>
        </nav>

        {/* Zone 3: Actions - Modern SaaS Button Pair (Subtle text secondary + Pill primary with arrow) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => openAuth('login')}
            className="text-[13px] font-jakarta font-medium text-[#123D46]/75 hover:text-[#123D46] px-3.5 py-2 rounded-full hover:bg-slate-100/80 transition-colors"
          >
            Connexion
          </button>

          {onOpenCharte && (
            <button
              onClick={onOpenCharte}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E3EBE6] text-[11px] font-jakarta font-semibold text-[#123D46]/70 hover:border-[#00A99D] hover:text-[#00A99D] transition-all bg-[#F8F9FA]"
            >
              <span>Charte</span>
            </button>
          )}

          {/* Bouton principal Section 10 - Pill with tactile micro-interaction */}
          <button
            onClick={() => setActiveTab('test')}
            className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-[13px] font-jakarta font-semibold shadow-xs hover:shadow-md active:scale-[0.98] transition-all duration-150 flex items-center gap-2 group whitespace-nowrap"
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

      {/* Secondary Bar on medium/small viewports */}
      <div className="xl:hidden bg-white rounded-xl p-2 border border-[#E3EBE6] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-jakarta font-medium">
        {(['accueil', 'methode', 'iris', 'barometre', 'test', 'organisations', 'media', 'tarifs'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === t ? 'bg-[#00A99D] text-white font-semibold' : 'text-[#123D46]/70 hover:bg-[#F4F1E8]'
            }`}
          >
            {t === 'iris' && <IrisMark size={14} isAnimated={true} />}
            <span>
              {t === 'accueil'
                ? 'Accueil'
                : t === 'methode'
                ? 'La méthode'
                : t === 'iris'
                ? 'Coach IRIS'
                : t === 'barometre'
                ? 'Baromètre'
                : t === 'test'
                ? 'IQRH'
                : t === 'organisations'
                ? 'Organisations'
                : t === 'media'
                ? 'Média'
                : 'Tarifs'}
            </span>
          </button>
        ))}
      </div>

      {/* ==================== 2. ACCUEIL VIEW ==================== */}
      {activeTab === 'accueil' && (
        <div className="space-y-12">
          {/* Subtle Hero Design Switcher for comparison */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-jakarta font-semibold text-[#123D46]/70">
                Design du Hero :
              </span>
              <div className="inline-flex bg-[#E3EBE6]/60 p-1 rounded-full text-xs font-jakarta font-medium border border-[#E3EBE6]">
                <button
                  onClick={() => setHeroVariant('modern')}
                  className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                    heroVariant === 'modern'
                      ? 'bg-white text-[#00A99D] font-bold shadow-2xs'
                      : 'text-[#123D46]/70 hover:text-[#123D46]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#00A99D]" />
                  <span>Observatoire du Lien Humain (Recommandé)</span>
                </button>
                <button
                  onClick={() => setHeroVariant('panoramic')}
                  className={`px-3.5 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                    heroVariant === 'panoramic'
                      ? 'bg-white text-[#123D46] font-bold shadow-2xs'
                      : 'text-[#123D46]/70 hover:text-[#123D46]'
                  }`}
                >
                  <span>Vue Panoramique Sombre</span>
                </button>
              </div>
            </div>

            <span className="hidden sm:inline-block text-[11px] text-[#123D46]/50 italic">
              {heroVariant === 'modern'
                ? 'Conforme à la charte · Couleurs chaudes, humain, données interactives'
                : 'Version panoramique précédente'}
            </span>
          </div>

          {/* RENDER THE SELECTED HERO */}
          {heroVariant === 'modern' ? (
            <HeroModern
              onStartTest={() => setActiveTab('test')}
              onExploreMethode={() => setActiveTab('methode')}
            />
          ) : (
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#199E9A]/20 min-h-[540px] sm:min-h-[580px] flex items-center">
              <HeroAtmosphere />
              <div
                className="absolute inset-0 z-[2] pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(6,35,43,0.96) 0%, rgba(6,35,43,0.88) 36%, rgba(6,35,43,0.45) 56%, rgba(6,35,43,0) 78%)'
                }}
              />
              <div className="relative z-10 w-full px-6 sm:px-12 lg:px-16 py-12 sm:py-16 flex flex-col justify-center">
                <div className="max-w-2xl text-white space-y-6">
                  <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse" />
                    <span className="text-xs font-jakarta font-bold uppercase tracking-wider text-white">
                      Laboratoire du lien humain
                    </span>
                  </div>

                  <h1 className="font-jakarta font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
                    Et si le lien humain<br />
                    devenait un indicateur<br />
                    de{' '}
                    <span className="text-[#00F2FE] relative inline-block underline decoration-[#00F2FE]/40 decoration-wavy">
                      notre santé ?
                    </span>
                  </h1>

                  <div className="text-base sm:text-xl font-jakarta font-bold text-[#E3EBE6] tracking-wide flex items-center gap-2">
                    <span>Comprendre.</span>
                    <span className="text-white/40">·</span>
                    <span>Observer.</span>
                    <span className="text-white/40">·</span>
                    <span>Mesurer.</span>
                    <span className="text-white/40">·</span>
                    <span>Agir.</span>
                  </div>

                  <p className="text-sm sm:text-base text-white/90 max-w-xl font-inter leading-relaxed">
                    Nous outillons les dirigeants, les DRH et les équipes pour évaluer scientifiquement et cultiver durablement la qualité de leurs relations humaines.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('test')}
                      className="px-7 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center gap-3 group"
                    >
                      <span>Faire mon test IQRH</span>
                      <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab('methode')}
                      className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-jakarta font-semibold text-sm sm:text-base border border-white/30 backdrop-blur-xs transition-all"
                    >
                      Découvrir la méthode
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/80 font-medium pt-1">
                    <span>✓ Test gratuit</span>
                    <span>·</span>
                    <span>✓ 3 minutes</span>
                    <span>·</span>
                    <span>✓ Restitution immédiate</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== KPI PROOF DOCK ==================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    strokeDashoffset={163 - (163 * 72) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-jakarta font-black text-sm text-[#123D46]">72%</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#00A99D] tracking-wider block">
                  Indice Moyen IQRH
                </span>
                <span className="font-jakarta font-bold text-base text-[#123D46] block">
                  Qualité Relationnelle
                </span>
                <span className="text-xs text-[#123D46]/60 font-medium block">
                  Score national de cohésion
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 font-bold">
                <IconMoiNous size={28} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                  Audits Réalisés
                </span>
                <span className="font-jakarta font-black text-2xl text-[#123D46] block">
                  1 234
                </span>
                <span className="text-xs text-[#123D46]/60 font-medium block">
                  organisations en France
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
                <span className="font-jakarta font-black text-2xl text-[#5965E8] block">
                  +18%
                </span>
                <span className="text-xs text-[#123D46]/60 font-medium block">
                  croissance des démarches
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

          {/* ==================== IRIS AI SPOTLIGHT ==================== */}
          <div className="bg-gradient-to-r from-[#123D46] via-[#1E3048] to-[#123D46] rounded-3xl p-6 sm:p-10 text-white border border-[#5965E8]/30 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0">
                <IrisMark size={72} isAnimated={true} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FFC629]">
                    Nouveau · Intelligence Artificielle
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5965E8] text-white">
                    IRIS v2.4
                  </span>
                </div>
                <h3 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white">
                  Découvrez l'IA IRIS : Le Coach en Intelligence Relationnelle
                </h3>
                <p className="text-xs sm:text-sm text-[#E3EBE6] max-w-xl font-inter leading-relaxed">
                  L'intelligence artificielle dédiée aux dynamiques humaines. IRIS analyse les signaux faibles, désamorce les non-dits et génère des rituels d'équipe personnalisés.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('iris')}
                className="px-6 py-3 rounded-full bg-[#5965E8] hover:bg-[#6874f5] text-white font-jakarta font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Explorer l'IA IRIS</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* ==================== INTERACTIVE DIAGNOSTIC MODULE ==================== */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-jakarta font-bold text-xl sm:text-2xl text-[#123D46]">
                  Diagnostic Interactif Démonstrateur
                </h3>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-0.5">
                  Expérimentez le calcul en direct de l'Indice de Qualité des Relations Humaines.
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-[#00A99D]/10 text-[#00A99D] font-bold text-xs rounded-full">
                IQRH Live Engine
              </span>
            </div>
            <IQRHAssessment />
          </div>

          {/* ==================== 4 PILIERS ==================== */}
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider block mb-1">
                Notre Méthodologie Scientifique
              </span>
              <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
                Les 4 Piliers du Lien Humain
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all shadow-xs flex flex-col items-center text-center">
                <ValueBadge type="humain" size={68} />
                <h3 className="font-jakarta font-extrabold text-lg text-[#123D46] mt-4">HUMAIN</h3>
                <span className="text-xs font-semibold text-[#00A99D] mt-0.5">Le lien au cœur de tout</span>
                <p className="text-xs text-[#123D46]/70 mt-2 font-inter">
                  Valoriser la personne et la richesse des interactions au-delà des seuls objectifs opérationnels.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] hover:border-[#199E9A] transition-all shadow-xs flex flex-col items-center text-center">
                <ValueBadge type="clarte" size={68} />
                <h3 className="font-jakarta font-extrabold text-lg text-[#123D46] mt-4">CLARTÉ</h3>
                <span className="text-xs font-semibold text-[#199E9A] mt-0.5">Rendre visible ce qui compte</span>
                <p className="text-xs text-[#123D46]/70 mt-2 font-inter">
                  Mettre en lumière les zones de friction silencieuses et désamorcer les non-dits avec transparence.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] hover:border-[#FFC629] transition-all shadow-xs flex flex-col items-center text-center">
                <ValueBadge type="fiabilite" size={68} />
                <h3 className="font-jakarta font-extrabold text-lg text-[#123D46] mt-4">FIABILITÉ</h3>
                <span className="text-xs font-semibold text-[#B8870A] mt-0.5">Mesurer avec rigueur</span>
                <p className="text-xs text-[#123D46]/70 mt-2 font-inter">
                  S’appuyer sur des métriques psychométriques et sociologiques validées par des chercheurs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] hover:border-[#5965E8] transition-all shadow-xs flex flex-col items-center text-center">
                <ValueBadge type="action" size={68} />
                <h3 className="font-jakarta font-extrabold text-lg text-[#123D46] mt-4">ACTION</h3>
                <span className="text-xs font-semibold text-[#5965E8] mt-0.5">Transformer les relations</span>
                <p className="text-xs text-[#123D46]/70 mt-2 font-inter">
                  Déployer des micro-actions et rituels concrets intégrés au rythme naturel des équipes.
                </p>
              </div>
            </div>
          </div>

          {/* ==================== SIGNATURE BANNER ==================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#123D46]/60">
                Signature Visuelle du Cheminement
              </span>
              <span className="text-xs text-[#00A99D] font-medium">De la conscience vers le changement</span>
            </div>
            <LuminousTunnelBanner />
          </div>
        </div>
      )}

      {/* VIEW: LA MÉTHODE */}
      {activeTab === 'methode' && (
        <MethodeSection onStartTest={() => setActiveTab('test')} />
      )}

      {/* VIEW: COACH IRIS */}
      {activeTab === 'iris' && (
        <div className="space-y-10">
          {/* IRIS BRAND SYSTEM SPECIFICATION CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3EBE6] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EBE6] pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5965E8] block mb-1">
                  Identité Visuelle & Symbole
                </span>
                <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
                  Logo de l'IA IRIS (Intelligence Relationnelle)
                </h2>
                <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
                  Symbole optique et neural incarnant l'observation bienveillante, la connexion interpersonnelle et l'éveil collectif.
                </p>
              </div>

              <div className="p-3 bg-[#123D46] rounded-2xl flex items-center justify-center shrink-0">
                <IrisLogo variant="badge" size="md" />
              </div>
            </div>

            {/* IRIS Logo Variations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center text-center justify-between min-h-[170px]">
                <span className="text-[10px] font-bold uppercase text-[#123D46]/60">Symbole Animé</span>
                <IrisMark size={56} isAnimated={true} />
                <span className="text-[11px] text-[#123D46]/70 font-medium">Aperture & Constellation</span>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#E3EBE6] flex flex-col items-center text-center justify-between min-h-[170px]">
                <span className="text-[10px] font-bold uppercase text-[#123D46]/60">Wordmark Complet</span>
                <IrisLogo variant="vertical" size="sm" />
                <span className="text-[11px] text-[#00A99D] font-medium">Pour interfaces & dashboards</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#123D46] text-white flex flex-col items-center text-center justify-between min-h-[170px]">
                <span className="text-[10px] font-bold uppercase text-[#4DBDB2]">Fond Nuit / Sombre</span>
                <IrisMark size={56} isAnimated={true} />
                <span className="text-[11px] text-white/80 font-medium">Badge contraste élevé</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#F4FAF8] border border-[#00A99D]/30 flex flex-col items-center text-center justify-between min-h-[170px]">
                <span className="text-[10px] font-bold uppercase text-[#00A99D]">Avatar Conversationnel</span>
                <IrisLogo variant="avatar" size="md" />
                <span className="text-[11px] text-[#00A99D] font-semibold">Statut actif en direct</span>
              </div>
            </div>

            {/* Symbolic Anatomy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E3EBE6] text-xs">
              <div className="p-3 rounded-xl bg-[#F8F9FA]">
                <span className="font-jakarta font-bold text-[#5965E8] block mb-1">
                  1. Les Pétales d'Aperture
                </span>
                <p className="text-[#123D46]/70 text-[11px]">
                  Évoquent l'iris de l'œil (observation et clarté) ainsi que les couches concentriques de l'équipe (Moi, Nous, Collectif).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FA]">
                <span className="font-jakarta font-bold text-[#00A99D] block mb-1">
                  2. La Constellation Intérieure
                </span>
                <p className="text-[#123D46]/70 text-[11px]">
                  Fait écho direct au logo LINK OFFICE avec des nœuds de réseau interconnectés symbolisant la sécurité et la coopération.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F8F9FA]">
                <span className="font-jakarta font-bold text-[#B8870A] block mb-1">
                  3. Le Cœur Doré Lumineux
                </span>
                <p className="text-[#123D46]/70 text-[11px]">
                  L'étincelle centrale symbolise l'éveil, la prise de conscience et le passage à l'action bienveillante.
                </p>
              </div>
            </div>
          </div>

          {/* Coach IRIS Functional Scenarios */}
          <CoachIRIS onStartTest={() => setActiveTab('test')} />
        </div>
      )}

      {/* VIEW: BAROMÈTRE */}
      {activeTab === 'barometre' && <BarometreView />}

      {/* VIEW: POUR LES ORGANISATIONS */}
      {activeTab === 'organisations' && (
        <OrganisationsSection onContact={() => openAuth('register')} />
      )}

      {/* VIEW: TARIFS */}
      {activeTab === 'tarifs' && (
        <TarifsSection
          onSelectPlan={plan => {
            if (plan === 'gratuit') {
              setActiveTab('test');
            } else {
              openAuth('register');
            }
          }}
        />
      )}

      {/* VIEW: PARTENAIRES */}
      {activeTab === 'partenaires' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E3EBE6] shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
              Écosystème de Recherche & Réseaux
            </span>
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
              Nos Partenaires Scientifiques & Institutionnels
            </h2>
            <p className="text-sm text-[#123D46]/70 font-inter">
              LinkOffice collabore avec des universités, des observatoires du travail et des réseaux de DRH pour enrichir la recherche sur le lien humain.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
              <span className="font-jakarta font-extrabold text-base text-[#123D46]">ANACT</span>
              <span className="text-[10px] text-[#123D46]/60 mt-1">Qualité de Vie au Travail</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
              <span className="font-jakarta font-extrabold text-base text-[#123D46]">Labo Sociologie</span>
              <span className="text-[10px] text-[#123D46]/60 mt-1">Recherche Comportementale</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
              <span className="font-jakarta font-extrabold text-base text-[#123D46]">ANDRH</span>
              <span className="text-[10px] text-[#123D46]/60 mt-1">Réseau des Dirigeants RH</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center justify-center text-center">
              <span className="font-jakarta font-extrabold text-base text-[#123D46]">Institut de la Santé</span>
              <span className="text-[10px] text-[#123D46]/60 mt-1">Prévention & Bien-être</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MÉDIA */}
      {activeTab === 'media' && (
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
              Publications & Tribune
            </span>
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
              L'Actualité du Laboratoire
            </h2>
            <p className="text-sm text-[#123D46]/70 font-inter">
              Articles d'opinion, tribunes sociologiques et synthèses de recherche sur l'avenir du travail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-[#00A99D] uppercase">Tribune Le Monde</span>
              <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                « Pourquoi la solitude au travail coûte 14 milliards d'euros par an en France »
              </h3>
              <p className="text-xs text-[#123D46]/70 font-inter">
                Analyse des coûts cachés de l'isolement relationnel et de la perte d'efficacité collective.
              </p>
              <span className="text-xs font-semibold text-[#00A99D] inline-block pt-2">
                Lire l'article →
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-[#5965E8] uppercase">Étude Spéciale</span>
              <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                Le rôle décisif du management de proximité dans la sécurité psychologique
              </h3>
              <p className="text-xs text-[#123D46]/70 font-inter">
                Résultats croisés sur 350 managers interrogés sur leurs pratiques d'écoute active.
              </p>
              <span className="text-xs font-semibold text-[#5965E8] inline-block pt-2">
                Télécharger le livre blanc →
              </span>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-[#B8870A] uppercase">Podcast</span>
              <h3 className="font-jakarta font-bold text-base text-[#123D46]">
                Épisode #12 : « Désamorcer les conflits silencieux avant l'escalade »
              </h3>
              <p className="text-xs text-[#123D46]/70 font-inter">
                Entretien avec le sociologue fondateur du Laboratoire du Lien Humain.
              </p>
              <span className="text-xs font-semibold text-[#B8870A] inline-block pt-2">
                Écouter l'épisode (24 min) →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TEST IQRH */}
      {activeTab === 'test' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
              Diagnostic Officiel
            </span>
            <h2 className="font-jakarta font-extrabold text-3xl text-[#123D46]">
              Indice de Qualité des Relations Humaines (IQRH)
            </h2>
            <p className="text-xs text-[#123D46]/70 max-w-lg mx-auto font-inter">
              Prenez 3 minutes pour mesurer la santé relationnelle de votre collectif.
            </p>
          </div>
          <IQRHAssessment />
        </div>
      )}

      {/* ==================== MODAL AUTHENTICATION ==================== */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};
