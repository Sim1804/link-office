import React, { useState } from 'react';
import { IQRH_QUESTIONS } from '../../types/brand';
import { IconMoiNous, IconObservation, IconMesure, IconAction, IconBienveillance } from '../brand/Icons';
import { TrajectoryGraphic } from '../brand/GraphicElements';

export const IQRHAssessment: React.FC<{
  onComplete?: (score: number) => void;
  compact?: boolean;
}> = ({ onComplete, compact = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({
    0: 78,
    1: 80,
    2: 58,
    3: 76,
    4: 79
  });
  const [isCalculated, setIsCalculated] = useState(false);

  const calculateScore = () => {
    const values = Object.values(answers);
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  const score = calculateScore();

  const handleSelect = (qIndex: number, points: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: points }));
  };

  const handleNext = () => {
    if (currentStep < IQRH_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCalculated(true);
      if (onComplete) onComplete(score);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getScoreColor = (val: number) => {
    if (val >= 75) return '#00A99D';
    if (val >= 60) return '#FFC629';
    return '#5965E8';
  };

  const currentQ = IQRH_QUESTIONS[currentStep];

  return (
    <div className={`bg-white rounded-2xl border border-[#E3EBE6] shadow-sm overflow-hidden ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E3EBE6] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#E3EBE6] text-[#123D46] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              Diagnostic Scientifique
            </span>
            <span className="text-xs text-[#123D46]/60 font-medium">IQRH™ v2024</span>
          </div>
          <h3 className="font-jakarta font-bold text-xl sm:text-2xl text-[#123D46]">
            Indice de Qualité des Relations Humaines
          </h3>
          <p className="text-sm text-[#123D46]/70 mt-0.5 font-inter">
            Évaluez l’équilibre, la fluidité et le climat relationnel de votre collectif.
          </p>
        </div>

        {/* Live score pill / status */}
        <div className="flex items-center gap-3 bg-[#F4F1E8] px-4 py-2.5 rounded-xl border border-[#E3EBE6] shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle cx="24" cy="24" r="19" stroke="#E3EBE6" strokeWidth="3" fill="transparent" />
              <circle
                cx="24"
                cy="24"
                r="19"
                stroke={getScoreColor(score)}
                strokeWidth="3.5"
                strokeDasharray={119}
                strokeDashoffset={119 - (119 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <span className="absolute font-jakarta font-extrabold text-sm text-[#123D46]">
              {score}
            </span>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#123D46]/60 font-semibold block">
              Score Actuel
            </span>
            <span className="font-jakarta font-bold text-sm text-[#00A99D]">
              {score >= 70 ? 'Équilibre Sain' : score >= 50 ? 'Zone de Vigilance' : 'Tension Relationnelle'}
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Progress (1 to 5) */}
      <div className="py-6 border-b border-[#E3EBE6]">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {IQRH_QUESTIONS.map((q, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <React.Fragment key={q.id}>
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-jakarta font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#00A99D] text-white shadow-md ring-4 ring-[#00A99D]/20 scale-105'
                      : isCompleted
                      ? 'bg-[#123D46] text-white'
                      : 'bg-[#F4F1E8] text-[#123D46]/60 border border-[#E3EBE6] hover:bg-[#E3EBE6]'
                  }`}
                >
                  {idx + 1}
                </button>
                {idx < IQRH_QUESTIONS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      idx < currentStep ? 'bg-[#00A99D]' : 'bg-[#E3EBE6]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Question Body or Final Report */}
      {!isCalculated ? (
        <div className="py-6">
          <div className="flex items-center gap-2 mb-2 text-[#00A99D] text-xs font-semibold uppercase tracking-wider">
            <span>Pillier {currentStep + 1} / 5</span>
            <span>·</span>
            <span>{currentQ.pillar}</span>
          </div>

          <h4 className="font-jakarta font-bold text-lg sm:text-xl text-[#123D46] leading-snug mb-2">
            {currentQ.question}
          </h4>
          <p className="text-xs text-[#123D46]/70 mb-6 bg-[#F8F9FA] p-3 rounded-lg border-l-4 border-[#00A99D] italic">
            « {currentQ.explanation} »
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = answers[currentStep] === option.points;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(currentStep, option.points)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#00A99D]/8 border-[#00A99D] text-[#123D46] font-medium shadow-2xs'
                      : 'bg-[#FDFDFD] border-[#E3EBE6] text-[#123D46]/80 hover:bg-[#F4F1E8]/60 hover:border-[#4DBDB2]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#00A99D] bg-[#00A99D]' : 'border-[#123D46]/30'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                  <span className="text-xs text-[#123D46]/40 font-mono ml-2 shrink-0">
                    {option.points} pts
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#E3EBE6]">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed border-[#E3EBE6] text-[#123D46]/40'
                  : 'border-[#123D46]/30 text-[#123D46] hover:bg-[#F4F1E8]'
              }`}
            >
              Question précédente
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>{currentStep === IQRH_QUESTIONS.length - 1 ? 'Voir mon bilan complet' : 'Question suivante'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="py-6 space-y-6">
          <div className="p-6 bg-gradient-to-br from-[#123D46] to-[#00A99D] text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <span className="text-xs uppercase font-semibold text-[#FFC629] tracking-wider block mb-1">
                Résultat Officiel LINK OFFICE
              </span>
              <h4 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white">
                Votre Indice IQRH : {score} / 100
              </h4>
              <p className="text-sm text-[#E3EBE6] mt-1 max-w-lg">
                Votre collectif démontre une assise solide en confiance et clarté. L’axe prioritaire de progrès réside dans l’alignement des coopérations transverses.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center border border-white/20 shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-[#FFC629] font-medium block">
                Benchmark National
              </span>
              <div className="font-jakarta font-bold text-2xl text-white mt-1">
                +8 pts <span className="text-xs text-emerald-300 font-normal">vs France 2024</span>
              </div>
              <span className="text-[10px] text-white/70 block mt-0.5">Moyenne nationale : 64/100</span>
            </div>
          </div>

          {/* Pillars Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
              <div className="flex items-center gap-2 mb-2 text-[#00A99D]">
                <IconMoiNous size={20} />
                <span className="font-jakarta font-bold text-xs uppercase">Humain</span>
              </div>
              <div className="font-jakarta font-bold text-xl text-[#123D46]">{answers[0]}%</div>
              <p className="text-xs text-[#123D46]/70 mt-1">Sécurité psychologique et authenticité des liens.</p>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
              <div className="flex items-center gap-2 mb-2 text-[#199E9A]">
                <IconObservation size={20} />
                <span className="font-jakarta font-bold text-xs uppercase">Clarté</span>
              </div>
              <div className="font-jakarta font-bold text-xl text-[#123D46]">{answers[1]}%</div>
              <p className="text-xs text-[#123D46]/70 mt-1">Fluidité des échanges et transparence de l'info.</p>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
              <div className="flex items-center gap-2 mb-2 text-[#FFC629]">
                <IconMesure size={20} color="#FFC629" />
                <span className="font-jakarta font-bold text-xs uppercase text-[#123D46]">Fiabilité</span>
              </div>
              <div className="font-jakarta font-bold text-xl text-[#123D46]">{answers[2]}%</div>
              <p className="text-xs text-[#123D46]/70 mt-1">Soutien mutuel et rigueur méthodologique.</p>
            </div>

            <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
              <div className="flex items-center gap-2 mb-2 text-[#5965E8]">
                <IconAction size={20} color="#5965E8" />
                <span className="font-jakarta font-bold text-xs uppercase">Action</span>
              </div>
              <div className="font-jakarta font-bold text-xl text-[#123D46]">{answers[4]}%</div>
              <p className="text-xs text-[#123D46]/70 mt-1">Capacité réelle à transformer les relations.</p>
            </div>
          </div>

          {/* Trajectory */}
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#123D46]/70 block mb-2">
              Votre trajectoire de transformation recommandée
            </span>
            <TrajectoryGraphic withLabels={true} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E3EBE6]">
            <button
              onClick={() => setIsCalculated(false)}
              className="text-xs text-[#123D46]/70 hover:text-[#00A99D] underline font-medium"
            >
              Modifier mes réponses au diagnostic
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#123D46]/30 text-[#123D46] text-xs font-medium hover:bg-[#F4F1E8]"
              >
                Exporter la synthèse PDF
              </button>
              <button
                onClick={() => alert("Un atelier d'alignement avec un expert LINK OFFICE a été planifié.")}
                className="px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-semibold shadow-xs flex items-center gap-2"
              >
                <span>Activer l'atelier d'équipe</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
