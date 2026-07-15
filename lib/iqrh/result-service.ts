import { prisma } from "@/lib/prisma";
import { IQRHCalculationService } from "./calculation-service";
import { IcrCalculationService } from "./icr-calculation-service";
import { ProfileCalculationService } from "./profile-calculation-service";
import { PrescriptionService } from "./prescription-service";
import type { IqrhDimension } from "./types";

const weatherText: Record<string, string> = {
  "Grand soleil": "Votre qualité de vie relationnelle constitue aujourd'hui une véritable force.",
  "Éclaircies": "Votre équilibre relationnel est globalement satisfaisant.",
  "Ciel couvert": "Votre qualité de vie relationnelle apparaît contrastée.",
  "Orage": "Vos réponses mettent en évidence plusieurs fragilités relationnelles.",
  "Tempête": "Votre questionnaire révèle une qualité de vie relationnelle actuellement très fragilisée.",
};

export class ResultService {
  static async submit(assessmentId: string) {
    const assessment = await prisma.assessment.findUniqueOrThrow({
      where: { id: assessmentId },
      include: {
        answers: { include: { question: true } },
        adaptiveAnswers: { include: { question: true } },
        demographic: true,
      },
    });
    if (!assessment.consentInformation || !assessment.consentResearch || !assessment.consentParticipation || !assessment.demographic) {
      throw new Error("Consentements et profil démographique obligatoires.");
    }
    const iqrh = IQRHCalculationService.calculate(assessment.answers.map(({ question, value }) => ({ dimension: question.dimension as IqrhDimension, value })));
    const scores = Object.fromEntries(iqrh.dimensions.map(({ dimension, score }) => [dimension, score])) as Record<IqrhDimension, number>;
    const icr = IcrCalculationService.calculate({
      occupation: assessment.demographic.occupation,
      organizationSize: assessment.demographic.organizationSize,
      children: assessment.demographic.children,
      childrenCount: assessment.demographic.childrenCount,
      relationshipStatus: assessment.demographic.relationshipStatus,
      selectedSituations: assessment.demographic.selectedSituations,
      scores,
      balanceIndex: iqrh.balanceIndex,
      globalScore: iqrh.globalScore,
      adaptiveAnswers: assessment.adaptiveAnswers.map(({ question, value }) => ({ value, polarity: question.polarity, label: question.text })),
    });
    const profile = ProfileCalculationService.calculate({ globalScore: iqrh.globalScore, balanceIndex: iqrh.balanceIndex, icrScore: icr.score, scores, situations: assessment.demographic.selectedSituations });
    const ranked = [...iqrh.dimensions].sort((left, right) => right.score - left.score);
    const result = await prisma.$transaction(async (tx) => {
      await tx.assessment.update({ where: { id: assessmentId }, data: { status: "SUBMITTED", submittedAt: new Date() } });
      const stored = await tx.iqrhResult.upsert({
        where: { assessmentId },
        create: {
          assessmentId, globalScore: iqrh.globalScore, socialScore: scores.SOCIAL, affectiveScore: scores.AFFECTIVE, sentimentalScore: scores.SENTIMENTAL, professionalScore: scores.PROFESSIONAL, selfScore: scores.SELF,
          weather: iqrh.weather, balanceIndex: iqrh.balanceIndex, priorityDimension: iqrh.priorityDimension, strengths: iqrh.strengths, watchpoints: iqrh.watchpoints,
          primaryProfile: profile.primaryName, secondaryProfile: profile.secondaryName, profileSummary: `${profile.primaryName} — ${profile.signature}`,
          bestDimension: ranked[0]!.dimension, secondBestDimension: ranked[1]!.dimension, thirdBestDimension: ranked[2]!.dimension, weakDimension: ranked[4]!.dimension,
          weatherTitle: iqrh.weather, weatherText: weatherText[iqrh.weather],
        },
        update: {
          globalScore: iqrh.globalScore, socialScore: scores.SOCIAL, affectiveScore: scores.AFFECTIVE, sentimentalScore: scores.SENTIMENTAL, professionalScore: scores.PROFESSIONAL, selfScore: scores.SELF,
          weather: iqrh.weather, balanceIndex: iqrh.balanceIndex, priorityDimension: iqrh.priorityDimension, strengths: iqrh.strengths, watchpoints: iqrh.watchpoints,
          primaryProfile: profile.primaryName, secondaryProfile: profile.secondaryName, profileSummary: `${profile.primaryName} — ${profile.signature}`,
          bestDimension: ranked[0]!.dimension, secondBestDimension: ranked[1]!.dimension, thirdBestDimension: ranked[2]!.dimension, weakDimension: ranked[4]!.dimension,
          weatherTitle: iqrh.weather, weatherText: weatherText[iqrh.weather],
        },
      });
      await tx.icrResult.upsert({ where: { iqrhResultId: stored.id }, create: { iqrhResultId: stored.id, ...icr }, update: icr });
      await tx.profileResult.upsert({ where: { iqrhResultId: stored.id }, create: { iqrhResultId: stored.id, ...profile }, update: profile });
      return stored;
    });
    await PrescriptionService.generateForResult(result.id);
    return result;
  }

  static async byUser(userId: string) {
    return prisma.iqrhResult.findFirstOrThrow({
      where: { assessment: { userId } }, orderBy: { createdAt: "desc" },
      include: { assessment: { select: { id: true, submittedAt: true } }, icr: true, profile: true, prescription: { include: { items: { orderBy: { position: "asc" }, include: { libraryItem: true } } } } },
    });
  }
}
