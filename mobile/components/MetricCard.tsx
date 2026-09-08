import { PropsWithChildren } from "react";
import { Text, View, StyleSheet } from "react-native";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";

export function MetricCard({ label, value, caption, accent = COLORS.link, children }: PropsWithChildren<{ label: string; value: string; caption?: string; accent?: string }>) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 120, backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: 16, ...SHADOW.card },
  accent: { width: 30, height: 4, borderRadius: 99, marginBottom: 14 },
  label: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600", marginBottom: 5 },
  value: { color: COLORS.depth, fontSize: 28, fontWeight: "800" },
  caption: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, lineHeight: 16 },
});
