/**
 * @file icr-calculation-service.ts
 * @module lib/iqrh
 * @description Service de calcul de l'ICR (Indice de Charge Relationnelle).
 *
 * L'ICR est un indicateur composite qui mesure la complexité de l'écosystème
 * relationnel d'un individu, indépendamment de ses scores IQRH.
 * Un score IQRH élevé avec un ICR élevé signale un "Équilibriste" : performant
 * malgré une grande charge. Un ICR élevé avec un IQRH bas signale une situation
 * de fragilité nécessitant un accompagnement prioritaire.
 *
 * L'ICR est calculé sur 4 composantes positives et 1 ressource protectrice :
 *   Score = (Complexité Familiale + Complexité Pro + Transitions + Charge Relationnelle)
 *          - Ressources Protectrices
 *   Plage : [0, 100]
 *
 * @see lib/iqrh/result-service.ts — Ce service est appelé par ResultService.submit()
 * @see lib/iqrh/types.ts — Types partagés (IqrhDimension)
 */

import type { IqrhDimension } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES D'ENTRÉE ET DE SORTIE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Données d'entrée nécessaires au calcul de l'ICR.
 * Combine le profil démographique, les scores IQRH calculés et les réponses adaptatives.
 */
export interface IcrInput {
  /** Situation professionnelle principale (ex: "Salarié", "Manager", "Retraité") */
  occupation: string;
  /** Taille de l'organisation (optionnel — uniquement pour les actifs) */
  organizationSize?: string | null;
  /** Indique si l'utilisateur a des enfants à charge */
  children: boolean;
  /** Nombre d'enfants (requis si children === true) */
  childrenCount?: number | null;
  /** Statut relationnel sentimental (ex: "En couple", "Célibataire", "Veuf(ve)") */
  relationshipStatus: string;
  /** Situations de vie spécifiques déclarées (ex: "Aidant", "Manager", "Deuil") */
  selectedSituations: readonly string[];
  /** Scores des 5 dimensions IQRH (0–100 chacun) */
  scores: Record<IqrhDimension, number>;
  /** Indice d'Équilibre Relationnel calculé par IQRHCalculationService (0–100) */
  balanceIndex: number;
  /** Score IQRH global (0–100) */
  globalScore: number;
  /** Réponses au questionnaire adaptatif (questions spécifiques au profil) */
  adaptiveAnswers: readonly {
    /** Valeur Likert (1–5) */
    value: number;
    /** Sens de la question : POSITIVE = plus c'est élevé, mieux c'est */
    polarity: "POSITIVE" | "NEGATIVE";
    /** Intitulé de la question (utilisé pour labelliser les ressources/freins) */
    label: string;
  }[];
}

/**
 * Résultat complet du calcul ICR.
 * Persisté dans la table `IcrResult` via `ResultService.submit()`.
 */
export interface IcrCalculation {
  /** Score ICR global de 0 à 100 (plus élevé = charge plus importante) */
  score: number;
  /** Sous-score : complexité familiale (0–20) */
  familyComplexity: number;
  /** Sous-score : complexité professionnelle (0–20) */
  professionalComplexity: number;
  /** Sous-score : intensité des transitions de vie (0–20) */
  lifeTransitions: number;
  /** Sous-score : charge relationnelle issue des réponses adaptatives (0–25) */
  relationalLoad: number;
  /** Sous-score déduit : ressources protectrices (0–15, soustrait du total) */
  protectiveResources: number;
  /** Niveau qualitatif (ex: "Complexité faible", "Complexité critique") */
  level: string;
  /** Texte d'interprétation du niveau ICR destiné au rapport */
  interpretation: string;
  /** Texte d'interprétation Premium du niveau ICR */
  interpretationPremium: string;
  /** Facteurs de risque identifiés (codes + libellés, ex: "caregiver_burden (Élevé)") */
  riskFactors: string[];
  /** Ressources protectrices identifiées (ex: "Réseau social fort") */
  protectiveFactors: string[];
  /** Top ressources (synthèse de protectiveFactors ou valeur par défaut) */
  resources: string[];
  /** Vulnérabilités principales identifiées */
  vulnerabilities: string[];
  /** Vulnérabilités détaillées (Premium) */
  vulnerabilityDetails: { title: string; interpretation: string; action: string; level: string }[];
  /** Freins à l'action détectés (limite à 5) */
  barriers: string[];
  /** Leviers d'action recommandés (limite à 5) */
  levers: string[];
  /** Besoins relationnels dominants déduits de l'analyse */
  dominantNeeds: string[];
  /** Besoins relationnels détaillés (Premium) */
  dominantNeedDetails: { title: string; interpretation: string; action: string }[];
  /** Blocs contextuels des modules adaptatifs sélectionnés (Premium) */
  moduleDetails: { title: string; interpretation: string; action: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES PRIVÉS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vérifie si une liste de situations en contient au moins une parmi plusieurs valeurs.
 * La comparaison est insensible à la casse et partielle (includes).
 *
 * @param items - Liste de situations déclarées par l'utilisateur
 * @param values - Une ou plusieurs chaînes à rechercher
 * @returns true si au moins une des `values` est trouvée dans `items`
 *
 * @example hasSituationAmong(["Manager", "Parent"], "Parent") // → true
 * @example hasSituationAmong(["Aidant"], "deuil", "divorce")  // → false
 */
const hasSituationAmong = (items: readonly string[], ...values: string[]) =>
  values.some((searchValue) =>
    items.some((item) => item.toLowerCase().includes(searchValue.toLowerCase()))
  );

/**
 * Plafonne une valeur numérique à un maximum donné.
 * Permet de s'assurer que chaque composante de l'ICR reste dans sa plage définie.
 *
 * @param value - Valeur à plafonner
 * @param max - Valeur maximale autorisée
 * @returns La valeur d'origine ou `max` si elle le dépasse
 */
const clampToMax = (value: number, max: number) => Math.min(value, max);

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Service de calcul de l'Indice de Charge Relationnelle (ICR).
 *
 * L'ICR est conçu pour capturer ce que l'IQRH seul ne voit pas :
 * la complexité de l'écosystème de vie d'une personne. Une personne peut avoir
 * un IQRH élevé (bonne qualité relationnelle) mais un ICR élevé (forte charge),
 * ce qui correspond au profil "Équilibriste" — performant mais à surveiller.
 */
export class IcrCalculationService {
  /**
   * Calcule l'ICR à partir du profil démographique et des scores IQRH.
   *
   * Les 5 composantes et leurs plafonds :
   * 1. Complexité Familiale     → [0–20 pts]
   * 2. Complexité Professionnelle → [0–20 pts]
   * 3. Transitions de vie        → [0–20 pts]
   * 4. Charge relationnelle      → [0–25 pts] (issues des réponses adaptatives)
   * 5. Ressources protectrices   → [0–15 pts] (déduits du total)
   *
   * Score final = somme composantes 1–4 − composante 5, clampé sur [0, 100]
   *
   * @param input - Données démographiques, scores IQRH et réponses adaptatives
   * @returns L'analyse ICR complète (score, niveaux, facteurs, leviers, besoins)
   */
  static calculate(input: IcrInput): IcrCalculation {
    const { selectedSituations } = input;

    // ── 1. Complexité Familiale (plafond : 20 pts) ──────────────────────────
    // Mesure la complexité des rôles et responsabilités familiales
    let familyPoints = 0;
    if (input.children) familyPoints += 5;
    if (input.childrenCount === 1) familyPoints += 2;
    else if (input.childrenCount === 2) familyPoints += 4;
    else if ((input.childrenCount ?? 0) >= 3) familyPoints += 6; // 3 enfants ou plus

    if (hasSituationAmong(selectedSituations, "Famille monoparentale")) familyPoints += 10;
    if (hasSituationAmong(selectedSituations, "Aidant")) familyPoints += 10;
    if (hasSituationAmong(selectedSituations, "Personne vivant seule")) familyPoints += 4;
    if (hasSituationAmong(selectedSituations, "Divorce")) familyPoints += 6;
    if (hasSituationAmong(selectedSituations, "Deuil")) familyPoints += 6;

    const familyComplexity = clampToMax(familyPoints, 20);

    // ── 2. Complexité Professionnelle (plafond : 20 pts) ────────────────────
    // Mesure la complexité des responsabilités dans la sphère professionnelle
    let professionalPoints = 0;
    if (input.occupation === "Salarié") professionalPoints += 3;
    if (hasSituationAmong(selectedSituations, "Manager")) professionalPoints += 8;
    if (hasSituationAmong(selectedSituations, "Entrepreneur")) professionalPoints += 10;
    if (hasSituationAmong(selectedSituations, "Création d'entreprise")) professionalPoints += 8;
    if (hasSituationAmong(selectedSituations, "Demandeur")) professionalPoints += 8; // Demandeur d'emploi
    if (hasSituationAmong(selectedSituations, "Étudiant")) professionalPoints += 5;
    if (hasSituationAmong(selectedSituations, "Retraité")) professionalPoints += 3;
    if (input.occupation === "Parent au foyer") professionalPoints += 5;

    // Bonus selon la taille de l'organisation (plus grande = plus de complexité)
    if (input.organizationSize === "51 à 250 salariés") professionalPoints += 2;
    else if (input.organizationSize === "Plus de 250 salariés") professionalPoints += 3;

    const professionalComplexity = clampToMax(professionalPoints, 20);

    // ── 3. Transitions de vie (plafond : 20 pts) ────────────────────────────
    // Mesure l'impact des événements de vie déstabilisants actuels
    let transitionPoints = 0;
    if (hasSituationAmong(selectedSituations, "Divorce")) transitionPoints += 10;
    if (hasSituationAmong(selectedSituations, "Deuil")) transitionPoints += 10;
    if (hasSituationAmong(selectedSituations, "Demandeur")) transitionPoints += 8;
    if (hasSituationAmong(selectedSituations, "Création d'entreprise")) transitionPoints += 8;
    if (hasSituationAmong(selectedSituations, "Étudiant")) transitionPoints += 4;
    if (["Séparé(e) / Divorcé(e)", "Veuf(ve)"].includes(input.relationshipStatus)) transitionPoints += 6;

    const lifeTransitions = clampToMax(transitionPoints, 20);

    // ── 4. Charge Relationnelle (plafond : 25 pts) ─────────────────────────
    // Calculée à partir des réponses au questionnaire adaptatif (modules spécifiques)
    // Logique : une réponse extrême à une question adaptative indique une forte charge
    let relationalLoadPoints = 0;
    for (const adaptiveAnswer of input.adaptiveAnswers) {
      if (adaptiveAnswer.polarity === "POSITIVE") {
        // Question positive : un score faible = réponse négative = charge élevée
        if (adaptiveAnswer.value === 1) relationalLoadPoints += 4;
        else if (adaptiveAnswer.value === 2) relationalLoadPoints += 2;
        else if (adaptiveAnswer.value === 3) relationalLoadPoints += 1;
      } else {
        // Question négative : un score fort = réponse défavorable = charge élevée
        if (adaptiveAnswer.value === 5) relationalLoadPoints += 4;
        else if (adaptiveAnswer.value === 4) relationalLoadPoints += 2;
        else if (adaptiveAnswer.value === 3) relationalLoadPoints += 1;
      }
    }
    const relationalLoad = clampToMax(relationalLoadPoints, 25);

    // ── 5. Ressources Protectrices (plafond : 15 pts à déduire) ─────────────
    // Les ressources protectrices diminuent le score ICR — elles agissent comme amortisseurs
    let protectivePoints = 0;
    const identifiedProtectors: string[] = [];

    if (input.scores.SOCIAL >= 70) {
      protectivePoints += 3;
      identifiedProtectors.push("Réseau social fort");
    }
    if (input.scores.AFFECTIVE >= 70) {
      protectivePoints += 3;
      identifiedProtectors.push("Soutien affectif fort");
    }
    if (input.scores.SENTIMENTAL >= 70) {
      protectivePoints += 2;
      identifiedProtectors.push("Équilibre sentimental");
    }
    if (input.scores.PROFESSIONAL >= 70) {
      protectivePoints += 2;
      identifiedProtectors.push("Activité soutenante");
    }
    if (input.scores.SELF >= 70) {
      protectivePoints += 3;
      identifiedProtectors.push("Relation à soi solide");
    }
    if (input.balanceIndex >= 75) {
      protectivePoints += 2;
      identifiedProtectors.push("IER élevé");
    }
    if (input.globalScore >= 70) {
      protectivePoints += 2;
      identifiedProtectors.push("Météo relationnelle favorable");
    }

    // Les réponses adaptatives très positives (score 4–5 sur question positive) sont aussi des ressources
    input.adaptiveAnswers
      .filter((answer) => answer.polarity === "POSITIVE" && answer.value >= 4)
      .forEach((answer) => {
        protectivePoints += 2;
        identifiedProtectors.push(answer.label);
      });

    const protectiveResources = clampToMax(protectivePoints, 15);

    // ── Calcul du score ICR final ─────────────────────────────────────────────
    const rawScore = familyComplexity + professionalComplexity + lifeTransitions + relationalLoad - protectiveResources;
    const finalScore = Math.max(0, Math.min(100, rawScore));

    // ── Interprétation du niveau ICR ────────────────────────────────────────
    let level = "";
    let interpretation = "";
    let interpretationPremium = "";

    if (finalScore <= 20) {
      level = "Complexité faible";
      interpretation = "Votre écosystème relationnel est actuellement relativement simple ou bien soutenu.";
      interpretationPremium = "Votre ICR indique une complexité faible. Vos rôles, responsabilités et éventuelles transitions semblent globalement compatibles avec les ressources et soutiens dont vous disposez. L'objectif est surtout de préserver ces facteurs protecteurs et de rester attentif(ve) à l'apparition de nouvelles contraintes.";
    } else if (finalScore <= 40) {
      level = "Complexité modérée";
      interpretation = "Plusieurs rôles ou contraintes sont présents, mais ils restent globalement maîtrisables.";
      interpretationPremium = "Votre ICR indique une complexité modérée. Vous composez avec plusieurs responsabilités, mais vos ressources semblent encore permettre de maintenir un niveau de fonctionnement relativement stable. L'enjeu est de repérer les premières zones de surcharge avant qu'elles ne s'installent et de consolider les relais disponibles.";
    } else if (finalScore <= 60) {
      level = "Complexité élevée";
      interpretation = "Votre contexte de vie vous expose à plusieurs sources de pression relationnelle.";
      interpretationPremium = "Votre ICR indique une complexité élevée. Plusieurs rôles, responsabilités ou transitions mobilisent votre énergie simultanément. L'objectif n'est pas de supprimer ces responsabilités, mais d'identifier les relais, ressources, limites et ajustements capables de réduire la charge relationnelle.";
    } else if (finalScore <= 80) {
      level = "Complexité très élevée";
      interpretation = "Votre charge relationnelle est importante et nécessite des relais plus solides.";
      interpretationPremium = "Votre ICR indique une complexité très élevée. Votre écosystème relationnel comporte de nombreuses contraintes ou responsabilités et peut solliciter fortement vos capacités d'adaptation. La priorité est de ne plus tout traiter comme également urgent : délégation, soutien, récupération et simplification doivent devenir des axes concrets de votre ordonnance relationnelle.";
    } else {
      level = "Complexité critique";
      interpretation = "Votre écosystème relationnel est fortement sous tension et nécessite un accompagnement prioritaire.";
      interpretationPremium = "Votre ICR indique une complexité critique. Le cumul des responsabilités, transitions et charges vécues dépasse probablement le niveau que vos ressources protectrices peuvent absorber durablement. L'objectif est de sécuriser rapidement des relais, de réduire certaines charges lorsque cela est possible et de vous orienter vers les soutiens adaptés à votre situation. L'ICR ne constitue pas un diagnostic : il mesure la pression potentielle de votre contexte relationnel.";
    }

    // ── Facteurs de risque ───────────────────────────────────────────────────
    const riskFactors: string[] = [];
    if (hasSituationAmong(selectedSituations, "Aidant")) riskFactors.push("caregiver_burden (Élevé) — Charge d'aidant familial");
    if (hasSituationAmong(selectedSituations, "Divorce", "Deuil")) riskFactors.push("relationship_conflict (Élevé) — Transition relationnelle majeure");
    if (hasSituationAmong(selectedSituations, "Demandeur")) riskFactors.push("lack_support (Moyen) — Recherche d'emploi");
    if (hasSituationAmong(selectedSituations, "Famille monoparentale")) riskFactors.push("mental_load (Critique) — Charge monoparentale");
    if (input.scores.SOCIAL < 40) riskFactors.push("social_isolation (Élevé) — Isolement social");
    if (input.scores.SELF < 40) riskFactors.push("mental_load (Élevé) — Surcharge mentale");
    if (hasSituationAmong(selectedSituations, "Entrepreneur", "Manager")) riskFactors.push("decision_loneliness (Moyen) — Solitude décisionnelle");

    // ── Freins à l'action ────────────────────────────────────────────────────
    const identifiedBarriers: string[] = [];
    if (hasSituationAmong(selectedSituations, "Entrepreneur", "Manager", "Aidant")) identifiedBarriers.push("Peu de temps personnel disponible");
    if (hasSituationAmong(selectedSituations, "Personne vivant seule")) identifiedBarriers.push("Difficulté à demander de l'aide");
    if (input.scores.SOCIAL < 40) identifiedBarriers.push("Réseau social restreint");
    // Les réponses adaptatives très faibles sur des questions positives indiquent des freins
    input.adaptiveAnswers
      .filter((answer) => answer.value <= 2 && answer.polarity === "POSITIVE")
      .forEach((answer) => identifiedBarriers.push(answer.label));

    // ── Leviers d'action ─────────────────────────────────────────────────────
    const identifiedLevers: string[] = [];
    if (input.scores.SOCIAL < 60) identifiedLevers.push("Développer un réseau de confiance");
    if (input.scores.SELF < 60) identifiedLevers.push("Réduire la charge mentale et créer du temps personnel");
    if (hasSituationAmong(selectedSituations, "Aidant", "Manager", "Parent")) identifiedLevers.push("Partager les responsabilités et s'appuyer sur des relais");
    if (input.scores.AFFECTIVE < 60) identifiedLevers.push("Améliorer la communication et l'expression des besoins");
    // Chaque ressource protectrice identifiée devient un levier à capitaliser
    identifiedProtectors.forEach((protector) => identifiedLevers.push(`Capitaliser sur : ${protector}`));

    // ── Besoins relationnels dominants ───────────────────────────────────────
    const needsScores = [
      {
        title: "Appartenance",
        interpretation: "Le besoin d'appartenance correspond au besoin de se sentir relié(e) à un groupe, un environnement ou une communauté dans laquelle on a réellement sa place.",
        action: "Privilégiez un espace récurrent où les mêmes personnes se retrouvent : association, groupe, réseau, activité ou communauté locale.",
        score: 100 - input.scores.SOCIAL
      },
      {
        title: "Reconnaissance",
        interpretation: "Le besoin de reconnaissance correspond au besoin de se sentir vu(e), considéré(e) et légitime dans ce que l'on fait ou apporte.",
        action: "Identifiez les environnements où votre contribution est reconnue et exprimez plus clairement ce dont vous avez besoin pour vous sentir considéré(e).",
        score: (100 - input.scores.PROFESSIONAL) + (hasSituationAmong(selectedSituations, "Manager", "Entrepreneur") ? 15 : 0)
      },
      {
        title: "Soutien",
        interpretation: "Le besoin de soutien renvoie à la possibilité de ne pas devoir tout traverser ou décider seul(e), notamment lorsque la charge augmente.",
        action: "Repérez les personnes capables d'offrir trois formes de soutien différentes : écoute, conseil et aide concrète.",
        score: (100 - input.scores.AFFECTIVE) + (hasSituationAmong(selectedSituations, "Aidant", "Manager", "Parent") ? 15 : 0)
      },
      {
        title: "Sécurité",
        interpretation: "Le besoin de sécurité relationnelle correspond au besoin de pouvoir être soi-même, exprimer ses émotions et faire confiance sans craindre une rupture ou un jugement permanent.",
        action: "Renforcez les relations dans lesquelles vous pouvez parler avec sincérité et posez des limites dans celles qui fragilisent votre sécurité.",
        score: (100 - input.scores.AFFECTIVE) + (hasSituationAmong(selectedSituations, "Divorce", "Deuil", "Demandeur") ? 20 : 0)
      },
      {
        title: "Autonomie",
        interpretation: "Le besoin d'autonomie correspond au besoin de conserver un espace de choix, de liberté et de maîtrise dans ses relations et responsabilités.",
        action: "Réservez régulièrement un temps ou une décision qui vous appartient pleinement, sans devoir répondre aux attentes des autres.",
        score: (100 - input.scores.SELF) + (hasSituationAmong(selectedSituations, "Manager", "Aidant", "Parent") ? 15 : 0)
      },
      {
        title: "Sens",
        interpretation: "Le besoin de sens correspond au besoin de percevoir une cohérence entre ses valeurs, ses relations, ses engagements et la direction donnée à sa vie.",
        action: "Identifiez une activité, un projet ou une relation qui vous reconnecte concrètement à ce qui compte le plus pour vous aujourd'hui.",
        score: (100 - input.scores.SELF) + (hasSituationAmong(selectedSituations, "Retraité", "Demandeur") ? 15 : 0)
      }
    ];

    const dominantNeedDetails = needsScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(n => ({ title: n.title, interpretation: n.interpretation, action: n.action }));

    const dominantNeeds = dominantNeedDetails.map(n => n.title);

    // ── Modules adaptatifs sélectionnés (PREMIUM) ──────────────────────────
    const ALL_MODULES: Record<string, { interpretation: string; action: string }> = {
      "Célibataire": {
        interpretation: "Les réponses au module Célibataire suggèrent que votre vie sentimentale doit être lue à partir de vos opportunités de rencontre, de la manière dont votre entourage respecte votre situation et de la clarté de ce que vous souhaitez construire.",
        action: "Lorsque les réponses sont fragiles, la priorité n'est pas nécessairement de multiplier les rencontres, mais de clarifier vos attentes, d'identifier les freins et d'augmenter progressivement les occasions compatibles avec vos besoins."
      },
      "En couple": {
        interpretation: "Le module Couple permet d'apprécier la place laissée à la relation dans l'organisation quotidienne, la qualité des temps partagés, l'impact des responsabilités extérieures et la vision commune de l'avenir.",
        action: "Lorsque plusieurs réponses sont faibles, la priorité consiste à recréer du temps de qualité, à partager plus explicitement les contraintes et à identifier les soutiens disponibles en cas de difficulté."
      },
      "Parent": {
        interpretation: "Le module Parent permet de comprendre l'impact des responsabilités parentales sur la vie sociale, le temps personnel, les relais et la reconnaissance du rôle de parent.",
        action: "Lorsque la charge est élevée, l'objectif est de diminuer la culpabilité liée au temps pour soi, d'identifier des relais et de préserver des espaces personnels réguliers."
      },
      "Famille monoparentale": {
        interpretation: "Le module Famille monoparentale explore le réseau d'entraide, les contraintes d'organisation, la charge administrative et la capacité à conserver des projets personnels.",
        action: "Lorsque plusieurs réponses sont fragiles, la priorité est de renforcer les relais pratiques et relationnels et de protéger une part minimale de temps personnel."
      },
      "Entrepreneur": {
        interpretation: "Le module Entrepreneur permet d'identifier la solitude décisionnelle, la compréhension de l'entourage, la difficulté à déconnecter, le report des temps personnels et l'appartenance à un réseau de pairs.",
        action: "Lorsque la charge est élevée, la priorité est de sortir de l'isolement décisionnel, de créer des espaces de pairs et de restaurer des limites entre activité et vie personnelle."
      },
      "Manager": {
        interpretation: "Le module Manager explore les espaces de partage, la charge émotionnelle, le temps disponible pour l'équipe, le soutien dans les situations complexes et l'accès aux outils adaptés.",
        action: "Lorsque plusieurs réponses sont fragiles, l'objectif est de créer espaces de supervision ou de pairs, de renforcer le soutien managérial et de réduire la solitude liée aux situations complexes."
      },
      "Etudiant": {
        interpretation: "Le module Étudiant évalue la facilité à créer du lien, la participation à des activités, la connaissance des ressources d'aide, l'impact des études sur la vie sociale et le sentiment d'encouragement.",
        action: "Lorsque les réponses sont fragiles, la priorité est de faciliter l'intégration, de rendre visibles les ressources disponibles et de créer des rendez-vous sociaux réguliers autour des études ou des centres d'intérêt."
      },
      "Retraité": {
        interpretation: "Le module Retraité explore la participation à des activités, la découverte de nouveaux centres d'intérêt, l'évolution du réseau, les occasions de partage et le sentiment d'être acteur de cette étape de vie.",
        action: "Lorsque les réponses sont fragiles, l'objectif est de recréer des rôles, des activités et des rendez-vous réguliers qui soutiennent le sentiment d'utilité et d'appartenance."
      },
      "Aidant": {
        interpretation: "Le module Aidant explore la connaissance des dispositifs, la capacité à demander de l'aide, l'impact du rôle d'aidant sur les autres relations, le répit et la compréhension de l'entourage.",
        action: "Lorsque la charge est élevée, la priorité est d'organiser du répit, de mobiliser les dispositifs disponibles et de préserver les relations qui ne sont pas uniquement centrées sur le rôle d'aidant."
      },
      "Personne vivant seule": {
        interpretation: "Ce module permet de distinguer un mode de vie choisi d'un isolement subi, à travers le logement, l'initiative relationnelle, la participation locale et la connexion au voisinage.",
        action: "Lorsque les réponses sont fragiles, l'objectif est de recréer des occasions régulières et proches géographiquement de rencontre, sans remettre en cause le besoin éventuel d'autonomie."
      },
      "Demandeur": {
        interpretation: "Le module Demandeur d'emploi explore le rythme de vie, le maintien du réseau professionnel, la connaissance des dispositifs, l'impact social de la situation et le développement des compétences.",
        action: "Lorsque plusieurs réponses sont fragiles, l'objectif est de préserver une structure quotidienne, un réseau professionnel actif et des espaces sociaux qui ne dépendent pas uniquement de la recherche d'emploi."
      },
      "Création d'entreprise": {
        interpretation: "Le module Création d'entreprise évalue l'accompagnement, la qualité du réseau, l'impact du lancement sur la vie personnelle, l'accès à des interlocuteurs et la capacité à célébrer les réussites.",
        action: "Lorsque la charge est élevée, la priorité est de construire rapidement un écosystème de pairs et de soutiens afin d'éviter que toutes les décisions et tensions reposent sur une seule personne."
      },
      "Divorce": {
        interpretation: "Le module Séparation explore le soutien de l'entourage, l'évolution du réseau, le poids administratif ou financier, la reconstruction des repères et la capacité à imaginer un nouveau projet de vie.",
        action: "Lorsque plusieurs réponses sont fragiles, l'objectif est de sécuriser les repères du quotidien, de préserver les soutiens fiables et d'avancer progressivement vers une nouvelle organisation relationnelle."
      },
      "Deuil": {
        interpretation: "Le module Deuil explore la possibilité de parler de la personne disparue, le respect du rythme, la connaissance des ressources, le retour progressif du plaisir et le maintien des liens importants.",
        action: "Lorsque les réponses sont fragiles, la priorité est de préserver des personnes respectueuses du rythme vécu et de rendre accessibles les ressources d'accompagnement si le besoin apparaît."
      }
    };

    const moduleDetails: { title: string; interpretation: string; action: string }[] = [];
    const allSits = [input.occupation, input.relationshipStatus, ...(input.selectedSituations || [])];
    const handledKeys = new Set<string>();
    
    allSits.filter(Boolean).forEach(sit => {
      const matchedKey = Object.keys(ALL_MODULES).find(k => 
        sit.toLowerCase().includes(k.toLowerCase()) || 
        (k === "Etudiant" && sit.toLowerCase().includes("étudiant")) ||
        (k === "Deuil" && sit.toLowerCase().includes("deuil")) ||
        (k === "Divorce" && (sit.toLowerCase().includes("divorce") || sit.toLowerCase().includes("séparation")))
      );
      if (matchedKey && !handledKeys.has(matchedKey)) {
        handledKeys.add(matchedKey);
        moduleDetails.push({
          title: `Module ${matchedKey}`,
          interpretation: ALL_MODULES[matchedKey].interpretation,
          action: ALL_MODULES[matchedKey].action
        });
      }
    });

    // ── Vulnérabilités principales ───────────────────────────────────────────
    const vulnerabilities: string[] = [];
    if (hasSituationAmong(selectedSituations, "Aidant", "Parent")) vulnerabilities.push("Charge mentale et surinvestissement");
    if (input.scores.SOCIAL < 50) vulnerabilities.push("Isolement social ou manque de relais");
    if (input.scores.SELF < 50) vulnerabilities.push("Fatigue intérieure et oubli de soi");
    if (hasSituationAmong(selectedSituations, "Divorce", "Deuil")) vulnerabilities.push("Instabilité émotionnelle liée à une transition");

    // ── Vulnérabilités Détaillées (PREMIUM) ───────────────────────────────────
    const vulnScores = [
      {
        title: "Charge mentale",
        interpretation: "Vous semblez devoir garder en tête de nombreuses responsabilités, décisions ou tâches simultanément. Cette charge peut réduire votre disponibilité relationnelle et votre capacité à récupérer.",
        action: "Partager, déléguer ou externaliser une responsabilité précise plutôt que chercher à tout alléger d'un coup.",
        score: (100 - input.scores.SELF) + (hasSituationAmong(selectedSituations, "Parent", "Famille monoparentale", "Aidant") ? 20 : 0)
      },
      {
        title: "Solitude décisionnelle",
        interpretation: "Vous pouvez avoir le sentiment de devoir prendre seul(e) des décisions importantes sans disposer d'un espace suffisamment sécurisant pour les partager.",
        action: "Identifier un pair, un proche ou un professionnel avec lequel poser régulièrement les décisions complexes.",
        score: hasSituationAmong(selectedSituations, "Entrepreneur", "Manager", "Dirigeant") ? (100 - input.scores.SOCIAL) + 20 : 0
      },
      {
        title: "Manque de relais",
        interpretation: "Vos réponses suggèrent que vous disposez de peu de personnes ou de dispositifs capables de prendre le relais lorsque la charge augmente.",
        action: "Cartographier trois relais possibles : personnel, professionnel et pratique.",
        score: (100 - input.scores.SOCIAL) + (hasSituationAmong(selectedSituations, "Personne vivant seule") ? 10 : 0)
      },
      {
        title: "Fatigue émotionnelle",
        interpretation: "Une part importante de votre énergie semble mobilisée par la gestion des émotions, des tensions ou du soutien apporté aux autres.",
        action: "Créer un espace régulier de récupération et réduire au moins une sollicitation non essentielle.",
        score: (100 - input.scores.AFFECTIVE) + (hasSituationAmong(selectedSituations, "Aidant", "Manager", "Deuil", "Divorce") ? 20 : 0)
      },
      {
        title: "Isolement social",
        interpretation: "La fréquence ou la qualité de vos liens sociaux semble insuffisante pour répondre pleinement à votre besoin de connexion et d'appartenance.",
        action: "Créer un rendez-vous relationnel régulier et répétitif plutôt qu'une action ponctuelle.",
        score: 100 - input.scores.SOCIAL
      },
      {
        title: "Isolement professionnel",
        interpretation: "Votre activité peut être vécue avec un manque de pairs, de soutien, de reconnaissance ou d'espaces de partage.",
        action: "Rejoindre un réseau de pairs ou instaurer un rendez-vous régulier de partage professionnel.",
        score: (input.occupation !== "Retraité" && input.occupation !== "Etudiant") ? (100 - input.scores.PROFESSIONAL) + (hasSituationAmong(selectedSituations, "Entrepreneur", "Indépendant", "Télétravail") ? 20 : 0) : 0
      },
      {
        title: "Conflit vie personnelle / vie professionnelle",
        interpretation: "Les exigences de votre activité semblent empiéter sur votre temps personnel ou relationnel.",
        action: "Définir une limite concrète et observable entre temps d'activité et temps personnel.",
        score: input.occupation !== "Retraité" ? (100 - input.scores.PROFESSIONAL) / 2 + (100 - input.scores.SELF) / 2 + (hasSituationAmong(selectedSituations, "Manager", "Entrepreneur") ? 10 : 0) : 0
      },
      {
        title: "Difficulté à demander de l'aide",
        interpretation: "Vous pouvez avoir tendance à solliciter de l'aide tardivement, même lorsque la charge devient importante.",
        action: "Formuler cette semaine une demande d'aide précise, limitée et concrète.",
        score: (100 - input.scores.SOCIAL) / 2 + (hasSituationAmong(selectedSituations, "Personne vivant seule", "Manager") ? 30 : 0)
      },
      {
        title: "Manque de temps relationnel",
        interpretation: "Votre organisation actuelle laisse peu de place à des relations de qualité, même lorsque les personnes ressources existent.",
        action: "Protéger un créneau relationnel dans l'agenda comme un rendez-vous prioritaire.",
        score: (100 - input.scores.SELF) + (selectedSituations.length >= 2 ? 20 : 0)
      },
      {
        title: "Surcharge de rôles",
        interpretation: "Vous cumulez plusieurs rôles importants qui peuvent entrer en concurrence pour votre temps, votre énergie et votre disponibilité émotionnelle.",
        action: "Identifier le rôle qui demande actuellement le plus d'énergie et celui qui peut être temporairement allégé.",
        score: selectedSituations.length * 20
      }
    ];

    const vulnerabilityDetails = vulnScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(v => {
        const levelText = v.score >= 80 ? "🔴 Critique" : v.score >= 60 ? "🟠 Élevé" : "🟡 Modéré";
        return {
          title: `${levelText} - ${v.title}`,
          interpretation: v.interpretation,
          action: v.action,
          level: levelText
        };
      });

    // Top ressources : les protecteurs identifiés, ou les valeurs par défaut si aucun
    const topResources = identifiedProtectors.length > 0
      ? identifiedProtectors
      : ["Résilience personnelle", "Adaptabilité"];

    return {
      score: finalScore,
      familyComplexity,
      professionalComplexity,
      lifeTransitions,
      relationalLoad,
      protectiveResources,
      level,
      interpretation,
      interpretationPremium,
      riskFactors,
      protectiveFactors: identifiedProtectors,
      resources: topResources,
      vulnerabilities,
      vulnerabilityDetails,
      barriers: identifiedBarriers.slice(0, 5),  // Dédoublonnage + limite à 5
      levers: Array.from(new Set(identifiedLevers)).slice(0, 5),       // Dédoublonnage + limite à 5
      dominantNeeds,
      dominantNeedDetails,
      moduleDetails,
    };
  }
}
