"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Handshake, ArrowRight, UserCheck } from "lucide-react";
import Link from "next/link";
import { UpsellBanner } from "@/components/ui/UpsellBanner";

interface DashboardRelationsTabProps {
  isPremium: boolean;
  isPremiumPlus?: boolean;
}

export function DashboardRelationsTab({ isPremium, isPremiumPlus = false }: DashboardRelationsTabProps) {
  const [relations, setRelations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [binomeStatus, setBinomeStatus] = useState<"none" | "pending" | "active">("none");

  useEffect(() => {
    if (!isPremiumPlus) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch("/api/carnet/relations").then(r => r.json()).catch(() => ({ success: false })),
      fetch("/api/binome/status").then(r => r.json()).catch(() => ({ status: "none" })),
    ]).then(([relData, binData]) => {
      if (relData.success) setRelations(relData.relations);
      setBinomeStatus(binData.status ?? "none");
      setLoading(false);
    });
  }, [isPremiumPlus]);

  // ── Freemium : aucun abonnement ────────────────────────────────────────
  if (!isPremium && !isPremiumPlus) {
    return (
      <div className="flex flex-col gap-4">
        {/* Aperçu relations — accessible en Premium */}
        <div className="bg-white border border-[#E3EBE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-[15px] font-bold text-[#123D46] mb-1">
            Mes Relations Ressources
          </h3>
          <p className="text-[13px] text-[#123D46]/70 m-0 leading-relaxed">
            Disponible dès l'abonnement Premium — cartographiez vos relations de soutien.
          </p>
        </div>

        {/* Binôme — Premium+ */}
        <UpsellBanner
          variant="freemium"
          featureName="Mon Binôme Relationnel"
          description="Le Binôme Relationnel est une fonctionnalité exclusive Premium+. Passez à Premium pour débloquer vos résultats détaillés, puis à Premium+ pour le Binôme."
        />
      </div>
    );
  }

  // ── Premium (sans Plus) : accès partiel, upsell Premium+ ────────────────
  if (isPremium && !isPremiumPlus) {
    return (
      <div className="flex flex-col gap-5">
        {/* Info : relations accessibles en Premium */}
        <div className="bg-white border border-[#E3EBE6] rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-[15px] font-bold text-[#123D46] mb-1">
            Mes Relations Ressources
          </h3>
          <p className="text-[13px] text-[#123D46]/70 m-0 leading-relaxed">
            Cartographiez les personnes de soutien dans votre vie — disponible avec votre abonnement Premium.
          </p>
        </div>

        {/* Upsell Binôme → Premium+ avec variant dédié */}
        <UpsellBanner
          variant="premium"
          featureName="Mon Binôme Relationnel"
          description="Le Binôme Relationnel est exclusif Premium+. Vous êtes déjà Premium 🎉 — passez à Premium+ pour accéder aux mises en relation personnalisées, aux suggestions IRIS et aux check-ins hebdomadaires."
        />
      </div>
    );
  }

  // ── Premium+ : accès complet ──────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-7 animate-fade-in">

      {/* Section Binôme */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-xl shrink-0">
            👥
          </div>
          <div>
            <h3 className="font-jakarta text-base font-extrabold text-[#123D46] mb-0.5">
              Mon Binôme Relationnel
            </h3>
            <p className="text-[13px] text-[#123D46]/70 m-0">
              {binomeStatus === "active"
                ? "Votre binôme est actif — consultez vos check-ins."
                : binomeStatus === "pending"
                  ? "Mise en relation en cours de validation."
                  : "Découvrez votre correspondance relationnelle."}
            </p>
          </div>
        </div>
        <Link
          href="/binome"
          className="relative z-10 px-5 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2"
        >
          {binomeStatus === "active" ? "Mon espace Binôme" : "Accéder au Binôme"}
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Cartographie de l'entourage */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#00A99D]" />
            <h3 className="font-jakarta text-[15px] font-extrabold text-[#123D46]">
              Mes Relations Ressources
            </h3>
          </div>
          <button
            className="px-4 py-2 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:bg-[#FAF9F5] text-[13px] font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-[#E3EBE6]/50 h-[100px] rounded-2xl" />
            ))}
          </div>
        ) : relations.length === 0 ? (
          <div className="py-10 px-6 text-center bg-white border border-[#E3EBE6] rounded-3xl shadow-xs">
            <div className="w-14 h-14 bg-[#00A99D]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00A99D]/20">
              <UserCheck size={24} className="text-[#00A99D]" />
            </div>
            <h4 className="text-[15px] font-bold text-[#123D46] mb-2">Aucune relation enregistrée</h4>
            <p className="text-[13px] text-[#123D46]/70 max-w-sm mx-auto leading-relaxed">
              Identifiez les personnes sur lesquelles vous pouvez compter pour du soutien émotionnel ou pratique.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relations.map(rel => (
              <div key={rel.id} className="bg-white border border-[#E3EBE6] p-5 rounded-2xl transition-colors hover:border-[#00A99D]/30 shadow-xs">
                <div className="text-[10px] font-bold text-[#00A99D] mb-1.5 uppercase tracking-wider bg-[#00A99D]/10 inline-block px-2.5 py-0.5 rounded-full border border-[#00A99D]/20">
                  {rel.category}
                </div>
                <div className="text-[#123D46] text-base font-bold mb-3">{rel.name}</div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-[11px] text-[#123D46]/70">
                    <span className="font-bold text-[#123D46]/80">Fréquence : </span>{rel.frequency}
                  </div>
                  <div className="text-[11px] text-[#123D46]/70">
                    <span className="font-bold text-[#123D46]/80">Proximité : </span>{rel.proximity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
