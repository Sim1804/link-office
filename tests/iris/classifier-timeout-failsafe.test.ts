import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateInputSafetyCascaded, classifyWithLLM } from "@/lib/iris/safety";

describe("C2 — Classifieur de sécurité : Délai et Repli Fermé (E06)", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.GROQ_API_KEY = "gsk_test_mock_key_for_unit_tests";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("Condition 1 : Expiration du délai (Timeout / AbortError) → Repli fermé 3114/15", async () => {
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        const signal = options?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    });

    // Timeout très court pour déclencher l'abort immédiatement
    process.env.IRIS_CLASSIFIER_TIMEOUT_MS = "50";

    const res = await evaluateInputSafetyCascaded("Message à tester sous timeout");
    expect(res.safe).toBe(false);
    expect(res.category).toBe("CRISIS");
    expect(res.failSafe).toBe(true);
    expect(res.escalationResponse).toContain("3114");
    expect(res.escalationResponse).toContain("15");
  });

  it("Condition 2 : Erreur API serveur (HTTP 500) → Repli fermé 3114/15", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    } as unknown as Response);

    const res = await evaluateInputSafetyCascaded("Message neutre sous erreur serveur");
    expect(res.safe).toBe(false);
    expect(res.category).toBe("CRISIS");
    expect(res.failSafe).toBe(true);
    expect(res.escalationResponse).toContain("3114");
    expect(res.escalationResponse).toContain("15");
  });

  it("Condition 3 : Erreur HTTP 429 (Rate Limit / Quota LLM épuisé) → Repli fermé 3114/15", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => JSON.stringify({ error: { message: "Rate limit reached" } }),
    } as unknown as Response);

    const res = await evaluateInputSafetyCascaded("Message neutre sous HTTP 429");
    expect(res.safe).toBe(false);
    expect(res.category).toBe("CRISIS");
    expect(res.failSafe).toBe(true);
    expect(res.escalationResponse).toContain("3114");
    expect(res.escalationResponse).toContain("15");
  });

  it("Condition 4 : Confiance insuffisante du modèle (< 0.70) → Repli fermé 3114/15", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isCrisis: false,
                isMedical: false,
                isJailbreak: false,
                confidence: 0.55, // Inférieur au seuil de 0.70
                reasoning: "Doute sur l'interprétation",
              }),
            },
          },
        ],
      }),
    } as unknown as Response);

    const res = await evaluateInputSafetyCascaded("Message avec formulation ambiguë");
    expect(res.safe).toBe(false);
    expect(res.category).toBe("CRISIS");
    expect(res.failSafe).toBe(true);
    expect(res.escalationResponse).toContain("3114");
    expect(res.escalationResponse).toContain("15");
  });

  it("Condition 5 : Erreur d'analyse JSON (Parse Error / Sortie invalide) → Repli fermé 3114/15", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "SORTIE_BRUTE_NON_JSON_CORROMPUE",
            },
          },
        ],
      }),
    } as unknown as Response);

    const res = await evaluateInputSafetyCascaded("Message sous parse error");
    expect(res.safe).toBe(false);
    expect(res.category).toBe("CRISIS");
    expect(res.failSafe).toBe(true);
    expect(res.escalationResponse).toContain("3114");
    expect(res.escalationResponse).toContain("15");
  });

  it("Vérification : Le timeout est configurable via IRIS_CLASSIFIER_TIMEOUT_MS au lieu de 1500ms fixe", async () => {
    // Si IRIS_CLASSIFIER_TIMEOUT_MS est défini à 200ms, l'appel abort après 200ms
    let abortDelay = 0;
    const start = Date.now();

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        const signal = options?.signal as AbortSignal | undefined;
        if (signal) {
          signal.addEventListener("abort", () => {
            abortDelay = Date.now() - start;
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        }
      });
    });

    process.env.IRIS_CLASSIFIER_TIMEOUT_MS = "200";

    await expect(classifyWithLLM("Message test")).rejects.toThrow();
    // Le délai d'abort doit être proche de 200ms (et très inférieur à 1500ms)
    expect(abortDelay).toBeGreaterThanOrEqual(150);
    expect(abortDelay).toBeLessThan(1000);
  });
});
