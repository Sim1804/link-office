import { router } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BrandMark } from "@/components/BrandMark";
import { Screen } from "@/components/Screen";
import { COLORS, RADIUS, SHADOW } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (busy) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError(
        "Renseignez votre adresse email et votre mot de passe."
      );
      return;
    }

    setBusy(true);

    try {
      await login(cleanEmail, password);
      router.replace("/");
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Vérifiez vos identifiants et réessayez.";

      console.error("[LOGIN]", e);
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <BrandMark />

      <View style={styles.header}>
        <Text style={styles.title}>
          Bon retour parmi nous
        </Text>

        <Text style={styles.subtitle}>
          Connectez-vous pour retrouver votre parcours Link Office.
        </Text>
      </View>

      <View style={styles.card}>
        <Field
          icon="mail-outline"
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Field
          icon="lock-closed-outline"
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={COLORS.link}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        ) : null}

        <Pressable
          style={[
            styles.button,
            busy && styles.buttonDisabled,
          ]}
          disabled={busy}
          onPress={submit}
        >
          <Text style={styles.buttonText}>
            {busy ? "Connexion…" : "Se connecter"}
          </Text>

          {!busy && (
            <Ionicons
              name="arrow-forward"
              size={18}
              color={COLORS.white}
            />
          )}
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push("/auth/register")}
        disabled={busy}
      >
        <Text style={styles.switch}>
          Pas encore de compte ?{" "}
          <Text
            style={{
              color: COLORS.link,
              fontWeight: "800",
            }}
          >
            Créer un compte
          </Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: {
  icon: any;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputWrap}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.textMuted}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AAEAC"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 28,
  },

  title: {
    color: COLORS.depth,
    fontSize: 29,
    fontWeight: "800",
  },

  subtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 20,
    ...SHADOW.card,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    color: COLORS.depth,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  inputWrap: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: "#FBFCFA",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  input: {
    flex: 1,
    color: COLORS.depth,
    fontSize: 13,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FFF3F1",
    borderWidth: 1,
    borderColor: "#F1C7C1",
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#A53B30",
    fontSize: 12,
    lineHeight: 18,
  },

  button: {
    marginTop: 4,
    backgroundColor: COLORS.link,
    borderRadius: RADIUS.pill,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },

  switch: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 20,
  },
});
