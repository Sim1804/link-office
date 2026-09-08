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
    <div style={{
      background: optIn
        ? "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(16,185,129,0.08) 100%)"
        : "rgba(255,255,255,0.02)",
      border: optIn ? "1px solid rgba(124,58,237,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: "24px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20,
      transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: optIn ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          border: optIn ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(255,255,255,0.06)",
          transition: "all 0.3s",
        }}>
          {optIn
            ? <Sparkles size={22} style={{ color: "#c084fc" }} />
            : <Bot size={22} style={{ color: "#475569" }} />
          }
        </div>
        <div>
          <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Suggestions intelligentes par IRIS
          </p>
          <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5 }}>
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
          width: 52,
          height: 28,
          borderRadius: 14,
          background: optIn
            ? "linear-gradient(135deg, #7c3aed, #10b981)"
            : "rgba(255,255,255,0.1)",
          border: "none",
          position: "relative",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.35s cubic-bezier(0.4,0,0.2,1)",
          flexShrink: 0,
          opacity: loading ? 0.6 : 1,
          boxShadow: optIn ? "0 0 16px rgba(124,58,237,0.35)" : "none",
        }}
      >
        <div style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: optIn ? 27 : 3,
          transition: "left 0.35s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        }} />
      </button>
    </div>
  );
}
