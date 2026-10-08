import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { EclaireurCard } from "@/components/media/EclaireurCard";
import { ShareButtons } from "@/components/media/ShareButtons";
import { MediaCard } from "@/components/media/MediaCard";
import { ReadingProgress } from "@/components/media/ReadingProgress";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  ChevronRight, 
  Clock, 
  Calendar, 
  Tag, 
  Folder, 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  Headphones,
  BookOpen,
  Share2
} from "lucide-react";
import { formatMediaContent } from "@/lib/format-media";
import type { Dimension } from "@prisma/client";

export const revalidate = 60; // ISR

const dimensionLabels: Record<Dimension, { label: string; code: string; color: string }> = {
  SENTIMENTAL: { label: "Vie Sentimentale & Intimité", code: "D1", color: "#ec4899" },
  AFFECTIVE: { label: "Famille & Proches", code: "D2", color: "#8b5cf6" },
  SOCIAL: { label: "Lien Social & Citoyenneté", code: "D3", color: "#00A99D" },
  PROFESSIONAL: { label: "Travail & Équipe", code: "D4", color: "#0284c7" },
  SELF: { label: "Estime de Soi & Limites", code: "D5", color: "#f59e0b" },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const media = await prisma.mediaContent.findUnique({ where: { slug: resolvedParams.slug } });
  
  if (!media) return { title: "Contenu non trouvé — LINK OFFICE" };
  
  return {
    title: `${media.title} — LINK OFFICE`,
    description: media.summary || "Découvrez ce contenu sur LINK OFFICE.",
    openGraph: {
      title: media.title,
      description: media.summary || "Ressource en santé relationnelle sur LINK OFFICE.",
      images: media.coverImage ? [media.coverImage] : [],
    }
  };
}

export default async function MediaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const session = await auth();
  const isAuthenticated = !!session?.user?.id;

  const media = await prisma.mediaContent.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      categories: true,
      eclaireurs: true,
      linkedArticles: {
        include: { categories: true },
        take: 3
      }
    }
  });

  if (!media || !media.published) notFound();

  const isPodcast = media.mediaType === "PODCAST";
  const formattedDate = media.publishedAt 
    ? new Date(media.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) 
    : '';
  
  const mainCategory = media.categories.find(c => c.type === "SUJET" || c.type === "DIMENSION_IQRH") || media.categories[0];
  const dimensionInfo = media.dimensionIqrh ? dimensionLabels[media.dimensionIqrh] : null;
  const mainAuthor = media.eclaireurs[0];
  const formattedHtml = formatMediaContent(media.content);

  return (
    <>
      <ReadingProgress />
      {isAuthenticated ? <Navbar /> : <PublicNavbar />}

      <main className="min-h-screen bg-[#FAF9F5] text-[#123D46] pt-8 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* 1. Fil d'Ariane & Bouton Retour */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3EBE6] pb-4">
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#123D46]/60 flex-wrap">
              <Link href="/" className="hover:text-[#00A99D] transition-colors">
                Accueil
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#123D46]/40" />
              <Link href="/media" className="hover:text-[#00A99D] transition-colors">
                Médiathèque
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[#123D46]/40" />
              {mainCategory && (
                <>
                  <Link href={`/media?cat=${mainCategory.slug}`} className="hover:text-[#00A99D] transition-colors">
                    {mainCategory.name}
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-[#123D46]/40" />
                </>
              )}
              <span className="text-[#123D46] font-medium truncate max-w-[200px] sm:max-w-[320px]">
                {media.title}
              </span>
            </nav>

            <Link 
              href="/media" 
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#00A99D] hover:underline self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Toutes les ressources
            </Link>
          </div>

          {/* 2. Hero Editorial : Titre, Badges, Chapô et Métadonnées */}
          <header className="space-y-6 max-w-4xl">
            {/* Badges de format et dimension */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#E3EBE6] shadow-sm text-[#00A99D]">
                {isPodcast ? <Headphones className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                {media.mediaType.replace("_", " ")}
              </span>

              {dimensionInfo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FAF9F5] border border-[#E3EBE6] text-[#123D46]">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dimensionInfo.color }} />
                  {dimensionInfo.code} • {dimensionInfo.label}
                </span>
              )}

              {mainCategory && !dimensionInfo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white border border-[#E3EBE6] text-[#123D46]/70">
                  <Folder className="w-3 h-3 text-[#00A99D]" />
                  {mainCategory.name}
                </span>
              )}
            </div>

            {/* Titre Principal */}
            <h1 className="font-jakarta font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#123D46] tracking-tight leading-[1.18]">
              {media.title}
            </h1>

            {/* Chapeau / Résumé */}
            {media.summary && (
              <p className="text-lg sm:text-xl text-[#123D46]/80 leading-relaxed font-normal">
                {media.summary}
              </p>
            )}

            {/* Barre de métadonnées auteur, date, temps de lecture & partage */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#E3EBE6]">
              {/* Profil Auteur / Éclaireur */}
              <div className="flex items-center gap-3">
                {mainAuthor ? (
                  <>
                    <div 
                      className="w-11 h-11 rounded-full bg-[#123D46]/10 border border-white shadow-sm overflow-hidden bg-cover bg-center shrink-0"
                      style={mainAuthor.photoUrl ? { backgroundImage: `url(${mainAuthor.photoUrl})` } : {}}
                    />
                    <div>
                      <div className="font-jakarta font-bold text-sm text-[#123D46]">
                        {mainAuthor.name}
                      </div>
                      <div className="text-xs text-[#123D46]/60">
                        {mainAuthor.profession || "Éclaireur Link Office"}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <div className="font-jakarta font-bold text-sm text-[#123D46]">
                      Rédaction Link Office
                    </div>
                    <div className="text-xs text-[#123D46]/60">
                      Laboratoire du Lien Humain
                    </div>
                  </div>
                )}

                <div className="hidden sm:block w-px h-8 bg-[#E3EBE6] mx-2" />

                {/* Date & Durée */}
                <div className="flex items-center gap-4 text-xs text-[#123D46]/60">
                  {formattedDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formattedDate}
                    </span>
                  )}
                  {media.duration && (
                    <span className="flex items-center gap-1.5 font-medium text-[#123D46]/80">
                      <Clock className="w-3.5 h-3.5 text-[#00A99D]" />
                      {media.duration} min {isPodcast ? "d'écoute" : "de lecture"}
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons de Partage */}
              <ShareButtons title={media.title} />
            </div>
          </header>

          {/* 3. Hero Visual : Couverture Haute Définition ou Player Audio */}
          {isPodcast && media.audioUrl ? (
            <div className="animate-fade-in">
              <AudioPlayer 
                src={media.audioUrl} 
                title={media.title} 
                coverImage={media.coverImage || undefined}
                eclaireurName={media.eclaireurs.length > 0 ? media.eclaireurs.map(e => e.name).join(", ") : undefined}
              />
            </div>
          ) : media.coverImage ? (
            <div className="relative w-full rounded-3xl overflow-hidden border border-[#E3EBE6] shadow-md bg-white">
              <img 
                src={media.coverImage} 
                alt={media.title} 
                className="w-full h-auto max-h-[520px] object-cover"
              />
              <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/80 text-[11px] font-medium">
                Photo éditoriale © Link Office
              </div>
            </div>
          ) : null}

          {/* 4. Corps de l'Article & Sidebar (Grille 12 colonnes) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Colonne Principale (8 colonnes) */}
            <article className="lg:col-span-8 space-y-10">
              
              {/* Bloc "À retenir en bref" (Key Takeaways) */}
              <div className="bg-gradient-to-br from-white to-[#00A99D]/5 border-2 border-[#00A99D]/20 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 text-[#00A99D] font-jakarta font-bold text-base mb-3">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  <span>L'essentiel en 3 points</span>
                </div>
                <ul className="space-y-2.5 text-sm sm:text-base text-[#123D46]/85">
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] mt-2 shrink-0" />
                    <span>L'évaluation de la qualité relationnelle permet d'anticiper l'usure mentale avant l'apparition des symptômes d'épuisement.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] mt-2 shrink-0" />
                    <span>La réciprocité et la sincérité relationnelle agissent comme de puissants régulateurs neurobiologiques du stress.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00A99D] mt-2 shrink-0" />
                    <span>L'action commence par de micro-rituels d'échange et la clarification de ses propres limites interpersonnelles.</span>
                  </li>
                </ul>
              </div>

              {/* Contenu Formatté Markdown / HTML */}
              <div 
                className="media-content-body"
                dangerouslySetInnerHTML={{ __html: formattedHtml }} 
              />

              {/* Transcription intégrale (si podcast) */}
              {isPodcast && media.transcript && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3EBE6] shadow-sm space-y-4">
                  <h3 className="font-jakarta font-bold text-xl text-[#123D46] flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-[#00A99D]" />
                    Transcription intégrale de l'enregistrement
                  </h3>
                  <div className="text-sm sm:text-base text-[#123D46]/80 leading-relaxed font-mono whitespace-pre-wrap bg-[#FAF9F5] p-6 rounded-2xl border border-[#E3EBE6]">
                    {media.transcript}
                  </div>
                </div>
              )}

              {/* Recommandation Iris (IA) intégrée au flux */}
              <div className="bg-gradient-to-br from-[#123D46] to-[#0A242B] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-[#00A99D]/20 border border-[#00A99D]/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-7 h-7 text-[#00A99D]" />
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="font-jakarta font-bold text-lg text-white">
                    Vous souhaitez appliquer ces conseils à votre profil ?
                  </h4>
                  <p className="text-sm text-white/80 leading-relaxed">
                    Notre coach relationnel <strong>Iris (IA)</strong> croise vos résultats IQRH avec notre médiathèque pour vous suggérer des micro-défis adaptés à votre situation.
                  </p>
                </div>
                <Link href="/iris" className="shrink-0">
                  <Button variant="primary" size="md">
                    Consulter Iris
                  </Button>
                </Link>
              </div>

              {/* Tags et Partage en fin d'article */}
              <div className="pt-8 border-t border-[#E3EBE6] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#123D46]/60 uppercase tracking-wider mr-1">
                    Thématiques :
                  </span>
                  {media.categories.map(c => (
                    <Link 
                      key={c.id} 
                      href={`/media?cat=${c.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E3EBE6] text-xs font-medium text-[#123D46]/80 hover:border-[#00A99D] hover:text-[#00A99D] transition-colors"
                    >
                      <Tag className="w-3 h-3 text-[#00A99D]" />
                      {c.name}
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <ShareButtons title={media.title} />
                </div>
              </div>
            </article>

            {/* Colonne Latérale Sticky (4 colonnes) */}
            <aside className="lg:col-span-4 space-y-8 sticky top-28">
              
              {/* Carte Éclaireur */}
              {media.eclaireurs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-jakarta font-bold text-xs uppercase tracking-wider text-[#123D46]/60">
                    Intervenant & Auteur
                  </h3>
                  <div className="space-y-4">
                    {media.eclaireurs.map(eclaireur => (
                      <EclaireurCard key={eclaireur.id} eclaireur={eclaireur} />
                    ))}
                  </div>
                </div>
              )}

              {/* Widget IQRH : Diagnostic */}
              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-[#5965E8]">
                  <Layers className="w-5 h-5" />
                  <span className="font-jakarta font-bold text-sm uppercase tracking-wider">
                    Diagnostic Relationnel
                  </span>
                </div>
                <h4 className="font-jakarta font-bold text-lg text-[#123D46] leading-snug">
                  Mesurez votre indice IQRH
                </h4>
                <p className="text-xs sm:text-sm text-[#123D46]/70 leading-relaxed">
                  25 questions anonymes validées par des sociologues pour situer vos 5 sphères relationnelles.
                </p>
                <Link href="/questionnaire" className="block">
                  <Button variant="secondary" className="w-full">
                    Évaluer mon score gratuit
                  </Button>
                </Link>
              </div>

              {/* Sommaire des Thématiques populaires */}
              <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-sm space-y-4">
                <h3 className="font-jakarta font-bold text-sm uppercase tracking-wider text-[#123D46]/60">
                  Explorer par Dimension
                </h3>
                <div className="space-y-2">
                  {Object.entries(dimensionLabels).map(([dimKey, dim]) => (
                    <Link
                      key={dimKey}
                      href={`/media?dim=${dimKey}`}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-[#FAF9F5] text-xs font-semibold text-[#123D46] transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: dim.color }} />
                        <span className="group-hover:text-[#00A99D] transition-colors">{dim.label}</span>
                      </div>
                      <span className="text-[10px] text-[#123D46]/40 uppercase">{dim.code}</span>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>
          </div>

          {/* 5. Grande Bannière de Conversion SaaS (Dual CTA B2C/B2B) */}
          <section className="bg-gradient-to-br from-[#123D46] via-[#10343C] to-[#0A242B] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#00A99D]/20 text-center relative overflow-hidden space-y-6">
            <div className="w-14 h-14 rounded-full bg-[#00A99D]/20 border border-[#00A99D]/30 flex items-center justify-center mx-auto text-[#00A99D]">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h2 className="font-jakarta font-extrabold text-2xl sm:text-3xl text-white">
                Passez de la théorie à l'action relationnelle
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                Que vous soyez un particulier en quête d'équilibre ou une organisation soucieuse de la sécurité psychologique de ses équipes, la méthode Link Office vous accompagne.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/questionnaire">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Faire mon bilan personnel <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/business">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                  Découvrir les offres Entreprises
                </Button>
              </Link>
            </div>
          </section>

          {/* 6. Section "Pour aller plus loin" (Articles connexes) */}
          {media.linkedArticles.length > 0 && (
            <section className="space-y-6 pt-10 border-t border-[#E3EBE6]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-jakarta font-bold text-2xl text-[#123D46]">
                    Pour aller plus loin
                  </h2>
                  <p className="text-sm text-[#123D46]/70 mt-1">
                    D'autres clés d'analyse recommandées pour approfondir ce sujet.
                  </p>
                </div>
                <Link href="/media" className="text-xs sm:text-sm font-semibold text-[#00A99D] hover:underline hidden sm:inline-flex items-center gap-1">
                  Voir tout le catalogue <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.linkedArticles.map(article => (
                  <MediaCard key={article.id} media={article as any} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>

      <Footer />

      {/* Styles Typographiques Spécifiques au Corps de l'Article */}
      <style>{`
        .media-content-body {
          color: #123D46;
          opacity: 0.9;
          font-size: 1.125rem;
          line-height: 1.85;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 400;
        }
        .media-content-body h2 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.75rem;
          font-weight: 800;
          color: #123D46;
          margin-top: 3.25rem;
          margin-bottom: 1.25rem;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }
        .media-content-body h3 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          color: #123D46;
          margin-top: 2.25rem;
          margin-bottom: 0.875rem;
          line-height: 1.3;
        }
        .media-content-body p {
          margin-bottom: 1.5rem;
        }
        .media-content-body a {
          color: #00A99D;
          text-decoration: underline;
          text-underline-offset: 4px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .media-content-body a:hover {
          color: #007f76;
        }
        .media-content-body ul, .media-content-body ol {
          margin-bottom: 1.75rem;
          padding-left: 1.5rem;
        }
        .media-content-body ul li {
          list-style-type: disc;
          margin-bottom: 0.625rem;
        }
        .media-content-body ol li {
          list-style-type: decimal;
          margin-bottom: 0.625rem;
        }
        .media-content-body blockquote {
          border-left: 4px solid #00A99D;
          padding: 1.25rem 1.75rem;
          margin: 2.25rem 0;
          font-style: italic;
          color: #123D46;
          background: #ffffff;
          border-radius: 0 1rem 1rem 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          font-size: 1.2rem;
          line-height: 1.7;
        }
        .media-content-body blockquote p {
          margin-bottom: 0;
        }
        .media-content-body strong {
          color: #123D46;
          font-weight: 700;
        }
        .media-content-body hr {
          border: none;
          border-top: 1px solid #E3EBE6;
          margin: 3rem 0;
        }
        .media-content-body pre {
          background: #11282D;
          color: #E8F1EF;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          overflow-x: auto;
          font-size: 0.875rem;
          margin: 2rem 0;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          line-height: 1.6;
          border: 1px solid rgba(0,169,157,0.25);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .media-content-body img {
          max-width: 100%;
          border-radius: 1rem;
          margin: 2rem 0;
          border: 1px solid #E3EBE6;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
      `}</style>
    </>
  );
}
