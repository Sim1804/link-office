import { View, Text, StyleSheet } from "react-native";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { ProgressBar } from "@/components/ProgressBar";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";

const dimensions = [
  ["Relations sociales",80,COLORS.link,"Votre réseau est une vraie ressource."],
  ["Relations affectives",70,COLORS.clarity,"Une base solide à entretenir."],
  ["Vie sentimentale",55,COLORS.action,"Un espace à observer avec douceur."],
  ["Vie professionnelle",85,COLORS.energy,"Une forte source d'énergie et de sens."],
  ["Relation à soi",70,COLORS.softness,"De bons repères pour avancer."],
] as const;

export default function ResultatsScreen() {
  return (
    <Screen>
      <SectionTitle eyebrow="Vos résultats" title="Un miroir, pas une étiquette" description="Votre score évolue avec votre parcours. L'objectif est de repérer vos ressources et vos points d'attention." />
      <View style={styles.scoreCard}>
        <Text style={styles.scoreLabel}>SCORE GLOBAL IQRH</Text>
        <Text style={styles.score}>72<Text style={styles.out}>/100</Text></Text>
        <View style={styles.pill}><Text style={styles.pillText}>Éclaircies</Text></View>
        <Text style={styles.scoreText}>Bonne qualité relationnelle</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Vos dimensions</Text>
        {dimensions.map(([name, score, color, caption]) => (
          <View key={name} style={styles.item}>
            <View style={styles.line}><Text style={styles.name}>{name}</Text><Text style={styles.value}>{score}</Text></View>
            <ProgressBar value={score} color={color} />
            <Text style={styles.caption}>{caption}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
const styles=StyleSheet.create({
  scoreCard:{backgroundColor:COLORS.depth,borderRadius:RADIUS.lg,padding:22,marginBottom:16,...SHADOW.card},
  scoreLabel:{color:COLORS.softness,fontSize:10,fontWeight:"800",letterSpacing:1.2},
  score:{color:COLORS.white,fontSize:62,fontWeight:"800",marginTop:7},out:{color:"#A7C0C0",fontSize:20,fontWeight:"500"},
  pill:{alignSelf:"flex-start",backgroundColor:COLORS.serenity,borderRadius:RADIUS.pill,paddingHorizontal:11,paddingVertical:6,marginBottom:10},
  pillText:{color:COLORS.depth,fontSize:11,fontWeight:"800"},scoreText:{color:"#C9D9D7",fontSize:12},
  card:{backgroundColor:COLORS.white,borderRadius:RADIUS.md,padding:18,...SHADOW.card},title:{color:COLORS.depth,fontSize:16,fontWeight:"800",marginBottom:18},
  item:{marginBottom:17},line:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},name:{color:COLORS.textMuted,fontSize:12},value:{color:COLORS.depth,fontSize:12,fontWeight:"800"},caption:{color:COLORS.textMuted,fontSize:10,marginTop:6}
});
