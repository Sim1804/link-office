"use client";

import { PrescriptionItemCard } from "@/components/dashboard/PrescriptionItemCard";
import { Handshake, Lock, Sparkles, BookOpen, Headphones, ChevronRight, Bookmark } from "lucide-react";
import Link from "next/link";

export function DashboardRessourcesTab({ iqrh, isPremium, DIMENSIONS_LABELS }: { iqrh: any, isPremium: boolean, DIMENSIONS_LABELS: any }) {
  const allItems = iqrh?.prescription?.items || [];
  const partners = allItems.filter((i: any) => i.kind === "PARTNER");
  
  // Limite Freemium (ex: 1 seul partenaire visible)
  const shownPartners = isPremium ? partners : partners.slice(0, 1);
  const hiddenCount = partners.length - shownPartners.length;

  // Articles mockés premium pour le design système (placeholders en attendant le CMS)
  const mockArticles = [
    { id: 1, title: "Comprendre et alléger la charge mentale au quotidien", type: "ARTICLE", icon: BookOpen, color: "#0ea5e9", readTime: "5 min", premium: false },
    { id: 2, title: "Poser des limites saines dans ses relations professionnelles", type: "PODCAST", icon: Headphones, color: "#8b5cf6", readTime: "12 min", premium: true },
    { id: 3, title: "Sortir du triangle dramatique de Karpman", type: "GUIDE", icon: BookOpen, color: "#f59e0b", readTime: "15 min", premium: true },
  ];

  return (
    <div style={{ animation: "fadeSlideIn 0.4s ease-out" }}>
      {/* Header card pour l'onglet Ressources */}
      <div style={{
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(234,88,12,0.06) 0%, rgba(234,88,12,0.02) 100%)",
        border: "1px solid rgba(234,88,12,0.15)",
        padding: "20px",
        marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "rgba(234,88,12,0.1)", border: "1px solid rgba(234,88,12,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={24} style={{ color: "#ea580c" }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text-1)" }}>
              Soutien & Réseau de Partenaires
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>
              Ressources et contacts qualifiés pour vous accompagner dans votre démarche.
            </p>
          </div>
        </div>
      </div>

      {/* Réseau de Partenaires Section */}
      {shownPartners.length > 0 && (
        <div style={{ marginBottom: hiddenCount > 0 ? 0 : 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
            <span style={{
              fontSize: 11, fontWeight: 700, color: "#ea580c",
              letterSpacing: "0.12em", textTransform: "uppercase",
              background: "rgba(234,88,12,0.08)", padding: "4px 12px",
              borderRadius: 999, border: "1px solid rgba(234,88,12,0.15)",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <Handshake size={14} /> Partenaires recommandés
            </span>
            <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {shownPartners.map((item: any) => (
              <PrescriptionItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Upsell Blur Gate pour les Partenaires */}
      {!isPremium && hiddenCount > 0 && (
        <div style={{
          marginTop: 16, marginBottom: 32,
          borderRadius: 16,
          border: "1px solid var(--border-strong)",
          overflow: "hidden",
          position: "relative",
        }}>
          <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "20px 20px 0", pointerEvents: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[...Array(Math.min(hiddenCount, 3))].map((_, i) => (
                <div key={i} style={{ height: 120, borderRadius: 16, background: "var(--surface-2)", border: "1px solid var(--border)" }} />
              ))}
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 60%)" }} />
          <div style={{ position: "relative", zIndex: 2, padding: "40px 32px 32px", textAlign: "center" }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 16px", borderRadius: 12, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Lock size={20} color="var(--text-3)" />
            </div>
            <h4 style={{ fontFamily: "Inter, sans-serif", color: "var(--text-1)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              {hiddenCount} partenaire{hiddenCount > 1 ? "s" : ""} Premium masqué{hiddenCount > 1 ? "s" : ""}
            </h4>
            <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px" }}>
              Débloquez l'accès complet à notre réseau de professionnels qualifiés et pertinents pour votre situation.
            </p>
            <Link href="/premium" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
              <Sparkles size={16} /> Passer à Premium
            </Link>
          </div>
        </div>
      )}

      {/* Bibliothèque de contenus Section (Placeholders) */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
          <span style={{
            fontSize: 11, fontWeight: 700, color: "var(--text-2)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            background: "var(--surface)", padding: "4px 12px",
            borderRadius: 999, border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Bookmark size={14} /> Bibliothèque de contenus
          </span>
          <div style={{ height: 1, flex: 1, background: "var(--surface-2)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {mockArticles.map((article) => (
            <div key={article.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
              padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between",
              transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", position: "relative", overflow: "hidden"
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}>
              
              {!isPremium && article.premium && (
                 <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", padding: "4px 8px", borderRadius: 8, display: "flex", alignItems: "center", gap: 4 }}>
                   <Lock size={12} color="white" />
                   <span style={{ color: "white", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Premium</span>
                 </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${article.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <article.icon size={16} color={article.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}>{article.type}</span>
                </div>
                
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.4, marginBottom: 8, filter: (!isPremium && article.premium) ? "blur(2px)" : "none" }}>
                  {article.title}
                </h4>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Lecture : {article.readTime}</span>
                <ChevronRight size={16} color="var(--text-3)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
