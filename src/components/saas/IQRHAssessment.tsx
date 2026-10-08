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
    1: 82,
    2: 60,
    3: 74,
    4: 76
  });
  const [isCalculated, setIsCalculated] = useState(false);
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

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
      if (onComplete && !hasNotifiedCompletion) {
        onComplete(score);
        setHasNotifiedCompletion(true);
      }
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
    <div className={`bg-white rounded-3xl border border-[#E3EBE6] shadow-xs overflow-hidden ${compact ? 'p-5' : 'p-6 sm:p-10'}`}>
      {/* 1. Header & Live Score Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E3EBE6] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-jakarta font-semibold tracking-wider text-[#00A99D] uppercase mb-1">
            <span>Diagnostic Individuel & Collectif</span>
            <span>·</span>
            <span>Échelle IQRH 2024</span>
          </div>
          <h3 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
            Indice de Qualité des Relations Humaines
          </h3>
          <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1 font-inter">
            5 questions fondamentales pour mesurer la sécurité psychologique, la clarté et l'entraide dans votre équipe.
          </p>
        </div>

        {/* Live score meter */}
        <div className="flex items-center gap-3.5 bg-[#FAF9F5] px-4 py-2.5 rounded-2xl border border-[#E3EBE6] shrink-0 self-start sm:self-auto">
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
            <span className="absolute font-jakarta font-extrabold text-sm text-[#123D46] font-mono tabular-nums">
              {score}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#123D46]/50 font-bold block">
              Indice en temps réel
            </span>
            <span className="font-jakarta font-bold text-xs text-[#00A99D]">
              {score >= 75 ? 'Climat Solide & Constructif' : score >= 60 ? 'Climat Équilibré (Vigilance)' : 'Tension & Fragilité'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Clean Question Stepper */}
      <div className="py-5 border-b border-[#E3EBE6]">
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
                      ? 'bg-[#00A99D] text-white shadow-xs ring-4 ring-[#00A99D]/20 scale-105'
                      : isCompleted
                      ? 'bg-[#123D46] text-white'
                      : 'bg-[#F4F1E8] text-[#123D46]/60 border border-[#E3EBE6] hover:bg-[#E3EBE6]'
                  }`}
                  aria-label={`Étape ${idx + 1}`}
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

      {/* 3. Question Form or Full Synthesis */}
      {!isCalculated ? (
        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-jakarta font-semibold text-[#00A99D] uppercase tracking-wider">
              Pilier {currentStep + 1} sur 5 · {currentQ.pillar}
            </span>
            <span className="text-xs text-[#123D46]/50 font-mono">
              Question {currentStep + 1}/5
            </span>
          </div>

          <h4 className="font-jakarta font-extrabold text-xl sm:text-2xl text-[#123D46] leading-snug">
            {currentQ.question}
          </h4>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border-l-3 border-[#00A99D] text-xs text-[#123D46]/80 italic">
            « {currentQ.explanation} »
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = answers[currentStep] === option.points;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(currentStep, option.points)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-[#00A99D]/8 border-[#00A99D] text-[#123D46] shadow-2xs'
                      : 'bg-white border-[#E3EBE6] text-[#123D46]/85 hover:bg-[#FAF9F5] hover:border-[#00A99D]/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-[#00A99D] bg-[#00A99D]' : 'border-[#123D46]/30 group-hover:border-[#00A99D]'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-inter">{option.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-[#E3EBE6]">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 text-xs font-jakarta font-semibold rounded-full border transition-all ${
                currentStep === 0
                  ? 'opacity-30 cursor-not-allowed border-[#E3EBE6] text-[#123D46]/40'
                  : 'border-[#123D46]/30 text-[#123D46] hover:bg-[#FAF9F5]'
              }`}
            >
              ← Question précédente
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all shadow-xs flex items-center gap-2"
            >
              <span>{currentStep === IQRH_QUESTIONS.length - 1 ? 'Calculer mon bilan IQRH' : 'Question suivante'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* Full Clean Synthesis */
        <div className="py-6 space-y-8">
          {/* Live notification badge connecting IQRH to Baromètre */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>
                <strong>Test comptabilisé en direct :</strong> Votre score de <strong>{score}/100</strong> a été intégré au Baromètre national (nombre de répondants et moyenne actualisés).
              </span>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('barometre');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="underline font-bold hover:text-emerald-900 shrink-0 ml-3"
            >
              Voir le baromètre →
            </button>
          </div>

          <div className="p-7 bg-[#123D46] text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-[#00A99D]/30">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#FFC629] tracking-wider block">
                Résultat Certifié Link Office
              </span>
              <h4 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-white">
                Votre Indice Global IQRH : <span className="text-[#00A99D]">{score}</span> / 100
              </h4>
              <p className="text-xs sm:text-sm text-[#E3EBE6] max-w-xl font-inter leading-relaxed">
                Votre collectif bénéficie d'une base saine en sécurité psychologique et en écoute. Le levier prioritaire d’amélioration réside dans la fluidité de la coopération transverse.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center border border-white/20 shrink-0 min-w-[160px]">
              <span className="text-[10px] uppercase tracking-wider text-[#FFC629] font-bold block">
                vs Moyenne Nationale
              </span>
              <div className="font-jakarta font-extrabold text-2xl text-white mt-1">
                {score >= 68 ? `+${(score - 68).toFixed(0)} pts` : `${(score - 68).toFixed(0)} pts`}
              </div>
              <span className="text-[10px] text-[#E3EBE6]/70 block mt-0.5">
                Moyenne France : 68.4/100
              </span>
            </div>
          </div>

          {/* 4 Pillars Breakdown */}
          <div className="space-y-3">
            <h5 className="font-jakarta font-bold text-base text-[#123D46]">
              Détail des 4 Piliers Fondamentaux
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jakarta font-bold text-xs uppercase text-[#00A99D]">Humain</span>
                  <span className="font-mono font-bold text-base text-[#123D46]">{answers[0]}%</span>
                </div>
                <div className="w-full bg-[#E3EBE6] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#00A99D] h-full rounded-full" style={{ width: `${answers[0]}%` }} />
                </div>
                <p className="text-[11px] text-[#123D46]/70">Sécurité psychologique et authenticité des échanges.</p>
              </div>

              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jakarta font-bold text-xs uppercase text-[#199E9A]">Clarté</span>
                  <span className="font-mono font-bold text-base text-[#123D46]">{answers[1]}%</span>
                </div>
                <div className="w-full bg-[#E3EBE6] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#199E9A] h-full rounded-full" style={{ width: `${answers[1]}%` }} />
                </div>
                <p className="text-[11px] text-[#123D46]/70">Transparence des priorités et dialogue sans non-dits.</p>
              </div>

              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jakarta font-bold text-xs uppercase text-[#B8870A]">Fiabilité</span>
                  <span className="font-mono font-bold text-base text-[#123D46]">{answers[2]}%</span>
                </div>
                <div className="w-full bg-[#E3EBE6] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#FFC629] h-full rounded-full" style={{ width: `${answers[2]}%` }} />
                </div>
                <p className="text-[11px] text-[#123D46]/70">Solidarité face aux tensions et entraide collective.</p>
              </div>

              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-jakarta font-bold text-xs uppercase text-[#5965E8]">Action</span>
                  <span className="font-mono font-bold text-base text-[#123D46]">{answers[4]}%</span>
                </div>
                <div className="w-full bg-[#E3EBE6] h-1.5 rounded-full overflow-hidden mb-2">
                  <div className="bg-[#5965E8] h-full rounded-full" style={{ width: `${answers[4]}%` }} />
                </div>
                <p className="text-[11px] text-[#123D46]/70">Capacité réelle à corriger les dysfonctionnements.</p>
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="p-5 rounded-2xl bg-[#00A99D]/5 border border-[#00A99D]/20 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00A99D]">
              Préconisation Prioritaire du Laboratoire
            </span>
            <p className="text-xs sm:text-sm text-[#123D46] font-inter leading-relaxed">
              Mettre en place le rituel hebdomadaire « Vis mon quotidien » : 10 minutes d'échange croisé entre services pour désamorcer les représentations erronées et fluidifier les processus de décision partagée.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E3EBE6]">
            <button
              onClick={() => {
                setIsCalculated(false);
                setHasNotifiedCompletion(false);
              }}
              className="text-xs text-[#123D46]/70 hover:text-[#00A99D] underline font-medium"
            >
              Modifier mes réponses au diagnostic
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-[#123D46]/20 text-[#123D46] text-xs font-jakarta font-semibold hover:bg-[#FAF9F5]"
              >
                Exporter la synthèse
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('iris');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold shadow-xs flex items-center gap-2"
              >
                <span>Activer les conseils Coach IRIS</span>
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
