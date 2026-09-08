import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/context/AuthContext";
import { COLORS } from "@/constants/theme";

export default function RootLayout() {
  return <AuthProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown:false, contentStyle:{backgroundColor:COLORS.ivory}, animation:"slide_from_right" }}><Stack.Screen name="index"/><Stack.Screen name="welcome"/><Stack.Screen name="auth/login"/><Stack.Screen name="auth/register"/><Stack.Screen name="auth/change-password"/><Stack.Screen name="onboarding/consent"/><Stack.Screen name="onboarding/demographics"/><Stack.Screen name="(tabs)"/><Stack.Screen name="questionnaire"/></Stack></AuthProvider>;
}
