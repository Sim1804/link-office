import React from 'react';
import { Building2, Lock, FileCheck } from 'lucide-react';

export function EspaceOrganisations() {
  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">
            Espace Organisations & Entreprises
          </span>
          <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[var(--color-text-primary)]">
            Déployez la culture du lien à l'échelle
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)]">
            Une plateforme pensée pour les RH, les CSE et les dirigeants, garantissant une déontologie absolue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card-premium p-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-primary)] mb-6">
              <Building2 size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-xl mb-3">Audits & Baromètres</h3>
            <p className="text-[var(--color-text-secondary)]">
              Lancez des campagnes ciblées par département et obtenez des cartographies précises des risques psycho-sociaux (RPS) et des dynamiques collectives.
            </p>
          </div>

          <div className="card-premium p-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-accent-amber)] mb-6">
              <Lock size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-xl mb-3">Anonymat Strict</h3>
            <p className="text-[var(--color-text-secondary)]">
              Engagement déontologique absolu : aucune donnée individuelle n'est transmise à l'employeur. Les résultats sont toujours agrégés (minimum 5 répondants).
            </p>
          </div>

          <div className="card-premium p-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-accent-rose)] mb-6">
              <FileCheck size={24} />
            </div>
            <h3 className="font-jakarta font-bold text-xl mb-3">Hébergement Souverain</h3>
            <p className="text-[var(--color-text-secondary)]">
              Vos données sensibles sont chiffrées et hébergées exclusivement en France (HDS). Conformité totale avec le RGPD.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
