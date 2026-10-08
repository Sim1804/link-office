import { describe, it, expect } from "vitest";
import {
  PRESCRIPTION_SCORING_WEIGHTS,
  calculatePrescriptionItemScore,
} from "@/lib/iqrh/prescription-service";
import { IcrCalculationService } from "@/lib/iqrh/icr-calculation-service";
import {
  NotificationService,
  WEEKLY_NOTIFICATION_LIMIT,
  SCORE_DROP_ALERT_THRESHOLD,
} from "@/lib/notifications";
import {
  calculateCompatibilityScore,
  DEFAULT_MATCHING_CONFIG,
} from "@/lib/binome/matching-service";

describe("Phase 3 : Moteurs et Cohérence avec la Spécification", () => {
  describe("3.1 Moteur de Recommandation & Poids de Prescription", () => {
    it("expose l'objet de configuration unique PRESCRIPTION_SCORING_WEIGHTS avec les poids spécifiés", () => {
      expect(PRESCRIPTION_SCORING_WEIGHTS.dimensionActionTier.securisationUnder40).toBe(5);
      expect(PRESCRIPTION_SCORING_WEIGHTS.dimensionActionTier.reconstruction40to59).toBe(4);
      expect(PRESCRIPTION_SCORING_WEIGHTS.dimensionActionTier.consolidation60to79).toBe(3);
      expect(PRESCRIPTION_SCORING_WEIGHTS.dimensionActionTier.preservation80Plus).toBe(2);
      expect(PRESCRIPTION_SCORING_WEIGHTS.lifeSituation).toBe(3);
      expect(PRESCRIPTION_SCORING_WEIGHTS.primaryProfile).toBe(2);
      expect(PRESCRIPTION_SCORING_WEIGHTS.secondaryProfile).toBe(1);
      expect(PRESCRIPTION_SCORING_WEIGHTS.dominantNeeds).toBe(2);
      expect(PRESCRIPTION_SCORING_WEIGHTS.riskFactors).toBe(2);
      expect(PRESCRIPTION_SCORING_WEIGHTS.protectiveFactors).toBe(1.5);
      expect(PRESCRIPTION_SCORING_WEIGHTS.profileAngleKeywords).toBe(1.5);
    });

    it("calcule avec exactitude le score d'une ressource selon les correspondances contextuelles", () => {
      const mockItem = {
        data: {
          situations_ciblees: "Aidant, Télétravail",
          profils_cibles: "Connecteur, L'Ancre",
          besoins_couverts: "reconnaissance, soutien",
          type_action: "sécurisation",
          facteurs_risque_cibles: "surcharge mentale",
          impact_attendu_1_5: 4,
          texte_affiche: "Prendre du temps pour soi et définir une limite claire",
        },
      };

      const context = {
        situations: ["Aidant"], // +3
        profileName: "Connecteur", // +2 (profil principal) + 1.5 (angle mots-clés "temps pour soi")
        secondaryProfileName: "L'Ancre", // +1 (profil secondaire)
        dimensionScore: 35, // < 40 & "sécurisation" -> +5
        dominantNeeds: ["soutien"], // +2
        icrScore: 50,
        riskFactors: ["surcharge mentale"], // +2
        protectiveFactors: [],
      };

      // Attendu :
      // Base : 3 (situation) + 2 (profil1) + 1 (profil2) + 2 (besoins) + 5 (sécurisation < 40) + 2 (risque) = 15
      // Impact : 4 / 10 = 0.4
      // Angle : +1.5
      // Total = 16.9
      const calculated = calculatePrescriptionItemScore(mockItem, context);
      expect(calculated).toBeCloseTo(16.9, 1);
    });
  });

  describe("3.2 Renormalisation de l'Indice de Charge Relationnelle (ICR) sur [0, 100]", () => {
    it("renormalise le score brut de 85 à exactement 100 (Ratio 100 / 85 - Décision 3.2 Option A)", () => {
      // Configuration d'un profil atteignant le maximum théorique de 85 points :
      // - Complexité familiale : 20/20 (monoparentale + aidant + 3 enfants)
      // - Complexité professionnelle : 20/20 (entrepreneur + >250 salariés)
      // - Transitions de vie : 20/20 (divorce + deuil)
      // - Charge relationnelle : 25/25 (réponses adaptatives négatives extrêmes)
      // - Ressources protectrices : 0/15 (scores IQRH très faibles)
      const maxInput = {
        selectedSituations: ["Famille monoparentale", "Aidant", "Entrepreneur", "Manager", "Divorce", "Deuil"],
        children: true,
        childrenCount: 3,
        occupation: "Salarié",
        organizationSize: "Plus de 250 salariés",
        relationshipStatus: "Séparé(e) / Divorcé(e)",
        adaptiveAnswers: [
          { polarity: "NEGATIVE" as const, value: 5, label: "Tension" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Surcharge" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Conflit" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Isolement" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Fatigue" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Stress" },
          { polarity: "NEGATIVE" as const, value: 5, label: "Pression" },
        ],
        scores: {
          SOCIAL: 30,
          AFFECTIVE: 30,
          SENTIMENTAL: 30,
          PROFESSIONAL: 30,
          SELF: 30,
        },
        balanceIndex: 30,
        globalScore: 30,
      };

      const result = IcrCalculationService.calculate(maxInput);

      expect(result.familyComplexity).toBe(20);
      expect(result.professionalComplexity).toBe(20);
      expect(result.lifeTransitions).toBe(20);
      expect(result.relationalLoad).toBe(25);
      expect(result.protectiveResources).toBe(0);

      // Score brut = 20 + 20 + 20 + 25 - 0 = 85
      expect(result.rawScore).toBe(85);

      // Score renormalisé = (85 * 100) / 85 = 100 !
      expect(result.score).toBe(100);
      expect(result.level).toBe("Complexité critique");
    });

    it("garantit que le score ICR minimal est 0 pour un profil sans contraintes", () => {
      const minInput = {
        selectedSituations: [],
        children: false,
        occupation: "Autre",
        relationshipStatus: "En couple",
        adaptiveAnswers: [],
        scores: {
          SOCIAL: 90,
          AFFECTIVE: 90,
          SENTIMENTAL: 90,
          PROFESSIONAL: 90,
          SELF: 90,
        },
        balanceIndex: 90,
        globalScore: 90,
      };

      const result = IcrCalculationService.calculate(minInput);
      expect(result.rawScore).toBeLessThanOrEqual(0);
      expect(result.score).toBe(0);
      expect(result.level).toBe("Complexité faible");
    });
  });

  describe("3.3 Plafond de Notifications & Alerte Chute de 15 points", () => {
    it("respecte le plafond hebdomadaire de 2 notifications par utilisateur", () => {
      expect(WEEKLY_NOTIFICATION_LIMIT).toBe(2);
      expect(SCORE_DROP_ALERT_THRESHOLD).toBe(15);
    });

    it("déclenche l'éligibilité à l'alerte pour une chute >= 15 points entre deux évaluations", () => {
      expect(NotificationService.isScoreDropEligible(60, 75)).toBe(true); // -15 pts
      expect(NotificationService.isScoreDropEligible(55, 75)).toBe(true); // -20 pts
      expect(NotificationService.isScoreDropEligible(61, 75)).toBe(false); // -14 pts
      expect(NotificationService.isScoreDropEligible(80, 75)).toBe(false); // Progression
    });
  });

  describe("3.4 Algorithme du Binôme Relationnel & Cas Spécification", () => {
    it("respecte les paramètres de la spécification (base 50, seuil 75, synergie 60, similarité 40)", () => {
      expect(DEFAULT_MATCHING_CONFIG.baseScore).toBe(50);
      expect(DEFAULT_MATCHING_CONFIG.minimumThreshold).toBe(75);
      expect(DEFAULT_MATCHING_CONFIG.synergyWeight).toBe(60);
      expect(DEFAULT_MATCHING_CONFIG.similarityWeight).toBe(40);
    });

    it("Cas 1 — Synergie seule : éligible avec un score de 80 points (>= 75)", () => {
      const userA = { bestDimension: "SOCIAL", weakDimension: "SELF" };
      const userB = { bestDimension: "SELF", weakDimension: "PROFESSIONAL" }; // Force B = Faiblesse A

      const result = calculateCompatibilityScore(userA, userB);
      expect(result.hasSynergy).toBe(true);
      expect(result.hasSimilarity).toBe(false);
      expect(result.score).toBe(80); // 50 + 30 = 80
      expect(result.isEligible).toBe(true);
    });

    it("Cas 2 — Similarité seule : score de 70 points (insuffisant car < seuil 75)", () => {
      const userA = { bestDimension: "SOCIAL", weakDimension: "SELF" };
      const userB = { bestDimension: "SOCIAL", weakDimension: "SENTIMENTAL" }; // Même dimension forte

      const result = calculateCompatibilityScore(userA, userB);
      expect(result.hasSynergy).toBe(false);
      expect(result.hasSimilarity).toBe(true);
      expect(result.score).toBe(70); // 50 + 20 = 70
      expect(result.isEligible).toBe(false); // Rejeté car < 75
    });

    it("Cas 3 — Synergie ET Similarité combinées : match parfait de 100 points", () => {
      const userA = { bestDimension: "SOCIAL", weakDimension: "SOCIAL" };
      const userB = { bestDimension: "SOCIAL", weakDimension: "SOCIAL" };

      const result = calculateCompatibilityScore(userA, userB);
      expect(result.hasSynergy).toBe(true);
      expect(result.hasSimilarity).toBe(true);
      expect(result.score).toBe(100); // 50 + 30 + 20 = 100
      expect(result.isEligible).toBe(true);
    });

    it("Cas 4 — Ni synergie ni similarité : score de base de 50 points (refusé)", () => {
      const userA = { bestDimension: "SOCIAL", weakDimension: "SELF" };
      const userB = { bestDimension: "SENTIMENTAL", weakDimension: "PROFESSIONAL" };

      const result = calculateCompatibilityScore(userA, userB);
      expect(result.hasSynergy).toBe(false);
      expect(result.hasSimilarity).toBe(false);
      expect(result.score).toBe(50);
      expect(result.isEligible).toBe(false);
    });
  });
});
