import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocking prisma & auth
vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      user: {
        findUnique: vi.fn(),
        count: vi.fn(),
      },
      campaign: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      assessment: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      actionItem: {
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      iqrhResult: {
        findMany: vi.fn(),
      },
    },
  };
});

vi.mock("@/lib/auth", () => {
  return {
    auth: vi.fn(),
  };
});

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { GET as getB2BStats } from "../../app/api/b2b/stats/route";
import { GET as getCampaignStats } from "../../app/api/campaigns/[id]/stats/route";
import { GET as getCampaignExport } from "../../app/api/campaigns/[id]/export/route";
import { PATCH as patchAction, DELETE as deleteAction } from "../../app/api/actions/[id]/route";
import { GET as getAdminUsersExport } from "../../app/api/admin/users/export/route";
import { GET as getUserOrdonnance } from "../../app/api/ordonnances/[userId]/route";
import { GET as getUserResultats } from "../../app/api/resultats/[userId]/route";

describe("Audit et Isolation Multi-Tenant (Cross-Tenant Access Tests)", () => {
  const userOrgA = {
    id: "user-org-a-1",
    role: "ADMIN_B2B",
    organizationId: "org-alpha-123",
  };

  const campaignOrgB = {
    id: "campaign-org-b-456",
    organizationId: "org-beta-789",
    title: "Campagne Organisation B",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. b2b/stats : un admin de l'Org A tentant de lire les stats d'une campagne de l'Org B reçoit un statut 403", async () => {
    vi.mocked(auth).mockResolvedValue({ user: userOrgA } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userOrgA as any);
    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaignOrgB as any);

    const req = new Request("http://localhost/api/b2b/stats?campaignId=campaign-org-b-456");
    const res = await getB2BStats(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Accès refusé");
  });

  it("2. campaigns/[id]/stats : un admin de l'Org A ciblant la campagne de l'Org B reçoit un 403", async () => {
    vi.mocked(auth).mockResolvedValue({ user: userOrgA } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userOrgA as any);
    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaignOrgB as any);

    const req = new Request("http://localhost/api/campaigns/campaign-org-b-456/stats");
    const res = await getCampaignStats(req as any, { params: Promise.resolve({ id: "campaign-org-b-456" }) });

    expect(res.status).toBe(403);
  });

  it("3. campaigns/[id]/export : un admin de l'Org A tentant d'exporter une campagne de l'Org B reçoit un 403", async () => {
    vi.mocked(auth).mockResolvedValue({ user: userOrgA } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userOrgA as any);
    vi.mocked(prisma.campaign.findUnique).mockResolvedValue(campaignOrgB as any);

    const req = new Request("http://localhost/api/campaigns/campaign-org-b-456/export");
    const res = await getCampaignExport(req as any, { params: Promise.resolve({ id: "campaign-org-b-456" }) });

    expect(res.status).toBe(403);
  });

  it("4. actions/[id] (PATCH & DELETE) : un admin de l'Org A ciblant une action de l'Org B reçoit un 404 (non trouvé ou non autorisé)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: userOrgA } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(userOrgA as any);
    vi.mocked(prisma.actionItem.findUnique).mockResolvedValue({
      id: "action-org-b-999",
      organizationId: "org-beta-789",
    } as any);

    const patchReq = new Request("http://localhost/api/actions/action-org-b-999", {
      method: "PATCH",
      body: JSON.stringify({ title: "Attaque cross-tenant" }),
    });
    const patchRes = await patchAction(patchReq, { params: Promise.resolve({ id: "action-org-b-999" }) });
    expect(patchRes.status).toBe(404);

    const deleteReq = new Request("http://localhost/api/actions/action-org-b-999", {
      method: "DELETE",
    });
    const deleteRes = await deleteAction(deleteReq, { params: Promise.resolve({ id: "action-org-b-999" }) });
    expect(deleteRes.status).toBe(404);
  });

  it("5. admin/users/export : toute requête non authentifiée ou non SUPER_ADMIN est rejetée avec un statut 403", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const resUnauth = await getAdminUsersExport();
    expect(resUnauth.status).toBe(403);

    vi.mocked(auth).mockResolvedValue({ user: userOrgA } as any);
    const resForbidden = await getAdminUsersExport();
    expect(resForbidden.status).toBe(403);
  });

  it("6. ordonnances/[userId] : un utilisateur A ne peut pas lire l'ordonnance relationnelle d'un utilisateur B (403)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-alice", role: "EMPLOYEE" } } as any);

    const req = new Request("http://localhost/api/ordonnances/user-bob");
    const res = await getUserOrdonnance(req, { params: Promise.resolve({ userId: "user-bob" }) });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toContain("Interdit");
  });

  it("7. resultats/[userId] : un utilisateur A ne peut pas lire le bilan IQRH d'un utilisateur B (403)", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-alice", role: "EMPLOYEE" } } as any);

    const req = new Request("http://localhost/api/resultats/user-bob");
    const res = await getUserResultats(req, { params: Promise.resolve({ userId: "user-bob" }) });

    expect(res.status).toBe(403);
  });
});
