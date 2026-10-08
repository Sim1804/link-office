import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.TEST_APP_URL || "http://localhost:3000";

async function getSessionCookie(email: string): Promise<string> {
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfCookies = csrfRes.headers.getSetCookie();
  const csrfData = await csrfRes.json();

  const formData = new URLSearchParams();
  formData.append("email", email);
  formData.append("password", "Admin1234!");
  formData.append("csrfToken", csrfData.csrfToken);

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: csrfCookies.map((c) => c.split(";")[0]).join("; "),
    },
    body: formData.toString(),
    redirect: "manual",
  });

  const loginCookies = loginRes.headers.getSetCookie();
  return [...csrfCookies, ...loginCookies].map((c) => c.split(";")[0]).join("; ");
}

describe("Tests HTTP Réels des Failles Corrigées (Isolation Tenant, Upload & Webhooks)", { timeout: 20000 }, () => {
  let cookieAdminOrgA: string;
  let campaignOrgBId: string;
  let orgBCodeAccess: string;

  beforeAll(async () => {
    // 1. Session de l'Admin B2B chez Org A (Novatech Conseil)
    cookieAdminOrgA = await getSessionCookie("alice.dupont@novatech-conseil.fr");

    // 2. Trouver ou créer une campagne pour Org B (Avenir Santé)
    const orgB = await prisma.organization.findFirst({
      where: { name: { contains: "Avenir" } },
    });
    if (!orgB) throw new Error("Organisation B introuvable");
    orgBCodeAccess = orgB.codeAccess;

    let campaignB = await prisma.campaign.findFirst({
      where: { organizationId: orgB.id },
    });
    if (!campaignB) {
      campaignB = await prisma.campaign.create({
        data: {
          title: "Campagne Test Org B",
          organizationId: orgB.id,
          offer: "PREMIUM",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
        },
      });
    }
    campaignOrgBId = campaignB.id;
  }, 25000);

  it("1. v1/upload : rejet 401 si non authentifié", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["test-content"], { type: "image/png" }), "avatar.png");

    const res = await fetch(`${BASE_URL}/api/v1/upload`, {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(401);
  });

  it("2. v1/upload : rejet 400 si type de fichier non autorisé (ex: text/html)", async () => {
    const formData = new FormData();
    formData.append("file", new Blob(["<script>alert(1)</script>"], { type: "text/html" }), "evil.html");

    const res = await fetch(`${BASE_URL}/api/v1/upload`, {
      method: "POST",
      headers: { Cookie: cookieAdminOrgA },
      body: formData,
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Format de fichier non autorisé");
  });

  it("3. stripe/webhook : rejet 500 ou 400 en l'absence de signature valide (pas de fail-open)", async () => {
    const res = await fetch(`${BASE_URL}/api/stripe/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "checkout.session.completed" }),
    });
    // Sans header ou secret valide, la route doit impérativement rejeter
    expect([400, 500]).toContain(res.status);
  });

  it("4. campaigns/[id]/invites : rejet 403 en GET si la campagne appartient à une autre organisation", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/invites`, {
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Droits insuffisants");
  });

  it("5. campaigns/[id]/invites : rejet 403 en POST d'invitations sur une campagne d'une autre organisation", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/invites`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieAdminOrgA,
      },
      body: JSON.stringify({ emails: ["pirate@novatech.fr"] }),
    });
    expect(res.status).toBe(403);
  });

  it("6. campaigns/[id]/snapshot : rejet 403 en GET et POST sur une campagne tierce", async () => {
    const resGet = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/snapshot`, {
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(resGet.status).toBe(403);

    const resPost = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/snapshot`, {
      method: "POST",
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(resPost.status).toBe(403);
  });

  it("7. campaigns/[id]/close : rejet 403 si tentative de clôture d'une campagne tierce", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/close`, {
      method: "POST",
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(res.status).toBe(403);
  });

  it("8. campaigns/[id]/config & variables : rejet 403 en GET sur une organisation étrangère", async () => {
    const resConfig = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/config`, {
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(resConfig.status).toBe(403);

    const resVars = await fetch(`${BASE_URL}/api/campaigns/${campaignOrgBId}/variables`, {
      headers: { Cookie: cookieAdminOrgA },
    });
    expect(resVars.status).toBe(403);
  });

  it("9. campaigns/join : rejet 403 si un utilisateur déjà rattaché tente de changer d'organisation", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieAdminOrgA,
      },
      body: JSON.stringify({ codeAccess: orgBCodeAccess }),
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("déjà rattaché à une autre organisation");
  });
});
