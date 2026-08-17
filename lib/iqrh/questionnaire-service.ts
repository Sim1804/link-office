/**
 * @file questionnaire-service.ts
 * @module lib/iqrh
 * @description Service gérant le cycle de vie complet d'une évaluation IQRH (Assessment).
 *
 * Ce service couvre les 3 phases du questionnaire :
 * 1. `getDefinition()` — Chargement des questions et modules adaptatifs depuis la BDD
 * 2. `start()` — Initialisation ou reprise d'un brouillon d'évaluation
 * 3. `save()` — Sauvegarde progressive des consentements, données démographiques et réponses
 *
 * La soumission finale (calcul des scores) est gérée par `ResultService.submit()`.
 *
 * @see lib/iqrh/schemas.ts — Validation Zod des données entrantes (`saveSchema`)
 * @see lib/iqrh/result-service.ts — Soumission finale et calcul des résultats
 * @see app/api/questionnaire/ — Routes API qui appellent ces méthodes
 */

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { saveSchema } from "./schemas";

/**
 * Service de gestion du questionnaire IQRH.
 * Coordonne la persistance des réponses sans effectuer de calculs.
 */
export class QuestionnaireService {
  // ─────────────────────────────────────────────────────────────────────────
  // CHARGEMENT DE LA DÉFINITION DU QUESTIONNAIRE
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Récupère la définition complète du questionnaire depuis la base de données.
   *
   * Retourne deux éléments :
   * - Les 30 questions standard (ordonnées par position) avec leur dimension IQRH
   * - Les modules adaptatifs avec leurs questions conditionnelles
   *
   * Les modules adaptatifs s'affichent en fonction du profil démographique
   * (ex: "Module Parent", "Module Manager", "Module Aidant").
   *
   * @returns Objet `{ questions, modules }` — questions Likert + modules adaptatifs
   *
   * @example
   * const { questions, modules } = await QuestionnaireService.getDefinition();
   * console.log(questions.length); // 30
   * console.log(modules.map(m => m.name)); // ["Module Parent", "Module Aidant", ...]
   */
  static async getDefinition() {
    const standardQuestions = await prisma.question.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        text: true,
        dimension: true,
        position: true,
      },
    });

    const adaptiveModules = await prisma.adaptiveModule.findMany({
      orderBy: { position: "asc" },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });

    return { questions: standardQuestions, modules: adaptiveModules };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DÉMARRAGE / REPRISE D'UNE ÉVALUATION
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Initialise un nouveau brouillon d'évaluation (DRAFT) ou retourne le brouillon
   * existant si l'utilisateur a déjà commencé le questionnaire.
   *
   * Comportement :
   * - Si un Assessment en statut "DRAFT" existe pour cet utilisateur → le retourne
   * - Sinon → crée un nouvel Assessment vide
   *
   * @note En production, l'utilisateur existe déjà via NextAuth. L'`upsert` de
   * l'utilisateur ci-dessous est conservé pour la compatibilité avec les environnements
   * de développement où un ID utilisateur sans compte peut être passé (ex: demo-user).
   *
   * @param userId - L'identifiant de l'utilisateur (UUID depuis NextAuth)
   * @returns L'Assessment DRAFT existant ou nouvellement créé
   */
  static async start(userId: string) {
    // Garantie d'existence de l'utilisateur (fallback pour les tests locaux)
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email: `${userId}@fallback.com`,
        firstName: "Utilisateur",
        lastName: "Local",
      },
      update: {},
    });

    // Recherche d'un brouillon existant (le plus récent en cas de multiples)
    const existingDraftAssessment = await prisma.assessment.findFirst({
      where: { userId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    });

    if (existingDraftAssessment) {
      return existingDraftAssessment;
    }

    // Aucun brouillon trouvé → création d'un nouveau
    return prisma.assessment.create({
      data: { userId },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SAUVEGARDE PROGRESSIVE DES RÉPONSES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sauvegarde les données du questionnaire dans une transaction atomique.
   *
   * Cette méthode peut être appelée plusieurs fois (sauvegarde automatique).
   * Elle utilise des `upsert` pour être idempotente : appeler deux fois avec
   * les mêmes données ne crée pas de doublons.
   *
   * Étapes de la transaction :
   * 1. Mise à jour des consentements sur l'Assessment
   * 2. Upsert du profil démographique (si fourni)
   * 3. Upsert des réponses aux 30 questions standard (en parallèle)
   * 4. Upsert des réponses aux questions adaptatives (en parallèle)
   *
   * @param input - Données brutes non validées (seront parsées par saveSchema)
   * @returns L'Assessment mis à jour
   * @throws {ZodError} Si les données ne respectent pas le schéma `saveSchema`
   * @throws {PrismaClientKnownRequestError} Si l'assessmentId est introuvable
   */
  static async save(input: unknown) {
    // Validation des données d'entrée via Zod (lance ZodError si invalide)
    const validatedData = saveSchema.parse(input);

    return prisma.$transaction(async (transactionClient: Prisma.TransactionClient) => {

      // ── Étape 1 : Mise à jour des consentements ─────────────────────────
      const updatedAssessment = await transactionClient.assessment.update({
        where: { id: validatedData.assessmentId },
        data: {
          consentInformation: validatedData.consentInformation,
          consentResearch: validatedData.consentResearch,
          consentParticipation: validatedData.consentParticipation,
        },
      });

      // ── Étape 2 : Profil démographique (optionnel) ─────────────────────
      if (validatedData.demographic) {
        const demographicPayload = {
          ...validatedData.demographic,
          department: validatedData.demographic.department || null,
          organizationSize: validatedData.demographic.organizationSize || null,
          childrenCount: validatedData.demographic.childrenCount ?? null,
          livingSituationOther: validatedData.demographic.livingSituationOther || null,
          primarySituation: validatedData.demographic.primarySituation || null,
        };

        await transactionClient.demographicProfile.upsert({
          where: { assessmentId: updatedAssessment.id },
          create: { assessmentId: updatedAssessment.id, ...demographicPayload },
          update: demographicPayload,
        });
      }

      // ── Étape 3 : Réponses aux 30 questions IQRH (en parallèle) ────────
      await Promise.all(
        validatedData.answers.map((answer) =>
          transactionClient.questionnaireAnswer.upsert({
            where: {
              assessmentId_questionId: {
                assessmentId: updatedAssessment.id,
                questionId: answer.questionId,
              },
            },
            create: { assessmentId: updatedAssessment.id, ...answer },
            update: { value: answer.value },
          })
        )
      );

      // ── Étape 4 : Réponses aux modules adaptatifs (en parallèle) ────────
      await Promise.all(
        validatedData.adaptiveAnswers.map((answer) =>
          transactionClient.adaptiveAnswer.upsert({
            where: {
              assessmentId_adaptiveQuestionId: {
                assessmentId: updatedAssessment.id,
                adaptiveQuestionId: answer.questionId,
              },
            },
            create: {
              assessmentId: updatedAssessment.id,
              adaptiveQuestionId: answer.questionId,
              value: answer.value,
            },
            update: { value: answer.value },
          })
        )
      );

      return updatedAssessment;
    });
  }
}
