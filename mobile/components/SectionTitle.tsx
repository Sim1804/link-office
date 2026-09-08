import { Text, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/theme";

export function SectionTitle({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  eyebrow: { color: COLORS.link, fontSize: 11, fontWeight: "700", letterSpacing: 1.3, marginBottom: 6 },
  title: { color: COLORS.depth, fontSize: 28, lineHeight: 34, fontWeight: "800" },
  description: { color: COLORS.textMuted, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
