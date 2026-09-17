import { useEffect, useMemo, useState } from "react";
import { Redirect, router } from "expo-router";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ProgressBar } from "@/components/ProgressBar";
import { ANSWERS, DIMENSIONS, QUESTIONS } from "@/data/questions";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { AdaptiveQuestion, saveAnswer, startQuestionnaire, submitQuestionnaire } from "@/services/questionnaire";

type Phase = "reference" | "adaptive";

export default function QuestionnaireScreen() {
  const { token, user, refresh } = useAuth();
  const [phase, setPhase] = useState<Phase>("reference");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !user) return;
    startQuestionnaire(token, user.id).then((assessment) => {
      setAssessmentId(assessment.id);
      setAdaptiveQuestions(assessment.adaptiveQuestions ?? []);
    }).catch((error) => {
      console.error("QUESTIONNAIRE START ERROR", error);
      Alert.alert("Questionnaire", error instanceof Error ? error.message : "Impossible de démarrer l'évaluation.");
    }).finally(() => setLoading(false));
  }, [token, user]);

  const activeQuestions = phase === "reference" ? QUESTIONS : adaptiveQuestions;
  const question = activeQuestions[current];
  const selected = question ? answers[question.id] : undefined;
  const referenceQuestion = phase === "reference" ? QUESTIONS[current] : null;
  const dimension = referenceQuestion ? DIMENSIONS[referenceQuestion.dimension] : null;
  const total = QUESTIONS.length + adaptiveQuestions.length;
  const completedBefore = phase === "reference" ? current : QUESTIONS.length + current;
  const answerCount = useMemo(() => Object.keys(answers).length, [answers]);

  const choose = (value: number) => question && setAnswers((previous) => ({ ...previous, [question.id]: value }));
  const finish = async () => {
    if (!token || !assessmentId) return;
    await submitQuestionnaire(token, assessmentId);
    await refresh();
    Alert.alert("Évaluation terminée", "Votre bilan est maintenant disponible.", [
      { text: "Voir mes résultats", onPress: () => router.replace("/(tabs)/resultats") },
    ]);
  };
  const next = async () => {
    if (selected === undefined || !token || !assessmentId || !question) return;
    setBusy(true);
    try {
      await saveAnswer(token, assessmentId, question.id, selected);
      if (current < activeQuestions.length - 1) setCurrent((value) => value + 1);
      else if (phase === "reference" && adaptiveQuestions.length > 0) { setPhase("adaptive"); setCurrent(0); }
      else await finish();
    } catch (error) {
      console.error("QUESTIONNAIRE SAVE OR SUBMIT ERROR", error);
      Alert.alert("Enregistrement", error instanceof Error ? error.message : "Une erreur est survenue.");
    } finally { setBusy(false); }
  };

  if (!token || !user) return <Redirect href="/welcome" />;
  if (loading) return <Screen><View style={styles.center}><ActivityIndicator color={COLORS.link}/><Text style={styles.loading}>Préparation de votre évaluation…</Text></View></Screen>;
  if (!question) return <Screen><View style={styles.center}><Text style={styles.loading}>Aucune question à afficher.</Text></View></Screen>;
  const isLast = current === activeQuestions.length - 1;
  const actionLabel = busy ? "Enregistrement…" : isLast ? (phase === "reference" && adaptiveQuestions.length > 0 ? "Continuer" : "Terminer") : "Continuer";
  const color = dimension?.color ?? COLORS.link;
  const adaptiveQuestion = phase === "adaptive" ? question as AdaptiveQuestion : null;
  const label = dimension?.label ?? adaptiveQuestion?.moduleTitle ?? "Questionnaire complémentaire";

  return <Screen><View style={styles.top}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={20} color={COLORS.depth}/></Pressable><Text style={styles.counter}>{completedBefore + 1} / {total}</Text><Text style={[styles.dimension, { color }]}>{label}</Text></View><ProgressBar value={((completedBefore + (selected === undefined ? 0 : 1)) / total) * 100} color={color}/><View style={styles.dots}>{phase === "reference" && Object.entries(DIMENSIONS).map(([key, item]) => <View key={key} style={[styles.dot, { backgroundColor: referenceQuestion?.dimension === key ? item.color : COLORS.border }]}/>)}</View><View style={styles.card}><View style={[styles.badge, { backgroundColor: color }]}><Text style={styles.badgeText}>{phase === "reference" ? referenceQuestion?.dimension : "MODULE"}</Text></View><Text style={styles.question}>{question.text}</Text><Text style={styles.helper}>Choisissez la réponse qui vous ressemble le plus.</Text><View style={styles.answers}>{ANSWERS.map((answer) => <Pressable key={answer.value} onPress={() => choose(answer.value)} style={[styles.answer, selected === answer.value && { borderColor: color, backgroundColor: COLORS.serenity }]}><View style={[styles.radio, selected === answer.value && { borderColor: color }]}>{selected === answer.value && <View style={[styles.radioInner, { backgroundColor: color }]}/>}</View><Text style={styles.answerText}>{answer.label}</Text></Pressable>)}</View></View><View style={styles.bottom}><Text style={styles.answered}>{answerCount} réponse{answerCount > 1 ? "s" : ""} enregistrée{answerCount > 1 ? "s" : ""}</Text><Pressable onPress={next} disabled={selected === undefined || busy} style={[styles.next, (selected === undefined || busy) && styles.nextDisabled]}><Text style={styles.nextText}>{actionLabel}</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white}/></Pressable></View></Screen>;
}

const styles = StyleSheet.create({
  center:{paddingTop:70,alignItems:"center"},loading:{color:COLORS.textMuted,marginTop:12},top:{flexDirection:"row",alignItems:"center",marginBottom:12,gap:10},back:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.white,alignItems:"center",justifyContent:"center",...SHADOW.card},counter:{color:COLORS.textMuted,fontSize:12,fontWeight:"700"},dimension:{marginLeft:"auto" as any,fontSize:11,fontWeight:"800",maxWidth:"48%"},dots:{flexDirection:"row",justifyContent:"space-between",paddingHorizontal:2,marginTop:9,marginBottom:18,minHeight:7},dot:{width:7,height:7,borderRadius:7},card:{backgroundColor:COLORS.white,borderRadius:RADIUS.lg,padding:20,...SHADOW.card},badge:{alignSelf:"flex-start",borderRadius:RADIUS.pill,paddingHorizontal:9,paddingVertical:6},badgeText:{color:COLORS.white,fontSize:9,fontWeight:"800",letterSpacing:.6},question:{color:COLORS.depth,fontSize:24,lineHeight:31,fontWeight:"800",marginTop:17},helper:{color:COLORS.textMuted,fontSize:12,lineHeight:18,marginTop:9,marginBottom:20},answers:{gap:9},answer:{borderWidth:1.2,borderColor:COLORS.border,borderRadius:RADIUS.md,padding:13,flexDirection:"row",alignItems:"center",gap:11},radio:{width:22,height:22,borderRadius:11,borderWidth:2,borderColor:"#A6B8B6",alignItems:"center",justifyContent:"center"},radioInner:{width:10,height:10,borderRadius:5},answerText:{flex:1,color:COLORS.depth,fontSize:12,lineHeight:17,fontWeight:"600"},bottom:{marginTop:16,flexDirection:"row",alignItems:"center",gap:10},answered:{flex:1,color:COLORS.textMuted,fontSize:10},next:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:13,paddingHorizontal:17,flexDirection:"row",alignItems:"center",gap:7},nextDisabled:{opacity:.45},nextText:{color:COLORS.white,fontSize:12,fontWeight:"800"}
});
