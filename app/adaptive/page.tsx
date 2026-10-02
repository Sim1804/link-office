/**
 * /adaptive/page.tsx — Modules adaptatifs (suite de l'IQRH)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { getAdaptiveQuestions, submitAdaptiveResponses, getUserStatus, AdaptiveModule } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const CHOICES = [
  { value: 1, label: "Pas du tout d'accord" },
  { value: 2, label: "Plutôt pas d'accord" },
  { value: 3, label: "Ni d'accord, ni pas d'accord" },
  { value: 4, label: "Plutôt d'accord" },
  { value: 5, label: "Tout à fait d'accord" },
];

export default function AdaptivePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitAll = useCallback(async (currentAdaptiveAnswers: Record<string, number> = answers, redirecting = false) => {
    if (!redirecting) setSubmitting(true);
    try {
      const consentStr = sessionStorage.getItem("iqrh_consent");
      const demogStr = sessionStorage.getItem("iqrh_demographic");
      const refStr = sessionStorage.getItem("iqrh_answers");

      if (!consentStr || !demogStr || !refStr) throw new Error("Données manquantes");

      const consent = JSON.parse(consentStr);
      const demographic = JSON.parse(demogStr);
      const refAnswers = JSON.parse(refStr);

      const formattedRef = Object.entries(refAnswers).map(([k, v]) => ({ questionId: k, value: v }));
      const formattedAdaptive = Object.entries(currentAdaptiveAnswers).map(([k, v]) => ({ questionId: k, value: v }));

      const startRes = await fetch("/api/questionnaire/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });
      const { id: assessmentId } = await startRes.json();

      const saveRes = await fetch("/api/questionnaire/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          ...consent,
          demographic,
          answers: formattedRef,
          adaptiveAnswers: formattedAdaptive,
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json();
        throw new Error("Erreur de sauvegarde: " + JSON.stringify(errorData));
      }

      const submitRes = await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

      if (!submitRes.ok) {
        const errorData = await submitRes.json();
        throw new Error("Erreur de soumission finale: " + JSON.stringify(errorData));
      }

      if (!redirecting) {
        setSubmitted(true);
        setTimeout(() => router.push("/dashboard"), 1000);
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error(err);
      if (!redirecting) {
        setSubmitting(false);
        setSubmitError("Une erreur est survenue lors de la sauvegarde finale. Veuillez réessayer.");
      }
    }
  }, [answers, session, router]);

  useEffect(() => {
    const demogStr = sessionStorage.getItem("iqrh_demographic");
    if (!demogStr) {
      router.replace("/profil");
      return;
    }
    const demog = JSON.parse(demogStr);

    fetch("/api/questions")
      .then((r) => r.json())
      .then(async (d) => {
        const selectedSituations = demog.selectedSituations || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchingModules = (d.modules || []).filter((m: any) =>
          selectedSituations.includes(m.triggerSituation)
        );

        if (matchingModules.length === 0) {
          await submitAll({}, true);
        } else {
          setModules(matchingModules);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router, submitAll]);

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-[#34d399] mx-auto mb-4" />
          <h2 className="font-jakarta font-bold text-2xl text-[#123D46] mb-2">
            Modules complétés !
          </h2>
          <p className="text-[#123D46]/70 text-sm">Calcul de vos scores en cours…</p>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return <div className="min-h-screen bg-[#FAF9F5]" />;
  }

  const currentModule = modules[currentModuleIndex];
  const question = currentModule.questions[currentQuestionIndex];
  
  // Progress computation across all modules
  const totalQuestions = modules.reduce((acc, m) => acc + m.questions.length, 0);
  const answeredQuestionsCount = Object.keys(answers).length;
  const progress = totalQuestions > 0 ? (answeredQuestionsCount / totalQuestions) * 100 : 0;

  const isAnswered = !!answers[question?.id];
  const isLastQuestionInModule = currentQuestionIndex === currentModule.questions.length - 1;
  const isLastModule = currentModuleIndex === modules.length - 1;
  const isLast = isLastQuestionInModule && isLastModule;
  const dimColor = "#06b6d4"; // Cyan as default color for adaptive

  const handleAnswer = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isLast) {
      submitAll(answers, false);
    } else if (isLastQuestionInModule) {
      setCurrentModuleIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
      setCurrentQuestionIndex(modules[currentModuleIndex - 1].questions.length - 1);
    }
  };

  const isFirst = currentModuleIndex === 0 && currentQuestionIndex === 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] pt-28 pb-12 px-6 relative flex flex-col">
        {/* Blob */}
        <div className="fixed -top-[15%] -right-[8%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,169,157,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="max-w-[680px] w-full mx-auto relative z-10 flex flex-col flex-1">

          {/* ── Barre de progression ── */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-mono text-[#123D46]/50">
                Module {currentModuleIndex + 1} / {modules.length}
              </span>
              <span className="text-xs font-jakarta font-semibold tracking-wider uppercase text-[#00A99D]">
                {currentModule.title}
              </span>
            </div>

            {/* Track */}
            <div className="h-1.5 bg-[#E3EBE6] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00A99D] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            {/* Module dots */}
            <div className="flex justify-between mt-2 px-0.5">
              {modules.map((m, idx) => (
                <div key={m.id || idx} title={m.title} className={`w-2 h-2 rounded-full transition-all duration-300 ${currentModuleIndex === idx ? 'bg-[#00A99D] shadow-[0_0_8px_rgba(0,169,157,0.6)] scale-125' : currentModuleIndex > idx ? 'bg-[#00A99D]/40' : 'bg-[#E3EBE6]'}`} />
              ))}
            </div>
          </div>

          {/* ── Carte Question ── */}
          <div className="bg-white rounded-3xl border border-[#E3EBE6] shadow-xs overflow-hidden p-6 sm:p-10 flex flex-col flex-1 animate-scale-in">
            {/* Sous-titre dimension */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-jakarta font-semibold text-[#00A99D] uppercase tracking-wider">
                {currentModule.title}
              </span>
              <span className="text-xs text-[#123D46]/50 font-mono">
                {currentQuestionIndex + 1}/{currentModule.questions.length}
              </span>
            </div>

            {/* Question */}
            <h4 className="font-jakarta font-extrabold text-xl sm:text-2xl text-[#123D46] leading-snug mb-5">
              {question?.text}
            </h4>

            {/* Objectif du module */}
            {currentModule.objective && (
              <div className="p-3.5 mb-6 rounded-xl bg-[#FAF9F5] border-l-[3px] border-[#00A99D] text-xs text-[#123D46]/80 italic">
                « {currentModule.objective} »
              </div>
            )}

            {/* Choix */}
            <div className="space-y-3 mb-8 flex-1">
              {CHOICES.map((choice) => {
                const selected = answers[question?.id] === choice.value;
                return (
                  <button
                    key={choice.value}
                    onClick={() => handleAnswer(choice.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                      selected
                        ? 'bg-[#00A99D]/8 border-[#00A99D] text-[#123D46] shadow-2xs'
                        : 'bg-white border-[#E3EBE6] text-[#123D46]/85 hover:bg-[#FAF9F5] hover:border-[#00A99D]/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          selected ? 'border-[#00A99D] bg-[#00A99D]' : 'border-[#123D46]/30 group-hover:border-[#00A99D]'
                        }`}
                      >
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-sm font-inter font-medium">{choice.label}</span>
                    </div>
                    <span className="text-xs text-[#123D46]/50 font-mono ml-2 shrink-0">
                      {choice.value} pts
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-[#E3EBE6] gap-3">
              <Button
                variant="ghost"
                size="md"
                onClick={handlePrev}
                disabled={isFirst}
                className="flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleNext}
                disabled={!isAnswered || submitting}
                loading={submitting}
                className="flex items-center gap-2"
              >
                {isLast ? (
                  "Soumettre"
                ) : (
                  <>Suivant <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>

          {submitError && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl mt-4 bg-red-50 border border-red-200">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-red-400 mt-0.5">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="text-red-400 text-[13px] m-0">{submitError}</p>
                <button
                  onClick={() => submitAll(answers, false)}
                  className="text-[#00A99D] text-[12px] bg-transparent border-none cursor-pointer p-0 mt-1.5 font-inherit underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
