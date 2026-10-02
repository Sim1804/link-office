import React from 'react';
import { Eye, BarChart, Zap, Search } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-8 h-8 text-[var(--color-primary)]" />,
    title: 'Comprendre',
    desc: 'Identifier les dynamiques sous-jacentes de vos équipes.',
  },
  {
    icon: <Eye className="w-8 h-8 text-[var(--color-accent-amber)]" />,
    title: 'Observer',
    desc: 'Capter les signaux faibles et la météo relationnelle.',
  },
  {
    icon: <BarChart className="w-8 h-8 text-[var(--color-accent-rose)]" />,
    title: 'Mesurer',
    desc: 'Quantifier la qualité des liens via l\'Indice IQRH.',
  },
  {
    icon: <Zap className="w-8 h-8 text-[var(--color-primary-light)]" />,
    title: 'Agir',
    desc: 'Déployer des plans d\'actions ciblés par le Coach IRIS.',
  }
];

export function Methodology() {
  return (
    <section id="methode" className="py-24 bg-white border-y border-[var(--color-border)]">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Méthodologie Scientifique
          </span>
          <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
            4 piliers pour objectiver l'immatériel
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Notre protocole d'évaluation transforme le ressenti collaboratif en données exploitables pour sécuriser et développer le capital humain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div key={idx} className="card-premium p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--color-surface-2)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="font-jakarta font-bold text-xl text-[var(--color-text-primary)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
