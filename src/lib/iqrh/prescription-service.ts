import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Type générique pour représenter les données stockées dans la colonne JSON du modèle LibraryItem. */
type LibraryData = Record<string, string | number | boolean | null>;

/** Mapping entre les clés énumérées (base de données) et les libellés compréhensibles humainement (issus du catalogue). */
const dimensionLabels: Record<string, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie professionnelle et engagement",
  SELF: "Relation à soi et au sens",
};

/**
 * Extrait une valeur texte depuis un objet JSON Prisma.
 * Retourne une chaîne vide si la valeur n'existe pas ou n'est pas une chaîne.
 */
function text(data: Prisma.JsonValue, key: string): string {
  const value = (data as LibraryData)[key];
  return typeof value === "string" ? value : "";
}

/**
 * Vérifie si une valeur texte contient une sous-chaîne attendue, en ignorant la casse.
 */
function contains(value: string, expected: string): boolean {
  return value.toLocaleLowerCase("fr-FR").includes(expected.toLocaleLowerCase("fr-FR"));
}

/**
 * Vérifie si la dimension extraite (qui peut contenir plusieurs valeurs séparées par des points-virgules)
 * correspond à la dimension cible de l'utilisateur.
 * @param rawDimensionString - La chaîne brute (ex: "Relations sociales;Relations affectives")
 * @param targetDimension - La dimension prioritaire calculée pour l'utilisateur
 */
function matchesDimension(rawDimensionString: string, targetDimension: string): boolean {
  if (!rawDimensionString) return false;
  const normalizedTarget = targetDimension.toLocaleLowerCase("fr-FR");
  
  return rawDimensionString.split(';').some(chunk => {
    const normalizedChunk = chunk.trim().toLocaleLowerCase("fr-FR");
    return normalizedChunk && (normalizedTarget.includes(normalizedChunk) || normalizedChunk.includes(normalizedTarget));
  });
}

function calculateScore(item: any, context: { situations: string[]; profileName: string; secondaryProfileName?: string; dimensionScore: number; dominantNeeds: string[]; icrScore: number; }): number {
  let score = 0;
  
  // 1. Situation de vie
  if (context.situations.some(sit => contains(text(item.data, "situations_ciblees") || text(item.data, "public_cible"), sit))) {
    score += 3;
  }
  
  // 2. Profils (Principal et Secondaire)
  if (context.profileName && contains(text(item.data, "profils_cibles"), context.profileName)) score += 2;
  if (context.secondaryProfileName && contains(text(item.data, "profils_cibles"), context.secondaryProfileName)) score += 1;

  // 3. Besoins dominants
  if (context.dominantNeeds && context.dominantNeeds.some(need => contains(text(item.data, "besoins_cibles"), need))) {
    score += 2;
  }

  // 4. Règles de personnalisation par niveau de sous-score (0-39, 40-59, 60-79, 80-100)
  const itemType = text(item.data, "type_recommandation") || text(item.data, "type_action");
  if (itemType) {
    if (context.dimensionScore <= 39 && contains(itemType, "sécurisation")) score += 5; // Priorité absolue
    else if (context.dimensionScore >= 40 && context.dimensionScore <= 59 && contains(itemType, "reconstruction")) score += 4;
    else if (context.dimensionScore >= 60 && context.dimensionScore <= 79 && contains(itemType, "consolidation")) score += 3;
    else if (context.dimensionScore >= 80 && contains(itemType, "préservation")) score += 2;
  }

  // 5. ICR (Complexité relationnelle)
  const icrCible = text(item.data, "icr_cible");
  if (icrCible) {
    if (context.icrScore >= 80 && contains(icrCible, "critique")) score += 3;
    else if (context.icrScore >= 60 && contains(icrCible, "élevé")) score += 2;
    else if (context.icrScore < 60 && contains(icrCible, "faible")) score += 1;
  }

  // 6. Impact attendu (bonus)
  const rawImpact = item.data?.impact_attendu_1_5;
  const impactScore = rawImpact ? (parseInt(rawImpact, 10) / 10) : 0;
  
  // 7. Règles de personnalisation par profil (Angles de recommandation)
  let profileAngleScore = 0;
  if (context.profileName) {
    const itemText = (text(item.data, "texte_affiche") + " " + text(item.data, "description") + " " + text(item.data, "angle")).toLowerCase();
    const rules: Record<string, string[]> = {
      "Connecteur": ["qualité", "quantité", "limite", "temps pour soi", "sélection"],
      "L'Ancre": ["profondeur", "ouvrir", "cercle", "repli"],
      "Ancre": ["profondeur", "ouvrir", "cercle", "repli"], // Fallback
      "Le Bâtisseur": ["rituel", "consolider", "répartir"],
      "Bâtisseur": ["rituel", "consolider", "répartir"], // Fallback
      "Le Protecteur": ["demander de l'aide", "partager", "recevoir"],
      "Protecteur": ["demander de l'aide", "partager", "recevoir"], // Fallback
      "Le Résilient": ["capitaliser", "ressource", "prévenir", "épuisement"],
      "Résilient": ["capitaliser", "ressource", "prévenir", "épuisement"], // Fallback
      "L'Explorateur": ["transformer", "durable", "continuité", "repère"],
      "Explorateur": ["transformer", "durable", "continuité", "repère"], // Fallback
      "Le Chercheur d'équilibre": ["arbitrer", "conversation difficile", "cohérence"],
      "Chercheur d'équilibre": ["arbitrer", "conversation difficile", "cohérence"], // Fallback
      "Le Soliste": ["autonomie", "régulière", "ressource"],
      "Soliste": ["autonomie", "régulière", "ressource"], // Fallback
      "Le Suradapté": ["limite", "propre besoin", "réduire", "surcharge", "surdisponibilité"],
      "Suradapté": ["limite", "propre besoin", "réduire", "surcharge", "surdisponibilité"], // Fallback
      "Le Réorganisateur": ["sécuriser", "repère", "reconstruire", "transition"],
      "Réorganisateur": ["sécuriser", "repère", "reconstruire", "transition"], // Fallback
      "L'Inspirant": ["protéger", "énergie", "réduire", "sollicitation", "sans responsabilité"],
      "Inspirant": ["protéger", "énergie", "réduire", "sollicitation", "sans responsabilité"], // Fallback
      "L'Équilibriste": ["relais", "déléguer", "prévenir", "épuisement"],
      "Équilibriste": ["relais", "déléguer", "prévenir", "épuisement"] // Fallback
    };
    const keywords = rules[context.profileName] || [];
    if (keywords.some(kw => itemText.includes(kw))) {
      profileAngleScore += 1.5; // Bonus fort pour le respect de l'angle du profil
    }
  }
  
  return score + impactScore + profileAngleScore;
}

/** 
 * Service responsable de la génération et gestion des "Ordonnances Relationnelles" (Prescriptions).
 * Associe le résultat du questionnaire aux recommandations et micro-défis de la librairie.
 */
export class PrescriptionService {
  /**
   * Génère une nouvelle ordonnance (ou remplace l'existante) pour un résultat IQRH donné.
   * Filtre la librairie pour ne garder que le top 3 recommandations et top 2 défis.
   */
  static async generateForResult(iqrhResultId: string) {
    const result = await prisma.iqrhResult.findUniqueOrThrow({
      where: { id: iqrhResultId },
      include: { assessment: { include: { demographic: true } }, profile: true },
    });
    
    // -- Calcul des éléments de contexte pour le moteur de recommandation --
    const targetDimensionLabel = dimensionLabels[result.priorityDimension];
    const targetScoreProp = `${result.priorityDimension.toLowerCase()}Score` as keyof typeof result;
    const dimensionScore = (result[targetScoreProp] as number) || 0;
    
    const userSituations = result.assessment.demographic?.selectedSituations ?? [];
    
    const icrResult = await prisma.icrResult.findUnique({ where: { iqrhResultId: result.id } });
    const dominantNeedsRaw = icrResult?.dominantNeeds;
    const dominantNeeds = Array.isArray(dominantNeedsRaw) ? (dominantNeedsRaw as string[]) : [];
    const icrScore = icrResult?.score || 0;
    const profileResult = await prisma.profileResult.findUnique({ where: { iqrhResultId: result.id } });
    
    const context = {
      situations: userSituations,
      profileName: result.primaryProfile,
      secondaryProfileName: profileResult?.secondaryName || undefined,
      dimensionScore,
      dominantNeeds,
      icrScore
    };

    // 1. Récupération et tri des Recommandations
    const allRecommendations = await prisma.libraryItem.findMany({
      where: { library: "Recommandations" },
      orderBy: { id: "asc" },
    });
    
    const topRecommendations = allRecommendations
      .filter((item) => {
        const itemTargetDimensions = text(item.data, "dimensions_ciblees") || text(item.data, "dimension_ciblee");
        return matchesDimension(itemTargetDimensions, targetDimensionLabel);
      })
      .sort((itemA, itemB) => {
        const scoreA = calculateScore(itemA, context);
        const scoreB = calculateScore(itemB, context);
        return scoreB - scoreA || itemA.id.localeCompare(itemB.id);
      })
      .slice(0, 5); // 5 Recommandations Premium

    // 2. Récupération et tri des Micro-défis
    const allChallenges = await prisma.libraryItem.findMany({
      where: { library: "Micro-défis" },
      orderBy: { id: "asc" },
    });

    const topChallenges = allChallenges
      .filter((item) => {
        const itemTargetDimensions = text(item.data, "dimensions_ciblees") || text(item.data, "dimension_ciblee");
        return matchesDimension(itemTargetDimensions, targetDimensionLabel);
      })
      .sort((itemA, itemB) => {
        const scoreA = calculateScore(itemA, context);
        const scoreB = calculateScore(itemB, context);
        return scoreB - scoreA || itemA.id.localeCompare(itemB.id);
      })
      .slice(0, 2);

    // 3. Récupération et tri des Partenaires
    const allPartners = await prisma.libraryItem.findMany({
      where: { library: "Partenaires" },
      orderBy: { id: "asc" },
    });

    const topPartners = allPartners
      .filter((item) => {
        // Le partenaire doit correspondre à la dimension
        const itemTargetDimensions = text(item.data, "dimensions_iqrh") || text(item.data, "dimensions_ciblees") || text(item.data, "dimension_ciblee");
        if (!matchesDimension(itemTargetDimensions, targetDimensionLabel)) return false;

        // Uniquement lorsqu'un partenaire répond directement au besoin ou à la situation
        const partnerNeeds = text(item.data, "besoins_cibles");
        const partnerSituations = text(item.data, "situations_ciblees") || text(item.data, "public_cible");

        const matchesNeed = context.dominantNeeds.some(need => contains(partnerNeeds, need));
        const matchesSituation = context.situations.some(sit => contains(partnerSituations, sit));

        return matchesNeed || matchesSituation;
      })
      .sort((itemA, itemB) => {
        const scoreA = calculateScore(itemA, context);
        const scoreB = calculateScore(itemB, context);
        return scoreB - scoreA || itemA.id.localeCompare(itemB.id);
      })
      .slice(0, 3); // 1 à 3 partenaires maximum

    const candidates = [...topRecommendations, ...topChallenges, ...topPartners];
    
    // Nettoyage de l'ancienne ordonnance si existante pour éviter les doublons
    const existingPrescription = await prisma.relationalPrescription.findUnique({ where: { iqrhResultId: result.id } });
    if (existingPrescription) {
      await prisma.relationalPrescription.delete({ where: { id: existingPrescription.id } });
    }
    
    // Enregistrement de la nouvelle ordonnance
    return prisma.relationalPrescription.create({
      data: {
        userId: result.assessment.userId,
        iqrhResultId: result.id,
        title: `Ordonnance relationnelle — ${targetDimensionLabel}`,
        summary: `Cette ordonnance priorise la dimension « ${targetDimensionLabel} » identifiée par votre résultat IQRH.`,
        priorityDimension: result.priorityDimension,
        items: {
          create: candidates.map((item, index) => ({
            libraryItemId: item.id,
            kind: item.library === "Partenaires" ? "PARTNER" : item.library === "Micro-défis" ? "MICRO_CHALLENGE" : "RECOMMENDATION",
            position: index + 1,
            rationale: text(item.data, "texte_affiche") || text(item.data, "texte_notification") || text(item.data, "description"),
          })),
        },
      },
      include: { items: { orderBy: { position: "asc" }, include: { libraryItem: true } } },
    });
  }

  /**
   * Récupère la dernière ordonnance générée pour un utilisateur spécifique.
   */
  static async byUser(userId: string) {
    return prisma.relationalPrescription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { orderBy: { position: "asc" }, include: { libraryItem: true } } },
    });
  }
}
