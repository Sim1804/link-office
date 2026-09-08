/**
 * @file calculation-service.ts
 * @module lib/iqrh
 * @description Service central de calcul de l'IQRH (Indice de Qualité des Relations Humaines).
 *
 * Ce service implémente l'algorithme psychométrique qui transforme les 30 réponses
 * sur l'échelle de Likert en un rapport structuré, incluant :
 * - Les scores pour chacune des 5 dimensions relationnelles
 * - Le score global et l'Indice d'Équilibre Relationnel (IER)
 * - La météo relationnelle (métaphore du bien-être global)
 * - Les textes des forces et points de vigilance (issus du référentiel IQRH)
 *
 * @important Ce service est STATELESS et PURE : il ne touche pas la base de données.
 * La persistance est assurée par `ResultService.submit()`.
 *
 * @see lib/iqrh/result-service.ts — Orchestrateur qui appelle ce service et persiste les données
 * @see lib/iqrh/types.ts — Définition des types utilisés en entrée et sortie
 */

import {
  DIMENSIONS,
  type DimensionScore,
  type IqrhDimension,
  type ResultText,
  type ResultatIQRH,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// CORRESPONDANCE DIMENSION → LIBELLÉ
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mapping des identifiants de dimension (clé enum) vers leur libellé lisible en français.
 * Utilisé pour enrichir le résultat avec les labels affichés dans l'UI.
 */
const DIMENSION_LABELS: Record<IqrhDimension, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie professionnelle et engagement",
  SELF: "Relation à soi et au sens",
};

export interface DimensionDetail {
  dimension: string;
  score: number;
  shortText: string;
  longText: string;
}

const DIMENSIONS_TEXTS: Record<IqrhDimension, { thresholds: { min: number, max: number, short: string, long: string }[] }> = {
  SOCIAL: {
    thresholds: [
      { min: 80, max: 100, short: "Votre réseau relationnel constitue une ressource solide.", long: "Vous semblez disposer d'un entourage, de liens ou d'occasions d'échange qui contribuent positivement à votre équilibre. Vous pouvez probablement identifier plusieurs personnes ou espaces relationnels sur lesquels vous appuyer. Cette dimension joue aujourd'hui un rôle protecteur. Préservez la régularité et la qualité de ces liens, sans chercher nécessairement à élargir davantage votre réseau." },
      { min: 60, max: 79, short: "Votre vie sociale est globalement satisfaisante.", long: "Votre réseau semble suffisamment présent pour soutenir votre quotidien, même si certains liens pourraient être consolidés. Vous disposez probablement d'occasions d'échange et de personnes ressources, mais la régularité, la profondeur ou la diversité des relations peuvent encore être renforcées. Une attention simple portée aux liens importants permettra de préserver cet équilibre." },
      { min: 40, max: 59, short: "Votre réseau relationnel mérite d'être renforcé.", long: "Vos réponses suggèrent que votre environnement social pourrait être moins soutenant ou moins nourrissant que vous le souhaiteriez. Vous pouvez manquer d'occasions d'échange régulières, de sentiment d'appartenance ou de personnes sur lesquelles compter spontanément. L'objectif est de recréer du mouvement relationnel à partir d'actions simples et répétées." },
      { min: 0, max: 39, short: "Vos relations sociales constituent actuellement une priorité d'action.", long: "Votre score indique une fragilité importante du réseau relationnel. Vous pouvez vous sentir peu entouré(e), avoir du mal à identifier vers qui vous tourner ou disposer de peu d'occasions de créer et maintenir des liens. La priorité est de réintroduire progressivement des contacts fiables et accessibles, en privilégiant la qualité et la régularité plutôt que la quantité." }
    ]
  },
  AFFECTIVE: {
    thresholds: [
      { min: 80, max: 100, short: "Vos relations affectives sont une ressource solide.", long: "Vous semblez bénéficier de relations dans lesquelles l'écoute, l'affection, la confiance ou la sécurité émotionnelle sont présentes. Cette qualité de soutien vous permet probablement d'exprimer davantage ce que vous ressentez et de vous sentir reconnu(e) dans les moments importants. Continuez à nourrir ces relations et à préserver les espaces de sincérité qui les rendent protectrices." },
      { min: 60, max: 79, short: "Votre équilibre affectif est globalement satisfaisant.", long: "Vous disposez vraisemblablement de relations émotionnellement soutenantes, même si certains besoins restent parfois moins exprimés ou moins nourris. La base est solide. Le principal levier consiste à renforcer la qualité des échanges, à demander plus clairement ce dont vous avez besoin et à préserver les personnes avec lesquelles vous pouvez être pleinement vous-même." },
      { min: 40, max: 59, short: "Votre sécurité émotionnelle demande de l'attention.", long: "Cette dimension peut traduire un besoin accru d'écoute, de soutien, de bienveillance ou d'expression émotionnelle. Certaines émotions peuvent être portées seul(e), ou les relations importantes ne vous apportent peut-être pas toujours le niveau de sécurité attendu. Identifier une ou deux personnes de confiance constitue une première étape utile." },
      { min: 0, max: 39, short: "Votre soutien affectif constitue une priorité d'action.", long: "Votre score indique que vos besoins de sécurité émotionnelle, d'écoute ou d'affection sont actuellement insuffisamment nourris. Vous pouvez avoir le sentiment de ne pas pouvoir exprimer librement ce que vous vivez ou de devoir traverser certaines difficultés sans soutien affectif suffisant. L'objectif est de recréer des espaces de confiance et de soutien adaptés à votre situation." }
    ]
  },
  SENTIMENTAL: {
    thresholds: [
      { min: 80, max: 100, short: "Votre vie sentimentale soutient votre équilibre.", long: "Votre situation sentimentale actuelle semble globalement correspondre à vos attentes ou à vos besoins du moment. Cette dimension peut représenter une source de stabilité, de projection ou d'épanouissement. Préservez les espaces de dialogue, de sincérité et de qualité relationnelle qui soutiennent cet équilibre." },
      { min: 60, max: 79, short: "Votre vie sentimentale est globalement satisfaisante.", long: "Votre situation sentimentale paraît relativement cohérente avec vos attentes, tout en laissant certains ajustements possibles. Il peut s'agir de mieux exprimer vos besoins, de préserver davantage de temps de qualité ou de clarifier certaines projections. L'enjeu principal est de consolider ce qui fonctionne déjà." },
      { min: 40, max: 59, short: "Votre vie sentimentale est un axe à clarifier ou renforcer.", long: "Vos réponses indiquent que votre situation sentimentale actuelle peut être source de questionnement, d'insatisfaction ou d'incertitude. Cela peut concerner le couple, le célibat, une séparation, un deuil ou la difficulté à se projeter. Clarifier vos besoins affectifs et ce qui vous conviendrait aujourd'hui constitue le premier levier." },
      { min: 0, max: 39, short: "Votre vie sentimentale constitue actuellement une priorité d'action.", long: "Votre score montre une fragilité importante dans la sphère sentimentale. Vous pouvez ressentir un décalage entre votre situation actuelle et ce que vous souhaiteriez vivre, manquer de sécurité ou avoir des difficultés à vous projeter. L'objectif n'est pas de forcer un changement de situation, mais d'identifier vos besoins, vos limites et les soutiens nécessaires pour retrouver davantage de sérénité." }
    ]
  },
  PROFESSIONAL: {
    thresholds: [
      { min: 80, max: 100, short: "Votre activité est une source d'utilité et d'engagement.", long: "Vous semblez trouver une place, du sens, du soutien ou de la reconnaissance dans l'activité qui occupe une part importante de votre quotidien. Cette dimension constitue un moteur et peut renforcer votre sentiment d'utilité. Continuez à vous appuyer sur cette dynamique tout en veillant à préserver l'équilibre avec les autres sphères de vie." },
      { min: 60, max: 79, short: "Votre environnement d'activité est globalement soutenant.", long: "Votre activité contribue plutôt positivement à votre équilibre. Vous semblez disposer de relations correctes, d'un sentiment d'utilité ou d'une forme de reconnaissance, même si certains éléments peuvent encore être consolidés : soutien, expression des idées, charge ou équilibre de vie. Il est utile de protéger ce qui fonctionne et d'agir sur un irritant précis." },
      { min: 40, max: 59, short: "Votre activité actuelle pèse peut-être sur votre équilibre.", long: "Cette dimension suggère que l'activité qui occupe une place importante dans votre quotidien contribue moins positivement à votre équilibre qu'elle ne le pourrait. Le manque de reconnaissance, l'isolement, la surcharge, la perte de sens ou la difficulté à exprimer vos idées peuvent jouer un rôle. Identifier le facteur principal permettra de cibler une action utile." },
      { min: 0, max: 39, short: "Votre vie professionnelle ou votre activité principale constitue une priorité d'action.", long: "Votre score montre une fragilité importante dans la sphère d'activité. Vous pouvez vous sentir peu soutenu(e), peu reconnu(e), isolé(e), en surcharge ou en décalage avec le sens que vous souhaitez donner à votre quotidien. Il est important de ne pas réduire cette difficulté à une faiblesse personnelle : le contexte, l'organisation et les ressources disponibles doivent aussi être examinés." }
    ]
  },
  SELF: {
    thresholds: [
      { min: 80, max: 100, short: "Votre stabilité intérieure est une force.", long: "Vos réponses suggèrent une bonne connexion à vos valeurs, à vos priorités et au sens que vous donnez à votre vie. Cette dimension constitue un socle important pour faire face aux transitions et aux difficultés relationnelles. Continuez à cultiver les choix, pratiques et relations qui vous permettent de rester aligné(e) avec vous-même." },
      { min: 60, max: 79, short: "Votre relation à vous-même est globalement satisfaisante.", long: "Vous disposez d'un socle personnel relativement solide : valeurs, capacité de projection, sens ou attention portée à votre équilibre. Certaines périodes peuvent néanmoins réduire le temps disponible pour vous ou créer des doutes. Préserver régulièrement des espaces de recul permet de consolider cette ressource." },
      { min: 40, max: 59, short: "Votre alignement personnel mérite d'être soutenu.", long: "Vos réponses peuvent traduire une période de questionnement, de fatigue intérieure, de perte de repères ou de difficulté à prendre du temps pour vous. Cette dimension influence fortement la qualité globale des relations. Revenir à ce qui compte réellement pour vous constitue un premier point d'appui." },
      { min: 0, max: 39, short: "Votre relation à vous-même et au sens constitue une priorité d'action.", long: "Votre score indique une fragilité importante de l'équilibre intérieur. Vous pouvez éprouver une difficulté à vous projeter, à prendre soin de vous ou à retrouver du sens dans certaines sphères de votre vie. La priorité est de recréer des repères simples, de réduire ce qui vous éloigne de vos besoins essentiels et d'identifier les activités ou relations qui vous reconnectent à vos valeurs." }
    ]
  },
};

const IER_TEXTS = [
  { min: 81, max: 100, level: "Profil très équilibré", short: "Vos cinq dimensions sont proches les unes des autres. Votre équilibre ne repose pas sur une seule sphère : plusieurs ressources semblent se soutenir mutuellement.", long: "Votre IER montre une forte homogénéité entre les dimensions. Cela signifie que votre qualité relationnelle est relativement cohérente d'une sphère à l'autre. L'enjeu principal est de préserver cette harmonie et d'éviter qu'une évolution de contexte ne crée un déséquilibre durable." },
  { min: 61, max: 80, level: "Équilibre global satisfaisant", short: "Votre profil est assez homogène, avec quelques écarts qui méritent simplement d'être surveillés.", long: "Votre IER indique un équilibre global satisfaisant. Certaines dimensions sont plus solides que d'autres, mais les écarts restent modérés. Les forces peuvent être mobilisées comme point d'appui pour consolider la sphère la moins nourrie." },
  { min: 41, max: 60, level: "Déséquilibre modéré", short: "Votre radar présente des écarts visibles entre certaines sphères de vie.", long: "Votre IER met en évidence un déséquilibre modéré. Vous pouvez aller relativement bien dans certaines sphères tout en ressentant une fragilité marquée dans d'autres. Cette configuration nécessite une lecture ciblée : la priorité n'est pas le score moyen, mais l'écart entre vos ressources et votre dimension la plus fragile." },
  { min: 21, max: 40, level: "Déséquilibre important", short: "Votre qualité relationnelle varie fortement selon les sphères de vie.", long: "Votre IER montre un déséquilibre important. Une ou plusieurs dimensions peuvent être de véritables ressources tandis que d'autres sont fortement fragilisées. Ce contraste peut parfois masquer une difficulté : fonctionner correctement dans une sphère ne compense pas toujours le manque de soutien dans une autre. L'accompagnement doit donc se concentrer sur la ou les zones de rupture." },
  { min: 0, max: 20, level: "Déséquilibre majeur", short: "Votre radar montre des écarts très importants entre vos différentes sphères relationnelles.", long: "Votre IER indique un déséquilibre majeur. Votre expérience relationnelle peut être très différente d'une sphère à l'autre, avec des points d'appui solides et des zones de grande fragilité. La priorité consiste à comprendre ce qui entretient ces écarts et à transférer, lorsque cela est possible, les ressources présentes dans les dimensions fortes vers les dimensions les plus vulnérables." }
];

// ─────────────────────────────────────────────────────────────────────────────
// TEXTES DU RÉFÉRENTIEL — FORCES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Textes positifs du référentiel IQRH pour chaque dimension.
 * Affichés pour les dimensions ayant un score élevé (≥ 60, niveau "satisfactory" ou "resource").
 * Reproduits depuis les sections 12 et 13 du référentiel IQRH officiel.
 */
const STRENGTH_TEXTS: Record<IqrhDimension, ResultText> = {
  SOCIAL: {
    dimension: "SOCIAL",
    title: "Votre réseau relationnel est une ressource.",
    interpretation: "Vous semblez disposer d'un entourage, de liens ou d'occasions d'échange qui contribuent positivement à votre équilibre.",
    lever: "Continuez à entretenir ces liens dans la durée et appuyez-vous sur eux lorsque d'autres sphères sont plus exigeantes.",
  },
  AFFECTIVE: {
    dimension: "AFFECTIVE",
    title: "Vous disposez de ressources émotionnelles importantes.",
    interpretation: "Vos réponses suggèrent que l'écoute, l'affection, la confiance ou la sécurité émotionnelle sont présentes dans vos relations importantes.",
    lever: "Appuyez-vous sur ces relations de confiance pour exprimer vos besoins et partager vos ressentis.",
  },
  SENTIMENTAL: {
    dimension: "SENTIMENTAL",
    title: "Votre vie sentimentale soutient votre équilibre.",
    interpretation: "Votre situation sentimentale actuelle semble globalement correspondre à vos attentes ou à vos besoins du moment.",
    lever: "Préservez les espaces de dialogue, de sincérité et de qualité relationnelle qui nourrissent cette dimension.",
  },
  PROFESSIONAL: {
    dimension: "PROFESSIONAL",
    title: "Votre activité est une source d'utilité et d'engagement.",
    interpretation: "Vous semblez trouver une place, du sens ou de la reconnaissance dans l'activité qui occupe une place importante dans votre quotidien.",
    lever: "Utilisez cette dynamique comme moteur tout en protégeant l'équilibre avec les autres sphères de vie.",
  },
  SELF: {
    dimension: "SELF",
    title: "Votre stabilité intérieure est une force.",
    interpretation: "Vos réponses suggèrent une bonne connexion à vos valeurs, à vos priorités et au sens que vous donnez à votre vie.",
    lever: "Continuez à cultiver les pratiques et relations qui vous permettent de rester aligné(e) avec vous-même.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// TEXTES DU RÉFÉRENTIEL — POINTS DE VIGILANCE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Textes de vigilance du référentiel IQRH pour chaque dimension.
 * Affichés pour les dimensions avec un score faible (< 60, niveau "fragile" ou "priority").
 * Reproduits depuis les sections 12 et 13 du référentiel IQRH officiel.
 */
const WATCHPOINT_TEXTS: Record<IqrhDimension, ResultText> = {
  SOCIAL: {
    dimension: "SOCIAL",
    title: "Votre réseau relationnel mérite d'être renforcé.",
    interpretation: "Votre environnement social pourrait être moins soutenant ou moins nourrissant que souhaité.",
    lever: "Reprendre contact avec une personne importante ou rejoindre un espace collectif régulier.",
  },
  AFFECTIVE: {
    dimension: "AFFECTIVE",
    title: "Votre sécurité émotionnelle demande de l'attention.",
    interpretation: "Vous pouvez avoir besoin de davantage d'écoute, de soutien ou d'espace pour exprimer ce que vous ressentez.",
    lever: "Identifier une ou deux personnes de confiance avec lesquelles parler plus librement.",
  },
  SENTIMENTAL: {
    dimension: "SENTIMENTAL",
    title: "Votre vie sentimentale est un axe à clarifier ou renforcer.",
    interpretation: "Votre situation sentimentale peut être source de questionnement, d'insatisfaction ou de fragilité.",
    lever: "Clarifier vos besoins affectifs et identifier ce qui vous conviendrait aujourd'hui.",
  },
  PROFESSIONAL: {
    dimension: "PROFESSIONAL",
    title: "Votre activité actuelle pèse peut-être sur votre équilibre.",
    interpretation: "Le manque de reconnaissance, l'isolement, la surcharge ou la perte de sens peuvent contribuer à votre score.",
    lever: "Identifier le facteur qui pèse le plus et chercher un soutien ou un ajustement concret.",
  },
  SELF: {
    dimension: "SELF",
    title: "Votre alignement personnel mérite d'être soutenu.",
    interpretation: "Une période de fatigue intérieure, de perte de repères ou de manque de temps pour vous peut être présente.",
    lever: "Réintroduire des temps de pause et identifier ce qui vous reconnecte à vos valeurs.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Service de calcul principal de l'IQRH.
 *
 * Transforme un tableau brut de réponses (dimension + valeur Likert) en un
 * rapport complet structuré, prêt à être affiché ou persisté.
 *
 * @example
 * const rapport = IQRHCalculationService.calculate([
 *   { dimension: "SOCIAL", value: 4 },
 *   { dimension: "SOCIAL", value: 3 },
 *   // ... 28 autres réponses
 * ]);
 * console.log(rapport.globalScore); // ex: 72
 * console.log(rapport.weather);    // "Éclaircies"
 */
export class IQRHCalculationService {
  /**
   * Calcule l'ensemble du rapport IQRH à partir des 30 réponses Likert.
   *
   * Algorithme de calcul par dimension :
   *   score = ROUND( (somme_6_réponses - 6) / 24 × 100 )
   *   (Ramène la plage [6, 30] sur [0, 100])
   *
   * Score global = moyenne des 5 scores de dimension
   * IER (balanceIndex) = 100 - (score_max - score_min) → [0, 100]
   *   Un IER de 100 = toutes les dimensions à égalité (équilibre parfait)
   *   Un IER de 0   = écart maximal entre la dimension haute et basse
   *
   * Météo relationnelle déterminée par le score global :
   *   ≤ 20 → Tempête | ≤ 40 → Orage | ≤ 60 → Ciel couvert | ≤ 80 → Éclaircies | > 80 → Grand soleil
   *
   * @param answers - Tableau de 30 réponses (exactement), chacune avec sa dimension et sa valeur Likert (1–5)
   * @returns Le rapport IQRH complet (scores, météo, forces, points de vigilance, radar)
   * @throws {Error} Si le nombre de réponses n'est pas exactement 30
   * @throws {Error} Si une valeur n'est pas un entier entre 1 et 5
   * @throws {Error} Si une dimension ne reçoit pas exactement 6 réponses
   */
  static calculate(answers: ReadonlyArray<{ dimension: IqrhDimension; value: number }>): ResultatIQRH {
    // Validation de l'entrée — 30 réponses Likert valides sont impératives
    const hasInvalidValues = answers.some(({ value }) => !Number.isInteger(value) || value < 1 || value > 5);
    if (answers.length !== 30 || hasInvalidValues) {
      throw new Error("Les 30 réponses Likert valides sont obligatoires.");
    }

    // ── Calcul des scores par dimension ──────────────────────────────────────
    const dimensionScores = DIMENSIONS.map((dimension): DimensionScore => {
      const dimensionAnswerValues = answers
        .filter((answer) => answer.dimension === dimension)
        .map((answer) => answer.value);

      if (dimensionAnswerValues.length !== 6) {
        throw new Error(`Six réponses sont requises pour la dimension ${dimension}.`);
      }

      // Formule de normalisation : ramène [6..30] vers [0..100]
      const rawSum = dimensionAnswerValues.reduce((sum, value) => sum + value, 0);
      const normalizedScore = Math.round(((rawSum - 6) / 24) * 100);

      const level = normalizedScore < 40 ? "priority"
        : normalizedScore < 60 ? "fragile"
        : normalizedScore < 80 ? "satisfactory"
        : "resource";

      return { dimension, label: DIMENSION_LABELS[dimension], score: normalizedScore, level };
    });

    // ── Score global et indicateurs dérivés ─────────────────────────────────
    const globalScore = Math.round(
      dimensionScores.reduce((sum, item) => sum + item.score, 0) / 5
    );

    // Tri par score décroissant (forces en tête) et croissant (fragilités en tête)
    const sortedByStrength = [...dimensionScores].sort((a, b) => b.score - a.score);
    const sortedByWeakness = [...dimensionScores].sort((a, b) => a.score - b.score);

    const priorityDimension = sortedByWeakness[0]!.dimension;

    // IER : 100 si toutes les dimensions sont égales, ↘ si grand écart
    const bestDimensionObj = sortedByStrength[0]!;
    const weakDimensionObj = sortedByStrength[4]!;
    const balanceIndex = Math.round(100 - (bestDimensionObj.score - weakDimensionObj.score));
    const ierDef = IER_TEXTS.find(t => balanceIndex >= t.min && balanceIndex <= t.max) || IER_TEXTS[0];
    const balanceLevel = ierDef.level;
    const balanceInterpretation = ierDef.short;
    const balanceInterpretationPremium = ierDef.long;

    // Phrase automatique de lecture du radar
    const bestDimensionName = DIMENSION_LABELS[bestDimensionObj.dimension].toLowerCase();
    const priorityDimensionName = DIMENSION_LABELS[weakDimensionObj.dimension].toLowerCase();
    const gap = bestDimensionObj.score - weakDimensionObj.score;
    const radarSummary = `Votre radar montre que votre principale ressource est : ${bestDimensionName} (${bestDimensionObj.score}/100). La dimension qui mérite actuellement le plus d’attention est : ${priorityDimensionName} (${weakDimensionObj.score}/100). L’écart entre ces deux dimensions est de ${gap} points.`;

    // Météo relationnelle (paliers de 20 points)
    const weather = globalScore <= 20 ? "Tempête"
      : globalScore <= 40 ? "Orage"
      : globalScore <= 60 ? "Ciel couvert"
      : globalScore <= 80 ? "Éclaircies"
      : "Grand soleil";

    // ── Sélection des textes du référentiel ──────────────────────────────────
    // Les 3 dimensions les plus hautes → forces
    const strengthDetailTexts = sortedByStrength.slice(0, 3).map(({ dimension }) => STRENGTH_TEXTS[dimension]);
    // Les 3 dimensions les plus basses → points de vigilance
    const watchpointDetailTexts = sortedByWeakness.slice(0, 3).map(({ dimension, score }) => {
      const baseText = WATCHPOINT_TEXTS[dimension];
      const riskLevel = score < 40 ? "🔴 Critique" : score < 60 ? "🟠 Élevé" : score < 80 ? "🟡 Modéré" : "🟢 Faible";
      return {
        ...baseText,
        title: `${riskLevel} - ${baseText.title}`
      };
    });

    // Calcul détaillé pour chaque dimension
    const dimensionDetails: DimensionDetail[] = dimensionScores.map(dim => {
      const def = DIMENSIONS_TEXTS[dim.dimension];
      const threshold = def.thresholds.find(t => dim.score >= t.min && dim.score <= t.max);
      
      const isStrength = dim.score >= 60;
      const fallbackShort = isStrength ? STRENGTH_TEXTS[dim.dimension].title : WATCHPOINT_TEXTS[dim.dimension].title;
      const fallbackLong = isStrength ? STRENGTH_TEXTS[dim.dimension].interpretation : WATCHPOINT_TEXTS[dim.dimension].interpretation;

      return {
        dimension: dim.dimension,
        score: dim.score,
        shortText: threshold ? threshold.short : fallbackShort,
        longText: threshold ? threshold.long : fallbackLong
      };
    });

    // ── Construction du résultat ─────────────────────────────────────────────
    return {
      globalScore,
      dimensions: dimensionScores,
      weather,
      balanceIndex,
      balanceLevel,
      balanceInterpretation,
      balanceInterpretationPremium,
      radarSummary,
      priorityDimension,
      strengths: strengthDetailTexts.map(({ title }) => title),
      watchpoints: watchpointDetailTexts.map(({ title }) => title),
      strengthDetails: strengthDetailTexts,
      watchpointDetails: watchpointDetailTexts,
      dimensionDetails,
      // Les profils sont calculés séparément par ProfileCalculationService et injectés par ResultService
      primaryProfile: "",
      secondaryProfile: "",
      profileSummary: "",
      radar: dimensionScores.map(({ label, score }) => ({ dimension: label, score })),
    };
  }
}
