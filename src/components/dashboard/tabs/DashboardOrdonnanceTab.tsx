"use client";

import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { ListChecks, Sparkles, Target } from "lucide-react";
import { LockedContentOverlay } from "@/components/ui/LockedContentOverlay";

export function DashboardOrdonnanceTab({ iqrh, isPremium, DIMENSIONS_LABELS }: { iqrh: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const allItems = iqrh?.prescription?.items || [];
  const recommendations = allItems.filter((i: any) => i.kind === "RECOMMENDATION");
  const challenges = allItems.filter((i: any) => i.kind === "MICRO_CHALLENGE");

  const shownReco = isPremium ? recommendations : recommendations.slice(0, 3);
  const shownChallenges = isPremium ? challenges : challenges.slice(0, 3);
  const hiddenCount = (recommendations.length - shownReco.length) + (challenges.length - shownChallenges.length);

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      {iqrh?.prescription ? (
        <>
          {/* Header card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5965E8]/10 text-[#5965E8] flex items-center justify-center text-xl shrink-0">
                📋
              </div>
              <div>
                <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
                  {iqrh.prescription.title}
                </h3>
                <p className="text-xs text-[#123D46]/70 mt-0.5">
                  {iqrh.prescription.summary}
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-[#5965E8]/10 text-[#5965E8] text-xs font-jakarta font-bold shrink-0 self-start sm:self-auto">
              Priorité — {iqrh.priority_dimension ? (DIMENSIONS_LABELS[iqrh.priority_dimension] || iqrh.priority_dimension) : "—"}
            </span>
          </div>

          {/* Recommandations Section */}
          {shownReco.length > 0 && (
            <div className="mb-7">
              <div className="text-center pt-2 mb-5">
                <span className="px-4 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] font-jakarta font-bold text-xs uppercase tracking-wider">
                  Recommandations d'actions
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shownReco.map((item: any) => (
                  <PrescriptionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Micro-défis Section */}
          {shownChallenges.length > 0 && (
            <div>
              <div className="text-center pt-2 mb-5">
                <span className="px-4 py-1 rounded-full bg-cyan-50 text-cyan-600 font-jakarta font-bold text-xs uppercase tracking-wider border border-cyan-100">
                  Micro-défis
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shownChallenges.map((item: any) => (
                  <PrescriptionItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Premium Upsell Blur Gate */}
          {!isPremium && hiddenCount > 0 && (
            <div className="mt-8">
              <LockedContentOverlay
                tier="PREMIUM"
                title={`${hiddenCount} contenu${hiddenCount > 1 ? "s" : ""} Premium restant${hiddenCount > 1 ? "s" : ""}`}
                description="Débloquez l'intégralité de votre ordonnance relationnelle, validez vos micro-défis et accédez à vos leviers d'évolution."
                actionLabel="Débloquer avec Premium"
              >
                <div className="p-8 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(Math.min(hiddenCount, 3))].map((_, i) => (
                      <div key={i} className="h-44 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6]" />
                    ))}
                  </div>
                </div>
              </LockedContentOverlay>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-[#E3EBE6] bg-white p-12 text-center shadow-xs">
          <p className="text-[#123D46]/60 text-sm">Aucune ordonnance relationnelle disponible.</p>
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
