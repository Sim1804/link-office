"use client";

import { useState, useEffect } from "react";
import { Linkedin, Twitter, Link as LinkIcon, Check } from "lucide-react";

interface ShareButtonsProps {
  url?: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(url || window.location.href);
  }, [url]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnLinkedin = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedinUrl, "_blank", "width=600,height=600");
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 500 }}>Partager :</span>
      
      <button 
        onClick={shareOnLinkedin}
        style={{ 
          width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)", color: "#f1f5f9", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(8px)"
        }}
        className="share-btn linkedin-btn"
        title="Partager sur LinkedIn"
      >
        <Linkedin size={20} />
      </button>

      <button 
        onClick={shareOnTwitter}
        style={{ 
          width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)", color: "#f1f5f9", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(8px)"
        }}
        className="share-btn twitter-btn"
        title="Partager sur X (Twitter)"
      >
        <Twitter size={20} />
      </button>

      <button 
        onClick={copyToClipboard}
        style={{ 
          width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)", color: copied ? "#34d399" : "#f1f5f9", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          backdropFilter: "blur(8px)"
        }}
        className="share-btn link-btn"
        title="Copier le lien"
      >
        {copied ? <Check size={20} /> : <LinkIcon size={20} />}
      </button>

      <style>{`
        .share-btn:hover { 
          transform: translateY(-4px) scale(1.05); 
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .linkedin-btn:hover { background: #0077b5 !important; border-color: #0077b5 !important; color: white !important; }
        .twitter-btn:hover { background: #1da1f2 !important; border-color: #1da1f2 !important; color: white !important; }
        .link-btn:hover { background: #a855f7 !important; border-color: #a855f7 !important; color: white !important; }
      `}</style>
    </div>
  );
}
