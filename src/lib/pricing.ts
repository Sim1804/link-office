export const PRICING_PLANS = {
  B2C_PREMIUM: {
    id: "B2C_PREMIUM",
    name: "Premium (Particulier)",
    description: "Prescriptions illimitées + carnet de santé relationnelle + coach IRIS illimité + historique complet",
    currency: "eur",
    monthly: {
      price: 999,
      stripePriceId: "price_b2c_premium_monthly"
    },
    annual: {
      price: 9590,
      stripePriceId: "price_b2c_premium_annual"
    }
  },
  B2C_PREMIUM_PLUS: {
    id: "B2C_PREMIUM_PLUS",
    name: "Premium + (Particulier)",
    description: "Tout Premium + accès exclusif au Binôme Relationnel",
    currency: "eur",
    monthly: {
      price: 1499,
      stripePriceId: "price_b2c_premium_plus_monthly"
    },
    annual: {
      price: 14390,
      stripePriceId: "price_b2c_premium_plus_annual"
    }
  },
  B2B_ENTREPRISE: {
    id: "B2B_ENTREPRISE",
    name: "Modèle B2B (Entreprises)",
    description: "Bilans IQRH pour les équipes + dashboard RH anonymisé",
    price: null, // Sur devis
    custom: true
  },
  B2G_COLLECTIVITE: {
    id: "B2G_COLLECTIVITE",
    name: "Modèle B2G (Collectivités)",
    description: "Baromètre territorial de santé relationnelle anonymisé",
    price: null, // Sur devis
    custom: true
  },
  B2B2C_PARTENAIRE: {
    id: "B2B2C_PARTENAIRE",
    name: "Modèle B2B2C (Partenaires/Mutuelles)",
    description: "Financez l'accès Premium ou Premium+ (avec Binôme) pour vos bénéficiaires",
    price: null, // Sur devis
    custom: true
  }
};
