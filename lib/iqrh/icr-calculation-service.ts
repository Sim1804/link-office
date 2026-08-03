import type { IqrhDimension } from "./types";

export interface IcrInput {
  occupation: string;
  organizationSize?: string | null;
  children: boolean;
  childrenCount?: number | null;
  relationshipStatus: string;
  selectedSituations: readonly string[];
  scores: Record<IqrhDimension, number>;
  balanceIndex: number;
  globalScore: number;
  adaptiveAnswers: readonly {
    value: number;
    polarity: "POSITIVE" | "NEGATIVE";
    label: string;
  }[];
}

export interface IcrCalculation {
  score: number;
  familyComplexity: number;
  professionalComplexity: number;
  lifeTransitions: number;
  relationalLoad: number;
  protectiveResources: number;
  level: string;
  interpretation: string;
  riskFactors: string[];
  protectiveFactors: string[];
  resources: string[];
  vulnerabilities: string[];
  barriers: string[];
  levers: string[];
  dominantNeeds: string[];
}

const has = (items: readonly string[], ...values: string[]) =>
  values.some((value) =>
    items.some((item) => item.toLowerCase().includes(value.toLowerCase()))
  );

const cap = (value: number, max: number) => Math.min(value, max);

export class IcrCalculationService {
  static calculate(input: IcrInput): IcrCalculation {
    const situations = input.selectedSituations;

    // 1. Complexité Familiale (max 20 points)
    let familyPoints = 0;
    if (input.children) familyPoints += 5;
    if (input.childrenCount === 1) familyPoints += 2;
    else if (input.childrenCount === 2) familyPoints += 4;
    else if ((input.childrenCount ?? 0) >= 3) familyPoints += 6;

    if (has(situations, "Famille monoparentale")) familyPoints += 10;
    if (has(situations, "Aidant")) familyPoints += 10;
    if (has(situations, "Personne vivant seule")) familyPoints += 4;
    if (has(situations, "Divorce")) familyPoints += 6;
    if (has(situations, "Deuil")) familyPoints += 6;

    const familyComplexity = cap(familyPoints, 20);

    // 2. Complexité Professionnelle (max 20 points)
    let proPoints = 0;
    if (input.occupation === "Salarié") proPoints += 3;
    if (has(situations, "Manager")) proPoints += 8;
    if (has(situations, "Entrepreneur")) proPoints += 10;
    if (has(situations, "Création d'entreprise")) proPoints += 8;
    if (has(situations, "Demandeur")) proPoints += 8;
    if (has(situations, "Étudiant")) proPoints += 5;
    if (has(situations, "Retraité")) proPoints += 3;
    if (input.occupation === "Parent au foyer") proPoints += 5;

    if (input.organizationSize === "51 à 250 salariés") proPoints += 2;
    else if (input.organizationSize === "Plus de 250 salariés") proPoints += 3;

    const professionalComplexity = cap(proPoints, 20);

    // 3. Transitions de vie (max 20 points)
    let transitionPoints = 0;
    if (has(situations, "Divorce")) transitionPoints += 10;
    if (has(situations, "Deuil")) transitionPoints += 10;
    if (has(situations, "Demandeur")) transitionPoints += 8;
    if (has(situations, "Création d'entreprise")) transitionPoints += 8;
    if (has(situations, "Étudiant")) transitionPoints += 4;
    if (["Séparé(e) / Divorcé(e)", "Veuf(ve)"].includes(input.relationshipStatus)) transitionPoints += 6;

    const lifeTransitions = cap(transitionPoints, 20);

    // 4. Charge relationnelle issue des modules adaptatifs (max 25 points)
    let loadPoints = 0;
    for (const item of input.adaptiveAnswers) {
      if (item.polarity === "POSITIVE") {
        if (item.value === 1) loadPoints += 4;
        else if (item.value === 2) loadPoints += 2;
        else if (item.value === 3) loadPoints += 1;
      } else {
        if (item.value === 5) loadPoints += 4;
        else if (item.value === 4) loadPoints += 2;
        else if (item.value === 3) loadPoints += 1;
      }
    }
    const relationalLoad = cap(loadPoints, 25);

    // 5. Ressources protectrices (max -15 points)
    let resourcePoints = 0;
    const protectors: string[] = [];

    if (input.scores.SOCIAL >= 70) {
      resourcePoints += 3;
      protectors.push("Réseau social fort");
    }
    if (input.scores.AFFECTIVE >= 70) {
      resourcePoints += 3;
      protectors.push("Soutien affectif fort");
    }
    if (input.scores.SENTIMENTAL >= 70) {
      resourcePoints += 2;
      protectors.push("Équilibre sentimental");
    }
    if (input.scores.PROFESSIONAL >= 70) {
      resourcePoints += 2;
      protectors.push("Activité soutenante");
    }
    if (input.scores.SELF >= 70) {
      resourcePoints += 3;
      protectors.push("Relation à soi solide");
    }
    if (input.balanceIndex >= 75) {
      resourcePoints += 2;
      protectors.push("IER élevé");
    }
    if (input.globalScore >= 70) {
      resourcePoints += 2;
      protectors.push("Météo relationnelle favorable");
    }

    input.adaptiveAnswers
      .filter((a) => a.polarity === "POSITIVE" && a.value >= 4)
      .forEach((a) => {
        resourcePoints += 2;
        protectors.push(a.label);
      });

    const protectiveResources = cap(resourcePoints, 15);

    // 6. Calcul final du score ICR (0 à 100)
    const rawScore =
      familyComplexity +
      professionalComplexity +
      lifeTransitions +
      relationalLoad -
      protectiveResources;

    const score = Math.max(0, Math.min(100, rawScore));

    // 7. Interprétation du niveau ICR
    let level = "";
    let interpretation = "";

    if (score <= 20) {
      level = "Complexité faible";
      interpretation = "L’écosystème relationnel est relativement simple ou bien soutenu.";
    } else if (score <= 40) {
      level = "Complexité modérée";
      interpretation = "Plusieurs rôles ou contraintes existent, mais restent globalement maîtrisables.";
    } else if (score <= 60) {
      level = "Complexité élevée";
      interpretation = "Votre écosystème relationnel présente actuellement une complexité élevée. Vous assumez plusieurs rôles ou responsabilités qui peuvent mobiliser une énergie importante. L’objectif n’est pas de réduire toutes vos responsabilités, mais d’identifier les relais, ressources et leviers qui peuvent alléger votre charge relationnelle.";
    } else if (score <= 80) {
      level = "Complexité très élevée";
      interpretation = "La charge relationnelle est importante et nécessite des relais.";
    } else {
      level = "Complexité critique";
      interpretation = "L’écosystème relationnel est fortement sous tension. Priorité à l’accompagnement.";
    }

    // 8. Facteurs de risque (mental_load, decision_loneliness, caregiver_burden, etc.)
    const riskFactors: string[] = [];
    if (has(situations, "Aidant")) riskFactors.push("caregiver_burden (Élevé) — Charge d'aidant familial");
    if (has(situations, "Divorce", "Deuil")) riskFactors.push("relationship_conflict (Élevé) — Transition relationnelle majeure");
    if (has(situations, "Demandeur")) riskFactors.push("lack_support (Moyen) — Recherche d'emploi");
    if (has(situations, "Famille monoparentale")) riskFactors.push("mental_load (Critique) — Charge monoparentale");
    if (input.scores.SOCIAL < 40) riskFactors.push("social_isolation (Élevé) — Isolement social");
    if (input.scores.SELF < 40) riskFactors.push("mental_load (Élevé) — Surcharge mentale");
    if (has(situations, "Entrepreneur", "Manager")) riskFactors.push("decision_loneliness (Moyen) — Solitude décisionnelle");

    // 9. Freins (identified_barriers[])
    const barriers: string[] = [];
    if (has(situations, "Entrepreneur", "Manager", "Aidant")) barriers.push("Peu de temps personnel disponible");
    if (has(situations, "Personne vivant seule")) barriers.push("Difficulté à demander de l'aide");
    if (input.scores.SOCIAL < 40) barriers.push("Réseau social restreint");
    input.adaptiveAnswers
      .filter((a) => a.value <= 2 && a.polarity === "POSITIVE")
      .forEach((a) => barriers.push(a.label));

    // 10. Leviers (identified_levers[])
    const levers: string[] = [];
    if (input.scores.SOCIAL < 60) levers.push("Développer un réseau de confiance");
    if (input.scores.SELF < 60) levers.push("Réduire la charge mentale et créer du temps personnel");
    if (has(situations, "Aidant", "Manager", "Parent")) levers.push("Partager les responsabilités et s'appuyer sur des relais");
    if (input.scores.AFFECTIVE < 60) levers.push("Améliorer la communication et l'expression des besoins");
    protectors.forEach((p) => levers.push(`Capitaliser sur : ${p}`));

    // 11. Besoins relationnels dominants (dominant_needs[])
    const dominantNeeds: string[] = [];
    if (input.scores.SOCIAL < 60) dominantNeeds.push("Besoin d'appartenance");
    if (input.scores.AFFECTIVE < 60) dominantNeeds.push("Besoin de soutien");
    if (has(situations, "Divorce", "Deuil", "Demandeur")) dominantNeeds.push("Besoin de sécurité");
    if (input.scores.PROFESSIONAL >= 60) dominantNeeds.push("Besoin de reconnaissance");
    if (input.scores.SELF >= 60) dominantNeeds.push("Besoin d'autonomie");
    if (dominantNeeds.length === 0) dominantNeeds.push("Besoin de sérénité et d'alignement");

    // 12. Vulnérabilités principales (top_vulnerabilities[])
    const vulnerabilities: string[] = [];
    if (has(situations, "Aidant", "Parent")) vulnerabilities.push("Charge mentale et surinvestissement");
    if (input.scores.SOCIAL < 50) vulnerabilities.push("Isolement social ou manque de relais");
    if (input.scores.SELF < 50) vulnerabilities.push("Fatigue intérieure et oubli de soi");
    if (has(situations, "Divorce", "Deuil")) vulnerabilities.push("Instabilité émotionnelle liée à une transition");

    // 13. Ressources principales (top_resources[])
    const topResources = protectors.length > 0 ? protectors : ["Résilience personnelle", "Adaptabilité"];

    return {
      score,
      familyComplexity,
      professionalComplexity,
      lifeTransitions,
      relationalLoad,
      protectiveResources,
      level,
      interpretation,
      riskFactors,
      protectiveFactors: protectors,
      resources: topResources,
      vulnerabilities,
      barriers: Array.from(new Set(barriers)).slice(0, 5),
      levers: Array.from(new Set(levers)).slice(0, 5),
      dominantNeeds: Array.from(new Set(dominantNeeds)),
    };
  }
}
