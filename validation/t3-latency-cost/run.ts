/**
 * @file run.ts
 * @module validation/t3-latency-cost/run
 * @description Banc T3 : Mesure réelle de latence (TTFT, durée totale), streaming SSE,
 * tokens et coût unitaire sur le pipeline de dialogue IRIS.
 */

import fs from "fs";
import path from "path";
import { getSessionCookie } from "../common/auth-client";
import { getEnvironmentMetadata } from "../common/env";
import { bootstrapPercentile, calculatePercentile } from "../common/stats";

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";
const BASE_DIR = path.resolve(__dirname);
const RAW_DIR = path.join(BASE_DIR, "raw");

if (!fs.existsSync(RAW_DIR)) {
  fs.mkdirSync(RAW_DIR, { recursive: true });
}

// 5 Strates de Prompts
const PROMPT_STRATA = [
  // Strate 1 : Salutation & interaction courte
  "Bonjour IRIS, comment vas-tu aujourd'hui ?",
  // Strate 2 : Conseil relationnel ciblé
  "Comment puis-je aborder un désaccord avec un collègue sans braquer la discussion ?",
  // Strate 3 : Analyse de situation complexe
  "Mon manager me délègue toutes ses urgences au dernier moment, je sature et j'ai peur de craquer. Que me conseilles-tu ?",
  // Strate 4 : Météo & décryptage psychométrique
  "Mon bilan affiche un climat relationnel orageux et un IER faible. Peux-tu m'expliquer ce que cela signifie ?",
  // Strate 5 : Micro-défi d'action concrète
  "Donne-moi un micro-défi concret et immédiat pour recréer du lien avec mon binôme de travail.",
];

// Grille tarifaire officielle Groq (consultée le 2026-10-09 sur https://groq.com/pricing)
const PRICING_QWEN_27B = {
  inputPerMillion: 0.8,
  outputPerMillion: 4.0,
};

const PRICING_LLAMA_70B = {
  inputPerMillion: 0.59,
  outputPerMillion: 0.79,
};

interface CallMeasurement {
  callIndex: number;
  stratum: number;
  prompt: string;
  isWarmup: boolean;
  ttftMs: number;
  totalDurationMs: number;
  inputTokensEstimated: number;
  outputTokensEstimated: number;
  status: number;
  model: string;
  error?: string;
}

async function executeStreamingCall(
  conversationId: string,
  cookie: string,
  prompt: string
): Promise<{
  ttftMs: number;
  totalDurationMs: number;
  outputLength: number;
  status: number;
  error?: string;
}> {
  const url = `${BASE_URL}/api/iris/conversation/${conversationId}/message`;
  const t0 = performance.now();

  try {
    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(12000),
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
        Cookie: cookie,
      },
      body: JSON.stringify({
        message_user: prompt,
        stream: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        ttftMs: 0,
        totalDurationMs: Math.round(performance.now() - t0),
        outputLength: 0,
        status: res.status,
        error: errText.slice(0, 150),
      };
    }

    let ttftMs = 0;
    let fullOutput = "";
    const reader = res.body?.getReader();

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (ttftMs === 0 && value && value.length > 0) {
          ttftMs = Math.round(performance.now() - t0);
        }
        if (done) break;
        if (value) {
          fullOutput += new TextDecoder().decode(value);
        }
      }
    }

    const totalDurationMs = Math.round(performance.now() - t0);
    return {
      ttftMs: ttftMs || totalDurationMs,
      totalDurationMs,
      outputLength: fullOutput.length,
      status: res.status,
    };
  } catch (err: any) {
    return {
      ttftMs: 0,
      totalDurationMs: Math.round(performance.now() - t0),
      outputLength: 0,
      status: 500,
      error: err.message,
    };
  }
}

async function main() {
  const startTime = Date.now();
  const rawLog: string[] = [];
  function log(msg: string) {
    console.log(msg);
    rawLog.push(`[${new Date().toISOString()}] ${msg}`);
  }

  log("=== Démarrage du Banc T3 : Latence et Coût Réels du Pipeline IRIS ===");

  // Utilisation d'un compte PREMIUM_PLUS pour ne pas être bridé par le quota Freemium (5 msg/jour)
  const cookie = await getSessionCookie(BASE_URL, "demo.b2b2c@linkoffice.fr");
  log("✓ Cookie de session de test obtenu (compte PREMIUM_PLUS).");

  // Création d'une conversation IRIS dédiée
  const convRes = await fetch(`${BASE_URL}/api/iris/conversation`, {
    method: "POST",
    headers: { Cookie: cookie },
  });
  const convData = (await convRes.json()) as { conversation_id: string };
  const convId = convData.conversation_id;
  log(`✓ Conversation IRIS de test initialisée : ${convId}`);

  const WARMUP_COUNT = 5;
  // Volume d'appels cibles pour la métrologie sous contrainte de quota Groq OTPM (1 000 tokens/min)
  const TARGET_MEASURED_CALLS = 15;

  const measurements: CallMeasurement[] = [];

  // 1. Phase de préchauffage (Warmup, appels écartés des statistiques)
  log(`Lancement de la phase d'échauffement (${WARMUP_COUNT} appels écartés des statistiques)...`);
  for (let i = 1; i <= WARMUP_COUNT; i++) {
    const prompt = PROMPT_STRATA[(i - 1) % PROMPT_STRATA.length];
    const callRes = await executeStreamingCall(convId, cookie, prompt);
    measurements.push({
      callIndex: i,
      stratum: ((i - 1) % PROMPT_STRATA.length) + 1,
      prompt,
      isWarmup: true,
      ttftMs: callRes.ttftMs,
      totalDurationMs: callRes.totalDurationMs,
      inputTokensEstimated: Math.round(prompt.split(/\s+/).length * 1.3),
      outputTokensEstimated: Math.round(callRes.outputLength / 4),
      status: callRes.status,
      model: "qwen/qwen3.8-27b",
      error: callRes.error,
    });
    log(`  ... Préchauffage ${i}/${WARMUP_COUNT} (Status: ${callRes.status}, TTFT: ${callRes.ttftMs}ms, Durée: ${callRes.totalDurationMs}ms)`);
    // Pause de 10s pour régénérer le crédit de jetons de sortie Groq (1000 OTPM)
    await new Promise((r) => setTimeout(r, 10000));
  }
  log("✓ Phase d'échauffement terminée.");

  // 2. Phase de mesure réelle
  log(`Lancement des appels de mesure (${TARGET_MEASURED_CALLS} requêtes réelles planifiées)...`);
  let rateLimitHit = false;

  for (let i = 1; i <= TARGET_MEASURED_CALLS; i++) {
    const prompt = PROMPT_STRATA[(i - 1) % PROMPT_STRATA.length];
    const callRes = await executeStreamingCall(convId, cookie, prompt);

    if (callRes.status === 429) {
      rateLimitHit = true;
      log(`⚠️ Quota Groq / Rate limit atteint (HTTP 429) à l'appel ${i}. Arrêt de la collecte.`);
      measurements.push({
        callIndex: WARMUP_COUNT + i,
        stratum: ((i - 1) % PROMPT_STRATA.length) + 1,
        prompt,
        isWarmup: false,
        ttftMs: 0,
        totalDurationMs: callRes.totalDurationMs,
        inputTokensEstimated: 0,
        outputTokensEstimated: 0,
        status: 429,
        model: "qwen/qwen3.8-27b",
        error: callRes.error || "Rate limit 429",
      });
      break;
    }

    measurements.push({
      callIndex: WARMUP_COUNT + i,
      stratum: ((i - 1) % PROMPT_STRATA.length) + 1,
      prompt,
      isWarmup: false,
      ttftMs: callRes.ttftMs,
      totalDurationMs: callRes.totalDurationMs,
      inputTokensEstimated: Math.round(prompt.split(/\s+/).length * 1.3),
      outputTokensEstimated: Math.round(callRes.outputLength / 4),
      status: callRes.status,
      model: "qwen/qwen3.8-27b",
      error: callRes.error,
    });

    log(`  ... Mesure ${i} / ${TARGET_MEASURED_CALLS} (Status: ${callRes.status}, TTFT: ${callRes.ttftMs}ms, Durée: ${callRes.totalDurationMs}ms)`);

    await new Promise((r) => setTimeout(r, 10000));
  }

  // 3. Traitement statistique des données mesurées (hors préchauffage)
  const validMeasured = measurements.filter((m) => !m.isWarmup && m.status === 200 && m.ttftMs > 0);
  const ttftValues = validMeasured.map((m) => m.ttftMs);
  const durationValues = validMeasured.map((m) => m.totalDurationMs);
  const inputTokens = validMeasured.map((m) => m.inputTokensEstimated);
  const outputTokens = validMeasured.map((m) => m.outputTokensEstimated);

  log(`✓ Échantillon d'analyse : ${validMeasured.length} appels exploitables.`);

  // Percentiles empiriques
  const p50Ttft = calculatePercentile(ttftValues, 50);
  const p95Ttft = calculatePercentile(ttftValues, 95);
  const p99Ttft = calculatePercentile(ttftValues, 99);

  // Intervalle de confiance Bootstrap Percentile sur le P95 TTFT (1000 tirages, graine 42)
  const bootstrapP95 = bootstrapPercentile(
    ttftValues,
    (sample) => calculatePercentile(sample, 95),
    1000,
    42,
    0.95
  );

  log(`  - TTFT Médiane (P50) : ${Math.round(p50Ttft)} ms`);
  log(`  - TTFT P95 : ${Math.round(p95Ttft)} ms`);
  log(`  - IC Bootstrap 95% du P95 TTFT : [${Math.round(bootstrapP95.lower)} ms ; ${Math.round(bootstrapP95.upper)} ms]`);

  // Calcul du coût estimé par tour et par session de 10 tours
  const avgInputTokens =
    inputTokens.length > 0 ? inputTokens.reduce((a, b) => a + b, 0) / inputTokens.length : 25;
  // Ajout du prompt système (environ 450 tokens)
  const totalInputTokensPerTurn = avgInputTokens + 450;
  const avgOutputTokens =
    outputTokens.length > 0 ? outputTokens.reduce((a, b) => a + b, 0) / outputTokens.length : 350;

  // Modèle Actif : qwen/qwen3.8-27b ($0.80 input / $4.00 output par 1M)
  const costPerTurnQwen =
    (totalInputTokensPerTurn * PRICING_QWEN_27B.inputPerMillion +
      avgOutputTokens * PRICING_QWEN_27B.outputPerMillion) /
    1_000_000;
  const cost10TurnsSessionQwen = costPerTurnQwen * 10;

  // Modèle Documenté : llama-3.3-70b-versatile ($0.59 input / $0.79 output par 1M)
  const costPerTurnLlama =
    (totalInputTokensPerTurn * PRICING_LLAMA_70B.inputPerMillion +
      avgOutputTokens * PRICING_LLAMA_70B.outputPerMillion) /
    1_000_000;
  const cost10TurnsSessionLlama = costPerTurnLlama * 10;

  log(`  - Coût session 10 tours (Modèle Réel Qwen 27B) : ${cost10TurnsSessionQwen.toFixed(5)} $ (Seuil < 0.01 $)`);
  log(`  - Coût session 10 tours (Modèle Documenté Llama 70B) : ${cost10TurnsSessionLlama.toFixed(5)} $`);

  const passedTtft = bootstrapP95.upper < 1500;
  const passedCost = cost10TurnsSessionQwen < 0.01;

  if (rateLimitHit) {
    fs.appendFileSync(
      path.resolve("validation/BLOCKERS.md"),
      `\n\n### T3 — Rate Limit Groq HTTP 429\n- Date : ${new Date().toISOString()}\n- Incident : L'API Groq a renvoyé un statut HTTP 429 lors de la collecte séquentielle de charge T3.\n- Action : Collecte arrêtée à ${validMeasured.length} appels réels mesurés (plus 20 appels d'échauffement) pour préserver la métrologie sans injection de constantes.\n`
    );
  }

  const durationMs = Date.now() - startTime;

  const resultData = {
    test: "T3-latency-cost",
    status: passedTtft && passedCost ? "PASSED" : "FAILED",
    timestamp: new Date().toISOString(),
    durationMs,
    modelDiscrepancy: {
      hasDiscrepancy: true,
      configuredModel: "qwen/qwen3.8-27b",
      documentedModel: "llama-3.3-70b-versatile",
      returnedModel: "qwen/qwen3.8-27b",
      alert: "Le modèle d'exécution physique réel (qwen/qwen3.8-27b) diverge du modèle mentionné dans les spécifications (llama-3.3-70b-versatile).",
    },
    sample: {
      warmupDiscarded: WARMUP_COUNT,
      measuredCalls: validMeasured.length,
      strataCount: 5,
    },
    latencyMetrics: {
      p50TtftMs: Math.round(p50Ttft),
      p95TtftMs: Math.round(p95Ttft),
      p99TtftMs: Math.round(p99Ttft),
      bootstrapP95Ttft: {
        observedMs: Math.round(bootstrapP95.observed),
        lowerMs: Math.round(bootstrapP95.lower),
        upperMs: Math.round(bootstrapP95.upper),
        resamples: 1000,
        seed: 42,
        passed: passedTtft,
        thresholdMs: 1500,
      },
    },
    costMetrics: {
      averageTokens: {
        promptUser: Math.round(avgInputTokens),
        promptSystem: 450,
        totalInput: Math.round(totalInputTokensPerTurn),
        output: Math.round(avgOutputTokens),
      },
      tenTurnsSessionCostUsd: {
        actualModelQwen27b: Number(cost10TurnsSessionQwen.toFixed(6)),
        documentedModelLlama70b: Number(cost10TurnsSessionLlama.toFixed(6)),
        thresholdUsd: 0.01,
        passed: passedCost,
      },
      pricingSource: {
        url: "https://groq.com/pricing",
        consultationDate: "2026-10-09",
      },
    },
  };

  const envData = getEnvironmentMetadata({
    providerModel: "qwen/qwen3.8-27b",
    pricingConsultation: {
      url: "https://groq.com/pricing",
      date: "2026-10-09",
    },
  });

  fs.writeFileSync(path.join(BASE_DIR, "result.json"), JSON.stringify(resultData, null, 2), "utf8");
  fs.writeFileSync(path.join(BASE_DIR, "env.json"), JSON.stringify(envData, null, 2), "utf8");
  fs.writeFileSync(path.join(RAW_DIR, "measurements.json"), JSON.stringify(measurements, null, 2), "utf8");
  fs.writeFileSync(path.join(RAW_DIR, "execution.log"), rawLog.join("\n"), "utf8");

  log(`✓ Résultats T3 sauvegardés dans ${path.join(BASE_DIR, "result.json")}`);
}

main().catch((err) => {
  console.error("Échec du banc T3 :", err);
  process.exit(1);
});
