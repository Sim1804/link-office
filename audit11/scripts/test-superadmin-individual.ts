import fs from "fs";
import { prisma } from "../../src/lib/prisma";

async function main() {
  console.log("=== TEST C3 : SUPER_ADMIN ET RÉSULTATS INDIVIDUELS CROSS-TENANT ===");

  // Trouver un SUPER_ADMIN
  const superAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true, role: true, organizationId: true },
  });

  // Trouver un salarié (EMPLOYEE) avec organisation et bilan complété
  const employee = await prisma.user.findFirst({
    where: {
      role: "EMPLOYEE",
      organizationId: { not: null },
      assessments: { some: { status: "SUBMITTED", result: { isNot: null } } },
    },
    include: {
      assessments: {
        where: { status: "SUBMITTED", result: { isNot: null } },
        include: { result: true },
      },
      organization: true,
    },
  });

  if (!superAdmin || !employee) {
    throw new Error("Fixtures introuvables pour SUPER_ADMIN ou EMPLOYEE !");
  }

  const assessment = employee.assessments[0];
  console.log("Acteur SUPER_ADMIN :", { id: superAdmin.id, email: superAdmin.email, orgId: superAdmin.organizationId });
  console.log("Cible EMPLOYEE (Org A) :", { id: employee.id, email: employee.email, orgName: employee.organization?.name, orgId: employee.organizationId });
  console.log("Assessment Cible :", { id: assessment.id, resultId: assessment.result?.id });

  // Analyse directe des clauses de code
  const routes = [
    {
      name: "GET /api/resultats/[userId]",
      path: "app/api/resultats/[userId]/route.ts",
      lines: "L39-L41",
      clause: 'if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN")',
      behavior: "SUPER_ADMIN est explicitement exempté et obtient les résultats complets (IQRH + ICR + Profils) de l'employé.",
      allowsCrossTenantSuperAdmin: true,
    },
    {
      name: "GET /api/ordonnances/[userId]",
      path: "app/api/ordonnances/[userId]/route.ts",
      lines: "L38-L40",
      clause: 'if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN")',
      behavior: "SUPER_ADMIN est explicitement exempté et obtient l'ordonnance relationnelle confidentielle de l'employé.",
      allowsCrossTenantSuperAdmin: true,
    },
    {
      name: "GET /api/assessment/[id]/prescription",
      path: "app/api/assessment/[id]/prescription/route.ts",
      lines: "L62-L64",
      clause: 'if (session.user.id !== targetUserId && session.user.role !== "SUPER_ADMIN")',
      behavior: "SUPER_ADMIN est explicitement exempté et obtient la prescription liée à l'évaluation de l'employé.",
      allowsCrossTenantSuperAdmin: true,
    },
  ];

  console.log("\nRoutes où SUPER_ADMIN obtient les données individuelles d'une autre organisation :");
  for (const r of routes) {
    console.log(`- ${r.name} (${r.path} ${r.lines}) : ${r.clause}`);
  }

  fs.mkdirSync("audit11/raw", { recursive: true });
  fs.writeFileSync(
    "audit11/raw/C3_superadmin.json",
    JSON.stringify(
      {
        superAdmin: { id: superAdmin.id, email: superAdmin.email },
        targetEmployee: { id: employee.id, email: employee.email, orgId: employee.organizationId },
        targetAssessmentId: assessment.id,
        routes,
      },
      null,
      2
    ),
    "utf8"
  );
  console.log("\n✓ Enregistré dans audit11/raw/C3_superadmin.json");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
