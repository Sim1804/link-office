import React from 'react';
import { Check } from 'lucide-react';

export function GrilleTarifaire() {
  const plans = [
    {
      name: "Indépendant / Essentiel",
      price: "0€",
      desc: "Pour les individus souhaitant évaluer leur qualité relationnelle.",
      features: [
        "1 diagnostic IQRH par an",
        "Profil relationnel de base",
        "Accès limité au Coach IRIS",
      ],
      cta: "Commencer",
      highlight: false,
    },
    {
      name: "Équipe / PME",
      price: "19€",
      period: "/mois/util.",
      desc: "Pour les collectifs qui veulent piloter leurs dynamiques.",
      features: [
        "Diagnostics illimités",
        "Baromètre météo hebdomadaire",
        "Coach IRIS illimité",
        "Comparatifs sectoriels",
        "Plans d'actions managériaux",
      ],
      cta: "Essai gratuit de 30 jours",
      highlight: true,
    },
    {
      name: "Entreprise / ETI",
      price: "Sur mesure",
      desc: "Pour un déploiement global et des audits approfondis.",
      features: [
        "Cartographie RPS avancée",
        "Intégration SIRH",
        "Accompagnement sociologue dédié",
        "SSO & Sécurité sur-mesure",
      ],
      cta: "Contacter les ventes",
      highlight: false,
    }
  ];

  return (
    <section className="py-24 bg-[var(--color-surface-2)]">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Grille Tarifaire
          </span>
          <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
            Un investissement dans votre capital humain
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          {plans.map((plan, idx) => (
            <div key={idx} className={`card-premium p-8 relative ${plan.highlight ? 'border-[var(--color-primary)] shadow-glow-cyan md:-translate-y-4' : ''}`}>
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-primary)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Recommandé
                </div>
              )}
              <h3 className="font-jakarta font-bold text-xl mb-2">{plan.name}</h3>
              <p className="text-[var(--color-text-secondary)] text-sm mb-6 min-h-[40px]">{plan.desc}</p>
              
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[var(--color-text-primary)] font-mono">{plan.price}</span>
                {plan.period && <span className="text-[var(--color-text-secondary)]">{plan.period}</span>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--color-text-secondary)] text-sm font-medium">
                    <div className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary)] flex items-center justify-center mt-0.5">
                      <Check size={12} />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <button className={`w-full btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} btn-md`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
