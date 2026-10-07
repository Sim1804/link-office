import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Target, LayoutList, CheckCircle2, XCircle } from "lucide-react";

export const metadata = { title: "Détail du Module Adaptatif — LinkOffice" };

export default async function ModuleDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const isDimension = params.id.startsWith("DIM_");
  let detailItem: any = null;

  if (isDimension) {
    const dimensionName = params.id.replace("DIM_", "");
    const questions = await prisma.question.findMany({
      where: { dimension: dimensionName as any },
      orderBy: { position: "asc" }
    });

    if (questions.length > 0) {
      const dimensionObjectives: Record<string, string> = {
        SOCIAL: "Évaluer la qualité, la fréquence et le niveau de soutien du réseau social.",
        AFFECTIVE: "Mesurer la présence et la qualité des relations de soutien émotionnel.",
        SENTIMENTAL: "Évaluer la qualité de la vie sentimentale et l'intimité.",
        PROFESSIONAL: "Mesurer l'engagement, la reconnaissance et la qualité des relations professionnelles.",
        SELF: "Évaluer l'estime de soi, le sens de la vie et la relation globale à soi-même."
      };

      const versionList = questions.map(q => q.version).filter(v => typeof v === 'number');
      const maxVersion = versionList.length > 0 ? Math.max(...versionList) : 1;

      detailItem = {
        id: params.id,
        title: `Dimension ${dimensionName}`,
        triggerSituation: "Universel",
        objective: dimensionObjectives[dimensionName] || "Évaluer cette dimension",
        version: maxVersion,
        isActive: questions.some(q => q.isActive),
        questions
      };
    }
  } else {
    detailItem = await prisma.adaptiveModule.findUnique({
      where: { id: params.id },
      include: { questions: { orderBy: { position: "asc" } } }
    });
  }

  if (!detailItem) {
    redirect("/dashboard/superadmin/catalog");
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-[860px]">
      {/* Back link */}
      <Link
        href="/dashboard/superadmin/catalog"
        className="inline-flex items-center gap-1.5 text-[#123D46]/60 no-underline text-sm hover:text-[#00A99D] transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au catalogue
      </Link>

      {/* Module header card */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] p-8 shadow-xs">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-jakarta font-bold text-[#123D46] tracking-tight">{detailItem.title}</h1>
            <div className="text-[11px] text-[#123D46]/50 font-mono mt-1">ID: {detailItem.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
            <div className="text-[11px] font-jakarta font-bold text-[#123D46]/50 uppercase tracking-wider mb-1.5">Cible / Déclencheur</div>
            <div className="text-sm text-[#123D46] font-medium">{detailItem.triggerSituation}</div>
          </div>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
            <div className="text-[11px] font-jakarta font-bold text-[#123D46]/50 uppercase tracking-wider mb-1.5">Objectif</div>
            <div className="text-sm text-[#123D46] font-medium leading-relaxed">{detailItem.objective}</div>
          </div>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E3EBE6]">
            <div className="text-[11px] font-jakarta font-bold text-[#123D46]/50 uppercase tracking-wider mb-2">Informations</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#E3EBE6] text-[#123D46]/70 font-mono">
                v{detailItem.version}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                detailItem.isActive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-500"
              }`}>
                {detailItem.isActive
                  ? <><CheckCircle2 className="w-3 h-3" /> Actif</>
                  : <><XCircle className="w-3 h-3" /> Inactif</>
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <LayoutList className="w-5 h-5 text-[#5965E8]" />
          <h2 className="text-xl font-jakarta font-bold text-[#123D46]">
            Questions du module ({detailItem.questions.length})
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {detailItem.questions.map((q: any, index: number) => (
            <div
              key={q.id}
              className="p-5 bg-white rounded-xl border border-[#E3EBE6] shadow-xs flex gap-4 items-start hover:border-[#00A99D]/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#F8F9FA] border border-[#E3EBE6] flex items-center justify-center text-[13px] font-bold text-[#123D46]/70 shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#123D46] font-medium leading-relaxed mb-2">
                  {q.text}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="text-[11px] font-mono text-[#123D46]/50 bg-[#F8F9FA] px-1.5 py-0.5 rounded-md border border-[#E3EBE6]">
                    {q.id}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#F8F9FA] text-[#123D46]/70 border border-[#E3EBE6] rounded-full">
                    v{q.version}
                  </span>
                  {!q.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-rose-50 text-rose-500 rounded-full">
                      Inactif
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {detailItem.questions.length === 0 && (
            <div className="p-10 text-center text-[#123D46]/50 text-sm bg-white rounded-xl border border-[#E3EBE6]">
              Ce module ne contient aucune question.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
