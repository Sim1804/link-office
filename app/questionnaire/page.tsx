/**
 * /questionnaire/page.tsx — Questionnaire IQRH interactif (30 questions)
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { getUserStatus, submitIQRHQuestionnaire } from "@/lib/api";

const CHOICES = [
  { value: 1, label: "Pas du tout d'accord" },
  { value: 2, label: "Plutôt pas d'accord" },
  { value: 3, label: "Ni d'accord, ni pas d'accord" },
  { value: 4, label: "Plutôt d'accord" },
  { value: 5, label: "Tout à fait d'accord" },
];

const DIMENSIONS: Record<string, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie professionnelle et engagement",
  SELF: "Relation à soi et au sens",
};

const DIM_COLORS: Record<string, string> = {
  SOCIAL: "rgba(124,58,237,1)",
  AFFECTIVE: "rgba(6,182,212,1)",
  SENTIMENTAL: "rgba(244,63,94,1)",
  PROFESSIONAL: "rgba(245,158,11,1)",
  SELF: "rgba(52,211,153,1)",
};

const QUESTIONS_MOCK = [
  { id: "Q1",  dimension: "D1", texte: "Je me sens entouré(e) de personnes sur lesquelles je peux compter." },
  { id: "Q2",  dimension: "D1", texte: "J'ai des relations régulières avec des amis, collègues ou proches." },
  { id: "Q3",  dimension: "D1", texte: "Je me sens intégré(e) dans au moins un groupe social (famille, amis, collègues…)." },
  { id: "Q4",  dimension: "D1", texte: "Lorsque j'ai un problème, je sais vers qui me tourner." },
  { id: "Q5",  dimension: "D1", texte: "Je me sens à l'aise dans mes échanges avec les autres." },
  { id: "Q6",  dimension: "D1", texte: "J'ai des relations qui me nourrissent et m'apportent de l'énergie." },
  { id: "Q7",  dimension: "D2", texte: "Je me sens écouté(e) et compris(e) par mes proches." },
  { id: "Q8",  dimension: "D2", texte: "Je reçois des marques d'affection régulières de mon entourage." },
  { id: "Q9",  dimension: "D2", texte: "Je me sens en sécurité émotionnelle dans mes relations proches." },
  { id: "Q10", dimension: "D2", texte: "Je peux exprimer mes émotions sans craindre d'être jugé(e)." },
  { id: "Q11", dimension: "D2", texte: "Je me sens aimé(e) et valorisé(e) dans mes relations importantes." },
  { id: "Q12", dimension: "D2", texte: "Je dispose de soutien affectif en cas de difficulté." },
  { id: "Q13", dimension: "D3", texte: "Ma situation sentimentale actuelle me convient globalement." },
  { id: "Q14", dimension: "D3", texte: "Je suis satisfait(e) de ma vie amoureuse ou de mon célibat." },
  { id: "Q15", dimension: "D3", texte: "Je me sens en accord avec mes besoins affectifs dans ma vie sentimentale." },
  { id: "Q16", dimension: "D3", texte: "Ma situation sentimentale contribue positivement à mon équilibre." },
  { id: "Q17", dimension: "D3", texte: "Je me sens libre d'être moi-même dans ma vie amoureuse." },
  { id: "Q18", dimension: "D3", texte: "Je peux envisager mon avenir sentimental avec sérénité." },
  { id: "Q19", dimension: "D4", texte: "Mon activité principale me procure un sentiment d'utilité." },
  { id: "Q20", dimension: "D4", texte: "Je me sens reconnu(e) dans mon rôle professionnel ou principal." },
  { id: "Q21", dimension: "D4", texte: "Mon activité est en accord avec mes valeurs." },
  { id: "Q22", dimension: "D4", texte: "Je trouve du sens dans ce que je fais au quotidien." },
  { id: "Q23", dimension: "D4", texte: "Mon environnement professionnel favorise les échanges positifs." },
  { id: "Q24", dimension: "D4", texte: "Je me sens engagé(e) et motivé(e) dans mon activité." },
  { id: "Q25", dimension: "D5", texte: "Je me sens aligné(e) avec mes valeurs et mes priorités." },
  { id: "Q26", dimension: "D5", texte: "Je prends du temps pour moi et pour ce qui me fait du bien." },
  { id: "Q27", dimension: "D5", texte: "Je suis en paix avec qui je suis." },
  { id: "Q28", dimension: "D5", texte: "Je donne un sens à ce que je vis." },
  { id: "Q29", dimension: "D5", texte: "Je me sens capable de faire face aux défis de la vie." },
  { id: "Q30", dimension: "D5", texte: "Je prends soin de mon équilibre intérieur." },
];

export default function QuestionnairePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  
  const [questionsList, setQuestionsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/questions")
      .then(r => r.json())
      .then(d => setQuestionsList(d.questions || []))
      .catch(console.error);

    if (session?.user?.id) {
      // Pour ce prototype, on passe outre la vérification stricte
      setLoadingStatus(false);
    } else if (session === null) {
      setLoadingStatus(false);
    }
  }, [session, router]);

  const question = questionsList[current];
  const progress = questionsList.length > 0 ? ((current + (answers[question?.id] ? 1 : 0)) / questionsList.length) * 100 : 0;
  const isAnswered = !!answers[question?.id];
  const isLast = current === questionsList.length - 1 && questionsList.length > 0;
  const currentDimension = question ? DIMENSIONS[question.dimension] : "";
  const questionsInDimension = questionsList.filter((q) => q.dimension === question?.dimension);
  const questionIndexInDimension = questionsInDimension.findIndex((q) => q.id === question?.id) + 1;
  const dimColor = question ? (DIM_COLORS[question.dimension] ?? "#7c3aed") : "#7c3aed";

  const handleAnswer = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isLast) handleSubmit();
    else setCurrent((prev) => Math.min(questionsList.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) return;
    setSubmitting(true);
    try {
      sessionStorage.setItem("iqrh_answers", JSON.stringify(answers));
      setSubmitted(true);
      setTimeout(() => router.push("/adaptive"), 500);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert("Une erreur est survenue.");
    }
  };

  // ── État soumis ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <CheckCircle style={{ width: 64, height: 64, color: "#34d399", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc", marginBottom: 8 }}>
            Questionnaire de référence terminé !
          </h2>
          <p style={{ color: "#64748b", fontSize: 14 }}>Redirection vers les modules adaptatifs…</p>
        </div>
      </div>
    );
  }

  if (loadingStatus || questionsList.length === 0) {
    return <div style={{ minHeight: "100vh", background: "#0b0f19" }} />;
  }

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: "100vh",
        background: "#0b0f19",
        paddingTop: 88,
        paddingBottom: 32,
        paddingLeft: 24,
        paddingRight: 24,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Blob */}
        <div style={{
          position: "fixed", top: "-15%", right: "-8%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
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
                Question {current + 1} / {questionsList.length}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                color: dimColor, background: `${dimColor}22`,
                border: `1px solid ${dimColor}44`,
                padding: "3px 10px", borderRadius: 999,
              }}>
                {currentDimension}
              </span>
            </div>

            {/* Track */}
            <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 999,
                background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
                width: `${progress}%`,
                transition: "width 0.5s ease",
              }} />
            </div>

            {/* Dimension dots */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingLeft: 2, paddingRight: 2 }}>
              {Object.keys(DIMENSIONS).map((d) => (
                <div key={d} title={DIMENSIONS[d]} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: question?.dimension === d ? DIM_COLORS[d] : "rgba(255,255,255,0.10)",
                  transition: "all 0.3s",
                  boxShadow: question?.dimension === d ? `0 0 8px ${DIM_COLORS[d]}` : "none",
                }} />
              ))}
            </div>
          </div>

          {/* ── Carte Question ── */}
          <div style={{
            background: "rgba(26,34,54,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: 32,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Sous-titre dimension */}
            <p style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              {currentDimension} — {questionIndexInDimension}/{questionsInDimension.length}
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
                      background: selected ? "rgba(124,58,237,0.18)" : "rgba(26,34,54,0.5)",
                      border: selected ? "1.5px solid rgba(124,58,237,0.55)" : "1.5px solid rgba(255,255,255,0.08)",
                      boxShadow: selected ? "0 0 16px rgba(124,58,237,0.2)" : "none",
                    }}
                  >
                    {/* Radio indicator */}
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: selected ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.20)",
                      background: selected ? "#7c3aed" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {selected && <div style={{ width: 8, height: 8, background: "white", borderRadius: "50%" }} />}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: selected ? "#f8fafc" : "#94a3b8", flex: 1 }}>
                      {choice.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: selected ? "#a78bfa" : "#475569" }}>
                      {choice.value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                disabled={current === 0}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "13px 20px", borderRadius: 14,
                  background: "rgba(26,34,54,0.8)", border: "1px solid rgba(255,255,255,0.12)",
                  color: current === 0 ? "#475569" : "#94a3b8",
                  fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                  cursor: current === 0 ? "not-allowed" : "pointer",
                  opacity: current === 0 ? 0.5 : 1,
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
                  background: isAnswered ? "#7c3aed" : "rgba(124,58,237,0.25)",
                  border: "none",
                  color: isAnswered ? "white" : "rgba(255,255,255,0.35)",
                  fontSize: 14, fontWeight: 600, fontFamily: "inherit",
                  cursor: isAnswered && !submitting ? "pointer" : "not-allowed",
                  boxShadow: isAnswered ? "0 0 24px rgba(124,58,237,0.35)" : "none",
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
                  "Soumettre le questionnaire"
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
