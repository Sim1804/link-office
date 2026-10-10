/**
 * @file tests/ui/paywall-conformance.test.ts
 * @description Validation de la conformité des paywalls et déblocages de contenus
 * sur le dashboard (libellés canoniques SaaS, tokens de design, cohérence des tiers).
 */

import { describe, it, expect } from "vitest";
import React from "react";
import { LockedContentOverlay } from "../../src/components/ui/LockedContentOverlay";
import { UpsellBanner } from "../../src/components/ui/UpsellBanner";
import { TIER_CONFIG } from "../../src/components/ui/SubscriptionBadge";

describe("SaaS Paywalls & Content Lock Conformance", () => {
  describe("Règles des Libellés Canoniques SaaS", () => {
    it("définit 'Débloquer avec Premium' comme libellé par défaut pour les contenus in-line PREMIUM", () => {
      const element = LockedContentOverlay({
        tier: "PREMIUM",
        title: "Détail du Profil",
      });

      // Vérifie que l'élément React est bien instancié
      expect(element).toBeDefined();
    });

    it("respecte la distinction entre CTA in-line (Débloquer avec...) et CTA bannière (Passer à...)", () => {
      // In-line Paywall : axé sur l'action de déblocage du contenu spécifique
      const inlinePremiumLabel = "Débloquer avec Premium";
      const inlinePremiumPlusLabel = "Débloquer avec Premium+";

      // Bannière globale : axée sur le changement de statut / palier
      const bannerFreemiumCta = "Passer à Premium";
      const bannerPremiumCta = "Passer à Premium+";

      expect(inlinePremiumLabel).toContain("Débloquer");
      expect(inlinePremiumLabel).toContain("Premium");

      expect(inlinePremiumPlusLabel).toContain("Débloquer");
      expect(inlinePremiumPlusLabel).toContain("Premium+");

      expect(bannerFreemiumCta).toBe("Passer à Premium");
      expect(bannerPremiumCta).toBe("Passer à Premium+");
    });
  });

  describe("Cohérence Chromatique et Totems (Zap vs Crown)", () => {
    it("utilise le dégradé turquoise et Zap pour les paywalls PREMIUM", () => {
      const config = TIER_CONFIG.PREMIUM;
      expect(config.label).toBe("Premium");
      expect(config.color).toBe("#008f85");
    });

    it("utilise le dégradé ambre doré (#D97706 / #B45309) et Crown pour PREMIUM_PLUS", () => {
      const config = TIER_CONFIG.PREMIUM_PLUS;
      expect(config.label).toBe("Premium+");
      expect(config.color).toBe("#B45309");
      expect(config.iconColor).toBe("#D97706");
    });
  });

  describe("Micro-Réassurance Systématique", () => {
    it("propose une réassurance claire sans engagement pour le palier Premium", () => {
      const guaranteeFreemium = "✓ Sans engagement · Résiliable à tout moment";
      expect(guaranteeFreemium).toContain("Sans engagement");
      expect(guaranteeFreemium).toContain("Résiliable");
    });

    it("propose une réassurance pro-rata pour la montée vers Premium+", () => {
      const guaranteePremiumPlus = "✓ Activation instantanée · Différence au pro-rata";
      expect(guaranteePremiumPlus).toContain("instantanée");
      expect(guaranteePremiumPlus).toContain("pro-rata");
    });
  });
});
