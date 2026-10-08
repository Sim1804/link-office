/**
 * @file safety.ts
 * @module lib/iris/safety
 * @description Filtre de sécurité programmatique d'entrée et de sortie pour IRIS.
 *
 * Exécute une validation stricte :
 * 1. En entrée : détection de détresse / crise (3114, 15), demande médicale (diagnostic, médicament),
 *    hors périmètre (code, mathématiques, etc.) et tentatives d'injection de consigne (jailbreak).
 *    Pour les cas de crise ou hors périmètre, renvoie une réponse d'escalade SANS appeler le LLM.
 * 2. En sortie : contrôle des réponses du modèle pour interdire la prescription médicamenteuse hallucinée.
 * 3. Journalisation systématique des incidents de sécurité sans enregistrer de contenu utilisateur sensible.
 */

import safetyConfig from "./safety-config.json";
import { EventLogger } from "@/lib/logger";

/**
 * Quota journalier pour les comptes Freemium (5 requêtes par jour calendaire UTC).
 */
export const IRIS_DAILY_QUOTA_FREEMIUM = 5;

export type SafetyCategory = "CRISIS" | "MEDICAL" | "OFF_TOPIC" | "JAILBREAK";

export interface SafetyCheckResult {
  safe: boolean;
  category?: SafetyCategory;
  escalationResponse?: string;
  shouldCallLlm: boolean;
  matchedPattern?: string;
}

export interface OutputSafetyResult {
  safe: boolean;
  sanitizedContent?: string;
  flaggedTerms?: string[];
}

/**
 * Normalise un texte pour l'analyse par expressions régulières (minuscules, normalisation Unicode).
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Évalue la sécurité d'un message utilisateur en entrée AVANT tout appel au LLM.
 */
export function evaluateInputSafety(content: string): SafetyCheckResult {
  const normalized = normalizeText(content);

  // 1. Détection de détresse vitale / Crise (Priorité absolue)
  for (const pattern of safetyConfig.crisisPatterns) {
    const regex = new RegExp(`\\b${normalizeText(pattern)}`, "i");
    if (regex.test(normalized)) {
      return {
        safe: false,
        category: "CRISIS",
        escalationResponse: safetyConfig.escalationResponses.crisis,
        shouldCallLlm: false,
        matchedPattern: pattern,
      };
    }
  }

  // 2. Détection de demande médicale stricte / Médicaments
  for (const pattern of safetyConfig.medicalPatterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(normalized) || new RegExp(normalizeText(pattern), "i").test(normalized)) {
      return {
        safe: false,
        category: "MEDICAL",
        escalationResponse: safetyConfig.escalationResponses.medical,
        shouldCallLlm: false,
        matchedPattern: pattern,
      };
    }
  }

  // 3. Détection de tentatives de contournement / Injection de consigne
  for (const pattern of safetyConfig.jailbreakPatterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(normalized) || new RegExp(normalizeText(pattern), "i").test(normalized)) {
      return {
        safe: false,
        category: "JAILBREAK",
        escalationResponse: safetyConfig.escalationResponses.jailbreak,
        shouldCallLlm: false,
        matchedPattern: pattern,
      };
    }
  }

  // 4. Détection de requêtes hors périmètre (code informatique, cuisine, maths, etc.)
  for (const pattern of safetyConfig.offTopicPatterns) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(normalized) || new RegExp(normalizeText(pattern), "i").test(normalized)) {
      return {
        safe: false,
        category: "OFF_TOPIC",
        escalationResponse: safetyConfig.escalationResponses.offTopic,
        shouldCallLlm: false,
        matchedPattern: pattern,
      };
    }
  }

  return {
    safe: true,
    shouldCallLlm: true,
  };
}

/**
 * Vérifie la sortie générée par le modèle pour interdire les diagnostics ou prescriptions non autorisées.
 */
export function evaluateOutputSafety(reply: string): OutputSafetyResult {
  const normalized = normalizeText(reply);
  const flaggedTerms: string[] = [];

  for (const term of safetyConfig.outputProhibitedTerms) {
    if (normalized.includes(normalizeText(term))) {
      flaggedTerms.push(term);
    }
  }

  if (flaggedTerms.length > 0) {
    return {
      safe: false,
      sanitizedContent:
        "En tant que coach relationnel LinkOffice, je vous accompagne sur votre bien-être au travail et vos relations. Pour toute question médicale ou prescription, je vous oriente vers votre médecin traitant.",
      flaggedTerms,
    };
  }

  return {
    safe: true,
  };
}

/**
 * Journalise les événements de sécurité sans conserver le texte intégral sensible de l'utilisateur.
 */
export async function logSecurityEvent(
  userId: string,
  category: SafetyCategory,
  metadata: { matchedPattern?: string; conversationId?: string } = {}
): Promise<void> {
  await EventLogger.log({
    userId,
    eventType: `iris_safety_incident`,
    eventData: {
      category,
      matchedPattern: metadata.matchedPattern,
      conversationId: metadata.conversationId,
      timestamp: new Date().toISOString(),
    },
  });
}
