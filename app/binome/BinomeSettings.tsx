"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles } from "lucide-react";

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
    <div className="card" style={{
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20,
      transition: "border-color 0.3s",
      borderColor: optIn ? "rgba(0,169,157,0.35)" : "var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: optIn ? "rgba(0,169,157,0.1)" : "var(--surface-2)",
          border: `1px solid ${optIn ? "rgba(0,169,157,0.25)" : "var(--border)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.3s",
        }}>
          {optIn
            ? <Sparkles size={20} style={{ color: "var(--primary)" }} />
            : <Bot size={20} style={{ color: "var(--text-2)" }} />
          }
        </div>
        <div>
          <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14, marginBottom: 3 }}>
            Suggestions intelligentes par IRIS
          </p>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.5, margin: 0 }}>
            {optIn
              ? "IRIS analyse votre profil anonymisé pour vous suggérer des partenaires complémentaires."
              : "Activez cette option pour que IRIS vous propose des binômes adaptés à votre profil."}
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <button
        onClick={toggleOptIn}
        disabled={loading}
        aria-label={optIn ? "Désactiver les suggestions IRIS" : "Activer les suggestions IRIS"}
        style={{
          width: 50, height: 26, borderRadius: 13,
          background: optIn ? "var(--primary)" : "var(--border-strong)",
          border: "none", position: "relative",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.3s",
          flexShrink: 0,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%",
          background: "#fff",
          position: "absolute", top: 3,
          left: optIn ? 27 : 3,
          transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}
