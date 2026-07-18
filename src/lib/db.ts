import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const DB_PATH = path.join(process.cwd(), process.env.DATABASE_PATH || "sql_app.db");
const JWT_SECRET = process.env.JWT_SECRET || "linkoffice-dev-secret";

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function parseJson<T>(value: string | null): T | null {
  if (value === null || value === undefined) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function stringifyJson(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return JSON.stringify(value);
}

function boolFromValue(value: number | null): boolean {
  return !!value;
}

function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compareSync(plain, hashed);
}

export function createAccessToken(data: Record<string, unknown>) {
  return jwt.sign({ ...data, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, JWT_SECRET, {
    algorithm: "HS256",
  });
}

export interface UserRow {
  user_id: string;
  prenom: string;
  nom: string;
  email: string;
  mot_de_passe: string;
  role_user: string;
  statut_compte?: string;
}

export interface UserRegisterInput {
  prenom: string;
  nom: string;
  email: string;
  password: string;
}

export interface DemographicsRow {
  user_id: string;
  sexe: string | null;
  age_range: string | null;
  pays: string | null;
  departement: string | null;
  situation_professionnelle: string | null;
  taille_organisation: string | null;
  situation_sentimentale: string[] | null;
  nombre_enfants: number | null;
  habitation: string | null;
  situations_impactantes: string[] | null;
  situation_impact_principale: string | null;
  consentement_informations: boolean;
  consentement_utilisation: boolean;
  consentement_participation: boolean;
}

export interface DashboardData {
  user_id: string;
  iqrh?: {
    score_global: number;
    weather?: { icon: string; label: string; title: string; text: string };
    radar?: {
      relations_sociales: number;
      relations_affectives: number;
      vie_sentimentale: number;
      vie_professionnelle_engagement: number;
      relation_a_soi_sens: number;
    };
    dimensions: Array<{ code: string; nom: string; score: number }>;
    ier_score: number;
    ier_level: string;
    best_dimension: string;
    priority_dimension: string;
    top_strengths: Array<{ dimension_code: string; score: number; title: string }>;
    top_watchpoints: Array<{ dimension_code: string; score: number; title: string }>;
  };
  icr?: {
    icr_score: number;
    niveau_icr: string;
    family_complexity: number;
    professional_complexity: number;
    transition_complexity: number;
    relational_load: number;
    protective_resources: number;
  };
  profil?: {
    profile_primary: string;
    profile_secondary?: string;
    profile_signature?: string;
    profile_description?: string;
  };
}

export interface UserStatus {
  has_completed_demographics: boolean;
  has_completed_iqrh: boolean;
  has_completed_adaptive: boolean;
}

export interface AdaptiveQuestion {
  adaptive_question_id: string;
  module_id: string;
  texte_question: string;
  ordre: number;
  choix: string[];
}

export interface AdaptiveModule {
  module_id: string;
  module_name: string;
  description: string | null;
  questions: AdaptiveQuestion[];
}

export interface AdaptiveResponseInput {
  user_id: string;
  module_id: string;
  adaptive_question_id: string;
  score_reponse: number;
}

export interface IrisConversation {
  conversation_id: string;
  user_id: string;
  mode_iris: string;
  nombre_messages: number;
}

export interface IrisMessageRow {
  sender: string;
  message_text: string;
  date_message: string;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user (
  user_id TEXT PRIMARY KEY,
  prenom TEXT,
  nom TEXT,
  email TEXT UNIQUE,
  mot_de_passe TEXT,
  role_user TEXT,
  date_creation TEXT,
  dernier_login TEXT,
  statut_compte TEXT,
  subscription_type TEXT,
  organisation_id TEXT,
  territoire_id TEXT,
  consentement_rgpd INTEGER
);

CREATE TABLE IF NOT EXISTS profil_demographique (
  user_id TEXT PRIMARY KEY,
  sexe TEXT,
  age_range TEXT,
  pays TEXT,
  departement TEXT,
  situation_professionnelle TEXT,
  taille_organisation TEXT,
  situation_sentimentale TEXT,
  nombre_enfants INTEGER,
  habitation TEXT,
  situations_impactantes TEXT,
  situation_impact_principale TEXT,
  consentement_informations INTEGER,
  consentement_utilisation INTEGER,
  consentement_participation INTEGER
);

CREATE TABLE IF NOT EXISTS reponse_questionnaire_iqrh (
  response_id TEXT PRIMARY KEY,
  user_id TEXT,
  campagne_id TEXT,
  date_reponse TEXT,
  Q1 INTEGER, Q2 INTEGER, Q3 INTEGER, Q4 INTEGER, Q5 INTEGER,
  Q6 INTEGER, Q7 INTEGER, Q8 INTEGER, Q9 INTEGER, Q10 INTEGER,
  Q11 INTEGER, Q12 INTEGER, Q13 INTEGER, Q14 INTEGER, Q15 INTEGER,
  Q16 INTEGER, Q17 INTEGER, Q18 INTEGER, Q19 INTEGER, Q20 INTEGER,
  Q21 INTEGER, Q22 INTEGER, Q23 INTEGER, Q24 INTEGER, Q25 INTEGER,
  Q26 INTEGER, Q27 INTEGER, Q28 INTEGER, Q29 INTEGER, Q30 INTEGER,
  temps_completion INTEGER,
  questionnaire_version TEXT
);

CREATE TABLE IF NOT EXISTS resultat_iqrh (
  resultat_iqrh_id TEXT PRIMARY KEY,
  user_id TEXT,
  campagne_id TEXT,
  iqrh_score INTEGER,
  d1_score_relations_sociales INTEGER,
  d2_score_relations_affectives INTEGER,
  d3_score_vie_sentimentale INTEGER,
  d4_score_vie_professionnelle_engagement INTEGER,
  d5_score_relation_a_soi_sens INTEGER,
  ier_score INTEGER,
  ier_level TEXT,
  ier_text TEXT,
  best_dimension TEXT,
  second_best_dimension TEXT,
  third_best_dimension TEXT,
  weak_dimension TEXT,
  meteo_icon TEXT,
  meteo_label TEXT,
  meteo_title TEXT,
  meteo_text TEXT,
  status_D1 TEXT,
  status_D2 TEXT,
  status_D3 TEXT,
  status_D4 TEXT,
  status_D5 TEXT,
  top_strengths TEXT,
  top_watchpoints TEXT,
  priority_dimension TEXT,
  date_calcul TEXT
);

CREATE TABLE IF NOT EXISTS profil_relationnel_resultat (
  profile_result_id TEXT PRIMARY KEY,
  user_id TEXT,
  campagne_id TEXT,
  profile_primary TEXT,
  profile_secondary TEXT,
  profile_primary_score REAL,
  profile_secondary_score REAL,
  profile_primary_confidence REAL,
  profile_secondary_confidence REAL,
  profile_signature TEXT,
  profile_description TEXT,
  profile_strengths TEXT,
  profile_risks TEXT,
  profile_needs TEXT,
  profile_recommendations TEXT,
  date_calcul TEXT
);

CREATE TABLE IF NOT EXISTS resultat_icr (
  icr_result_id TEXT PRIMARY KEY,
  user_id TEXT,
  campagne_id TEXT,
  icr_score INTEGER,
  complexity_level TEXT,
  family_complexity INTEGER,
  professional_complexity INTEGER,
  transition_complexity INTEGER,
  relational_load INTEGER,
  protective_resources INTEGER,
  top_risk_factors TEXT,
  top_protective_factors TEXT,
  top_resources TEXT,
  top_vulnerabilities TEXT,
  identified_barriers TEXT,
  identified_levers TEXT,
  dominant_needs TEXT,
  icr_summary TEXT,
  niveau_icr TEXT,
  interpretation_icr TEXT,
  date_calcul TEXT
);

CREATE TABLE IF NOT EXISTS conversation_iris (
  conversation_id TEXT PRIMARY KEY,
  user_id TEXT,
  date_debut TEXT,
  date_fin TEXT,
  mode_iris TEXT,
  theme TEXT,
  nombre_messages INTEGER,
  resume_conversation TEXT,
  action_suivante TEXT
);

CREATE TABLE IF NOT EXISTS message_iris (
  message_id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender TEXT,
  message_text TEXT,
  date_message TEXT,
  intention_detectee TEXT,
  niveau_sensibilite TEXT
);

CREATE TABLE IF NOT EXISTS module_adaptatif (
  module_id TEXT PRIMARY KEY,
  module_name TEXT,
  situation_declencheuse TEXT,
  description TEXT,
  actif INTEGER
);

CREATE TABLE IF NOT EXISTS question_module_adaptatif (
  adaptive_question_id TEXT PRIMARY KEY,
  module_id TEXT,
  texte_question TEXT,
  ordre INTEGER,
  facteur_mesure TEXT,
  type_facteur TEXT,
  sens_item TEXT
);

CREATE TABLE IF NOT EXISTS reponse_module_adaptatif (
  adaptive_response_id TEXT PRIMARY KEY,
  user_id TEXT,
  campagne_id TEXT,
  module_id TEXT,
  adaptive_question_id TEXT,
  score_reponse INTEGER,
  date_reponse TEXT
);

CREATE TABLE IF NOT EXISTS profil_relationnel_reference (
  profile_id TEXT PRIMARY KEY,
  profile_name TEXT UNIQUE,
  definition TEXT,
  resultats_typiques TEXT,
  besoins_dominants TEXT,
  forces TEXT,
  points_vigilance TEXT,
  recommandations TEXT
);
`;

db.exec(SCHEMA_SQL);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getUserByEmail(email: string): UserRow | null {
  const normalized = normalizeEmail(email);
  const row = db.prepare(`SELECT * FROM user WHERE email = ?`).get(normalized);
  return (row as UserRow) || null;
}

export function getUserById(user_id: string): UserRow | null {
  const row = db.prepare(`SELECT * FROM user WHERE user_id = ?`).get(user_id);
  return (row as UserRow) || null;
}

export function createUser(data: UserRegisterInput) {
  const user_id = randomUUID();
  const now = new Date().toISOString();
  const hashed = hashPassword(data.password);
  const normalizedEmail = normalizeEmail(data.email);

  db.prepare(
    `INSERT INTO user (user_id, prenom, nom, email, mot_de_passe, role_user, date_creation, statut_compte, consentement_rgpd)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(user_id, data.prenom, data.nom, normalizedEmail, hashed, "particulier", now, "actif", 0);

  return {
    user_id,
    prenom: data.prenom,
    nom: data.nom,
    email: normalizedEmail,
    role_user: "particulier",
  };
}

export function saveDemographics(data: Record<string, unknown>) {
  const serializedSituations = stringifyJson(data.situation_sentimentale || []);
  const serializedImpactantes = stringifyJson(data.situations_impactantes || []);
  const userId = data.user_id as string;

  const existing = db.prepare(`SELECT user_id FROM profil_demographique WHERE user_id = ?`).get(userId);
  if (existing) {
    db.prepare(`
      UPDATE profil_demographique SET
        sexe = ?, age_range = ?, pays = ?, departement = ?, situation_professionnelle = ?, taille_organisation = ?,
        situation_sentimentale = ?, nombre_enfants = ?, habitation = ?, situations_impactantes = ?, situation_impact_principale = ?,
        consentement_informations = ?, consentement_utilisation = ?, consentement_participation = ?
      WHERE user_id = ?
    `).run(
      data.sexe || null,
      data.age_range || null,
      data.pays || null,
      data.departement || null,
      data.situation_professionnelle || null,
      data.taille_organisation || null,
      serializedSituations,
      data.nombre_enfants ?? null,
      data.habitation || null,
      serializedImpactantes,
      data.situation_impact_principale || null,
      data.consentement_informations ? 1 : 0,
      data.consentement_utilisation ? 1 : 0,
      data.consentement_participation ? 1 : 0,
      userId,
    );
  } else {
    db.prepare(`
      INSERT INTO profil_demographique (
        user_id, sexe, age_range, pays, departement, situation_professionnelle,
        taille_organisation, situation_sentimentale, nombre_enfants, habitation,
        situations_impactantes, situation_impact_principale,
        consentement_informations, consentement_utilisation, consentement_participation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      data.sexe || null,
      data.age_range || null,
      data.pays || null,
      data.departement || null,
      data.situation_professionnelle || null,
      data.taille_organisation || null,
      serializedSituations,
      data.nombre_enfants ?? null,
      data.habitation || null,
      serializedImpactantes,
      data.situation_impact_principale || null,
      data.consentement_informations ? 1 : 0,
      data.consentement_utilisation ? 1 : 0,
      data.consentement_participation ? 1 : 0,
    );
  }

  return getDemographics(userId);
}

export function getDemographics(user_id: string): DemographicsRow | null {
  const row = db.prepare(`SELECT * FROM profil_demographique WHERE user_id = ?`).get(user_id) as any;
  if (!row) return null;

  return {
    ...row,
    situation_sentimentale: parseJson<string[]>(row.situation_sentimentale) || [],
    situations_impactantes: parseJson<string[]>(row.situations_impactantes) || [],
    consentement_informations: boolFromValue(row.consentement_informations),
    consentement_utilisation: boolFromValue(row.consentement_utilisation),
    consentement_participation: boolFromValue(row.consentement_participation),
  } as DemographicsRow;
}

export function getAdaptiveModulesForUser(user_id: string): AdaptiveModule[] {
  const profile = getDemographics(user_id);
  if (!profile || !profile.situations_impactantes?.length) return [];

  const placeholders = profile.situations_impactantes.map(() => "?").join(",");
  const modules = db
    .prepare(
      `SELECT * FROM module_adaptatif WHERE situation_declencheuse IN (${placeholders}) AND actif = 1 ORDER BY module_name ASC`
    )
    .all(...profile.situations_impactantes);

  return modules.map((module: any) => {
    const questions = db
      .prepare(`SELECT * FROM question_module_adaptatif WHERE module_id = ? ORDER BY ordre ASC`)
      .all(module.module_id)
      .map((question: any) => ({
        adaptive_question_id: question.adaptive_question_id,
        module_id: question.module_id,
        texte_question: question.texte_question,
        ordre: question.ordre,
        choix: [
          "Pas du tout d'accord",
          "Plutôt pas d'accord",
          "Ni d'accord, ni pas d'accord",
          "Plutôt d'accord",
          "Tout à fait d'accord",
        ],
      }));

    return {
      module_id: module.module_id,
      module_name: module.module_name,
      description: module.description,
      questions,
    };
  });
}

export function submitAdaptiveResponses(responses: AdaptiveResponseInput[]) {
  const now = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO reponse_module_adaptatif (
      adaptive_response_id, user_id, campagne_id, module_id,
      adaptive_question_id, score_reponse, date_reponse
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const saved: AdaptiveResponseInput[] = [];
  const transaction = db.transaction((items: AdaptiveResponseInput[]) => {
    for (const response of items) {
      const adaptive_response_id = randomUUID();
      insert.run(
        adaptive_response_id,
        response.user_id,
        null,
        response.module_id,
        response.adaptive_question_id,
        response.score_reponse,
        now,
      );
      saved.push(response);
    }
  });

  transaction(responses);
  return saved;
}

export function getUserStatus(user_id: string): UserStatus {
  const demographics = getDemographics(user_id);
  const iqrh = db
    .prepare(`SELECT resultat_iqrh_id FROM resultat_iqrh WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`)
    .get(user_id);

  const adaptiveModules = getAdaptiveModulesForUser(user_id);
  const responseCountRow = db
    .prepare(`SELECT COUNT(*) as count FROM reponse_module_adaptatif WHERE user_id = ?`)
    .get(user_id) as { count: number } | undefined;
  const responseCount = responseCountRow?.count || 0;

  return {
    has_completed_demographics: !!demographics,
    has_completed_iqrh: !!iqrh,
    has_completed_adaptive: adaptiveModules.length === 0 || responseCount > 0,
  };
}

export function getDashboardData(user_id: string): DashboardData | null {
  const iqrhRow = db
    .prepare(`SELECT * FROM resultat_iqrh WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`)
    .get(user_id) as any;

  if (!iqrhRow) {
    return { user_id, iqrh: undefined, icr: undefined, profil: undefined };
  }

  const icrRow = db
    .prepare(`SELECT * FROM resultat_icr WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`)
    .get(user_id) as any;

  const profilRow = db
    .prepare(`SELECT * FROM profil_relationnel_resultat WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`)
    .get(user_id) as any;

  const result: DashboardData = {
    user_id,
    iqrh: {
      score_global: iqrhRow.iqrh_score,
      weather: {
        icon: iqrhRow.meteo_icon || "",
        label: iqrhRow.meteo_label || "",
        title: iqrhRow.meteo_title || "",
        text: iqrhRow.meteo_text || "",
      },
      radar: {
        relations_sociales: iqrhRow.d1_score_relations_sociales || 0,
        relations_affectives: iqrhRow.d2_score_relations_affectives || 0,
        vie_sentimentale: iqrhRow.d3_score_vie_sentimentale || 0,
        vie_professionnelle_engagement: iqrhRow.d4_score_vie_professionnelle_engagement || 0,
        relation_a_soi_sens: iqrhRow.d5_score_relation_a_soi_sens || 0,
      },
      dimensions: [
        { code: "D1", nom: "Relations sociales", score: iqrhRow.d1_score_relations_sociales },
        { code: "D2", nom: "Relations affectives", score: iqrhRow.d2_score_relations_affectives },
        { code: "D3", nom: "Vie sentimentale", score: iqrhRow.d3_score_vie_sentimentale },
        { code: "D4", nom: "Vie professionnelle et engagement", score: iqrhRow.d4_score_vie_professionnelle_engagement },
        { code: "D5", nom: "Relation à soi et au sens", score: iqrhRow.d5_score_relation_a_soi_sens },
      ],
      ier_score: iqrhRow.ier_score,
      ier_level: iqrhRow.ier_level,
      best_dimension: iqrhRow.best_dimension || "",
      priority_dimension: iqrhRow.priority_dimension || "",
      top_strengths: parseJson(iqrhRow.top_strengths) || [],
      top_watchpoints: parseJson(iqrhRow.top_watchpoints) || [],
    },
    icr: icrRow
      ? {
          icr_score: icrRow.icr_score,
          niveau_icr: icrRow.niveau_icr || "",
          family_complexity: icrRow.family_complexity || 0,
          professional_complexity: icrRow.professional_complexity || 0,
          transition_complexity: icrRow.transition_complexity || 0,
          relational_load: icrRow.relational_load || 0,
          protective_resources: icrRow.protective_resources || 0,
        }
      : undefined,
    profil: profilRow
      ? {
          profile_primary: profilRow.profile_primary,
          profile_secondary: profilRow.profile_secondary || undefined,
          profile_signature: profilRow.profile_signature || undefined,
          profile_description: profilRow.profile_description || undefined,
        }
      : undefined,
  };

  return result;
}

const TEXTS_DIMENSIONS = {
  D1: {
    name: "Relations sociales",
    strength_title: "Votre réseau relationnel est une ressource.",
    strength_interp: "Vous semblez disposer d’un entourage, de liens ou d’occasions d’échange qui contribuent positivement à votre équilibre. Votre capacité à créer, maintenir ou mobiliser des relations sociales représente un facteur protecteur important.",
    strength_lever: "Continuez à entretenir ces liens dans la durée. Votre réseau peut aussi devenir un point d’appui pour renforcer les dimensions plus fragiles de votre qualité de vie relationnelle.",
    watch_title: "Votre réseau relationnel mérite d’être renforcé.",
    watch_interp: "Vos réponses suggèrent que votre environnement social pourrait être moins soutenant ou moins nourrissant que souhaité. Vous pouvez avoir besoin de davantage d’occasions d’échange, de liens réguliers ou de relations sur lesquelles compter.",
    watch_lever: "Privilégier des actions simples : reprendre contact avec une personne importante, rejoindre une activité collective, participer à un événement local ou identifier les personnes ressources autour de vous.",
  },
  D2: {
    name: "Relations affectives",
    strength_title: "Vous disposez de ressources émotionnelles importantes.",
    strength_interp: "Vos réponses suggèrent que vous bénéficiez de relations où l’écoute, l’affection, la confiance ou la sécurité émotionnelle sont présentes. Cette dimension est essentielle pour se sentir soutenu(e), compris(e) et reconnu(e) dans ce que l’on vit.",
    strength_lever: "Appuyez-vous sur ces relations de confiance pour exprimer vos besoins, partager vos ressentis et consolider votre équilibre émotionnel.",
    watch_title: "Votre sécurité émotionnelle demande de l’attention.",
    watch_interp: "Cette dimension peut révéler un besoin accru d’écoute, de soutien, de bienveillance ou d’expression émotionnelle. Il est possible que certaines émotions soient portées seul(e) ou insuffisamment partagées.",
    watch_lever: "Identifier une ou deux personnes de confiance avec lesquelles vous pouvez parler plus librement de ce que vous ressentez. L’objectif est de renforcer progressivement la qualité du soutien affectif.",
  },
  D3: {
    name: "Vie sentimentale",
    strength_title: "Votre vie sentimentale soutient votre équilibre.",
    strength_interp: "Votre situation sentimentale actuelle semble globalement correspondre à vos attentes ou à vos besoins du moment. Cette dimension peut représenter une source de stabilité, de projection ou d’épanouissement.",
    strength_lever: "Préservez les espaces de dialogue, de sincérité et de qualité relationnelle qui nourrissent cette dimension. Elle peut constituer un appui important dans votre équilibre global.",
    watch_title: "Votre vie sentimentale est un axe à clarifier ou renforcer.",
    watch_interp: "Vos réponses indiquent que votre situation sentimentale actuelle peut être source de questionnement, d’insatisfaction ou de fragilité. Cela peut concerner aussi bien le couple, le célibat, une séparation, un deuil ou une difficulté à se projeter.",
    watch_lever: "Clarifier vos besoins affectifs, identifier ce qui vous convient aujourd’hui et repérer les freins qui limitent votre épanouissement sentimental.",
  },
  D4: {
    name: "Vie professionnelle et engagement",
    strength_title: "Votre activité est une source d’utilité et d’engagement.",
    strength_interp: "Vous semblez trouver une place, du sens ou de la reconnaissance dans l’activité qui occupe une place importante dans votre quotidien. Cette dimension peut être professionnelle, académique, familiale, bénévole ou personnelle.",
    strength_lever: "Utilisez cette dynamique d’engagement comme moteur, tout en veillant à maintenir un équilibre avec les autres sphères de vie.",
    watch_title: "Votre activité actuelle pèse peut-être sur votre équilibre.",
    watch_interp: "Cette dimension suggère que l’activité qui occupe une place importante dans votre quotidien contribue moins positivement à votre équilibre qu’elle ne le pourrait. Cela peut concerner le travail, les études, la recherche d’emploi, la parentalité, l’engagement ou une autre activité significative.",
    watch_lever: "Identifier ce qui pèse le plus : manque de reconnaissance, isolement, surcharge, perte de sens, faible soutien ou difficulté à exprimer vos idées.",
  },
  D5: {
    name: "Relation à soi et au sens",
    strength_title: "Votre stabilité intérieure est une force.",
    strength_interp: "Vos réponses suggèrent une bonne connexion à vos valeurs, à vos priorités ou au sens que vous donnez à votre vie. Cette dimension constitue un socle important pour faire face aux transitions, aux responsabilités et aux difficultés relationnelles.",
    strength_lever: "Continuez à cultiver les pratiques, choix et relations qui vous permettent de rester aligné(e) avec vous-même.",
    watch_title: "Votre alignement personnel mérite d’être soutenu.",
    watch_interp: "Vos réponses peuvent traduire une période de questionnement, de fatigue intérieure, de perte de repères ou de difficulté à prendre du temps pour vous. Cette dimension influence fortement la qualité globale des relations.",
    watch_lever: "Commencer par clarifier ce qui compte vraiment pour vous aujourd’hui, réintroduire des temps de pause et identifier les activités ou relations qui vous reconnectent à vos valeurs.",
  },
} as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function calculateSubScore(scoreBrut: number) {
  const normalized = clamp(scoreBrut, 6, 30);
  return Math.round(((normalized - 6) / 24) * 100);
}

function getIerInterpretation(ier: number) {
  if (ier >= 81) return "Profil très équilibré";
  if (ier >= 61) return "Équilibre global satisfaisant";
  if (ier >= 41) return "Déséquilibre modéré";
  if (ier >= 21) return "Déséquilibre important";
  return "Déséquilibre majeur";
}

function getMeteoRelationnelle(score: number) {
  if (score >= 81) {
    return ["☀️", "Grand soleil", "Épanouissement relationnel élevé", "Votre score global indique une excellente qualité de vie relationnelle."] as const;
  }
  if (score >= 61) {
    return ["⛅", "Éclaircies", "Bonne qualité relationnelle", "Votre score global est positif, avec de bonnes ressources."] as const;
  }
  if (score >= 41) {
    return ["☁️", "Ciel couvert", "Équilibre relationnel à renforcer", "Votre équilibre est fragile et demande de l’attention."] as const;
  }
  if (score >= 21) {
    return ["🌩️", "Orage", "Fragilité relationnelle importante", "Vos relations actuelles sont source de difficultés ou d’insatisfaction."] as const;
  }
  return ["⛈️", "Tempête", "Vulnérabilité relationnelle élevée", "Votre situation relationnelle globale nécessite un soutien prioritaire."] as const;
}

function evaluateProfilRelationnel(scores: Record<string, number>, ier: number, situations: string[]) {
  const points: Record<string, number> = {
    "Le Connecteur": 0,
    "L'Ancre": 0,
    "Le Bâtisseur": 0,
    "Le Protecteur": 0,
    "Le Résilient": 0,
    "L'Explorateur": 0,
    "Le Chercheur d'équilibre": 0,
    "Le Soliste": 0,
    "Le Suradapté": 0,
    "Le Réorganisateur": 0,
    "L'Inspirant": 0,
    "L'Équilibriste": 0,
  };

  if (scores.D1 >= 80) points["Le Connecteur"] += 3;
  if (scores.D2 >= 70) points["Le Connecteur"] += 2;
  if (ier >= 70) points["Le Connecteur"] += 1;

  if (scores.D2 >= 80) points["L'Ancre"] += 3;
  if (scores.D5 >= 70) points["L'Ancre"] += 2;

  if (scores.D4 >= 80) points["Le Bâtisseur"] += 3;
  if (scores.D5 >= 70) points["Le Bâtisseur"] += 2;

  if (scores.D2 >= 70) points["Le Protecteur"] += 2;
  if (situations.some((s) => ["Parent", "Aidant familial", "Manager"].includes(s))) points["Le Protecteur"] += 3;

  if (scores.global >= 50 && scores.global <= 80) points["Le Résilient"] += 2;
  if (ier >= 60) points["Le Résilient"] += 1;

  if (scores.D1 >= 70) points["L'Explorateur"] += 2;
  if (situations.some((s) => ["Célibataire", "Étudiant"].includes(s))) points["L'Explorateur"] += 3;

  if (ier >= 85) points["Le Chercheur d'équilibre"] += 5;

  if (scores.D5 >= 70) points["Le Soliste"] += 2;
  if (scores.D1 <= 50) points["Le Soliste"] += 2;
  if (situations.includes("Personne vivant seule")) points["Le Soliste"] += 2;

  if (scores.D2 >= 50 && scores.D2 <= 70) points["Le Suradapté"] += 1;
  if (scores.D5 <= 50) points["Le Suradapté"] += 3;
  if (situations.some((s) => ["Parent", "Manager", "Aidant familial"].includes(s))) points["Le Suradapté"] += 2;

  if (situations.some((s) => [
    "Divorce ou séparation récente (moins de 2 ans)",
    "Deuil récent (moins de 2 ans)",
    "Demandeur d'emploi",
    "Création d'entreprise (moins de 3 ans)",
  ].includes(s))) {
    points["Le Réorganisateur"] += 5;
  }

  if (Object.entries(scores).filter(([k, v]) => k !== "global" && v >= 80).length >= 4) {
    points["L'Inspirant"] += 5;
  }

  if (scores.global >= 75) points["L'Équilibriste"] += 2;

  const sorted = Object.entries(points).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];
  const secondary = sorted[1]?.[1] ? sorted[1][0] : null;

  const reference = db
    .prepare(`SELECT definition FROM profil_relationnel_reference WHERE profile_name = ? LIMIT 1`)
    .get(primary) as { definition?: string } | undefined;

  return [primary, secondary, reference?.definition || null] as const;
}

export function submitIQRHQuestionnaire(data: { user_id: string; reponses: Record<string, number> }) {
  const user = getUserById(data.user_id);
  if (!user) {
    throw new Error("Utilisateur introuvable.");
  }

  const answers = data.reponses;
  const responseId = randomUUID();
  const now = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO reponse_questionnaire_iqrh (
      response_id, user_id, campagne_id, date_reponse,
      Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10,
      Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20,
      Q21, Q22, Q23, Q24, Q25, Q26, Q27, Q28, Q29, Q30
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    responseId,
    data.user_id,
    null,
    now,
    answers.Q1 ?? null,
    answers.Q2 ?? null,
    answers.Q3 ?? null,
    answers.Q4 ?? null,
    answers.Q5 ?? null,
    answers.Q6 ?? null,
    answers.Q7 ?? null,
    answers.Q8 ?? null,
    answers.Q9 ?? null,
    answers.Q10 ?? null,
    answers.Q11 ?? null,
    answers.Q12 ?? null,
    answers.Q13 ?? null,
    answers.Q14 ?? null,
    answers.Q15 ?? null,
    answers.Q16 ?? null,
    answers.Q17 ?? null,
    answers.Q18 ?? null,
    answers.Q19 ?? null,
    answers.Q20 ?? null,
    answers.Q21 ?? null,
    answers.Q22 ?? null,
    answers.Q23 ?? null,
    answers.Q24 ?? null,
    answers.Q25 ?? null,
    answers.Q26 ?? null,
    answers.Q27 ?? null,
    answers.Q28 ?? null,
    answers.Q29 ?? null,
    answers.Q30 ?? null,
  );

  const q = db.prepare(`SELECT * FROM reponse_questionnaire_iqrh WHERE response_id = ?`).get(responseId) as Record<string, number | null>;
  const d1 = calculateSubScore(
    (q.Q1 || 0) + (q.Q2 || 0) + (q.Q3 || 0) + (q.Q4 || 0) + (q.Q5 || 0) + (q.Q6 || 0)
  );
  const d2 = calculateSubScore(
    (q.Q7 || 0) + (q.Q8 || 0) + (q.Q9 || 0) + (q.Q10 || 0) + (q.Q11 || 0) + (q.Q12 || 0)
  );
  const d3 = calculateSubScore(
    (q.Q13 || 0) + (q.Q14 || 0) + (q.Q15 || 0) + (q.Q16 || 0) + (q.Q17 || 0) + (q.Q18 || 0)
  );
  const d4 = calculateSubScore(
    (q.Q19 || 0) + (q.Q20 || 0) + (q.Q21 || 0) + (q.Q22 || 0) + (q.Q23 || 0) + (q.Q24 || 0)
  );
  const d5 = calculateSubScore(
    (q.Q25 || 0) + (q.Q26 || 0) + (q.Q27 || 0) + (q.Q28 || 0) + (q.Q29 || 0) + (q.Q30 || 0)
  );

  const iqrhScore = Math.round((d1 + d2 + d3 + d4 + d5) / 5);
  const maxDim = Math.max(d1, d2, d3, d4, d5);
  const minDim = Math.min(d1, d2, d3, d4, d5);
  const ierScore = clamp(100 - (maxDim - minDim), 0, 100);
  const ierLevel = getIerInterpretation(ierScore);
  const [meteoIcon, meteoLabel, meteoTitle, meteoText] = getMeteoRelationnelle(iqrhScore);

  const dimensions = [
    ["D1", d1],
    ["D2", d2],
    ["D3", d3],
    ["D4", d4],
    ["D5", d5],
  ] as const;
  const sorted = [...dimensions].sort((a, b) => b[1] - a[1]);
  const bestDimension = sorted[0][0];
  const secondBestDimension = sorted[1][0];
  const thirdBestDimension = sorted[2][0];
  const weakDimension = sorted[3][0];
  const priorityDimension = sorted[4][0];

  const demographics = getDemographics(data.user_id);
  const situations = demographics?.situations_impactantes || [];
  const [primary, secondary, description] = evaluateProfilRelationnel({
    D1: d1,
    D2: d2,
    D3: d3,
    D4: d4,
    D5: d5,
    global: iqrhScore,
  }, ierScore, situations);

  const topStrengths = sorted.slice(0, 3).map(([code, score]) => ({
    dimension_code: code,
    score,
    title: TEXTS_DIMENSIONS[code].strength_title,
  }));

  const topWatchpoints = sorted.slice(-3).map(([code, score]) => ({
    dimension_code: code,
    score,
    title: TEXTS_DIMENSIONS[code].watch_title,
  }));

  const resultatId = randomUUID();
  db.prepare(`
    INSERT INTO resultat_iqrh (
      resultat_iqrh_id, user_id, campagne_id, iqrh_score,
      d1_score_relations_sociales, d2_score_relations_affectives,
      d3_score_vie_sentimentale, d4_score_vie_professionnelle_engagement,
      d5_score_relation_a_soi_sens, ier_score, ier_level, ier_text,
      best_dimension, second_best_dimension, third_best_dimension,
      weak_dimension, meteo_icon, meteo_label, meteo_title, meteo_text,
      top_strengths, top_watchpoints, priority_dimension, date_calcul
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    resultatId,
    data.user_id,
    null,
    iqrhScore,
    d1,
    d2,
    d3,
    d4,
    d5,
    ierScore,
    ierLevel,
    "Plus l’IER est élevé, plus les dimensions relationnelles sont équilibrées entre elles.",
    bestDimension,
    secondBestDimension,
    thirdBestDimension,
    weakDimension,
    meteoIcon,
    meteoLabel,
    meteoTitle,
    meteoText,
    stringifyJson(topStrengths),
    stringifyJson(topWatchpoints),
    priorityDimension,
    now,
  );

  const profileResultId = randomUUID();
  db.prepare(`
    INSERT INTO profil_relationnel_resultat (
      profile_result_id, user_id, campagne_id, profile_primary,
      profile_secondary, profile_primary_score, profile_secondary_score,
      profile_primary_confidence, profile_secondary_confidence,
      profile_signature, profile_description, date_calcul
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileResultId,
    data.user_id,
    null,
    primary,
    secondary,
    iqrhScore,
    secondary ? iqrhScore : null,
    null,
    null,
    secondary ? `${primary}-${secondary}` : primary,
    description,
    now,
  );

  return {
    score_global: iqrhScore,
    d1: d1,
    d2: d2,
    d3: d3,
    d4: d4,
    d5: d5,
    profil: primary,
    description,
  };
}

export function getIrisContext(user_id: string) {
  const demographics = getDemographics(user_id);
  if (!demographics) {
    throw new Error("Données démographiques manquantes.");
  }

  const iqrh = db.prepare(`SELECT * FROM resultat_iqrh WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`).get(user_id) as any;
  if (!iqrh) {
    throw new Error("Résultat IQRH manquant.");
  }

  const profil = db.prepare(`SELECT * FROM profil_relationnel_resultat WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`).get(user_id) as any;
  if (!profil) {
    throw new Error("Profil relationnel manquant.");
  }

  const icr = db.prepare(`SELECT * FROM resultat_icr WHERE user_id = ? ORDER BY date_calcul DESC LIMIT 1`).get(user_id) as any;

  const bestDimensionKey = typeof iqrh.best_dimension === "string" ? (iqrh.best_dimension as keyof typeof TEXTS_DIMENSIONS) : "D1";
  const priorityDimensionKey = typeof iqrh.priority_dimension === "string" ? (iqrh.priority_dimension as keyof typeof TEXTS_DIMENSIONS) : "D1";

  return {
    user_id,
    sexe: demographics.sexe || "Non renseigné",
    age_range: demographics.age_range || "Non renseigné",
    departement: demographics.departement || "Non renseigné",
    situation_professionnelle: demographics.situation_professionnelle || "Non renseignée",
    situations_impactantes: demographics.situations_impactantes || [],
    situation_impact_principale: demographics.situation_impact_principale || "Non renseignée",
    iqrh_score: iqrh.iqrh_score,
    d1_score: iqrh.d1_score_relations_sociales,
    d2_score: iqrh.d2_score_relations_affectives,
    d3_score: iqrh.d3_score_vie_sentimentale,
    d4_score: iqrh.d4_score_vie_professionnelle_engagement,
    d5_score: iqrh.d5_score_relation_a_soi_sens,
    ier_score: iqrh.ier_score,
    ier_level: iqrh.ier_level,
    profile_primary: profil.profile_primary,
    profile_secondary: profil.profile_secondary,
    profile_description: profil.profile_description,
    best_dimension: iqrh.best_dimension,
    best_dimension_nom: TEXTS_DIMENSIONS[bestDimensionKey]?.name || "",
    priority_dimension: iqrh.priority_dimension,
    priority_dimension_nom: TEXTS_DIMENSIONS[priorityDimensionKey]?.name || "",
    top_strengths: parseJson(iqrh.top_strengths) || [],
    top_watchpoints: parseJson(iqrh.top_watchpoints) || [],
    icr_score: icr ? icr.icr_score : null,
    icr_level: icr ? icr.niveau_icr : null,
  };
}

export function createIrisConversation(user_id: string, mode = "coach") {
  const conversation_id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO conversation_iris (conversation_id, user_id, date_debut, mode_iris, nombre_messages)
    VALUES (?, ?, ?, ?, ?)
  `).run(conversation_id, user_id, now, mode, 0);
  return { conversation_id, user_id, mode_iris: mode, nombre_messages: 0 };
}

export function getIrisConversation(conversation_id: string) {
  return db.prepare(`SELECT * FROM conversation_iris WHERE conversation_id = ?`).get(conversation_id) || null;
}

export function saveIrisMessage(conversation_id: string, sender: string, message_text: string) {
  const message_id = randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO message_iris (message_id, conversation_id, sender, message_text, date_message)
    VALUES (?, ?, ?, ?, ?)
  `).run(message_id, conversation_id, sender, message_text, now);
  db.prepare(`
    UPDATE conversation_iris SET nombre_messages = nombre_messages + 1 WHERE conversation_id = ?
  `).run(conversation_id);
  return { message_id, conversation_id, sender, message_text, date_message: now };
}

export function getIrisHistory(conversation_id: string) {
  return db
    .prepare(`SELECT sender, message_text, date_message FROM message_iris WHERE conversation_id = ? ORDER BY date_message ASC`)
    .all(conversation_id)
    .map((row: any) => ({ sender: row.sender, message: row.message_text, date: row.date_message }));
}
