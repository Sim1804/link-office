/**
 * @file schemas.ts
 * @module lib/iqrh
 * @description Schémas de validation Zod pour toutes les données entrantes du questionnaire IQRH.
 *
 * Ces schémas sont partagés entre le backend (routes API) et le frontend (formulaires)
 * pour garantir une validation cohérente. Tout changement ici impacte directement :
 * - `app/api/questionnaire/save/route.ts` — Sauvegarde intermédiaire des réponses
 * - `app/api/questionnaire/submit/route.ts` — Soumission finale
 * - `app/questionnaire/page.tsx` — Formulaire de questionnaire
 *
 * @see https://zod.dev — Documentation de la librairie Zod
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// ÉCHELLE DE LIKERT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma de validation pour une réponse sur l'échelle de Likert.
 * L'IQRH utilise une échelle à 5 points (1 = "Pas du tout" → 5 = "Tout à fait").
 *
 * @example z.parse(3) → 3 ✅
 * @example z.parse(0) → ZodError ❌ (< 1)
 * @example z.parse(6) → ZodError ❌ (> 5)
 */
export const likertSchema = z.number().int().min(1).max(5);

// ─────────────────────────────────────────────────────────────────────────────
// PROFIL DÉMOGRAPHIQUE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma de validation du profil démographique de l'utilisateur.
 * Collecté à l'étape "Qui êtes-vous ?" avant le questionnaire de 30 questions.
 *
 * Règles de validation croisées (via `.superRefine`) :
 * - Le département est obligatoire si le pays est "France"
 * - La taille de l'organisation est obligatoire pour les salariés/managers/entrepreneurs
 * - Le nombre d'enfants est obligatoire si `children` est `true`
 * - La situation principale (`primarySituation`) doit figurer dans `selectedSituations`
 *
 * @example
 * demographicSchema.safeParse({
 *   gender: "Homme",
 *   ageRange: "30-39",
 *   country: "France",
 *   department: "75",
 *   occupation: "Salarié",
 *   organizationSize: "50-249",
 *   relationshipStatus: "En couple",
 *   children: true,
 *   childrenCount: 2,
 *   livingSituation: "En couple sans enfants à la maison",
 *   selectedSituations: ["Parent", "Manager"],
 *   primarySituation: "Parent",
 * });
 */
export const demographicSchema = z.object({
  /** Genre déclaré par l'utilisateur */
  gender: z.string().min(1),
  /** Tranche d'âge (ex: "30-39", "40-49") */
  ageRange: z.string().min(1),
  /** Pays de résidence */
  country: z.string().min(1),
  /** Département français — obligatoire si country === "France" */
  department: z.string().optional(),
  /** Situation professionnelle principale */
  occupation: z.string().min(1),
  /** Taille de l'organisation — obligatoire pour les profils actifs */
  organizationSize: z.string().optional(),
  /** Statut de relation sentimentale */
  relationshipStatus: z.string().min(1),
  /** Indicateur binaire : l'utilisateur a-t-il des enfants ? */
  children: z.boolean(),
  /** Nombre d'enfants — obligatoire si children === true */
  childrenCount: z.number().int().min(0).optional(),
  /** Situation de vie actuelle (ex: "En couple sans enfants", "Seul(e)") */
  livingSituation: z.string().min(1),
  /** Précision libre si livingSituation === "Autre" */
  livingSituationOther: z.string().optional(),
  /** Jusqu'à 4 situations de vie spécifiques cochées par l'utilisateur */
  selectedSituations: z.array(z.string()).max(4),
  /** La situation jugée la plus impactante par l'utilisateur (doit être dans selectedSituations) */
  primarySituation: z.string().optional(),
}).superRefine((value, context) => {
  // Règle 1 : Département obligatoire en France
  if (value.country === "France" && !value.department) {
    context.addIssue({ code: "custom", path: ["department"], message: "Le département est obligatoire en France." });
  }

  // Règle 2 : Taille d'organisation obligatoire pour les actifs
  const occupationsRequiringOrgSize = [
    "Salarié",
    "Manager",
    "Entrepreneur / Indépendant / Profession libérale / Dirigeant",
  ];
  if (occupationsRequiringOrgSize.includes(value.occupation) && !value.organizationSize) {
    context.addIssue({ code: "custom", path: ["organizationSize"], message: "La taille de l'organisation est obligatoire." });
  }

  // Règle 3 : Nombre d'enfants obligatoire si enfants déclarés
  if (value.children && value.childrenCount === undefined) {
    context.addIssue({ code: "custom", path: ["childrenCount"], message: "Le nombre d'enfants est obligatoire." });
  }

  // Règle 4 : La situation principale doit être parmi les situations sélectionnées
  if (value.primarySituation && !value.selectedSituations.includes(value.primarySituation)) {
    context.addIssue({ code: "custom", path: ["primarySituation"], message: "La situation principale doit être sélectionnée." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DÉMARRAGE DU QUESTIONNAIRE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma de validation pour démarrer une nouvelle évaluation (Assessment).
 * Utilisé par `POST /api/questionnaire/start`.
 */
export const startSchema = z.object({
  /** Identifiant de l'utilisateur qui démarre l'évaluation */
  userId: z.string().min(1),
});

// ─────────────────────────────────────────────────────────────────────────────
// SAUVEGARDE DES RÉPONSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Schéma de validation pour la sauvegarde intermédiaire ou définitive des réponses.
 * Utilisé par `POST /api/questionnaire/save` et `POST /api/questionnaire/submit`.
 *
 * Inclut :
 * - Les consentements (obligatoires pour soumettre)
 * - Le profil démographique (optionnel à la sauvegarde, obligatoire pour la soumission)
 * - Les réponses au questionnaire standard (30 questions Likert)
 * - Les réponses au questionnaire adaptatif (questions conditionnelles selon le profil)
 */
export const saveSchema = z.object({
  /** Identifiant unique de l'évaluation (Assessment) en cours */
  assessmentId: z.string().min(1),
  /** Consentement à être informé du traitement des données */
  consentInformation: z.boolean(),
  /** Consentement à la participation à la recherche scientifique */
  consentResearch: z.boolean(),
  /** Consentement à la participation aux programmes de prévention */
  consentParticipation: z.boolean(),
  /** Profil démographique de l'utilisateur (optionnel pour la sauvegarde) */
  demographic: demographicSchema.optional(),
  /** Tableau des réponses aux 30 questions Likert standard */
  answers: z.array(z.object({
    /** Identifiant unique de la question */
    questionId: z.string(),
    /** Valeur de réponse sur l'échelle de Likert (1–5) */
    value: likertSchema,
  })),
  /** Tableau des réponses au questionnaire adaptatif (questions spécifiques au profil) */
  adaptiveAnswers: z.array(z.object({
    /** Identifiant unique de la question adaptative */
    questionId: z.string(),
    /** Valeur de réponse sur l'échelle de Likert (1–5) */
    value: likertSchema,
  })),
});
