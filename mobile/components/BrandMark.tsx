import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.network}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
        <View style={styles.line1} />
        <View style={styles.line2} />
      </View>
      <View>
        <Text style={[styles.logo, compact && styles.logoCompact]}>
          LiNK
        </Text>
        <Text style={[styles.office, compact && styles.officeCompact]}>OFFICE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 9 },
  network: { width: 31, height: 31, position: "relative" },
  dot: { width: 7, height: 7, borderRadius: 7, position: "absolute" },
  dot1: { backgroundColor: COLORS.link, top: 3, left: 12 },
  dot2: { backgroundColor: COLORS.action, bottom: 5, left: 3 },
  dot3: { backgroundColor: COLORS.energy, right: 2, top: 15 },
  line1: { position: "absolute", height: 1, width: 25, backgroundColor: COLORS.border, top: 15, left: 3, transform: [{ rotate: "-28deg" }] },
  line2: { position: "absolute", height: 1, width: 23, backgroundColor: COLORS.border, top: 19, left: 4, transform: [{ rotate: "26deg" }] },
  logo: { color: COLORS.depth, fontSize: 25, lineHeight: 26, fontWeight: "700", letterSpacing: 2.3 },
  logoCompact: { fontSize: 21 },
  office: { color: COLORS.depth, fontSize: 9, letterSpacing: 4.8, fontWeight: "500", marginLeft: 2, marginTop: 1 },
  officeCompact: { fontSize: 8 },
});
