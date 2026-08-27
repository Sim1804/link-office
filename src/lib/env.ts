/**
 * @file env.ts
 * @module lib
 * @description Validation et export typé des variables d'environnement de l'application.
 *
 * Ce module est exécuté au démarrage du serveur Node.js. Son rôle est de :
 * 1. Valider que toutes les variables d'environnement requises sont présentes
 * 2. Valider leur format (URL valide, longueur minimale, valeurs énumérées)
 * 3. Faire planter l'application immédiatement en production si une variable est manquante,
 *    plutôt que d'obtenir des erreurs cryptiques plus tard à l'exécution
 *
 * UTILISATION :
 * @example
 * import { env } from "@/lib/env";
 * const apiKey = env.GROQ_API_KEY; // Typé, pas de risque de undefined
 *
 * CONFIGURATION REQUISE (fichier `.env.local`) :
 * @example
 * DATABASE_URL="postgresql://..."
 * NEXTAUTH_SECRET="une-chaine-secrete-d-au-moins-32-caracteres"
 * NEXTAUTH_URL="http://localhost:3000"
 * GROQ_API_KEY="gsk_..."   # Optionnel en développement sans IRIS
 *
 * @see .env.example — Fichier modèle à copier pour configurer l'environnement local
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SCHÉMA DE VALIDATION DES VARIABLES D'ENVIRONNEMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma Zod définissant les variables d'environnement attendues.
 * Toute nouvelle variable d'environnement doit être ajoutée ici pour être typée.
 */
const envSchema = z.object({
  /** URL de connexion à la base PostgreSQL (ex: postgresql://user:pass@host:5432/dbname) */
  DATABASE_URL: z.string().url("DATABASE_URL doit être une URL PostgreSQL valide"),

  /** Clé secrète NextAuth (minimum 32 caractères). Générer avec : `openssl rand -base64 32` */
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET doit faire au moins 32 caractères"),

  /** URL publique de l'application (utilisée par NextAuth pour les callbacks OAuth) */
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL doit être une URL valide"),

  /**
   * Clé API Groq pour le LLM d'IRIS.
   * Optionnelle pour développer sans la fonctionnalité IRIS.
   * Obtenir sur : https://console.groq.com
   */
  GROQ_API_KEY: z.string().min(1, "GROQ_API_KEY est requis pour IRIS").optional(),

  /** Environnement d'exécution (valeur injectée automatiquement par Node.js/Next.js) */
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION AU DÉMARRAGE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valide les variables d'environnement au démarrage du serveur.
 *
 * Comportement selon l'environnement :
 * - En production  : Lance une erreur fatale si une variable est manquante (fail-fast)
 * - En développement : Affiche les erreurs dans la console mais continue (permissif)
 *
 * @returns Les variables d'environnement validées et typées
 * @throws {Error} En production uniquement, si la validation échoue
 */
function validateEnv() {
  const parseResult = envSchema.safeParse(process.env);

  if (!parseResult.success) {
    console.error("❌ Variables d'environnement invalides ou manquantes :");
    parseResult.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });

    // En production, on refuse de démarrer avec une configuration incomplète
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Configuration d'environnement invalide. Arrêt du serveur."
      );
    }
  }

  // En développement, on retourne les variables même si invalides pour ne pas bloquer
  return parseResult.data ?? (process.env as unknown as z.infer<typeof envSchema>);
}

/**
 * Variables d'environnement validées et typées, prêtes à l'usage.
 * Utilisez cet objet partout dans l'application au lieu de `process.env` directement.
 */
export const env = validateEnv();
