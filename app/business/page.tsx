"use client";

import { useState } from "react";
import {
  Building2, Users, BarChart3, ShieldCheck, ArrowRight,
  Check, Zap, Globe, TrendingUp, CheckCircle2, Star,
  AlertCircle, MapPin, HeartPulse, Sparkles, Clock, Lock,
  ChevronDown, ChevronUp, FileText, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { IconObservation, IconAction, IconBienveillance } from "@/components/brand/Icons";

/* ── Types ──────────────────────────────────────────────────── */
type Plan = "B2B_ENTREPRISE" | "B2G" | "B2B2C_PARTENAIRE" | null;

/* ── Données des Modèles ──────────────────────────────────────── */
const PLANS: {
  id: NonNullable<Plan>;
  label: string;
  sub: string;
  pricingTag: string;
  desc: string;
  bullets: string[];
  color: string;
  bgLight: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "B2B_ENTREPRISE",
    label: "Modèle B2B",
    sub: "Entreprises (PME, ETI, Grands Groupes)",
    pricingTag: "Dès 24 € / collab / mois ou sur devis",
    desc: "Bilans relationnels pour vos équipes, dashboard RH consolidé, rituels managériaux et prévention active des RPS.",
    bullets: [
      "Dashboard RH et managérial consolidé",
      "Indice de Charge Relationnelle (ICR) d'équipe",
      "Bibliothèque de rituels managériaux en 5 min",
      "Rapport synthétique pour le Comité de Direction",
    ],
    color: "#5965E8", // Iris Purple
    bgLight: "bg-[#5965E8]/10",
    icon: <Building2 size={24} />,
  },
  {
    id: "B2G",
    label: "Modèle B2G",
    sub: "Collectivités et Acteurs Publics",
    pricingTag: "Sur mesure / Marché public",
    desc: "Baromètre territorial du lien social, action publique ciblée et cartographie anonyme de l'isolement.",
    bullets: [
      "Observatoire territorial du lien social",
      "Segmentation géographique & sectorielle",
      "Recommandations pour les politiques publiques",
      "Secret statistique et anonymat certifiés",
    ],
    color: "#00A99D", // Link Office Teal
    bgLight: "bg-[#00A99D]/10",
    icon: <Globe size={24} />,
  },
  {
    id: "B2B2C_PARTENAIRE",
    label: "Modèle B2B2C",
    sub: "Mutuelles, Assurances & CSE",
    pricingTag: "Cofinancement / Sur mesure",
    desc: "Financez le Pass Premium & Binôme pour vos bénéficiaires et adhérents afin de prévenir les ruptures de lien.",
    bullets: [
      "Accès Premium & Binôme financé pour les affiliés",
      "Entonnoir d'activation et suivi d'impact collectif",
      "Orientations bienveillantes vers vos services de soins",
      "Module exclusif Binôme Relationnel inclus",
    ],
    color: "#FFC629", // Link Office Yellow
    bgLight: "bg-[#FFC629]/15",
    icon: <HeartPulse size={24} />,
  },
];

/* ── FAQ Items pour rassurer les décideurs ────────────────────── */
const FAQS = [
  {
    q: "Comment l'anonymat des collaborateurs est-il rigoureusement garanti ?",
    a: "Nous appliquons une règle stricte de secret statistique : aucune donnée n'est restituée pour un sous-groupe comptant moins de 5 répondants. La hiérarchie n'a accès qu'à des tendances consolidées et anonymisées, jamais aux réponses individuelles.",
  },
  {
    q: "Quel est le temps nécessaire pour un collaborateur ?",
    a: "La passation du diagnostic complet IQRH prend entre 6 et 8 minutes. Il est accessible sans téléchargement, sur mobile, tablette ou ordinateur de bureau.",
  },
  {
    q: "En quoi Link Office répond-il aux exigences QVCT et RSE ?",
    a: "Les indicateurs Link Office fournissent des données tangibles et auditables pour enrichir votre Document Unique d'Évaluation des Risques Professionnels (DUERP), vos bilans RSE et vos commissions QVCT.",
  },
  {
    q: "Comment s'intègrent les rituels du Coach IRIS au quotidien ?",
    a: "Les rituels sont conçus pour s'intégrer en 5 minutes dans les routines managériales existantes (points hebdomadaires, rétrospectives, réunions de service), sans alourdir la charge de travail.",
  },
];

export default function BusinessPage() {
  const [selectedSize, setSelectedSize] = useState<'pme' | 'eti' | 'groupe'>('eti');
  const [selectedPlan, setSelectedPlan] = useState<Plan>(null);
  const [orgName,        setOrgName]        = useState("");
  const [email,          setEmail]          = useState("");
  const [contactName,    setContactName]    = useState("");
  const [phone,          setPhone]          = useState("");
  const [companySize,    setCompanySize]    = useState("");
  const [populationSize, setPopulationSize] = useState("");
  const [beneficiaries,  setBeneficiaries]  = useState("");

  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [trap, setTrap] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !email || !contactName || !selectedPlan) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/v1/business/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          organization: orgName,
          email,
          contactName,
          phone,
          companySize,
          populationSize,
          beneficiaries,
          website_trap: trap,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <PublicNavbar />

      <main className="flex-1 w-full mx-auto pb-16 pt-4 sm:pt-6">

        {/* ── HERO BANNER ──────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto mb-12 pt-6">
          <div className="bg-[#123D46] rounded-3xl sm:rounded-[3rem] p-8 sm:p-14 lg:p-20 text-white relative overflow-hidden shadow-2xl border border-[#00A99D]/20">
            {/* Background Gradients */}
            <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00A99D]/30 via-[#FFC629]/15 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] bg-gradient-to-tr from-[#5965E8]/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFC629]/15 border border-[#FFC629]/30 text-[#FFC629] text-xs font-jakarta font-bold uppercase tracking-wider animate-fade-in">
                <Building2 className="w-3.5 h-3.5" />
                <span>Solutions Entreprises &amp; Secteur Public</span>
                <span className="opacity-60 hidden sm:inline">·</span>
                <span className="hidden sm:inline">Accompagnement Dirigeants &amp; DRH</span>
              </div>

              <h1 className="font-jakarta font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] animate-fade-in">
                Faites du <span className="text-[#00A99D]">lien humain</span> le premier atout de pérennité de votre collectif.
              </h1>

              <p className="text-[#E3EBE6] text-base sm:text-lg max-w-2xl leading-relaxed font-inter animate-fade-in">
                Démissions imprévues, désengagement silencieux, perte de cohésion multi-sites : 80% des crises organisationnelles prennent racine dans une dégradation non mesurée du lien relationnel. Link Office vous apporte la rigueur méthodologique pour anticiper, diagnostiquer et agir durablement.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-3 animate-fade-in">
                <a
                  href="#devis"
                  className="px-7 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-2.5 group"
                >
                  <span>Demander une démonstration</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/#tarifs"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-jakarta font-bold text-sm transition-all flex items-center gap-2"
                >
                  Voir la grille tarifaire complète
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#E3EBE6]/80 animate-fade-in font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#FFC629]" /> Confidentialité &amp; Secret statistique
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00A99D]" /> Méthodologie sociologique certifiée
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#00A99D]" /> 100% Conforme RGPD &amp; QVCT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── BANDEAU IMPACT & CHIFFRES CLÉS (EXPERT SAAS BAR) ── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto -mt-6 sm:-mt-10 mb-16 relative z-20">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#E3EBE6]">
            <div className="space-y-1 p-2">
              <span className="font-jakarta font-black text-3xl sm:text-4xl text-[#00A99D] block">85%+</span>
              <p className="text-xs text-[#123D46]/70 font-medium">Taux moyen de participation aux campagnes</p>
            </div>
            <div className="space-y-1 p-2">
              <span className="font-jakarta font-black text-3xl sm:text-4xl text-[#123D46] block">4 Piliers</span>
              <p className="text-xs text-[#123D46]/70 font-medium">Écoute, Reconnaissance, Synergie &amp; Clarté</p>
            </div>
            <div className="space-y-1 p-2">
              <span className="font-jakarta font-black text-3xl sm:text-4xl text-[#00A99D] block">100%</span>
              <p className="text-xs text-[#123D46]/70 font-medium">Anonymat certifié &amp; secret statistique</p>
            </div>
            <div className="space-y-1 p-2">
              <span className="font-jakarta font-black text-3xl sm:text-4xl text-[#123D46] block">3 sem.</span>
              <p className="text-xs text-[#123D46]/70 font-medium">Déploiement moyen &amp; premier rapport CODIR</p>
            </div>
          </div>
        </section>

        {/* ── CATALOGUE D'INTERVENTION ─────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider inline-block">
              Catalogue d'Intervention
            </span>
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46] tracking-tight">
              Trois formats adaptés à votre maturité
            </h2>
            <p className="text-sm text-[#123D46]/70 font-inter">
              Du diagnostic initial à la transformation continue, une réponse modulaire selon les priorités de vos équipes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Format 1 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
                  <IconObservation size={26} />
                </div>
                <h3 className="font-jakarta font-bold text-xl text-[#123D46]">
                  1. Audit &amp; Baromètre Interne
                </h3>
                <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                  Campagne de diagnostic anonyme et sécurisée sur 100% de vos collaborateurs. Restitution croisée avec cartographie des signaux faibles et benchmark sectoriel national.
                </p>
                <ul className="space-y-2 text-xs text-[#123D46]/80 pt-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                    <span>Taux de participation moyen supérieur à 85%</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                    <span>Conforme aux exigences QVCT et bilans RSE</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D]" />
                    <span>Rapport exécutif pour le Comité de Direction</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                <span className="text-[#123D46]/60">Délai moyen : 3 semaines</span>
                <span className="px-2.5 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] font-bold text-[11px]">
                  Clés en main
                </span>
              </div>
            </div>

            {/* Format 2 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
                  <IconAction size={26} />
                </div>
                <h3 className="font-jakarta font-bold text-xl text-[#123D46]">
                  2. Coach IRIS &amp; Rituels Managériaux
                </h3>
                <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                  Déploiement continu auprès de vos managers pour transformer les indicateurs de l'IQRH en actions d'équipe : rituels d'écoute, tours de table et régulation des non-dits.
                </p>
                <ul className="space-y-2 text-xs text-[#123D46]/80 pt-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5965E8]" />
                    <span>Fiches rituels prêtes à animer en 5 minutes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5965E8]" />
                    <span>Alertes bienveillantes en cas de tension</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5965E8]" />
                    <span>Suivi longitudinal de la dynamique d'équipe</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                <span className="text-[#123D46]/60">Accès continu</span>
                <span className="px-2.5 py-1 rounded-full bg-[#5965E8]/10 text-[#5965E8] font-bold text-[11px]">
                  Déploiement en 48h
                </span>
              </div>
            </div>

            {/* Format 3 */}
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center">
                  <IconBienveillance size={26} />
                </div>
                <h3 className="font-jakarta font-bold text-xl text-[#123D46]">
                  3. Séminaires &amp; Facilitation
                </h3>
                <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                  Intervention de nos sociologues et facilitateurs seniors lors de vos conventions, séminaires de direction, fusions ou contextes de transformation exigeante.
                </p>
                <ul className="space-y-2 text-xs text-[#123D46]/80 pt-2 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8870A]" />
                    <span>Ateliers d'alignement CODIR / COMEX</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8870A]" />
                    <span>Désamorçage des blocages inter-services</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8870A]" />
                    <span>Engagement des équipes autour d'une vision commune</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                <span className="text-[#123D46]/60">Format immersif</span>
                <span className="px-2.5 py-1 rounded-full bg-[#FFC629]/25 text-[#123D46] font-bold text-[11px]">
                  Sur mesure
                </span>
              </div>
            </div>
          </div>

          {/* ── SEGMENTER SELON LA TAILLE (100% CAPSULE) ─────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3EBE6] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-jakarta font-bold text-xl text-[#123D46]">
                  Une réponse adaptée à la taille de votre organisation
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-0.5">
                  Sélectionnez votre typologie pour visualiser le dispositif préconisé.
                </p>
              </div>

              {/* Segmented capsule control */}
              <div className="p-1 bg-[#FAF9F5] border border-[#E3EBE6] rounded-full inline-flex items-center gap-1 shadow-xs self-start sm:self-auto">
                {(['pme', 'eti', 'groupe'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full text-xs font-jakarta font-bold transition-all whitespace-nowrap ${
                      selectedSize === size
                        ? 'bg-[#00A99D] text-white shadow-xs'
                        : 'text-[#123D46]/70 hover:text-[#123D46]'
                    }`}
                  >
                    {size === 'pme' ? 'PME' : size === 'eti' ? 'ETI' : 'Grand Groupe / Public'}
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              const sizeDetails = {
                pme: {
                  label: '50 à 250 collaborateurs',
                  subtitle: 'PME & Scale-ups en structuration',
                  focus: 'Désamorcer les tensions de croissance rapide et aligner les équipes opérationnelles.',
                  timeline: '2 à 3 semaines de déploiement',
                  audit: 'Diagnostic 100% des équipes en 1 campagne',
                  rituels: '3 rituels d’écoute managériaux prêts à l’emploi'
                },
                eti: {
                  label: '250 à 2 000 collaborateurs',
                  subtitle: 'ETI & Organisations multi-sites',
                  focus: 'Rompre les silos entre services, fiabiliser la coopération transverse et réduire le turn-over.',
                  timeline: '3 à 4 semaines avec benchmark interne',
                  audit: 'Cartographie par site, métier et niveau hiérarchique',
                  rituels: 'Accompagnement continu des managers de proximité'
                },
                groupe: {
                  label: '2 000+ collaborateurs',
                  subtitle: 'Grands Groupes & Secteur Public',
                  focus: 'Piloter la santé relationnelle à l’échelle, outiller les CODIR et enrichir les bilans QVCT/RSE.',
                  timeline: 'Accompagnement annuel et baromètre continu',
                  audit: 'Intégration SIRH sécurisée et rapports de gouvernance',
                  rituels: 'Facilitation de séminaires et formation certifiante'
                }
              };
              const currentSize = sizeDetails[selectedSize];
              return (
                <div className="p-6 sm:p-8 rounded-3xl bg-[#FAF9F5] border border-[#E3EBE6] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-1 md:border-r border-[#E3EBE6] md:pr-6">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-[10px] font-bold uppercase tracking-wider inline-block">
                      {currentSize.label}
                    </span>
                    <h4 className="font-jakarta font-extrabold text-lg text-[#123D46] pt-1">
                      {currentSize.subtitle}
                    </h4>
                    <p className="text-xs text-[#123D46]/70 pt-1 leading-relaxed">
                      {currentSize.focus}
                    </p>
                  </div>

                  <div className="space-y-3 md:border-r border-[#E3EBE6] md:pr-6 text-xs text-[#123D46]/80">
                    <div>
                      <span className="text-[#123D46]/50 uppercase tracking-wider text-[10px] block font-bold">
                        Modalité d'audit
                      </span>
                      <strong className="text-[#123D46]">{currentSize.audit}</strong>
                    </div>
                    <div>
                      <span className="text-[#123D46]/50 uppercase tracking-wider text-[10px] block font-bold">
                        Accompagnement continu
                      </span>
                      <strong className="text-[#123D46]">{currentSize.rituels}</strong>
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-center">
                    <div className="text-xs text-[#123D46]/70">
                      <span className="block text-[10px] font-bold uppercase text-[#123D46]/50">
                        Temps moyen d'activation
                      </span>
                      <strong className="text-sm text-[#00A99D] font-jakarta">{currentSize.timeline}</strong>
                    </div>
                    <a
                      href="#devis"
                      className="w-full py-3 px-5 rounded-full bg-[#123D46] hover:bg-[#1a4f5a] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Échanger avec un conseiller</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── FORMULAIRE DE DEVIS ET PLANS ─────────────────────── */}
        <section id="devis" className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-16 scroll-mt-28">
          <div className="text-center mb-14 space-y-3 max-w-2xl mx-auto">
            <span className="px-3.5 py-1.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider inline-block">
              Tarification &amp; Modèles d'Intervention
            </span>
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46] tracking-tight">
              Choisissez votre <span className="text-[#00A99D]">modèle</span>
            </h2>
            <p className="text-sm text-[#123D46]/70 font-inter">
              Sélectionnez ci-dessous l'offre correspondant à votre statut institutionnel pour obtenir une proposition dimensionnée.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 items-start">
            {/* Cartes de plans */}
            <div className="space-y-4">
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#00A99D] shadow-md ring-2 ring-[#00A99D]/20"
                        : "border-[#E3EBE6] shadow-xs hover:border-[#00A99D]/40"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${plan.bgLight}`} style={{ color: plan.color }}>
                        {plan.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-lg font-bold font-jakarta text-[#123D46]">{plan.label}</h3>
                            <span className="text-xs font-bold px-3 py-0.5 rounded-full" style={{ backgroundColor: plan.bgLight, color: plan.color }}>
                              {plan.sub}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#00A99D] flex items-center justify-center text-white shrink-0 shadow-xs">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        {/* Tag tarifaire visible */}
                        <div className="mb-2">
                          <span className="text-xs font-semibold text-[#00A99D] bg-[#00A99D]/10 px-2.5 py-0.5 rounded-full inline-block">
                            {plan.pricingTag}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#123D46]/70 leading-relaxed mb-4">{plan.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E3EBE6]">
                          {plan.bullets.map(b => (
                            <div key={b} className="flex items-start gap-2 text-xs text-[#123D46]/75 font-medium">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-center">
                <p className="text-xs text-[#123D46]/60">
                  Vous recherchez une formule individuelle ?{" "}
                  <Link href="/#tarifs" className="text-[#00A99D] font-bold hover:underline">
                    Consulter les tarifs Découverte, Premium &amp; Binôme
                  </Link>
                </p>
              </div>
            </div>

            {/* Formulaire de devis dynamique */}
            <div className="bg-white rounded-3xl p-7 sm:p-8 border border-[#E3EBE6] shadow-md sticky top-28">
              {submitted ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#00A99D]/10 border border-[#00A99D]/20 flex items-center justify-center mx-auto text-[#00A99D]">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-jakarta text-[#123D46]">Demande transmise avec succès !</h3>
                  <p className="text-[#123D46]/70 text-xs sm:text-sm leading-relaxed">
                    Merci pour votre intérêt. Un expert sociologue Link Office prendra contact avec vous sous 24h ouvrées pour affiner le dimensionnement de votre observatoire.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setSelectedPlan(null); setSubmitError(null); }}
                    className="px-6 py-2.5 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] hover:bg-[#E3EBE6]/50 text-[#123D46] text-xs font-jakarta font-bold transition-colors"
                  >
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold font-jakarta text-[#123D46] mb-1">
                      Demande de devis &amp; Démonstration
                    </h3>
                    <p className="text-[#123D46]/60 text-xs">
                      {selectedPlan ? `Modèle sélectionné : ${activePlan?.sub}` : "Sélectionnez un modèle ci-contre pour personnaliser votre demande."}
                    </p>
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs mb-5">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{submitError}</p>
                    </div>
                  )}

                  {selectedPlan ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Honeypot anti-bot trap */}
                      <input
                        type="text"
                        name="website_trap"
                        value={trap}
                        onChange={e => setTrap(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                        className="hidden"
                        aria-hidden="true"
                      />
                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">
                          {selectedPlan === "B2G" ? "Nom de la collectivité ou institution *" : selectedPlan === "B2B2C_PARTENAIRE" ? "Nom de la mutuelle / de l'organisme *" : "Nom de l'entreprise *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={orgName}
                          onChange={e => setOrgName(e.target.value)}
                          placeholder="Ex : Groupe Harmonie, Métropole de Bordeaux..."
                          className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Nom et prénom du contact *</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={e => setContactName(e.target.value)}
                          placeholder="Ex : Sarah Bernard"
                          className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Email professionnel *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="contact@organisation.fr"
                          className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Téléphone professionnel (optionnel)</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="01 23 45 67 89"
                          className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                        />
                      </div>

                      {selectedPlan === "B2B_ENTREPRISE" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Taille de l'entreprise</label>
                          <select
                            value={companySize}
                            onChange={e => setCompanySize(e.target.value)}
                            className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                          >
                            <option value="" disabled>Sélectionnez une tranche</option>
                            <option value="1-50">1 à 50 employés (Pack Équipe)</option>
                            <option value="51-250">51 à 250 employés (PME)</option>
                            <option value="250-2000">250 à 2 000 employés (ETI)</option>
                            <option value="2000+">Plus de 2 000 collaborateurs (Grand Groupe)</option>
                          </select>
                        </div>
                      )}

                      {selectedPlan === "B2G" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Population du territoire concerné</label>
                          <input
                            type="text"
                            value={populationSize}
                            onChange={e => setPopulationSize(e.target.value)}
                            placeholder="Ex : 80 000 habitants"
                            className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                          />
                        </div>
                      )}

                      {selectedPlan === "B2B2C_PARTENAIRE" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Bénéficiaires ou adhérents cibles</label>
                          <input
                            type="text"
                            value={beneficiaries}
                            onChange={e => setBeneficiaries(e.target.value)}
                            placeholder="Ex : 1 200 bénéficiaires"
                            className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
                      >
                        {loading ? "Envoi en cours..." : (
                          <>
                            <span>Envoyer la demande de devis</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <p className="text-[11px] text-[#123D46]/50 text-center mt-3">
                        Données traitées dans le strict respect du RGPD.{" "}
                        <Link href="/politique-confidentialite" className="underline hover:text-[#00A99D]">
                          Politique de confidentialité
                        </Link>
                      </p>
                    </form>
                  ) : (
                    <div className="py-16 text-center text-[#123D46]/40 flex flex-col items-center">
                      <Building2 className="w-12 h-12 mb-3 opacity-40 text-[#00A99D]" />
                      <p className="text-sm font-medium">
                        Sélectionnez un modèle ci-contre<br />pour configurer votre demande.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── RETOURS D'EXPÉRIENCE & IMPACT ────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-12">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="px-3.5 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider inline-block">
              Preuves &amp; Retours d'Expérience
            </span>
            <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46] tracking-tight">
              Ce que constatent nos organisations partenaires
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#E3EBE6] flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-[#123D46] font-inter italic leading-relaxed">
                « Grâce à Link Office, nous avons pu objectiver ce que nous pressentions depuis des mois sans réussir à l'exprimer. L'indice IQRH nous a permis de cibler immédiatement les équipes en surcharge relationnelle et de réinstaller des rituels de parole hebdomadaires pérennes. »
              </p>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between gap-4">
                <div>
                  <span className="font-jakarta font-bold text-sm text-[#123D46] block">
                    Claire Delmas
                  </span>
                  <span className="text-xs text-[#123D46]/60">
                    Directrice des Ressources Humaines · Groupe Mutualiste (1 200 salariés)
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-[#00A99D] bg-[#00A99D]/10 px-3 py-1 rounded-full shrink-0">
                  -34% de turnover
                </span>
              </div>
            </div>

            <div className="bg-white p-7 sm:p-8 rounded-3xl border border-[#E3EBE6] flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md transition-shadow">
              <p className="text-xs sm:text-sm text-[#123D46] font-inter italic leading-relaxed">
                « Dans notre secteur industriel, parler de relations humaines était parfois perçu comme secondaire. La rigueur de mesure de Link Office a convaincu notre Comité de Direction : la qualité du lien est désormais suivie au même titre que nos indicateurs de production. »
              </p>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between gap-4">
                <div>
                  <span className="font-jakarta font-bold text-sm text-[#123D46] block">
                    Stéphane Martin
                  </span>
                  <span className="text-xs text-[#123D46]/60">
                    Directeur Général Délégué · ETI Manufacturière (680 collaborateurs)
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-[#5965E8] bg-[#5965E8]/10 px-3 py-1 rounded-full shrink-0">
                  +28% de coopération
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOIRE AUX QUESTIONS ENTREPRISES (NOUVEAUTÉ EXPERTE) ── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12">
          <div className="text-center space-y-3 mb-8">
            <span className="px-3.5 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider inline-block">
              Foire Aux Questions
            </span>
            <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
              Questions fréquentes des décideurs RH &amp; Direction
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-jakarta font-bold text-sm sm:text-base text-[#123D46] hover:text-[#00A99D] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="shrink-0 w-7 h-7 rounded-full bg-[#FAF9F5] flex items-center justify-center text-[#123D46]/60">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#123D46]/75 leading-relaxed font-inter border-t border-[#E3EBE6]/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BANNIÈRE DE CONVERSION FINALE ─────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-12">
          <div className="bg-gradient-to-br from-[#123D46] via-[#199E9A] to-[#00A99D] rounded-3xl p-10 sm:p-14 text-center text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#FFC629]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-5">
              <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl leading-tight">
                Prêt à outiller la santé relationnelle de votre organisation ?
              </h2>
              <p className="text-white/85 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-inter">
                Rejoignez les dirigeants et directeurs RH qui ont transformé la qualité du lien en levier d'engagement et de cohésion durable.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-3">
                <a
                  href="#devis"
                  className="px-7 py-3.5 rounded-full bg-[#FFC629] hover:bg-[#ffcf4d] text-[#123D46] font-jakarta font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <span>Demander un devis personnalisé</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/#tarifs"
                  className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-jakarta font-bold text-sm transition-all"
                >
                  Découvrir toutes les formules
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
