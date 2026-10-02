/**
 * /profil/page.tsx — Saisie des données démographiques
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { User, ArrowRight, CheckCircle, Check, Shield, Mail, Building, Key, Settings } from "lucide-react";
import { getUserStatus, saveDemographics } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

const DEPARTEMENTS = [
  "01 - Ain", "02 - Aisne", "03 - Allier", "04 - Alpes-de-Haute-Provence", "05 - Hautes-Alpes", "06 - Alpes-Maritimes", "07 - Ardèche", "08 - Ardennes", "09 - Ariège", "10 - Aube", "11 - Aude", "12 - Aveyron", "13 - Bouches-du-Rhône", "14 - Calvados", "15 - Cantal", "16 - Charente", "17 - Charente-Maritime", "18 - Cher", "19 - Corrèze", "2A - Corse-du-Sud", "2B - Haute-Corse", "21 - Côte-d'Or", "22 - Côtes-d'Armor", "23 - Creuse", "24 - Dordogne", "25 - Doubs", "26 - Drôme", "27 - Eure", "28 - Eure-et-Loir", "29 - Finistère", "30 - Gard", "31 - Haute-Garonne", "32 - Gers", "33 - Gironde", "34 - Hérault", "35 - Ille-et-Vilaine", "36 - Indre", "37 - Indre-et-Loire", "38 - Isère", "39 - Jura", "40 - Landes", "41 - Loir-et-Cher", "42 - Loire", "43 - Haute-Loire", "44 - Loire-Atlantique", "45 - Loiret", "46 - Lot", "47 - Lot-et-Garonne", "48 - Lozère", "49 - Maine-et-Loire", "50 - Manche", "51 - Marne", "52 - Haute-Marne", "53 - Mayenne", "54 - Meurthe-et-Moselle", "55 - Meuse", "56 - Morbihan", "57 - Moselle", "58 - Nièvre", "59 - Nord", "60 - Oise", "61 - Orne", "62 - Pas-de-Calais", "63 - Puy-de-Dôme", "64 - Pyrénées-Atlantiques", "65 - Hautes-Pyrénées", "66 - Pyrénées-Orientales", "67 - Bas-Rhin", "68 - Haut-Rhin", "69 - Rhône", "70 - Haute-Saône", "71 - Saône-et-Loire", "72 - Sarthe", "73 - Savoie", "74 - Haute-Savoie", "75 - Paris", "76 - Seine-Maritime", "77 - Seine-et-Marne", "78 - Yvelines", "79 - Deux-Sèvres", "80 - Somme", "81 - Tarn", "82 - Tarn-et-Garonne", "83 - Var", "84 - Vaucluse", "85 - Vendée", "86 - Vienne", "87 - Haute-Vienne", "88 - Vosges", "89 - Yonne", "90 - Territoire de Belfort", "91 - Essonne", "92 - Hauts-de-Seine", "93 - Seine-Saint-Denis", "94 - Val-de-Marne", "95 - Val-d'Oise", "971 - Guadeloupe", "972 - Martinique", "973 - Guyane", "974 - La Réunion", "976 - Mayotte"
];

const PAYS = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie (Myanmar)", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodge", "Cameroun", "Canada", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo-Brazzaville", "Congo-Kinshasa", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique", "Égypte", "Émirats Arabes Unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Marshall", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République centrafricaine", "République dominicaine", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Kitts-et-Nevis", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salomon", "Salvador", "Samoa", "Sao Tomé-et-Principe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Tchéquie", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Viêt Nam", "Yémen", "Zambie", "Zimbabwe", "Autre"
];

const SITUATIONS_IMPACTANTES = [
  "Célibataire",
  "En couple",
  "Parent",
  "Famille monoparentale",
  "Entrepreneur",
  "Manager",
  "Étudiant",
  "Retraité",
  "Aidant familial",
  "Personne vivant seule",
  "Demandeur d'emploi",
  "Création d'entreprise (moins de 3 ans)",
  "Divorce ou séparation récente (moins de 2 ans)",
  "Deuil récent (moins de 2 ans)",
];

const AGE_RANGES = [
  "18 à 24 ans",
  "25 à 34 ans",
  "35 à 44 ans",
  "45 à 54 ans",
  "55 à 64 ans",
  "65 ans et plus",
];

const SITUATIONS_PRO = [
  "Étudiant",
  "Salarié",
  "Manager",
  "Entrepreneur / Indépendant / Profession libérale / Dirigeant",
  "Demandeur d'emploi",
  "Parent au foyer",
  "Retraité",
  "Autre"
];

const ORG_SIZES = [
  "Travailleur indépendant",
  "2 à 10 salariés",
  "11 à 50 salariés",
  "51 à 250 salariés",
  "Plus de 250 salariés"
];

const HABITATIONS = [
  "Seul",
  "En couple",
  "En famille",
  "Colocation",
  "Résidence étudiante",
  "Autre"
];

// Removed old S object as we're migrating to Tailwind

import { Suspense } from "react";

function ProfilContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const onboardingMode = searchParams.get('onboarding') === 'true';
  const initialTab = onboardingMode || searchParams.get('tab') === 'demographics' ? 'demographics' : 'account';

  const [activeTab, setActiveTab] = useState<'account' | 'demographics'>(initialTab);
  const [isOnboarding] = useState(onboardingMode);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [campaignConfig, setCampaignConfig] = useState<any>(null);
  const [allowedSituations, setAllowedSituations] = useState<string[]>(SITUATIONS_IMPACTANTES);
  const [allowedOccupations, setAllowedOccupations] = useState<string[]>(SITUATIONS_PRO);
  const [matchingOptIn, setMatchingOptIn] = useState(false);
  const [campaignOffer, setCampaignOffer] = useState<string | null>(null);
  const [updatingOptIn, setUpdatingOptIn] = useState(false);

  const [form, setForm] = useState({
    sexe: "",
    age_range: "",
    pays: "France",
    departement: "",
    situation_professionnelle: "",
    situation_professionnelle_autre: "",
    taille_organisation: "",
    situation_sentimentale_base: "",
    situation_sentimentale_couple: "",
    situation_sentimentale_exclusif: "",
    enfants: "",
    nombre_enfants: 0,
    habitation: "",
    habitation_autre: "",
    situations_impactantes: [] as string[],
    situation_impact_principale: "",
  });

  useEffect(() => {
    if (isOnboarding) {
      // Vérifier le consentement si on est dans le flux d'onboarding
      const storedConsent = sessionStorage.getItem("iqrh_consent");
      if (!storedConsent) {
        router.replace("/consentement");
        return;
      }
    }

    if (session?.user?.id) {
      getUserStatus(session.user.id).then((status) => {
        // En mode onboarding, on vérifie si c'est déjà fait
        if (onboardingMode && status.has_completed_demographics) {
          router.replace("/questionnaire");
        }
        setLoadingStatus(false);
      }).catch(() => setLoadingStatus(false));

      // Récupération des données démographiques existantes
      fetch("/api/v1/demographics")
        .then(r => r.json())
        .then(data => {
          if (data && data.demographic) {
            const d = data.demographic;
            setForm({
              sexe: d.gender || "",
              age_range: d.ageRange || "",
              pays: d.country || "France",
              departement: d.department || "",
              situation_professionnelle: SITUATIONS_PRO.includes(d.occupation) ? d.occupation : "Autre",
              situation_professionnelle_autre: SITUATIONS_PRO.includes(d.occupation) ? "" : (d.occupation || ""),
              taille_organisation: d.organizationSize || "",
              situation_sentimentale_base: ["Célibataire", "En couple"].includes(d.relationshipStatus) ? d.relationshipStatus : "",
              situation_sentimentale_couple: ["Marié(e)", "Pacsé(e)"].includes(d.relationshipStatus) ? d.relationshipStatus : "",
              situation_sentimentale_exclusif: ["Séparé(e) / Divorcé(e)", "Veuf(ve)"].includes(d.relationshipStatus) ? d.relationshipStatus : "",
              enfants: d.children ? "Oui" : "Non",
              nombre_enfants: d.childrenCount || 0,
              habitation: HABITATIONS.includes(d.livingSituation) ? d.livingSituation : "Autre",
              habitation_autre: HABITATIONS.includes(d.livingSituation) ? "" : (d.livingSituationOther || ""),
              situations_impactantes: d.selectedSituations || [],
              situation_impact_principale: d.primarySituation || "",
            });
          }
          if (data && data.campaignConfig) {
            setCampaignConfig(data.campaignConfig);
            if (data.campaignConfig.allowedSituations) {
              setAllowedSituations(data.campaignConfig.allowedSituations);
            } else if (data.availableSituations) {
              setAllowedSituations(data.availableSituations);
            }
            if (data.campaignConfig.allowedOccupations) {
              setAllowedOccupations(data.campaignConfig.allowedOccupations);
            }
          } else if (data && data.availableSituations) {
            setAllowedSituations(data.availableSituations);
          }
          if (data && data.campaignOffer) {
            setCampaignOffer(data.campaignOffer);
          }
        })
        .catch(console.error);

      // Fetch User Settings
      fetch("/api/v1/user/settings")
        .then(r => r.json())
        .then(data => {
          if (data && typeof data.matchingOptIn === "boolean") {
            setMatchingOptIn(data.matchingOptIn);
          }
        })
        .catch(console.error);
    } else if (session === null) {
      setLoadingStatus(false);
    }
  }, [session, router, isOnboarding]);

  const setF = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const toggleSituation = (sit: string) => {
    setForm((prev) => {
      const already = prev.situations_impactantes.includes(sit);
      const newList = already
        ? prev.situations_impactantes.filter((s) => s !== sit)
        : prev.situations_impactantes.length < 4
          ? [...prev.situations_impactantes, sit]
          : prev.situations_impactantes;
      return { ...prev, situations_impactantes: newList };
    });
  };

  const handleRadioChoice = (key: string, options: string[], current: string, setValue: (v: string) => void) => {
    return (
      <div className="flex flex-wrap gap-2.5">
        {options.map((opt) => {
          const selected = current === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValue(opt)}
              className={`flex-1 sm:flex-auto px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                selected
                  ? "border-[1.5px] border-[#00A99D] bg-[#00A99D]/10 text-[#00A99D]"
                  : "border-[1.5px] border-[#E3EBE6] bg-white text-[#123D46]/70 hover:bg-[#FAF9F5]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);

    // Format payload to backend spec
    const sit_pro = form.situation_professionnelle === "Autre" ? form.situation_professionnelle_autre : form.situation_professionnelle;
    const hab = form.habitation === "Autre" ? form.habitation_autre : form.habitation;

    let sit_sent: string[] = [];
    if (form.situation_sentimentale_exclusif) {
      sit_sent.push(form.situation_sentimentale_exclusif);
    } else if (form.situation_sentimentale_base) {
      sit_sent.push(form.situation_sentimentale_base);
      if (form.situation_sentimentale_base === "En couple" && form.situation_sentimentale_couple) {
        sit_sent.push(form.situation_sentimentale_couple);
      }
    }

    const requiresOrgSize = ["Salarié", "Manager", "Entrepreneur / Indépendant / Profession libérale / Dirigeant"].includes(form.situation_professionnelle);

    const payload = {
      gender: form.sexe,
      ageRange: form.age_range,
      country: form.pays,
      department: form.pays === "France" ? form.departement : undefined,
      occupation: sit_pro,
      organizationSize: requiresOrgSize ? form.taille_organisation : undefined,
      relationshipStatus: form.situation_sentimentale_base || form.situation_sentimentale_exclusif,
      children: form.enfants === "Oui",
      childrenCount: form.enfants === "Oui" ? form.nombre_enfants : undefined,
      livingSituation: form.habitation,
      livingSituationOther: form.habitation === "Autre" ? form.habitation_autre : undefined,
      selectedSituations: form.situations_impactantes,
      primarySituation: form.situation_impact_principale || (form.situations_impactantes.length > 0 ? form.situations_impactantes[0] : undefined),
    };

    try {
      // 1. Sauvegarde en base de données
      await saveDemographics(payload);

      // 2. Sauvegarde en session (pour la transition vers le questionnaire si onboarding)
      sessionStorage.setItem("iqrh_demographic", JSON.stringify(payload));

      setSaved(true);
      setTimeout(() => {
        if (isOnboarding) {
          router.push("/questionnaire");
        } else {
          // Si on n'est pas en onboarding, on réinitialise l'état saved au bout d'un moment
          // ou on laisse la page afficher "Profil enregistré" puis revenir à la normale.
          setSaved(false);
          setActiveTab('account');
        }
      }, 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      setSaving(false);
      alert(`Une erreur est survenue lors de l'enregistrement de votre profil.\nDétail : ${err.message || 'Erreur inconnue'}`);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-[#34d399] mx-auto mb-4" />
          <h2 className="font-jakarta font-bold text-2xl text-[#123D46] mb-2">
            Profil enregistré !
          </h2>
          <p className="text-[#123D46]/70 text-sm">Redirection vers le questionnaire…</p>
        </div>
      </div>
    );
  }

  if (loadingStatus) return <div className="min-h-screen bg-[#FAF9F5]" />;

  const isHidden = (field: string) => campaignConfig?.hiddenDemographics?.includes(field);

  const canSubmit = (!isHidden('sexe') ? form.sexe : true)
    && (!isHidden('age_range') ? form.age_range : true)
    && (!isHidden('pays') ? form.pays : true)
    && (!isHidden('situation_professionnelle') ? form.situation_professionnelle : true)
    && (!isHidden('situation_sentimentale') ? (form.situation_sentimentale_base || form.situation_sentimentale_exclusif) : true)
    && (!isHidden('enfants') ? form.enfants : true)
    && (!isHidden('habitation') ? form.habitation : true);
  const requiresOrgSize = ["Salarié", "Manager", "Entrepreneur / Indépendant / Profession libérale / Dirigeant"].includes(form.situation_professionnelle);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF9F5] pt-28 pb-20 relative overflow-y-auto">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#00A99D]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[680px] mx-auto px-6 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#00A99D]/10 rounded-2xl flex items-center justify-center shrink-0">
              {isOnboarding ? <User className="w-6 h-6 text-[#00A99D]" /> : <Settings className="w-6 h-6 text-[#00A99D]" />}
            </div>
            <div>
              <h1 className="font-jakarta font-bold text-2xl text-[#123D46] m-0">{isOnboarding ? "Apprenons à vous connaître" : "Paramètres du compte"}</h1>
              <p className="font-sans text-[#123D46]/70 text-sm mt-1">
                {isOnboarding
                  ? "Ces informations permettent de personnaliser votre accompagnement."
                  : "Gérez vos informations personnelles et vos préférences."}
              </p>
            </div>
          </div>

          {!isOnboarding && (
            <div className="flex gap-4 mb-6 border-b border-[#E3EBE6]">
              <button
                className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'account' ? 'bg-[#00A99D]/10 text-[#00A99D] border-[#00A99D]' : 'text-[#123D46]/70 border-transparent hover:text-[#123D46]'}`}
                onClick={() => setActiveTab('account')}
              >
                <Shield className="w-4 h-4" /> Mon Compte
              </button>
              <button
                className={`px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'demographics' ? 'bg-[#00A99D]/10 text-[#00A99D] border-[#00A99D]' : 'text-[#123D46]/70 border-transparent hover:text-[#123D46]'}`}
                onClick={() => setActiveTab('demographics')}
              >
                <User className="w-4 h-4" /> Profil Démographique
              </button>
            </div>
          )}

          {activeTab === 'account' && !isOnboarding && (
            <div className="flex flex-col gap-5">
              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm">
                <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><User className="w-[18px] h-[18px] text-[#00A99D]" /> Identité</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Nom complet</label>
                    <div className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46]/70 text-sm">
                      {session?.user?.name || "Non défini"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Adresse e-mail</label>
                    <div className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46]/70 text-sm flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      {session?.user?.email || "Non définie"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm">
                <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><Building className="w-[18px] h-[18px] text-[#34d399]" /> Organisation & Rôle</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Rôle système</label>
                    <div className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#34d399] font-semibold text-sm">
                      {session?.user?.role || "EMPLOYEE"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">ID Organisation (si rattaché)</label>
                    <div className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46]/70 text-sm">
                      {session?.user?.organizationId || "Indépendant (B2C)"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm">
                <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><Key className="w-[18px] h-[18px] text-amber-500" /> Sécurité</div>
                <p className="text-[13px] text-[#123D46]/70 mb-4">
                  Pour des raisons de sécurité, la modification du mot de passe requiert l'envoi d'un email de vérification.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                >
                  Modifier mon mot de passe
                </Button>
              </div>

              {campaignOffer === "PREMIUM_PLUS" && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5">
                    <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    Programme Binôme Relationnel
                  </div>
                  <p className="text-[13px] text-[#123D46]/70 mb-4">
                    Acceptez-vous d'être mis en relation avec un pair de votre organisation pour partager vos défis et progresser ensemble ?
                  </p>

                  <label className={`flex items-center gap-3 ${updatingOptIn ? "cursor-wait" : "cursor-pointer"}`}>
                    <div className={`w-11 h-6 rounded-full relative transition-colors ${matchingOptIn ? "bg-pink-500" : "bg-[#E3EBE6]"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${matchingOptIn ? "left-[22px]" : "left-1"}`} />
                    </div>
                    <span className="text-[#123D46] text-sm font-medium">
                      {matchingOptIn ? "Oui, j'autorise le matching." : "Non, je ne souhaite pas participer."}
                    </span>

                    <input
                      type="checkbox"
                      checked={matchingOptIn}
                      disabled={updatingOptIn}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        setMatchingOptIn(val);
                        setUpdatingOptIn(true);
                        try {
                          await fetch("/api/v1/user/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ matchingOptIn: val })
                          });
                        } catch (err) {
                          setMatchingOptIn(!val); // revert on error
                        } finally {
                          setUpdatingOptIn(false);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'demographics' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!isHidden('sexe') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-50">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">1</span>Votre genre</div>
                  <div className="flex flex-col gap-4">
                    {handleRadioChoice("sexe", ["Homme", "Femme", "Non binaire", "Je préfère ne pas le dire"], form.sexe, v => setF("sexe", v))}
                  </div>
                </div>
              )}

              {!isHidden('age_range') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-40">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">2</span>Votre tranche d'âge</div>
                  <div className="flex flex-col gap-4">
                    {handleRadioChoice("age_range", AGE_RANGES, form.age_range, v => setF("age_range", v))}
                  </div>
                </div>
              )}

              {!isHidden('pays') && !isHidden('departement') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-30">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">3</span>Localisation</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {!isHidden('pays') && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Pays de résidence</label>
                        <Select 
                          value={form.pays} 
                          onChange={v => { setF("pays", v); if (v !== "France") setF("departement", ""); }} 
                          options={PAYS.map(p => ({ value: p, label: p }))}
                        />
                      </div>
                    )}
                    {form.pays === "France" && !isHidden('departement') && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Département</label>
                        <Select 
                          value={form.departement} 
                          onChange={v => setF("departement", v)}
                          options={[
                            { value: "", label: "Sélectionner un département" },
                            ...DEPARTEMENTS.map(d => ({ value: d, label: d }))
                          ]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isHidden('situation_professionnelle') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-20">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">4</span>Situation professionnelle</div>
                  <div className="flex flex-col gap-4">
                    {handleRadioChoice("situation_professionnelle", allowedOccupations, form.situation_professionnelle, v => { setF("situation_professionnelle", v); setF("taille_organisation", ""); })}

                    {form.situation_professionnelle === "Autre" && (
                      <input type="text" placeholder="Précisez..." value={form.situation_professionnelle_autre} onChange={e => setF("situation_professionnelle_autre", e.target.value)} className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46] text-sm focus:border-[#00A99D] outline-none transition-colors" required />
                    )}

                    {requiresOrgSize && !isHidden('taille_organisation') && (
                      <div className="mt-4 border-t border-[#E3EBE6] pt-5">
                        <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-4"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">5</span>Taille de votre organisation</div>
                        <Select 
                          value={form.taille_organisation} 
                          onChange={v => setF("taille_organisation", v)}
                          options={[
                            { value: "", label: "Sélectionner" },
                            ...ORG_SIZES.map(s => ({ value: s, label: s }))
                          ]}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isHidden('situation_sentimentale') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-10">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">6</span>Situation sentimentale</div>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2.5">
                      {["Célibataire", "En couple"].map(opt => {
                        const selected = form.situation_sentimentale_base === opt;
                        return (
                          <button
                            key={opt} type="button"
                            onClick={() => { setF("situation_sentimentale_base", opt); setF("situation_sentimentale_exclusif", ""); }}
                            className={`flex-1 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                              selected
                                ? "border-[1.5px] border-[#00A99D] bg-[#00A99D]/10 text-[#00A99D]"
                                : "border-[1.5px] border-[#E3EBE6] bg-white text-[#123D46]/70 hover:bg-[#FAF9F5]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {form.situation_sentimentale_base === "En couple" && (
                      <div className="flex gap-2.5 pl-4 sm:pl-6 border-l-2 border-[#E3EBE6] ml-2 mt-1">
                        {["Marié(e)", "Pacsé(e)"].map(opt => {
                          const selected = form.situation_sentimentale_couple === opt;
                          return (
                            <button
                              key={opt} type="button"
                              onClick={() => setF("situation_sentimentale_couple", selected ? "" : opt)}
                              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[13px] font-medium transition-all ${
                                selected
                                  ? "border-[1.5px] border-[#00A99D] bg-[#00A99D]/10 text-[#00A99D]"
                                  : "border-[1.5px] border-[#E3EBE6] bg-white text-[#123D46]/70 hover:bg-[#FAF9F5]"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex gap-2.5 mt-2.5">
                      {["Séparé(e) / Divorcé(e)", "Veuf(ve)"].map(opt => {
                        const selected = form.situation_sentimentale_exclusif === opt;
                        return (
                          <button
                            key={opt} type="button"
                            onClick={() => { setF("situation_sentimentale_exclusif", opt); setF("situation_sentimentale_base", ""); setF("situation_sentimentale_couple", ""); }}
                            className={`flex-1 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                              selected
                                ? "border-[1.5px] border-[#00A99D] bg-[#00A99D]/10 text-[#00A99D]"
                                : "border-[1.5px] border-[#E3EBE6] bg-white text-[#123D46]/70 hover:bg-[#FAF9F5]"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {!isHidden('enfants') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-0">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">7</span>Avez-vous des enfants ?</div>
                  <div className="flex flex-col gap-4">
                    {handleRadioChoice("enfants", ["Oui", "Non"], form.enfants, v => setF("enfants", v))}
                    {form.enfants === "Oui" && (
                      <div>
                        <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Nombre d'enfants</label>
                        <input type="number" min={1} max={20} value={form.nombre_enfants || ""} onChange={e => setF("nombre_enfants", parseInt(e.target.value) || 0)} className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46] text-sm focus:border-[#00A99D] outline-none transition-colors" required />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isHidden('habitation') && (
                <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-0">
                  <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-5"><span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">8</span>Vous vivez actuellement :</div>
                  <div className="flex flex-col gap-4">
                    {handleRadioChoice("habitation", HABITATIONS, form.habitation, v => setF("habitation", v))}
                    {form.habitation === "Autre" && (
                      <input type="text" placeholder="Précisez..." value={form.habitation_autre} onChange={e => setF("habitation_autre", e.target.value)} className="w-full bg-white border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-[#123D46] text-sm focus:border-[#00A99D] outline-none transition-colors" required />
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border border-[#E3EBE6] rounded-2xl p-7 shadow-sm relative z-0">
                <div className="font-jakarta font-semibold text-[15px] text-[#123D46] flex items-center gap-2.5 mb-2">
                  <span className="w-6 h-6 rounded-full bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-[11px] font-bold shrink-0">9</span>
                  Situations à fort impact relationnel
                </div>
                <div className="text-[#123D46]/70 text-[13px] mb-5 leading-relaxed bg-[#FAF9F5] p-4 rounded-xl border border-[#E3EBE6]">
                  <strong className="text-[#123D46] block mb-1">Consigne</strong>
                  Parmi les situations suivantes, sélectionnez au maximum 4 situations qui ont aujourd'hui le plus d'impact sur votre qualité de vie relationnelle.<br />
                  Vous pouvez sélectionner de 0 à 4 réponses maximum.<br />
                  Les réponses sélectionnées déclencheront automatiquement les modules complémentaires du questionnaire.
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {allowedSituations.map((sit) => {
                    const selected = form.situations_impactantes.includes(sit);
                    return (
                      <button
                        key={sit} type="button" onClick={() => toggleSituation(sit)}
                        className={`px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                          selected
                            ? "border-[1.5px] border-[#00A99D] bg-[#00A99D]/10 text-[#00A99D]"
                            : "border-[1.5px] border-[#E3EBE6] bg-white text-[#123D46]/70 hover:bg-[#FAF9F5]"
                        }`}
                      >
                        {sit}
                      </button>
                    );
                  })}
                </div>

                {form.situations_impactantes.length > 0 && (
                  <div className="mt-6 border-t border-[#E3EBE6] pt-5">
                    <label className="block text-[13px] font-medium text-[#123D46]/70 mb-2">Situation la plus impactante</label>
                    <Select 
                      value={form.situation_impact_principale} 
                      onChange={v => setF("situation_impact_principale", v)}
                      options={[
                        { value: "", label: "Sélectionner" },
                        ...form.situations_impactantes.map(s => ({ value: s, label: s }))
                      ]}
                    />
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={!canSubmit}
                  loading={saving}
                  className="w-full"
                >
                  {isOnboarding ? (
                    <span className="flex items-center">Enregistrer et passer au questionnaire<ArrowRight className="w-5 h-5 ml-2" /></span>
                  ) : (
                    <span className="flex items-center">Mettre à jour mon profil démographique<CheckCircle className="w-5 h-5 ml-2" /></span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <ProfilContent />
    </Suspense>
  );
}
