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
  definition: string;
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
    definition: "Le Connecteur nourrit naturellement ses relations. Il crée facilement du lien, entretient son réseau et trouve de l'énergie dans les interactions humaines.",
    typicalResults: ["D1 très élevé (Relations sociales)", "D2 élevé", "IER élevé"],
    dominantNeeds: ["Échanges", "Projets collectifs", "Appartenance", "Coopération"],
    strengths: ["Sociabilité", "Réseau solide", "Capacité à créer des opportunités"],
    watchpoints: ["Tendance à s'oublier pour les autres", "Dispersion relationnelle"],
    recommendations: ["Préserver des temps pour soi", "Privilégier la qualité à la quantité des relations"],
  },
  "L'Ancre": {
    id: "PROFIL_2",
    name: "L'Ancre",
    definition: "L'Ancre construit des relations profondes, stables et sécurisantes. Il recherche avant tout la confiance et la fidélité.",
    typicalResults: ["D2 élevé", "D5 élevé"],
    dominantNeeds: ["Sécurité émotionnelle", "Stabilité", "Authenticité"],
    strengths: ["Loyauté", "Écoute", "Fiabilité"],
    watchpoints: ["Difficulté face au changement", "Tendance à conserver des relations devenues déséquilibrées"],
    recommendations: ["Élargir progressivement son cercle relationnel", "Exprimer davantage ses besoins"],
  },
  "Le Bâtisseur": {
    id: "PROFIL_3",
    name: "Le Bâtisseur",
    definition: "Le Bâtisseur tire une grande partie de son équilibre de son activité, de ses projets et de son engagement.",
    typicalResults: ["D4 très élevé", "D5 élevé"],
    dominantNeeds: ["Utilité", "Accomplissement", "Autonomie"],
    strengths: ["Engagement", "Persévérance", "Leadership"],
    watchpoints: ["Surinvestissement professionnel", "Difficulté à déconnecter"],
    recommendations: ["Préserver l'équilibre des autres sphères de vie", "Déléguer davantage"],
  },
  "Le Protecteur": {
    id: "PROFIL_4",
    name: "Le Protecteur",
    definition: "Le Protecteur consacre une grande partie de son énergie au bien-être des autres.",
    typicalResults: ["D2 élevé", "Modules Parent, Aidant ou Manager activés"],
    dominantNeeds: ["Reconnaissance", "Soutien", "Partage des responsabilités"],
    strengths: ["Empathie", "Disponibilité", "Sens des responsabilités"],
    watchpoints: ["Charge mentale", "Épuisement relationnel"],
    recommendations: ["Apprendre à demander de l'aide", "Préserver du temps personnel"],
  },
  "Le Résilient": {
    id: "PROFIL_5",
    name: "Le Résilient",
    definition: "Le Résilient traverse des périodes complexes tout en conservant des ressources importantes pour rebondir.",
    typicalResults: ["ICR élevé", "IQRH moyen ou élevé", "IER satisfaisant"],
    dominantNeeds: ["Soutien", "Reconnaissance", "Récupération"],
    strengths: ["Adaptabilité", "Optimisme", "Persévérance"],
    watchpoints: ["Fatigue invisible", "Accumulation des responsabilités"],
    recommendations: ["Identifier les signaux faibles", "Accepter de ralentir"],
  },
  "L'Explorateur": {
    id: "PROFIL_6",
    name: "L'Explorateur",
    definition: "Curieux et ouvert, il recherche constantly de nouvelles expériences relationnelles.",
    typicalResults: ["D1 élevé", "D3 moyen", "Modules Célibataire ou Étudiant fréquents"],
    dominantNeeds: ["Découverte", "Nouveauté", "Diversité"],
    strengths: ["Curiosité", "Créativité", "Ouverture"],
    watchpoints: ["Difficulté à s'engager durablement"],
    recommendations: ["Consolider les relations importantes"],
  },
  "Le Chercheur d'équilibre": {
    id: "PROFIL_7",
    name: "Le Chercheur d'équilibre",
    definition: "Il cherche avant tout à harmoniser les différentes sphères de sa vie.",
    typicalResults: ["Cinq dimensions proches", "IER très élevé"],
    dominantNeeds: ["Équilibre", "Cohérence", "Sérénité"],
    strengths: ["Stabilité", "Recul", "Organisation"],
    watchpoints: ["Peur du conflit", "Évitement des décisions difficiles"],
    recommendations: ["Exprimer fermement ses choix", "Accepter les frictions constructives"],
  },
  "Le Soliste": {
    id: "PROFIL_8",
    name: "Le Soliste",
    definition: "Le Soliste fonctionne volontiers en autonomie et apprécie ses espaces personnels.",
    typicalResults: ["D5 élevé", "D1 faible", "Module Personne vivant seule"],
    dominantNeeds: ["Indépendance", "Liberté"],
    strengths: ["Autonomie", "Réflexion", "Adaptabilité"],
    watchpoints: ["Isolement progressif"],
    recommendations: ["Maintenir quelques relations ressources"],
  },
  "Le Suradapté": {
    id: "PROFIL_9",
    name: "Le Suradapté",
    definition: "Le Suradapté répond souvent aux attentes des autres avant de répondre aux siennes.",
    typicalResults: ["D2 moyen", "D5 faible", "Parent, Manager, Aidant fréquents"],
    dominantNeeds: ["Validation", "Écoute de soi", "Allègement de pression"],
    strengths: ["Implication", "Sens du devoir"],
    watchpoints: ["Oubli de soi", "Surcharge"],
    recommendations: ["Apprendre à poser des limites"],
  },
  "Le Réorganisateur": {
    id: "PROFIL_10",
    name: "Le Réorganisateur",
    definition: "Il traverse actuellement une période de transition importante.",
    typicalResults: ["Divorce", "Deuil", "Chômage", "Création d'entreprise"],
    dominantNeeds: ["Nouveaux repères", "Sécurité", "Reconstruction"],
    strengths: ["Capacité d'adaptation"],
    watchpoints: ["Instabilité"],
    recommendations: ["Sécuriser les repères"],
  },
  "L'Inspirant": {
    id: "PROFIL_11",
    name: "L'Inspirant",
    definition: "L'Inspirant combine engagement, relations de qualité et capacité à entraîner les autres.",
    typicalResults: ["Quatre dimensions > 80"],
    dominantNeeds: ["Ressourcement", "Temps calme", "Alignement"],
    strengths: ["Leadership relationnel"],
    watchpoints: ["Surcharge liée aux sollicitations"],
    recommendations: ["Préserver son énergie"],
  },
  "L'Équilibriste": {
    id: "PROFIL_12",
    name: "L'Équilibriste",
    definition: "L'Équilibriste parvient à maintenir un bon niveau de qualité relationnelle malgré une forte complexité de vie.",
    typicalResults: ["IQRH élevé", "ICR élevé"],
    dominantNeeds: ["Relais", "Délégation", "Allègement"],
    strengths: ["Gestion simultanée des rôles", "Organisation", "Résilience"],
    watchpoints: ["Risque d'épuisement à moyen terme"],
    recommendations: ["Renforcer les relais et déléguer"],
  },
};

const has = (situations: readonly string[], value: string) =>
  situations.some((item) => item.toLowerCase().includes(value.toLowerCase()));

export class ProfileCalculationService {
  static calculate(input: ProfileInput): ProfileCalculation {
    const s = input.scores;

    // Calcul des scores d'appartenance pour chacun des 12 profils
    const scores: Record<string, number> = {
      "Le Connecteur":
        (s.SOCIAL >= 80 ? 35 : 0) +
        (s.AFFECTIVE >= 60 ? 20 : 0) +
        (input.balanceIndex >= 61 ? 15 : 0),

      "L'Ancre":
        (s.AFFECTIVE >= 70 ? 35 : 0) +
        (s.SELF >= 70 ? 35 : 0),

      "Le Bâtisseur":
        (s.PROFESSIONAL >= 80 ? 45 : 0) +
        (s.SELF >= 60 ? 20 : 0),

      "Le Protecteur":
        (s.AFFECTIVE >= 60 ? 20 : 0) +
        (has(input.situations, "Parent") ? 30 : 0) +
        (has(input.situations, "Aidant") ? 30 : 0) +
        (has(input.situations, "Manager") ? 20 : 0),

      "Le Résilient":
        (input.icrScore >= 41 ? 35 : 0) +
        (input.globalScore >= 50 ? 25 : 0) +
        (input.balanceIndex >= 61 ? 20 : 0),

      "L'Explorateur":
        (s.SOCIAL >= 70 ? 30 : 0) +
        (s.SENTIMENTAL >= 40 ? 15 : 0) +
        (has(input.situations, "Célibataire") || has(input.situations, "Étudiant") ? 35 : 0),

      "Le Chercheur d'équilibre":
        input.balanceIndex >= 81 ? 70 : 0,

      "Le Soliste":
        (s.SELF >= 70 ? 30 : 0) +
        (s.SOCIAL < 60 ? 30 : 0) +
        (has(input.situations, "Personne vivant seule") ? 30 : 0),

      "Le Suradapté":
        (s.AFFECTIVE >= 40 && s.AFFECTIVE < 70 ? 15 : 0) +
        (s.SELF < 60 ? 35 : 0) +
        (has(input.situations, "Parent") || has(input.situations, "Manager") || has(input.situations, "Aidant") ? 30 : 0),

      "Le Réorganisateur":
        has(input.situations, "Divorce") ||
        has(input.situations, "Deuil") ||
        has(input.situations, "Demandeur") ||
        has(input.situations, "Création d'entreprise")
          ? 70
          : 0,

      "L'Inspirant":
        Object.values(s).filter((value) => value > 80).length >= 4 ? 80 : 0,

      "L'Équilibriste":
        (input.globalScore >= 70 ? 35 : 0) +
        (input.icrScore >= 41 ? 35 : 0),
    };

    // Classement des profils du plus élevé au plus faible
    const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [primaryName, primaryScore] = ranked[0]!;
    const [secondaryName, secondaryScore] = ranked[1]!;

    const total = Math.max(1, Object.values(scores).reduce((sum, value) => sum + value, 0));

    const primaryDetails = IQRH_PROFILES_REGISTRY[primaryName];
    const secondaryDetails = IQRH_PROFILES_REGISTRY[secondaryName];

    return {
      primaryName,
      secondaryName,
      primaryScore,
      secondaryScore,
      primaryConfidence: Math.round((primaryScore / total) * 100),
      secondaryConfidence: Math.round((secondaryScore / total) * 100),
      signature: `${primaryName.replace("Le ", "").replace("L'", "")}-${secondaryName.replace("Le ", "").replace("L'", "")}`,
      scores,
      primaryDetails,
      secondaryDetails,
      irisContext: {
        primaryName,
        secondaryName,
        iqrhScore: input.globalScore,
        icrScore: input.icrScore,
        priorityDimension: Object.entries(s).sort((a, b) => a[1] - b[1])[0]![0],
      },
    };
  }
}
