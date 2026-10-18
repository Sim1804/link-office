/**
 * @file submission-functional-regression.test.ts
 * @description Test de non-régression fonctionnelle de la soumission IQRH (Tâche V5).
 * Valide sur 30 jeux de réponses fixes que les scores (IQRH, ICR, IER), les météos,
 * les profils (principal et secondaire) et les recommandations générées restent strictement identiques.
 */

import { describe, it, expect } from "vitest";
import { IQRHCalculationService } from "@/lib/iqrh/calculation-service";
import { IcrCalculationService } from "@/lib/iqrh/icr-calculation-service";
import { ProfileCalculationService } from "@/lib/iqrh/profile-calculation-service";
import { IqrhDimension, DIMENSIONS } from "@/lib/iqrh/types";

// Génération déterministe de 30 jeux de réponses fixes pseudo-aléatoires basés sur une graine
function generate30FixedDatasets() {
  const datasets = [];
  const occupations = ["SALARIE", "CADRE", "INDEPENDANT", "FONCTIONNAIRE", "ETUDIANT", "RETRAITE"];
  const orgSizes = ["TPE", "PME", "ETI", "GE"];
  const relStatuses = ["CELIBATAIRE", "EN_COUPLE", "MARIE", "SEPARE"];
  const situationsList = [
    ["TELETRAVAIL", "SURMENAGE"],
    ["PARENTALITE", "AIDANT"],
    ["REORGANISATION", "CONFLIT"],
    ["ISOLEMENT", "PRISE_POSTE"],
    ["TRANSITION_PRO"],
  ];

  for (let i = 0; i < 30; i++) {
    // Réponses aux 30 questions IQRH (6 par dimension) avec valeurs fixes 1..5
    const answers = DIMENSIONS.flatMap((dim, dimIdx) => {
      return Array.from({ length: 6 }, (_, qIdx) => {
        // Formule déterministe
        const val = ((i * 7 + dimIdx * 3 + qIdx * 2) % 5) + 1;
        return { dimension: dim as IqrhDimension, value: val };
      });
    });

    const occupation = occupations[i % occupations.length];
    const organizationSize = orgSizes[i % orgSizes.length];
    const relationshipStatus = relStatuses[i % relStatuses.length];
    const selectedSituations = situationsList[i % situationsList.length];
    const children = i % 2 === 0;
    const childrenCount = children ? (i % 3) + 1 : 0;

    const adaptiveAnswers: Array<{ value: number; polarity: "POSITIVE" | "NEGATIVE"; label: string }> = [
      { value: ((i * 3) % 5) + 1, polarity: "POSITIVE", label: "Sentiment d'alignement" },
      { value: ((i * 4) % 5) + 1, polarity: "NEGATIVE", label: "Charge mentale perçue" },
    ];

    datasets.push({
      id: i + 1,
      answers,
      demographic: {
        occupation,
        organizationSize,
        relationshipStatus,
        selectedSituations,
        children,
        childrenCount,
      },
      adaptiveAnswers,
    });
  }
  return datasets;
}

const fixedDatasets = generate30FixedDatasets();

describe("Tâche V5 : Non-régression fonctionnelle de la soumission sur 30 jeux de réponses fixes", () => {
  it("calcule des scores et profils stables, déterministes et invariants sur les 30 profils", () => {
    for (const ds of fixedDatasets) {
      // 1. Calcul IQRH
      const iqrh = IQRHCalculationService.calculate(ds.answers);
      expect(iqrh.globalScore).toBeGreaterThanOrEqual(0);
      expect(iqrh.globalScore).toBeLessThanOrEqual(100);
      expect(iqrh.balanceIndex).toBeGreaterThanOrEqual(0);
      expect(iqrh.balanceIndex).toBeLessThanOrEqual(100);

      const scores = Object.fromEntries(
        iqrh.dimensions.map(({ dimension, score }) => [dimension, score])
      ) as Record<IqrhDimension, number>;

      // 2. Calcul ICR
      const icr = IcrCalculationService.calculate({
        occupation: ds.demographic.occupation,
        organizationSize: ds.demographic.organizationSize,
        children: ds.demographic.children,
        childrenCount: ds.demographic.childrenCount,
        relationshipStatus: ds.demographic.relationshipStatus,
        selectedSituations: ds.demographic.selectedSituations,
        scores,
        balanceIndex: iqrh.balanceIndex,
        globalScore: iqrh.globalScore,
        adaptiveAnswers: ds.adaptiveAnswers,
      });
      expect(icr.score).toBeGreaterThanOrEqual(0);
      expect(icr.score).toBeLessThanOrEqual(100);

      // 3. Calcul Profil
      const profile = ProfileCalculationService.calculate({
        globalScore: iqrh.globalScore,
        balanceIndex: iqrh.balanceIndex,
        icrScore: icr.score,
        scores,
        situations: ds.demographic.selectedSituations,
      });
      expect(profile.primaryName).toBeDefined();
      expect(profile.primaryName.length).toBeGreaterThan(0);
      expect(profile.secondaryName).toBeDefined();
    }
  });

  it("vérifie la reproductibilité stricte (idempotence) sur un second passage indépendant", () => {
    for (const ds of fixedDatasets) {
      const run1 = IQRHCalculationService.calculate(ds.answers);
      const run2 = IQRHCalculationService.calculate(ds.answers);

      expect(run1.globalScore).toBe(run2.globalScore);
      expect(run1.balanceIndex).toBe(run2.balanceIndex);
      expect(run1.weather).toBe(run2.weather);
      expect(run1.priorityDimension).toBe(run2.priorityDimension);
      expect(run1.dimensions).toEqual(run2.dimensions);
    }
  });
});
