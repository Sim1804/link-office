/**
 * @file generate-expected-status.ts
 * @description Génère expected-status.json STRICTEMENT depuis la spécification
 * de docs/CORRECTIONS.md (Section A2). Aucune lecture du code des handlers.
 */

import fs from "fs";
import path from "path";

const SPEC_ROUTES: Record<
  string,
  {
    methods: string[];
    authRequired: boolean;
    rolesAllowed: string[];
    tenantSource: string;
    verified: boolean;
  }
> = {
  "/api/actions/export": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/actions": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/actions/suggest": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/actions/[id]": {
    methods: ["PATCH", "DELETE"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/admin/barometre": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/campaigns": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/catalog/import": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/catalog": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/catalog/[id]": {
    methods: ["PUT", "DELETE"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/admin/leads": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/leads/[id]/convert": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/admin/media/[id]": {
    methods: ["DELETE"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/organizations": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/admin/organizations/[id]": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/admin/users/export": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/auth/2fa/enable": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/auth/2fa/generate": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/auth/change-password": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/auth/register": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["EMPLOYEE", "CITIZEN", "MEMBER"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/auth/verify": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/auth/[...nextauth]": {
    methods: ["GET", "POST"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/b2b/barometre": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "EMPLOYEE"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/b2b/invite": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/b2b/organization/by-code/[code]": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/b2b/organization": {
    methods: ["GET", "POST", "PUT"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/b2b/stats": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Query Param (campaignId) + Session Org",
    verified: true,
  },
  "/api/b2b2c/orientation": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/b2g/stats": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/binome/invite": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "EMPLOYEE", "CITIZEN", "MEMBER"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/preferences": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "EMPLOYEE"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/respond": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "EMPLOYEE", "CITIZEN", "MEMBER"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/settings": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "EMPLOYEE"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/status": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/suggest": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "EMPLOYEE", "CITIZEN", "MEMBER"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/[id]/checkin": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/binome/[id]/feedback": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/campaigns/join": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/campaigns": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/campaigns/[id]/close": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/campaigns/[id]/config": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]/export": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]/invites": {
    methods: ["GET", "POST", "DELETE"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2G"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/campaigns/[id]/participation": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]/renew": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]": {
    methods: ["GET", "PATCH"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]/snapshot": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2G"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/campaigns/[id]/stats": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/campaigns/[id]/variables": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Session (session.user.organizationId)",
    verified: true,
  },
  "/api/carnet/journal": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet/journal/[id]": {
    methods: ["PUT", "DELETE"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet/life-events": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet/meteo": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet/plan": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet/relations": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/carnet": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/cron/binome": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["CRON_SECRET"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/cron/campaigns": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["CRON_SECRET"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/cron/close-campaigns": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["CRON_SECRET"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/demographics/renew": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/gamification/complete": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/iris/conversation": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/iris/conversation/active": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/iris/conversation/[id]/message": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/iris/explication": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/notifications": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/observatoire": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/ordonnances/[userId]": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "RESOURCE_OWNER"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/profile/change-situation": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/questionnaire/save": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/questionnaire/start": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/questionnaire/submit": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/questions": {
    methods: ["GET"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/resultats/[userId]": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "RESOURCE_OWNER"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/stripe/checkout": {
    methods: ["POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/stripe/webhook": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["STRIPE_SIGNATURE"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/superadmin/organizations": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN", "ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/superadmin/users": {
    methods: ["GET"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/superadmin/users/[id]": {
    methods: ["PATCH", "DELETE"],
    authRequired: true,
    rolesAllowed: ["SUPER_ADMIN"],
    tenantSource: "URL Param (resourceId)",
    verified: true,
  },
  "/api/v1/business/lead": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/v1/business/register": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_B2G"],
    tenantSource: "Body/Param (codeAccess)",
    verified: true,
  },
  "/api/v1/demographics": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/v1/upload": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/v1/user/settings": {
    methods: ["GET", "POST"],
    authRequired: true,
    rolesAllowed: ["ALL_AUTHENTICATED"],
    tenantSource: "N/A",
    verified: true,
  },
  "/api/v1/users/register": {
    methods: ["POST"],
    authRequired: false,
    rolesAllowed: ["PUBLIC"],
    tenantSource: "N/A",
    verified: true,
  },
};

export function getExpectedStatus(
  endpoint: string,
  method: string,
  identity: "ANONYMOUS" | "B2C" | "EMPLOYEE" | "ORG_ADMIN" | "CROSS_ADMIN" | "SUPER_ADMIN"
): string {
  const spec = SPEC_ROUTES[endpoint];
  if (!spec) {
    return "UNSPECIFIED";
  }

  const isTenantScoped =
    spec.tenantSource.includes("Session") || spec.tenantSource.includes("URL Param");

  // SUPER_ADMIN est toujours autorisé
  if (identity === "SUPER_ADMIN") {
    return "2xx";
  }

  // ANONYMOUS
  if (identity === "ANONYMOUS") {
    if (spec.authRequired) return "401";
    if (spec.rolesAllowed.includes("CRON_SECRET")) return "401_OR_403";
    if (spec.rolesAllowed.includes("STRIPE_SIGNATURE")) return "400_OR_500";
    return "2xx_OR_4xx_INPUT";
  }

  // B2C (Utilisateur sans organisation)
  if (identity === "B2C") {
    if (!spec.authRequired) return "2xx_OR_4xx_INPUT";
    if (
      spec.rolesAllowed.includes("ALL_AUTHENTICATED") ||
      spec.rolesAllowed.includes("CITIZEN") ||
      spec.rolesAllowed.includes("MEMBER")
    ) {
      return "2xx";
    }
    return "403";
  }

  // EMPLOYEE (Salarié Org A)
  if (identity === "EMPLOYEE") {
    if (!spec.authRequired) return "2xx_OR_4xx_INPUT";
    if (
      spec.rolesAllowed.includes("ALL_AUTHENTICATED") ||
      spec.rolesAllowed.includes("EMPLOYEE") ||
      spec.rolesAllowed.includes("RESOURCE_OWNER") // Alice Martin est le propriétaire de la ressource cmuyj285o0006v6h8ag9v5fzw
    ) {
      return "2xx";
    }
    return "403";
  }

  // ORG_ADMIN (Admin Org A sur ressources Org A)
  if (identity === "ORG_ADMIN") {
    if (!spec.authRequired) return "2xx_OR_4xx_INPUT";
    if (
      spec.rolesAllowed.includes("ALL_AUTHENTICATED") ||
      spec.rolesAllowed.includes("ADMIN_B2B") ||
      spec.rolesAllowed.includes("EMPLOYEE")
    ) {
      return "2xx";
    }
    return "403";
  }

  // CROSS_ADMIN (Admin Org B sur ressources Org A)
  if (identity === "CROSS_ADMIN") {
    if (!spec.authRequired) return "2xx_OR_4xx_INPUT";
    if (isTenantScoped) {
      // Ressource isolée : rejet strict 403 ou 404
      return "403_OR_404";
    }
    if (spec.rolesAllowed.includes("ADMIN_B2B") || spec.rolesAllowed.includes("ALL_AUTHENTICATED")) {
      return "2xx";
    }
    return "403";
  }

  return "UNSPECIFIED";
}
