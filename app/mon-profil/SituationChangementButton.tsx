"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function SituationChangementButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRenew = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/demographics/renew", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.assessmentId) {
        // Redirige vers le profil pour mettre à jour les données démographiques
        router.push(`/profil?tab=demographics&id=${data.assessmentId}`);
      } else {
        alert(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24, padding: 24, borderRadius: 24, border: "1px solid rgba(251,191,36,0.2)", background: "linear-gradient(145deg, rgba(251,191,36,0.05), rgba(17,24,39,0.98))" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(251,191,36,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <RefreshCw size={22} style={{ color: "#fbbf24" }} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 16, color: "#f8fafc", marginBottom: 6 }}>
            Ma situation a changé
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>
            Si vous avez changé de poste, de situation familiale, ou de mode de vie, vous pouvez mettre à jour votre profil. 
            Cela clôturera votre profil actuel et initialisera une nouvelle évaluation pour mieux vous accompagner.
          </p>
          <button 
            onClick={handleRenew}
            disabled={isLoading}
            style={{
              background: "rgba(251,191,36,0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(251,191,36,0.3)",
              padding: "10px 20px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            {isLoading ? "Préparation..." : "Mettre à jour mon profil"}
          </button>
        </div>
      </div>
    </div>
  );
}
