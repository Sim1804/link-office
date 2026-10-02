"use client";

import { useState } from "react";
import {
  Building2, Users, BarChart3, ShieldCheck, ArrowRight,
  Check, Zap, Globe, TrendingUp, CheckCircle2, Star,
  AlertCircle, MapPin, HeartPulse, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { IconObservation, IconAction, IconBienveillance } from "@/components/brand/Icons";

/* ── Types ──────────────────────────────────────────────────── */
type Plan = "B2B_ENTREPRISE" | "B2G" | "B2B2C_PARTENAIRE" | null;

/* ── Données ─────────────────────────────────────────────────── */



const PLANS: {
  id: NonNullable<Plan>;
  label: string;
  sub: string;
  desc: string;
  bullets: string[];
  color: string;
  bgLight: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "B2B_ENTREPRISE",
    label: "Modèle B2B",
    sub: "Pour les Entreprises (PME, ETI, Grands Groupes)",
    desc: "Bilans relationnels pour vos équipes, dashboard RH anonymisé et prévention des RPS.",
    bullets: ["Dashboard RH anonymisé", "Indice de Charge Relationnelle (ICR)", "Plan d'action collaboratif", "Rapport PDF pour la Direction"],
    color: "#5965E8", // Iris Purple
    bgLight: "bg-[#5965E8]/10",
    icon: <Building2 size={24} />,
  },
  {
    id: "B2G",
    label: "Modèle B2G",
    sub: "Pour les Collectivités et Acteurs Publics",
    desc: "Baromètre territorial, action publique ciblée et cartographie de l'isolement social.",
    bullets: ["Observatoire du lien social", "Segmentation géographique", "Recommandations de politiques publiques", "Anonymat garanti"],
    color: "#00A99D", // LinkOffice Teal
    bgLight: "bg-[#00A99D]/10",
    icon: <Globe size={24} />,
  },
  {
    id: "B2B2C_PARTENAIRE",
    label: "Modèle B2B2C",
    sub: "Mutuelles, Assurances & CSE",
    desc: "Financez l'accès Premium pour vos bénéficiaires. Inclut le Binôme Relationnel IRIS.",
    bullets: ["Accès Premium financé", "Entonnoir d'activation suivi", "Orientations vers vos services de soins", "Module Binôme (Premium+)"],
    color: "#FFC629", // LinkOffice Yellow
    bgLight: "bg-[#FFC629]/15",
    icon: <HeartPulse size={24} />,
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
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <PublicNavbar />

      <main className="flex-1 w-full mx-auto pb-16 pt-32">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto mb-24 pt-8">
          <div className="bg-[#123D46] rounded-3xl sm:rounded-[3rem] p-8 sm:p-16 lg:p-20 text-white relative overflow-hidden shadow-2xl border border-[#00A99D]/20">
            {/* Background Gradients matching frontend charter */}
            <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#00A99D]/30 via-[#FFC629]/15 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute -left-32 -bottom-32 w-[500px] h-[500px] bg-gradient-to-tr from-[#5965E8]/20 to-transparent blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 text-xs font-jakarta font-semibold tracking-wider uppercase text-[#FFC629] animate-fade-in">
                <Building2 className="w-4 h-4" />
                <span>Solutions Entreprises & Secteur Public</span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden sm:inline">Accompagnement Dirigeants & DRH</span>
              </div>

              <h1 className="font-jakarta font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] animate-fade-in" style={{ animationDelay: "100ms" }}>
                Faites du <span className="text-[#00A99D]">lien humain</span> le premier atout de pérennité de votre collectif.
              </h1>

              <p className="text-[#E3EBE6] text-base sm:text-lg max-w-2xl leading-relaxed font-inter animate-fade-in" style={{ animationDelay: "200ms" }}>
                Démissions imprévues, désengagement silencieux, perte de cohésion multi-sites : 80% des crises organisationnelles prennent racine dans une dégradation non mesurée du lien relationnel. LinkOffice vous donne la rigueur scientifique pour anticiper, diagnostiquer et agir durablement.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
                <a href="#devis" className="px-7 py-3.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center gap-3 group">
                  Demander une démonstration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link href="/" className="px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-jakarta font-bold text-sm transition-all flex items-center gap-2">
                  Voir l'offre individuelle
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[#E3EBE6]/80 animate-fade-in font-medium" style={{ animationDelay: "400ms" }}>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#FFC629]" /> Confidentialité totale</span>
                <span className="hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-[#00A99D]" /> Méthodologie certifiée</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3 PILLIERS (Catalogue d'Intervention) ──────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-20 space-y-12">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#00A99D] tracking-wider block mb-1">
                Catalogue d'Intervention
              </span>
              <h3 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-[#123D46]">
                Trois formats adaptés à votre maturité
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-7 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
                    <IconObservation size={26} />
                  </div>
                  <h4 className="font-jakarta font-bold text-xl text-[#123D46]">
                    1. Audit & Baromètre Interne
                  </h4>
                  <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                    Campagne de diagnostic anonyme et sécurisée sur 100% de vos collaborateurs. Restitution croisée avec cartographie des signaux faibles et benchmark sectoriel national.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#123D46]/80 pt-2 font-medium">
                    <li>• Taux de participation moyen &gt; 85%</li>
                    <li>• Conforme aux exigences QVCT et RSE</li>
                    <li>• Rapport synthétique pour le Comité de Direction</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                  <span className="text-[#123D46]/60">Délai moyen : 3 semaines</span>
                  <span className="text-[#00A99D] font-bold">Clés en main</span>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center">
                    <IconAction size={26} />
                  </div>
                  <h4 className="font-jakarta font-bold text-xl text-[#123D46]">
                    2. Coach IRIS & Rituels Managériaux
                  </h4>
                  <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                    Déploiement continu auprès de vos managers pour transformer les indicateurs de l'IQRH en actions d'équipe : rituels d'écoute, tours de table et régulation des non-dits.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#123D46]/80 pt-2 font-medium">
                    <li>• Fiches rituels prêtes à animer en 5 minutes</li>
                    <li>• Alertes bienveillantes en cas de tension</li>
                    <li>• Suivi longitudinal de la dynamique d'équipe</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                  <span className="text-[#123D46]/60">Accès continu</span>
                  <span className="text-[#5965E8] font-bold">Déploiement en 48h</span>
                </div>
              </div>

              <div className="bg-white p-7 rounded-2xl border border-[#E3EBE6] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FFC629]/20 text-[#123D46] flex items-center justify-center">
                    <IconBienveillance size={26} />
                  </div>
                  <h4 className="font-jakarta font-bold text-xl text-[#123D46]">
                    3. Séminaires & Facilitation
                  </h4>
                  <p className="text-xs text-[#123D46]/75 leading-relaxed font-inter">
                    Intervention de nos sociologues et facilitateurs seniors lors de vos conventions, séminaires de direction, fusions ou contextes de transformation exigeante.
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#123D46]/80 pt-2 font-medium">
                    <li>• Ateliers d'alignement CODIR / COMEX</li>
                    <li>• Désamorçage des blocages inter-services</li>
                    <li>• Engagement des équipes autour d'une vision commune</li>
                  </ul>
                </div>
                <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between text-xs">
                  <span className="text-[#123D46]/60">Format immersif</span>
                  <span className="text-[#B8870A] font-bold">Sur mesure</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SEGMENTER ────────────────────────────────────────── */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E3EBE6] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-jakarta font-bold text-xl text-[#123D46]">
                  Une réponse adaptée à la taille de votre organisation
                </h4>
                <p className="text-xs text-[#123D46]/70 mt-0.5">
                  Sélectionnez votre typologie pour visualiser le dispositif préconisé.
                </p>
              </div>

              <div className="flex items-center gap-1 p-1 bg-[#F4F1E8] rounded-xl overflow-x-auto">
                {(['pme', 'eti', 'groupe'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg text-xs font-jakarta font-bold transition-all whitespace-nowrap ${
                      selectedSize === size
                        ? 'bg-[#00A99D] text-white shadow-xs'
                        : 'text-[#123D46]/70 hover:bg-[#E3EBE6]/50'
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
                  focus: 'Désamorcer les tensions de croissance rapide et aligner les équipes fondatrices.',
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
                <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E3EBE6] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="space-y-1 md:border-r border-[#E3EBE6] md:pr-6">
                    <span className="text-[11px] font-bold text-[#00A99D] uppercase tracking-wider">
                      {currentSize.label}
                    </span>
                    <h5 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                      {currentSize.subtitle}
                    </h5>
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
                      className="w-full py-2.5 px-4 rounded-xl bg-[#123D46] hover:bg-[#1a4f5a] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <span>Échanger avec un conseiller</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ── PLANS & FORMULAIRE ───────────────────────────────── */}
        <section id="devis" className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-16 scroll-mt-28">
          <div className="text-center mb-16 space-y-4">
            <span className="px-3 py-1.5 rounded-full bg-[#00A99D]/10 text-[#00A99D] text-xs font-jakarta font-bold uppercase tracking-wider">Tarification</span>
            <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-[#123D46]">
              Choisissez votre <span className="text-[#00A99D]">modèle</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 items-start">
            {/* Cartes de plans */}
            <div className="space-y-4">
              {PLANS.map(plan => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition-all cursor-pointer ${
                      isSelected ? "border-[#00A99D] shadow-md" : "border-[#E3EBE6] shadow-xs hover:border-[#00A99D]/40"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${plan.bgLight}`} style={{ color: plan.color }}>
                        {plan.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold font-jakarta text-[#123D46]">{plan.label}</h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: plan.bgLight, color: plan.color }}>{plan.sub}</span>
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-[#00A99D] flex items-center justify-center text-white shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-[#123D46]/70 leading-relaxed mb-4">{plan.desc}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {plan.bullets.map(b => (
                            <div key={b} className="flex items-start gap-2 text-xs text-[#123D46]/70 font-medium">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: plan.color }} />
                              {b}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="text-sm text-[#123D46]/60 text-center pt-4">
                Vous êtes un particulier ? <Link href="/auth/register" className="text-[#00A99D] font-bold hover:underline">Découvrez l'offre B2C</Link>
              </p>
            </div>

            {/* Formulaire de devis */}
            <div className="bg-white rounded-3xl p-8 border border-[#E3EBE6] shadow-md sticky top-28">
              {submitted ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-jakarta text-[#123D46]">Demande envoyée !</h3>
                  <p className="text-[#123D46]/70 text-sm leading-relaxed">
                    Merci pour votre intérêt. Un expert Link Office vous contactera sous 24h pour définir le dimensionnement de votre observatoire.
                  </p>
                  <button onClick={() => { setSubmitted(false); setSelectedPlan(null); setSubmitError(null); }} className="px-6 py-2.5 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] hover:bg-slate-100 text-[#123D46] text-xs font-jakarta font-bold transition-colors">
                    Nouvelle demande
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <h2 className="text-xl font-bold font-jakarta text-[#123D46] mb-2">Demande de devis</h2>
                    <p className="text-[#123D46]/60 text-xs">
                      {selectedPlan ? `Modèle sélectionné : ${activePlan?.sub}` : "Sélectionnez un modèle ci-contre pour accéder au formulaire."}
                    </p>
                  </div>

                  {submitError && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm mb-6">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{submitError}</p>
                    </div>
                  )}

                  {selectedPlan ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">
                          {selectedPlan === "B2G" ? "Nom de la collectivité *" : selectedPlan === "B2B2C_PARTENAIRE" ? "Nom de l'organisme *" : "Nom de l'entreprise *"}
                        </label>
                        <input type="text" required value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Ex : Mairie de Lyon, Harmonie Mutuelle..." className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Nom du contact *</label>
                        <input type="text" required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Jean Dupont" className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Email professionnel *</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@organisation.com" className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Téléphone (optionnel)</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01 23 45 67 89" className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                      </div>

                      {selectedPlan === "B2B_ENTREPRISE" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Taille de l'entreprise</label>
                          <select value={companySize} onChange={e => setCompanySize(e.target.value)} className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]">
                            <option value="" disabled>Sélectionnez une taille</option>
                            <option value="1-50">1 à 50 employés</option>
                            <option value="51-250">51 à 250 employés</option>
                            <option value="250+">Plus de 250 employés</option>
                          </select>
                        </div>
                      )}

                      {selectedPlan === "B2G" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Population concernée</label>
                          <input type="text" value={populationSize} onChange={e => setPopulationSize(e.target.value)} placeholder="Ex : 50 000 habitants" className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                        </div>
                      )}

                      {selectedPlan === "B2B2C_PARTENAIRE" && (
                        <div>
                          <label className="block text-xs font-bold text-[#123D46]/80 mb-1.5">Bénéficiaires estimés</label>
                          <input type="text" value={beneficiaries} onChange={e => setBeneficiaries(e.target.value)} placeholder="Ex : 500 personnes" className="w-full bg-[#FAF9F5] border border-[#E3EBE6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all text-[#123D46]" />
                        </div>
                      )}

                      <button type="submit" disabled={loading} className="w-full px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 mt-4">
                        {loading ? "Envoi en cours..." : <>Envoyer la demande <ArrowRight className="w-4 h-4" /></>}
                      </button>

                      <p className="text-[10px] text-[#123D46]/50 text-center mt-4">
                        Vos données sont traitées dans le respect du RGPD. <Link href="/politique-confidentialite" className="underline hover:text-[#00A99D]">Politique de confidentialité</Link>
                      </p>
                    </form>
                  ) : (
                    <div className="py-16 text-center text-[#123D46]/40 flex flex-col items-center">
                      <Building2 className="w-12 h-12 mb-4 opacity-50" />
                      <p className="text-sm font-medium">Choisissez un modèle ci-contre<br />pour accéder au formulaire.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── Concrete ROI & Verifiable Testimonials ──────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF9F5] p-7 rounded-2xl border border-[#E3EBE6] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-[#123D46] font-inter italic leading-relaxed">
                « Grâce à LinkOffice, nous avons pu objectiver ce que nous pressentions depuis des mois sans réussir à l'exprimer. L'indice IQRH nous a permis de cibler immédiatement les équipes en surcharge émotionnelle et de réinstaller des rituels de parole hebdomadaires. »
              </p>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between">
                <div>
                  <span className="font-jakarta font-bold text-sm text-[#123D46] block">
                    Claire Delmas
                  </span>
                  <span className="text-xs text-[#123D46]/60">
                    Directrice des Ressources Humaines · Groupe Mutualiste (1 200 salariés)
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-[#00A99D] bg-[#00A99D]/10 px-2.5 py-1 rounded-md">
                  -34% de turnover
                </span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-7 rounded-2xl border border-[#E3EBE6] flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-[#123D46] font-inter italic leading-relaxed">
                « Dans notre secteur industriel, parler de relations humaines était perçu comme secondaire. La rigueur de mesure de LinkOffice a convaincu notre Comité de Direction : la qualité du lien est désormais suivie au même titre que nos indicateurs de production. »
              </p>
              <div className="pt-4 border-t border-[#E3EBE6] flex items-center justify-between">
                <div>
                  <span className="font-jakarta font-bold text-sm text-[#123D46] block">
                    Stéphane Martin
                  </span>
                  <span className="text-xs text-[#123D46]/60">
                    Directeur Général Délégué · ETI Manufacturière (680 collaborateurs)
                  </span>
                </div>
                <span className="text-xs font-bold font-mono text-[#5965E8] bg-[#5965E8]/10 px-2.5 py-1 rounded-md">
                  +28% de coopération
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* ── CTA FINAL ────────────────────────────────────────── */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto py-16">
          <div className="bg-gradient-to-br from-[#123D46] via-[#199E9A] to-[#00A99D] rounded-3xl p-10 sm:p-16 text-center text-white relative overflow-hidden shadow-lg">
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#FFC629]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl leading-tight">
                Prêt à déployer l'IQRH dans votre organisation ?
              </h2>
              <p className="text-white/80 text-base max-w-xl mx-auto leading-relaxed">
                Rejoignez les organisations qui ont fait du bien-être relationnel un avantage compétitif.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a href="#devis" className="px-6 py-3 rounded-full bg-[#FFC629] hover:bg-[#ffcf4d] text-[#123D46] font-jakarta font-bold text-sm shadow-md transition-all flex items-center gap-2">
                  Demander un devis <ArrowRight className="w-4 h-4" />
                </a>
                <Link href="/" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-jakarta font-bold text-sm transition-all">
                  Découvrir l'offre individuelle
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
