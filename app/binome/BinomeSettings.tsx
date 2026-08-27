"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BinomeSettings({ initialOptIn }: { initialOptIn: boolean }) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleOptIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/binome/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchingOptIn: !optIn }),
      });
      if (res.ok) {
        setOptIn(!optIn);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: 16, borderRadius: 12, marginBottom: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
      <div>
        <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>Recommandations par IRIS</p>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
          J'accepte que l'assistant IA analyse mon profil de façon anonyme pour me suggérer des partenaires compatibles au sein de ma campagne.
        </p>
      </div>
      <button 
        onClick={toggleOptIn}
        disabled={loading}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: optIn ? "#10b981" : "rgba(255,255,255,0.1)",
          border: "none",
          position: "relative",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.3s"
        }}
      >
        <div style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 2,
          left: optIn ? 22 : 2,
          transition: "left 0.3s"
        }} />
      </button>
    </div>
  );
}
