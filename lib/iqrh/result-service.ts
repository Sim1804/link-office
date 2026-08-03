import { prisma } from "@/lib/prisma";
import { IQRHCalculationService } from "./calculation-service";
import { IcrCalculationService } from "./icr-calculation-service";
import { ProfileCalculationService } from "./profile-calculation-service";
import { PrescriptionService } from "./prescription-service";
import type { IqrhDimension } from "./types";

const weatherText: Record<string, string> = {
  "Grand soleil": "Votre qualité de vie relationnelle constitue aujourd’hui une véritable force. Vous semblez bénéficier de relations nourrissantes, de ressources solides et d’un bon équilibre entre les différentes sphères de votre vie. L’objectif principal est de préserver cet équilibre et de rester attentif aux évolutions possibles dans le temps.",
  "Éclaircies": "Votre équilibre relationnel est globalement satisfaisant. Vous disposez de plusieurs ressources importantes, même si certaines dimensions peuvent encore être consolidées. Quelques ajustements ciblés peuvent vous aider à renforcer durablement votre qualité de vie relationnelle.",
  "Ciel couvert": "Votre qualité de vie relationnelle apparaît contrastée. Certaines dimensions fonctionnent correctement, tandis que d’autres semblent plus fragiles. Cette situation peut être liée à une période de transition, à une charge de responsabilités ou à des besoins relationnels insuffisamment nourris. Des actions progressives peuvent permettre une amélioration significative.",
  "Orage": "Vos réponses mettent en évidence plusieurs fragilités relationnelles susceptibles d’impacter votre qualité de vie. Il est possible que certaines situations personnelles, professionnelles ou familiales mobilisent beaucoup d’énergie. L’objectif est d’identifier les priorités et d’agir progressivement, sans chercher à tout transformer d’un coup.",
  "Tempête": "Votre questionnaire révèle une qualité de vie relationnelle actuellement très fragilisée. Cette photographie ne définit pas qui vous êtes : elle reflète une situation à un moment donné. Des ressources existent, et des actions adaptées peuvent vous aider à retrouver progressivement davantage d’équilibre et de soutien.",
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
    if (!assessment.consentInformation || !assessment.consentResearch || !assessment.demographic) {
      throw new Error("Consentements obligatoires (information et recherche) et profil démographique requis.");
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
    const result = await prisma.$transaction(async (tx: import("@prisma/client").Prisma.TransactionClient) => {
      await tx.assessment.update({ where: { id: assessmentId }, data: { status: "SUBMITTED", submittedAt: new Date() } });
      const weatherIcon = iqrh.globalScore <= 20 ? "⛈️" : iqrh.globalScore <= 40 ? "🌩️" : iqrh.globalScore <= 60 ? "☁️" : iqrh.globalScore <= 80 ? "⛅" : "☀️";
      const weatherTitle = iqrh.globalScore <= 20 ? "Tempête" : iqrh.globalScore <= 40 ? "Orage" : iqrh.globalScore <= 60 ? "Ciel couvert" : iqrh.globalScore <= 80 ? "Éclaircies" : "Grand soleil";
      const balanceLevel = iqrh.balanceIndex > 80 ? "Très équilibré" : iqrh.balanceIndex > 60 ? "Équilibré" : "Déséquilibré";

      const stored = await tx.iqrhResult.upsert({
        where: { assessmentId },
        create: {
          assessmentId, globalScore: iqrh.globalScore, socialScore: scores.SOCIAL, affectiveScore: scores.AFFECTIVE, sentimentalScore: scores.SENTIMENTAL, professionalScore: scores.PROFESSIONAL, selfScore: scores.SELF,
          weather: iqrh.weather, weatherIcon, weatherTitle, weatherText: weatherText[iqrh.weather],
          balanceIndex: iqrh.balanceIndex, balanceLevel, balanceInterpretation: `Votre indice d'équilibre relationnel est de ${iqrh.balanceIndex}/100.`,
          priorityDimension: iqrh.priorityDimension, strengths: iqrh.strengths, watchpoints: iqrh.watchpoints,
          primaryProfile: profile.primaryName, secondaryProfile: profile.secondaryName, profileSummary: `${profile.primaryName} — ${profile.signature}`,
          bestDimension: ranked[0]!.dimension, secondBestDimension: ranked[1]!.dimension, thirdBestDimension: ranked[2]!.dimension, weakDimension: ranked[4]!.dimension,
        },
        update: {
          globalScore: iqrh.globalScore, socialScore: scores.SOCIAL, affectiveScore: scores.AFFECTIVE, sentimentalScore: scores.SENTIMENTAL, professionalScore: scores.PROFESSIONAL, selfScore: scores.SELF,
          weather: iqrh.weather, weatherIcon, weatherTitle, weatherText: weatherText[iqrh.weather],
          balanceIndex: iqrh.balanceIndex, balanceLevel, balanceInterpretation: `Votre indice d'équilibre relationnel est de ${iqrh.balanceIndex}/100.`,
          priorityDimension: iqrh.priorityDimension, strengths: iqrh.strengths, watchpoints: iqrh.watchpoints,
          primaryProfile: profile.primaryName, secondaryProfile: profile.secondaryName, profileSummary: `${profile.primaryName} — ${profile.signature}`,
          bestDimension: ranked[0]!.dimension, secondBestDimension: ranked[1]!.dimension, thirdBestDimension: ranked[2]!.dimension, weakDimension: ranked[4]!.dimension,
        },
      });
      await tx.icrResult.upsert({ where: { iqrhResultId: stored.id }, create: { iqrhResultId: stored.id, ...icr }, update: icr });
      const { primaryDetails, secondaryDetails, ...profileDbData } = profile as any;
      await tx.profileResult.upsert({ where: { iqrhResultId: stored.id }, create: { iqrhResultId: stored.id, ...profileDbData }, update: profileDbData });
      return stored;
    });
    await PrescriptionService.generateForResult(result.id);
    return result;
  }

  static async byUser(userId: string) {
    const result = await prisma.iqrhResult.findFirst({
      where: { assessment: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        assessment: { select: { id: true, submittedAt: true } },
        icr: true,
        profile: true,
        prescription: {
          include: {
            items: { orderBy: { position: "asc" }, include: { libraryItem: true } },
          },
        },
      },
    });

    if (!result) return null;

    let finalResult = result;
    if (!result.prescription) {
      try {
        await PrescriptionService.generateForResult(result.id);
        const reloaded = await prisma.iqrhResult.findUnique({
          where: { id: result.id },
          include: {
            assessment: { select: { id: true, submittedAt: true } },
            icr: true,
            profile: true,
            prescription: {
              include: {
                items: { orderBy: { position: "asc" }, include: { libraryItem: true } },
              },
            },
          },
        });
        if (reloaded) finalResult = reloaded;
      } catch (err) {
        console.error("Auto-prescription generation error:", err);
      }
    }

    return {
      ...finalResult,
      weatherText: weatherText[finalResult.weather] ?? finalResult.weatherText,
    };
  }
}

