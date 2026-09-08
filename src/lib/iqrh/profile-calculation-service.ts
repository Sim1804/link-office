import type { IqrhDimension } from "./types";

export interface ProfileInput {
  globalScore: number;
  balanceIndex: number;
  icrScore: number;
  scores: Record<IqrhDimension, number>;
  situations: readonly string[];
}

export interface ProfileDetails {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  typicalResults: string[];
  dominantNeeds: string[];
  strengths: string[];
  watchpoints: string[];
  recommendations: string[];
}

export interface ProfileCalculation {
  primaryName: string;
  secondaryName: string;
  primaryScore: number;
  secondaryScore: number;
  primaryConfidence: number;
  secondaryConfidence: number;
  signature: string;
  scores: Record<string, number>;
  primaryDetails?: ProfileDetails;
  secondaryDetails?: ProfileDetails;
  irisContext: Record<string, string | number>;
}

/**
 * Registre complet des 12 profils relationnels IQRH avec leurs métadonnées psychométriques.
 */
export const IQRH_PROFILES_REGISTRY: Record<string, ProfileDetails> = {
  "Le Connecteur": {
    id: "PROFIL_1",
    name: "Le Connecteur",
    shortDescription: "Le Connecteur nourrit naturellement ses relations, crée facilement du lien et trouve de l'énergie dans les interactions humaines.",
    longDescription: "Vous semblez vous appuyer spontanément sur les relations, les échanges et les dynamiques collectives. Votre capacité à créer ou entretenir un réseau constitue une ressource importante. Vous pouvez être à l'aise pour faire circuler l'information, rassembler ou créer des opportunités relationnelles. Votre vigilance principale concerne la dispersion ou le risque de vous rendre très disponible pour les autres sans toujours préserver suffisamment d'espace pour vous. Votre enjeu est de privilégier la qualité à la quantité et d'identifier les relations qui vous nourrissent réellement.",
    dominantNeeds: ["Appartenance", "échanges", "coopération"],
    strengths: ["Sociabilité", "réseau", "création d'opportunités"],
    watchpoints: ["Dispersion relationnelle", "oubli de soi"],
    typicalResults: ["D1 très élevé (Relations sociales)", "D2 élevé", "IER élevé"],
    recommendations: ["Préserver des temps pour soi", "Privilégier la qualité à la quantité des relations"]
  },
  "L'Ancre": {
    id: "PROFIL_2",
    name: "L'Ancre",
    shortDescription: "L'Ancre recherche des relations profondes, stables et sécurisantes fondées sur la confiance et la fidélité.",
    longDescription: "Votre équilibre semble reposer sur la qualité et la stabilité de quelques relations significatives. Vous accordez probablement beaucoup d'importance à la confiance, à la loyauté et à la sécurité émotionnelle. Cette capacité à construire des liens profonds constitue une ressource précieuse. Votre vigilance concerne surtout les périodes de changement ou les relations qui restent en place alors qu'elles sont devenues moins équilibrées. Votre enjeu est de préserver votre besoin de stabilité tout en vous autorisant à exprimer vos besoins et à ouvrir progressivement votre cercle lorsque cela devient utile.",
    dominantNeeds: ["Sécurité", "stabilité", "authenticité"],
    strengths: ["Loyauté", "écoute", "fiabilité"],
    watchpoints: ["Difficulté face au changement", "maintien de liens déséquilibrés"],
    typicalResults: ["D2 élevé", "D5 élevé"],
    recommendations: ["Élargir progressivement son cercle relationnel", "Exprimer davantage ses besoins"]
  },
  "Le Bâtisseur": {
    id: "PROFIL_3",
    name: "Le Bâtisseur",
    shortDescription: "Le Bâtisseur tire une grande partie de son équilibre de son activité, de ses projets et de son engagement.",
    longDescription: "Vous semblez trouver beaucoup d'énergie dans l'action, l'utilité, les projets et le sentiment d'accomplissement. Votre capacité d'engagement et de persévérance peut constituer un véritable moteur relationnel et personnel. Vous aimez probablement sentir que vous avancez et que votre activité a du sens. La vigilance concerne le surinvestissement : lorsque les responsabilités augmentent, les autres sphères de vie peuvent passer au second plan. Votre enjeu consiste à conserver votre dynamique d'accomplissement tout en protégeant les relations et les temps de récupération qui soutiennent durablement votre énergie.",
    dominantNeeds: ["Utilité", "accomplissement", "autonomie"],
    strengths: ["Engagement", "persévérance", "leadership"],
    watchpoints: ["Surinvestissement", "difficulté à déconnecter"],
    typicalResults: ["D4 très élevé", "D5 élevé"],
    recommendations: ["Préserver l'équilibre des autres sphères de vie", "Déléguer davantage"]
  },
  "Le Protecteur": {
    id: "PROFIL_4",
    name: "Le Protecteur",
    shortDescription: "Le Protecteur consacre une part importante de son énergie au bien-être, au soutien ou à l'accompagnement des autres.",
    longDescription: "Vous semblez naturellement attentif(ve) aux besoins des personnes qui vous entourent. L'empathie, la disponibilité et le sens des responsabilités constituent des forces importantes dans votre manière d'entrer en relation. Cette posture peut être particulièrement présente lorsque vous êtes parent, aidant, manager ou personne ressource dans votre entourage. Le risque est que le soutien devienne à sens unique, que vous demandiez peu d'aide ou que votre propre besoin de récupération soit repoussé. Votre enjeu est d'apprendre à recevoir autant qu'à donner et à partager davantage les responsabilités.",
    dominantNeeds: ["Reconnaissance", "soutien", "partage des responsabilités"],
    strengths: ["Empathie", "disponibilité", "sens des responsabilités"],
    watchpoints: ["Charge mentale", "épuisement relationnel"],
    typicalResults: ["D2 élevé", "Modules Parent, Aidant ou Manager activés"],
    recommendations: ["Apprendre à demander de l'aide", "Préserver du temps personnel"]
  },
  "Le Résilient": {
    id: "PROFIL_5",
    name: "Le Résilient",
    shortDescription: "Le Résilient traverse des contextes complexes tout en conservant des ressources importantes pour s'adapter et rebondir.",
    longDescription: "Votre profil suggère que vous composez avec plusieurs contraintes ou transitions tout en maintenant un niveau de qualité relationnelle relativement protecteur. Votre adaptabilité, votre persévérance ou votre capacité à mobiliser des ressources vous permettent probablement de continuer à avancer malgré la complexité. Cette solidité peut toutefois rendre la fatigue moins visible, y compris pour vous-même. Votre vigilance concerne l'accumulation : être capable de tenir ne signifie pas qu'il faut tout porter durablement. Votre enjeu est d'identifier les signaux faibles, de préserver la récupération et d'accepter les relais avant l'épuisement.",
    dominantNeeds: ["Soutien", "reconnaissance", "récupération"],
    strengths: ["Adaptabilité", "optimisme", "persévérance"],
    watchpoints: ["Fatigue invisible", "accumulation des responsabilités"],
    typicalResults: ["ICR élevé", "IQRH moyen ou élevé", "IER satisfaisant"],
    recommendations: ["Identifier les signaux faibles", "Accepter de ralentir"]
  },
  "L'Explorateur": {
    id: "PROFIL_6",
    name: "L'Explorateur",
    shortDescription: "L'Explorateur est curieux, ouvert et attiré par la nouveauté, les rencontres et les expériences relationnelles variées.",
    longDescription: "Vous semblez trouver de l'énergie dans la découverte, la diversité et les nouvelles expériences. Votre curiosité et votre ouverture facilitent les rencontres et vous permettent de vous adapter à différents environnements relationnels. Cette dynamique est particulièrement utile dans les phases de transition, d'études, de mobilité ou de célibat. La vigilance concerne la continuité : multiplier les expériences ne garantit pas toujours la profondeur ou la stabilité des liens. Votre enjeu est de repérer les relations qui méritent d'être consolidées dans le temps sans perdre votre besoin de liberté et de nouveauté.",
    dominantNeeds: ["Découverte", "nouveauté", "diversité"],
    strengths: ["Curiosité", "créativité", "ouverture"],
    watchpoints: ["Difficulté à s'engager durablement"],
    typicalResults: ["D1 élevé", "D3 moyen", "Modules Célibataire ou Étudiant fréquents"],
    recommendations: ["Consolider les relations importantes"]
  },
  "Le Chercheur d'équilibre": {
    id: "PROFIL_7",
    name: "Le Chercheur d'équilibre",
    shortDescription: "Le Chercheur d'équilibre cherche à harmoniser les différentes sphères de sa vie et à maintenir une cohérence globale.",
    longDescription: "Vous semblez particulièrement sensible à l'équilibre entre vos différents rôles et besoins. Votre capacité de recul, d'organisation et de régulation vous aide probablement à éviter qu'une sphère prenne durablement toute la place. Vous recherchez la cohérence et la sérénité plus que l'intensité. Cette recherche d'harmonie constitue une force, mais elle peut parfois conduire à éviter un conflit nécessaire ou à retarder une décision qui risquerait de déséquilibrer temporairement l'ensemble. Votre enjeu est de conserver votre stabilité tout en acceptant que certains ajustements demandent parfois une période transitoire d'inconfort.",
    dominantNeeds: ["Équilibre", "cohérence", "sérénité"],
    strengths: ["Stabilité", "recul", "organisation"],
    watchpoints: ["Peur du conflit", "évitement de décisions difficiles"],
    typicalResults: ["Cinq dimensions proches", "IER très élevé"],
    recommendations: ["Exprimer fermement ses choix", "Accepter les frictions constructives"]
  },
  "Le Soliste": {
    id: "PROFIL_8",
    name: "Le Soliste",
    shortDescription: "Le Soliste fonctionne volontiers en autonomie et apprécie ses espaces personnels, sans rechercher en permanence la présence des autres.",
    longDescription: "Votre équilibre semble reposer en partie sur votre autonomie et votre capacité à fonctionner seul(e). Vous pouvez apprécier les temps personnels, la liberté d'organisation et la possibilité de réfléchir sans sollicitation permanente. Cette indépendance est une ressource lorsqu'elle correspond réellement à votre choix. La vigilance apparaît lorsque l'autonomie devient progressivement isolement ou lorsque les relations ressources se raréfient sans que vous vous en rendiez compte. Votre enjeu n'est pas de devenir plus sociable, mais de maintenir quelques liens fiables et choisis qui restent disponibles lorsque vous en avez besoin.",
    dominantNeeds: ["Indépendance", "liberté"],
    strengths: ["Autonomie", "réflexion", "adaptabilité"],
    watchpoints: ["Isolement progressif"],
    typicalResults: ["D5 élevé", "D1 faible", "Module Personne vivant seule"],
    recommendations: ["Maintenir quelques relations ressources"]
  },
  "Le Suradapté": {
    id: "PROFIL_9",
    name: "Le Suradapté",
    shortDescription: "Le Suradapté répond souvent aux attentes des autres avant de répondre aux siennes.",
    longDescription: "Vous semblez très impliqué(e) dans vos responsabilités et attentif(ve) à ce que l'on attend de vous. Votre sens du devoir et votre capacité d'adaptation peuvent vous rendre particulièrement fiable dans les rôles de parent, manager, aidant ou personne ressource. Le risque est que vos propres besoins passent au second plan et que la surcharge devienne progressivement normale. Votre enjeu est de repérer ce que vous acceptez par choix et ce que vous acceptez par difficulté à poser une limite. Renforcer l'expression de vos besoins et vous autoriser à demander de l'aide constituent des leviers importants.",
    dominantNeeds: ["Reconnaissance", "soutien", "espace personnel"],
    strengths: ["Implication", "sens du devoir"],
    watchpoints: ["Oubli de soi", "surcharge"],
    typicalResults: ["D2 moyen", "D5 faible", "Parent, Manager, Aidant fréquents"],
    recommendations: ["Apprendre à poser des limites"]
  },
  "Le Réorganisateur": {
    id: "PROFIL_10",
    name: "Le Réorganisateur",
    shortDescription: "Le Réorganisateur traverse actuellement une période de transition qui demande de reconstruire des repères.",
    longDescription: "Votre profil semble fortement influencé par une transition récente ou en cours : séparation, deuil, changement professionnel, création d'entreprise, recherche d'emploi ou autre réorganisation importante. Votre capacité d'adaptation est une force, mais les repères relationnels peuvent être moins stables pendant cette période. Certaines relations disparaissent, d'autres prennent davantage de place et de nouveaux besoins émergent. Votre enjeu est de ne pas exiger de vous un retour immédiat à l'équilibre. Il s'agit de sécuriser des repères simples, de préserver les soutiens fiables et de reconstruire progressivement un écosystème relationnel cohérent avec votre nouvelle situation.",
    dominantNeeds: ["Repères", "sécurité", "soutien"],
    strengths: ["Capacité d'adaptation"],
    watchpoints: ["Instabilité", "perte de repères"],
    typicalResults: ["Divorce", "Deuil", "Chômage", "Création d'entreprise"],
    recommendations: ["Sécuriser les repères"]
  },
  "L'Inspirant": {
    id: "PROFIL_11",
    name: "L'Inspirant",
    shortDescription: "L'Inspirant combine engagement, relations de qualité et capacité à entraîner ou soutenir les autres.",
    longDescription: "Votre profil associe plusieurs dimensions relationnelles très favorables. Vous semblez pouvoir créer du lien, vous engager, mobiliser des ressources et parfois entraîner les autres dans une dynamique positive. Votre leadership relationnel peut être une ressource pour votre entourage ou vos projets. La vigilance concerne le niveau de sollicitations : les personnes identifiées comme fiables et inspirantes sont souvent beaucoup sollicitées. Votre enjeu est de préserver votre énergie, de continuer à recevoir du soutien et de ne pas confondre disponibilité relationnelle et disponibilité permanente.",
    dominantNeeds: ["Contribution", "coopération", "sens"],
    strengths: ["Leadership relationnel", "influence positive"],
    watchpoints: ["Surcharge liée aux sollicitations"],
    typicalResults: ["Quatre dimensions > 80"],
    recommendations: ["Préserver son énergie"]
  },
  "L'Équilibriste": {
    id: "PROFIL_12",
    name: "L'Équilibriste",
    shortDescription: "L'Équilibriste maintient une bonne qualité relationnelle malgré une forte complexité de vie et de nombreuses responsabilités.",
    longDescription: "Votre profil montre que vous parvenez actuellement à préserver un bon niveau de qualité relationnelle alors que votre contexte comporte plusieurs rôles, responsabilités ou contraintes. Votre organisation, votre résilience et votre capacité à mobiliser des ressources semblent jouer un rôle protecteur important. Cette capacité à tenir plusieurs sphères simultanément est une force, mais elle peut masquer un risque d'épuisement à moyen terme si les relais diminuent ou si de nouvelles contraintes apparaissent. Votre enjeu est donc préventif : déléguer davantage, protéger les temps de récupération et consolider les soutiens avant d'en avoir un besoin urgent.",
    dominantNeeds: ["Relais", "récupération", "équilibre"],
    strengths: ["Organisation", "résilience", "gestion simultanée des rôles"],
    watchpoints: ["Épuisement à moyen terme"],
    typicalResults: ["IQRH élevé", "ICR élevé"],
    recommendations: ["Renforcer les relais et déléguer"]
  },
};

/**
 * Vérifie si une liste de situations de vie contient une situation spécifique.
 * @param situations - La liste des situations déclarées par l'utilisateur
 * @param value - La situation recherchée
 */
const hasSituation = (situations: readonly string[], value: string) =>
  situations.some((situation) => situation.toLowerCase().includes(value.toLowerCase()));

/**
 * Service chargé de déterminer le profil relationnel primaire et secondaire d'un utilisateur,
 * basé sur ses scores aux 5 dimensions, son ICR et son indice d'équilibre (IER).
 */
export class ProfileCalculationService {
  /**
   * Calcule le profil d'un utilisateur en attribuant des points d'appartenance
   * à chacun des 12 profils du registre, puis en sélectionnant les deux meilleurs.
   */
  static calculate(input: ProfileInput): ProfileCalculation {
    const dimensionScores = input.scores;

    // Calcul des scores d'appartenance pour chacun des 12 profils
    const profileScores: Record<string, number> = {
      "Le Connecteur":
        (dimensionScores.SOCIAL >= 80 ? 35 : 0) +
        (dimensionScores.AFFECTIVE >= 60 ? 20 : 0) +
        (input.balanceIndex >= 61 ? 15 : 0),

      "L'Ancre":
        (dimensionScores.AFFECTIVE >= 70 ? 35 : 0) +
        (dimensionScores.SELF >= 70 ? 35 : 0),

      "Le Bâtisseur":
        (dimensionScores.PROFESSIONAL >= 80 ? 45 : 0) +
        (dimensionScores.SELF >= 60 ? 20 : 0),

      "Le Protecteur":
        (dimensionScores.AFFECTIVE >= 60 ? 20 : 0) +
        (hasSituation(input.situations, "Parent") ? 30 : 0) +
        (hasSituation(input.situations, "Aidant") ? 30 : 0) +
        (hasSituation(input.situations, "Manager") ? 20 : 0),

      "Le Résilient":
        (input.icrScore >= 41 ? 35 : 0) +
        (input.globalScore >= 50 ? 25 : 0) +
        (input.balanceIndex >= 61 ? 20 : 0),

      "L'Explorateur":
        (dimensionScores.SOCIAL >= 70 ? 30 : 0) +
        (dimensionScores.SENTIMENTAL >= 40 ? 15 : 0) +
        (hasSituation(input.situations, "Célibataire") || hasSituation(input.situations, "Étudiant") ? 35 : 0),

      "Le Chercheur d'équilibre":
        input.balanceIndex >= 81 ? 70 : 0,

      "Le Soliste":
        (dimensionScores.SELF >= 70 ? 30 : 0) +
        (dimensionScores.SOCIAL < 60 ? 30 : 0) +
        (hasSituation(input.situations, "Personne vivant seule") ? 30 : 0),

      "Le Suradapté":
        (dimensionScores.AFFECTIVE >= 40 && dimensionScores.AFFECTIVE < 70 ? 15 : 0) +
        (dimensionScores.SELF < 60 ? 35 : 0) +
        (hasSituation(input.situations, "Parent") || hasSituation(input.situations, "Manager") || hasSituation(input.situations, "Aidant") ? 30 : 0),

      "Le Réorganisateur":
        hasSituation(input.situations, "Divorce") ||
        hasSituation(input.situations, "Deuil") ||
        hasSituation(input.situations, "Demandeur") ||
        hasSituation(input.situations, "Création d'entreprise")
          ? 70
          : 0,

      "L'Inspirant":
        Object.values(dimensionScores).filter((scoreValue) => scoreValue > 80).length >= 4 ? 80 : 0,

      "L'Équilibriste":
        (input.globalScore >= 70 ? 35 : 0) +
        (input.icrScore >= 41 ? 35 : 0),
    };

    // Classement des profils du plus élevé au plus faible
    const rankedProfiles = Object.entries(profileScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    const [primaryName, primaryScore] = rankedProfiles[0]!;
    const [secondaryName, secondaryScore] = rankedProfiles[1]!;

    // Calcul du total pour déterminer l'indice de confiance (en pourcentage)
    const totalScorePoints = Math.max(1, Object.values(profileScores).reduce((sum, currentScore) => sum + currentScore, 0));

    const primaryDetails = IQRH_PROFILES_REGISTRY[primaryName];
    const secondaryDetails = IQRH_PROFILES_REGISTRY[secondaryName];

    return {
      primaryName,
      secondaryName,
      primaryScore,
      secondaryScore,
      primaryConfidence: Math.round((primaryScore / totalScorePoints) * 100),
      secondaryConfidence: Math.round((secondaryScore / totalScorePoints) * 100),
      signature: `${primaryName.replace("Le ", "").replace("L'", "")}-${secondaryName.replace("Le ", "").replace("L'", "")}`,
      scores: profileScores,
      primaryDetails,
      secondaryDetails,
      irisContext: {
        primaryName,
        secondaryName,
        iqrhScore: input.globalScore,
        icrScore: input.icrScore,
        priorityDimension: Object.entries(dimensionScores).sort(([, scoreA], [, scoreB]) => scoreA - scoreB)[0]![0],
      },
    };
  }
}
