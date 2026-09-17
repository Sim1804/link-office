import { NextResponse } from "next/server";
import { getMobileUser } from "@/lib/mobile-auth";
import { QuestionnaireService } from "@/lib/iqrh/questionnaire-service";
import { prisma } from "@/lib/prisma";

// The labels shown in the mobile demographics screen deliberately include a
// duration for clarity, while the seeded module triggers use the canonical
// situation name. Resolve those labels before querying the modules.
const MODULE_TRIGGER_BY_SITUATION: Record<string, string> = {
  "Création d'entreprise (moins de 3 ans)": "Création d'entreprise",
  "Divorce ou séparation récente (moins de 2 ans)": "Divorce / séparation récente",
  "Deuil récent (moins de 2 ans)": "Deuil récent",
};

export async function POST(request: Request) {
  const user = await getMobileUser(request);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const assessment = await QuestionnaireService.start(user.id);
  const demographic = await prisma.demographicProfile.findUnique({
    where: { assessmentId: assessment.id },
    select: { selectedSituations: true },
  });
  const selectedSituations = demographic?.selectedSituations ?? [];
  const moduleTriggers = [...new Set(selectedSituations.map((situation) => MODULE_TRIGGER_BY_SITUATION[situation] ?? situation))];
  const modules = moduleTriggers.length
    ? await prisma.adaptiveModule.findMany({
        where: { triggerSituation: { in: moduleTriggers } },
        orderBy: { position: "asc" },
        select: { id: true, title: true, questions: { orderBy: { position: "asc" }, select: { id: true, text: true } } },
      })
    : [];

  return NextResponse.json({
    id: assessment.id,
    adaptiveQuestions: modules.flatMap((module) =>
      module.questions.map((question) => ({ ...question, moduleTitle: module.title }))
    ),
  });
}
