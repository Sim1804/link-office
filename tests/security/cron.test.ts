import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateCronSecret } from "../../src/lib/cron";

describe("Validation Sécurisée des Tâches Cron (src/lib/cron.ts)", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "secret-super-robuste-linkoffice-2026";
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  it("rejette la requête si CRON_SECRET n'est pas configuré sur le serveur", () => {
    delete process.env.CRON_SECRET;
    const req = new Request("http://localhost/api/cron/campaigns", {
      headers: { authorization: "Bearer secret-super-robuste-linkoffice-2026" },
    });
    expect(validateCronSecret(req)).toBe(false);
  });

  it("rejette la requête si aucun en-tête Authorization n'est fourni", () => {
    const req = new Request("http://localhost/api/cron/campaigns");
    expect(validateCronSecret(req)).toBe(false);
  });

  it("rejette la requête si l'en-tête ne commence pas par 'Bearer '", () => {
    const req = new Request("http://localhost/api/cron/campaigns", {
      headers: { authorization: "Basic secret-super-robuste-linkoffice-2026" },
    });
    expect(validateCronSecret(req)).toBe(false);
  });

  it("rejette la requête si le secret a une longueur différente", () => {
    const req = new Request("http://localhost/api/cron/campaigns", {
      headers: { authorization: "Bearer court" },
    });
    expect(validateCronSecret(req)).toBe(false);
  });

  it("rejette la requête si le secret a la même longueur mais un contenu faux", () => {
    const fake = "secret-super-robuste-linkoffice-2027"; // 1 char diff
    const req = new Request("http://localhost/api/cron/campaigns", {
      headers: { authorization: `Bearer ${fake}` },
    });
    expect(validateCronSecret(req)).toBe(false);
  });

  it("accepte la requête lorsque l'en-tête Authorization: Bearer correspond strictement au secret", () => {
    const req = new Request("http://localhost/api/cron/campaigns", {
      headers: { authorization: "Bearer secret-super-robuste-linkoffice-2026" },
    });
    expect(validateCronSecret(req)).toBe(true);
  });
});
