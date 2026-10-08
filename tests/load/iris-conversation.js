import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Test de charge k6 : Conversation IRIS & Quota Freemium
 *
 * Évalue la résilience de l'agent IRIS face à des requêtes concurrentes :
 * - Filtrage de sécurité synchrone (< 3ms)
 * - Contrôle atomique du quota Freemium (5/jour, HTTP 402)
 * - Latence de génération LLM (Groq Llama 3.3 70B Versatile)
 *
 * Commande d'exécution :
 *   k6 run tests/load/iris-conversation.js
 *
 * Avec variables :
 *   k6 run -e BASE_URL=http://localhost:3000 -e CONV_ID=xxx tests/load/iris-conversation.js
 */

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // Montée progressive à 10 VUs
    { duration: "1m", target: 50 },  // Palier à 50 VUs (plafond compatible rate limits Groq)
    { duration: "30s", target: 0 },   // Descente progressive
  ],
  thresholds: {
    // 95% des réponses sous 3000ms (délai de streaming / inférence LLM)
    http_req_duration: ["p(95)<3000"],
    // Taux d'erreur technique (5xx) inférieur à 5% (les 402 de quota normal ne sont pas des erreurs techniques)
    "http_req_failed{status:500}": ["rate<0.05"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const CONV_ID = __ENV.CONV_ID || "test-conv-123";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "mock-bearer-token";

const TEST_PROMPTS = [
  "Comment puis-je améliorer la communication avec mon binôme ?",
  "Quelles actions me conseilles-tu pour mon défi de la semaine ?",
  "Peux-tu m'expliquer mon score de climat relationnel ?",
  "Je ressens un coup de fatigue au travail aujourd'hui.",
  "Donne-moi un conseil pour gérer les tensions en réunion.",
];

export default function () {
  const url = `${BASE_URL}/api/iris/conversation/${CONV_ID}/message`;

  const randomPrompt = TEST_PROMPTS[Math.floor(Math.random() * TEST_PROMPTS.length)];

  const payload = JSON.stringify({
    message_user: randomPrompt,
    stream: false,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
      Cookie: `authjs.session-token=${AUTH_TOKEN}`,
    },
    tags: { name: "IrisMessage" },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200 (Success) or 402 (Quota Exceeded)": (r) => r.status === 200 || r.status === 402,
    "no internal server error (500)": (r) => r.status !== 500,
  });

  sleep(2);
}
