import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { ProgressBar } from "@/components/ProgressBar";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getResults, MobileResults } from "@/services/questionnaire";

const colors = [COLORS.link, COLORS.clarity, COLORS.action, COLORS.energy, COLORS.softness];

export default function ResultatsScreen() {
  const { token } = useAuth();
  const [results, setResults] = useState<MobileResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getResults(token).then(setResults).catch((reason) => {
      console.error("MOBILE RESULTS LOAD ERROR", reason);
      setError(reason instanceof Error ? reason.message : "Impossible de charger vos résultats.");
    });
  }, [token]);

  if (!results && !error) return <Screen><View style={styles.center}><ActivityIndicator color={COLORS.link}/><Text style={styles.muted}>Chargement de votre bilan…</Text></View></Screen>;
  if (error) return <Screen><SectionTitle eyebrow="Vos résultats" title="Votre bilan n'est pas encore disponible" description={error}/></Screen>;
  if (!results) return null;

  return <Screen>
    <SectionTitle eyebrow="Vos résultats" title="Votre bilan IQRH" description="Ces résultats sont calculés à partir de vos réponses au questionnaire." />
    <View style={styles.scoreCard}>
      <Text style={styles.scoreLabel}>SCORE GLOBAL IQRH</Text>
      <Text style={styles.score}>{results.globalScore}<Text style={styles.out}>/100</Text></Text>
      <View style={styles.pill}><Text style={styles.pillText}>{results.weather}</Text></View>
      <Text style={styles.scoreText}>{results.summary}</Text>
    </View>
    {results.profile ? <View style={styles.profile}><Text style={styles.profileLabel}>VOTRE PROFIL RELATIONNEL</Text><Text style={styles.profileName}>{results.profile.name}</Text><Text style={styles.profileText}>{results.profile.summary}</Text></View> : null}
    <View style={styles.card}>
      <Text style={styles.title}>Vos dimensions</Text>
      {results.dimensions.map((dimension, index) => <View key={dimension.label} style={styles.item}>
        <View style={styles.line}><Text style={styles.name}>{dimension.label}</Text><Text style={styles.value}>{dimension.score}/100</Text></View>
        <ProgressBar value={dimension.score} color={colors[index]}/>
        <Text style={styles.caption}>{dimension.interpretation}</Text>
      </View>)}
    </View>
    <Insight title="Votre priorité" items={[results.priorityDimension]} />
    <Insight title="Vos ressources" items={results.strengths} />
    <Insight title="Points d'attention" items={results.watchpoints} />
  </Screen>;
}

function Insight({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <View style={styles.insight}><Text style={styles.insightTitle}>{title}</Text>{items.map((item) => <Text key={item} style={styles.insightText}>• {item}</Text>)}</View>;
}

const styles = StyleSheet.create({
  center:{paddingTop:70,alignItems:"center"},muted:{color:COLORS.textMuted,marginTop:12},scoreCard:{backgroundColor:COLORS.depth,borderRadius:RADIUS.lg,padding:22,marginBottom:16,...SHADOW.card},scoreLabel:{color:COLORS.softness,fontSize:10,fontWeight:"800",letterSpacing:1.2},score:{color:COLORS.white,fontSize:62,fontWeight:"800",marginTop:7},out:{color:"#A7C0C0",fontSize:20,fontWeight:"500"},pill:{alignSelf:"flex-start",backgroundColor:COLORS.serenity,borderRadius:RADIUS.pill,paddingHorizontal:11,paddingVertical:6,marginBottom:10},pillText:{color:COLORS.depth,fontSize:11,fontWeight:"800"},scoreText:{color:"#C9D9D7",fontSize:12,lineHeight:18},profile:{backgroundColor:COLORS.serenity,borderRadius:RADIUS.md,padding:17,marginBottom:16},profileLabel:{color:COLORS.link,fontSize:10,fontWeight:"800",letterSpacing:1},profileName:{color:COLORS.depth,fontSize:19,fontWeight:"800",marginTop:5},profileText:{color:COLORS.textMuted,fontSize:12,marginTop:5},card:{backgroundColor:COLORS.white,borderRadius:RADIUS.md,padding:18,...SHADOW.card},title:{color:COLORS.depth,fontSize:16,fontWeight:"800",marginBottom:18},item:{marginBottom:17},line:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},name:{color:COLORS.textMuted,fontSize:12},value:{color:COLORS.depth,fontSize:12,fontWeight:"800"},caption:{color:COLORS.textMuted,fontSize:10,marginTop:6},insight:{backgroundColor:COLORS.white,borderRadius:RADIUS.md,padding:17,marginTop:14,...SHADOW.card},insightTitle:{color:COLORS.depth,fontSize:14,fontWeight:"800",marginBottom:8},insightText:{color:COLORS.textMuted,fontSize:12,lineHeight:19}
});
