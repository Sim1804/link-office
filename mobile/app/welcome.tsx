import { router } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/BrandMark";
import { COLORS, RADIUS } from "@/constants/theme";
export default function WelcomeScreen() {
  return <View style={styles.root}>
    <View style={styles.orb1}/><View style={styles.orb2}/>
    <BrandMark/>
    <View style={styles.center}>
      <View style={styles.icon}><Ionicons name="git-network-outline" size={34} color={COLORS.white}/></View>
      <Text style={styles.kicker}>LABORATOIRE DU LIEN HUMAIN</Text>
      <Text style={styles.title}>Comprendre.{"\n"}Observer.{"\n"}Mesurer. Agir.</Text>
      <Text style={styles.text}>Une expérience pensée pour vous aider à mieux comprendre la qualité de vos relations et à passer à l'action avec douceur.</Text>
    </View>
    <View>
      <Pressable style={styles.primary} onPress={()=>router.push("/auth/register")}><Text style={styles.primaryText}>Créer mon compte</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white}/></Pressable>
      <Pressable style={styles.secondary} onPress={()=>router.push("/auth/login")}><Text style={styles.secondaryText}>J'ai déjà un compte</Text></Pressable>
      <Text style={styles.legal}>Vos réponses sont confidentielles et vous gardez le contrôle de votre parcours.</Text>
    </View>
  </View>
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:COLORS.ivory,padding:24,paddingTop:62,paddingBottom:28,justifyContent:"space-between",overflow:"hidden"},orb1:{position:"absolute",width:340,height:340,borderRadius:170,backgroundColor:COLORS.serenity,right:-140,top:40,opacity:.9},orb2:{position:"absolute",width:220,height:220,borderRadius:110,backgroundColor:"#D9F2EE",left:-130,bottom:120,opacity:.65},center:{marginTop:-25},icon:{width:72,height:72,borderRadius:36,backgroundColor:COLORS.depth,alignItems:"center",justifyContent:"center",marginBottom:18},kicker:{color:COLORS.link,fontSize:10,fontWeight:"800",letterSpacing:1.5,marginBottom:10},title:{color:COLORS.depth,fontSize:38,lineHeight:42,fontWeight:"800"},text:{color:COLORS.textMuted,fontSize:14,lineHeight:21,marginTop:15,maxWidth:350},primary:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:16,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},primaryText:{color:COLORS.white,fontSize:14,fontWeight:"800"},secondary:{borderWidth:1.5,borderColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:14,alignItems:"center",marginTop:10},secondaryText:{color:COLORS.depth,fontSize:13,fontWeight:"800"},legal:{textAlign:"center",color:COLORS.textMuted,fontSize:10,lineHeight:15,marginTop:13}}
);
