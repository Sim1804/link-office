"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle } from "lucide-react";

export function SituationChangementButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRenew = async () => {
    setError(null);
    try {
      setIsLoading(true);
      const res = await fetch("/api/demographics/renew", { method: "POST" });
      const data = await res.json();
      if (data.success && data.assessmentId) {
        router.push(`/profil?tab=demographics&id=${data.assessmentId}`);
      } else {
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Erreur de connexion. Vérifiez votre réseau et réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-[#E3EBE6] rounded-3xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
            <RefreshCw size={22} className={isLoading ? "animate-spin" : ""} />
          </div>
          <div className="space-y-1">
            <h3 className="font-jakarta font-bold text-base text-[#123D46]">
              Ma situation a changé
            </h3>
            <p className="text-xs text-[#123D46]/75 leading-relaxed max-w-2xl">
              Si vous avez changé de poste, de situation familiale ou de mode de vie, actualisez votre profil pour recalibrer vos indicateurs et recommandations personnalisées.
            </p>
          </div>
        </div>

        <button
          onClick={handleRenew}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-xs shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Préparation..." : "Mettre à jour mon profil"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
