import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MediaCard } from "@/components/media/MediaCard";
import Link from "next/link";
import { Search, Filter, Headphones, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export const metadata = {
  title: "Média & Ressources — LINK OFFICE",
  description: "Découvrez nos articles, podcasts et ressources pour votre santé relationnelle.",
};

// Revalidation pour ISR (mise en cache statique mise à jour toutes les 60s)
export const revalidate = 60;

export default async function MediaIndexPage({ searchParams }: { searchParams: Promise<{ cat?: string, type?: string, q?: string }> }) {
  const params = await searchParams;
  const categoryFilter = params.cat;
  const typeFilter = params.type;
  const searchFilter = params.q;

  // Build the where clause for Prisma
  const whereClause: any = { published: true };
  
  if (typeFilter) {
    whereClause.mediaType = typeFilter;
  }
  
  if (categoryFilter) {
    whereClause.categories = {
      some: { slug: categoryFilter }
    };
  }

  if (searchFilter) {
    whereClause.OR = [
      { title: { contains: searchFilter, mode: "insensitive" } },
      { summary: { contains: searchFilter, mode: "insensitive" } },
    ];
  }

  const [mediaItems, categories] = await Promise.all([
    prisma.mediaContent.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      include: {
        categories: true,
      },
      take: 50,
    }),
    prisma.mediaCategory.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <>
      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 100, paddingBottom: 60 }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeSlideUp 0.6s ease-out" }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, color: "var(--text-1)", marginBottom: 16, fontFamily: "var(--font-family-display)" }}>
              Média & Ressources
            </h1>
            <p style={{ color: "var(--text-2)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Décrypter, comprendre et s'inspirer. Découvrez nos clés d'action pour cultiver votre santé relationnelle au quotidien.
            </p>
          </div>

          {/* Podcast Highlight */}
          {!typeFilter && !categoryFilter && !searchFilter && (
            <div className="card" style={{ 
              marginBottom: 48, padding: 40,
              display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap",
              borderTop: "3px solid #7c3aed"
            }}>
                <div style={{ flex: "1 1 300px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, background: "rgba(18,61,70,0.05)", color: "var(--text-2)", fontSize: 13, fontWeight: 600, marginBottom: 16, border: "1px solid var(--border)" }}>
                    <Headphones size={14} color="var(--primary)" /> Notre Podcast
                  </div>
                  <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>La Voix des Éclaireurs</h2>
                  <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>
                    Des témoignages inspirants et des conseils d'experts pour vous accompagner dans vos défis relationnels. Vous n'êtes pas seul(e).
                  </p>
                  <Link href="/media?type=PODCAST" className="btn btn-primary" style={{ padding: "12px 24px", fontSize: 15 }}>
                    Écouter les épisodes
                  </Link>
                </div>
                <div style={{ flexShrink: 0, width: 240, height: 240, borderRadius: 12, background: "linear-gradient(135deg, rgba(89,101,232,0.1), rgba(0,169,157,0.1))", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Headphones size={48} color="var(--primary)" />
                </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="card" style={{ 
            display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap", alignItems: "center",
            padding: 20
          }}>
            <form action="/media" method="GET" style={{ display: "flex", gap: 16, flexGrow: 1, flexWrap: "wrap", alignItems: "center" }}>
              
              {/* Barre de recherche enrichie */}
              <div style={{ position: "relative", flexGrow: 1, minWidth: 250 }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)" }}>
                  <Search size={16} />
                </div>
                <input 
                  name="q" type="text" placeholder="Rechercher un article, un podcast..." 
                  defaultValue={searchFilter || ""}
                  className="input-field"
                  style={{ width: "100%", paddingLeft: 42 }}
                />
              </div>

              {/* Sélecteurs stylisés */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <select name="type" defaultValue={typeFilter || ""} className="input-field" style={{ minWidth: 160 }}>
                  <option value="">Tous les formats</option>
                  <option value="ARTICLE">Articles</option>
                  <option value="PODCAST">Podcasts</option>
                  <option value="INTERVIEW">Interviews</option>
                  <option value="DOSSIER">Dossiers</option>
                </select>
                
                <select name="cat" defaultValue={categoryFilter || ""} className="input-field" style={{ minWidth: 180 }}>
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Boutons */}
              <div style={{ display: "flex", gap: 12 }}>
                <Button type="submit" style={{ padding: "10px 20px" }}>
                  <Filter size={16} style={{ marginRight: 6 }} /> Filtrer
                </Button>
                
                {(searchFilter || categoryFilter || typeFilter) && (
                  <Link href="/media" style={{ textDecoration: "none" }}>
                    <Button variant="ghost" style={{ color: "var(--text-2)" }}>
                      Réinitialiser
                    </Button>
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Media Grid */}
          {mediaItems.length > 0 ? (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: 24,
              animation: "fadeIn 0.8s ease-out"
            }}>
              {mediaItems.map(item => (
                <MediaCard key={item.id} media={item} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 20px", background: "var(--surface)", borderRadius: 24, border: "1px dashed var(--border-strong)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(18,61,70,0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Filter size={32} style={{ color: "var(--text-3)" }} />
              </div>
              <h3 style={{ fontSize: 20, color: "var(--text-1)", marginBottom: 8, fontWeight: 700 }}>Aucun contenu trouvé</h3>
              <p style={{ color: "var(--text-2)" }}>Essayez de modifier vos filtres ou votre recherche.</p>
              <Link href="/media" className="btn btn-tertiary btn-sm" style={{ marginTop: 24 }}>
                Voir tous les contenus
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
