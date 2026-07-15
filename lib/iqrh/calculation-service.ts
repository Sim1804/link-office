import { DIMENSIONS, type DimensionScore, type IqrhDimension, type ResultText, type ResultatIQRH } from "./types";

const labels: Record<IqrhDimension, string> = { SOCIAL: "Relations sociales", AFFECTIVE: "Relations affectives", SENTIMENTAL: "Vie sentimentale", PROFESSIONAL: "Vie professionnelle et engagement", SELF: "Relation à soi et au sens" };

// Texts reproduced from sections 12 and 13 of the supplied IQRH référentiel.
const strengths: Record<IqrhDimension, ResultText> = {
  SOCIAL: { dimension: "SOCIAL", title: "Votre réseau relationnel est une ressource.", interpretation: "Vous semblez disposer d'un entourage, de liens ou d'occasions d'échange qui contribuent positivement à votre équilibre. Votre capacité à créer, maintenir ou mobiliser des relations sociales représente un facteur protecteur important.", orientation: "Continuez à entretenir ces liens dans la durée. Votre réseau peut aussi devenir un point d'appui pour renforcer les dimensions plus fragiles de votre qualité de vie relationnelle." },
  AFFECTIVE: { dimension: "AFFECTIVE", title: "Vous disposez de ressources émotionnelles importantes.", interpretation: "Vos réponses suggèrent que vous bénéficiez de relations où l'écoute, l'affection, la confiance ou la sécurité émotionnelle sont présentes. Cette dimension est essentielle pour se sentir soutenu(e), compris(e) et reconnu(e) dans ce que l'on vit.", orientation: "Appuyez-vous sur ces relations de confiance pour exprimer vos besoins, partager vos ressentis et consolider votre équilibre émotionnel." },
  SENTIMENTAL: { dimension: "SENTIMENTAL", title: "Votre vie sentimentale soutient votre équilibre.", interpretation: "Votre situation sentimentale actuelle semble globalement correspondre à vos attentes ou à vos besoins du moment. Cette dimension peut représenter une source de stabilité, de projection ou d'épanouissement.", orientation: "Préservez les espaces de dialogue, de sincérité et de qualité relationnelle qui nourrissent cette dimension. Elle peut constituer un appui important dans votre équilibre global." },
  PROFESSIONAL: { dimension: "PROFESSIONAL", title: "Votre activité est une source d'utilité et d'engagement.", interpretation: "Vous semblez trouver une place, du sens ou de la reconnaissance dans l'activité qui occupe une place importante dans votre quotidien. Cette dimension peut être professionnelle, académique, familiale, bénévole ou personnelle.", orientation: "Utilisez cette dynamique d'engagement comme moteur, tout en veillant à maintenir un équilibre avec les autres sphères de votre vie." },
  SELF: { dimension: "SELF", title: "Votre stabilité intérieure est une force.", interpretation: "Vos réponses suggèrent une bonne connexion à vos valeurs, à vos priorités ou au sens que vous donnez à votre vie. Cette dimension constitue un socle important pour faire face aux transitions, aux responsabilités et aux difficultés relationnelles.", orientation: "Continuez à cultiver les pratiques, choix et relations qui vous permettent de rester aligné(e) avec vous-même." },
};

const watchpoints: Record<IqrhDimension, ResultText> = {
  SOCIAL: { dimension: "SOCIAL", title: "Votre réseau relationnel mérite d'être renforcé.", interpretation: "Vos réponses suggèrent que votre environnement social pourrait être moins soutenant ou moins nourrissant que souhaité. Vous pouvez avoir besoin de davantage d'occasions d'échange, de liens réguliers ou de relations sur lesquelles compter.", orientation: "Privilégier des actions simples : reprendre contact avec une personne importante, rejoindre une activité collective, participer à un événement local ou identifier les personnes ressources autour de vous." },
  AFFECTIVE: { dimension: "AFFECTIVE", title: "Votre sécurité émotionnelle demande de l'attention.", interpretation: "Cette dimension peut révéler un besoin accru d'écoute, de soutien, de bienveillance ou d'expression émotionnelle. Il est possible que certaines émotions soient portées seul(e) ou insuffisamment partagées.", orientation: "Identifier une ou deux personnes de confiance avec lesquelles vous pouvez parler plus librement de ce que vous ressentez. L'objectif est de renforcer progressivement la qualité du soutien affectif." },
  SENTIMENTAL: { dimension: "SENTIMENTAL", title: "Votre vie sentimentale est un axe à clarifier ou renforcer.", interpretation: "Vos réponses indiquent que votre situation sentimentale actuelle peut être source de questionnement, d'insatisfaction ou de fragilité. Cela peut concerner aussi bien le couple, le célibat, une séparation, un deuil ou une difficulté à se projeter.", orientation: "Clarifier vos besoins affectifs, identifier ce qui vous convient aujourd'hui et repérer les freins qui limitent votre épanouissement sentimental." },
  PROFESSIONAL: { dimension: "PROFESSIONAL", title: "Votre activité actuelle pèse peut-être sur votre équilibre.", interpretation: "Cette dimension suggère que l'activité qui occupe une place importante dans votre quotidien contribue moins positivement à votre équilibre qu'elle ne le pourrait. Cela peut concerner le travail, les études, la recherche d'emploi, la parentalité, l'engagement ou une autre activité significative.", orientation: "Identifier ce qui pèse le plus : manque de reconnaissance, isolement, surcharge, perte de sens, faible soutien ou difficulté à exprimer vos idées." },
  SELF: { dimension: "SELF", title: "Votre alignement personnel mérite d'être soutenu.", interpretation: "Vos réponses peuvent traduire une période de questionnement, de fatigue intérieure, de perte de repères ou de difficulté à prendre du temps pour vous. Cette dimension influence fortement la qualité globale des relations.", orientation: "Commencer par clarifier ce qui compte vraiment pour vous aujourd'hui, réintroduire des temps de pause et identifier les activités ou relations qui vous reconnectent à vos valeurs." },
};

export class IQRHCalculationService {
  static calculate(answers: ReadonlyArray<{ dimension: IqrhDimension; value: number }>): ResultatIQRH {
    if (answers.length !== 30 || answers.some(({ value }) => !Number.isInteger(value) || value < 1 || value > 5)) throw new Error("Les 30 réponses Likert valides sont obligatoires.");
    const dimensions = DIMENSIONS.map((dimension): DimensionScore => {
      const values = answers.filter((answer) => answer.dimension === dimension).map((answer) => answer.value);
      if (values.length !== 6) throw new Error(`Six réponses sont requises pour ${dimension}.`);
      const score = Math.round(((values.reduce((sum, value) => sum + value, 0) - 6) / 24) * 100);
      return { dimension, label: labels[dimension], score, level: score < 40 ? "priority" : score < 60 ? "fragile" : score < 80 ? "satisfactory" : "resource" };
    });
    const globalScore = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / 5);
    const ordered = [...dimensions].sort((left, right) => right.score - left.score);
    const lowest = [...dimensions].sort((left, right) => left.score - right.score);
    const priorityDimension = lowest[0]!.dimension;
    const balanceIndex = Math.round(100 - (ordered[0]!.score - ordered[4]!.score));
    const weather = globalScore <= 20 ? "Tempête" : globalScore <= 40 ? "Orage" : globalScore <= 60 ? "Ciel couvert" : globalScore <= 80 ? "Éclaircies" : "Grand soleil";
    const strengthDetails = ordered.slice(0, 3).map(({ dimension }) => strengths[dimension]);
    const watchpointDetails = lowest.slice(0, 3).map(({ dimension }) => watchpoints[dimension]);
    return { globalScore, dimensions, weather, balanceIndex, priorityDimension, strengths: strengthDetails.map(({ title }) => title), watchpoints: watchpointDetails.map(({ title }) => title), strengthDetails, watchpointDetails, primaryProfile: "", secondaryProfile: "", profileSummary: "", radar: dimensions.map(({ label, score }) => ({ dimension: label, score })) };
  }
}
