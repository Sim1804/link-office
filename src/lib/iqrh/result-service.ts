import { prisma } from "@/lib/prisma";
import { IQRHCalculationService } from "./calculation-service";
import { IcrCalculationService } from "./icr-calculation-service";
import { ProfileCalculationService, IQRH_PROFILES_REGISTRY } from "./profile-calculation-service";
import { PrescriptionService } from "./prescription-service";
import type { IqrhDimension } from "./types";

/**
 * Textes explicatifs associés aux différentes météos relationnelles, 
 * affichés dans le rapport final de l'utilisateur.
 */
const weatherData: Record<string, { weather: string, level: string, icon: string, short: string, long: string }> = {
  "Grand soleil": {
    weather: "Grand soleil",
    level: "Épanouissement relationnel élevé",
    icon: "☀️",
    short: "Votre météo relationnelle est très favorable. Vos relations constituent aujourd'hui un point d'appui important.",
    long: "Le grand soleil traduit un équilibre relationnel très nourrissant. La priorité consiste à préserver les pratiques, les relations et les choix qui soutiennent cet état, tout en restant attentif(ve) aux évolutions de votre contexte."
  },
  "Éclaircies": {
    weather: "Éclaircies",
    level: "Bonne qualité relationnelle",
    icon: "⛅",
    short: "Votre météo relationnelle est globalement favorable, avec quelques zones à consolider.",
    long: "Les éclaircies montrent que vous disposez de plusieurs ressources solides. Les ajustements recommandés ont surtout pour objectif de préserver cet équilibre et d'éviter que les dimensions plus fragiles ne deviennent des sources de tension durables."
  },
  "Ciel couvert": {
    weather: "Ciel couvert",
    level: "Équilibre relationnel à renforcer",
    icon: "☁️",
    short: "Votre météo relationnelle est contrastée. Certaines zones sont stables, d'autres demandent davantage d'attention.",
    long: "Le ciel couvert indique que l'équilibre relationnel n'est ni totalement fragilisé ni pleinement satisfaisant. Des besoins peuvent être partiellement nourris. Une action ciblée sur la dimension prioritaire peut permettre de faire évoluer rapidement la perception globale."
  },
  "Orage": {
    weather: "Orage",
    level: "Fragilité relationnelle importante",
    icon: "🌩️",
    short: "Votre météo relationnelle est orageuse. Des fragilités importantes sont présentes, mais des points d'appui peuvent déjà être mobilisés.",
    long: "L'orage traduit un équilibre mis à l'épreuve. Certaines dimensions peuvent concentrer une forte charge alors que d'autres restent plus protectrices. Le travail consiste à distinguer les zones de tension des ressources afin de réduire progressivement la pression relationnelle."
  },
  "Tempête": {
    weather: "Tempête",
    level: "Vulnérabilité relationnelle élevée",
    icon: "⛈️",
    short: "Votre météo relationnelle est à la tempête. Plusieurs dimensions semblent actuellement sous tension. L'objectif est de sécuriser une première zone de soutien et d'avancer étape par étape.",
    long: "La tempête relationnelle correspond à une période où plusieurs ressources semblent insuffisantes face aux besoins ou aux contraintes du moment. Il convient de privilégier les actions de soutien, de relais et de sécurisation plutôt que de chercher à modifier toutes les sphères de vie simultanément."
  },
};

/**
 * Textes explicatifs associés au score global IQRH.
 */
const globalScoreData: Record<string, { short: string, long: string }> = {
  "Grand soleil": {
    short: "Votre qualité de vie relationnelle constitue aujourd'hui une véritable ressource. Vos relations, vos appuis et votre équilibre personnel semblent globalement nourrissants et cohérents.",
    long: "Votre score IQRH reflète un épanouissement relationnel élevé au moment de la passation. Vous semblez bénéficier de liens, de soutiens et de ressources personnelles qui contribuent positivement à votre équilibre. L'objectif n'est pas de rechercher davantage de performance relationnelle, mais de préserver ce qui fonctionne : la qualité de vos liens, votre capacité à demander ou à offrir du soutien, votre sentiment d'appartenance et votre cohérence personnelle. Une attention reste utile aux éventuels écarts entre dimensions ou à une forte complexité de vie qui pourrait, à terme, solliciter davantage vos ressources. Votre priorité consiste donc à entretenir vos facteurs protecteurs et à rester attentif(ve) aux changements qui pourraient modifier votre équilibre."
  },
  "Éclaircies": {
    short: "Votre équilibre relationnel est globalement satisfaisant. Vous disposez de plusieurs ressources importantes, même si certaines dimensions peuvent encore être consolidées pour préserver cet équilibre dans la durée.",
    long: "Votre score IQRH indique une bonne qualité relationnelle globale. Plusieurs dimensions semblent suffisamment nourries pour jouer un rôle protecteur dans votre quotidien. Cela ne signifie pas que tout est parfaitement équilibré : une sphère peut rester plus fragile, ou certaines contraintes peuvent demander une vigilance particulière. Votre principal enjeu est donc davantage la consolidation que la réparation. Il s'agit de préserver les relations qui vous font du bien, d'entretenir les espaces où vous pouvez être vous-même et de renforcer les dimensions qui reposent aujourd'hui sur des équilibres plus précaires. Cette base favorable peut également servir de point d'appui pour traverser plus sereinement les changements de vie."
  },
  "Ciel couvert": {
    short: "Votre qualité de vie relationnelle apparaît contrastée. Certaines dimensions fonctionnent correctement tandis que d'autres semblent moins nourrissantes. Des ajustements ciblés peuvent déjà améliorer sensiblement votre équilibre.",
    long: "Votre score IQRH montre un équilibre relationnel intermédiaire : vous disposez de ressources réelles, mais certaines sphères de vie méritent davantage d'attention. Cette configuration est fréquente lorsque les responsabilités augmentent, qu'une transition de vie est en cours ou que certains besoins relationnels sont moins nourris qu'auparavant. L'analyse des sous-scores permet de distinguer les points d'appui des zones plus fragiles. L'enjeu est de ne pas considérer votre situation comme globalement bonne ou mauvaise, mais de comprendre où concentrer votre énergie. Une ou deux actions cohérentes, répétées dans le temps, peuvent produire davantage d'effet qu'une multiplication de changements. Votre priorité est donc de consolider la dimension la plus fragile tout en utilisant vos forces comme soutien."
  },
  "Orage": {
    short: "Votre qualité de vie relationnelle présente aujourd'hui plusieurs fragilités importantes. Certaines situations personnelles, familiales ou professionnelles peuvent mobiliser beaucoup d'énergie et réduire la place disponible pour des relations réellement soutenantes.",
    long: "Votre score IQRH traduit une fragilité relationnelle importante. Plusieurs dimensions peuvent être affectées en même temps, ou une sphère particulièrement difficile peut peser sur l'ensemble de votre équilibre. Il est possible que vous disposiez encore de ressources solides, mais qu'elles soient moins accessibles ou insuffisantes face aux contraintes actuelles. L'objectif est de hiérarchiser : identifier ce qui vous fatigue le plus, ce qui vous manque réellement et le premier soutien mobilisable. Une amélioration n'implique pas nécessairement de multiplier les relations ; elle peut passer par davantage de qualité, de sécurité, de reconnaissance, de relais ou de temps pour soi. Votre accompagnement doit avancer par étapes afin de restaurer progressivement une sensation d'appui et de maîtrise."
  },
  "Tempête": {
    short: "Votre qualité de vie relationnelle apparaît actuellement très fragilisée. Plusieurs sphères de votre vie semblent manquer de soutien, de sécurité ou de liens suffisamment nourrissants. Cette photographie correspond à votre situation du moment et invite à identifier une première priorité d'action.",
    long: "Votre score IQRH met en évidence une vulnérabilité relationnelle élevée au moment de cette passation. Plusieurs dimensions semblent simultanément fragilisées, ce qui peut donner le sentiment de devoir faire face à beaucoup de choses avec des ressources relationnelles insuffisantes. L'enjeu n'est pas de tout transformer en même temps. Il consiste d'abord à repérer la dimension qui pèse le plus sur votre équilibre, les personnes ou ressources déjà disponibles, puis à remettre progressivement du soutien et de la sécurité autour de vous. Votre score ne constitue ni une étiquette ni un diagnostic : il décrit un état relationnel à un instant donné. Les premières actions proposées doivent donc être simples, réalistes et centrées sur le rétablissement de relais, de liens fiables et d'espaces où vous pouvez être soutenu(e)."
  }
};

/**
 * Service central orchestrant la soumission d'une évaluation (Assessment)
 * et le calcul de l'ensemble des résultats (IQRH, ICR, Profil relationnel, Ordonnance).
 */
export class ResultService {
  /**
   * Valide et soumet un questionnaire complété, puis déclenche tous les calculs
   * de scores pour générer le rapport final de l'utilisateur.
   * 
   * @param assessmentId - L'identifiant unique du questionnaire à soumettre
   * @returns Le résultat IQRH complet sauvegardé en base de données
   */
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

    // Calcul principal de l'IQRH
    const iqrh = IQRHCalculationService.calculate(assessment.answers.map(({ question, value }) => ({ dimension: question.dimension as IqrhDimension, value })));
    const scores = Object.fromEntries(iqrh.dimensions.map(({ dimension, score }) => [dimension, score])) as Record<IqrhDimension, number>;
    
    // Calcul de l'Indice de Charge Relationnelle (ICR)
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

    // Détermination des profils relationnels (Principal et Secondaire)
    const profile = ProfileCalculationService.calculate({ globalScore: iqrh.globalScore, balanceIndex: iqrh.balanceIndex, icrScore: icr.score, scores, situations: assessment.demographic.selectedSituations });
    
    // Tri des dimensions de la plus forte à la plus faible
    const rankedDimensions = [...iqrh.dimensions].sort((dimA, dimB) => dimB.score - dimA.score);
    
    // Sauvegarde transactionnelle de l'ensemble des résultats
    const result = await prisma.$transaction(async (tx: import("@prisma/client").Prisma.TransactionClient) => {
      await tx.assessment.update({ where: { id: assessmentId }, data: { status: "SUBMITTED", submittedAt: new Date() } });
      
      const wData = weatherData[iqrh.weather];
      const gData = globalScoreData[iqrh.weather]; // It uses the same keys as weather

      const iqrhPayload = {
        globalScore: iqrh.globalScore, 
        globalScoreText: gData?.short || "",
        globalScoreTextPremium: gData?.long || "",
        socialScore: scores.SOCIAL, affectiveScore: scores.AFFECTIVE, sentimentalScore: scores.SENTIMENTAL, professionalScore: scores.PROFESSIONAL, selfScore: scores.SELF,
        weather: iqrh.weather, weatherIcon: wData?.icon || "", weatherTitle: wData?.weather || "", 
        weatherText: wData?.short || "", weatherTextPremium: wData?.long || "", weatherTitleFull: wData ? `${wData.weather} — ${wData.level}` : "",
        balanceIndex: iqrh.balanceIndex, balanceLevel: iqrh.balanceLevel, 
        balanceInterpretation: iqrh.balanceInterpretation,
        balanceInterpretationPremium: iqrh.balanceInterpretationPremium,
        radarSummary: iqrh.radarSummary,
        priorityDimension: iqrh.priorityDimension, strengths: iqrh.strengths, watchpoints: iqrh.watchpoints,
        primaryProfile: profile.primaryName, secondaryProfile: profile.secondaryName, profileSummary: `${profile.primaryName} — ${profile.signature}`,
        bestDimension: rankedDimensions[0]!.dimension, secondBestDimension: rankedDimensions[1]!.dimension, thirdBestDimension: rankedDimensions[2]!.dimension, weakDimension: rankedDimensions[4]!.dimension,
        dimensionDetails: iqrh.dimensionDetails as any,
        strengthDetails: iqrh.strengthDetails as any,
        watchpointDetails: iqrh.watchpointDetails as any,
      };

      const storedResult = await tx.iqrhResult.upsert({
        where: { assessmentId },
        create: { assessmentId, ...iqrhPayload },
        update: iqrhPayload,
      });
      
      await tx.icrResult.upsert({ where: { iqrhResultId: storedResult.id }, create: { iqrhResultId: storedResult.id, ...icr }, update: icr });
      
      const { primaryDetails, secondaryDetails, ...profileDbData } = profile as any;
      await tx.profileResult.upsert({ where: { iqrhResultId: storedResult.id }, create: { iqrhResultId: storedResult.id, ...profileDbData }, update: profileDbData });
      
      return storedResult;
    });

    // Génération asynchrone de l'ordonnance relationnelle (Recommandations et Défis)
    await PrescriptionService.generateForResult(result.id);
    return result;
  }

  /**
   * Récupère le dernier résultat IQRH d'un utilisateur, incluant tous les calculs annexes 
   * (ICR, Profils, Ordonnance). Si l'ordonnance est manquante, tente de la générer à la volée.
   * 
   * @param userId - L'identifiant de l'utilisateur
   */
  static async byUser(userId: string) {
    const result = await prisma.iqrhResult.findFirst({
      where: { assessment: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        assessment: { select: { id: true, submittedAt: true, user: { select: { subscription: true } } } },
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
    
    // Auto-réparation : si l'ordonnance n'a pas été générée (ex: erreur réseau ou crash), 
    // on la génère à la lecture du résultat.
    if (!result.prescription) {
      try {
        await PrescriptionService.generateForResult(result.id);
        const reloadedResult = await prisma.iqrhResult.findUnique({
          where: { id: result.id },
          include: {
            assessment: { select: { id: true, submittedAt: true, user: { select: { subscription: true } } } },
            icr: true,
            profile: true,
            prescription: {
              include: {
                items: { orderBy: { position: "asc" }, include: { libraryItem: true } },
              },
            },
          },
        });
        if (reloadedResult) finalResult = reloadedResult;
      } catch (err) {
        console.error("Auto-prescription generation error:", err);
      }
    }

    return {
      ...finalResult,
      weatherText: finalResult.weatherText || weatherData[finalResult.weather]?.short || "",
      primaryProfileDetails: finalResult.primaryProfile ? IQRH_PROFILES_REGISTRY[finalResult.primaryProfile] : null,
      secondaryProfileDetails: finalResult.secondaryProfile ? IQRH_PROFILES_REGISTRY[finalResult.secondaryProfile] : null,
    };
  }
  static async userHistory(userId: string) {
    const results = await prisma.iqrhResult.findMany({
      where: { assessment: { userId } },
      orderBy: { createdAt: "desc" },
      include: {
        assessment: { select: { id: true, submittedAt: true, campaign: { select: { title: true, offer: true } } } },
      },
    });
    return results;
  }
}

