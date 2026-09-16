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

const S = {
  page: { minHeight: "100vh", background: "var(--bg)", paddingTop: 88, paddingBottom: 64, position: "relative" as const, overflowY: "auto" as const },
  blobTop: { display: "none" },
  blobBot: { display: "none" },
  container: { maxWidth: 680, margin: "0 auto", padding: "0 24px", position: "relative" as const, zIndex: 1 },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  headerIcon: { width: 44, height: 44, background: "var(--primary-glow)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 26, color: "var(--text-1)", margin: 0 },
  subtitle: { fontFamily: "var(--font-family-sans)", color: "var(--text-3)", fontSize: 14, marginTop: 4 },
  card: { background: "var(--surface)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid var(--border)", borderRadius: 20, padding: 28, marginBottom: 16 },
  sectionTitle: { fontFamily: "var(--font-family-display)", fontWeight: 600, fontSize: 15, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
  sectionBadge: { width: 26, height: 26, background: "var(--primary-glow)", color: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  label: { display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-2)", marginBottom: 8 },
  input: { width: "100%", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "10px 14px", color: "var(--text-1)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, transition: "border-color 0.2s" },
  select: { width: "100%", background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 10, padding: "10px 14px", color: "var(--text-1)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, cursor: "pointer", appearance: "auto" as const },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 16 },
  tabButton: (active: boolean) => ({
    padding: "10px 16px", fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
    background: active ? "var(--primary-glow)" : "transparent",
    color: active ? "var(--primary)" : "var(--text-2)",
    border: "none", borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
    display: "flex", alignItems: "center", gap: 8
  })
};

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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {options.map((opt) => {
          const selected = current === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setValue(opt)}
              style={{
                flex: options.length <= 4 ? 1 : "auto", minWidth: options.length > 4 ? "auto" : 0,
                padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
                border: selected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                background: selected ? "var(--primary-glow)" : "var(--bg)",
                color: selected ? "var(--primary)" : "var(--text-2)",
                textAlign: "center"
              }}
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
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <CheckCircle style={{ width: 64, height: 64, color: "#34d399", margin: "0 auto 16px" }} />
          <h2 style={{ fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 24, color: "var(--text-1)", marginBottom: 8 }}>
            Profil enregistré !
          </h2>
          <p style={{ color: "var(--text-3)", fontSize: 14 }}>Redirection vers le questionnaire…</p>
        </div>
      </div>
    );
  }

  if (loadingStatus) return <div style={{ minHeight: "100vh", background: "var(--bg)" }} />;

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
      <main style={S.page}>
        <div style={S.blobTop} />
        <div style={S.blobBot} />

        <div style={S.container}>
          <div style={S.header}>
            <div style={S.headerIcon}>
              {isOnboarding ? <User size={24} color="var(--primary)" /> : <Settings size={24} color="var(--primary)" />}
            </div>
            <div>
              <h1 style={S.title}>{isOnboarding ? "Apprenons à vous connaître" : "Paramètres du compte"}</h1>
              <p style={S.subtitle}>
                {isOnboarding
                  ? "Ces informations permettent de personnaliser votre accompagnement."
                  : "Gérez vos informations personnelles et vos préférences."}
              </p>
            </div>
          </div>

          {!isOnboarding && (
            <div style={{ display: "flex", gap: 16, marginBottom: 24, borderBottom: "1px solid var(--border)" }}>
              <button style={S.tabButton(activeTab === 'account')} onClick={() => setActiveTab('account')}>
                <Shield size={16} /> Mon Compte
              </button>
              <button style={S.tabButton(activeTab === 'demographics')} onClick={() => setActiveTab('demographics')}>
                <User size={16} /> Profil Démographique
              </button>
            </div>
          )}

          {activeTab === 'account' && !isOnboarding && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={S.card}>
                <div style={S.sectionTitle}><User size={18} style={{ color: "var(--primary)" }} /> Identité</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Nom complet</label>
                    <div style={{ ...S.input, background: "var(--surface)", color: "var(--text-2)" }}>
                      {session?.user?.name || "Non défini"}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>Adresse e-mail</label>
                    <div style={{ ...S.input, background: "var(--surface)", color: "var(--text-2)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Mail size={14} />
                      {session?.user?.email || "Non définie"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.sectionTitle}><Building size={18} style={{ color: "#34d399" }} /> Organisation & Rôle</div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Rôle système</label>
                    <div style={{ ...S.input, background: "var(--surface)", color: "#34d399", fontWeight: 600 }}>
                      {session?.user?.role || "EMPLOYEE"}
                    </div>
                  </div>
                  <div>
                    <label style={S.label}>ID Organisation (si rattaché)</label>
                    <div style={{ ...S.input, background: "var(--surface)", color: "var(--text-2)" }}>
                      {session?.user?.organizationId || "Indépendant (B2C)"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={S.card}>
                <div style={S.sectionTitle}><Key size={18} style={{ color: "var(--amber)" }} /> Sécurité</div>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
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
                <div style={S.card}>
                  <div style={S.sectionTitle}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(236,72,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <User size={14} style={{ color: "#ec4899" }} />
                    </div>
                    Programme Binôme Relationnel
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                    Acceptez-vous d'être mis en relation avec un pair de votre organisation pour partager vos défis et progresser ensemble ?
                  </p>

                  <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: updatingOptIn ? "wait" : "pointer" }}>
                    <div style={{
                      width: 44, height: 24, background: matchingOptIn ? "#ec4899" : "var(--border)",
                      borderRadius: 999, position: "relative", transition: "background 0.3s"
                    }}>
                      <div style={{
                        width: 18, height: 18, background: "white", borderRadius: "50%",
                        position: "absolute", top: 3, left: matchingOptIn ? 23 : 3, transition: "left 0.3s"
                      }} />
                    </div>
                    <span style={{ color: "var(--text-1)", fontSize: 14, fontWeight: 500 }}>
                      {matchingOptIn ? "Oui, j'autorise le matching." : "Non, je ne souhaite pas participer."}
                    </span>

                    {/* Invisible checkbox to handle toggle logic easily */}
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
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {activeTab === 'demographics' && (
            <form onSubmit={handleSubmit}>
              {!isHidden('sexe') && (
                <div style={{ ...S.card, position: "relative", zIndex: 60 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>1</span>Votre genre</div>
                  <div style={S.fieldGroup}>
                    {handleRadioChoice("sexe", ["Homme", "Femme", "Non binaire", "Je préfère ne pas le dire"], form.sexe, v => setF("sexe", v))}
                  </div>
                </div>
              )}

              {!isHidden('age_range') && (
                <div style={{ ...S.card, position: "relative", zIndex: 55 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>2</span>Votre tranche d'âge</div>
                  <div style={S.fieldGroup}>
                    {handleRadioChoice("age_range", AGE_RANGES, form.age_range, v => setF("age_range", v))}
                  </div>
                </div>
              )}

              {!isHidden('pays') && !isHidden('departement') && (
                <div style={{ ...S.card, position: "relative", zIndex: 50 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>3</span>Localisation</div>
                  <div style={S.grid2}>
                    {!isHidden('pays') && (
                      <div>
                        <label style={S.label}>Pays de résidence</label>
                        <Select 
                          value={form.pays} 
                          onChange={v => { setF("pays", v); if (v !== "France") setF("departement", ""); }} 
                          options={PAYS.map(p => ({ value: p, label: p }))}
                        />
                      </div>
                    )}
                    {form.pays === "France" && !isHidden('departement') && (
                      <div>
                        <label style={S.label}>Département</label>
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
                <div style={{ ...S.card, position: "relative", zIndex: 40 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>4</span>Situation professionnelle</div>
                  <div style={S.fieldGroup}>
                    {handleRadioChoice("situation_professionnelle", allowedOccupations, form.situation_professionnelle, v => { setF("situation_professionnelle", v); setF("taille_organisation", ""); })}

                    {form.situation_professionnelle === "Autre" && (
                      <input type="text" placeholder="Précisez..." value={form.situation_professionnelle_autre} onChange={e => setF("situation_professionnelle_autre", e.target.value)} style={S.input} required />
                    )}

                    {requiresOrgSize && !isHidden('taille_organisation') && (
                      <div style={{ marginTop: 12 }}>
                        <div style={S.sectionTitle}><span style={S.sectionBadge}>5</span>Taille de votre organisation</div>
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
                <div style={{ ...S.card, position: "relative", zIndex: 30 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>6</span>Situation sentimentale</div>
                  <div style={S.fieldGroup}>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Célibataire", "En couple"].map(opt => {
                        const selected = form.situation_sentimentale_base === opt;
                        return (
                          <button
                            key={opt} type="button"
                            onClick={() => { setF("situation_sentimentale_base", opt); setF("situation_sentimentale_exclusif", ""); }}
                            style={{
                              flex: 1, padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
                              border: selected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                              background: selected ? "var(--primary-glow)" : "var(--bg)",
                              color: selected ? "var(--primary)" : "var(--text-2)"
                            }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {form.situation_sentimentale_base === "En couple" && (
                      <div style={{ display: "flex", gap: 10, paddingLeft: 20 }}>
                        {["Marié(e)", "Pacsé(e)"].map(opt => {
                          const selected = form.situation_sentimentale_couple === opt;
                          return (
                            <button
                              key={opt} type="button"
                              onClick={() => setF("situation_sentimentale_couple", selected ? "" : opt)}
                              style={{
                                padding: "8px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
                                border: selected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                                background: selected ? "var(--primary-glow)" : "transparent",
                                color: selected ? "#22d3ee" : "var(--text-2)"
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      {["Séparé(e) / Divorcé(e)", "Veuf(ve)"].map(opt => {
                        const selected = form.situation_sentimentale_exclusif === opt;
                        return (
                          <button
                            key={opt} type="button"
                            onClick={() => { setF("situation_sentimentale_exclusif", opt); setF("situation_sentimentale_base", ""); setF("situation_sentimentale_couple", ""); }}
                            style={{
                              flex: 1, padding: "10px 14px", borderRadius: 12, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
                              border: selected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                              background: selected ? "var(--primary-glow)" : "var(--bg)",
                              color: selected ? "var(--primary)" : "var(--text-2)"
                            }}
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
                <div style={{ ...S.card, position: "relative", zIndex: 20 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>7</span>Avez-vous des enfants ?</div>
                  <div style={S.fieldGroup}>
                    {handleRadioChoice("enfants", ["Oui", "Non"], form.enfants, v => setF("enfants", v))}
                    {form.enfants === "Oui" && (
                      <div>
                        <label style={S.label}>Nombre d'enfants</label>
                        <input type="number" min={1} max={20} value={form.nombre_enfants || ""} onChange={e => setF("nombre_enfants", parseInt(e.target.value) || 0)} style={S.input} required />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isHidden('habitation') && (
                <div style={{ ...S.card, position: "relative", zIndex: 10 }}>
                  <div style={S.sectionTitle}><span style={S.sectionBadge}>8</span>Vous vivez actuellement :</div>
                  <div style={S.fieldGroup}>
                    {handleRadioChoice("habitation", HABITATIONS, form.habitation, v => setF("habitation", v))}
                    {form.habitation === "Autre" && (
                      <input type="text" placeholder="Précisez..." value={form.habitation_autre} onChange={e => setF("habitation_autre", e.target.value)} style={S.input} required />
                    )}
                  </div>
                </div>
              )}

              <div style={{ ...S.card, position: "relative", zIndex: 5 }}>
                <div style={S.sectionTitle}>
                  <span style={S.sectionBadge}>9</span>
                  Situations à fort impact relationnel
                </div>
                <div style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 16, marginTop: -8, lineHeight: 1.5 }}>
                  <strong style={{ color: "var(--text-1)", display: "block", marginBottom: 4 }}>Consigne</strong>
                  Parmi les situations suivantes, sélectionnez au maximum 4 situations qui ont aujourd'hui le plus d'impact sur votre qualité de vie relationnelle.<br />
                  Vous pouvez sélectionner de 0 à 4 réponses maximum.<br />
                  Les réponses sélectionnées déclencheront automatiquement les modules complémentaires du questionnaire.
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {allowedSituations.map((sit) => {
                    const selected = form.situations_impactantes.includes(sit);
                    return (
                      <button
                        key={sit} type="button" onClick={() => toggleSituation(sit)}
                        style={{
                          padding: "8px 12px", borderRadius: 10, fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all 0.2s",
                          border: selected ? "1.5px solid var(--primary)" : "1.5px solid var(--border-strong)",
                          background: selected ? "var(--primary-glow)" : "var(--bg)",
                          color: selected ? "var(--primary)" : "var(--text-2)",
                          textAlign: "center"
                        }}
                      >
                        {sit}
                      </button>
                    );
                  })}
                </div>

                {form.situations_impactantes.length > 0 && (
                  <div style={{ marginTop: 20 }}>
                    <label style={S.label}>Situation la plus impactante</label>
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

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={!canSubmit}
                loading={saving}
                style={{ width: "100%", marginTop: 8, marginBottom: 32 }}
              >
                {isOnboarding ? (
                  <>Enregistrer et passer au questionnaire<ArrowRight style={{ width: 18, height: 18, marginLeft: 8 }} /></>
                ) : (
                  <>Mettre à jour mon profil démographique<CheckCircle style={{ width: 18, height: 18, marginLeft: 8 }} /></>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: var(--surface); color: var(--text-1); }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>
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
