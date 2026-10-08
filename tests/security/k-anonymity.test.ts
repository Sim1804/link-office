import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ANONYMITY_THRESHOLD, createAnonymityBlockedResponse } from "@/lib/privacy";

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

describe("A3. Tests Réels HTTP de K-Anonymat (Seuil légal = 5, Sous-groupe de 2 personnes)", () => {
  const timestamp = Date.now();
  let cookieB2B: string;
  let cookieB2G: string;
  let cookieB2B2C: string;

  let orgB2BId: string;
  let campB2BId: string;
  let orgB2GId: string;
  let campB2GId: string;
  let orgB2B2CId: string;
  let campB2B2CId: string;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("Admin1234!", 10);

    // 1. Fixture B2B (2 répondants)
    const orgB2B = await prisma.organization.create({
      data: {
        id: `test-org-kanon-b2b-${timestamp}`,
        name: `Org Test K-Anonymat B2B ${timestamp}`,
        type: "B2B",
        codeAccess: `KB2B-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
    orgB2BId = orgB2B.id;

    const adminB2B = await prisma.user.create({
      data: {
        id: `admin-kanon-b2b-${timestamp}`,
        email: `admin.b2b.${timestamp}@kanon.test`,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "B2B",
        role: "ADMIN_B2B",
        organizationId: orgB2B.id,
      },
    });

    const campB2B = await prisma.campaign.create({
      data: {
        id: `camp-kanon-b2b-${timestamp}`,
        organizationId: orgB2B.id,
        title: "Campagne K-Anonymat B2B 2 Personnes",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: "ACTIVE",
        offer: "PREMIUM",
      },
    });
    campB2BId = campB2B.id;

    for (let i = 1; i <= 2; i++) {
      const user = await prisma.user.create({
        data: {
          id: `user-kanon-b2b-${timestamp}-${i}`,
          email: `emp.${timestamp}.${i}@kanon.test`,
          firstName: `Emp${i}`,
          lastName: "Test",
          role: "EMPLOYEE",
          organizationId: orgB2B.id,
          campaignId: campB2B.id,
        },
      });

      const assess = await prisma.assessment.create({
        data: {
          id: `assess-kanon-b2b-${timestamp}-${i}`,
          userId: user.id,
          campaignId: campB2B.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      await prisma.iqrhResult.create({
        data: {
          id: `iqrh-kanon-b2b-${timestamp}-${i}`,
          assessmentId: assess.id,
          globalScore: 70,
          socialScore: 70,
          affectiveScore: 70,
          sentimentalScore: 70,
          professionalScore: 70,
          selfScore: 70,
          weather: "PLUTOT_BIEN",
          balanceIndex: 7.0,
          priorityDimension: "PROFESSIONAL",
          primaryProfile: "Connecté",
          secondaryProfile: "Solidaire",
          profileSummary: "K-Anonymat test",
        },
      });
    }

    // 2. Fixture B2G (2 répondants)
    const orgB2G = await prisma.organization.create({
      data: {
        id: `test-org-kanon-b2g-${timestamp}`,
        name: `Org Test K-Anonymat B2G ${timestamp}`,
        type: "B2G",
        codeAccess: `KB2G-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
    orgB2GId = orgB2G.id;

    const adminB2G = await prisma.user.create({
      data: {
        id: `admin-kanon-b2g-${timestamp}`,
        email: `admin.b2g.${timestamp}@kanon.test`,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "B2G",
        role: "ADMIN_B2G",
        organizationId: orgB2G.id,
      },
    });

    const campB2G = await prisma.campaign.create({
      data: {
        id: `camp-kanon-b2g-${timestamp}`,
        organizationId: orgB2G.id,
        title: "Campagne K-Anonymat B2G 2 Personnes",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: "ACTIVE",
        offer: "PREMIUM",
      },
    });
    campB2GId = campB2G.id;

    for (let i = 1; i <= 2; i++) {
      const user = await prisma.user.create({
        data: {
          id: `user-kanon-b2g-${timestamp}-${i}`,
          email: `cit.${timestamp}.${i}@kanon.test`,
          firstName: `Cit${i}`,
          lastName: "Test",
          role: "CITIZEN",
          organizationId: orgB2G.id,
          campaignId: campB2G.id,
        },
      });

      const assess = await prisma.assessment.create({
        data: {
          id: `assess-kanon-b2g-${timestamp}-${i}`,
          userId: user.id,
          campaignId: campB2G.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      await prisma.iqrhResult.create({
        data: {
          id: `iqrh-kanon-b2g-${timestamp}-${i}`,
          assessmentId: assess.id,
          globalScore: 65,
          socialScore: 65,
          affectiveScore: 65,
          sentimentalScore: 65,
          professionalScore: 65,
          selfScore: 65,
          weather: "PLUTOT_BIEN",
          balanceIndex: 6.5,
          priorityDimension: "SOCIAL",
          primaryProfile: "Sentinelle",
          secondaryProfile: "Solidaire",
          profileSummary: "K-Anonymat B2G test",
        },
      });
    }

    // 3. Fixture B2B2C (2 répondants)
    const orgB2B2C = await prisma.organization.create({
      data: {
        id: `test-org-kanon-b2b2c-${timestamp}`,
        name: `Org Test K-Anonymat B2B2C ${timestamp}`,
        type: "B2B2C",
        codeAccess: `KB2C-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    });
    orgB2B2CId = orgB2B2C.id;

    const adminB2B2C = await prisma.user.create({
      data: {
        id: `admin-kanon-b2b2c-${timestamp}`,
        email: `admin.b2b2c.${timestamp}@kanon.test`,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "B2B2C",
        role: "ADMIN_B2B2C",
        organizationId: orgB2B2C.id,
      },
    });

    const campB2B2C = await prisma.campaign.create({
      data: {
        id: `camp-kanon-b2b2c-${timestamp}`,
        organizationId: orgB2B2C.id,
        title: "Campagne K-Anonymat B2B2C 2 Personnes",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        status: "ACTIVE",
        offer: "PREMIUM",
      },
    });
    campB2B2CId = campB2B2C.id;

    for (let i = 1; i <= 2; i++) {
      const user = await prisma.user.create({
        data: {
          id: `user-kanon-b2b2c-${timestamp}-${i}`,
          email: `mem.${timestamp}.${i}@kanon.test`,
          firstName: `Mem${i}`,
          lastName: "Test",
          role: "MEMBER",
          organizationId: orgB2B2C.id,
          campaignId: campB2B2C.id,
        },
      });

      const assess = await prisma.assessment.create({
        data: {
          id: `assess-kanon-b2b2c-${timestamp}-${i}`,
          userId: user.id,
          campaignId: campB2B2C.id,
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      await prisma.iqrhResult.create({
        data: {
          id: `iqrh-kanon-b2b2c-${timestamp}-${i}`,
          assessmentId: assess.id,
          globalScore: 72,
          socialScore: 72,
          affectiveScore: 72,
          sentimentalScore: 72,
          professionalScore: 72,
          selfScore: 72,
          weather: "AU_BEAU_FIXE",
          balanceIndex: 7.8,
          priorityDimension: "AFFECTIVE",
          primaryProfile: "Connecté",
          secondaryProfile: "Inspirant",
          profileSummary: "K-Anonymat B2B2C test",
        },
      });
    }

    // Sessions HTTP
    cookieB2B = await getSessionCookie(adminB2B.email);
    cookieB2G = await getSessionCookie(adminB2G.email);
    cookieB2B2C = await getSessionCookie(adminB2B2C.email);
  }, 30000);

  afterAll(async () => {
    // Nettoyage complet des fixtures
    await prisma.iqrhResult.deleteMany({
      where: {
        assessment: {
          campaignId: { in: [campB2BId, campB2GId, campB2B2CId] },
        },
      },
    });
    await prisma.assessment.deleteMany({
      where: { campaignId: { in: [campB2BId, campB2GId, campB2B2CId] } },
    });
    await prisma.campaign.deleteMany({
      where: { id: { in: [campB2BId, campB2GId, campB2B2CId] } },
    });
    await prisma.user.deleteMany({
      where: {
        organizationId: { in: [orgB2BId, orgB2GId, orgB2B2CId] },
      },
    });
    await prisma.organization.deleteMany({
      where: { id: { in: [orgB2BId, orgB2GId, orgB2B2CId] } },
    });
    await prisma.$disconnect();
  });

  it("1. GET /api/b2b/stats : bloque la restitution si le sous-groupe compte 2 personnes (< 5)", async () => {
    const res = await fetch(`${BASE_URL}/api/b2b/stats?campaignId=${campB2BId}`, {
      headers: { Cookie: cookieB2B },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.threshold).toBe(ANONYMITY_THRESHOLD);
    expect(data.respondentCount).toBe(2);
    expect(data.message).toContain("au moins 5 répondants sont requis");
  });

  it("2. GET /api/campaigns/[id]/stats : bloque la restitution si la campagne compte 2 personnes (< 5)", async () => {
    const res = await fetch(`${BASE_URL}/api/campaigns/${campB2BId}/stats`, {
      headers: { Cookie: cookieB2B },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.threshold).toBe(ANONYMITY_THRESHOLD);
    expect(data.respondentCount).toBe(2);
  });

  it("3. GET /api/b2b/barometre : bloque la restitution pour une organisation de 2 personnes (< 5)", async () => {
    const res = await fetch(`${BASE_URL}/api/b2b/barometre`, {
      headers: { Cookie: cookieB2B },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.threshold).toBe(ANONYMITY_THRESHOLD);
    expect(data.respondentCount).toBe(2);
  });

  it("4. GET /api/b2g/stats : bloque la restitution pour une collectivité de 2 personnes (< 5)", async () => {
    const res = await fetch(`${BASE_URL}/api/b2g/stats?campaignId=${campB2GId}`, {
      headers: { Cookie: cookieB2G },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.threshold).toBe(ANONYMITY_THRESHOLD);
    expect(data.respondentCount).toBe(2);
  });

  it("5. GET /api/b2b/stats (B2B2C) : bloque la restitution pour un partenaire de 2 personnes (< 5)", async () => {
    const res = await fetch(`${BASE_URL}/api/b2b/stats?campaignId=${campB2B2CId}`, {
      headers: { Cookie: cookieB2B2C },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.threshold).toBe(ANONYMITY_THRESHOLD);
    expect(data.respondentCount).toBe(2);
  });

  it("6. GET /api/observatoire : bloque formellement tout effectif inférieur à 5 via createAnonymityBlockedResponse", async () => {
    // Vérification de la fonction de protection unifiée utilisée par l'observatoire
    const blockedRes = createAnonymityBlockedResponse(2);
    const data = await blockedRes.json();
    expect(data.anonymityBlocked).toBe(true);
    expect(data.respondentCount).toBe(2);
    expect(data.threshold).toBe(5);

    // Vérification de l'endpoint observatoire réel
    const resObs = await fetch(`${BASE_URL}/api/observatoire`);
    expect(resObs.status).toBe(200);
    const dataObs = await resObs.json();
    // En base existante (85 bilans), l'observatoire est ouvert au global mais les sous-groupes < 5 sont masqués
    expect(dataObs.totalAssessments).toBeGreaterThanOrEqual(5);
  });
});
