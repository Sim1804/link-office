import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

// Mock de l'authentification
let currentSessionUser: { id: string; role: string } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => {
    if (!currentSessionUser) return null;
    return { user: currentSessionUser };
  }),
}));

// Import dynamique ou relatif de la route
import { GET as getAssessmentPrescription } from "../../app/api/assessment/[id]/prescription/route";
import { GET as getOrdonnance } from "../../app/api/ordonnances/[userId]/route";

describe("C6 — Limite Freemium appliquée côté serveur (T7.3)", () => {
  const testSuffix = Date.now();
  const freemiumUserId = `c6_free_user_${testSuffix}`;
  const premiumUserId = `c6_prem_user_${testSuffix}`;
  const expiredCampaignUserId = `c6_exp_user_${testSuffix}`;
  const orgId = `c6_org_${testSuffix}`;
  const expiredCampaignId = `c6_exp_camp_${testSuffix}`;

  const libraryItemIds: string[] = [];
  const prescriptionIds: string[] = [];
  const assessmentIds: string[] = [];

  beforeEach(() => {
    currentSessionUser = null;
  });

  afterAll(async () => {
    // Nettoyage complet
    for (const pid of prescriptionIds) {
      await prisma.prescriptionItem.deleteMany({ where: { prescriptionId: pid } });
      await prisma.relationalPrescription.deleteMany({ where: { id: pid } });
    }
    for (const aid of assessmentIds) {
      await prisma.iqrhResult.deleteMany({ where: { assessmentId: aid } });
      await prisma.assessment.deleteMany({ where: { id: aid } });
    }
    for (const lid of libraryItemIds) {
      await prisma.libraryItem.deleteMany({ where: { id: lid } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [freemiumUserId, premiumUserId, expiredCampaignUserId] } },
    });
    await prisma.campaign.deleteMany({ where: { id: expiredCampaignId } });
    await prisma.organization.deleteMany({ where: { id: orgId } });
  });

  async function createTestPrescription(userId: string, assessmentId: string, prescriptionId: string) {
    assessmentIds.push(assessmentId);
    prescriptionIds.push(prescriptionId);

    const assessment = await prisma.assessment.create({
      data: {
        id: assessmentId,
        userId,
        status: "SUBMITTED",
      },
    });

    const iqrhResult = await prisma.iqrhResult.create({
      data: {
        id: `c6_res_${assessmentId}`,
        assessmentId: assessment.id,
        globalScore: 65,
        socialScore: 60,
        affectiveScore: 65,
        sentimentalScore: 70,
        professionalScore: 60,
        selfScore: 65,
        weather: "Éclaircies",
        balanceIndex: 10,
        priorityDimension: "SOCIAL",
        strengths: [],
        watchpoints: [],
        primaryProfile: "Profil A",
        secondaryProfile: "Profil B",
        profileSummary: "Résumé profil",
      },
    });

    // Créer 5 LibraryItems Recommandation et 5 Micro-défis
    const itemsToCreate = [];
    for (let i = 1; i <= 5; i++) {
      const recoId = `c6_lib_reco_${assessmentId}_${i}`;
      libraryItemIds.push(recoId);
      await prisma.libraryItem.upsert({
        where: { id: recoId },
        create: {
          id: recoId,
          library: "Recommandations",
          title: `Recommandation ${i}`,
          data: { dimensions_ciblees: "Relations sociales" },
        },
        update: {},
      });
      itemsToCreate.push({
        libraryItemId: recoId,
        kind: "RECOMMENDATION",
        position: i,
        rationale: `Raison reco ${i}`,
      });
    }

    for (let j = 1; j <= 5; j++) {
      const defiId = `c6_lib_defi_${assessmentId}_${j}`;
      libraryItemIds.push(defiId);
      await prisma.libraryItem.upsert({
        where: { id: defiId },
        create: {
          id: defiId,
          library: "Micro-défis",
          title: `Micro-défi ${j}`,
          data: { dimensions_ciblees: "Relations sociales" },
        },
        update: {},
      });
      itemsToCreate.push({
        libraryItemId: defiId,
        kind: "MICRO_CHALLENGE",
        position: 5 + j,
        rationale: `Raison défi ${j}`,
      });
    }

    return prisma.relationalPrescription.create({
      data: {
        id: prescriptionId,
        userId,
        iqrhResultId: iqrhResult.id,
        title: "Ordonnance Test C6",
        summary: "Sommaire",
        priorityDimension: "SOCIAL",
        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });
  }

  it("1. Un compte Freemium reçoit au plus 3 recommandations et 3 micro-défis côté serveur", async () => {
    await prisma.user.create({
      data: {
        id: freemiumUserId,
        email: `c6_free_${testSuffix}@example.com`,
        firstName: "Freemium",
        lastName: "User",
        subscription: "FREEMIUM",
      },
    });

    const pres = await createTestPrescription(
      freemiumUserId,
      `c6_ass_free_${testSuffix}`,
      `c6_pres_free_${testSuffix}`
    );
    // Vérification de la persistance : la base contient bien 10 items (5 + 5)
    expect(pres.items.length).toBe(10);

    currentSessionUser = { id: freemiumUserId, role: "EMPLOYEE" };

    const req = new Request(`http://localhost:3000/api/assessment/${freemiumUserId}/prescription`);
    const res = await getAssessmentPrescription(req, {
      params: Promise.resolve({ id: freemiumUserId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const recos = data.recommendations || data.prescription?.items?.filter((i: any) => i.kind === "RECOMMENDATION");
    const defis = data.microDefis || data.prescription?.items?.filter((i: any) => i.kind === "MICRO_CHALLENGE");

    expect(recos.length).toBe(3);
    expect(defis.length).toBe(3);

    // Vérifier aussi sur la route d'ordonnance existante
    const ordReq = new Request(`http://localhost:3000/api/ordonnances/${freemiumUserId}`);
    const ordRes = await getOrdonnance(ordReq, {
      params: Promise.resolve({ userId: freemiumUserId }),
    });
    expect(ordRes.status).toBe(200);
    const ordData = await ordRes.json();
    const ordRecos = ordData.prescription.items.filter((i: any) => i.kind === "RECOMMENDATION");
    const ordDefis = ordData.prescription.items.filter((i: any) => i.kind === "MICRO_CHALLENGE");
    expect(ordRecos.length).toBe(3);
    expect(ordDefis.length).toBe(3);
  });

  it("2. Un compte Premium reçoit l'intégralité des recommandations et micro-défis (5 + 5)", async () => {
    await prisma.user.create({
      data: {
        id: premiumUserId,
        email: `c6_prem_${testSuffix}@example.com`,
        firstName: "Premium",
        lastName: "User",
        subscription: "PREMIUM",
      },
    });

    await createTestPrescription(
      premiumUserId,
      `c6_ass_prem_${testSuffix}`,
      `c6_pres_prem_${testSuffix}`
    );

    currentSessionUser = { id: premiumUserId, role: "EMPLOYEE" };

    const req = new Request(`http://localhost:3000/api/assessment/${premiumUserId}/prescription`);
    const res = await getAssessmentPrescription(req, {
      params: Promise.resolve({ id: premiumUserId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const recos = data.recommendations || data.prescription?.items?.filter((i: any) => i.kind === "RECOMMENDATION");
    const defis = data.microDefis || data.prescription?.items?.filter((i: any) => i.kind === "MICRO_CHALLENGE");

    expect(recos.length).toBe(5);
    expect(defis.length).toBe(5);
  });

  it("3. Un compte dont la campagne a expiré est traité comme Freemium (3 + 3)", async () => {
    await prisma.organization.create({
      data: {
        id: orgId,
        name: `Org C6 ${testSuffix}`,
        type: "B2B",
        codeAccess: `CODE_${testSuffix}`,
      },
    });

    // Campagne expirée hier
    const pastDate = new Date(Date.now() - 24 * 3600 * 1000);
    await prisma.campaign.create({
      data: {
        id: expiredCampaignId,
        organizationId: orgId,
        title: "Campagne Expirée",
        startDate: new Date(Date.now() - 30 * 24 * 3600 * 1000),
        endDate: pastDate,
        offer: "PREMIUM",
        status: "CLOSED",
      },
    });

    await prisma.user.create({
      data: {
        id: expiredCampaignUserId,
        email: `c6_exp_${testSuffix}@example.com`,
        firstName: "Expired",
        lastName: "User",
        subscription: "PREMIUM", // subscription porte PREMIUM mais campagne expirée en base
        campaignId: expiredCampaignId,
        organizationId: orgId,
      },
    });

    await createTestPrescription(
      expiredCampaignUserId,
      `c6_ass_exp_${testSuffix}`,
      `c6_pres_exp_${testSuffix}`
    );

    currentSessionUser = { id: expiredCampaignUserId, role: "EMPLOYEE" };

    const req = new Request(`http://localhost:3000/api/assessment/${expiredCampaignUserId}/prescription`);
    const res = await getAssessmentPrescription(req, {
      params: Promise.resolve({ id: expiredCampaignUserId }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    const recos = data.recommendations || data.prescription?.items?.filter((i: any) => i.kind === "RECOMMENDATION");
    const defis = data.microDefis || data.prescription?.items?.filter((i: any) => i.kind === "MICRO_CHALLENGE");

    expect(recos.length).toBe(3);
    expect(defis.length).toBe(3);
  });
});
