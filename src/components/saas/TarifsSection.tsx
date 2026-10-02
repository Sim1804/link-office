import React, { useState } from 'react';

export const TarifsSection: React.FC<{
  onSelectPlan: (plan: string) => void;
}> = ({ onSelectPlan }) => {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider">
          Transparence & Engagement
        </span>
        <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
          Des formules claires pour cultiver le lien
        </h2>
        <p className="text-sm text-[#123D46]/70 font-inter">
          Commencez gratuitement par un auto-diagnostic, puis outillez vos collectifs selon votre taille.
        </p>

        {/* Toggle monthly / annual */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold ${!annualBilling ? 'text-[#123D46]' : 'text-[#123D46]/60'}`}>
            Facturation mensuelle
          </span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-12 h-6 rounded-full bg-[#00A99D] p-1 flex items-center transition-colors"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold flex items-center gap-1.5 ${annualBilling ? 'text-[#00A99D]' : 'text-[#123D46]/60'}`}>
            Facturation annuelle
            <span className="px-2 py-0.5 rounded-full bg-[#FFC629]/20 text-[#123D46] text-[10px] font-bold">
              -20%
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Plan 1: Découverte */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#123D46]/60 tracking-wider">
                Individuel
              </span>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                Découverte
              </h3>
              <p className="text-xs text-[#123D46]/70 mt-1">
                Pour faire le point sur sa propre santé relationnelle.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-jakarta font-black text-4xl text-[#123D46]">0€</span>
              <span className="text-xs text-[#123D46]/60 font-medium">gratuit à vie</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#123D46]/80 pt-2 border-t border-[#E3EBE6]">
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Test complet IQRH (Indice sur 100)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Décomposition sur les 4 Piliers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Accès à la synthèse du Baromètre 2024</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('gratuit')}
            className="w-full py-2.5 rounded-full border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D]/10 font-jakarta font-bold text-xs transition-all text-center"
          >
            Faire mon test gratuit
          </button>
        </div>

        {/* Plan 2: Équipe Pro (Highlighted) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00A99D] shadow-md flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A99D] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Recommandé
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#00A99D] tracking-wider">
                Collectif jusqu'à 25 personnes
              </span>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                Équipe & Management
              </h3>
              <p className="text-xs text-[#123D46]/70 mt-1">
                Pour dynamiser et réaligner un service ou une unité.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-jakarta font-black text-4xl text-[#123D46]">
                {annualBilling ? '24€' : '29€'}
              </span>
              <span className="text-xs text-[#123D46]/60 font-medium">/ utilisateur / mois</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#123D46]/80 pt-2 border-t border-[#E3EBE6]">
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Tout le plan Découverte</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Tableau de bord collectif consolidé</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Assistant Coach IRIS en continu</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Bibliothèque de rituels relationnels</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('equipe')}
            className="w-full py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-all text-center shadow-xs"
          >
            Démarrer l'essai équipe (14 jours)
          </button>
        </div>

        {/* Plan 3: Organisation / Entreprise */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase text-[#123D46]/60 tracking-wider">
                Organisation globale
              </span>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                Sur-Mesure
              </h3>
              <p className="text-xs text-[#123D46]/70 mt-1">
                Pour l'ensemble de votre organisation et ses filiales.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-jakarta font-black text-3xl text-[#123D46]">Sur devis</span>
            </div>

            <ul className="space-y-2.5 text-xs text-[#123D46]/80 pt-2 border-t border-[#E3EBE6]">
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Audit sociologique sur-mesure</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Restitution en comité de direction</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Ateliers d'alignement animés par experts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#00A99D] font-bold">✓</span>
                <span>Intégration SIRH et support dédié</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onSelectPlan('organisation')}
            className="w-full py-2.5 rounded-full border border-[#123D46]/30 hover:border-[#123D46] text-[#123D46] font-jakarta font-bold text-xs transition-all text-center"
          >
            Contacter nos experts
          </button>
        </div>
      </div>
    </div>
  );
};
