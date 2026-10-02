import React from 'react';
import { ShieldCheck, Target, Heart, LayoutGrid, RotateCcw } from 'lucide-react';

export function DiagnosticIQRH() {
  const pillars = [
    { name: 'Confiance & Sécurité psychologique', icon: <ShieldCheck size={20} /> },
    { name: 'Clarté des échanges & Feedback', icon: <Target size={20} /> },
    { name: 'Soutien & Entraide spontanée', icon: <Heart size={20} /> },
    { name: 'Alignement & Coopération', icon: <LayoutGrid size={20} /> },
    { name: 'Capacité d\'action & Résolution', icon: <RotateCcw size={20} /> },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Indice de Qualité des Relations Humaines
          </span>
          <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
            Votre diagnostic de santé collective
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Une restitution visuelle immédiate via un Radar Chart dynamique. Identifiez vos points forts et priorisez vos axes de progrès.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Radar Chart Visual (Placeholder logic) */}
          <div className="glass-panel p-8 bg-[var(--color-surface-2)] border-none h-[400px] flex items-center justify-center relative">
            {/* Hexagon/Radar Shape Background */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-20 absolute inset-0 m-auto pointer-events-none" style={{ maxWidth: '80%' }}>
              <polygon points="50 5, 95 30, 95 70, 50 95, 5 70, 5 30" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
              <polygon points="50 25, 75 40, 75 60, 50 75, 25 60, 25 40" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" />
            </svg>
            <div className="relative z-10 text-center">
              <span className="font-mono text-7xl font-extrabold text-[var(--color-primary)] drop-shadow-md">
                A<span className="text-4xl">+</span>
              </span>
              <p className="text-sm font-bold text-[var(--color-text-primary)] mt-2">Score Agrégé IQRH</p>
            </div>
          </div>

          {/* Pillars List */}
          <div className="space-y-4">
            <h3 className="font-jakarta font-bold text-2xl text-[var(--color-text-primary)] mb-6">
              Les 5 dimensions évaluées
            </h3>
            {pillars.map((pillar, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow cursor-default">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-glow)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <span className="font-medium text-[var(--color-text-primary)]">{pillar.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
