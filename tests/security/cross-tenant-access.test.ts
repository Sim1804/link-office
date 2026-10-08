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

describe("Tests de Sécurité Cross-Tenant par Requêtes HTTP Réelles (Next.js & PostgreSQL)", () => {
  let cookieAliceOrgA: string;
  let testActionIdOrgB: string;
  let userOrgBId: string;
  let orgBId: string;

  beforeAll(async () => {
    // 1. Session HTTP authentifiée pour Alice Dupont (ADMIN_B2B chez Novatech Conseil - Org A)
    cookieAliceOrgA = await getSessionCookie("alice.dupont@novatech-conseil.fr");

    // 2. Récupération d'une organisation distincte (Org B - Mutuelle Avenir Santé)
    const orgB = await prisma.organization.findFirst({
      where: { name: { contains: "Avenir" } },
    });
    if (!orgB) throw new Error("Organisation B introuvable en base");
    orgBId = orgB.id;

    // 3. Récupération d'un utilisateur cible appartenant à Org B
    const memberOrgB = await prisma.user.findFirst({
      where: { organizationId: orgBId, role: "MEMBER" },
    });
    if (!memberOrgB) throw new Error("Utilisateur de l'Organisation B introuvable en base");
    userOrgBId = memberOrgB.id;

    // 4. Création d'une action réelle pour Org B
    const actionB = await prisma.actionItem.create({
      data: {
        organizationId: orgBId,
        title: "Action confidentielle Avenir Santé",
        description: "Données cloisonnées Org B",
        status: "PROPOSEE",
        priority: "HIGH",
        dimension: "PROFESSIONAL",
        updatedAt: new Date(),
      },
    });
    testActionIdOrgB = actionB.id;
  }, 20000);

  afterAll(async () => {
    if (testActionIdOrgB) {
      await prisma.actionItem.deleteMany({ where: { id: testActionIdOrgB } });
    }
    await prisma.$disconnect();
  });

  it("1. GET /api/b2b/stats : un admin de l'Org A ciblant la campagne de l'Org B reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/b2b/stats?campaignId=camp-avenirsante-2026`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Accès refusé");
  });

  it("2. GET /api/campaigns/[id]/stats : un admin de l'Org A ciblant la campagne de l'Org B reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/camp-avenirsante-2026/stats`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("Accès refusé");
  });

  it("3. GET /api/campaigns/[id]/export : un admin de l'Org A ciblant la campagne de l'Org B reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/camp-avenirsante-2026/export`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
  });

  it("4. PATCH /api/actions/[id] : un admin de l'Org A tentant de modifier une action de l'Org B reçoit un HTTP 404 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/actions/${testActionIdOrgB}`, {
      method: "PATCH",
      headers: {
        Cookie: cookieAliceOrgA,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Attaque cross-tenant réussie" }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/Action introuvable ou non autorisée/);
  });

  it("5. DELETE /api/actions/[id] : un admin de l'Org A tentant de supprimer une action de l'Org B reçoit un HTTP 404 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/actions/${testActionIdOrgB}`, {
      method: "DELETE",
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toMatch(/Action introuvable ou non autorisée/);
  });

  it("6. GET /api/admin/users/export : un admin d'organisation tentant d'exporter tous les utilisateurs reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users/export`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("SUPER_ADMIN requis");
  });

  it("7. GET /api/ordonnances/[userId] : un tiers tentant de lire l'ordonnance relationnelle d'un autre utilisateur reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/ordonnances/${userOrgBId}`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Interdit");
  });

  it("8. GET /api/resultats/[userId] : un tiers tentant de lire le résultat IQRH d'un autre utilisateur reçoit un HTTP 403 réel", async () => {
    const res = await fetch(`${BASE_URL}/api/resultats/${userOrgBId}`, {
      headers: { Cookie: cookieAliceOrgA },
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain("Interdit");
  });
});
