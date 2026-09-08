import { router } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";

export default function EvaluationScreen() {
  return (
    <Screen>
      <SectionTitle eyebrow="Évaluation IQRH" title="Faites le point sur vos relations" description="30 questions, 5 dimensions, environ 5 minutes. Vos réponses restent confidentielles." />
      <View style={styles.card}>
        <View style={styles.circle}><Text style={styles.circleNumber}>30</Text><Text style={styles.circleLabel}>questions</Text></View>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>Une mesure globale</Text>
          <Text style={styles.text}>Relations sociales, affectives, sentimentales, professionnelles et relation à soi.</Text>
        </View>
      </View>
      {[
        ["people-outline","Relations sociales",COLORS.link],
        ["heart-outline","Relations affectives",COLORS.clarity],
        ["heart-circle-outline","Vie sentimentale",COLORS.action],
        ["briefcase-outline","Vie professionnelle",COLORS.energy],
        ["sparkles-outline","Relation à soi",COLORS.softness],
      ].map(([icon,label,color]) => (
        <View style={styles.dimension} key={label as string}>
          <View style={[styles.icon,{backgroundColor:color as string}]}><Ionicons name={icon as any} size={19} color={COLORS.white}/></View>
          <Text style={styles.dimensionText}>{label}</Text>
          <Ionicons name="checkmark-circle" size={19} color={COLORS.serenity === color ? COLORS.link : COLORS.border} />
        </View>
      ))}
      <Pressable style={styles.primary} onPress={() => router.push("/questionnaire")}>
        <Text style={styles.primaryText}>Démarrer maintenant</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white}/>
      </Pressable>
      <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={18} color={COLORS.link}/><Text style={styles.noteText}>Un espace conçu pour vous aider à comprendre, pas à vous juger.</Text></View>
    </Screen>
  );
}
const styles=StyleSheet.create({
  card:{backgroundColor:COLORS.white,borderRadius:RADIUS.lg,padding:18,flexDirection:"row",alignItems:"center",gap:16,marginBottom:18,...SHADOW.card},
  circle:{width:82,height:82,borderRadius:41,backgroundColor:COLORS.serenity,alignItems:"center",justifyContent:"center"},
  circleNumber:{color:COLORS.depth,fontSize:26,fontWeight:"800"},circleLabel:{color:COLORS.textMuted,fontSize:10},
  cardTitle:{color:COLORS.depth,fontSize:16,fontWeight:"800",marginBottom:5},text:{color:COLORS.textMuted,fontSize:12,lineHeight:18},
  dimension:{backgroundColor:COLORS.white,borderRadius:RADIUS.md,padding:13,marginBottom:9,flexDirection:"row",alignItems:"center",gap:12,...SHADOW.card},
  icon:{width:38,height:38,borderRadius:19,alignItems:"center",justifyContent:"center"},dimensionText:{flex:1,color:COLORS.depth,fontSize:13,fontWeight:"700"},
  primary:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:15,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,marginTop:10},
  primaryText:{color:COLORS.white,fontWeight:"800",fontSize:14},
  note:{flexDirection:"row",alignItems:"center",gap:8,marginTop:18,padding:13,backgroundColor:COLORS.serenity,borderRadius:RADIUS.sm},
  noteText:{flex:1,color:COLORS.textMuted,fontSize:11,lineHeight:16}
});
