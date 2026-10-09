"use client";

import Link from "next/link";
import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { Handshake, Sparkles, BookOpen, Headphones, ChevronRight, Bookmark, ArrowRight, Lock } from "lucide-react";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";
import { LockedContentOverlay } from "@/components/ui/LockedContentOverlay";

export function DashboardRessourcesTab({ iqrh, isPremium, DIMENSIONS_LABELS }: { iqrh: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const allItems = iqrh?.prescription?.items || [];
  const partners = allItems.filter((i: any) => i.kind === "PARTNER");
  
  // Limite Freemium (1 seul partenaire visible en gratuit)
  const shownPartners = isPremium ? partners : partners.slice(0, 1);
  const hiddenCount = partners.length - shownPartners.length;

  // Sélection de ressources éditoriales ciblées (Médiathèque Link Office)
  const mockArticles = [
    {
      id: 1,
      title: "Comprendre et alléger la charge mentale au quotidien",
      summary: "Identifiez les mécanismes de surcharge émotionnelle et relationnelle au travail pour préserver votre équilibre.",
      type: "ARTICLE",
      emoji: "📖",
      tagColor: "bg-sky-50 text-sky-700 border-sky-100",
      readTime: "5 min",
      premium: false,
      href: "/media",
      actionText: "Lire l'article",
    },
    {
      id: 2,
      title: "Poser des limites saines dans ses relations professionnelles",
      summary: "Exercices pratiques et repères verbaux pour exprimer un refus constructif tout en renforçant la confiance.",
      type: "PODCAST",
      emoji: "🎧",
      tagColor: "bg-purple-50 text-purple-700 border-purple-100",
      readTime: "12 min",
      premium: true,
      href: isPremium ? "/media" : "/premium",
      actionText: isPremium ? "Écouter l'épisode" : "Débloquer avec Premium",
    },
    {
      id: 3,
      title: "Sortir du triangle dramatique de Karpman au travail",
      summary: "Guide méthodologique complet pour désamorcer les postures Persécuteur, Sauveur et Victime en équipe.",
      type: "GUIDE",
      emoji: "🧭",
      tagColor: "bg-amber-50 text-amber-700 border-amber-100",
      readTime: "15 min",
      premium: true,
      href: isPremium ? "/media" : "/premium",
      actionText: isPremium ? "Consulter le guide" : "Débloquer avec Premium",
    },
  ];

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      {/* Header card pour l'onglet Ressources */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shrink-0">
            🤝
          </div>
          <div>
            <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
              Soutien & Réseau de Partenaires
            </h3>
            <p className="text-xs text-[#123D46]/70 mt-0.5 font-inter">
              Ressources et contacts qualifiés pour vous accompagner dans votre démarche relationnelle.
            </p>
          </div>
        </div>
      </div>

      {/* Réseau de Partenaires Section */}
      {shownPartners.length > 0 && (
        <div className={`mb-${hiddenCount > 0 ? '0' : '8'}`}>
          <div className="text-center pt-2 mb-5">
            <span className="px-4 py-1 rounded-full bg-orange-50 text-orange-600 font-jakarta font-bold text-xs uppercase tracking-wider border border-orange-100 inline-flex items-center gap-1.5">
              <Handshake size={14} /> Partenaires recommandés
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shownPartners.map((item: any) => (
              <PrescriptionItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Upsell Blur Gate pour les Partenaires avec hauteur garantie et padding aéré */}
      {!isPremium && hiddenCount > 0 && (
        <div className="mt-4 mb-10">
          <LockedContentOverlay
            tier="PREMIUM"
            title={`${hiddenCount} partenaire${hiddenCount > 1 ? "s" : ""} Premium masqué${hiddenCount > 1 ? "s" : ""}`}
            description="Débloquez l'accès complet à notre réseau de professionnels certifiés et partenaires qualifiés pour votre situation."
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

      {/* Bibliothèque de contenus & Médiathèque */}
      <div className="mt-8 pt-4 border-t border-[#E3EBE6]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="px-3.5 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] font-jakarta font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <BookOpen size={14} /> Médiathèque & Guides Pratiques
            </span>
            <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
              Ressources recommandées pour votre profil
            </h3>
          </div>

          <Link
            href="/media"
            className="text-xs font-jakarta font-bold text-[#00A99D] hover:underline inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Voir toute la médiathèque</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockArticles.map((article) => {
            const isLockedForUser = !isPremium && article.premium;

            return (
              <Link
                key={article.id}
                href={article.href}
                className="bg-white border border-[#E3EBE6] rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#00A99D]/40 group relative overflow-hidden text-left no-underline"
              >
                {/* Badge de statut */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${article.tagColor}`}>
                    {article.emoji} {article.type}
                  </span>

                  {article.premium ? (
                    <SubscriptionBadge tier="PREMIUM" size="xs" />
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Accès libre
                    </span>
                  )}
                </div>

                {/* Contenu textuel 100% lisible */}
                <div className="flex-1 mb-5">
                  <h4 className="font-jakarta text-[15px] font-bold text-[#123D46] leading-snug mb-2 group-hover:text-[#00A99D] transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-xs text-[#123D46]/70 leading-relaxed font-inter">
                    {article.summary}
                  </p>
                </div>

                {/* Pied de carte avec action contextuelle */}
                <div className="pt-3.5 border-t border-[#E3EBE6]/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#123D46]/60">
                    {article.readTime}
                  </span>

                  <span className={`text-xs font-bold inline-flex items-center gap-1 transition-all ${
                    isLockedForUser
                      ? "text-[#00A99D] group-hover:translate-x-0.5"
                      : "text-[#123D46]/80 group-hover:text-[#00A99D] group-hover:translate-x-0.5"
                  }`}>
                    <span>{article.actionText}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bouton d'exploration médiathèque globale */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/media"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:bg-[#FAF9F5] text-xs font-jakarta font-bold transition-all shadow-xs hover:border-[#00A99D]/40 hover:shadow-sm"
          >
            <span>Explorer l'ensemble des articles & podcasts</span>
            <ArrowRight size={14} className="text-[#00A99D]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
