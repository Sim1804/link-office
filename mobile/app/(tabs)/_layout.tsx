import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  evaluation: "clipboard-outline",
  resultats: "analytics-outline",
  iris: "sparkles-outline",
  profil: "person-outline",
};

export default function TabsLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: COLORS.link,
      tabBarInactiveTintColor: "#789096",
      tabBarStyle: {
        height: 72,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: COLORS.white,
        borderTopColor: COLORS.border,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] || "ellipse-outline"} size={size} color={color} />,
    })}>
      <Tabs.Screen name="index" options={{ title: "Accueil" }} />
      <Tabs.Screen name="evaluation" options={{ title: "Évaluation" }} />
      <Tabs.Screen name="resultats" options={{ title: "Résultats" }} />
      <Tabs.Screen name="iris" options={{ title: "IRIS" }} />
      <Tabs.Screen name="profil" options={{ title: "Profil" }} />
    </Tabs>
  );
}
