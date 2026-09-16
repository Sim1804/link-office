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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <CheckCircle style={{ width: 64, height: 64, color: "#34d399", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 24, color: "var(--text-1)", marginBottom: 8 }}>
            Modules complétés !
          </h2>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Calcul de vos scores en cours…</p>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;
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
      <main style={{
        minHeight: "100vh", background: "var(--bg)",
        paddingTop: 88, paddingBottom: 32, paddingLeft: 24, paddingRight: 24,
        position: "relative", display: "flex", flexDirection: "column",
      }}>
        {/* Blob */}
        <div style={{
          position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(0,169,157,0.05) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{
          maxWidth: 680, margin: "0 auto", width: "100%",
          position: "relative", zIndex: 1,
          display: "flex", flexDirection: "column", flex: 1,
        }}>

          {/* ── Barre de progression ── */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>
                Module {currentModuleIndex + 1} / {modules.length}
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
                color: dimColor,
              }}>
                {currentModule.title}
              </span>
            </div>

            {/* Track */}
            <div style={{ height: 6, background: "var(--border-strong)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "var(--primary)",
                width: `${progress}%`,
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Module dots */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingLeft: 2, paddingRight: 2 }}>
              {modules.map((m, idx) => (
                <div key={m.id || idx} title={m.title} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: currentModuleIndex === idx ? dimColor : currentModuleIndex > idx ? `${dimColor}66` : "var(--border-strong)",
                  transition: "all 0.3s",
                  boxShadow: currentModuleIndex === idx ? `0 0 8px ${dimColor}` : "none",
                }} />
              ))}
            </div>
          </div>

          {/* ── Carte Question ── */}
          <div className="card" style={{
            padding: 32, flex: 1, display: "flex", flexDirection: "column",
          }}>
            {/* Sous-titre dimension */}
            <p style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              {currentModule.title} — {currentQuestionIndex + 1}/{currentModule.questions.length}
            </p>

            {/* Objectif du module */}
            {currentModule.objective && (
              <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.5 }}>
                <strong style={{ color: dimColor }}>Objectif : </strong>
                {currentModule.objective}
              </p>
            )}

            {/* Question */}
            <h2 style={{
              fontFamily: "var(--font-family-display)",
              fontWeight: 600, fontSize: 20, color: "var(--text-1)",
              lineHeight: 1.55, marginBottom: 28, flex: 1,
            }}>
              {question?.text}
            </h2>

            {/* Choix */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {CHOICES.map((choice) => {
                const selected = answers[question?.id] === choice.value;
                return (
                  <button
                    key={choice.value}
                    onClick={() => handleAnswer(choice.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 18px", borderRadius: 16, textAlign: "left",
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.18s",
                      background: selected ? "rgba(6,182,212,0.18)" : "var(--surface)",
                      border: selected ? "1.5px solid var(--cyan)" : "1.5px solid var(--border-strong)",
                      boxShadow: selected ? "0 0 16px rgba(6,182,212,0.2)" : "none",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: selected ? "2px solid #06b6d4" : "2px solid var(--border-strong)",
                      background: selected ? "#06b6d4" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {selected && <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: selected ? "var(--text-1)" : "var(--text-2)", flex: 1 }}>
                      {choice.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: selected ? "#22d3ee" : "var(--text-2)" }}>
                      {choice.value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePrev}
                disabled={isFirst}
              >
                <ChevronLeft style={{ width: 16, height: 16, marginRight: 8 }} />
                Précédent
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                disabled={!isAnswered || submitting}
                loading={submitting}
                style={{ flex: 1 }}
              >
                {isLast ? (
                  "Soumettre"
                ) : (
                  <>Suivant <ChevronRight style={{ width: 16, height: 16, marginLeft: 8 }} /></>
                )}
              </Button>
            </div>
          </div>

          {submitError && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 16px", borderRadius: 12, marginTop: 16,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: "#f87171", marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="2"/>
                <path d="M12 8v4m0 4h.01" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{submitError}</p>
                <button
                  onClick={() => submitAll(answers, false)}
                  style={{ color: "#06b6d4", fontSize: 12, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 6, fontFamily: "inherit", textDecoration: "underline" }}
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
