import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { EclaireurCard } from "@/components/media/EclaireurCard";
import { ShareButtons } from "@/components/media/ShareButtons";
import { MediaCard } from "@/components/media/MediaCard";
import { ReadingProgress } from "@/components/media/ReadingProgress";
import Link from "next/link";
import { ChevronRight, Clock, Calendar, Tag, Folder, FileText, ArrowRight, Zap } from "lucide-react";

export const revalidate = 60; // ISR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const media = await prisma.mediaContent.findUnique({ where: { slug: resolvedParams.slug } });
  
  if (!media) return { title: "Non trouvé" };
  
  return {
    title: `${media.title} — LINK OFFICE`,
    description: media.summary || "Découvrez ce contenu sur LINK OFFICE.",
    openGraph: {
      images: media.coverImage ? [media.coverImage] : [],
    }
  };
}

export default async function MediaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
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
  const formattedDate = media.publishedAt ? new Date(media.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  
  const mainCategory = media.categories.find(c => c.type === "SUJET") || media.categories[0];

  return (
    <>
      <ReadingProgress />
      <PublicNavbar />
      <main style={{ minHeight: "100vh", background: "var(--bg)", paddingTop: 100, paddingBottom: 80 }}>
        
        {/* Cover Section - Classic Header */}
        <div style={{ paddingBottom: 40, borderBottom: "1px solid var(--border)", marginBottom: 40 }}>
          
          {/* Header Image if any, displayed as a clean banner, NOT displayed if it's a Podcast (since AudioPlayer will handle it) */}
          {media.coverImage && !isPodcast && (
            <div className="container" style={{ marginBottom: 40 }}>
              <img 
                src={media.coverImage} 
                alt={media.title} 
                style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 16 }}
              />
            </div>
          )}
          
          <div className="container">
            {/* Breadcrumb */}
            <nav style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", marginBottom: 32, fontSize: 14, fontWeight: 500, flexWrap: "wrap" }}>
              <Link href="/" className="hover-text-primary" style={{ color: "var(--text-3)", textDecoration: "none" }}>Accueil</Link>
              <ChevronRight size={14} />
              <Link href="/media" className="hover-text-primary" style={{ color: "var(--text-3)", textDecoration: "none" }}>Média</Link>
              <ChevronRight size={14} />
              <Link href={`/media?type=${media.mediaType}`} className="hover-text-primary" style={{ color: "var(--text-3)", textDecoration: "none" }}>
                {media.mediaType === "PODCAST" ? "Podcasts" : media.mediaType === "ARTICLE" ? "Articles" : media.mediaType}
              </Link>
              <ChevronRight size={14} />
              <span style={{ color: "var(--text-2)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{media.title}</span>
            </nav>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <span style={{ padding: "4px 16px", borderRadius: 999, background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--text-2)", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {media.mediaType.replace("_", " ")}
              </span>
              {mainCategory && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 16px", borderRadius: 999, border: "1px solid var(--border)", color: "var(--text-3)", fontSize: 12, fontWeight: 500 }}>
                  <Folder size={12} /> {mainCategory.name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "var(--text-1)", marginBottom: 24, lineHeight: 1.2, fontFamily: "var(--font-family-display)", maxWidth: 900 }}>
              {media.title}
            </h1>

            {media.summary && (
               <p style={{ fontSize: 20, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 800, marginBottom: 40, fontWeight: 400 }}>
                {media.summary}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 24, maxWidth: 900 }}>
              {formattedDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 14 }}>
                  <Calendar size={16} /> Publié le {formattedDate}
                </div>
              )}
              {media.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)", fontSize: 14 }}>
                  <Clock size={16} /> {media.duration} min {isPodcast ? "d'écoute" : "de lecture"}
                </div>
              )}
              <div style={{ marginLeft: "auto" }}>
                <ShareButtons title={media.title} />
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div style={{ display: "flex", gap: 40, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Main Content Column */}
            <div style={{ flex: "1 1 600px", maxWidth: 800 }}>
              
              {/* Podcast Audio Player */}
              {isPodcast && media.audioUrl && (
                <div style={{ marginBottom: 40 }}>
                  <AudioPlayer 
                    src={media.audioUrl} 
                    title={media.title} 
                    coverImage={media.coverImage || undefined}
                    eclaireurName={media.eclaireurs.length > 0 ? media.eclaireurs.map(e => e.name).join(", ") : undefined}
                  />
                </div>
              )}

              {/* Rich Text / Markdown Content */}
              <div 
                className="media-content-body"
                dangerouslySetInnerHTML={{ __html: media.content }} 
                style={{ 
                  color: "var(--text-2)", fontSize: 18, lineHeight: 1.8, 
                  fontFamily: "Inter, sans-serif"
                }}
              />

              {/* Transcription (if Podcast) */}
              {isPodcast && media.transcript && (
                <div style={{ marginTop: 60, padding: 32, background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                    <FileText size={20} style={{ color: "var(--text-2)" }} />
                    Transcription intégrale
                  </h3>
                  <div style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif" }}>
                    {media.transcript}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <div style={{ flex: "1 1 300px", maxWidth: 400, display: "flex", flexDirection: "column", gap: 32, position: "sticky", top: 120, height: "fit-content" }}>
              
              {/* Eclaireurs (Guests/Authors) */}
              {media.eclaireurs.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
                    Dans cet épisode
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {media.eclaireurs.map(e => (
                      <EclaireurCard key={e.id} eclaireur={e} />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories / Tags */}
              {media.categories.length > 0 && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, borderBottom: "1px solid var(--border)", paddingBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Thématiques
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {media.categories.map(c => (
                      <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: 13 }}>
                        <Tag size={12} style={{ color: "var(--text-2)" }} /> {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Call To Action (Conversion) */}
        <div className="container" style={{ marginTop: 60 }}>
          <div style={{ 
            background: "linear-gradient(135deg, rgba(89,101,232,0.1), rgba(0,169,157,0.1))", 
            border: "1px solid var(--border)", borderRadius: 24, padding: "48px 32px", 
            textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 
          }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
              <Zap size={28} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 12, fontFamily: "var(--font-family-display)" }}>
                Passez de la théorie à la pratique
              </h2>
              <p style={{ fontSize: 18, color: "var(--text-2)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
                Mesurez la santé relationnelle de votre organisation et identifiez vos leviers d'action grâce à la méthode IQRH.
              </p>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/business" className="btn btn-primary" style={{ padding: "14px 28px", fontSize: 16 }}>
                Découvrir nos solutions
              </Link>
              <Link href="/auth/register" className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: 16 }}>
                Créer un compte <ArrowRight size={18} style={{ marginLeft: 6 }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Content */}
        {media.linkedArticles.length > 0 && (
          <div className="container" style={{ marginTop: 80, paddingTop: 60, borderTop: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 32 }}>Pour aller plus loin</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {media.linkedArticles.map(article => (
                <MediaCard key={article.id} media={article as any} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />

      <style>{`
        .hover-text-white:hover { color: var(--primary) !important; }
        
        /* Styles pour le contenu riche - Typographie Journalistique Classique */
        .media-content-body {
          color: var(--text-2);
          font-size: 18px;
          line-height: 1.8;
          font-family: 'Inter', -apple-system, sans-serif;
          font-weight: 400;
        }
        .media-content-body h2 {
          font-size: 26px; font-weight: 700; color: var(--text-1); margin: 48px 0 20px; font-family: 'var(--font-family-display)', sans-serif;
        }
        .media-content-body h3 {
          font-size: 20px; font-weight: 600; color: var(--text-1); margin: 36px 0 16px; font-family: 'var(--font-family-display)', sans-serif;
        }
        .media-content-body p { margin-bottom: 24px; }
        .media-content-body a { 
          color: var(--text-1); text-decoration: underline; text-decoration-color: var(--text-3); text-underline-offset: 4px; transition: all 0.2s; font-weight: 500;
        }
        .media-content-body a:hover { 
          color: var(--primary); text-decoration-color: var(--primary);
        }
        .media-content-body ul, .media-content-body ol { margin-bottom: 24px; padding-left: 24px; }
        .media-content-body li { margin-bottom: 8px; }
        .media-content-body blockquote {
          border-left: 3px solid var(--primary); padding: 16px 24px; margin: 32px 0; font-style: italic; color: var(--text-2); 
          background: var(--surface); 
          font-size: 19px; line-height: 1.7; border-radius: 0 8px 8px 0;
        }
        .media-content-body img { max-width: 100%; border-radius: 8px; margin: 32px 0; border: 1px solid var(--border); }
      `}</style>
    </>
  );
}
