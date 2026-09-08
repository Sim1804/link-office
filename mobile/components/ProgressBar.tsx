import { View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export function ProgressBar({ value, color = COLORS.link }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color }]} />
    </View>
  );
}
const styles = StyleSheet.create({
  track: { height: 7, backgroundColor: "#DDE7E4", borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
});
