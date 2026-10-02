import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MediaCard } from "@/components/media/MediaCard";
import Link from "next/link";
import { Search, Filter, Headphones, FileText, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Média & Ressources — LINK OFFICE",
  description: "Découvrez nos articles, podcasts et ressources pour votre santé relationnelle.",
};

// Revalidation pour ISR (mise en cache statique mise à jour toutes les 60s)
export const revalidate = 60;

export default async function MediaIndexPage({ searchParams }: { searchParams: Promise<{ cat?: string, type?: string, q?: string, page?: string }> }) {
  const params = await searchParams;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;
  const categoryFilter = params.cat;
  const typeFilter = params.type;
  const searchFilter = params.q;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const ITEMS_PER_PAGE = 12;

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

  const [mediaItems, totalItems, categories] = await Promise.all([
    prisma.mediaContent.findMany({
      where: whereClause,
      orderBy: { publishedAt: "desc" },
      include: {
        categories: true,
      },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
    prisma.mediaContent.count({ where: whereClause }),
    prisma.mediaCategory.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <>
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}
      <main className="min-h-screen bg-[#FAF9F5] pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="font-jakarta font-extrabold text-4xl sm:text-5xl text-[#123D46] tracking-tight">
              Média & Ressources
            </h1>
            <p className="text-[#123D46]/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Décrypter, comprendre et s'inspirer. Découvrez nos clés d'action pour cultiver votre santé relationnelle au quotidien.
            </p>
          </div>

          {/* Méthode & IA Context */}
          {!typeFilter && !categoryFilter && !searchFilter && (
            <div className="bg-gradient-to-br from-white to-[#5965E8]/5 border border-[#E3EBE6] rounded-3xl p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
              <div className="space-y-3">
                <h3 className="font-jakarta font-bold text-lg text-[#123D46] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00A99D]" />
                  La Méthode IQRH
                </h3>
                <p className="text-[#123D46]/70 text-sm leading-relaxed">
                  Tous nos contenus sont adossés à l'<strong>Indice de Qualité Relationnelle Humaine</strong>. Nos experts analysent les données (anonymisées) de notre <Link href="/observatoire" className="text-[#00A99D] font-bold hover:underline">Observatoire</Link> pour vous proposer des ressources au plus près de vos réalités.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-jakarta font-bold text-lg text-[#123D46] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#5965E8]" />
                  Guidé par Iris (IA)
                </h3>
                <p className="text-[#123D46]/70 text-sm leading-relaxed">
                  L'intelligence artificielle Iris puise dans cette médiathèque pour générer vos <strong>prescriptions relationnelles</strong> personnalisées, liant directement l'évaluation scientifique à l'action.
                </p>
              </div>
            </div>
          )}

          {/* Podcast Highlight */}
          {!typeFilter && !categoryFilter && !searchFilter && (
            <div className="bg-white rounded-3xl p-8 sm:p-10 border-t-4 border-t-[#5965E8] border border-[#E3EBE6] shadow-sm flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F5] border border-[#E3EBE6] text-xs font-jakarta font-bold text-[#123D46]">
                  <Headphones className="w-4 h-4 text-[#00A99D]" /> Notre Podcast
                </div>
                <h2 className="font-jakarta font-extrabold text-3xl text-[#123D46]">La Voix des Éclaireurs</h2>
                <p className="text-[#123D46]/80 text-base leading-relaxed">
                  Des témoignages inspirants et des conseils d'experts pour vous accompagner dans vos défis relationnels. Vous n'êtes pas seul(e).
                </p>
                <Link href="/media?type=PODCAST" className="inline-block">
                  <Button variant="primary" size="lg">
                    Écouter les épisodes
                  </Button>
                </Link>
              </div>
              <div className="shrink-0 w-48 h-48 sm:w-60 sm:h-60 rounded-2xl bg-gradient-to-br from-[#5965E8]/10 to-[#00A99D]/10 border border-[#E3EBE6] flex items-center justify-center">
                <Headphones className="w-16 h-16 sm:w-20 sm:h-20 text-[#00A99D]" />
              </div>
            </div>
          )}

          {/* Filters Bar */}
          <div className="bg-white border border-[#E3EBE6] rounded-3xl p-5 shadow-sm">
            <form action="/media" method="GET" className="flex flex-col sm:flex-row gap-4 items-center">
              
              {/* Barre de recherche enrichie */}
              <div className="relative flex-grow w-full sm:w-auto">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#123D46]/40">
                  <Search className="w-4 h-4" />
                </div>
                <input 
                  name="q" type="text" placeholder="Rechercher un article, un podcast..." 
                  defaultValue={searchFilter || ""}
                  className="w-full bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46] rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all placeholder:text-[#123D46]/40"
                />
              </div>

              {/* Sélecteurs stylisés */}
              <div className="flex w-full sm:w-auto gap-3">
                <select name="type" defaultValue={typeFilter || ""} className="bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46] text-sm rounded-full py-2.5 px-4 focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all">
                  <option value="">Tous les formats</option>
                  <option value="ARTICLE">Articles</option>
                  <option value="PODCAST">Podcasts</option>
                  <option value="INTERVIEW">Interviews</option>
                  <option value="DOSSIER">Dossiers</option>
                </select>
                
                <select name="cat" defaultValue={categoryFilter || ""} className="bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46] text-sm rounded-full py-2.5 px-4 focus:outline-none focus:border-[#00A99D] focus:ring-1 focus:ring-[#00A99D]/30 transition-all">
                  <option value="">Toutes les catégories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Button type="submit" variant="secondary" className="flex-1 sm:flex-none">
                  <Filter className="w-4 h-4 mr-2" /> Filtrer
                </Button>
                
                {(searchFilter || categoryFilter || typeFilter) && (
                  <Link href="/media" className="flex-1 sm:flex-none">
                    <Button variant="ghost" className="w-full">
                      Réinitialiser
                    </Button>
                  </Link>
                )}
              </div>
            </form>
          </div>

          {/* Media Grid */}
          {mediaItems.length > 0 ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {mediaItems.map(item => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-[#E3EBE6] shadow-sm">
                  <span className="text-[#123D46]/60 text-xs font-semibold">
                    Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} sur {totalItems} contenus
                  </span>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      const isActive = page === currentPage;
                      if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                        if (page === 4 || page === totalPages - 2) return <span key={page} className="px-1 text-[#123D46]/40">…</span>;
                        return null;
                      }
                      
                      // Construire l'URL avec les filtres existants
                      const params = new URLSearchParams();
                      if (typeFilter) params.set("type", typeFilter);
                      if (categoryFilter) params.set("cat", categoryFilter);
                      if (searchFilter) params.set("q", searchFilter);
                      params.set("page", page.toString());
                      
                      return (
                        <Link key={page} href={`/media?${params.toString()}`}>
                          <button className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isActive 
                              ? "bg-[#00A99D] text-white shadow-xs" 
                              : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#FAF9F5] hover:text-[#123D46]"
                          }`}>
                            {page}
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E3EBE6] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF9F5] flex items-center justify-center mx-auto border border-[#E3EBE6]">
                <Filter className="w-8 h-8 text-[#123D46]/40" />
              </div>
              <h3 className="font-jakarta font-extrabold text-xl text-[#123D46]">Aucun contenu trouvé</h3>
              <p className="text-[#123D46]/70 text-sm">Essayez de modifier vos filtres ou votre recherche.</p>
              <Link href="/media" className="inline-block pt-4">
                <Button variant="ghost">
                  Voir tous les contenus
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
