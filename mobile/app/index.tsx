import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { COLORS } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
export default function Index() {
  const { loading, user, status } = useAuth();
  if (loading) return <View style={{ flex: 1, backgroundColor: COLORS.ivory, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={COLORS.link} /></View>;
  if (!user) return <Redirect href="/welcome" />;
  if (user.mustChangePassword) return <Redirect href="/auth/change-password" />;
  if (!status?.hasConsent) return <Redirect href="/onboarding/consent" />;
  if (!status.hasCompletedDemographics) return <Redirect href="/onboarding/demographics" />;
  return <Redirect href="/(tabs)" />;
}
