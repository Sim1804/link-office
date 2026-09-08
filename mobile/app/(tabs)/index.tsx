import { router } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/BrandMark";
import { Screen } from "@/components/Screen";
import { SectionTitle } from "@/components/SectionTitle";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <BrandMark compact />
        <Pressable style={styles.bell}><Ionicons name="notifications-outline" size={21} color={COLORS.depth} /></Pressable>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroOrb}><Ionicons name="people-outline" size={34} color={COLORS.white} /></View>
        <Text style={styles.kicker}>LABORATOIRE DU LIEN HUMAIN</Text>
        <Text style={styles.heroTitle}>Comprendre. Observer.{'\n'}Mesurer. Agir.</Text>
        <Text style={styles.heroText}>Votre qualité relationnelle devient un indicateur concret pour mieux prendre soin de vos liens.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/questionnaire")}>
          <Text style={styles.primaryText}>Commencer mon évaluation</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </Pressable>
      </View>

      <SectionTitle eyebrow="Votre tableau de bord" title="Votre climat relationnel" description="Une lecture simple, humaine et actionnable de votre situation." />

      <View style={styles.row}>
        <MetricCard label="Score IQRH" value="72" caption="/100 • Équilibre" accent={COLORS.link} />
        <MetricCard label="Évolution" value="+18%" caption="sur votre parcours" accent={COLORS.action} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Vos 5 dimensions</Text>
          <Text style={styles.small}>Aujourd'hui</Text>
        </View>
        {[
          ["Relations sociales",80,COLORS.link],
          ["Relations affectives",70,COLORS.clarity],
          ["Vie sentimentale",55,COLORS.action],
          ["Vie professionnelle",85,COLORS.energy],
          ["Relation à soi",70,COLORS.softness],
        ].map(([label, score, color]) => (
          <View key={label as string} style={styles.dimension}>
            <View style={styles.dimLine}><Text style={styles.dimLabel}>{label}</Text><Text style={styles.dimScore}>{score}</Text></View>
            <ProgressBar value={score as number} color={color as string} />
          </View>
        ))}
      </View>

      <View style={styles.actionCard}>
        <View style={styles.actionIcon}><Ionicons name="sparkles" size={20} color={COLORS.depth} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>IRIS vous accompagne</Text>
          <Text style={styles.actionText}>Une IA coach bienveillante pour transformer vos résultats en petites actions.</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/iris")}><Ionicons name="chevron-forward" size={22} color={COLORS.depth} /></Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:22},
  bell:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.white,alignItems:"center",justifyContent:"center",...SHADOW.card},
  hero:{backgroundColor:COLORS.depth,borderRadius:RADIUS.lg,padding:22,marginBottom:28,overflow:"hidden"},
  heroOrb:{width:64,height:64,borderRadius:32,backgroundColor:COLORS.link,alignItems:"center",justifyContent:"center",marginBottom:18},
  kicker:{color:COLORS.softness,fontSize:10,fontWeight:"800",letterSpacing:1.3,marginBottom:8},
  heroTitle:{color:COLORS.white,fontSize:30,lineHeight:35,fontWeight:"800"},
  heroText:{color:"#C9D9D7",fontSize:14,lineHeight:21,marginTop:12,marginBottom:20},
  primary:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:14,paddingHorizontal:17,flexDirection:"row",justifyContent:"center",alignItems:"center",gap:8},
  primaryText:{color:COLORS.white,fontSize:14,fontWeight:"800"},
  row:{flexDirection:"row",gap:12,marginBottom:16},
  card:{backgroundColor:COLORS.white,borderRadius:RADIUS.md,padding:18,marginBottom:16,...SHADOW.card},
  cardHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18},
  cardTitle:{color:COLORS.depth,fontSize:16,fontWeight:"800"},
  small:{color:COLORS.textMuted,fontSize:11},
  dimension:{marginBottom:13},
  dimLine:{flexDirection:"row",justifyContent:"space-between",marginBottom:6},
  dimLabel:{color:COLORS.textMuted,fontSize:12},
  dimScore:{color:COLORS.depth,fontSize:12,fontWeight:"800"},
  actionCard:{backgroundColor:COLORS.serenity,borderRadius:RADIUS.md,padding:16,flexDirection:"row",alignItems:"center",gap:12},
  actionIcon:{width:40,height:40,borderRadius:20,backgroundColor:COLORS.energy,alignItems:"center",justifyContent:"center"},
  actionTitle:{color:COLORS.depth,fontSize:14,fontWeight:"800",marginBottom:3},
  actionText:{color:COLORS.textMuted,fontSize:12,lineHeight:18},
});
