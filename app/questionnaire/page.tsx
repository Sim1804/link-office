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
import { Button } from "@/components/ui/Button";

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

const DIMENSION_OBJECTIVES: Record<string, string> = {
  SOCIAL: "Cette dimension mesure la qualité du réseau relationnel, le sentiment d'appartenance, le soutien social perçu et la capacité à créer et maintenir des liens.",
  AFFECTIVE: "Cette dimension évalue la qualité des relations de proximité, le niveau de sécurité affective, et la capacité à exprimer et recevoir de l'affection.",
  SENTIMENTAL: "Cette dimension explore la satisfaction amoureuse, l'équilibre dans le couple ou le célibat, et le niveau d'intimité émotionnelle.",
  PROFESSIONAL: "Cette dimension mesure l'épanouissement au travail, la qualité des relations professionnelles, le sentiment de reconnaissance et l'alignement avec les valeurs.",
  SELF: "Cette dimension évalue la relation à soi-même, l'estime de soi, le niveau de cohérence personnelle et la capacité à trouver du sens à sa vie.",
};

const DIM_COLORS: Record<string, string> = {
  SOCIAL: "var(--primary)",
  AFFECTIVE: "var(--cyan)",
  SENTIMENTAL: "var(--rose)",
  PROFESSIONAL: "var(--amber)",
  SELF: "var(--emerald)",
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
  const dimColor = question ? (DIM_COLORS[question.dimension] ?? "var(--primary)") : "var(--primary)";

  const handleAnswer = (value: number) => {
    if (!question) return;
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (isLast) handleSubmit();
    else setCurrent((prev) => Math.min(questionsList.length - 1, prev + 1));
  };

  const handleSubmit = async () => {
    try {
      sessionStorage.setItem("iqrh_answers", JSON.stringify(answers));
    } catch (e) {
      console.error("Storage error:", e);
    }

    if (!session?.user?.id) {
      setSubmitted(true);
      setTimeout(() => router.push("/auth/register?callbackUrl=/adaptive"), 800);
      return;
    }

    setSubmitting(true);
    setSubmitted(true);
    setTimeout(() => router.push("/adaptive"), 500);
  };

  // ── État soumis ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <CheckCircle className="w-16 h-16 text-[#00A99D] mx-auto mb-4" />
          <h2 className="font-jakarta font-extrabold text-2xl text-[#123D46] mb-2">
            Questionnaire de référence terminé !
          </h2>
          <p className="text-sm text-[#123D46]/70">
            {!session?.user?.id
              ? "Vos 30 réponses sont sauvegardées. Redirection pour créer votre compte et découvrir votre bilan…"
              : "Redirection vers les modules adaptatifs…"}
          </p>
        </div>
      </div>
    );
  }

  if (loadingStatus || questionsList.length === 0) {
    return <div className="min-h-screen bg-[#FAF9F5]" />;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] pt-24 pb-12 px-5 relative flex flex-col">
        {/* Blob */}
        <div className="fixed -top-[15%] -right-[8%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,169,157,0.05)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col flex-1">

          {/* ── Barre de progression ── */}
          <div className="mb-7">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-mono text-[#123D46]/50">
                Question {current + 1} / {questionsList.length}
              </span>
              <span className="text-xs font-jakarta font-semibold tracking-wider uppercase text-[#00A99D]">
                {currentDimension}
              </span>
            </div>

            {/* Track */}
            <div className="h-1.5 bg-[#E3EBE6] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#00A99D] rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            </div>

            {/* Dimension dots */}
            <div className="flex justify-between mt-2 px-0.5">
              {Object.keys(DIMENSIONS).map((d) => (
                <div key={d} title={DIMENSIONS[d]} className={`w-2 h-2 rounded-full transition-all duration-300 ${question?.dimension === d ? 'bg-[#00A99D] shadow-[0_0_8px_rgba(0,169,157,0.6)] scale-125' : 'bg-[#E3EBE6]'}`} />
              ))}
            </div>
          </div>

          {/* ── Carte Question ── */}
          <div className="bg-white rounded-3xl border border-[#E3EBE6] shadow-xs overflow-hidden p-6 sm:p-10 flex flex-col flex-1 animate-scale-in">
            {/* Sous-titre dimension */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-jakarta font-semibold text-[#00A99D] uppercase tracking-wider">
                {currentDimension}
              </span>
              <span className="text-xs text-[#123D46]/50 font-mono">
                {questionIndexInDimension}/{questionsInDimension.length}
              </span>
            </div>

            {/* Question */}
            <h4 className="font-jakarta font-extrabold text-xl sm:text-2xl text-[#123D46] leading-snug mb-5">
              {question?.text}
            </h4>

            {/* Objectif de la dimension */}
            <div className="p-3.5 mb-6 rounded-xl bg-[#FAF9F5] border-l-[3px] border-[#00A99D] text-xs text-[#123D46]/80 italic">
              « {question ? DIMENSION_OBJECTIVES[question.dimension] : ""} »
            </div>

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
                onClick={() => setCurrent((p) => Math.max(0, p - 1))}
                disabled={current === 0}
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
                  "Soumettre le questionnaire"
                ) : (
                  <>Suivant <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
