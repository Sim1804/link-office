import { User, Star, Briefcase } from "lucide-react";
import type { MediaEclaireur } from "@prisma/client";

interface EclaireurCardProps {
  eclaireur: MediaEclaireur;
}

export function EclaireurCard({ eclaireur }: EclaireurCardProps) {
  const isPro = eclaireur.type === "PROFESSIONNEL";

  return (
    <div style={{
      border: `1px solid ${isPro ? "rgba(56,189,248,0.2)" : "rgba(236,72,153,0.2)"}`,
      display: "flex",
      flexDirection: "column",
      gap: 20,
      position: "relative",
      overflow: "hidden",
    }} className="card card-hover">

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, zIndex: 1 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: eclaireur.photoUrl ? `url(${eclaireur.photoUrl}) center/cover` : "rgba(255,255,255,0.05)",
          border: `2px solid ${isPro ? "#38bdf8" : "#ec4899"}`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {!eclaireur.photoUrl && <User size={28} color="#94a3b8" />}
        </div>
        
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, marginBottom: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1" }}>
            {isPro ? <Briefcase size={12} color="#94a3b8" /> : <Star size={12} color="#94a3b8" />}
            {isPro ? "Professionnel / Expert" : "Témoin"}
          </div>
          <h4 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, margin: 0 }}>
            {eclaireur.name}
          </h4>
          {eclaireur.profession && (
            <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>{eclaireur.profession}</div>
          )}
        </div>
      </div>

      {eclaireur.bio && (
        <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.6, margin: 0, padding: "16px 0 0 0", borderTop: "1px solid rgba(255,255,255,0.08)", zIndex: 1 }}>
          {eclaireur.bio}
        </p>
      )}
    </div>
  );
}
