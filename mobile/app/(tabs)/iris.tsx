import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";

type Message={from:"iris"|"user"; text:string};

export default function IrisScreen() {
  const [message,setMessage]=useState("");
  const [messages,setMessages]=useState<Message[]>([
    {from:"iris",text:"Bonjour, je suis IRIS. Je peux vous aider à mettre vos résultats en mots et à choisir une petite action concrète."},
    {from:"iris",text:"Qu'est-ce qui vous semble le plus important aujourd'hui ?"},
  ]);
  const send=()=>{
    const value=message.trim(); if(!value)return;
    setMessages(m=>[...m,{from:"user",text:value},{from:"iris",text:"Merci pour ce partage. Commencez par une action simple, réalisable cette semaine, puis observez ce que cela change dans votre quotidien."}]);
    setMessage("");
  };
  return (
    <KeyboardAvoidingView style={{flex:1,backgroundColor:COLORS.ivory}} behavior={Platform.OS==="ios"?"padding":undefined}>
      <Screen>
        <View style={styles.header}><View style={styles.irisIcon}><Ionicons name="sparkles" size={22} color={COLORS.depth}/></View><View><Text style={styles.title}>IRIS</Text><Text style={styles.sub}>Coach relationnel</Text></View></View>
        <View style={styles.chat}>
          {messages.map((m,i)=><View key={i} style={[styles.bubble,m.from==="user"?styles.user:styles.bot]}><Text style={[styles.bubbleText,m.from==="user"?styles.userText:styles.botText]}>{m.text}</Text></View>)}
        </View>
        <View style={styles.suggestions}><Text style={styles.suggestTitle}>Essayez une question</Text><View style={styles.chips}><Pressable onPress={()=>setMessage("Comment améliorer mes relations sociales ?")} style={styles.chip}><Text style={styles.chipText}>Relations sociales</Text></Pressable><Pressable onPress={()=>setMessage("Quelle petite action puis-je faire ?")} style={styles.chip}><Text style={styles.chipText}>Petite action</Text></Pressable></View></View>
        <View style={styles.inputRow}><TextInput value={message} onChangeText={setMessage} placeholder="Écrivez à IRIS…" placeholderTextColor="#789096" style={styles.input} multiline/><Pressable onPress={send} style={styles.send}><Ionicons name="arrow-up" size={20} color={COLORS.white}/></Pressable></View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
const styles=StyleSheet.create({
  header:{flexDirection:"row",alignItems:"center",gap:12,marginBottom:18},irisIcon:{width:46,height:46,borderRadius:23,backgroundColor:COLORS.energy,alignItems:"center",justifyContent:"center"},title:{color:COLORS.depth,fontSize:20,fontWeight:"800"},sub:{color:COLORS.textMuted,fontSize:11,marginTop:2},
  chat:{gap:10,marginBottom:14},bubble:{maxWidth:"88%",padding:13,borderRadius:18},bot:{backgroundColor:COLORS.white,alignSelf:"flex-start",borderBottomLeftRadius:5,...SHADOW.card},user:{backgroundColor:COLORS.link,alignSelf:"flex-end",borderBottomRightRadius:5},bubbleText:{fontSize:13,lineHeight:19},botText:{color:COLORS.depth},userText:{color:COLORS.white},
  suggestions:{marginTop:"auto" as any,marginBottom:10},suggestTitle:{color:COLORS.textMuted,fontSize:11,fontWeight:"700",marginBottom:8},chips:{flexDirection:"row",gap:8,flexWrap:"wrap"},chip:{borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.pill,paddingVertical:8,paddingHorizontal:11,backgroundColor:COLORS.white},chipText:{color:COLORS.depth,fontSize:11,fontWeight:"700"},
  inputRow:{flexDirection:"row",alignItems:"flex-end",gap:8},input:{flex:1,minHeight:46,maxHeight:100,borderWidth:1,borderColor:COLORS.border,borderRadius:18,backgroundColor:COLORS.white,paddingHorizontal:15,paddingVertical:11,color:COLORS.depth,fontSize:13},send:{width:46,height:46,borderRadius:23,backgroundColor:COLORS.link,alignItems:"center",justifyContent:"center"}
});
