"use client";

import { User, Award, HeartHandshake, ShieldCheck } from "lucide-react";
import type { MediaEclaireur } from "@prisma/client";

interface EclaireurCardProps {
  eclaireur: MediaEclaireur;
}

export function EclaireurCard({ eclaireur }: EclaireurCardProps) {
  const isPro = eclaireur.type === "PROFESSIONNEL";

  return (
    <div className="bg-white rounded-3xl border border-[#E3EBE6] p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header avec Avatar & Rôle */}
      <div className="flex items-start gap-4">
        {/* Photo Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-2xl bg-[#123D46]/5 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-cover bg-center"
            style={eclaireur.photoUrl ? { backgroundImage: `url(${eclaireur.photoUrl})` } : {}}
          >
            {!eclaireur.photoUrl && (
              <User className="w-8 h-8 text-[#123D46]/40" />
            )}
          </div>
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
              isPro ? "bg-[#00A99D] text-white" : "bg-[#5965E8] text-white"
            }`}
            title={isPro ? "Expert validé" : "Témoin Éclaireur"}
          >
            {isPro ? <ShieldCheck className="w-3 h-3" /> : <HeartHandshake className="w-3 h-3" />}
          </div>
        </div>

        {/* Identité & Statut */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 bg-[#FAF9F5] border border-[#E3EBE6]">
            {isPro ? (
              <span className="text-[#00A99D] flex items-center gap-1">
                <Award className="w-3 h-3" /> Expert Clinique & RH
              </span>
            ) : (
              <span className="text-[#5965E8] flex items-center gap-1">
                <HeartHandshake className="w-3 h-3" /> Témoin Éclaireur
              </span>
            )}
          </div>

          <h4 className="font-jakarta font-bold text-base sm:text-lg text-[#123D46] truncate">
            {eclaireur.name}
          </h4>

          {eclaireur.profession && (
            <p className="text-xs sm:text-sm text-[#123D46]/70 leading-snug mt-0.5 line-clamp-2">
              {eclaireur.profession}
            </p>
          )}
        </div>
      </div>

      {/* Bio & Contexte */}
      {eclaireur.bio && (
        <p className="mt-4 pt-4 border-t border-[#E3EBE6] text-xs sm:text-sm text-[#123D46]/75 leading-relaxed italic">
          « {eclaireur.bio} »
        </p>
      )}
    </div>
  );
}
