import React, { useState } from 'react';
import { SaaSPlatform } from './components/saas/SaaSPlatform';
import { InteriorDashboard } from './components/dashboard/InteriorDashboard';
import { RHAdminPortal } from './components/admin/RHAdminPortal';
import { AdminBackOffice } from './components/admin/AdminBackOffice';
import { Logo } from './components/brand/Logo';
import { ShieldCheck, UserCheck, Globe, Building2 } from 'lucide-react';

export default function App() {
  // View mode:
  // 1. 'public' : Site Public SaaS (Landing d'évangélisation, méthode, baromètre, test)
  // 2. 'employee' : Dashboard Salarié Connecté (Évaluation individuelle, progression, IRIS)
  // 3. 'rh_admin' : Portail RH B2B Admin (Observatoire QVT, Campagnes d'organisation)
  // 4. 'super_admin' : Console Gouvernance & Back-Office Master (Super Admin, 9 modules)
  const [viewMode, setViewMode] = useState<'public' | 'employee' | 'rh_admin' | 'super_admin'>('public');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] flex flex-col font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46] relative">
      {/* Top Floating View Switcher Pill for Stakeholders / Reviewers */}
      <aside aria-label="Sélecteur d'espace" className="fixed bottom-4 right-4 z-50 bg-[#123D46]/95 backdrop-blur-md text-white p-1.5 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-1.5 text-xs font-jakarta font-semibold">
        <button
          onClick={() => setViewMode('public')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            viewMode === 'public'
              ? 'bg-[#00A99D] text-white shadow-xs font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Site principal accueil avec ses onglets"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Site Principal</span>
        </button>

        <button
          onClick={() => setViewMode('rh_admin')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            viewMode === 'rh_admin'
              ? 'bg-[#00A99D] text-white shadow-xs font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Navbar et espace Admin B2B, B2B2C ou B2G (identiques)"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Admin B2B / B2B2C / B2G</span>
        </button>

        <button
          onClick={() => setViewMode('super_admin')}
          className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
            viewMode === 'super_admin'
              ? 'bg-[#00A99D] text-white shadow-xs font-bold'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Navbar et console pour le Super Admin (Gouvernance)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FFC629]" />
          <span>Super Admin</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC629] animate-pulse" />
        </button>

        <button
          onClick={() => setViewMode('employee')}
          className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 text-[11px] ${
            viewMode === 'employee'
              ? 'bg-white/20 text-white font-bold'
              : 'text-white/50 hover:text-white'
          }`}
          title="Vue Collaborateur Salarié (optionnelle)"
        >
          <UserCheck className="w-3 h-3" />
          <span className="hidden md:inline">Salarié</span>
        </button>
      </aside>

      {/* Main View rendering */}
      {viewMode === 'super_admin' ? (
        <AdminBackOffice
          onReturnToPublic={() => setViewMode('public')}
          onSwitchToEmployeeDemo={() => setViewMode('employee')}
          onSwitchToRHAdmin={() => setViewMode('rh_admin')}
        />
      ) : viewMode === 'rh_admin' ? (
        <RHAdminPortal
          onReturnToPublic={() => setViewMode('public')}
          onSwitchToEmployeeDemo={() => setViewMode('employee')}
          onSwitchToSuperAdmin={() => setViewMode('super_admin')}
        />
      ) : viewMode === 'employee' ? (
        <InteriorDashboard
          onLogout={() => setViewMode('public')}
          onReturnToPublic={() => setViewMode('public')}
          onSwitchToRHAdmin={() => setViewMode('rh_admin')}
          onSwitchToSuperAdmin={() => setViewMode('super_admin')}
        />
      ) : (
        <>
          {/* Main View Port - Full Narrative Flow on Accueil */}
          <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <SaaSPlatform
              onLogin={() => setViewMode('employee')}
              onOpenAdmin={() => setViewMode('super_admin')}
              onOpenRHAdmin={() => setViewMode('rh_admin')}
            />
          </main>

          {/* Pristine, Executive-Grade Footer for LINK OFFICE */}
          <footer className="bg-white border-t border-[#E3EBE6] py-12 px-4 sm:px-8 mt-16">
            <div className="max-w-[1440px] mx-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-[#123D46]/75">
                {/* Column 1: Brand & Mission */}
                <div className="space-y-3 md:pr-4">
                  <div onClick={() => scrollTo('accueil')} className="cursor-pointer inline-block">
                    <Logo size="sm" showTagline={true} />
                  </div>
                  <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
                    Laboratoire du lien humain. Comprendre, observer, mesurer et agir pour valoriser la santé relationnelle des organisations et des collectifs de travail.
                  </p>
                  <div className="text-[11px] text-[#00A99D] font-bold font-jakarta">
                    Comprendre · Observer · Mesurer · Agir
                  </div>
                </div>

                {/* Column 2: Navigation Accueil */}
                <div>
                  <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
                    Plateforme & Outils
                  </span>
                  <ul className="space-y-2.5 font-medium">
                    <li>
                      <button onClick={() => scrollTo('methode')} className="hover:text-[#00A99D] transition-colors text-left">
                        La démarche scientifique en 4 temps
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo('barometre')} className="hover:text-[#00A99D] transition-colors flex items-center gap-1.5 text-left">
                        <span>Baromètre national en direct</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo('iqrh')} className="hover:text-[#00A99D] transition-colors text-left">
                        Évaluation de l'Indice IQRH
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo('iris')} className="hover:text-[#00A99D] transition-colors text-left">
                        Coach IRIS (Intelligence Relationnelle)
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setViewMode('employee')}
                        className="text-[#00A99D] font-bold hover:underline transition-colors text-left flex items-center gap-1"
                      >
                        <span>Espace Salarié Connecté (Démo Camille)</span>
                        <span>→</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setViewMode('rh_admin')}
                        className="text-[#5965E8] font-bold hover:underline transition-colors text-left flex items-center gap-1 pt-1"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Portail RH B2B (Observatoire & Campagnes)</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setViewMode('super_admin')}
                        className="text-[#123D46] font-bold hover:text-[#00A99D] transition-colors text-left flex items-center gap-1 pt-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00A99D]" />
                        <span>Console Super Admin (Gouvernance)</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Entreprises & Tarifs */}
                <div>
                  <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
                    Pour les Organisations
                  </span>
                  <ul className="space-y-2.5 font-medium">
                    <li>
                      <button onClick={() => scrollTo('organisations')} className="hover:text-[#00A99D] transition-colors text-left">
                        Audit interne & Baromètre dédié
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo('organisations')} className="hover:text-[#00A99D] transition-colors text-left">
                        Accompagnement des directions & DRH
                      </button>
                    </li>
                    <li>
                      <button onClick={() => scrollTo('tarifs')} className="hover:text-[#00A99D] transition-colors text-left">
                        Formules & Déploiement d'équipe
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setViewMode('rh_admin')}
                        className="text-[#5965E8] font-semibold hover:underline transition-colors text-left flex items-center gap-1"
                      >
                        <span>Accès Démo Espace Entreprise Acme</span>
                        <span>→</span>
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Déontologie & Contact */}
                <div>
                  <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
                    Éthique & Contact
                  </span>
                  <ul className="space-y-2 text-[11px] text-[#123D46]/70">
                    <li className="font-medium text-[#123D46]">
                      contact@linkoffice.fr
                    </li>
                    <li>
                      Paris 8e · Siège de recherche sociologique
                    </li>
                    <li className="pt-1 text-[#00A99D] font-medium">
                      ✓ Anonymat strict garanti (Protocole RGPD N &ge; 5)
                    </li>
                    <li className="text-[#123D46]/60">
                      ✓ Données hébergées en France
                    </li>
                    <li className="text-[#123D46]/60">
                      ✓ Aucun traçage individuel transmis à l'employeur
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-6 border-t border-[#E3EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-[#123D46]/60">
                <div>
                  © 2024 LINK OFFICE — Laboratoire du Lien Humain. Tous droits réservés.
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span>Mentions légales</span>
                  <span>·</span>
                  <span>Politique de confidentialité</span>
                  <span>·</span>
                  <span>Charte déontologique</span>
                  <span>·</span>
                  <button onClick={() => setViewMode('rh_admin')} className="text-[#5965E8] hover:underline font-medium">
                    Portail RH B2B
                  </button>
                  <span>·</span>
                  <button onClick={() => setViewMode('super_admin')} className="text-[#00A99D] hover:underline font-medium">
                    Console Super Admin
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
