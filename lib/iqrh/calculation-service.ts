import { DIMENSIONS, type DimensionScore, type IqrhDimension, type ResultatIQRH } from "./types";

const labels: Record<IqrhDimension, string> = { SOCIAL: "Relations sociales", AFFECTIVE: "Relations affectives", SENTIMENTAL: "Vie sentimentale", PROFESSIONAL: "Vie professionnelle et engagement", SELF: "Relation à soi et au sens" };
const forceTexts: Record<IqrhDimension, string> = { SOCIAL: "Votre réseau relationnel constitue une ressource importante.", AFFECTIVE: "Vous disposez de repères affectifs soutenants.", SENTIMENTAL: "Votre vie sentimentale présente des points d'appui positifs.", PROFESSIONAL: "Votre activité contribue positivement à votre équilibre relationnel.", SELF: "Votre relation à vous-même soutient votre équilibre global." };
const watchTexts: Record<IqrhDimension, string> = { SOCIAL: "Cette dimension peut révéler un besoin accru de lien et d'appartenance.", AFFECTIVE: "Cette dimension mérite une attention particulière autour du soutien émotionnel.", SENTIMENTAL: "Cette dimension peut nécessiter de clarifier vos besoins affectifs actuels.", PROFESSIONAL: "Cette dimension suggère que votre activité mérite un accompagnement relationnel.", SELF: "Cette dimension invite à préserver du temps, du sens et un équilibre personnel." };

export class IQRHCalculationService {
  static calculate(answers: ReadonlyArray<{ dimension: IqrhDimension; value: number }>): ResultatIQRH {
    if (answers.length !== 30 || answers.some(({ value }) => !Number.isInteger(value) || value < 1 || value > 5)) throw new Error("Les 30 réponses Likert valides sont obligatoires.");
    const dimensions = DIMENSIONS.map((dimension): DimensionScore => { const values = answers.filter((answer) => answer.dimension === dimension).map((answer) => answer.value); if (values.length !== 6) throw new Error(`Six réponses sont requises pour ${dimension}.`); const score = Math.round(((values.reduce((sum, value) => sum + value, 0) - 6) / 24) * 100); return { dimension, label: labels[dimension], score, level: score < 40 ? "priority" : score < 60 ? "fragile" : score < 80 ? "satisfactory" : "resource" }; });
    const globalScore = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / 5);
    const ordered = [...dimensions].sort((a, b) => b.score - a.score);
    const priorityDimension = [...dimensions].sort((a, b) => a.score - b.score)[0]!.dimension;
    const spread = ordered[0]!.score - ordered[4]!.score;
    const balanceIndex = Math.round(100 - spread);
    const weather = globalScore <= 20 ? "Tempête" : globalScore <= 40 ? "Orage" : globalScore <= 60 ? "Ciel couvert" : globalScore <= 80 ? "Éclaircies" : "Grand soleil";
    const primaryProfile = balanceIndex >= 81 ? "L'Équilibriste" : globalScore >= 75 ? "Le Connecteur" : priorityDimension === "SOCIAL" ? "Le Soliste" : priorityDimension === "PROFESSIONAL" ? "Le Chercheur d'équilibre" : "Le Réorganisateur";
    const secondaryProfile = ordered[0]!.dimension === "SELF" ? "L'Ancre" : "Le Résilient";
    return { globalScore, dimensions, weather, balanceIndex, priorityDimension, strengths: ordered.slice(0, 3).map((item) => forceTexts[item.dimension]), watchpoints: ordered.slice(-3).reverse().map((item) => watchTexts[item.dimension]), primaryProfile, secondaryProfile, profileSummary: `${primaryProfile} : votre profil reflète la combinaison actuelle de vos cinq dimensions relationnelles.`, radar: dimensions.map((item) => ({ dimension: item.label, score: item.score })) };
  }
}
