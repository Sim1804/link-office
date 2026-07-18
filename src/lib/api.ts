/**
 * api.ts — Client API centralisé
 * ────────────────────────────────
 * Toutes les fonctions d'appel vers l'API interne Next.js.
 */

const API_URL = "";

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface IRISConversation {
  conversation_id: string;
}

export interface IRISMessage {
  message_iris: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Récupère les données du tableau de bord */
export async function getDashboard(userId: string, token?: string): Promise<DashboardData> {
  return apiFetch<DashboardData>(`/api/v1/dashboard/${userId}`, { cache: "no-store" }, token);
}

/** Explication des résultats par IRIS */
export async function getIrisExplication(userId: string): Promise<{ explication: string }> {
  return apiFetch<{ explication: string }>(`/api/iris/explication?user_id=${userId}`);
}

/** Démarre une conversation IRIS Coach */
export async function startIrisConversation(userId: string): Promise<IRISConversation> {
  return apiFetch<IRISConversation>("/api/iris/conversation", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

/** Envoie un message à IRIS */
export async function sendIrisMessage(conversationId: string, messageUser: string, history: Array<{role: string, content: string}> = []): Promise<IRISMessage> {
  return apiFetch<IRISMessage>(`/api/iris/conversation/${conversationId}/message`, {
    method: "POST",
    body: JSON.stringify({ message_user: messageUser, history }),
  });
}

/** Enregistre les données démographiques */
export async function saveDemographics(data: Record<string, unknown>, token?: string) {
  return apiFetch("/api/v1/demographics", { method: "POST", body: JSON.stringify(data) }, token);
}

/** Enregistre les réponses au questionnaire IQRH */
export async function submitIQRHQuestionnaire(
  data: { user_id: string; reponses: Record<string, number> },
  token?: string
) {
  return apiFetch("/api/v1/scoring/submit", { method: "POST", body: JSON.stringify(data) }, token);
}

export interface UserStatus {
  has_completed_demographics: boolean;
  has_completed_iqrh: boolean;
  has_completed_adaptive: boolean;
}

/** Récupère le statut d'avancement de l'utilisateur */
export async function getUserStatus(userId: string, token?: string): Promise<UserStatus> {
  return apiFetch<UserStatus>(`/api/v1/users/${userId}/status`, { cache: "no-store" }, token);
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

/** Récupère les questions adaptatives pour l'utilisateur */
export async function getAdaptiveQuestions(userId: string, token?: string): Promise<AdaptiveModule[]> {
  return apiFetch<AdaptiveModule[]>(`/api/v1/adaptive/adaptive-questions/${userId}`, { cache: "no-store" }, token);
}

/** Enregistre les réponses aux modules adaptatifs */
export async function submitAdaptiveResponses(
  responses: Array<{ user_id: string; module_id: string; adaptive_question_id: string; score_reponse: number }>,
  token?: string
) {
  return apiFetch("/api/v1/adaptive/adaptive-responses", { method: "POST", body: JSON.stringify(responses) }, token);
}
