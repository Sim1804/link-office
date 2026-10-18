import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { IQRHCalculationService } from "@/lib/iqrh/calculation-service";
import { IcrCalculationService, IcrInput } from "@/lib/iqrh/icr-calculation-service";
import { IqrhDimension } from "@/lib/iqrh/types";

describe("C10 — Propriétés T5 d'indépendance et dépendance à sens unique (E12)", () => {
  // Générateur d'un vecteur valide de 30 réponses IQRH (6 par dimension, Likert 1–5)
  const answersArbitrary = fc
    .tuple(
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 })
    )
    .map(([soc, aff, sent, pro, self]) => [
      ...soc.map((v) => ({ dimension: "SOCIAL" as IqrhDimension, value: v })),
      ...aff.map((v) => ({ dimension: "AFFECTIVE" as IqrhDimension, value: v })),
      ...sent.map((v) => ({ dimension: "SENTIMENTAL" as IqrhDimension, value: v })),
      ...pro.map((v) => ({ dimension: "PROFESSIONAL" as IqrhDimension, value: v })),
      ...self.map((v) => ({ dimension: "SELF" as IqrhDimension, value: v })),
    ]);

  // Générateur de contexte ICR complet (données démographiques, situations et réponses adaptatives)
  const icrContextArbitrary = fc.record({
    occupation: fc.constantFrom("Salarié", "Manager", "Entrepreneur", "Demandeur", "Parent au foyer", "Étudiant", "Retraité"),
    organizationSize: fc.constantFrom("1 à 10 salariés", "11 à 50 salariés", "51 à 250 salariés", "Plus de 250 salariés", null),
    children: fc.boolean(),
    childrenCount: fc.integer({ min: 0, max: 5 }),
    relationshipStatus: fc.constantFrom("En couple", "Célibataire", "Séparé(e) / Divorcé(e)", "Veuf(ve)"),
    selectedSituations: fc.subarray([
      "Parent",
      "Aidant",
      "Célibataire",
      "Personne vivant seule",
      "Manager",
      "Divorce",
      "Deuil",
      "Création d'entreprise",
      "Demandeur d'emploi",
      "Famille monoparentale",
      "Entrepreneur",
      "Étudiant",
      "Retraité",
    ]),
    adaptiveAnswers: fc.array(
      fc.record({
        value: fc.integer({ min: 1, max: 5 }),
        polarity: fc.constantFrom("POSITIVE" as const, "NEGATIVE" as const),
        label: fc.string({ minLength: 1, maxLength: 20 }),
      }),
      { maxLength: 10 }
    ),
  });

  it("1. Propriété vraie d'indépendance : pour des réponses IQRH fixées, faire varier toutes les entrées ICR ne change jamais les sous-scores, le score global ni l'IER (1 000 exécutions)", () => {
    let runs = 0;
    fc.assert(
      fc.property(
        answersArbitrary,
        icrContextArbitrary,
        icrContextArbitrary,
        (answers, icrCtxA, icrCtxB) => {
          runs++;
          // Évaluation pour un utilisateur avec contexte ICR A
          const iqrhA = IQRHCalculationService.calculate(answers);
          const scoresA = Object.fromEntries(
            iqrhA.dimensions.map(({ dimension, score }) => [dimension, score])
          ) as Record<IqrhDimension, number>;
          const icrA = IcrCalculationService.calculate({
            ...icrCtxA,
            scores: scoresA,
            balanceIndex: iqrhA.balanceIndex,
            globalScore: iqrhA.globalScore,
          });

          // Évaluation pour un utilisateur avec contexte ICR B complètement différent
          const iqrhB = IQRHCalculationService.calculate(answers);
          const scoresB = Object.fromEntries(
            iqrhB.dimensions.map(({ dimension, score }) => [dimension, score])
          ) as Record<IqrhDimension, number>;
          const icrB = IcrCalculationService.calculate({
            ...icrCtxB,
            scores: scoresB,
            balanceIndex: iqrhB.balanceIndex,
            globalScore: iqrhB.globalScore,
          });

          // Validation que les calculs ICR ont bien été exécutés
          if (typeof icrA.score !== "number" || typeof icrB.score !== "number") {
            return false;
          }

          // Invariance stricte de l'IQRH :
          // 1. Sous-scores des 5 dimensions strictement identiques
          for (let i = 0; i < iqrhA.dimensions.length; i++) {
            if (iqrhA.dimensions[i].score !== iqrhB.dimensions[i].score) {
              return false;
            }
          }

          // 2. Score global IQRH strictement identique
          if (iqrhA.globalScore !== iqrhB.globalScore) {
            return false;
          }

          // 3. IER (balanceIndex) strictement identique
          if (iqrhA.balanceIndex !== iqrhB.balanceIndex) {
            return false;
          }

          return true;
        }
      ),
      { numRuns: 1000 }
    );

    expect(runs).toBe(1000);
  });

  it("2. Propriété distincte de dépendance à sens unique : l'ICR varie quand l'IQRH varie (D1 >= 70 -> -3, IER >= 75 -> -2, global >= 70 -> -2) (1 000 exécutions)", () => {
    let runs = 0;

    // Contexte ICR neutre avec une charge modérée/élevée (sans réponses adaptatives saturant les ressources)
    const baseIcrArbitrary = fc.record({
      occupation: fc.constantFrom("Salarié", "Manager"),
      children: fc.boolean(),
      childrenCount: fc.integer({ min: 0, max: 2 }),
      relationshipStatus: fc.constantFrom("En couple", "Célibataire"),
      selectedSituations: fc.subarray(["Aidant", "Manager", "Parent"]),
      adaptiveAnswers: fc.constant([]), // aucune ressource protectrice issue de l'adaptatif
    });

    fc.assert(
      fc.property(baseIcrArbitrary, (baseIcr) => {
        runs++;

        // Base de scores IQRH neutres sous les seuils protecteurs (< 70, < 75)
        const lowScores: Record<IqrhDimension, number> = {
          SOCIAL: 50,
          AFFECTIVE: 50,
          SENTIMENTAL: 50,
          PROFESSIONAL: 50,
          SELF: 50,
        };
        const lowBalanceIndex = 50;
        const lowGlobalScore = 50;

        const baseInput: IcrInput = {
          ...baseIcr,
          scores: lowScores,
          balanceIndex: lowBalanceIndex,
          globalScore: lowGlobalScore,
        };

        const resBase = IcrCalculationService.calculate(baseInput);

        // --- Test Condition 1 : D1 (SOCIAL) >= 70 -> déduction de 3 points sur rawScore ---
        const inputHighD1: IcrInput = {
          ...baseIcr,
          scores: { ...lowScores, SOCIAL: 70 },
          balanceIndex: lowBalanceIndex,
          globalScore: lowGlobalScore,
        };
        const resHighD1 = IcrCalculationService.calculate(inputHighD1);
        expect(resHighD1.protectiveResources - resBase.protectiveResources).toBe(3);
        expect(resBase.rawScore! - resHighD1.rawScore!).toBe(3);
        expect(resHighD1.score).toBeLessThanOrEqual(resBase.score);

        // --- Test Condition 2 : IER >= 75 -> déduction de 2 points sur rawScore ---
        const inputHighIER: IcrInput = {
          ...baseIcr,
          scores: lowScores,
          balanceIndex: 75,
          globalScore: lowGlobalScore,
        };
        const resHighIER = IcrCalculationService.calculate(inputHighIER);
        expect(resHighIER.protectiveResources - resBase.protectiveResources).toBe(2);
        expect(resBase.rawScore! - resHighIER.rawScore!).toBe(2);
        expect(resHighIER.score).toBeLessThanOrEqual(resBase.score);

        // --- Test Condition 3 : Global >= 70 -> déduction de 2 points sur rawScore ---
        const inputHighGlobal: IcrInput = {
          ...baseIcr,
          scores: lowScores,
          balanceIndex: lowBalanceIndex,
          globalScore: 70,
        };
        const resHighGlobal = IcrCalculationService.calculate(inputHighGlobal);
        expect(resHighGlobal.protectiveResources - resBase.protectiveResources).toBe(2);
        expect(resBase.rawScore! - resHighGlobal.rawScore!).toBe(2);
        expect(resHighGlobal.score).toBeLessThanOrEqual(resBase.score);

        return true;
      }),
      { numRuns: 1000 }
    );

    expect(runs).toBe(1000);
  });
});
