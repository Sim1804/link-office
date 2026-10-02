"use client";

import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { Handshake, Lock, Sparkles, BookOpen, Headphones, ChevronRight, Bookmark } from "lucide-react";
import Link from "next/link";
import { SubscriptionBadge } from "@/components/ui/SubscriptionBadge";

export function DashboardRessourcesTab({ iqrh, isPremium, DIMENSIONS_LABELS }: { iqrh: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const allItems = iqrh?.prescription?.items || [];
  const partners = allItems.filter((i: any) => i.kind === "PARTNER");
  
  // Limite Freemium (ex: 1 seul partenaire visible)
  const shownPartners = isPremium ? partners : partners.slice(0, 1);
  const hiddenCount = partners.length - shownPartners.length;

  // Articles mockés premium pour le design système (placeholders en attendant le CMS)
  const mockArticles = [
    { id: 1, title: "Comprendre et alléger la charge mentale au quotidien", type: "ARTICLE", emoji: "📖", textColor: "text-sky-600", readTime: "5 min", premium: false },
    { id: 2, title: "Poser des limites saines dans ses relations professionnelles", type: "PODCAST", emoji: "🎧", textColor: "text-purple-600", readTime: "12 min", premium: true },
    { id: 3, title: "Sortir du triangle dramatique de Karpman", type: "GUIDE", emoji: "🧭", textColor: "text-amber-600", readTime: "15 min", premium: true },
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
            <p className="text-xs text-[#123D46]/70 mt-0.5">
              Ressources et contacts qualifiés pour vous accompagner dans votre démarche.
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

      {/* Premium Upsell Blur Gate pour les Partenaires */}
      {!isPremium && hiddenCount > 0 && (
        <div className="mt-4 mb-8 rounded-3xl border border-[#E3EBE6] overflow-hidden relative bg-white min-h-[340px]">
          <div className="blur-[6px] opacity-40 pt-5 px-5 pointer-events-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(Math.min(hiddenCount, 3))].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6]" />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/95" />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E3EBE6] flex items-center justify-center text-2xl">
              🔒
            </div>
            <h4 className="font-jakarta font-extrabold text-xl text-[#123D46]">
              {hiddenCount} partenaire{hiddenCount > 1 ? "s" : ""} Premium masqué{hiddenCount > 1 ? "s" : ""}
            </h4>
            <p className="text-xs text-[#123D46]/70 max-w-md font-inter leading-relaxed">
              Débloquez l'accès complet à notre réseau de professionnels qualifiés et pertinents pour votre situation.
            </p>
            <Link href="/premium" className="px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-jakarta font-bold transition-all shadow-xs flex items-center gap-2">
              <span>Passer à Premium</span>
              <span>→</span>
            </Link>
            <span className="text-[11px] text-[#123D46]/50">
              ✓ Sans engagement · Résiliable à tout moment
            </span>
          </div>
        </div>
      )}

      {/* Bibliothèque de contenus Section (Placeholders) */}
      <div>
        <div className="text-center pt-2 mb-5 mt-4">
          <span className="px-4 py-1 rounded-full bg-[#00A99D]/10 text-[#00A99D] font-jakarta font-bold text-xs uppercase tracking-wider">
            📚 Bibliothèque de contenus
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockArticles.map((article) => (
            <div key={article.id} className="bg-white border border-[#E3EBE6] rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer relative overflow-hidden group">
              
              {!isPremium && article.premium && (
                 <div className="absolute top-5 right-5 z-10">
                   <SubscriptionBadge tier="PREMIUM" size="sm" className="shadow-sm bg-white/90 backdrop-blur-sm" />
                 </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${article.textColor}`}>
                    {article.emoji} {article.type}
                  </span>
                </div>
                
                <h4 className={`font-jakarta text-base font-bold text-[#123D46] leading-snug mb-2 ${!isPremium && article.premium ? 'blur-[2px]' : ''}`}>
                  {article.title}
                </h4>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-[11px] font-medium text-[#123D46]/60">Lecture : {article.readTime}</span>
                <ChevronRight size={16} className="text-[#123D46]/40 group-hover:text-[#00A99D] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
