import React, { useState } from 'react';
import { Logo, ConstellationMark } from '../brand/Logo';
import { BRAND_COLORS, BRAND_VALUES } from '../../types/brand';
import { BoardView } from './BoardView';
import {
  ConstellationGraphic,
  TrajectoryGraphic,
  PointLumineux,
  NetworkMesh,
  DataCircles,
  DotPatternGrid,
  LuminousTunnelBanner
} from '../brand/GraphicElements';
import {
  IconMoiNous,
  IconObservation,
  IconMesure,
  IconAction,
  IconBienveillance,
  IconOuverture,
  IconSecurite,
  ValueBadge
} from '../brand/Icons';

export const CharteInteractive: React.FC<{
  onOpenSaaS: () => void;
  onOpenMobile: () => void;
  onOpenBarometre: () => void;
}> = ({ onOpenSaaS, onOpenMobile, onOpenBarometre }) => {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<number>(3);
  const [boardMode, setBoardMode] = useState<'interactive' | 'poster'>('interactive');

  const handleCopyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Switcher: Interactive Guide vs Full Master Board Poster */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#E3EBE6] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00A99D]" />
          <span className="text-xs font-jakarta font-bold text-[#123D46]">
            Mode d'affichage de la Charte :
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#F4F1E8] p-1 rounded-xl border border-[#E3EBE6]">
          <button
            onClick={() => setBoardMode('interactive')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-jakarta font-semibold transition-all ${
              boardMode === 'interactive'
                ? 'bg-white text-[#00A99D] shadow-2xs'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            Vue Détaillée Interactive
          </button>
          <button
            onClick={() => setBoardMode('poster')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-jakarta font-semibold transition-all ${
              boardMode === 'poster'
                ? 'bg-white text-[#00A99D] shadow-2xs'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            Vue Planche Officielle (3 colonnes)
          </button>
        </div>
      </div>

      {boardMode === 'poster' ? (
        <BoardView
          onOpenSaaS={onOpenSaaS}
          onOpenMobile={onOpenMobile}
          onOpenBarometre={onOpenBarometre}
        />
      ) : (
        <>
          {/* Top Banner Identity - Exact match with user image header */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E3EBE6] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-bl from-[#00A99D]/10 via-[#FFC629]/5 to-transparent rounded-full pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase font-jakarta font-extrabold tracking-[0.25em] text-[#00A99D]">
                  CHARTE GRAPHIQUE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#123D46]/30" />
                <span className="text-xs text-[#123D46]/60 font-medium">Système Visuel & UI SaaS</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E3EBE6] pb-6">
                <div>
                  <h1 className="font-jakarta font-black text-3xl sm:text-5xl text-[#123D46] tracking-tight">
                    L<span className="text-[#00A99D]">i</span>NK OFFICE
                  </h1>
                  <div className="font-jakarta font-bold text-base sm:text-lg text-[#123D46]/80 tracking-[0.2em] uppercase mt-1">
                    LABORATOIRE DU LIEN HUMAIN
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs uppercase font-semibold text-[#123D46]/50 block">Devise & Signature</span>
                  <p className="font-jakarta font-bold text-lg sm:text-xl text-[#00A99D]">
                    Comprendre. Observer. Mesurer. Agir.
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#123D46]/80 max-w-2xl font-inter leading-relaxed pt-2">
                Ce document établit les règles d'expression visuelle, d'architecture ergonomique et d'expérience utilisateur
                du <strong>Laboratoire du Lien Humain</strong>. Il garantit la cohérence entre la rigueur scientifique des mesures et la chaleur de l’humain.
              </p>
            </div>
          </div>

          {/* Grid of Sections 01 to 05 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (Sections 01, 02, 03, 04, 05) */}
            <div className="lg:col-span-5 space-y-8">
              {/* 01. LOGO PRINCIPAL */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    01. Logo Principal
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Symbole & Typographie</span>
                </div>

                <div className="p-8 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex items-center justify-center min-h-[160px]">
                  <Logo size="lg" variant="light" />
                </div>

                <p className="text-xs text-[#123D46]/70 leading-relaxed">
                  Le logo associe une constellation géométrique de points reliés (symbolisant les personnes et leurs interactions)
                  à un lettrage épuré avec un point teal identitaire sur le <strong>« i »</strong>.
                </p>
              </div>

              {/* 02. DÉCLINAISONS */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    02. Déclinaisons
                  </h2>
                  <span className="text-[10px] text-[#123D46]/60 font-medium">Fonds clairs, sombres & insignes</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-[#E3EBE6] flex items-center justify-center min-h-[90px]">
                    <Logo size="sm" variant="light" />
                  </div>

                  <div className="p-4 bg-[#123D46] rounded-xl flex items-center justify-center min-h-[90px]">
                    <Logo size="sm" variant="white" />
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#E3EBE6] flex flex-col items-center justify-center min-h-[100px]">
                    <Logo size="md" variant="circle" />
                  </div>

                  <div className="p-4 bg-[#F4F1E8] rounded-xl border border-[#E2DCD0] flex flex-col items-center justify-center min-h-[100px] text-center">
                    <ConstellationMark size={40} />
                    <span className="font-jakarta font-bold text-xs text-[#00A99D] mt-1">LINK</span>
                    <span className="text-[8px] tracking-[0.25em] text-[#123D46]">OFFICE</span>
                  </div>
                </div>
              </div>

              {/* 03. SIGNATURE */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    03. Signature
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Trajectoire & Point Lumineux</span>
                </div>

                <div className="p-5 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] space-y-3">
                  <div className="font-jakarta font-bold text-base text-[#123D46] text-center">
                    Laboratoire du lien humain
                  </div>
                  <TrajectoryGraphic />
                </div>

                <p className="text-xs text-[#123D46]/70 leading-relaxed">
                  La signature institutionnelle s’accompagne d’une ligne ondoyante traversant les 4 teintes fondamentales
                  pour aboutir à l’étincelle de clarté.
                </p>
              </div>

              {/* 04. VALEURS */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    04. Valeurs
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Les 4 piliers</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {BRAND_VALUES.map(val => (
                    <div key={val.id} className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E3EBE6] flex flex-col items-center text-center">
                      <ValueBadge type={val.iconName} size={54} />
                      <span className="font-jakarta font-extrabold text-xs text-[#123D46] mt-3">
                        {val.name}
                      </span>
                      <span className="text-[11px] text-[#123D46]/70 mt-0.5 leading-snug">
                        {val.tagline}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 05. TON DE COMMUNICATION */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    05. Ton de Communication
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Posture & Voix</span>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#123D46] to-[#00A99D] text-white rounded-xl space-y-2">
                  <span className="text-xs font-jakarta font-bold text-[#FFC629] block">
                    Bienveillant, inclusif et inspirant.
                  </span>
                  <p className="text-xs text-[#E3EBE6] leading-relaxed">
                    « Nous parlons à chacun avec simplicité et intégrité, sans jargon ni promesse magique. »
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (Sections 06 to 14) */}
            <div className="lg:col-span-7 space-y-8">
              {/* 06. PALETTE DE COULEURS */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    06. Palette de Couleurs
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Cliquez pour copier le code HEX</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BRAND_COLORS.map(c => {
                    const isCopied = copiedColor === c.hex;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleCopyColor(c.hex)}
                        className="group text-left p-3 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all bg-[#F8F9FA] flex flex-col justify-between"
                      >
                        <div
                          style={{ backgroundColor: c.hex }}
                          className="w-full h-14 rounded-lg shadow-inner mb-2.5 relative flex items-center justify-center transition-transform group-hover:scale-[1.02]"
                        >
                          {isCopied && (
                            <span className="bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                              Copié !
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-mono text-xs font-bold text-[#123D46] block">
                            {c.hex}
                          </span>
                          <span className="font-jakarta font-bold text-xs text-[#123D46] mt-0.5 block">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-[#123D46]/60 font-medium block">
                            {c.role}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 07. TYPOGRAPHIES */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    07. Typographies
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Titres & Textes Courants</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Titres */}
                  <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                      TITRES / ACCROCHES
                    </span>
                    <div className="font-jakarta font-bold text-xl text-[#123D46]">
                      Plus Jakarta Sans
                    </div>
                    <span className="text-xs text-[#00A99D] font-semibold block">
                      Bold / SemiBold / Medium
                    </span>
                    <div className="text-3xl font-jakarta font-black text-[#123D46]">Aa</div>
                    <div className="text-[10px] font-mono text-[#123D46]/60 break-all leading-relaxed">
                      ABCDEFGHJKLKMOPQRSTUVWXYZ
                      <br />
                      abcdefghijklkmaqaptuvwwxyz 0123456789
                    </div>
                  </div>

                  {/* Textes courants */}
                  <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                      TEXTES COURANTS
                    </span>
                    <div className="font-inter font-bold text-xl text-[#123D46]">
                      Inter
                    </div>
                    <span className="text-xs text-[#199E9A] font-semibold block">
                      Regular / Medium
                    </span>
                    <div className="text-3xl font-inter font-normal text-[#123D46]">Aa</div>
                    <div className="text-[10px] font-mono text-[#123D46]/60 break-all leading-relaxed">
                      ABCDEFFGJHJLKKMOPQRSTUVWXYXZ
                      <br />
                      abcdefgijkljmaqaptuvwxyz 0123456789
                    </div>
                  </div>
                </div>
              </div>

              {/* 08. ÉLÉMENTS GRAPHIQUES */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    08. Éléments Graphiques
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Composantes Visuelles</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      CONSTELLATION
                    </span>
                    <ConstellationGraphic interactive={false} />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      TRAJECTOIRE
                    </span>
                    <TrajectoryGraphic />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      POINT LUMINEUX
                    </span>
                    <div className="p-4 bg-white/70 rounded-xl border border-[#E3EBE6] flex items-center justify-center h-28">
                      <PointLumineux size={72} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      RÉSEAUX & MAILLAGE
                    </span>
                    <NetworkMesh />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      CERCLES & DONNÉES
                    </span>
                    <DataCircles score={72} />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-[#123D46]/60 block mb-1.5 uppercase">
                      MOTIFS
                    </span>
                    <DotPatternGrid />
                  </div>
                </div>
              </div>

              {/* 09. ICONOGRAPHIE */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    09. Iconographie
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">7 Icônes Système</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconMoiNous size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">MOI / NOUS</span>
                    <span className="text-[9px] text-[#123D46]/60">Le lien</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconObservation size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">OBSERVATION</span>
                    <span className="text-[9px] text-[#123D46]/60">Regarder</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconMesure size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">MESURE</span>
                    <span className="text-[9px] text-[#123D46]/60">Comprendre</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconAction size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">ACTION</span>
                    <span className="text-[9px] text-[#123D46]/60">Agir</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconBienveillance size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">BIENVEILLANCE</span>
                    <span className="text-[9px] text-[#123D46]/60">Respect</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconOuverture size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">OUVERTURE</span>
                    <span className="text-[9px] text-[#123D46]/60">Communauté</span>
                  </div>

                  <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6] flex flex-col items-center text-center">
                    <IconSecurite size={24} color="#123D46" />
                    <span className="font-jakarta font-bold text-[10px] text-[#123D46] mt-2 block">SÉCURITÉ</span>
                    <span className="text-[9px] text-[#123D46]/60">Confiance</span>
                  </div>
                </div>
              </div>

              {/* 10. BOUTONS & COMPOSANTS UI */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    10. Boutons & Composants UI
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Système d'Interactions</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <button className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs flex items-center gap-2">
                    <span>Bouton principal</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>

                  <button className="px-6 py-2.5 rounded-full border border-[#123D46]/30 hover:border-[#123D46] text-[#123D46] text-xs font-jakarta font-semibold">
                    Bouton secondaire
                  </button>
                </div>

                {/* Pastilles / Tags */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                    PASTILLES / TAGS
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full bg-[#00A99D] text-white text-[11px] font-jakarta font-bold">
                      MÉDIA
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#199E9A] text-white text-[11px] font-jakarta font-bold">
                      BAROMÈTRE
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#4DBDB2] text-[#123D46] text-[11px] font-jakarta font-bold">
                      IQRH
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#5965E8] text-white text-[11px] font-jakarta font-bold">
                      IRIS
                    </span>
                    <span className="px-3.5 py-1 rounded-full bg-[#F4F1E8] text-[#123D46] text-[11px] font-jakarta font-bold border border-[#E2DCD0]">
                      PARTENAIRES
                    </span>
                  </div>
                </div>

                {/* Indicators & Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                  {/* Stepper numbers 1 2 3 4 */}
                  <div className="sm:col-span-5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-[#123D46]/60 tracking-wider block">
                      INDICATEURS D'ÉTAPES
                    </span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          onClick={() => setActiveStepTab(num)}
                          className={`w-8 h-8 rounded-full font-jakarta font-bold text-xs flex items-center justify-center transition-all ${
                            activeStepTab === num
                              ? 'bg-[#5965E8] text-white shadow-xs'
                              : 'bg-[#F4F1E8] text-[#123D46] border border-[#E3EBE6]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gauge 72% */}
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="22" stroke="#E3EBE6" strokeWidth="4" fill="transparent" />
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          stroke="#00A99D"
                          strokeWidth="4"
                          strokeDasharray={138}
                          strokeDashoffset={138 - (138 * 72) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                      <span className="absolute font-jakarta font-extrabold text-xs text-[#123D46]">72%</span>
                    </div>
                  </div>

                  {/* Metric counters */}
                  <div className="sm:col-span-4 flex items-center gap-4">
                    <div className="text-left">
                      <div className="font-jakarta font-extrabold text-base text-[#123D46]">1 234</div>
                      <span className="text-[9px] text-[#123D46]/70 leading-tight block">participants en 2024</span>
                    </div>
                    <div className="text-left">
                      <div className="font-jakarta font-extrabold text-base text-[#00A99D]">+18%</div>
                      <span className="text-[9px] text-[#123D46]/70 leading-tight block">évolution annuelle</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 11. PHOTOTHÈQUE / AMBIANCE VISUELLE */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    11. Photothèque / Ambiance Visuelle
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Direction Artistique</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Card 1: Collaboration */}
                  <div className="rounded-xl overflow-hidden border border-[#E3EBE6] bg-[#F8F9FA] flex flex-col justify-between p-3 min-h-[120px] relative">
                    <div className="w-8 h-8 rounded-full bg-[#00A99D]/15 flex items-center justify-center text-[#00A99D]">
                      <IconMoiNous size={18} />
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-jakarta font-bold text-[#123D46] block">
                        Authenticité
                      </span>
                      <span className="text-[10px] text-[#123D46]/60">
                        Échanges naturels, bienveillance
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Luminous Tunnel */}
                  <div className="rounded-xl overflow-hidden border border-[#199E9A]/40 bg-gradient-to-br from-[#123D46] to-[#00A99D] text-white flex flex-col justify-between p-3 min-h-[120px]">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[#FFC629]">
                      <PointLumineux size={24} />
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-jakarta font-bold text-white block">
                        Cheminement
                      </span>
                      <span className="text-[10px] text-[#E3EBE6]">
                        Tunnel de lumière, passage
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Serene Portrait */}
                  <div className="rounded-xl overflow-hidden border border-[#E3EBE6] bg-[#F4F1E8] flex flex-col justify-between p-3 min-h-[120px]">
                    <div className="w-8 h-8 rounded-full bg-[#5965E8]/15 flex items-center justify-center text-[#5965E8]">
                      <IconObservation size={18} />
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-jakarta font-bold text-[#123D46] block">
                        Sérénité
                      </span>
                      <span className="text-[10px] text-[#123D46]/60">
                        Regard confiant, apaisement
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Summit Horizon */}
                  <div className="rounded-xl overflow-hidden border border-[#E3EBE6] bg-gradient-to-tr from-[#123D46] via-[#FFC629]/20 to-[#F4F1E8] flex flex-col justify-between p-3 min-h-[120px]">
                    <div className="w-8 h-8 rounded-full bg-[#FFC629]/30 flex items-center justify-center text-[#123D46]">
                      <IconAction size={18} />
                    </div>
                    <div className="mt-4">
                      <span className="text-xs font-jakarta font-bold text-[#123D46] block">
                        Collectif
                      </span>
                      <span className="text-[10px] text-[#123D46]/70">
                        Horizon partagé au lever du jour
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 12. UTILISATION DU DÉGRADÉ & DE LA LUMIÈRE */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    12. Utilisation du Dégradé & de la Lumière
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Philosophie de Transition</span>
                </div>

                <p className="text-xs text-[#123D46]/80 leading-relaxed font-inter">
                  « Le dégradé LINK OFFICE symbolise le cheminement : du point de départ (conscience) vers la lumière (changement). »
                </p>

                <LuminousTunnelBanner />
              </div>

              {/* 13. APPLICATIONS */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    13. Applications
                  </h2>
                  <span className="text-[10px] text-[#00A99D] font-semibold">Web, Mobile & Édition</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={onOpenSaaS}
                    className="p-4 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all bg-[#F8F9FA] text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      💻
                    </div>
                    <h3 className="font-jakarta font-bold text-sm text-[#123D46] group-hover:text-[#00A99D]">
                      Plateforme SaaS Web
                    </h3>
                    <p className="text-[11px] text-[#123D46]/70 mt-1">
                      Portail analytique complet, observatoire et tableau de bord.
                    </p>
                    <span className="text-[10px] font-bold text-[#00A99D] mt-2 inline-flex items-center gap-1">
                      Ouvrir l'application →
                    </span>
                  </button>

                  <button
                    onClick={onOpenMobile}
                    className="p-4 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all bg-[#F8F9FA] text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      📱
                    </div>
                    <h3 className="font-jakarta font-bold text-sm text-[#123D46] group-hover:text-[#5965E8]">
                      App Mobile IQRH
                    </h3>
                    <p className="text-[11px] text-[#123D46]/70 mt-1">
                      Jauge 72/100, pulse quotidien et équilibre relationnel individuel.
                    </p>
                    <span className="text-[10px] font-bold text-[#5965E8] mt-2 inline-flex items-center gap-1">
                      Voir la vue smartphone →
                    </span>
                  </button>

                  <button
                    onClick={onOpenBarometre}
                    className="p-4 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all bg-[#F8F9FA] text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      📖
                    </div>
                    <h3 className="font-jakarta font-bold text-sm text-[#123D46] group-hover:text-[#00A99D]">
                      Baromètre 2024
                    </h3>
                    <p className="text-[11px] text-[#123D46]/70 mt-1">
                      Publication nationale, benchmark sectoriel et données macro.
                    </p>
                    <span className="text-[10px] font-bold text-[#00A99D] mt-2 inline-flex items-center gap-1">
                      Consulter l'étude →
                    </span>
                  </button>
                </div>
              </div>

              {/* 14. USAGES À NE PAS FAIRE */}
              <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]">
                    14. Usages à Ne Pas Faire
                  </h2>
                  <span className="text-[10px] text-rose-600 font-semibold">Règles d'Intégrité</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  {/* Interdiction 1 */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-between">
                    <div className="opacity-70 filter hue-rotate-90">
                      <Logo size="sm" variant="light" />
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-rose-700 block">Ne pas changer</span>
                      <span className="text-[9px] text-[#123D46]/70">les couleurs</span>
                    </div>
                  </div>

                  {/* Interdiction 2 */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-between">
                    <div className="opacity-70 transform scale-y-60 scale-x-125">
                      <Logo size="sm" variant="light" />
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-rose-700 block">Ne pas déformer</span>
                      <span className="text-[9px] text-[#123D46]/70">le logo</span>
                    </div>
                  </div>

                  {/* Interdiction 3 */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-between">
                    <div className="opacity-70">
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                        <circle cx="20" cy="20" r="10" fill="#FFC629" />
                        <circle cx="80" cy="80" r="10" fill="#FFC629" />
                        <line x1="20" y1="20" x2="80" y2="80" stroke="red" strokeWidth="4" />
                      </svg>
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-rose-700 block">Ne pas modifier</span>
                      <span className="text-[9px] text-[#123D46]/70">la constellation</span>
                    </div>
                  </div>

                  {/* Interdiction 4 */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-between">
                    <div className="opacity-80 drop-shadow-[0_10px_8px_rgba(255,0,0,0.5)]">
                      <Logo size="sm" variant="light" />
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-rose-700 block">Ne pas ajouter</span>
                      <span className="text-[9px] text-[#123D46]/70">d'effets</span>
                    </div>
                  </div>

                  {/* Interdiction 5 */}
                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex flex-col items-center justify-between col-span-2 sm:col-span-1">
                    <div className="font-jakarta font-black text-xl text-[#123D46] line-through decoration-rose-500">
                      LINK
                    </div>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-rose-700 block">Ne pas isoler</span>
                      <span className="text-[9px] text-[#123D46]/70">le mot seul</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

