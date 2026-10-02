import React from 'react';
import { Activity, TrendingUp, Users } from 'lucide-react';

export function BarometreLive() {
  return (
    <section className="py-24 bg-[var(--color-surface-2)]">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/3 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-rose)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent-rose)]"></span>
              </span>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">En direct</span>
            </div>
            
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[var(--color-text-primary)] leading-tight">
              Baromètre National de l'état relationnel
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Suivez l'évolution du climat relationnel en France. Nos données sont agrégées et anonymisées en temps réel.
            </p>
            <button className="btn btn-tertiary btn-lg bg-white">
              Explorer les données <TrendingUp className="w-4 h-4 ml-2" />
            </button>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Stat Cards */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[var(--color-primary-glow)] rounded-xl text-[var(--color-primary)]">
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-secondary)]">Climat Général</h4>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-mono text-4xl font-bold text-[var(--color-text-primary)]">68/100</span>
                <span className="text-sm text-[var(--color-success)] font-medium mb-1 flex items-center">
                  +2 pts
                </span>
              </div>
            </div>

            <div className="card-premium p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-[var(--color-accent-amber-glow)] rounded-xl text-[var(--color-accent-amber)]">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-secondary)]">Sentiment d'isolement</h4>
              </div>
              <div className="flex items-end gap-3">
                <span className="font-mono text-4xl font-bold text-[var(--color-text-primary)]">24%</span>
                <span className="text-sm text-[var(--color-error)] font-medium mb-1 flex items-center">
                  +1.5%
                </span>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Moyenne nationale secteur tertiaire</p>
            </div>
            
            {/* Pseudo-Graph Span 2 */}
            <div className="sm:col-span-2 card-premium p-6 h-48 flex items-center justify-center bg-[var(--color-surface)] relative overflow-hidden">
              <div className="text-center z-10">
                <span className="text-[var(--color-text-muted)] font-medium">Dataviz Interactive (Intégration Recharts)</span>
              </div>
              {/* Decorative grid */}
              <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
