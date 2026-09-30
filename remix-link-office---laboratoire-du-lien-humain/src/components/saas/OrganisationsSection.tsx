import React from 'react';
import { IconMoiNous, IconObservation, IconAction, IconBienveillance, IconSecurite } from '../brand/Icons';

export const OrganisationsSection: React.FC<{ onContact: () => void }> = ({ onContact }) => {
  return (
    <div className="space-y-12">
      {/* Hero for organisations */}
      <div className="bg-[#123D46] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-[#00A99D]/20">
        <div className="absolute right-0 top-0 w-80 h-80 bg-radial from-[#00A99D]/30 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs uppercase font-bold text-[#FFC629] tracking-wider block">
            B2B · DRH · Dirigeants · Managers
          </span>
          <h2 className="font-jakarta font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Faites du lien humain le premier atout de votre organisation
          </h2>
          <p className="text-sm sm:text-base text-[#E3EBE6] font-inter leading-relaxed">
            Absentéisme silencieux, désengagement, difficultés de recrutement : 80% des crises organisationnelles trouvent leur racine dans une altération du lien humain. LinkOffice vous donne les repères et outils pour agir avant la rupture.
          </p>
          <div className="pt-2">
            <button
              onClick={onContact}
              className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>Demander une démonstration d'équipe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
              <IconObservation size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
              Audit Relationnel Annuel
            </h3>
            <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
              Campagne de diagnostic anonyme et certifiée auprès de l'ensemble de vos collaborateurs. Restitution avec benchmark sectoriel et identification des zones de fragilité.
            </p>
          </div>
          <div className="pt-4 border-t border-[#E3EBE6] text-xs font-semibold text-[#00A99D]">
            Idéal pour le bilan social & QVCT
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
              <IconAction size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
              Coach IRIS pour Managers
            </h3>
            <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
              Plateforme continue outillant vos chefs d'équipe avec des protocoles d'alignement, des micro-rituels d'écoute et des alertes douces en cas de baisse d'énergie.
            </p>
          </div>
          <div className="pt-4 border-t border-[#E3EBE6] text-xs font-semibold text-[#5965E8]">
            Déploiement simple en 48h
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E3EBE6] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center">
              <IconBienveillance size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-lg text-[#123D46]">
              Ateliers & Conférences
            </h3>
            <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
              Interventions de nos experts sociologues et facilitateurs lors de vos séminaires de direction, conventions managériales ou journées de cohésion.
            </p>
          </div>
          <div className="pt-4 border-t border-[#E3EBE6] text-xs font-semibold text-[#B8870A]">
            Format présentiel ou hybride
          </div>
        </div>
      </div>
    </div>
  );
};
