import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type LibraryData = Record<string, string | number | boolean | null>;

const dimensionLabels: Record<string, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie professionnelle et engagement",
  SELF: "Relation à soi et au sens",
};

function text(data: Prisma.JsonValue, key: string): string {
  const value = (data as LibraryData)[key];
  return typeof value === "string" ? value : "";
}

function contains(value: string, expected: string): boolean {
  return value.toLocaleLowerCase("fr-FR").includes(expected.toLocaleLowerCase("fr-FR"));
}

/** Builds a deterministic demonstration ordonnance from the imported official library. */
export class PrescriptionService {
  static async generateForResult(iqrhResultId: string) {
    const result = await prisma.iqrhResult.findUniqueOrThrow({
      where: { id: iqrhResultId },
      include: { assessment: { include: { demographic: true } }, profile: true },
    });
    const targetDimension = dimensionLabels[result.priorityDimension];
    const situations = result.assessment.demographic?.selectedSituations ?? [];
    const profileName = result.primaryProfile; // e.g. "Connecteur", "Bâtisseur"

    // 1. Fetch and sort Recommendations
    const recommendations = await prisma.libraryItem.findMany({
      where: { library: "Recommandations" },
      orderBy: { id: "asc" },
    });
    
    const selectedRecommendations = recommendations
      .filter((item) => {
        const dim = text(item.data, "dimensions_ciblees") || text(item.data, "dimension_ciblee");
        return contains(dim, targetDimension);
      })
      .sort((left, right) => {
        // Points for Situation match
        const leftSitMatch = situations.some((sit) => contains(text(left.data, "situations_ciblees") || text(left.data, "public_cible"), sit)) ? 1 : 0;
        const rightSitMatch = situations.some((sit) => contains(text(right.data, "situations_ciblees") || text(right.data, "public_cible"), sit)) ? 1 : 0;
        
        // Points for Profile match (profils_cibles)
        const leftProfMatch = profileName && contains(text(left.data, "profils_cibles"), profileName) ? 2 : 0; // Profile match is weighted higher
        const rightProfMatch = profileName && contains(text(right.data, "profils_cibles"), profileName) ? 2 : 0;

        const leftScore = leftSitMatch + leftProfMatch;
        const rightScore = rightSitMatch + rightProfMatch;

        return rightScore - leftScore || left.id.localeCompare(right.id);
      })
      .slice(0, 3);

    // 2. Fetch and sort Micro-défis
    const allChallenges = await prisma.libraryItem.findMany({
      where: { library: "Micro-défis" },
      orderBy: { id: "asc" },
    });

    const challenges = allChallenges
      .filter((item) => {
        const dim = text(item.data, "dimensions_ciblees") || text(item.data, "dimension_ciblee");
        return contains(dim, targetDimension);
      })
      .sort((left, right) => {
        // Points for Situation match
        const leftSitMatch = situations.some((sit) => contains(text(left.data, "situations_ciblees") || text(left.data, "public_cible"), sit)) ? 1 : 0;
        const rightSitMatch = situations.some((sit) => contains(text(right.data, "situations_ciblees") || text(right.data, "public_cible"), sit)) ? 1 : 0;
        
        // Points for Profile match
        const leftProfMatch = profileName && contains(text(left.data, "profils_cibles"), profileName) ? 2 : 0;
        const rightProfMatch = profileName && contains(text(right.data, "profils_cibles"), profileName) ? 2 : 0;

        const leftScore = leftSitMatch + leftProfMatch;
        const rightScore = rightSitMatch + rightProfMatch;

        return rightScore - leftScore || left.id.localeCompare(right.id);
      })
      .slice(0, 2);

    const candidates = [...selectedRecommendations, ...challenges];
    const existing = await prisma.relationalPrescription.findUnique({ where: { iqrhResultId: result.id } });
    if (existing) await prisma.relationalPrescription.delete({ where: { id: existing.id } });
    
    return prisma.relationalPrescription.create({
      data: {
        userId: result.assessment.userId,
        iqrhResultId: result.id,
        title: `Ordonnance relationnelle — ${targetDimension}`,
        summary: `Cette ordonnance priorise la dimension « ${targetDimension} » identifiée par votre résultat IQRH.`,
        priorityDimension: result.priorityDimension,
        items: {
          create: candidates.map((item, index) => ({
            libraryItemId: item.id,
            kind: item.library === "Micro-défis" ? "MICRO_CHALLENGE" : "RECOMMENDATION",
            position: index + 1,
            rationale: text(item.data, "texte_affiche") || text(item.data, "description"),
          })),
        },
      },
      include: { items: { orderBy: { position: "asc" }, include: { libraryItem: true } } },
    });
  }

  static async byUser(userId: string) {
    return prisma.relationalPrescription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: { orderBy: { position: "asc" }, include: { libraryItem: true } } },
    });
  }
}
