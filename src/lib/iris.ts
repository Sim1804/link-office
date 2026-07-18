import { getIrisContext, getIrisConversation, getIrisHistory, saveIrisMessage } from "@/lib/db";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_KEY = process.env.GROQ_API_KEY;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

async function callGroq(messages: ChatMessage[]) {
  if (!GROQ_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content?.trim() || "";
}

function summarizeContext(context: Record<string, unknown>) {
  const parts: string[] = [];

  if (context.sexe) parts.push(`Sexe : ${context.sexe}`);
  if (context.age_range) parts.push(`Âge : ${context.age_range}`);
  if (context.departement) parts.push(`Département : ${context.departement}`);
  if (context.situation_professionnelle) parts.push(`Situation professionnelle : ${context.situation_professionnelle}`);
  if (Array.isArray(context.situations_impactantes) && context.situations_impactantes.length > 0) {
    parts.push(`Situations impactantes : ${context.situations_impactantes.join(", ")}`);
  }
  if (context.iqrh_score !== null && context.iqrh_score !== undefined) parts.push(`Score IQRH : ${context.iqrh_score}/100`);
  if (context.ier_score !== null && context.ier_score !== undefined) parts.push(`Score IER : ${context.ier_score}/100 (${context.ier_level})`);
  if (context.best_dimension) parts.push(`Dimension la plus forte : ${context.best_dimension}`);
  if (context.priority_dimension) parts.push(`Dimension prioritaire : ${context.priority_dimension}`);
  if (context.profile_primary) parts.push(`Profil relationnel principal : ${context.profile_primary}`);
  if (Array.isArray(context.top_strengths) && context.top_strengths.length > 0) {
    parts.push(`Points forts : ${context.top_strengths.map((item: any) => item.title).join("; ")}`);
  }
  if (Array.isArray(context.top_watchpoints) && context.top_watchpoints.length > 0) {
    parts.push(`Zones de vigilance : ${context.top_watchpoints.map((item: any) => item.title).join("; ")}`);
  }

  return parts.join("\n");
}

function buildExplanationPrompt(context: Record<string, unknown>) {
  const summary = summarizeContext(context);
  return `Voici le profil relationnel de l'utilisateur LinkOffice :\n${summary}\n\nGénère une explication claire, bienveillante et structurée de ses résultats. Respecte les règles suivantes :\n- Ne juge jamais.\n- Pas de diagnostic médical ou psychologique.\n- Trois paragraphes distincts.\n- Ton chaleureux et direct.\n- Terminer par une note constructive et motivante.`;
}

function buildCoachPrompt(context: Record<string, unknown>) {
  const summary = summarizeContext(context);
  return `Tu es IRIS, coach relationnel de LinkOffice. Tu aides l'utilisateur à comprendre ses résultats, à explorer ses besoins et à avancer.\nTu réponds en 2 à 4 phrases.\nTu termines toujours par une question de relance ouverte.\nUtilise un ton empathique, simple et concret.\nNe donne pas de diagnostic médical ou psychologique.\nNe propose pas de ressources inventées.\n\nContexte utilisateur :\n${summary}`;
}

function createFallbackExplanation(context: Record<string, unknown>) {
  const score = typeof context.iqrh_score === "number" ? context.iqrh_score : 0;
  const level = context.ier_level || "un équilibre relationnel à préciser";
  const best = context.best_dimension || "une dimension de force";
  const priority = context.priority_dimension || "une dimension prioritaire";
  const profile = context.profile_primary || "un profil relationnel";

  return `Votre score global de ${score}/100 montre une photographie de votre qualité relationnelle. ${level} reste à améliorer.\n\nVous disposez d'une force sur ${best}. Cette ressource peut vous aider à progresser. Votre profil dominant est ${profile}, et il est important de prendre appui sur ce qui fonctionne bien.\n\nLa dimension la plus prioritaire à travailler est ${priority}. Avancez doucement en gardant le focus sur des actions concrètes et positives.`;
}

function createFallbackCoachReply(userMessage: string, context: Record<string, unknown>) {
  const trimmed = userMessage.trim().replace(/\s+/g, " ");
  const prompt = trimmed.length > 120 ? `${trimmed.slice(0, 117)}...` : trimmed;

  return `Merci pour votre message. Je vous entends sur : «${prompt}». Pour aller plus loin, pouvez-vous préciser ce qui est le plus important pour vous dans cette situation ?`;
}

export async function generateIrisExplanation(context: Record<string, unknown>) {
  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: "Tu es IRIS, l'IA relationnelle de LinkOffice. Tu expliques les résultats IQRH en 3 paragraphes bienveillants.",
      },
      {
        role: "user",
        content: buildExplanationPrompt(context),
      },
    ];

    const texte = await callGroq(messages);
    return { explication: texte, est_fallback: false };
  } catch (error) {
    return { explication: createFallbackExplanation(context), est_fallback: true };
  }
}

export async function generateIrisCoachReply(conversationId: string, userText: string) {
  const conversation = getIrisConversation(conversationId) as { user_id: string } | null;
  if (!conversation) {
    throw new Error("Conversation IRIS introuvable.");
  }

  const context = getIrisContext(conversation.user_id);
  const history = getIrisHistory(conversationId).map((message) => ({
    role: message.sender === "user" ? "user" : "assistant",
    content: message.message,
  })) as ChatMessage[];

  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: buildCoachPrompt(context),
      },
      ...history,
      {
        role: "user",
        content: userText,
      },
    ];

    const texte = await callGroq(messages);
    return texte;
  } catch (error) {
    return createFallbackCoachReply(userText, context);
  }
}
