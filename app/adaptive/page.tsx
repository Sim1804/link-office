/**
 * /adaptive/page.tsx — Modules adaptatifs (suite de l'IQRH)
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { getAdaptiveQuestions, submitAdaptiveResponses, getUserStatus, AdaptiveModule } from "@/lib/api";

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
        const matchingModules = (d.modules || []).filter((m: any) =>
          selectedSituations.includes(m.triggerSituation)
        );

        if (matchingModules.length === 0) {
          // Aucun module adaptatif requis, on soumet tout de suite
          await submitAll({}, true);
        } else {
          setModules(matchingModules);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [router]);

  const submitAll = async (currentAdaptiveAnswers: Record<string, number> = answers, redirecting = false) => {
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
        body: JSON.stringify({ userId: session?.user?.id || "demo-user" }),
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

      await fetch("/api/questionnaire/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });

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
        alert("Une erreur est survenue lors de la sauvegarde finale.");
      }
    }
  };

  if (loading) {
    return <div style={{ minHeight: "100vh", background: "#0b0f19" }} />;
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <CheckCircle style={{ width: 64, height: 64, color: "#34d399", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc", marginBottom: 8 }}>
            Modules complétés !
          </h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>Calcul de vos scores en cours…</p>
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return <div style={{ minHeight: "100vh", background: "#0b0f19" }} />;
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
        minHeight: "100vh", background: "#0b0f19",
        paddingTop: 88, paddingBottom: 32, paddingLeft: 24, paddingRight: 24,
        position: "relative", display: "flex", flexDirection: "column",
      }}>
        {/* Blob */}
        <div style={{
          position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
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
              <span style={{ fontSize: 13, color: "#64748b" }}>
                Module {currentModuleIndex + 1} / {modules.length}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                color: dimColor, background: `${dimColor}22`,
                border: `1px solid ${dimColor}44`,
                padding: "3px 10px", borderRadius: 999,
              }}>
                {currentModule.title}
              </span>
            </div>

            {/* Track */}
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "linear-gradient(90deg, #06b6d4, #7c3aed)",
                width: `${progress}%`,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* ── Carte Question ── */}
          <div style={{
            background: "rgba(26,34,54,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 24, padding: 32,
            flex: 1, display: "flex", flexDirection: "column",
          }}>
            {/* Sous-titre dimension */}
            <p style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              {currentModule.title} — {currentQuestionIndex + 1}/{currentModule.questions.length}
            </p>

            {/* Question */}
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
              fontWeight: 600, fontSize: 20, color: "#f8fafc",
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
                      background: selected ? "rgba(6,182,212,0.18)" : "rgba(26,34,54,0.5)",
                      border: selected ? "1.5px solid rgba(6,182,212,0.55)" : "1.5px solid rgba(255,255,255,0.08)",
                      boxShadow: selected ? "0 0 16px rgba(6,182,212,0.2)" : "none",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: selected ? "2px solid #06b6d4" : "2px solid rgba(255,255,255,0.20)",
                      background: selected ? "#06b6d4" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {selected && <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: selected ? "#f8fafc" : "#94a3b8", flex: 1 }}>
                      {choice.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: selected ? "#22d3ee" : "#475569" }}>
                      {choice.value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handlePrev}
                disabled={isFirst}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 14,
                  background: "rgba(26,34,54,0.8)", border: "1px solid rgba(255,255,255,0.12)",
                  color: isFirst ? "#475569" : "#94a3b8",
                  fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                  cursor: isFirst ? "not-allowed" : "pointer",
                  opacity: isFirst ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
                Précédent
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered || submitting}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 14,
                  background: isAnswered ? "#06b6d4" : "rgba(6,182,212,0.25)",
                  border: "none",
                  color: isAnswered ? "white" : "rgba(255,255,255,0.35)",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  cursor: isAnswered && !submitting ? "pointer" : "not-allowed",
                  boxShadow: isAnswered ? "0 0 24px rgba(6,182,212,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {submitting ? (
                  <>
                    <svg style={{ width: 16, height: 16, animation: "spin 0.7s linear infinite" }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                    </svg>
                    Envoi…
                  </>
                ) : isLast ? (
                  "Soumettre"
                ) : (
                  <>Suivant <ChevronRight style={{ width: 16, height: 16 }} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
