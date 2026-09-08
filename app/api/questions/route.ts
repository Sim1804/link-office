/**
 * @file route.ts
 * @module app/api/questions
 * @description Route API pour charger la définition complète du questionnaire IQRH.
 *
 * Retourne les 30 questions standard et les modules adaptatifs avec leurs questions.
 * Cette route est appelée au chargement de la page questionnaire pour initialiser
 * l'interface avant que l'utilisateur commence à répondre.
 *
 * @method GET
 * @returns {{ questions: Question[], modules: AdaptiveModule[] }}
 *   - questions : Les 30 questions Likert ordonnées par position
 *   - modules : Les modules adaptatifs avec leurs questions conditionnelles
 *
 * @see lib/iqrh/questionnaire-service.ts — Méthode `getDefinition()` utilisée ici
 */

import { NextResponse } from "next/server";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";

/**
 * Retourne la définition complète du questionnaire IQRH (questions + modules adaptatifs).
 * Route publique (aucune authentification requise — les questions ne sont pas sensibles).
 */
export async function GET() {
  return NextResponse.json(await QuestionnaireService.getDefinition());
}
