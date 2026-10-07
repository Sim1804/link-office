import React, { useState } from 'react';
import { Check, Sparkles, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

export const TarifsSection: React.FC<{
  onSelectPlan: (plan: string) => void;
}> = ({ onSelectPlan }) => {
  const [segment, setSegment] = useState<'individual' | 'business'>('individual');
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <div className="space-y-10">
      {/* ── En-tête de section ── */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider">
          <Sparkles size={13} className="text-[#00A99D]" />
          <span>Transparence & Engagement</span>
        </div>
        <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46] tracking-tight">
          Des formules claires pour cultiver le lien
        </h2>
        <p className="text-sm text-[#123D46]/70 font-inter max-w-xl mx-auto leading-relaxed">
          Commencez gratuitement par votre auto-diagnostic individuel, approfondissez avec le Pass Premium &amp; Binôme, ou équipez vos collectifs.
        </p>

        {/* ── Sélecteur de Cible : Particuliers vs Entreprises ── */}
        <div className="pt-2 flex justify-center">
          <div className="p-1 bg-[#FAF9F5] border border-[#E3EBE6] rounded-full inline-flex items-center gap-1 shadow-xs">
            <button
              type="button"
              onClick={() => setSegment('individual')}
              className={`px-5 py-2 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-2 ${
                segment === 'individual'
                  ? 'bg-[#123D46] text-white shadow-sm'
                  : 'text-[#123D46]/70 hover:text-[#123D46]'
              }`}
            >
              <User size={14} />
              <span>Particuliers &amp; Collaborateurs</span>
            </button>
            <button
              type="button"
              onClick={() => setSegment('business')}
              className={`px-5 py-2 rounded-full text-xs font-jakarta font-bold transition-all flex items-center gap-2 ${
                segment === 'business'
                  ? 'bg-[#123D46] text-white shadow-sm'
                  : 'text-[#123D46]/70 hover:text-[#123D46]'
              }`}
            >
              <Building2 size={14} />
              <span>Équipes &amp; Organisations</span>
            </button>
          </div>
        </div>

        {/* ── Switcher Facturation Mensuelle / Annuelle ── */}
        <div className="pt-1 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setAnnualBilling(false)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all ${
              !annualBilling
                ? 'bg-[#123D46] text-white shadow-xs'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            Facturation mensuelle
          </button>
          <button
            type="button"
            onClick={() => setAnnualBilling(true)}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all flex items-center gap-2 ${
              annualBilling
                ? 'bg-[#00A99D] text-white shadow-xs'
                : 'text-[#123D46]/70 hover:text-[#123D46]'
            }`}
          >
            <span>Abonnement annuel</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                annualBilling ? 'bg-white text-[#00A99D]' : 'bg-[#FFC629]/25 text-[#123D46]'
              }`}
            >
              -20% de réduction
            </span>
          </button>
        </div>
      </div>

      {/* ── GRILLES TARIFAIRES SELON LE SEGMENT ── */}
      {segment === 'individual' ? (
        /* ==================== VUE 1 : OFFRES INDIVIDUELLES (B2C) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Plan 1 : Découverte (0€) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#123D46]/60 tracking-wider">
                  Accès Libre
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Découverte
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  Pour évaluer sa propre santé relationnelle et situer ses forces.
                </p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-jakarta font-black text-4xl text-[#123D46]">0€</span>
                  <span className="text-xs text-[#123D46]/60 font-medium">gratuit à vie</span>
                </div>
                <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                  Sans carte bancaire · Accès immédiat
                </p>
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Test complet IQRH (Indice sur 100)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Décomposition sur les 4 Piliers relationnels</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Météo relationnelle &amp; aperçu score</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Accès à la synthèse du Baromètre national</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('gratuit')}
              className="w-full py-3 rounded-full border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D]/10 font-jakarta font-bold text-xs sm:text-sm transition-all text-center"
            >
              Faire mon test gratuit
            </button>
          </div>

          {/* Plan 2 : Pass Premium (9,99€ / mois — Réduction -20% en annuel à 95,90€ / an) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#00A99D] tracking-wider">
                  Approfondissement
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Pass Premium
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  L'analyse intégrale de votre profil et votre ordonnance personnalisée.
                </p>
              </div>

              <div className="pt-1">
                {!annualBilling ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">9,99 €</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ mois</span>
                    </div>
                    <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                      Sans engagement · Résiliable à tout moment
                    </p>
                    <p className="text-[11px] text-[#00A99D] font-semibold mt-0.5">
                      💡 -20% avec l'abonnement annuel (95,90 € / an)
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">95,90 €</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ an</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00A99D]/15 text-[#00A99D] text-[10px] font-bold">
                        -20%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#00A99D] mt-1">
                      Soit 7,99 € / mois <span className="font-normal text-[#123D46]/50 line-through text-[11px]">(au lieu de 9,99 €)</span>
                    </p>
                    <p className="text-[11px] text-[#123D46]/60 font-medium mt-0.5">
                      Facturation annuelle · 2 mois offerts
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span className="font-medium text-[#123D46]">Tout le plan Découverte</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Ordonnance relationnelle complète &amp; illimitée</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Analyse ICR : facteurs de vulnérabilité décodés</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Coach IA IRIS disponible en continu</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Carnet de santé &amp; historique d'évolution</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('premium')}
              className="w-full py-3 rounded-full bg-[#123D46] hover:bg-[#1a4f5a] text-white font-jakarta font-bold text-xs sm:text-sm transition-all text-center shadow-xs"
            >
              S'abonner à Premium
            </button>
          </div>

          {/* Plan 3 : Premium+ Binôme (14,99€ / mois — Réduction -20% en annuel à 143,90€ / an) — Highlighted */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00A99D] shadow-lg flex flex-col justify-between space-y-6 relative md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A99D] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={11} />
              <span>Recommandé · Expérience Intégrale</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#00A99D] tracking-wider">
                  Coopération &amp; Duo
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Premium +
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  Développez une synergie forte grâce au Binôme Relationnel.
                </p>
              </div>

              <div className="pt-1">
                {!annualBilling ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">14,99 €</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ mois</span>
                    </div>
                    <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                      Sans engagement · Résiliable à tout moment
                    </p>
                    <p className="text-[11px] text-[#00A99D] font-semibold mt-0.5">
                      💡 -20% avec l'abonnement annuel (143,90 € / an)
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">143,90 €</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ an</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00A99D]/15 text-[#00A99D] text-[10px] font-bold">
                        -20%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#00A99D] mt-1">
                      Soit 11,99 € / mois <span className="font-normal text-[#123D46]/50 line-through text-[11px]">(au lieu de 14,99 €)</span>
                    </p>
                    <p className="text-[11px] text-[#123D46]/60 font-medium mt-0.5">
                      Facturation annuelle · 2 mois offerts
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span className="font-semibold text-[#123D46]">Tout le contenu du Pass Premium</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span className="font-bold text-[#123D46]">Module exclusif Binôme Relationnel</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Suggestions intelligentes de partenaires par IRIS</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Check-ins hebdomadaires &amp; défis en duo</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Gamification avancée &amp; badges de confiance</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('premium_plus')}
              className="w-full py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs sm:text-sm transition-all text-center shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              Rejoindre Premium +
            </button>
          </div>
        </div>
      ) : (
        /* ==================== VUE 2 : OFFRES ENTREPRISES & ORGANISATIONS (B2B / B2G) ==================== */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Plan B2B 1 : Équipe & Management (29€/mois ou 24€/mois en annuel) — Highlighted */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#00A99D] shadow-lg flex flex-col justify-between space-y-6 relative md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A99D] text-white px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles size={11} />
              <span>Recommandé · Collectifs jusqu'à 25</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#00A99D] tracking-wider">
                  Équipe Agile
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Équipe &amp; Management
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  Pour dynamiser, aligner et prévenir les tensions au sein d'un service.
                </p>
              </div>

              <div className="pt-1">
                {!annualBilling ? (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">29€</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ collab / mois</span>
                    </div>
                    <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                      Facturation mensuelle sans engagement
                    </p>
                    <p className="text-[11px] text-[#00A99D] font-semibold mt-0.5">
                      💡 24€ / collab / mois avec l'abonnement annuel
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-jakarta font-black text-4xl text-[#123D46]">24€</span>
                      <span className="text-xs text-[#123D46]/60 font-medium">/ collab / mois</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#00A99D]/15 text-[#00A99D] text-[10px] font-bold">
                        -17%
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#00A99D] mt-1">
                      Facturé 288 € / an par collaborateur <span className="font-normal text-[#123D46]/50 line-through text-[11px]">(au lieu de 348 €)</span>
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Diagnostic individuel 100% anonyme pour chaque membre</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Tableau de bord managérial consolidé &amp; météo d'équipe</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Bibliothèque de rituels managériaux en 5 minutes</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/20 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Coach IRIS d'équipe &amp; alertes bienveillantes</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('equipe')}
              className="w-full py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs sm:text-sm transition-all text-center shadow-md hover:shadow-lg active:scale-[0.99]"
            >
              Démarrer l'essai équipe (14 jours)
            </button>
          </div>

          {/* Plan B2B 2 : Entreprise & ETI (Sur devis) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#123D46]/60 tracking-wider">
                  Dès 50 collaborateurs
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Entreprise &amp; ETI
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  Déploiement global, prévention des RPS et gouvernance QVCT.
                </p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-jakarta font-black text-3xl text-[#123D46]">Sur devis</span>
                </div>
                <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                  Dimensionné sur mesure selon vos effectifs
                </p>
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Cartographie exhaustive des RPS &amp; baromètre continu</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Intégration SIRH sécurisée, SSO &amp; conformité RGPD</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Restitution en Comité de Direction &amp; plan d'action</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Accompagnement par des sociologues des organisations</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('entreprise')}
              className="w-full py-3 rounded-full border border-[#123D46]/30 hover:border-[#123D46] text-[#123D46] font-jakarta font-bold text-xs sm:text-sm transition-all text-center"
            >
              Demander un devis entreprise
            </button>
          </div>

          {/* Plan B2B 3 : Collectivités & Mutuelles (B2G / B2B2C) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-[#123D46]/60 tracking-wider">
                  Secteur Public &amp; Partenaires
                </span>
                <h3 className="font-jakarta font-extrabold text-xl text-[#123D46] mt-1">
                  Collectivités &amp; Mutuelles
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-1 min-h-[32px]">
                  Baromètre territorial de lien social ou cofinancement pour vos bénéficiaires.
                </p>
              </div>

              <div className="pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="font-jakarta font-black text-3xl text-[#123D46]">Sur mesure</span>
                </div>
                <p className="text-[11px] text-[#123D46]/60 font-medium mt-1">
                  Modèles conventionnés B2G &amp; B2B2C
                </p>
              </div>

              <ul className="space-y-3 text-xs text-[#123D46]/80 pt-3 border-t border-[#E3EBE6]">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Baromètre territorial &amp; cartographie de l'isolement</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Financement Pass Premium / Binôme pour vos affiliés</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Orientations bienveillantes vers vos services de soins</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">✓</span>
                  <span>Rapport d'aide à la décision publique &amp; RSE</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => onSelectPlan('b2g')}
              className="w-full py-3 rounded-full border border-[#00A99D] text-[#00A99D] hover:bg-[#00A99D]/10 font-jakarta font-bold text-xs sm:text-sm transition-all text-center"
            >
              Consulter l'offre publique &amp; mutuelle
            </button>
          </div>
        </div>
      )}

      {/* ── Réassurance & Conformité ── */}
      <div className="text-center pt-2">
        <div className="inline-flex flex-wrap items-center justify-center gap-4 px-5 py-2.5 rounded-full bg-white border border-[#E3EBE6] text-xs text-[#123D46]/70 shadow-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck size={15} className="text-[#00A99D]" />
            Données 100% hébergées en France
          </span>
          <span className="text-[#E3EBE6]">·</span>
          <span className="font-medium">Conformité stricte RGPD &amp; secret statistique</span>
          <span className="text-[#E3EBE6]">·</span>
          <span className="font-medium">Sans engagement pour les particuliers</span>
        </div>
      </div>
    </div>
  );
};
