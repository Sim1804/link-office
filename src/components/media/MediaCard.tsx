"use client";

import Link from "next/link";
import { Play, FileText, Mic, Image as ImageIcon, ExternalLink, Clock, Folder } from "lucide-react";
import type { MediaContent, MediaCategory } from "@prisma/client";

// Define a type that includes relations we might need
export type MediaContentWithRelations = MediaContent & {
  categories?: MediaCategory[];
};

interface MediaCardProps {
  media: MediaContentWithRelations;
}

export function MediaCard({ media }: MediaCardProps) {
  // Determine icon based on mediaType
  const getIcon = () => {
    switch (media.mediaType) {
      case "PODCAST":
      case "INTERVIEW":
        return <Mic size={14} />;
      case "VIDEO":
        return <Play size={14} />;
      case "INFOGRAPHIE":
      case "PORTRAIT":
        return <ImageIcon size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  // Human readable label for mediaType
  const getMediaTypeLabel = () => {
    const labels: Record<string, string> = {
      ARTICLE: "Article",
      INTERVIEW: "Interview",
      DOSSIER: "Dossier",
      TEMOIGNAGE: "Témoignage",
      PORTRAIT: "Portrait",
      GUIDE: "Guide",
      ANALYSE: "Analyse",
      PODCAST: "Podcast",
      INFOGRAPHIE: "Infographie",
      CHIFFRES_CLES: "Chiffres Clés",
      VIDEO: "Vidéo",
      RESSOURCE: "Ressource",
    };
    return labels[media.mediaType] || "Média";
  };

  // Find the first main category (SUJET or DIMENSION_IQRH preferably)
  const mainCategory = media.categories?.find(c => c.type === "SUJET" || c.type === "DIMENSION_IQRH") || media.categories?.[0];

  return (
    <Link href={`/media/${media.slug}`} style={{ textDecoration: "none" }}>
      <div
        className="card card-hover"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          padding: 0, // override card padding to let cover image touch edges
        }}
      >
        {/* Cover Image */}
        <div
          style={{
            height: 180,
            background: media.coverImage ? `url(${media.coverImage}) center/cover` : "linear-gradient(135deg, rgba(0,169,157,0.1), rgba(89,101,232,0.1))",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              padding: "4px 12px",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "white",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {getIcon()}
            {getMediaTypeLabel()}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", flexGrow: 1 }}>
          {mainCategory && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-2)", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              <Folder size={12} />
              {mainCategory.name}
            </div>
          )}

          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--text-1)",
              marginBottom: 8,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {media.title}
          </h3>

          <p
            style={{
              color: "var(--text-2)",
              fontSize: 14,
              lineHeight: 1.5,
              marginBottom: 16,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flexGrow: 1,
            }}
          >
            {media.summary}
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 16, borderTop: "1px solid rgba(18,61,70,0.05)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 12 }}>
              <Clock size={14} />
              {media.duration ? `${media.duration} min` : "Lecture rapide"}
            </span>
            <span style={{ color: "var(--text-2)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              Découvrir <ExternalLink size={14} color="var(--text-3)" />
            </span>
          </div>
        </div>
      </div>
      {/* Removed custom inline style for hover as we use card-hover now */}
    </Link>
  );
}
