import React, { useState } from 'react';
import { SaaSPlatform } from './components/saas/SaaSPlatform';
import { CharteInteractive } from './components/charte/CharteInteractive';
import { Logo } from './components/brand/Logo';

export default function App() {
  const [currentView, setCurrentView] = useState<'platform' | 'charte'>('platform');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] flex flex-col font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      {/* Main View Port */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentView === 'platform' ? (
          <SaaSPlatform onOpenCharte={() => setCurrentView('charte')} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-jakarta font-bold text-[#00A99D] uppercase tracking-wider block mb-1">
                  Système de Design Officiel
                </span>
                <h1 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
                  Charte Graphique — LINK OFFICE
                </h1>
                <p className="text-xs text-[#123D46]/70 mt-0.5">
                  Spécifications complètes des 14 sections (Logos, Couleurs, Typographies, Composants, Piliers).
                </p>
              </div>
              <button
                onClick={() => setCurrentView('platform')}
                className="px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <span>← Retour au site LinkOffice</span>
              </button>
            </div>
            <CharteInteractive
              onOpenSaaS={() => setCurrentView('platform')}
              onOpenMobile={() => setCurrentView('platform')}
              onOpenBarometre={() => setCurrentView('platform')}
            />
          </div>
        )}
      </main>

      {/* Global Clean Footer Conforming to Section 13 */}
      <footer className="bg-white border-t border-[#E3EBE6] py-10 px-4 sm:px-8 mt-auto">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs text-[#123D46]/70">
          <div className="space-y-3">
            <Logo size="sm" showTagline={true} />
            <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
              Laboratoire du lien humain. Comprendre, observer, mesurer et agir pour valoriser la santé relationnelle des organisations.
            </p>
            <div className="text-[11px] text-[#00A99D] font-bold font-jakarta">
              Comprendre. Observer. Mesurer. Agir.
            </div>
          </div>

          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Plateforme
            </span>
            <ul className="space-y-2 font-medium">
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">La Méthode</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Coach IRIS IA</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Test IQRH en direct</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Baromètre 2024</button></li>
            </ul>
          </div>

          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Entreprises & Recherche
            </span>
            <ul className="space-y-2 font-medium">
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Pour les organisations</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Partenaires scientifiques</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Média & Tribunes</button></li>
              <li><button onClick={() => setCurrentView('platform')} className="hover:text-[#00A99D]">Tarifs & Devis</button></li>
            </ul>
          </div>

          <div>
            <span className="font-jakarta font-bold text-[#123D46] uppercase tracking-wider block mb-3">
              Charte & Identité
            </span>
            <ul className="space-y-2 font-medium">
              <li>
                <button
                  onClick={() => setCurrentView('charte')}
                  className="hover:text-[#00A99D] text-[#00A99D] font-bold flex items-center gap-1.5"
                >
                  <span>Consulter la Charte Graphique (14 sections)</span>
                  <span>→</span>
                </button>
              </li>
              <li className="text-[11px] text-[#123D46]/60">Typographies officielles : Plus Jakarta Sans & Inter</li>
              <li className="text-[11px] text-[#123D46]/60">Palette : #00A99D, #199E9A, #4DBDB2, #5965E8, #FFC629, #123D46</li>
              <li className="text-[11px] text-[#123D46]/60">© 2024 LINK OFFICE. Tous droits réservés.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
