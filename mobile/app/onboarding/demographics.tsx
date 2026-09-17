import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { BrandMark } from "@/components/BrandMark";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";
import { AGE_RANGES, DEPARTEMENTS, HABITATIONS, ORG_SIZES, PAYS, SITUATIONS_IMPACTANTES, SITUATIONS_PRO } from "@/data/demographics";
import { useAuth } from "@/context/AuthContext";
import { getDemographics, saveDemographics, Demographics } from "@/services/onboarding";

const GENDERS=["Homme","Femme","Non binaire","Je préfère ne pas le dire"];
const RELATIONSHIPS=["Célibataire","En couple","Séparé(e) / Divorcé(e)","Veuf(ve)"];
const COUPLE_DETAILS=["Marié(e)","Pacsé(e)"];

const initial: Demographics={gender:"",ageRange:"",country:"France",department:"",occupation:"",organizationSize:"",relationshipStatus:"",children:false,childrenCount:0,livingSituation:"",livingSituationOther:"",selectedSituations:[],primarySituation:""};

export default function DemographicsScreen(){
 const{token}=useAuth(); const[form,setForm]=useState<Demographics>(initial); const[coupleDetail,setCoupleDetail]=useState(""); const[busy,setBusy]=useState(false); const[loading,setLoading]=useState(true); const[picker,setPicker]=useState<"country"|"department"|null>(null); const[search,setSearch]=useState("");
 useEffect(()=>{if(!token)return;getDemographics(token).then(r=>{if(r.demographic)setForm({...initial,...r.demographic,selectedSituations:r.demographic.selectedSituations||[]});}).catch(()=>{}).finally(()=>setLoading(false))},[token]);
 const set=(key:keyof Demographics,value:any)=>setForm(f=>({...f,[key]:value}));
 const toggleSituation=(s:string)=>setForm(f=>({...f,selectedSituations:f.selectedSituations.includes(s)?f.selectedSituations.filter(x=>x!==s):f.selectedSituations.length<4?[...f.selectedSituations,s]:f.selectedSituations}));
 const canSubmit=!!form.gender&&!!form.ageRange&&!!form.country&&!!form.occupation&&!!form.relationshipStatus&&!!form.livingSituation;
 const options=picker==="country"?PAYS:DEPARTEMENTS; const filtered=useMemo(()=>options.filter(x=>x.toLowerCase().includes(search.toLowerCase())).slice(0,80),[options,search]);
 const submit=async()=>{if(!token||!canSubmit)return;setBusy(true);try{const payload={...form,relationshipStatus:form.relationshipStatus,department:form.country==="France"?form.department:undefined,organizationSize:["Salarié","Manager","Entrepreneur / Indépendant / Profession libérale / Dirigeant"].includes(form.occupation)?form.organizationSize:undefined};await saveDemographics(token,payload);router.replace("/questionnaire");}catch(e){console.error("DEMOGRAPHICS SAVE ERROR",e);Alert.alert("Enregistrement impossible",e instanceof Error?e.message:"Vérifiez les champs.")}finally{setBusy(false)}};
 if(loading)return <Screen><BrandMark/><Text style={styles.loading}>Préparation de votre profil…</Text></Screen>;
 return <Screen><BrandMark/><View style={styles.header}><View style={styles.icon}><Ionicons name="person-outline" size={24} color={COLORS.link}/></View><View style={{flex:1}}><Text style={styles.title}>Apprenons à vous connaître</Text><Text style={styles.subtitle}>Ces informations permettent de personnaliser votre accompagnement.</Text></View></View>
 <Section n="1" title="Votre genre">{chips(GENDERS,form.gender,v=>set("gender",v))}</Section>
 <Section n="2" title="Votre tranche d'âge">{chips(AGE_RANGES,form.ageRange,v=>set("ageRange",v))}</Section>
 <Section n="3" title="Votre pays de résidence"><PickerButton value={form.country||"Sélectionner"} onPress={()=>{setPicker("country");setSearch("")}}/><Text style={styles.hint}>Le département est demandé uniquement pour la France.</Text>{form.country==="France"&&<PickerButton value={form.department||"Sélectionner votre département"} onPress={()=>{setPicker("department");setSearch("")}}/>}</Section>
 <Section n="4" title="Situation professionnelle">
  {chips(SITUATIONS_PRO,form.occupation,v=>set("occupation",v))}
  {form.occupation==="Autre" ? <TextInput style={styles.input} placeholder="Précisez votre situation" placeholderTextColor="#9AAEAC" value={form.occupation} onChangeText={v=>set("occupation",v)}/> : null}
  {["Salarié","Manager","Entrepreneur / Indépendant / Profession libérale / Dirigeant"].includes(form.occupation) ? <><Text style={styles.label}>Taille de l'organisation</Text>{chips(ORG_SIZES,form.organizationSize||"",v=>set("organizationSize",v))}</> : null}
 </Section>
 <Section n="5" title="Situation sentimentale">{chips(RELATIONSHIPS,form.relationshipStatus,v=>{set("relationshipStatus",v);if(v!=="En couple")setCoupleDetail("")})}{form.relationshipStatus==="En couple"&&<View style={{marginTop:10}}>{chips(COUPLE_DETAILS,coupleDetail,setCoupleDetail)}</View>}</Section>
 <Section n="6" title="Avez-vous des enfants ?">{chips(["Oui","Non"],form.children?"Oui":"Non",v=>{set("children",v==="Oui");if(v!=="Oui")set("childrenCount",0)})}{form.children&&<TextInput style={styles.input} keyboardType="number-pad" placeholder="Nombre d'enfants" placeholderTextColor="#9AAEAC" value={String(form.childrenCount||"")} onChangeText={v=>set("childrenCount",Number(v)||0)}/>}</Section>
 <Section n="7" title="Vous vivez actuellement">{chips(HABITATIONS,form.livingSituation,v=>set("livingSituation",v))}{form.livingSituation==="Autre"&&<TextInput style={styles.input} placeholder="Précisez" placeholderTextColor="#9AAEAC" value={form.livingSituationOther||""} onChangeText={v=>set("livingSituationOther",v)}/>}</Section>
 <Section n="8" title="Situations à fort impact relationnel"><Text style={styles.instruction}>Sélectionnez au maximum 4 situations qui ont aujourd'hui le plus d'impact sur votre qualité de vie relationnelle.</Text><View style={styles.wrap}>{SITUATIONS_IMPACTANTES.map(s=><Pressable key={s} onPress={()=>toggleSituation(s)} style={[styles.chip,form.selectedSituations.includes(s)&&styles.selected]}><Text style={[styles.chipText,form.selectedSituations.includes(s)&&styles.selectedText]}>{s}</Text></Pressable>)}</View>{form.selectedSituations.length>0&&<><Text style={styles.label}>Situation la plus impactante</Text>{chips(form.selectedSituations,form.primarySituation||"",v=>set("primarySituation",v))}</>}</Section>
 <View style={styles.note}><Ionicons name="shield-checkmark-outline" size={18} color={COLORS.link}/><Text style={styles.noteText}>Vous pourrez modifier ces informations plus tard depuis votre profil.</Text></View>
 <Pressable style={[styles.button,(!canSubmit||busy)&&styles.disabled]} disabled={!canSubmit||busy} onPress={submit}><Text style={styles.buttonText}>{busy?"Enregistrement…":"Enregistrer et passer au questionnaire"}</Text><Ionicons name="arrow-forward" size={18} color={COLORS.white}/></Pressable>
 <Modal visible={!!picker} animationType="slide" transparent onRequestClose={()=>setPicker(null)}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.modalHead}><Text style={styles.modalTitle}>{picker==="country"?"Choisir un pays":"Choisir un département"}</Text><Pressable onPress={()=>setPicker(null)}><Ionicons name="close" size={24} color={COLORS.depth}/></Pressable></View><TextInput autoFocus style={styles.input} placeholder="Rechercher…" placeholderTextColor="#9AAEAC" value={search} onChangeText={setSearch}/><View style={{maxHeight:430}}>{filtered.map(x=><Pressable key={x} style={styles.option} onPress={()=>{if(picker==="country"){set("country",x);if(x!=="France")set("department","")}else set("department",x);setPicker(null)}}><Text style={styles.optionText}>{x}</Text>{((picker==="country"?form.country:form.department)===x)&&<Ionicons name="checkmark" size={18} color={COLORS.link}/>}</Pressable>)}</View></View></View></Modal>
 </Screen>
}
function chips(options: readonly string[], value: string, onChange: (v: string) => void) {
 return (
  <View style={styles.wrap}>
   {options.map((option) => (
    <Pressable key={option} onPress={() => onChange(option)} style={[styles.chip, value === option ? styles.selected : undefined]}>
     <Text style={[styles.chipText, value === option ? styles.selectedText : undefined]}>{option}</Text>
    </Pressable>
   ))}
  </View>
 );
}
function Section({n,title,children}:{n:string;title:string;children:React.ReactNode}){return <View style={styles.card}><View style={styles.sectionTitle}><View style={styles.badge}><Text style={styles.badgeText}>{n}</Text></View><Text style={styles.heading}>{title}</Text></View>{children}</View>}
function PickerButton({value,onPress}:{value:string;onPress:()=>void}){return <Pressable style={styles.picker} onPress={onPress}><Text style={styles.pickerText}>{value}</Text><Ionicons name="chevron-down" size={18} color={COLORS.textMuted}/></Pressable>}
const styles=StyleSheet.create({loading:{color:COLORS.textMuted,textAlign:"center",marginTop:50},header:{flexDirection:"row",alignItems:"center",gap:13,marginVertical:24},icon:{width:50,height:50,borderRadius:16,backgroundColor:COLORS.serenity,alignItems:"center",justifyContent:"center"},title:{color:COLORS.depth,fontSize:25,fontWeight:"800"},subtitle:{color:COLORS.textMuted,fontSize:12,lineHeight:18,marginTop:4},card:{backgroundColor:COLORS.white,borderRadius:RADIUS.lg,padding:17,marginBottom:12,...SHADOW.card},sectionTitle:{flexDirection:"row",alignItems:"center",gap:10,marginBottom:14},badge:{width:27,height:27,borderRadius:14,backgroundColor:COLORS.serenity,alignItems:"center",justifyContent:"center"},badgeText:{color:COLORS.link,fontSize:11,fontWeight:"900"},heading:{color:COLORS.depth,fontSize:15,fontWeight:"800"},wrap:{flexDirection:"row",flexWrap:"wrap",gap:8},chip:{borderWidth:1,borderColor:COLORS.border,backgroundColor:"#FBFCFA",borderRadius:13,paddingHorizontal:12,paddingVertical:10},selected:{backgroundColor:"#DFF2ED",borderColor:COLORS.link},chipText:{color:COLORS.textMuted,fontSize:11,fontWeight:"600"},selectedText:{color:COLORS.depth,fontWeight:"800"},label:{color:COLORS.depth,fontSize:11,fontWeight:"800",marginTop:14,marginBottom:8},input:{height:48,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.md,paddingHorizontal:13,color:COLORS.depth,fontSize:12,backgroundColor:"#FBFCFA",marginTop:9},picker:{height:49,borderWidth:1,borderColor:COLORS.border,borderRadius:RADIUS.md,paddingHorizontal:13,flexDirection:"row",alignItems:"center",justifyContent:"space-between",backgroundColor:"#FBFCFA",marginBottom:8},pickerText:{color:COLORS.depth,fontSize:12},hint:{color:COLORS.textMuted,fontSize:10,lineHeight:15,marginBottom:9},instruction:{color:COLORS.textMuted,fontSize:11,lineHeight:17,marginBottom:12},note:{backgroundColor:COLORS.serenity,borderRadius:RADIUS.md,padding:13,flexDirection:"row",gap:8,alignItems:"center",marginTop:4},noteText:{flex:1,color:COLORS.textMuted,fontSize:10,lineHeight:15},button:{backgroundColor:COLORS.link,borderRadius:RADIUS.pill,paddingVertical:15,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:8,marginTop:14},disabled:{opacity:.4},buttonText:{color:COLORS.white,fontSize:13,fontWeight:"800"},modalBackdrop:{flex:1,backgroundColor:"rgba(18,61,70,.32)",justifyContent:"flex-end"},modal:{backgroundColor:COLORS.ivory,borderTopLeftRadius:28,borderTopRightRadius:28,padding:20,paddingBottom:32},modalHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},modalTitle:{color:COLORS.depth,fontSize:19,fontWeight:"800"},option:{backgroundColor:COLORS.white,borderBottomWidth:1,borderBottomColor:COLORS.border,padding:13,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},optionText:{color:COLORS.depth,fontSize:12}}
);
