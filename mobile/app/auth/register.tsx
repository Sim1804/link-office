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

type FormState = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  codeAccess: string;
};

export default function RegisterScreen() {
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    prenom: "",
    nom: "",
    email: "",
    password: "",
    codeAccess: "",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set =
    (key: keyof FormState) =>
    (value: string) => {
      setForm((current) => ({
        ...current,
        [key]: value,
      }));

      if (error) {
        setError("");
      }
    };

  const submit = async () => {
    if (busy) return;

    setError("");

    const prenom = form.prenom.trim();
    const nom = form.nom.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!prenom || !nom || !email || !password) {
      setError(
        "Complétez votre prénom, votre nom, votre email et votre mot de passe."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError(
        "Le mot de passe doit contenir au moins une majuscule."
      );
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError(
        "Le mot de passe doit contenir au moins un chiffre."
      );
      return;
    }

    setBusy(true);

    try {
      await register({
        prenom,
        nom,
        email,
        password,
        codeAccess: form.codeAccess.trim() || undefined,
      });

      router.replace("/");
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Impossible de créer le compte. Réessayez.";

      console.error("[REGISTER]", e);
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
          Créez votre compte
        </Text>

        <Text style={styles.subtitle}>
          Votre parcours commence par quelques informations simples.
        </Text>
      </View>

      <View style={styles.card}>
        <Field
          label="Prénom"
          value={form.prenom}
          set={set("prenom")}
          placeholder="Marie"
        />

        <Field
          label="Nom"
          value={form.nom}
          set={set("nom")}
          placeholder="Dupont"
        />

        <Field
          label="Email"
          value={form.email}
          set={set("email")}
          placeholder="vous@exemple.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Field
          label="Mot de passe"
          value={form.password}
          set={set("password")}
          placeholder="8 caractères minimum"
          secure
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Field
          label="Code d'accès (facultatif)"
          value={form.codeAccess}
          set={set("codeAccess")}
          placeholder="Fourni par votre organisation"
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
          onPress={submit}
          disabled={busy}
        >
          <Text style={styles.buttonText}>
            {busy ? "Création…" : "Créer mon compte"}
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

      <Text style={styles.legal}>
        En créant votre compte, vous pourrez accéder à votre
        évaluation et à vos résultats personnels.
      </Text>

      <Pressable
        onPress={() => router.push("/auth/login")}
        disabled={busy}
      >
        <Text style={styles.switch}>
          Déjà un compte ?{" "}
          <Text
            style={{
              color: COLORS.link,
              fontWeight: "800",
            }}
          >
            Se connecter
          </Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

function Field({
  label,
  value,
  set,
  placeholder,
  secure,
  keyboardType,
  autoCapitalize,
  autoCorrect,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  placeholder: string;
  secure?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={set}
        placeholder={placeholder}
        placeholderTextColor="#9AAEAC"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: 26,
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
    marginBottom: 14,
  },

  label: {
    color: COLORS.depth,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: "#FBFCFA",
    paddingHorizontal: 13,
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
    marginTop: 3,
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

  legal: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 15,
  },

  switch: {
    textAlign: "center",
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 17,
  },
});
