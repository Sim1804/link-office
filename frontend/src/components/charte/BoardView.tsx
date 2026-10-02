import React, { useState } from 'react';
import { Logo, ConstellationMark } from '../brand/Logo';
import { BRAND_COLORS, BRAND_VALUES } from '../../types/brand';
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

export const BoardView: React.FC<{
  onOpenSaaS: () => void;
  onOpenMobile: () => void;
  onOpenBarometre: () => void;
}> = ({ onOpenSaaS, onOpenMobile, onOpenBarometre }) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const copy = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  return (
    <div className="bg-[#FAF9F5] p-6 sm:p-10 rounded-3xl border border-[#E3EBE6] shadow-sm max-w-[1560px] mx-auto space-y-8 select-none">
      {/* 3-COLUMN MASTER BOARD LAYOUT MATCHING THE REFERENCE BOARD */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ===================== COLUMN 1 (Left: Width 3 cols) ===================== */}
        <div className="xl:col-span-3 space-y-6">
          {/* Brand Header */}
          <div className="space-y-2 pb-4 border-b border-[#E3EBE6]">
            <span className="text-[11px] font-jakarta font-bold text-[#00A99D] uppercase tracking-[0.2em] block">
              CHARTE GRAPHIQUE
            </span>
            <h1 className="font-jakarta font-black text-3xl sm:text-4xl text-[#123D46] tracking-tight leading-none">
              L<span className="text-[#00A99D]">i</span>NK OFFICE
            </h1>
            <div className="text-[10px] font-jakarta font-bold text-[#123D46]/70 uppercase tracking-[0.25em]">
              LABORATOIRE DU LIEN HUMAIN
            </div>
            <div className="pt-2 text-xs font-jakarta font-semibold text-[#00A99D]">
              Comprendre. Observer.<br />Mesurer. Agir.
            </div>
          </div>

          {/* 01. LOGO PRINCIPAL */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              01. LOGO PRINCIPAL
            </h2>
            <div className="p-4 bg-[#F8F9FA] rounded-xl flex items-center justify-center min-h-[130px]">
              <Logo size="lg" variant="light" />
            </div>
          </div>

          {/* 02. DÉCLINAISONS */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              02. DÉCLINAISONS
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-white border border-[#E3EBE6] rounded-xl flex items-center justify-center">
                <Logo size="sm" variant="light" />
              </div>
              <div className="p-3 bg-[#123D46] rounded-xl flex items-center justify-center">
                <Logo size="sm" variant="white" />
              </div>
              <div className="p-3 bg-[#123D46] rounded-xl flex flex-col items-center justify-center text-center">
                <ConstellationMark size={32} />
                <span className="text-[8px] font-jakarta font-bold text-white mt-1">LINK</span>
                <span className="text-[6px] tracking-widest text-[#4DBDB2]">OFFICE</span>
              </div>
              <div className="p-3 bg-[#F4F1E8] border border-[#E2DCD0] rounded-xl flex flex-col items-center justify-center text-center">
                <ConstellationMark size={32} />
                <span className="text-[8px] font-jakarta font-bold text-[#00A99D] mt-1">LINK</span>
                <span className="text-[6px] tracking-widest text-[#123D46]">OFFICE</span>
              </div>
            </div>
          </div>

          {/* 03. SIGNATURE */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              03. SIGNATURE
            </h2>
            <div className="font-jakarta font-semibold text-xs text-[#123D46] text-center">
              Laboratoire du lien humain
            </div>
            <TrajectoryGraphic />
          </div>

          {/* 04. VALEURS */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              04. VALEURS
            </h2>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <ValueBadge type="humain" size={48} />
                <span className="text-[9px] font-jakarta font-extrabold text-[#123D46] block mt-1.5 uppercase">HUMAIN</span>
                <span className="text-[8px] text-[#123D46]/70 leading-tight block">Le lien au cœur de tout</span>
              </div>
              <div>
                <ValueBadge type="clarte" size={48} />
                <span className="text-[9px] font-jakarta font-extrabold text-[#123D46] block mt-1.5 uppercase">CLARTÉ</span>
                <span className="text-[8px] text-[#123D46]/70 leading-tight block">Rendre visible ce qui compte</span>
              </div>
              <div>
                <ValueBadge type="fiabilite" size={48} />
                <span className="text-[9px] font-jakarta font-extrabold text-[#123D46] block mt-1.5 uppercase">FIABILITÉ</span>
                <span className="text-[8px] text-[#123D46]/70 leading-tight block">Mesurer avec rigueur</span>
              </div>
              <div>
                <ValueBadge type="action" size={48} />
                <span className="text-[9px] font-jakarta font-extrabold text-[#123D46] block mt-1.5 uppercase">ACTION</span>
                <span className="text-[8px] text-[#123D46]/70 leading-tight block">Transformer les relations</span>
              </div>
            </div>
          </div>

          {/* 05. TON DE COMMUNICATION */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              05. TON DE COMMUNICATION
            </h2>
            <div className="rounded-xl overflow-hidden relative p-4 text-white" style={{ background: 'linear-gradient(135deg, #123D46 0%, #00A99D 100%)' }}>
              <span className="text-[10px] font-jakarta font-bold text-[#FFC629] block">
                Bienveillant, inclusif et inspirant.
              </span>
              <p className="text-[10px] text-[#E3EBE6] mt-1 leading-snug">
                « Nous parlons à chacun avec simplicité et intégrité, sans jargon ni promesse magique. »
              </p>
            </div>
          </div>
        </div>

        {/* ===================== COLUMN 2 (Center: Width 4.5 cols) ===================== */}
        <div className="xl:col-span-4 space-y-6">
          {/* 06. PALETTE DE COULEURS */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
                06. PALETTE DE COULEURS
              </h2>
              {copiedHex && <span className="text-[9px] text-[#00A99D] font-bold">HEX copié !</span>}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {BRAND_COLORS.map(c => (
                <div
                  key={c.name}
                  onClick={() => copy(c.hex)}
                  className="cursor-pointer group text-center"
                >
                  <div
                    style={{ backgroundColor: c.hex }}
                    className="w-full h-11 rounded-lg shadow-2xs border border-black/5 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[9px] font-mono font-bold text-[#123D46] block mt-1">
                    {c.hex}
                  </span>
                  <span className="text-[9px] font-jakarta font-bold text-[#123D46] block leading-tight">
                    {c.name}
                  </span>
                  <span className="text-[7.5px] text-[#123D46]/60 block leading-tight">
                    {c.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 07. TYPOGRAPHIES */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              07. TYPOGRAPHIES
            </h2>
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
                <span className="text-[8px] font-bold uppercase text-[#123D46]/60 tracking-wider block">
                  TITRES / ACCROCHES
                </span>
                <span className="text-sm font-jakarta font-bold text-[#123D46] block mt-0.5">
                  Plus Jakarta Sans
                </span>
                <span className="text-[9px] text-[#00A99D] font-medium block">
                  Bold / SemiBold / Medium
                </span>
                <span className="text-2xl font-jakarta font-extrabold text-[#123D46] block my-1">
                  Aa
                </span>
                <span className="text-[8px] font-mono text-[#123D46]/60 break-all leading-tight block">
                  ABCDEFGHJKLKMOPQRSTUVWXYZ
                  <br />
                  abcdefghijklkmaqaptuvwwxyz 0123456789
                </span>
              </div>

              <div className="p-3 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
                <span className="text-[8px] font-bold uppercase text-[#123D46]/60 tracking-wider block">
                  TEXTES COURANTS
                </span>
                <span className="text-sm font-inter font-bold text-[#123D46] block mt-0.5">
                  Inter
                </span>
                <span className="text-[9px] text-[#199E9A] font-medium block">
                  Regular / Medium
                </span>
                <span className="text-2xl font-inter text-[#123D46] block my-1">
                  Aa
                </span>
                <span className="text-[8px] font-mono text-[#123D46]/60 break-all leading-tight block">
                  ABCDEFFGJHJLKKMOPQRSTUVWXYXZ
                  <br />
                  abcdefgijkljmaqaptuvwxyz 0123456789
                </span>
              </div>
            </div>
          </div>

          {/* 08. ÉLÉMENTS GRAPHIQUES */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              08. ÉLÉMENTS GRAPHIQUES
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">CONSTELLATION</span>
                <ConstellationGraphic interactive={false} />
              </div>
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">TRAJECTOIRE</span>
                <TrajectoryGraphic />
              </div>
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">POINT LUMINEUX</span>
                <div className="p-2 bg-white/70 rounded-xl border border-[#E3EBE6] flex items-center justify-center h-24">
                  <PointLumineux size={56} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">RÉSEAUX & MAILLAGE</span>
                <NetworkMesh />
              </div>
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">CERCLES & DONNÉES</span>
                <DataCircles score={72} />
              </div>
              <div>
                <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">MOTIFS</span>
                <DotPatternGrid />
              </div>
            </div>
          </div>

          {/* 09. ICONOGRAPHIE */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              09. ICONOGRAPHIE
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center">
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconMoiNous size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">MOI/NOUS</span>
                <span className="text-[6px] text-[#123D46]/60 block">Le lien</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconObservation size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">OBSERV.</span>
                <span className="text-[6px] text-[#123D46]/60 block">Regarder</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconMesure size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">MESURE</span>
                <span className="text-[6px] text-[#123D46]/60 block">Comprendre</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconAction size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">ACTION</span>
                <span className="text-[6px] text-[#123D46]/60 block">Agir</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconBienveillance size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">BIENVEIL.</span>
                <span className="text-[6px] text-[#123D46]/60 block">Respect</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconOuverture size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">OUVERT.</span>
                <span className="text-[6px] text-[#123D46]/60 block">Communauté</span>
              </div>
              <div className="p-1.5 bg-[#F8F9FA] rounded-lg border border-[#E3EBE6]">
                <IconSecurite size={20} color="#123D46" />
                <span className="text-[7px] font-bold text-[#123D46] block mt-1">SÉCURITÉ</span>
                <span className="text-[6px] text-[#123D46]/60 block">Confiance</span>
              </div>
            </div>
          </div>

          {/* 10. BOUTONS & COMPOSANTS UI */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              10. BOUTONS & COMPOSANTS UI
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-4 py-1.5 rounded-full bg-[#00A99D] text-white text-[11px] font-jakarta font-bold flex items-center gap-1.5">
                <span>Bouton principal</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button className="px-4 py-1.5 rounded-full border border-[#123D46]/30 text-[#123D46] text-[11px] font-jakarta font-semibold">
                Bouton secondaire
              </button>
            </div>

            <div className="pt-1">
              <span className="text-[8px] font-bold text-[#123D46]/60 uppercase block mb-1">PASTILLES / TAGS</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#00A99D] text-white text-[9px] font-bold">MÉDIA</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#199E9A] text-white text-[9px] font-bold">BAROMÈTRE</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4DBDB2] text-[#123D46] text-[9px] font-bold">IQRH</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5965E8] text-white text-[9px] font-bold">IRIS</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1E8] text-[#123D46] text-[9px] font-bold border border-[#E2DCD0]">PARTENAIRES</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 items-center pt-2">
              {/* Stepper */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${n === 3 ? 'bg-[#5965E8] text-white' : 'bg-[#F4F1E8] text-[#123D46] border border-[#E3EBE6]'}`}>
                    {n}
                  </div>
                ))}
              </div>
              {/* Gauge */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-3 border-[#00A99D] flex items-center justify-center text-[10px] font-black text-[#123D46]">
                  72%
                </div>
              </div>
              {/* Stats */}
              <div className="text-right">
                <div className="font-bold text-xs text-[#123D46]">1 234 <span className="text-[8px] font-normal text-[#123D46]/60">participants</span></div>
                <div className="font-bold text-xs text-[#00A99D]">+18% <span className="text-[8px] font-normal text-[#123D46]/60">annuel</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== COLUMN 3 (Right: Width 4.5 cols) ===================== */}
        <div className="xl:col-span-5 space-y-6">
          {/* 11. PHOTOTHÈQUE / AMBIANCE VISUELLE */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              11. PHOTOTHÈQUE / AMBIANCE VISUELLE
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-20 rounded-xl bg-gradient-to-tr from-[#123D46] to-[#00A99D] p-2 flex flex-col justify-end text-white">
                <span className="text-[8px] font-bold">Confiance mutuelle</span>
              </div>
              <div className="h-20 rounded-xl bg-gradient-to-tr from-[#00A99D] via-[#FFC629]/50 to-white p-2 flex flex-col justify-end text-[#123D46]">
                <span className="text-[8px] font-bold">Lumière d'éveil</span>
              </div>
              <div className="h-20 rounded-xl bg-gradient-to-tr from-[#5965E8] to-[#4DBDB2] p-2 flex flex-col justify-end text-white">
                <span className="text-[8px] font-bold">Sérénité d'équipe</span>
              </div>
            </div>
            {/* Color Strip as shown underneath Section 11 in reference */}
            <div className="flex h-3 rounded-full overflow-hidden">
              {BRAND_COLORS.map(c => (
                <div key={c.name} style={{ backgroundColor: c.hex }} className="flex-1" />
              ))}
            </div>
          </div>

          {/* 12. UTILISATION DU DÉGRADÉ & DE LA LUMIÈRE */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-2">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              12. UTILISATION DU DÉGRADÉ & DE LA LUMIÈRE
            </h2>
            <p className="text-[10px] text-[#123D46]/80 leading-tight">
              Le dégradé LINK OFFICE symbolise le cheminement : du point de départ (conscience) vers la lumière (changement).
            </p>
            <LuminousTunnelBanner showText={false} />
          </div>

          {/* 13. APPLICATIONS */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-[#123D46] uppercase tracking-wider">
              13. APPLICATIONS
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Laptop Screen */}
              <div
                onClick={onOpenSaaS}
                className="cursor-pointer group p-2.5 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] bg-[#F8F9FA] transition-all text-center flex flex-col justify-between"
              >
                <div className="h-16 bg-[#123D46] rounded-md text-white p-1.5 flex flex-col justify-between text-[7px]">
                  <div className="flex justify-between items-center text-[5px] text-[#4DBDB2]">
                    <span>LINK OFFICE</span>
                    <span>BAROMÈTRE</span>
                  </div>
                  <div className="font-bold leading-tight">
                    Et si le lien humain...
                  </div>
                  <div className="w-12 h-2 bg-[#00A99D] rounded-full mx-auto" />
                </div>
                <span className="text-[9px] font-jakarta font-bold text-[#123D46] mt-2 block group-hover:text-[#00A99D]">
                  Web SaaS
                </span>
              </div>

              {/* Smartphone */}
              <div
                onClick={onOpenMobile}
                className="cursor-pointer group p-2.5 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] bg-[#F8F9FA] transition-all text-center flex flex-col justify-between"
              >
                <div className="h-16 w-10 mx-auto bg-[#123D46] rounded-lg text-white p-1 flex flex-col justify-between items-center">
                  <div className="text-[4px] text-[#4DBDB2]">IQRH</div>
                  <div className="w-6 h-6 rounded-full border border-[#00A99D] flex items-center justify-center text-[7px] font-black">
                    72
                  </div>
                  <div className="w-4 h-0.5 bg-white/40 rounded-full" />
                </div>
                <span className="text-[9px] font-jakarta font-bold text-[#123D46] mt-2 block group-hover:text-[#00A99D]">
                  Mobile IQRH
                </span>
              </div>

              {/* Book */}
              <div
                onClick={onOpenBarometre}
                className="cursor-pointer group p-2.5 rounded-xl border border-[#E3EBE6] hover:border-[#00A99D] bg-[#F8F9FA] transition-all text-center flex flex-col justify-between"
              >
                <div className="h-16 w-11 mx-auto bg-gradient-to-b from-[#123D46] to-[#00A99D] rounded-r-md rounded-l-xs p-1 text-white flex flex-col justify-between text-left">
                  <span className="text-[4px] uppercase font-bold text-[#FFC629]">BAROMÈTRE</span>
                  <span className="text-[5px] font-bold leading-tight">DU LIEN HUMAIN 2024</span>
                  <span className="text-[4px] text-[#E3EBE6]">LINK OFFICE</span>
                </div>
                <span className="text-[9px] font-jakarta font-bold text-[#123D46] mt-2 block group-hover:text-[#00A99D]">
                  Baromètre Book
                </span>
              </div>
            </div>
          </div>

          {/* 14. USAGES À NE PAS FAIRE */}
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] space-y-3">
            <h2 className="text-[11px] font-jakarta font-bold text-rose-700 uppercase tracking-wider">
              14. USAGES À NE PAS FAIRE
            </h2>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              <div className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[7.5px] font-bold text-rose-700 block">Ne pas changer</span>
                <span className="text-[6.5px] text-[#123D46]/70 block">les couleurs</span>
              </div>
              <div className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[7.5px] font-bold text-rose-700 block">Ne pas déformer</span>
                <span className="text-[6.5px] text-[#123D46]/70 block">le logo</span>
              </div>
              <div className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[7.5px] font-bold text-rose-700 block">Ne pas modifier</span>
                <span className="text-[6.5px] text-[#123D46]/70 block">la constellation</span>
              </div>
              <div className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[7.5px] font-bold text-rose-700 block">Ne pas ajouter</span>
                <span className="text-[6.5px] text-[#123D46]/70 block">d'effets</span>
              </div>
              <div className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100">
                <span className="text-[7.5px] font-bold text-rose-700 block">Ne pas isoler</span>
                <span className="text-[6.5px] text-[#123D46]/70 block">le mot seul</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
