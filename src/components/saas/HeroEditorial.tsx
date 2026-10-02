import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Shield, Users } from 'lucide-react';

interface HeroEditorialProps {
  onStartTest: () => void;
}

export function HeroEditorial({ onStartTest }: HeroEditorialProps) {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl pointer-events-none -mt-32 -mr-32" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--color-accent-amber)]/10 to-transparent rounded-full blur-3xl pointer-events-none -mb-32 -ml-32" />

      <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-7 space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[var(--color-border)] shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
            <span className="text-sm font-jakarta font-semibold text-[var(--color-text-primary)]">
              Laboratoire du Lien Humain
            </span>
          </div>

          <h1 className="font-jakarta font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--color-text-primary)] leading-[1.15] tracking-tight">
            La santé de votre collectif<br />
            commence par la <span className="text-[var(--color-primary)]">qualité de ses liens</span>.
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] font-medium leading-relaxed max-w-2xl">
            Comprendre, Observer, Mesurer et Agir. Évaluez votre Indice de Qualité Relationnelle et Humaine (IQRH) et transformez vos dynamiques d'équipe avec une approche scientifique.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={onStartTest}
              className="btn btn-primary btn-lg shadow-glow-cyan"
            >
              Évaluer mon IQRH <ArrowRight className="w-5 h-5 ml-1" />
            </button>
            <Link href="#methode" className="btn btn-secondary btn-lg">
              Découvrir la méthode
            </Link>
          </div>

          <div className="flex items-center gap-6 pt-8 border-t border-[var(--color-border)] mt-8">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
              <Shield className="w-5 h-5 text-[var(--color-primary)]" />
              <span>Anonymat RGPD garanti</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] font-medium">
              <Activity className="w-5 h-5 text-[var(--color-accent-rose)]" />
              <span>Diagnostic en temps réel</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual representation */}
        <div className="lg:col-span-5 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="glass-panel p-8 relative overflow-hidden h-[480px] flex flex-col justify-between">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-jakarta font-bold text-xl text-[var(--color-text-primary)]">Indice Global</h3>
                <span className="text-[var(--color-accent-rose)] bg-[var(--color-accent-rose)]/10 px-3 py-1 rounded-full text-sm font-bold">
                  Live
                </span>
              </div>
              
              <div className="flex items-end gap-3">
                <span className="font-mono text-6xl font-bold text-[var(--color-primary)]">84</span>
                <span className="text-xl text-[var(--color-text-secondary)] font-medium mb-1">/100</span>
              </div>

              <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[var(--color-text-primary)]">Confiance mutuelle</span>
                    <span className="font-mono text-[var(--color-primary)]">92%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-primary)] w-[92%] rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-[var(--color-text-primary)]">Fluidité des échanges</span>
                    <span className="font-mono text-[var(--color-accent-amber)]">68%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--color-accent-amber)] w-[68%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative orbit paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 400 400">
              <circle cx="200" cy="200" r="180" fill="none" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="4 4" className="animate-spin-slow" style={{ animationDuration: '60s' }} />
              <circle cx="200" cy="200" r="120" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="8 8" className="animate-spin-slow" style={{ animationDuration: '40s', animationDirection: 'reverse' }} />
              
              {/* Nodes */}
              <circle cx="20" cy="200" r="6" fill="var(--color-accent-amber)" className="animate-pulse-glow" />
              <circle cx="320" cy="80" r="8" fill="var(--color-primary)" className="animate-pulse-glow" style={{ animationDelay: '1s' }} />
              <circle cx="280" cy="320" r="6" fill="var(--color-accent-rose)" className="animate-pulse-glow" style={{ animationDelay: '2s' }} />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
