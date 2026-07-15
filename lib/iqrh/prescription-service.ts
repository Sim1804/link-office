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
    const recommendations = await prisma.libraryItem.findMany({
      where: { library: "Recommandations" },
      orderBy: { id: "asc" },
    });
    const selectedRecommendations = recommendations
      .filter((item) => contains(text(item.data, "dimensions_ciblees"), targetDimension))
      .sort((left, right) => {
        const leftSituation = situations.some((situation) => contains(text(left.data, "situations_ciblees"), situation)) ? 1 : 0;
        const rightSituation = situations.some((situation) => contains(text(right.data, "situations_ciblees"), situation)) ? 1 : 0;
        return rightSituation - leftSituation || left.id.localeCompare(right.id);
      })
      .slice(0, 3);
    const challenges = await prisma.libraryItem.findMany({
      where: { library: "Micro-défis", data: { path: ["dimension_ciblee"], string_contains: targetDimension } },
      orderBy: { id: "asc" },
      take: 2,
    });
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
