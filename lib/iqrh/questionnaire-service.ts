import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { saveSchema } from "./schemas";

export class QuestionnaireService {
  /**
   * Récupère la définition complète du questionnaire et des modules adaptatifs
   */
  static async getDefinition() {
    const questions = await prisma.question.findMany({
      orderBy: { position: "asc" },
      select: {
        id: true,
        text: true,
        dimension: true,
        position: true,
      },
    });

    const modules = await prisma.adaptiveModule.findMany({
      orderBy: { position: "asc" },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
      },
    });

    return { questions, modules };
  }

  /**
   * Initialise ou récupère le brouillon d'évaluation (DRAFT) pour un utilisateur donné
   */
  static async start(userId: string) {
    // Note: L'utilisateur devrait déjà exister via NextAuth.
    // L'upsert ci-dessous est conservé temporairement pour ne pas casser le développement local (demo-user).
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

    const existing = await prisma.assessment.findFirst({
      where: { userId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      return existing;
    }

    return prisma.assessment.create({
      data: { userId },
    });
  }

  /**
   * Sauvegarde les données du questionnaire (consentements, démographie, réponses)
   */
  static async save(input: unknown) {
    const data = saveSchema.parse(input);

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Sauvegarde des consentements
      const assessment = await tx.assessment.update({
        where: { id: data.assessmentId },
        data: {
          consentInformation: data.consentInformation,
          consentResearch: data.consentResearch,
          consentParticipation: data.consentParticipation,
        },
      });

      // 2. Sauvegarde du profil démographique s'il est fourni
      if (data.demographic) {
        const demographicData = {
          ...data.demographic,
          department: data.demographic.department || null,
          organizationSize: data.demographic.organizationSize || null,
          childrenCount: data.demographic.childrenCount ?? null,
          livingSituationOther: data.demographic.livingSituationOther || null,
          primarySituation: data.demographic.primarySituation || null,
        };

        await tx.demographicProfile.upsert({
          where: { assessmentId: assessment.id },
          create: {
            assessmentId: assessment.id,
            ...demographicData,
          },
          update: demographicData,
        });
      }

      // 3. Sauvegarde des réponses au référentiel IQRH
      await Promise.all(
        data.answers.map((answer) =>
          tx.questionnaireAnswer.upsert({
            where: {
              assessmentId_questionId: {
                assessmentId: assessment.id,
                questionId: answer.questionId,
              },
            },
            create: {
              assessmentId: assessment.id,
              ...answer,
            },
            update: {
              value: answer.value,
            },
          })
        )
      );

      // 4. Sauvegarde des réponses aux modules adaptatifs
      await Promise.all(
        data.adaptiveAnswers.map((answer) =>
          tx.adaptiveAnswer.upsert({
            where: {
              assessmentId_adaptiveQuestionId: {
                assessmentId: assessment.id,
                adaptiveQuestionId: answer.questionId,
              },
            },
            create: {
              assessmentId: assessment.id,
              adaptiveQuestionId: answer.questionId,
              value: answer.value,
            },
            update: {
              value: answer.value,
            },
          })
        )
      );

      return assessment;
    });
  }
}
