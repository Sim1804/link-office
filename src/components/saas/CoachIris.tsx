import React, { useState } from 'react';
import { IconMoiNous, IconObservation, IconAction, IconBienveillance, IconSecurite } from '../brand/Icons';
import { PointLumineux } from '../brand/GraphicElements';
import { IrisMark } from '../brand/IrisLogo';

export const CoachIRIS: React.FC<{ onStartTest: () => void }> = ({ onStartTest }) => {
  const [selectedScenario, setSelectedScenario] = useState<number>(0);

  const scenarios = [
    {
      title: 'Tensions en réunion d’équipe',
      challenge: 'Certains membres monopolisent la parole tandis que d’autres se taisent par crainte du jugement.',
      diagnosis: 'Déficit de sécurité psychologique et asymétrie d’écoute.',
      action: 'Rituel du "Tour de table inversé" : 90 secondes de parole garantie sans interruption, débutant par les plus discrets.',
      impact: '+35% de contributions équilibrées'
    },
    {
      title: 'Silos entre départements',
      challenge: 'Frictions récurrentes entre les équipes produit, techniques et commerciales sur les priorités.',
      diagnosis: 'Manque de clarté partagée sur les contraintes mutuelles.',
      action: 'Session d’alignement "Vis mon quotidien" : échange croisé d’une demi-journée pour désamorcer les représentations erronées.',
      impact: '-40% de retards inter-services'
    },
    {
      title: 'Télétravail et isolement relationnel',
      challenge: 'Les liens informels s’effilochent, la communication devient exclusivement transactionnelle.',
      diagnosis: 'Érosion de l’attachement au collectif et sentiment de solitude.',
      action: 'Micro-rituel "La météo du lien" : 5 minutes au début de chaque point hebdomadaire dédiées à l’énergie humaine.',
      impact: '+28% de sentiment d’appartenance'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#123D46] via-[#3540A8] to-[#5965E8] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FFC629]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/20">
            <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
              <IrisMark size="sm" />
            </div>
            <span className="text-xs font-jakarta font-bold uppercase tracking-wider text-white">
              Coach IRIS · Intelligence Relationnelle
            </span>
          </div>

          <h2 className="font-jakarta font-extrabold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Accompagnez vos équipes vers un équilibre relationnel durable
          </h2>

          <p className="text-sm sm:text-base text-[#E3EBE6] font-inter leading-relaxed">
            IRIS n’est pas un simple outil d’analyse : c’est un guide méthodologique qui traduit les mesures de votre IQRH en micro-actions concrètes, adaptées à la culture et aux dynamiques réelles de votre organisation.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStartTest}
              className="px-6 py-3 rounded-full bg-[#FFC629] hover:bg-[#ffcf4d] text-[#123D46] font-jakarta font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Calculer la météo de mon équipe</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <span className="text-xs text-white/80">Diagnostic confidentiel et instantané</span>
          </div>
        </div>
      </div>

      {/* Interactive Scenario Explorer */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3EBE6] shadow-xs space-y-6">
        <div>
          <span className="text-xs uppercase font-bold text-[#5965E8] tracking-wider block mb-1">
            Situations Concrètes Traitées
          </span>
          <h3 className="font-jakarta font-extrabold text-2xl text-[#123D46]">
            Comment le Coach IRIS intervient sur le terrain
          </h3>
        </div>

        {/* Scenario buttons */}
        <div className="flex flex-wrap gap-2 border-b border-[#E3EBE6] pb-4">
          {scenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedScenario(idx)}
              className={`px-4 py-2 rounded-full text-xs font-jakarta font-bold transition-all ${
                selectedScenario === idx
                  ? 'bg-[#5965E8] text-white shadow-xs'
                  : 'bg-[#F8F9FA] text-[#123D46]/70 hover:bg-[#F4F1E8]'
              }`}
            >
              {sc.title}
            </button>
          ))}
        </div>

        {/* Selected Scenario Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] space-y-2">
            <span className="text-[11px] uppercase font-bold text-rose-600 tracking-wider block">
              1. Le Symptôme Observé
            </span>
            <p className="text-sm text-[#123D46] leading-relaxed">
              {scenarios[selectedScenario].challenge}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] space-y-2">
            <span className="text-[11px] uppercase font-bold text-[#5965E8] tracking-wider block">
              2. Le Diagnostic Scientifique
            </span>
            <p className="text-sm text-[#123D46] leading-relaxed">
              {scenarios[selectedScenario].diagnosis}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#5965E8]/10 border border-[#5965E8]/40 space-y-2">
            <span className="text-[11px] uppercase font-bold text-[#5965E8] tracking-wider block">
              3. L'Action Préconisée par IRIS
            </span>
            <p className="text-sm font-medium text-[#123D46] leading-relaxed">
              {scenarios[selectedScenario].action}
            </p>
            <div className="pt-2">
              <span className="inline-block px-2.5 py-1 bg-white rounded-md text-xs font-jakarta font-bold text-[#5965E8] shadow-2xs">
                {scenarios[selectedScenario].impact}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
