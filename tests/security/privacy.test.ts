import { describe, it, expect } from "vitest";
import {
  ANONYMITY_THRESHOLD,
  isSampleAnonymized,
  anonymizeCell,
  validateCrossFilterSample,
  createAnonymityBlockedResponse,
  applySecondarySuppression,
  checkHomogeneityRisk,
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

  describe("B3. Anti-recoupement & Suppression Complémentaire (Secondary Suppression)", () => {
    it("masque au moins deux cellules lorsqu'une seule cellule est < 5 pour interdire le recoupement par soustraction", () => {
      // Cas hand-crafted : Total = 20, CDI = 19, CDD = 1
      // Si on ne masquait que CDD, l'attaquant déduirait CDD = 20 - 19 = 1.
      const ventilationContrat = [
        { label: "CDI", count: 19, value: 72 },
        { label: "CDD", count: 1, value: 65 },
      ];

      const result = applySecondarySuppression(ventilationContrat);

      // La cellule CDD subit la suppression primaire (< 5)
      const cdd = result.find((r) => r.label === "CDD");
      expect(cdd?.isMasked).toBe(true);
      expect(cdd?.suppressionType).toBe("PRIMARY");
      expect(cdd?.value).toBeUndefined();

      // La cellule CDI subit la suppression secondaire pour empêcher le recoupement (19 = 20 - 1)
      const cdi = result.find((r) => r.label === "CDI");
      expect(cdi?.isMasked).toBe(true);
      expect(cdi?.suppressionType).toBe("SECONDARY");
      expect(cdi?.value).toBeUndefined();

      // Exactement 2 cellules masquées
      expect(result.filter((r) => r.isMasked).length).toBe(2);
    });

    it("ne déclenche pas de suppression secondaire si 2 cellules ou plus sont déjà masquées (< 5)", () => {
      const ventilationTrois = [
        { label: "Cat A", count: 15, value: 80 },
        { label: "Cat B", count: 2, value: 60 },
        { label: "Cat C", count: 3, value: 55 },
      ];

      const result = applySecondarySuppression(ventilationTrois);

      // Cat B et Cat C sont déjà masquées (2 cellules masquées) -> Cat A reste visible
      expect(result.find((r) => r.label === "Cat B")?.isMasked).toBe(true);
      expect(result.find((r) => r.label === "Cat C")?.isMasked).toBe(true);
      expect(result.find((r) => r.label === "Cat A")?.isMasked).toBe(false);
      expect(result.find((r) => r.label === "Cat A")?.value).toBe(80);
    });

    it("laisse toutes les cellules visibles si toutes sont >= 5", () => {
      const ventilationConforme = [
        { label: "Dept 1", count: 10, value: 70 },
        { label: "Dept 2", count: 8, value: 75 },
      ];

      const result = applySecondarySuppression(ventilationConforme);
      expect(result.every((r) => !r.isMasked)).toBe(true);
    });
  });

  describe("B3. Risque d'Attribut Homogène (Homogeneity Attack / l-diversity)", () => {
    it("détecte un risque si 100% ou >= 90% des membres d'un groupe partagent la même modalité sensible", () => {
      // 5 personnes (seuil k=5 respecté), mais 100% sont en "Risque critique"
      const distribution = [
        { label: "Risque critique", count: 5 },
        { label: "Risque faible", count: 0 },
      ];

      const check = checkHomogeneityRisk(distribution, 5);
      expect(check.hasHomogeneityRisk).toBe(true);
      expect(check.dominantLabel).toBe("Risque critique");
      expect(check.dominantRatio).toBe(1.0);
      expect(check.reason).toContain("Risque d'inférence par homogénéité");
    });

    it("ne signale aucun risque d'homogénéité si la distribution est équilibrée", () => {
      const distributionEquilibree = [
        { label: "Risque critique", count: 2 },
        { label: "Risque modéré", count: 2 },
        { label: "Risque faible", count: 2 },
      ];

      const check = checkHomogeneityRisk(distributionEquilibree, 6);
      expect(check.hasHomogeneityRisk).toBe(false);
    });
  });
});
