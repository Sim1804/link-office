import { router } from "expo-router";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BrandMark } from "@/components/BrandMark";
import { COLORS, RADIUS } from "@/constants/theme";

export default function OnboardingScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.glow} />
      <BrandMark />
      <View style={styles.center}>
        <View style={styles.icon}><Ionicons name="git-network-outline" size={34} color={COLORS.white}/></View>
        <Text style={styles.kicker}>LABORATOIRE DU LIEN HUMAIN</Text>
        <Text style={styles.title}>Votre lien humain{'\n'}mérite d'être mesuré.</Text>
        <Text style={styles.text}>Une expérience mobile pensée autour de la clarté, de la douceur, de l'action et de la confiance.</Text>
      </View>
      <Pressable style={styles.button} onPress={()=>router.replace("/(tabs)")}>
        <Text style={styles.buttonText}>Découvrir Link Office</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white}/>
      </Pressable>
    </View>
  );
}
const styles=StyleSheet.create({
  root:{flex:1,backgroundColor:COLORS.ivory,padding:24,justifyContent:"space-between",paddingTop:60,paddingBottom:35,overflow:"hidden"},
  glow:{position:"absolute",width:360,height:360,borderRadius:180,backgroundColor:"#D5EEE9",right:-130,top:80,opacity:.75},
  center:{marginTop:-40},icon:{width:74,height:74,borderRadius:37,backgroundColor:COLORS.depth,alignItems:"center",justifyContent:"center",marginBottom:20},kicker:{color:COLORS.link,fontSize:10,fontWeight:"800",letterSpacing:1.4,marginBottom:9},title:{color:COLORS.depth,fontSize:36,lineHeight:41,fontWeight:"800"},text:{color:COLORS.textMuted,fontSize:14,lineHeight:21,marginTop:14,maxWidth:340},button:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:16,paddingHorizontal:18,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8},buttonText:{color:COLORS.white,fontSize:14,fontWeight:"800"}
});
