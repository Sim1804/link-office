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
        return <Mic className="w-3.5 h-3.5" />;
      case "VIDEO":
        return <Play className="w-3.5 h-3.5" />;
      case "INFOGRAPHIE":
      case "PORTRAIT":
        return <ImageIcon className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  const getBadgeColorClass = () => {
    switch (media.mediaType) {
      case "PODCAST":
      case "INTERVIEW":
        return "text-[#5965E8]";
      case "DOSSIER":
      case "GUIDE":
        return "text-[#B8870A]";
      default:
        return "text-[#00A99D]";
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
    <Link href={`/media/${media.slug}`} className="group h-full flex flex-col">
      <div className="bg-white rounded-3xl border border-[#E3EBE6] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group-hover:-translate-y-1">
        {/* Cover Image */}
        <div
          className="h-44 relative w-full overflow-hidden"
        >
          {media.coverImage ? (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
              style={{ backgroundImage: `url(${media.coverImage})` }} 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00A99D]/10 to-[#5965E8]/10 transition-transform duration-500 group-hover:scale-105" />
          )}
          
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold shadow-sm">
            <span className={getBadgeColorClass()}>{getIcon()}</span>
            <span className={`uppercase text-[10px] tracking-wider ${getBadgeColorClass()}`}>
              {getMediaTypeLabel()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {mainCategory && (
            <div className="flex items-center gap-1.5 text-[#123D46]/50 text-xs font-semibold mb-3 uppercase tracking-wider">
              <Folder className="w-3.5 h-3.5" />
              {mainCategory.name}
            </div>
          )}

          <h3 className="font-jakarta font-bold text-lg text-[#123D46] mb-2 leading-tight line-clamp-2 group-hover:text-[#00A99D] transition-colors">
            {media.title}
          </h3>

          <p className="text-[#123D46]/70 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
            {media.summary}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-[#E3EBE6]">
            <span className="flex items-center gap-1.5 text-[#123D46]/50 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {media.duration ? `${media.duration} min` : "Lecture rapide"}
            </span>
            <span className="text-[#00A99D] text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Découvrir <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
