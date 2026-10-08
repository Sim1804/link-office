import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { IQRHCalculationService } from "@/lib/iqrh/calculation-service";
import { ProfileCalculationService } from "@/lib/iqrh/profile-calculation-service";
import { IqrhDimension, DIMENSIONS } from "@/lib/iqrh/types";

describe("Phase 4.1 : Tests Psychométriques & Propriétés Formelles (fast-check)", () => {
  describe("1. Calculs des Scores IQRH & IER aux bornes et cas limites", () => {
    it("Cas '1 partout' : score 0 sur toutes les dimensions, global 0, IER 100, Météo Tempête", () => {
      const answersAll1 = DIMENSIONS.flatMap((dimension) =>
        Array.from({ length: 6 }, () => ({ dimension, value: 1 }))
      );

      const result = IQRHCalculationService.calculate(answersAll1);

      expect(result.globalScore).toBe(0);
      expect(result.balanceIndex).toBe(100); // 100 - (0 - 0) = 100
      expect(result.weather).toBe("Tempête");

      for (const dim of result.dimensions) {
        expect(dim.score).toBe(0);
        expect(dim.level).toBe("priority");
      }
    });

    it("Cas '5 partout' : score 100 sur toutes les dimensions, global 100, IER 100, Météo Grand soleil", () => {
      const answersAll5 = DIMENSIONS.flatMap((dimension) =>
        Array.from({ length: 6 }, () => ({ dimension, value: 5 }))
      );

      const result = IQRHCalculationService.calculate(answersAll5);

      expect(result.globalScore).toBe(100);
      expect(result.balanceIndex).toBe(100); // 100 - (100 - 100) = 100
      expect(result.weather).toBe("Grand soleil");

      for (const dim of result.dimensions) {
        expect(dim.score).toBe(100);
        expect(dim.level).toBe("resource");
      }
    });

    it("Cas 'dimensions opposées' : D1 = 100 et D2 = 0 produit un IER de 0 (déséquilibre maximal)", () => {
      // D1(SOCIAL) = 5 partout -> 100
      // D2(AFFECTIVE) = 1 partout -> 0
      // D3, D4, D5 = 3 partout -> 50
      const answersOpposed = [
        ...Array.from({ length: 6 }, () => ({ dimension: "SOCIAL" as IqrhDimension, value: 5 })),
        ...Array.from({ length: 6 }, () => ({ dimension: "AFFECTIVE" as IqrhDimension, value: 1 })),
        ...Array.from({ length: 6 }, () => ({ dimension: "SENTIMENTAL" as IqrhDimension, value: 3 })),
        ...Array.from({ length: 6 }, () => ({ dimension: "PROFESSIONAL" as IqrhDimension, value: 3 })),
        ...Array.from({ length: 6 }, () => ({ dimension: "SELF" as IqrhDimension, value: 3 })),
      ];

      const result = IQRHCalculationService.calculate(answersOpposed);

      expect(result.dimensions.find((d) => d.dimension === "SOCIAL")?.score).toBe(100);
      expect(result.dimensions.find((d) => d.dimension === "AFFECTIVE")?.score).toBe(0);
      // IER = 100 - (100 - 0) = 0
      expect(result.balanceIndex).toBe(0);
      expect(result.balanceLevel).toBe("Déséquilibre majeur");
    });
  });

  describe("2. Couverture Unitaire des 12 Profils Relationnels (1 cas dédié par profil)", () => {
    it("1. Profil 'Le Connecteur'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 80,
        balanceIndex: 75,
        icrScore: 20,
        scores: { SOCIAL: 90, AFFECTIVE: 70, SENTIMENTAL: 60, PROFESSIONAL: 50, SELF: 50 },
        situations: [],
      });
      expect(result.primaryName).toBe("Le Connecteur");
    });

    it("2. Profil 'L'Ancre'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 65,
        balanceIndex: 50,
        icrScore: 20,
        scores: { SOCIAL: 40, AFFECTIVE: 85, SENTIMENTAL: 50, PROFESSIONAL: 40, SELF: 85 },
        situations: [],
      });
      expect(result.primaryName).toBe("L'Ancre");
    });

    it("3. Profil 'Le Bâtisseur'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 65,
        balanceIndex: 50,
        icrScore: 20,
        scores: { SOCIAL: 40, AFFECTIVE: 40, SENTIMENTAL: 40, PROFESSIONAL: 95, SELF: 70 },
        situations: [],
      });
      expect(result.primaryName).toBe("Le Bâtisseur");
    });

    it("4. Profil 'Le Protecteur'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 60,
        balanceIndex: 50,
        icrScore: 30,
        scores: { SOCIAL: 50, AFFECTIVE: 75, SENTIMENTAL: 50, PROFESSIONAL: 50, SELF: 50 },
        situations: ["Parent", "Aidant"],
      });
      expect(result.primaryName).toBe("Le Protecteur");
    });

    it("5. Profil 'Le Résilient'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 55,
        balanceIndex: 65,
        icrScore: 50,
        scores: { SOCIAL: 50, AFFECTIVE: 50, SENTIMENTAL: 50, PROFESSIONAL: 50, SELF: 50 },
        situations: [],
      });
      expect(result.primaryName).toBe("Le Résilient");
    });

    it("6. Profil 'L'Explorateur'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 60,
        balanceIndex: 50,
        icrScore: 20,
        scores: { SOCIAL: 85, AFFECTIVE: 50, SENTIMENTAL: 55, PROFESSIONAL: 50, SELF: 50 },
        situations: ["Célibataire"],
      });
      expect(result.primaryName).toBe("L'Explorateur");
    });

    it("7. Profil 'Le Chercheur d'équilibre'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 65,
        balanceIndex: 95,
        icrScore: 20,
        scores: { SOCIAL: 65, AFFECTIVE: 65, SENTIMENTAL: 65, PROFESSIONAL: 65, SELF: 65 },
        situations: [],
      });
      expect(result.primaryName).toBe("Le Chercheur d'équilibre");
    });

    it("8. Profil 'Le Soliste'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 45,
        balanceIndex: 40,
        icrScore: 20,
        scores: { SOCIAL: 30, AFFECTIVE: 30, SENTIMENTAL: 30, PROFESSIONAL: 40, SELF: 85 },
        situations: ["Personne vivant seule"],
      });
      expect(result.primaryName).toBe("Le Soliste");
    });

    it("9. Profil 'Le Suradapté'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 40,
        balanceIndex: 40,
        icrScore: 30,
        scores: { SOCIAL: 50, AFFECTIVE: 50, SENTIMENTAL: 40, PROFESSIONAL: 50, SELF: 40 },
        situations: ["Parent", "Manager"],
      });
      expect(result.primaryName).toBe("Le Suradapté");
    });

    it("10. Profil 'Le Réorganisateur'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 50,
        balanceIndex: 40,
        icrScore: 40,
        scores: { SOCIAL: 50, AFFECTIVE: 50, SENTIMENTAL: 40, PROFESSIONAL: 40, SELF: 40 },
        situations: ["Divorce", "Création d'entreprise"],
      });
      expect(result.primaryName).toBe("Le Réorganisateur");
    });

    it("11. Profil 'L'Inspirant'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 88,
        balanceIndex: 90,
        icrScore: 10,
        scores: { SOCIAL: 85, AFFECTIVE: 90, SENTIMENTAL: 85, PROFESSIONAL: 90, SELF: 90 },
        situations: [],
      });
      expect(result.primaryName).toBe("L'Inspirant");
    });

    it("12. Profil 'L'Équilibriste'", () => {
      const result = ProfileCalculationService.calculate({
        globalScore: 78,
        balanceIndex: 50,
        icrScore: 50,
        scores: { SOCIAL: 80, AFFECTIVE: 50, SENTIMENTAL: 75, PROFESSIONAL: 50, SELF: 50 },
        situations: [],
      });
      expect(result.primaryName).toBe("L'Équilibriste");
    });
  });

  describe("3. Tests de Propriété Formelle avec fast-check", () => {
    // Générateur d'un vecteur valide de 30 réponses (6 par dimension, Likert 1–5)
    const answersArbitrary = fc.tuple(
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 6, maxLength: 6 })
    ).map(([soc, aff, sent, pro, self]) => [
      ...soc.map((v) => ({ dimension: "SOCIAL" as IqrhDimension, value: v })),
      ...aff.map((v) => ({ dimension: "AFFECTIVE" as IqrhDimension, value: v })),
      ...sent.map((v) => ({ dimension: "SENTIMENTAL" as IqrhDimension, value: v })),
      ...pro.map((v) => ({ dimension: "PROFESSIONAL" as IqrhDimension, value: v })),
      ...self.map((v) => ({ dimension: "SELF" as IqrhDimension, value: v })),
    ]);

    it("Propriété 1 — Bornes : Tout résultat respecte strictement l'intervalle [0, 100]", () => {
      fc.assert(
        fc.property(answersArbitrary, (answers) => {
          const result = IQRHCalculationService.calculate(answers);

          expect(result.globalScore).toBeGreaterThanOrEqual(0);
          expect(result.globalScore).toBeLessThanOrEqual(100);

          expect(result.balanceIndex).toBeGreaterThanOrEqual(0);
          expect(result.balanceIndex).toBeLessThanOrEqual(100);

          for (const dim of result.dimensions) {
            expect(dim.score).toBeGreaterThanOrEqual(0);
            expect(dim.score).toBeLessThanOrEqual(100);
          }
        }),
        { numRuns: 100 }
      );
    });

    it("Propriété 2 — Déterminisme : Le même vecteur d'entrée produit toujours exactement le même rapport", () => {
      fc.assert(
        fc.property(answersArbitrary, (answers) => {
          const res1 = IQRHCalculationService.calculate(answers);
          const res2 = IQRHCalculationService.calculate(answers);

          expect(res1.globalScore).toBe(res2.globalScore);
          expect(res1.balanceIndex).toBe(res2.balanceIndex);
          expect(res1.weather).toBe(res2.weather);
          expect(res1.dimensions.map((d) => d.score)).toEqual(res2.dimensions.map((d) => d.score));
        }),
        { numRuns: 100 }
      );
    });

    it("Propriété 3 — Monotonie : Augmenter la valeur d'une réponse ne peut jamais diminuer le score dimensionnel", () => {
      fc.assert(
        fc.property(answersArbitrary, fc.integer({ min: 0, max: 29 }), (answers, targetIndex) => {
          const currentValue = answers[targetIndex].value;
          if (currentValue === 5) return true; // Déjà au max

          const improvedAnswers = answers.map((a, i) =>
            i === targetIndex ? { ...a, value: currentValue + 1 } : a
          );

          const resBefore = IQRHCalculationService.calculate(answers);
          const resAfter = IQRHCalculationService.calculate(improvedAnswers);

          const targetDimension = answers[targetIndex].dimension;
          const scoreBefore = resBefore.dimensions.find((d) => d.dimension === targetDimension)!.score;
          const scoreAfter = resAfter.dimensions.find((d) => d.dimension === targetDimension)!.score;

          expect(scoreAfter).toBeGreaterThanOrEqual(scoreBefore);
          expect(resAfter.globalScore).toBeGreaterThanOrEqual(resBefore.globalScore);
        }),
        { numRuns: 100 }
      );
    });
  });
});
