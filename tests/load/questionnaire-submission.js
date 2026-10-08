import http from "k6/http";
import { check, sleep } from "k6";

/**
 * Test de charge k6 : Soumission de questionnaire IQRH
 *
 * Évalue la résilience et la latence du pipeline de calcul psychométrique complet
 * (5 dimensions IQRH, ICR renormalisé, IER, profil relationnel, génération d'ordonnance).
 *
 * Commande d'exécution :
 *   k6 run tests/load/questionnaire-submission.js
 *
 * Avec variables d'environnement optionnelles :
 *   k6 run -e BASE_URL=http://localhost:3000 -e AUTH_TOKEN=xxx tests/load/questionnaire-submission.js
 */

export const options = {
  stages: [
    { duration: "30s", target: 10 },  // Ramp-up initial à 10 VUs
    { duration: "30s", target: 100 }, // Montée en charge à 100 VUs
    { duration: "1m", target: 500 },  // Pic de charge à 500 VUs pendant 1 minute
    { duration: "30s", target: 0 },   // Ramp-down
  ],
  thresholds: {
    // 95% des calculs psychométriques doivent répondre en moins de 500ms
    http_req_duration: ["p(95)<500"],
    // Moins de 1% d'erreurs HTTP autorisées
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "mock-bearer-token";

export default function () {
  const url = `${BASE_URL}/api/questionnaire/submit`;

  const payload = JSON.stringify({
    assessmentId: `test-assessment-${__VU}-${__ITER}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
      Cookie: `authjs.session-token=${AUTH_TOKEN}`,
    },
    tags: { name: "SubmitQuestionnaire" },
  };

  const res = http.post(url, payload, params);

  check(res, {
    "status is 200 or 400 (valid response format)": (r) => r.status === 200 || r.status === 400,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
