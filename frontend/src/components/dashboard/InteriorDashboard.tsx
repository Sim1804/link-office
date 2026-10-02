import React, { useState } from 'react';
import { Logo } from '../brand/Logo';
import { IrisMark } from '../brand/IrisLogo';
import { RadarChart } from './RadarChart';
import { IrisDrawer } from './IrisDrawer';

interface InteriorDashboardProps {
  onLogout: () => void;
  onReturnToPublic: () => void;
  onSwitchToRHAdmin?: () => void;
  onSwitchToSuperAdmin?: () => void;
}

export const InteriorDashboard: React.FC<InteriorDashboardProps> = ({
  onLogout,
  onReturnToPublic,
  onSwitchToRHAdmin,
  onSwitchToSuperAdmin
}) => {
  // Top Tabs: 'evaluation' | 'progression' | 'media'
  const [activeMainTab, setActiveMainTab] = useState<'evaluation' | 'progression' | 'media'>('evaluation');

  // Sub Tabs in "Mon évaluation": 'sante' | 'evolution' | 'plan' | 'ressources' | 'relations' | 'journal'
  const [subTab, setSubTab] = useState<'sante' | 'evolution' | 'plan' | 'ressources' | 'relations' | 'journal'>('sante');

  // Daily mood check-in
  const [dailyMood, setDailyMood] = useState<'tres_bien' | 'plutot_bien' | 'mitige' | 'fragile' | 'difficile' | null>('tres_bien');

  // Interactive user profile state
  const [userScore, setUserScore] = useState(83);
  const [xpPoints, setXpPoints] = useState(25);
  const [completedDefis, setCompletedDefis] = useState(1);
  const [isIrisOpen, setIsIrisOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Radar Dimensions exactly as in Image 2
  const radarDimensions = [
    { key: 'social', label: 'Social', score: 83 },
    { key: 'affectif', label: 'Affectif', score: 88 },
    { key: 'sentimental', label: 'Sentimental', score: 75 },
    { key: 'pro', label: 'Professionnel', score: 79 },
    { key: 'soi', label: 'Soi & Sens', score: 88 }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter flex flex-col relative pb-16 selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      {/* ==================== 1. TOP DASHBOARD HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E3EBE6] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Left: Brand Logo & Public site link */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div onClick={onReturnToPublic} className="cursor-pointer">
              <Logo size="sm" showTagline={false} />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E3EBE6]">
              <span className="text-xs font-jakarta font-bold px-2.5 py-1 rounded-lg bg-[#00A99D]/10 text-[#00A99D] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                <span>Espace Collaborateur (Personnel & Anonyme)</span>
              </span>
            </div>
            <button
              onClick={onReturnToPublic}
              className="hidden lg:inline-flex items-center gap-1 text-xs text-[#123D46]/60 hover:text-[#00A99D] font-jakarta font-medium transition-colors border-l border-[#E3EBE6] pl-3"
            >
              <span>← Site public</span>
            </button>
          </div>

          {/* Center: Main Interior Tabs */}
          <nav className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm font-jakarta font-semibold">
            <button
              onClick={() => setActiveMainTab('evaluation')}
              className={`relative py-2 transition-colors ${
                activeMainTab === 'evaluation'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/70 hover:text-[#123D46]'
              }`}
            >
              <span>Mon évaluation</span>
              {activeMainTab === 'evaluation' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('progression')}
              className={`relative py-2 transition-colors ${
                activeMainTab === 'progression'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/70 hover:text-[#123D46]'
              }`}
            >
              <span>Ma progression</span>
              {activeMainTab === 'progression' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveMainTab('media')}
              className={`relative py-2 transition-colors ${
                activeMainTab === 'media'
                  ? 'text-[#00A99D] font-bold'
                  : 'text-[#123D46]/70 hover:text-[#123D46]'
              }`}
            >
              <span>Espace média</span>
              {activeMainTab === 'media' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00A99D] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right: Notifications & Profile Capsule */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Aucune nouvelle notification.')}
              className="w-9 h-9 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#00A99D] text-[#123D46]/70 hover:text-[#00A99D] flex items-center justify-center transition-colors relative"
              title="Notifications"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00A99D] rounded-full" />
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] hover:border-[#00A99D] transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full bg-[#00A99D] text-white font-jakarta font-bold text-xs flex items-center justify-center shadow-2xs">
                  C
                </div>
                <div className="hidden md:block">
                  <div className="font-jakarta font-bold text-xs text-[#123D46] leading-none">
                    Camille Demo
                  </div>
                  <div className="text-[10px] text-[#123D46]/60 font-medium">Membre</div>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#123D46]/50">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E3EBE6] py-2 z-50 animate-fade-in text-xs">
                  <div className="px-4 py-2 border-b border-[#E3EBE6]">
                    <div className="font-bold text-[#123D46]">Camille Demo</div>
                    <div className="text-[11px] text-[#00A99D]">camille.demo@linkoffice.fr</div>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setShowPremiumModal(true);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF9F5] text-[#5965E8] font-bold"
                  >
                    ⭐ Passer à Premium
                  </button>
                  {onSwitchToRHAdmin && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSwitchToRHAdmin();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#5965E8]/10 text-[#5965E8] font-bold"
                    >
                      🏢 Portail RH B2B (Acme Corp)
                    </button>
                  )}
                  {onSwitchToSuperAdmin && (
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onSwitchToSuperAdmin();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#00A99D]/10 text-[#00A99D] font-bold"
                    >
                      🛡️ Console Super Admin
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onReturnToPublic();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF9F5] text-[#123D46]"
                  >
                    ← Retourner au site public
                  </button>
                  <div className="border-t border-[#E3EBE6] my-1" />
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ==================== 2. MAIN WORKSPACE CONTENT ==================== */}
      <main className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* TOP STATUS CARD (As in Image 1) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* User Greeting & Gauge */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-[#00A99D] flex flex-col items-center justify-center shrink-0">
                <span className="font-jakarta font-extrabold text-xl text-[#123D46] font-mono tabular-nums leading-none">
                  {userScore}
                </span>
                <span className="text-[9px] text-[#123D46]/60 font-medium">/ 100</span>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-[#123D46]/70 font-medium">
                  Bonjour, Camille 👋
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="font-jakarta font-extrabold text-xl sm:text-2xl text-[#123D46]">
                    Votre espace IQRH
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-jakarta font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Excellent</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Gamification Badges & Upgrade */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs font-jakarta font-bold text-[#123D46]">
                <span className="text-[#FFC629]">⭐</span>
                <span className="font-mono">{xpPoints} pts</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold">
                Débutant
              </span>
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-4 py-2 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-1"
              >
                <span>Premium</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Daily Mood Check-in Row (AUJOURD'HUI) */}
          <div className="pt-4 border-t border-[#E3EBE6] flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider shrink-0">
              AUJOURD'HUI :
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'tres_bien', label: 'Très bien', emoji: '☀️' },
                { key: 'plutot_bien', label: 'Plutôt bien', emoji: '🌤️' },
                { key: 'mitige', label: 'Mitigé(e)', emoji: '⛅' },
                { key: 'fragile', label: 'Fragile', emoji: '🌧️' },
                { key: 'difficile', label: 'Difficile', emoji: '⛈️' }
              ].map(mood => (
                <button
                  key={mood.key}
                  onClick={() => setDailyMood(mood.key as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-jakarta font-semibold transition-all ${
                    dailyMood === mood.key
                      ? 'bg-[#00A99D] text-white shadow-xs'
                      : 'bg-[#FAF9F5] text-[#123D46]/75 hover:bg-[#F4F1E8] border border-[#E3EBE6]'
                  }`}
                >
                  <span className="mr-1.5">{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
            {dailyMood && (
              <span className="text-[11px] text-[#00A99D] font-medium sm:ml-auto">
                ✓ Météo du jour enregistrée
              </span>
            )}
          </div>
        </div>

        {/* ==================== 3. VIEW SWITCHER ==================== */}

        {/* VIEW 1: MON ÉVALUATION */}
        {activeMainTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Sub Navigation Tabs (Santé, Évolution, Plan, Ressources, Relations, Journal) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'sante', label: 'Santé', icon: '🩺' },
                { id: 'evolution', label: 'Évolution', icon: '⏱️' },
                { id: 'plan', label: 'Plan', icon: '📋' },
                { id: 'ressources', label: 'Ressources', icon: '✨' },
                { id: 'relations', label: 'Relations', icon: '👥' },
                { id: 'journal', label: 'Journal', icon: '📖' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id as any)}
                  className={`px-4 py-2 rounded-2xl text-xs font-jakarta font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    subTab === tab.id
                      ? 'bg-[#00A99D] text-white shadow-xs'
                      : 'bg-white text-[#123D46]/75 hover:bg-[#FAF9F5] border border-[#E3EBE6]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* SUB-VIEW: SANTÉ & BILANS (Image 1, 2, 3) */}
            {subTab === 'sante' && (
              <div className="space-y-6 animate-fade-in">
                {/* Breadcrumb */}
                <div className="text-xs text-[#123D46]/50 font-medium">
                  Dashboard &gt; <strong className="text-[#123D46]">Santé & Bilans</strong>
                </div>

                {/* 3 Top Summary Cards (Image 1) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1: Score IQRH Global */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
                      Score IQRH Global
                    </span>
                    <div className="flex items-center gap-4 my-2">
                      <div className="w-20 h-20 rounded-full border-4 border-[#00A99D] flex items-center justify-center">
                        <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono tabular-nums">
                          {userScore}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Excellent</span>
                        </span>
                        <div className="text-xs text-[#123D46]/60">sur 100 points</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E3EBE6] space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 text-emerald-800">
                        <span className="font-medium">📈 Point fort</span>
                        <strong className="font-jakarta">Relations affectives</strong>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 text-amber-800">
                        <span className="font-medium">⚠️ Priorité</span>
                        <strong className="font-jakarta">Vie sentimentale</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Météo Relationnelle */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
                      Météo Relationnelle
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">☀️</span>
                        <div>
                          <span className="text-[11px] text-[#B8870A] font-bold uppercase">
                            Épanouissement relationnel élevé
                          </span>
                          <h3 className="font-jakarta font-extrabold text-base text-[#123D46]">
                            Grand soleil — Épanouissement relationnel élevé
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter pt-1">
                        Votre météo relationnelle est très favorable. Vos relations constituent aujourd'hui un point d'appui important.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E3EBE6] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#123D46]/70">Score global</span>
                        <span className="font-mono font-bold text-[#123D46]">{userScore} / 100</span>
                      </div>
                      <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                        <div className="bg-[#FFC629] h-full rounded-full" style={{ width: `${userScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Équilibre IER */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#123D46]/60">
                      Équilibre IER
                    </span>
                    <div className="flex flex-col items-center justify-center my-2 text-center">
                      <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center">
                        <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono tabular-nums leading-none">
                          87
                        </span>
                        <span className="text-[9px] text-[#123D46]/60">/ 100</span>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mt-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Profil très équilibré</span>
                      </span>
                    </div>

                    <div className="pt-3 border-t border-[#E3EBE6] text-center text-xs text-[#123D46]/70">
                      Homogénéité de votre profil relationnel
                    </div>
                  </div>
                </div>

                {/* Radar Relationnel & Détail des Scores (Image 2) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Interactive Radar Chart (5 cols) */}
                  <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                        Radar Relationnel
                      </h3>
                      <p className="text-xs text-[#123D46]/70">
                        Vue d'ensemble de vos 5 dimensions fondamentales
                      </p>
                    </div>

                    <div className="flex items-center justify-center py-2">
                      <RadarChart dimensions={radarDimensions} size={280} />
                    </div>

                    <div className="text-[11px] text-center text-[#123D46]/60 pt-2 border-t border-[#E3EBE6]">
                      Survolez un sommet pour afficher la valeur exacte
                    </div>
                  </div>

                  {/* Right: Détail des Scores (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-5">
                    <div>
                      <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                        Détail des Scores
                      </h3>
                      <p className="text-xs text-[#123D46]/70">
                        Score de 0 à 100 par dimension évaluée
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      {[
                        { label: 'Relations sociales', score: 83 },
                        { label: 'Relations affectives', score: 88 },
                        { label: 'Vie sentimentale', score: 75 },
                        { label: 'Vie pro. et engagement', score: 79 },
                        { label: 'Relation à soi', score: 88 }
                      ].map((dim, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-jakarta">
                            <span className="font-semibold text-[#123D46]">{dim.label}</span>
                            <span className="font-mono font-bold text-[#123D46]">{dim.score}/100</span>
                          </div>
                          <div className="w-full bg-[#E3EBE6] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#00A99D] h-full rounded-full transition-all duration-700"
                              style={{ width: `${dim.score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Forces & Points de Vigilance Cards (Image 2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vos Forces */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        ⚡
                      </div>
                      <div>
                        <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                          Vos Forces
                        </h4>
                        <span className="text-xs text-[#123D46]/60">3 points d'appui identifiés</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#00A99D]/15 text-[#00A99D] font-mono font-bold flex items-center justify-center shrink-0">
                          01
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          Vous disposez de ressources émotionnelles importantes pour faire face aux imprévus.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#00A99D]/15 text-[#00A99D] font-mono font-bold flex items-center justify-center shrink-0">
                          02
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          Votre stabilité intérieure est une force pour sécuriser vos interlocuteurs.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#00A99D]/15 text-[#00A99D] font-mono font-bold flex items-center justify-center shrink-0">
                          03
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          Votre réseau relationnel est une ressource active et bienveillante.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points de Vigilance */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E3EBE6] shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        🛡️
                      </div>
                      <div>
                        <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                          Points de Vigilance
                        </h4>
                        <span className="text-xs text-[#123D46]/60">Zones à cultiver en priorité</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#FFC629]/30 text-[#B8870A] font-mono font-bold flex items-center justify-center shrink-0">
                          01
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          <strong>Modéré</strong> — Votre vie sentimentale est un axe à clarifier ou renforcer.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-[#FFC629]/30 text-[#B8870A] font-mono font-bold flex items-center justify-center shrink-0">
                          02
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          <strong>Modéré</strong> — Votre activité actuelle pèse peut-être sur votre équilibre temps libre.
                        </p>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 font-mono font-bold flex items-center justify-center shrink-0">
                          03
                        </span>
                        <p className="text-[#123D46] pt-0.5 leading-relaxed">
                          <strong>Faible</strong> — Votre réseau relationnel mérite d'être entretenu régulièrement.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyse Approfondie & Premium Locks (Image 3) */}
                <div className="space-y-4">
                  <h4 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                    Analyse approfondie
                  </h4>

                  {/* Coach IRIS Call to Action Banner */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#00A99D]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-[#FAF9F5] rounded-2xl border border-[#E3EBE6] flex items-center justify-center shrink-0">
                        <IrisMark size={40} isAnimated={true} />
                      </div>
                      <div>
                        <h5 className="font-jakarta font-bold text-base text-[#123D46]">
                          Parler à IRIS — Votre coach IA
                        </h5>
                        <p className="text-xs text-[#123D46]/70 mt-0.5">
                          Analyse personnalisée de vos résultats, guidée par l'intelligence relationnelle LinkOffice.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsIrisOpen(true)}
                      className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      Commencer avec IRIS
                    </button>
                  </div>

                  {/* 2 Locked Cards (Image 3) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#FAF9F5] to-slate-100 border border-[#E3EBE6] flex flex-col items-center justify-center text-center min-h-[220px] overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E3EBE6] flex items-center justify-center text-xl mb-3">
                        🔒
                      </div>
                      <h5 className="font-jakarta font-bold text-base text-[#123D46]">
                        Détail du Profil
                      </h5>
                      <p className="text-xs text-[#123D46]/60 mt-1 mb-4">
                        Accessible en version Premium
                      </p>
                      <button
                        onClick={() => setShowPremiumModal(true)}
                        className="px-6 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs"
                      >
                        Débloquer
                      </button>
                    </div>

                    <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#FAF9F5] to-slate-100 border border-[#E3EBE6] flex flex-col items-center justify-center text-center min-h-[220px] overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-[#E3EBE6] flex items-center justify-center text-xl mb-3">
                        🔒
                      </div>
                      <h5 className="font-jakarta font-bold text-base text-[#123D46]">
                        Détail ICR Premium
                      </h5>
                      <p className="text-xs text-[#123D46]/60 mt-1 mb-4">
                        Décomposition complète réservée aux abonnés
                      </p>
                      <button
                        onClick={() => setShowPremiumModal(true)}
                        className="px-6 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs"
                      >
                        Débloquer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: ÉVOLUTION & HISTORIQUE (Image 5) */}
            {subTab === 'evolution' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-xs text-[#123D46]/50 font-medium">
                  Dashboard &gt; <strong className="text-[#123D46]">Évolution & Historique</strong>
                </div>

                {/* Carnet de Santé Banner */}
                <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📋</span>
                      <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                        Carnet de Santé Relationnelle
                      </h3>
                    </div>
                    <p className="text-xs text-[#123D46]/70">
                      2 passations enregistrées dans votre carnet
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserScore(prev => Math.min(100, prev + 1));
                      alert('Nouvelle passation enregistrée avec succès !');
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-auto"
                  >
                    <span>🔄</span>
                    <span>Nouveau test</span>
                  </button>
                </div>

                {/* Previous Evaluations preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#00A99D]/40 shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#00A99D] uppercase tracking-wider block">
                        Passation #2 · Actuelle
                      </span>
                      <div className="font-jakarta font-extrabold text-2xl text-[#123D46] mt-1 font-mono">
                        {userScore} / 100
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">+5 pts par rapport à la session précédente</span>
                    </div>
                    <span className="text-xs text-[#123D46]/50">Aujourd'hui</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#123D46]/50 uppercase tracking-wider block">
                        Passation #1 · Initiale
                      </span>
                      <div className="font-jakarta font-extrabold text-2xl text-[#123D46] mt-1 font-mono">
                        78 / 100
                      </div>
                      <span className="text-xs text-[#123D46]/60">Diagnostic de base</span>
                    </div>
                    <span className="text-xs text-[#123D46]/50">Il y a 30 jours</span>
                  </div>
                </div>

                {/* Locked Card (Image 5) */}
                <div className="bg-white rounded-3xl p-10 border border-[#E3EBE6] shadow-xs flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center text-2xl">
                    🔒
                  </div>
                  <h4 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                    Historique & Évolution réservé aux abonnés Premium
                  </h4>
                  <p className="text-xs text-[#123D46]/70 max-w-md font-inter leading-relaxed">
                    Comparez vos passations dans le temps et visualisez l'évolution de chaque dimension relationnelle sur des graphiques chronologiques détaillés.
                  </p>
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2"
                  >
                    <span>Passer à Premium</span>
                    <span>→</span>
                  </button>
                  <span className="text-[11px] text-[#123D46]/50">
                    ✓ Sans engagement · Résiliable à tout moment
                  </span>
                </div>
              </div>
            )}

            {/* SUB-VIEW: MON PLAN & ACTIONS (Image 6) */}
            {subTab === 'plan' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-xs text-[#123D46]/50 font-medium">
                  Dashboard &gt; <strong className="text-[#123D46]">Mon Plan & Actions</strong>
                </div>

                {/* Ordonnance Relationnelle Banner (Image 6) */}
                <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center text-xl shrink-0">
                      📋
                    </div>
                    <div>
                      <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                        Ordonnance relationnelle — Vie sentimentale
                      </h3>
                      <p className="text-xs text-[#123D46]/70 mt-0.5">
                        Cette ordonnance priorise la dimension « Vie sentimentale » identifiée par votre résultat IQRH.
                      </p>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full bg-[#5965E8]/10 text-[#5965E8] text-xs font-jakarta font-bold shrink-0 self-start sm:self-auto">
                    Priorité — Vie sentimentale
                  </span>
                </div>

                {/* Recommendations Title */}
                <div className="text-center pt-2">
                  <span className="px-4 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] font-jakarta font-bold text-xs uppercase tracking-wider">
                    Recommandations d'actions
                  </span>
                </div>

                {/* 3 Recommendations Cards (Image 6) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#5965E8] uppercase tracking-wider">
                          📖 Recommandation
                        </span>
                        <span className="font-mono text-xs font-bold text-[#123D46]/40">#1</span>
                      </div>
                      <h4 className="font-jakarta font-bold text-base text-[#123D46] leading-snug">
                        Mettre en place un temps d'échange dédié à 30 jours
                      </h4>
                      <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                        Suivre une recommandation puis réévaluer son impact sur l'IQRH.
                      </p>
                      <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs space-y-1">
                        <strong className="text-[#123D46] block">🎯 Objectif :</strong>
                        <p className="text-[#123D46]/75">
                          Améliorer la prévention de la charge mentale par une action mesurable.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setXpPoints(prev => prev + 20);
                        alert('Action #1 activée ! (+20 XP)');
                      }}
                      className="w-full py-2.5 rounded-xl border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all text-xs font-jakarta font-bold text-center"
                    >
                      Activer cette action
                    </button>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#5965E8] uppercase tracking-wider">
                          📖 Recommandation
                        </span>
                        <span className="font-mono text-xs font-bold text-[#123D46]/40">#2</span>
                      </div>
                      <h4 className="font-jakarta font-bold text-base text-[#123D46] leading-snug">
                        Clarifier ses priorités relationnelles — Management
                      </h4>
                      <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                        Lister les relations qui nourrissent et celles qui épuisent pour mieux arbitrer son temps.
                      </p>
                      <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs space-y-1">
                        <strong className="text-[#123D46] block">🎯 Objectif :</strong>
                        <p className="text-[#123D46]/75">
                          Renforcer le sentiment de confiance et l'écoute active au travail.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setXpPoints(prev => prev + 20);
                        alert('Action #2 activée ! (+20 XP)');
                      }}
                      className="w-full py-2.5 rounded-xl border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all text-xs font-jakarta font-bold text-center"
                    >
                      Activer cette action
                    </button>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#5965E8] uppercase tracking-wider">
                          📖 Recommandation
                        </span>
                        <span className="font-mono text-xs font-bold text-[#123D46]/40">#3</span>
                      </div>
                      <h4 className="font-jakarta font-bold text-base text-[#123D46] leading-snug">
                        Renforcer la sécurité psychologique du collectif
                      </h4>
                      <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                        Instaurer un tour de table bienveillant pour libérer l'expression des non-dits.
                      </p>
                      <div className="p-3 bg-[#FAF9F5] rounded-xl text-xs space-y-1">
                        <strong className="text-[#123D46] block">🎯 Objectif :</strong>
                        <p className="text-[#123D46]/75">
                          Développer la solidarité et fluidifier les projets transverses.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setXpPoints(prev => prev + 20);
                        alert('Action #3 activée ! (+20 XP)');
                      }}
                      className="w-full py-2.5 rounded-xl border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D] hover:text-white transition-all text-xs font-jakarta font-bold text-center"
                    >
                      Activer cette action
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: RESSOURCES & PRESCRIPTION (Image 7) */}
            {subTab === 'ressources' && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-xs text-[#123D46]/50 font-medium">
                  Dashboard &gt; <strong className="text-[#123D46]">Ressources & Prescription</strong>
                </div>

                {/* Banner (Image 7) */}
                <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFC629]/20 text-[#B8870A] flex items-center justify-center text-xl shrink-0">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                      Soutien & Réseau de Partenaires
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-0.5">
                      Ressources et contacts qualifiés pour vous accompagner dans votre démarche d'équilibre relationnel.
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <span className="px-4 py-1 rounded-full bg-[#FFC629]/20 text-[#B8870A] font-jakarta font-bold text-xs uppercase tracking-wider">
                    Partenaires Recommandés
                  </span>
                </div>

                {/* Partners List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#00A99D] uppercase">Réseau d'Écoute</span>
                      <span className="text-xs font-mono text-[#123D46]/40">#01</span>
                    </div>
                    <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                      Réseau National des Médiateurs
                    </h4>
                    <p className="text-xs text-[#123D46]/70 leading-relaxed">
                      Professionnels qualifiés pour faciliter la médiation interpersonnelle en contexte complexe.
                    </p>
                    <button className="text-xs text-[#00A99D] font-bold hover:underline">
                      Consulter les fiches contacts →
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#5965E8] uppercase">Coaching Équipe</span>
                      <span className="text-xs font-mono text-[#123D46]/40">#02</span>
                    </div>
                    <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                      Collectif Sociologie Appliquée
                    </h4>
                    <p className="text-xs text-[#123D46]/70 leading-relaxed">
                      Intervenants certifiés LinkOffice pour animer des ateliers de cohésion et d'écoute active.
                    </p>
                    <button className="text-xs text-[#5965E8] font-bold hover:underline">
                      Consulter les fiches contacts →
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#B8870A] uppercase">Prévention</span>
                      <span className="text-xs font-mono text-[#123D46]/40">#03</span>
                    </div>
                    <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                      Institut de la Qualité Relationnelle
                    </h4>
                    <p className="text-xs text-[#123D46]/70 leading-relaxed">
                      Guides méthodologiques, fiches rituels et modèles d'entretiens annuels bienveillants.
                    </p>
                    <button className="text-xs text-[#B8870A] font-bold hover:underline">
                      Accéder à la bibliothèque →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: RELATIONS */}
            {subTab === 'relations' && (
              <div className="bg-white rounded-3xl p-8 border border-[#E3EBE6] shadow-xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#E3EBE6] pb-4">
                  <div>
                    <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                      Cartographie de vos Cercles Relationnels
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-0.5">
                      Visualisez la qualité du lien au sein de vos différents cercles de vie.
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-[#00A99D] text-white text-xs font-jakarta font-bold">
                    + Ajouter une relation
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#00A99D] uppercase">1. Premier Cercle</span>
                      <span className="text-xs font-mono font-bold text-[#123D46]">4 personnes</span>
                    </div>
                    <p className="text-xs text-[#123D46]/75">
                      Relations très proches offrant une sécurité affective inconditionnelle.
                    </p>
                    <div className="text-xs font-semibold text-emerald-600">● Santé excellente (92%)</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#5965E8] uppercase">2. Équipe & Collègues</span>
                      <span className="text-xs font-mono font-bold text-[#123D46]">8 personnes</span>
                    </div>
                    <p className="text-xs text-[#123D46]/75">
                      Collaborateurs du quotidien pour la coopération et l'entraide de travail.
                    </p>
                    <div className="text-xs font-semibold text-[#5965E8]">● Santé stable (79%)</div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#B8870A] uppercase">3. Réseau Élargi</span>
                      <span className="text-xs font-mono font-bold text-[#123D46]">24 personnes</span>
                    </div>
                    <p className="text-xs text-[#123D46]/75">
                      Connaissances, anciens pairs et réseau professionnel de veille.
                    </p>
                    <div className="text-xs font-semibold text-amber-600">● À cultiver (72%)</div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: JOURNAL */}
            {subTab === 'journal' && (
              <div className="bg-white rounded-3xl p-8 border border-[#E3EBE6] shadow-xs space-y-6 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#E3EBE6] pb-4">
                  <div>
                    <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                      Journal de Bord Relationnel
                    </h3>
                    <p className="text-xs text-[#123D46]/70 mt-0.5">
                      Notez vos réflexions quotidiennes et vos observations sur la qualité des échanges.
                    </p>
                  </div>
                  <button
                    onClick={() => alert('Entrée de journal enregistrée.')}
                    className="px-4 py-2 rounded-xl bg-[#00A99D] text-white text-xs font-jakarta font-bold"
                  >
                    + Nouvelle note
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#123D46]/60">
                      <span>Aujourd'hui · Météo : Très bien ☀️</span>
                      <span>10:45</span>
                    </div>
                    <p className="text-[#123D46] font-medium leading-relaxed">
                      « Réunion d'équipe très apaisée ce matin. Le rituel de parole libre a permis à chacun d'exprimer ses contraintes sans tension. »
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#123D46]/60">
                      <span>Hier · Météo : Plutôt bien 🌤️</span>
                      <span>18:20</span>
                    </div>
                    <p className="text-[#123D46] font-medium leading-relaxed">
                      « Échange constructif avec mon responsable sur les priorités du trimestre. Bonne écoute mutuelle. »
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: MA PROGRESSION (Image 4) */}
        {activeMainTab === 'progression' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Back (Image 4) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider flex items-center gap-1.5">
                <span>🏆</span>
                <span>Gamification & Défis</span>
              </span>
              <button
                onClick={() => setActiveMainTab('evaluation')}
                className="text-xs text-[#123D46]/70 hover:text-[#00A99D] font-jakarta font-bold"
              >
                ← Retour au dashboard
              </button>
            </div>

            <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
              Ma Progression
            </h2>

            {/* Level Card (Image 4) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center text-2xl shrink-0">
                    ⭐
                  </div>
                  <div>
                    <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                      Niveau 1
                    </h3>
                    <p className="text-xs text-[#00A99D] font-medium">
                      Encore {100 - xpPoints} XP pour le Niveau 2
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-[#123D46]/50 block">
                    Points Totaux
                  </span>
                  <span className="font-jakarta font-extrabold text-3xl text-[#123D46] font-mono tabular-nums">
                    {xpPoints}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="w-full bg-[#E3EBE6] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00A99D] h-full rounded-full transition-all duration-700"
                    style={{ width: `${(xpPoints / 100) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#123D46]/60 font-mono">
                  <span>0 XP</span>
                  <span>{xpPoints}% vers le niveau suivant</span>
                  <span>100 XP</span>
                </div>
              </div>
            </div>

            {/* Stat Row (Image 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-xl shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                    Points Totaux
                  </span>
                  <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                    {xpPoints}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                    Défis Complétés
                  </span>
                  <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                    {completedDefis}
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center text-xl shrink-0">
                  🎯
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                    Plans Actifs
                  </span>
                  <span className="font-jakarta font-extrabold text-2xl text-[#123D46] font-mono">
                    2
                  </span>
                </div>
              </div>
            </div>

            {/* Badges & Recent Challenges (Image 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-4">
                <h4 className="font-jakarta font-bold text-base text-[#123D46] flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Badges Obtenus (1 / 6)</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-[#00A99D]/10 border border-[#00A99D]/30 text-center space-y-1">
                    <span className="text-2xl">🌱</span>
                    <span className="text-[11px] font-bold text-[#00A99D] block">Premier Pas</span>
                    <span className="text-[9px] text-[#123D46]/60 block">Diagnostic fait</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-dashed border-[#E3EBE6] text-center space-y-1 opacity-50">
                    <span className="text-2xl">👂</span>
                    <span className="text-[11px] font-bold text-[#123D46] block">Écoute Active</span>
                    <span className="text-[9px] text-[#123D46]/60 block">Verrouillé</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-dashed border-[#E3EBE6] text-center space-y-1 opacity-50">
                    <span className="text-2xl">🔥</span>
                    <span className="text-[11px] font-bold text-[#123D46] block">7 Jours Météo</span>
                    <span className="text-[9px] text-[#123D46]/60 block">Verrouillé</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-jakarta font-bold text-base text-[#123D46] flex items-center gap-2">
                    <span>📋</span>
                    <span>Derniers défis réalisés</span>
                  </h4>
                  <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] text-xs space-y-1 mt-3">
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>✓ Évaluation initiale IQRH complétée</span>
                      <span className="font-mono">+25 XP</span>
                    </div>
                    <p className="text-[#123D46]/70 text-[11px]">
                      Score de référence calculé et enregistré sur vos 5 dimensions.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setXpPoints(prev => prev + 15);
                    setCompletedDefis(prev => prev + 1);
                    alert('Nouveau défi complété ! (+15 XP)');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs"
                >
                  Valider un rituel d'écoute aujourd'hui (+15 XP)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ESPACE MÉDIA */}
        {activeMainTab === 'media' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider block mb-1">
                Laboratoire du Lien Humain
              </span>
              <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
                Espace Média & Recherche
              </h2>
              <p className="text-xs text-[#123D46]/70 mt-1">
                Articles, podcasts et décryptages sociologiques exclusifs réservés aux membres.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-[#00A99D] uppercase">Article de Recherche</span>
                <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                  Comment la sécurité psychologique transforme l'engagement
                </h4>
                <p className="text-xs text-[#123D46]/70 leading-relaxed">
                  Synthèse des travaux menés auprès de 400 managers en environnement hybride.
                </p>
                <button className="text-xs text-[#00A99D] font-bold hover:underline">
                  Lire l'article (6 min) →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-[#5965E8] uppercase">Podcast</span>
                <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                  Épisode #14 : « Désamorcer l'usure relationnelle »
                </h4>
                <p className="text-xs text-[#123D46]/70 leading-relaxed">
                  Entretien avec les fondateurs sur les leviers d'action collective au quotidien.
                </p>
                <button className="text-xs text-[#5965E8] font-bold hover:underline">
                  Écouter l'épisode (18 min) →
                </button>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-[#B8870A] uppercase">Livre Blanc</span>
                <h4 className="font-jakarta font-bold text-base text-[#123D46]">
                  Le Baromètre 2024 décrypté pour les managers
                </h4>
                <p className="text-xs text-[#123D46]/70 leading-relaxed">
                  Téléchargez la version intégrale des 84 pages de l'étude nationale.
                </p>
                <button className="text-xs text-[#B8870A] font-bold hover:underline">
                  Télécharger le PDF →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================== 4. FLOATING IRIS COACH BUTTON ==================== */}
      <button
        onClick={() => setIsIrisOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#123D46] hover:bg-[#1E3048] border-2 border-[#5965E8]/60 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 group"
        title="Parler à IRIS — Votre coach IA"
        aria-label="Ouvrir le coach IRIS"
      >
        <IrisMark size={32} isAnimated={true} />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FFC629] rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* ==================== 5. IRIS COACH DRAWER MODAL ==================== */}
      <IrisDrawer
        isOpen={isIrisOpen}
        onClose={() => setIsIrisOpen(false)}
        userScore={userScore}
      />

      {/* ==================== 6. PREMIUM MODAL ==================== */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E3EBE6] space-y-5 animate-scale-in text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-2xl mx-auto">
              ⭐
            </div>
            <div className="space-y-1">
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">
                Débloquez LinkOffice Premium
              </h3>
              <p className="text-xs text-[#123D46]/70">
                Accédez à l'historique complet, aux graphiques d'évolution et à l'analyse approfondie de votre profil.
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#E3EBE6] text-left text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Carnet de santé illimité & comparateur temporel</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Conseils illimités avec Coach IRIS IA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Détail complet des 5 dimensions et recommandations</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-[#E3EBE6] text-xs font-jakarta font-semibold text-[#123D46]"
              >
                Plus tard
              </button>
              <button
                onClick={() => {
                  alert('Félicitations Camille, votre compte a été passé en Premium Démo !');
                  setShowPremiumModal(false);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs"
              >
                Activer l'offre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
