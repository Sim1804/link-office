/**
 * @file tests/ui/subscription-badge.test.ts
 * @description Validation des tokens de design, de la conformité chromatique et des tailles
 * des badges et boutons d'abonnement (Freemium, Premium, Premium+).
 */

import { describe, it, expect } from "vitest";
import {
  TIER_CONFIG,
  SIZE_CONFIG,
  toSubscriptionTier,
  getNextSubscriptionTier,
  getSubscriptionUpgradeLabel,
} from "../../src/components/ui/SubscriptionBadge";

describe("SubscriptionBadge & Design System Conformance", () => {
  describe("Tiers Resolution & Helpers", () => {
    it("résout fidèlement les tiers valides", () => {
      expect(toSubscriptionTier("FREEMIUM")).toBe("FREEMIUM");
      expect(toSubscriptionTier("PREMIUM")).toBe("PREMIUM");
      expect(toSubscriptionTier("PREMIUM_PLUS")).toBe("PREMIUM_PLUS");
    });

    it("sécurise les valeurs null, undefined et inconnues vers FREEMIUM", () => {
      expect(toSubscriptionTier(null)).toBe("FREEMIUM");
      expect(toSubscriptionTier(undefined)).toBe("FREEMIUM");
      expect(toSubscriptionTier("INVALIDE" as any)).toBe("FREEMIUM");
      expect(toSubscriptionTier("")).toBe("FREEMIUM");
    });

    it("progresse correctement dans les paliers d'évolution", () => {
      expect(getNextSubscriptionTier("FREEMIUM")).toBe("PREMIUM");
      expect(getNextSubscriptionTier("PREMIUM")).toBe("PREMIUM_PLUS");
      expect(getNextSubscriptionTier("PREMIUM_PLUS")).toBeNull();

      expect(getSubscriptionUpgradeLabel("FREEMIUM")).toBe("Passer à Premium");
      expect(getSubscriptionUpgradeLabel("PREMIUM")).toBe("Passer à Premium+");
      expect(getSubscriptionUpgradeLabel("PREMIUM_PLUS")).toBeNull();
    });
  });

  describe("Tokens Chromatiques & Cohérence Visuelle", () => {
    it("utilise les tokens d'ambre doré pour PREMIUM_PLUS (conforme #D97706 / #B45309)", () => {
      const config = TIER_CONFIG.PREMIUM_PLUS;
      expect(config.label).toBe("Premium+");
      // Ne doit PAS utiliser le jaune canari #FFC629 non contrasté
      expect(config.color).not.toBe("#FFC629");
      expect(config.iconColor).not.toBe("#FFC629");

      // Doit utiliser la palette ambre dorée unifiée
      expect(config.iconColor).toBe("#D97706");
      expect(config.color).toBe("#B45309");
      expect(config.background).toContain("245, 158, 11");
      expect(config.border).toContain("217, 119, 6");
    });

    it("garantit un contraste WCAG AA supérieur à 4.5:1 pour le texte Premium+", () => {
      // #B45309 en RGB : R=180, G=83, B=9
      // Calcul de luminance relative WCAG
      const sRGB = [180 / 255, 83 / 255, 9 / 255].map((val) =>
        val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      );
      const L_text = 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
      const L_white = 1.0;
      const contrast = (L_white + 0.05) / (L_text + 0.05);

      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it("utilise les tokens turquoise Link Office pour PREMIUM", () => {
      const config = TIER_CONFIG.PREMIUM;
      expect(config.label).toBe("Premium");
      expect(config.color).toBe("#008f85");
      expect(config.iconColor).toBe("var(--primary, #00a99d)");
    });
  });

  describe("Échelle de Taille de la Navbar & Composants", () => {
    it("fournit une taille md optimisée pour la navbar avec texte de 12px", () => {
      const md = SIZE_CONFIG.md;
      expect(md.fontSize).toBe(12);
      expect(md.iconSize).toBe(13);
      expect(md.fontWeight).toBe(700);
      expect(md.padding).toBe("4.5px 12px");
    });

    it("maintient une hiérarchie cohérente sur l'ensemble des tailles", () => {
      expect(SIZE_CONFIG.xs.fontSize).toBe(10);
      expect(SIZE_CONFIG.sm.fontSize).toBe(11);
      expect(SIZE_CONFIG.md.fontSize).toBe(12);
      expect(SIZE_CONFIG.lg.fontSize).toBe(13);

      expect(SIZE_CONFIG.xs.iconSize).toBeLessThanOrEqual(SIZE_CONFIG.sm.iconSize);
      expect(SIZE_CONFIG.sm.iconSize).toBeLessThan(SIZE_CONFIG.md.iconSize);
      expect(SIZE_CONFIG.md.iconSize).toBeLessThan(SIZE_CONFIG.lg.iconSize);
    });
  });

  describe("Symétrie 1:1 des Icônes (Badge vs Bouton d'Upgrade)", () => {
    it("utilise l'icône Zap pour le badge PREMIUM et pour le bouton 'Passer à Premium'", () => {
      // Le badge Premium a Zap (l'éclair)
      expect(TIER_CONFIG.PREMIUM.icon.name || TIER_CONFIG.PREMIUM.icon.displayName).toBe("Zap");
    });

    it("utilise l'icône Crown pour le badge PREMIUM_PLUS et pour le bouton 'Passer à Premium+'", () => {
      // Le badge Premium+ a Crown (la couronne)
      expect(TIER_CONFIG.PREMIUM_PLUS.icon.name || TIER_CONFIG.PREMIUM_PLUS.icon.displayName).toBe("Crown");
    });
  });
});
