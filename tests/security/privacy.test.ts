import { describe, it, expect } from "vitest";
import {
  ANONYMITY_THRESHOLD,
  isSampleAnonymized,
  anonymizeCell,
  validateCrossFilterSample,
  createAnonymityBlockedResponse,
} from "../../src/lib/privacy";

describe("Module de Confidentialité & k-Anonymat (src/lib/privacy.ts)", () => {
  it("définit un seuil ANONYMITY_THRESHOLD universel à 5 conforme aux normes CNIL", () => {
    expect(ANONYMITY_THRESHOLD).toBe(5);
  });

  it("isSampleAnonymized valide les échantillons >= 5 et rejette les effectifs < 5", () => {
    expect(isSampleAnonymized(0)).toBe(false);
    expect(isSampleAnonymized(1)).toBe(false);
    expect(isSampleAnonymized(2)).toBe(false);
    expect(isSampleAnonymized(4)).toBe(false);
    expect(isSampleAnonymized(5)).toBe(true);
    expect(isSampleAnonymized(42)).toBe(true);
  });

  it("anonymizeCell masque les cellules dont l'effectif est < 5", () => {
    expect(anonymizeCell(4, 75.5)).toBeNull();
    expect(anonymizeCell(2, "Score critique")).toBeNull();
    expect(anonymizeCell(5, 75.5)).toBe(75.5);
    expect(anonymizeCell(10, { score: 80 })).toEqual({ score: 80 });
  });

  it("validateCrossFilterSample bloque les sous-groupes de filtres croisés entre 1 et 4", () => {
    const blockedSample = validateCrossFilterSample(3);
    expect(blockedSample.allowed).toBe(false);
    expect(blockedSample.anonymityBlocked).toBe(true);
    expect(blockedSample.respondentCount).toBe(3);
    expect(blockedSample.threshold).toBe(5);
    expect(blockedSample.reason).toContain("k >= 5");

    const validSample = validateCrossFilterSample(12);
    expect(validSample.allowed).toBe(true);
    expect(validSample.anonymityBlocked).toBe(false);
  });

  it("createAnonymityBlockedResponse génère une réponse HTTP conforme avec statut et seuil", async () => {
    const res = createAnonymityBlockedResponse(3);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.anonymityBlocked).toBe(true);
    expect(data.respondentCount).toBe(3);
    expect(data.threshold).toBe(5);
  });
});
