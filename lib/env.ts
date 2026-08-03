/**
 * lib/env.ts — Validation des variables d'environnement
 * ─────────────────────────────────────────────────────────
 * Valide toutes les variables requises au démarrage.
 * L'application plantera avec un message clair si une variable est manquante.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL doit être une URL PostgreSQL valide"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET doit faire au moins 32 caractères"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL doit être une URL valide"),
  GROQ_API_KEY: z
    .string()
    .min(1, "GROQ_API_KEY est requis pour IRIS")
    .optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Variables d'environnement invalides ou manquantes :");
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    // En production, on fait planter l'app pour éviter un démarrage silencieusement cassé
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Configuration d'environnement invalide. Arrêt du serveur."
      );
    }
  }

  return parsed.data ?? (process.env as unknown as z.infer<typeof envSchema>);
}

export const env = validateEnv();
