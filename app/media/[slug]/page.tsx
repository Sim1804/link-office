import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AudioPlayer } from "@/components/media/AudioPlayer";
import { EclaireurCard } from "@/components/media/EclaireurCard";
import { ShareButtons } from "@/components/media/ShareButtons";
import { MediaCard } from "@/components/media/MediaCard";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, Folder, FileText } from "lucide-react";

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
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", paddingTop: 100, paddingBottom: 80 }}>
        
        {/* Cover Section - Classic Header */}
        <div style={{ paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 40 }}>
          {/* Header Image if any, displayed as a clean banner, not a blurry background */}
          {media.coverImage && (
            <div className="container" style={{ marginBottom: 40 }}>
              <img 
                src={media.coverImage} 
                alt={media.title} 
                style={{ width: "100%", height: 400, objectFit: "cover", borderRadius: 16 }}
              />
            </div>
          )}
          
          <div className="container">
            <Link href="/media" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#94a3b8", textDecoration: "none", marginBottom: 32, fontSize: 14, fontWeight: 500 }} className="hover-text-white">
              <ArrowLeft size={16} /> Retour aux médias
            </Link>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <span style={{ padding: "4px 12px", borderRadius: 4, background: "rgba(255,255,255,0.1)", color: "#f8fafc", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {media.mediaType.replace("_", " ")}
              </span>
              {mainCategory && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.15)", color: "#cbd5e1", fontSize: 12, fontWeight: 500 }}>
                  <Folder size={12} /> {mainCategory.name}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: "#f8fafc", marginBottom: 24, lineHeight: 1.2, fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 900 }}>
              {media.title}
            </h1>

            {media.summary && (
               <p style={{ fontSize: 20, color: "#94a3b8", lineHeight: 1.6, maxWidth: 800, marginBottom: 40, fontWeight: 400 }}>
                {media.summary}
              </p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, maxWidth: 900 }}>
              {formattedDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14 }}>
                  <Calendar size={16} /> Publié le {formattedDate}
                </div>
              )}
              {media.duration && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14 }}>
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
                  color: "#e2e8f0", fontSize: 18, lineHeight: 1.8, 
                  fontFamily: "Inter, sans-serif"
                }}
              />

              {/* Transcription (if Podcast) */}
              {isPodcast && media.transcript && (
                <div style={{ marginTop: 60, padding: 32, background: "rgba(15,23,42,0.8)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                    <FileText size={20} style={{ color: "#94a3b8" }} />
                    Transcription intégrale
                  </h3>
                  <div style={{ color: "#cbd5e1", fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "Inter, sans-serif" }}>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12 }}>
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
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Thématiques
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {media.categories.map(c => (
                      <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: 13 }}>
                        <Tag size={12} style={{ color: "#94a3b8" }} /> {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Content */}
        {media.linkedArticles.length > 0 && (
          <div className="container" style={{ marginTop: 80, paddingTop: 60, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", marginBottom: 32 }}>Pour aller plus loin</h2>
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
        .hover-text-white:hover { color: #f8fafc !important; }
        
        /* Styles pour le contenu riche - Typographie Journalistique Classique */
        .media-content-body {
          color: #d1d5db;
          font-size: 18px;
          line-height: 1.8;
          font-family: 'Inter', -apple-system, sans-serif;
          font-weight: 400;
        }
        .media-content-body h2 {
          font-size: 26px; font-weight: 700; color: #f8fafc; margin: 48px 0 20px; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .media-content-body h3 {
          font-size: 20px; font-weight: 600; color: #e2e8f0; margin: 36px 0 16px; font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .media-content-body p { margin-bottom: 24px; }
        .media-content-body a { 
          color: #e2e8f0; text-decoration: underline; text-decoration-color: #64748b; text-underline-offset: 4px; transition: all 0.2s; font-weight: 500;
        }
        .media-content-body a:hover { 
          color: #ffffff; text-decoration-color: #ffffff;
        }
        .media-content-body ul, .media-content-body ol { margin-bottom: 24px; padding-left: 24px; }
        .media-content-body li { margin-bottom: 8px; }
        .media-content-body blockquote {
          border-left: 3px solid #64748b; padding: 16px 24px; margin: 32px 0; font-style: italic; color: #94a3b8; 
          background: rgba(255,255,255,0.03); 
          font-size: 19px; line-height: 1.7;
        }
        .media-content-body img { max-width: 100%; border-radius: 8px; margin: 32px 0; border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </>
  );
}
