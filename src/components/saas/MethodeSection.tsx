import React from 'react';
import { ValueBadge } from '../brand/Icons';
import { TrajectoryGraphic, DataCircles } from '../brand/GraphicElements';

export const MethodeSection: React.FC<{ onStartTest: () => void }> = ({ onStartTest }) => {
  const steps = [
    {
      num: '01',
      title: 'Comprendre',
      desc: 'Explorer la nature singulière des liens dans chaque collectif sans préjugé.',
      detail: 'Sensibilisation des équipes et cartographie des interactions réelles.'
    },
    {
      num: '02',
      title: 'Observer',
      desc: 'Identifier les signaux faibles, les non-dits et les zones d’énergie partagée.',
      detail: 'Enquêtes courtes, rituels d’écoute active et observations de terrain.'
    },
    {
      num: '03',
      title: 'Mesurer',
      desc: 'Attribuer un indice fiable (IQRH) certifié par les sciences comportementales.',
      detail: 'Score consolidé sur 100 points, benchmarks sectoriels et indicateurs de sécurité.'
    },
    {
      num: '04',
      title: 'Agir',
      desc: 'Déployer des micro-actions immédiates pour réaligner et fluidifier le travail.',
      detail: 'Rituels hebdomadaires, accompagnement par le Coach IRIS et suivi continu.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
          Fondement Scientifique
        </span>
        <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
          La Méthode Link Office
        </h2>
        <p className="text-sm sm:text-base text-[#123D46]/70 font-inter">
          Une démarche en 4 temps issue de la recherche sociologique pour transformer le climat relationnel en levier de performance et de santé durable.
        </p>
      </div>

      {/* Trajectory visualization */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E3EBE6] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-[#123D46]/60 tracking-wider">
            Trajectoire continue d'évolution
          </span>
          <span className="text-xs font-semibold text-[#00A99D]">
            De la conscience vers la transformation
          </span>
        </div>
        <TrajectoryGraphic withLabels={true} />
      </div>

      {/* 4 Steps Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map(step => (
          <div
            key={step.num}
            className="bg-white p-6 rounded-2xl border border-[#E3EBE6] hover:border-[#00A99D] transition-all shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="font-jakarta font-black text-3xl text-[#00A99D]/30 block">
                {step.num}
              </span>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                {step.title}
              </h3>
              <p className="text-xs text-[#123D46]/80 mt-2 font-inter leading-relaxed">
                {step.desc}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E3EBE6] text-[11px] text-[#00A99D] font-medium">
              {step.detail}
            </div>
          </div>
        ))}
      </div>

      {/* The 4 Core Values in action */}
      <div className="bg-[#F8F9FA] rounded-3xl p-8 border border-[#E3EBE6] space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="font-jakarta font-extrabold text-2xl text-[#123D46]">
            Les 4 Piliers Évalués dans l'IQRH
          </h3>
          <p className="text-xs text-[#123D46]/70 mt-1">
            Chaque score d’organisation est décomposé selon ces 4 axes complémentaires.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] flex flex-col items-center text-center">
            <ValueBadge type="humain" size={60} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">HUMAIN</h4>
            <span className="text-xs text-[#00A99D] font-medium">Sécurité psychologique</span>
            <p className="text-[11px] text-[#123D46]/70 mt-1">Capacité à s'exprimer librement sans crainte.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] flex flex-col items-center text-center">
            <ValueBadge type="clarte" size={60} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">CLARTÉ</h4>
            <span className="text-xs text-[#199E9A] font-medium">Fluidité de l'information</span>
            <p className="text-[11px] text-[#123D46]/70 mt-1">Absence de non-dits et transparence des feedbacks.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] flex flex-col items-center text-center">
            <ValueBadge type="fiabilite" size={60} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">FIABILITÉ</h4>
            <span className="text-xs text-[#B8870A] font-medium">Richesse de l'entraide</span>
            <p className="text-[11px] text-[#123D46]/70 mt-1">Soutien inconditionnel face à l'imprévu.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E3EBE6] flex flex-col items-center text-center">
            <ValueBadge type="action" size={60} />
            <h4 className="font-jakarta font-bold text-sm text-[#123D46] mt-3">ACTION</h4>
            <span className="text-xs text-[#5965E8] font-medium">Capacité d'ajustement</span>
            <p className="text-[11px] text-[#123D46]/70 mt-1">Pouvoir réel d'agir sur les dysfonctionnements.</p>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={onStartTest}
            className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md transition-all inline-flex items-center gap-2"
          >
            <span>Passer l'évaluation de ma structure</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
