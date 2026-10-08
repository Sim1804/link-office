"use client";

import { useState, useEffect } from "react";
import { Linkedin, Twitter, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  url?: string;
  title: string;
  showLabel?: boolean;
}

export function ShareButtons({ url, title, showLabel = true }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(url || window.location.href);
  }, [url]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const shareOnLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedinUrl, "_blank", "width=600,height=600,noopener,noreferrer");
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400,noopener,noreferrer");
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showLabel && (
        <span className="text-xs font-semibold text-[#123D46]/60 uppercase tracking-wider hidden sm:inline-block">
          Partager
        </span>
      )}

      {/* Bouton LinkedIn */}
      <button
        type="button"
        onClick={shareOnLinkedin}
        aria-label="Partager sur LinkedIn"
        title="Partager sur LinkedIn"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-[#0077b5] hover:border-[#0077b5]/30 hover:bg-[#0077b5]/5 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
      >
        <Linkedin className="w-4 h-4" />
      </button>

      {/* Bouton X / Twitter */}
      <button
        type="button"
        onClick={shareOnTwitter}
        aria-label="Partager sur X (Twitter)"
        title="Partager sur X"
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E3EBE6] text-[#123D46]/70 hover:text-black hover:border-black/30 hover:bg-black/5 flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5"
      >
        <Twitter className="w-4 h-4" />
      </button>

      {/* Bouton Copier le lien avec feedback */}
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label="Copier le lien"
        title={copied ? "Lien copié !" : "Copier le lien"}
        className={`relative h-9 sm:h-10 px-3 rounded-full border transition-all duration-200 flex items-center gap-1.5 text-xs font-semibold shadow-sm hover:shadow hover:-translate-y-0.5 ${
          copied
            ? "bg-[#00A99D] border-[#00A99D] text-white"
            : "bg-white border-[#E3EBE6] text-[#123D46]/70 hover:text-[#00A99D] hover:border-[#00A99D]/40 hover:bg-[#00A99D]/5"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Copié !</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            <span className="hidden md:inline">Copier</span>
          </>
        )}
      </button>
    </div>
  );
}
