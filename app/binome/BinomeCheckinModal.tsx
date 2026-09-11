"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Smile, Meh, Frown, CheckCircle2, AlertCircle } from "lucide-react";

export function BinomeCheckinModal({ binomeId, onClose }: { binomeId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [mood, setMood] = useState<number | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/binome/${binomeId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          actionStatus,
          encouragement,
          checkinType: "RAPIDE"
        }),
      });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue. Veuillez réessayer.");
      }
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24, padding: 32, width: "100%", maxWidth: 500,
        position: "relative"
      }}>
        <button 
          onClick={onClose}
          style={{
            position: "absolute", top: 20, right: 20,
            background: "transparent", border: "none", color: "#64748b",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: "0 0 24px" }}>
          Check-in rapide
        </h2>

        <div style={{ display: "grid", gap: 24 }}>
          {/* Mood */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
              Comment vous sentez-vous relationnellement aujourd'hui ?
            </label>
            <div style={{ display: "flex", gap: 12 }}>
              {[
                { val: 1, icon: Frown, color: "#ef4444" },
                { val: 3, icon: Meh, color: "#f59e0b" },
                { val: 5, icon: Smile, color: "#10b981" }
              ].map(m => {
                const isSelected = mood === m.val;
                return (
                  <button
                    key={m.val}
                    onClick={() => setMood(m.val)}
                    style={{
                      flex: 1, padding: "16px", borderRadius: 16,
                      background: isSelected ? `${m.color}20` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? m.color : "rgba(255,255,255,0.05)"}`,
                      color: isSelected ? m.color : "#64748b",
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", justifyContent: "center"
                    }}
                  >
                    <m.icon size={28} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>
              Où en êtes-vous de votre action prévue ?
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Réalisée", "En cours", "Pas commencée"].map(opt => {
                const isSelected = actionStatus === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => setActionStatus(opt)}
                    style={{
                      padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                      background: isSelected ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.04)",
                      color: isSelected ? "#38bdf8" : "#94a3b8",
                      border: `1px solid ${isSelected ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.1)"}`,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
              Un mot pour votre binôme ? (Facultatif)
            </label>
            <textarea
              value={encouragement}
              onChange={(e) => setEncouragement(e.target.value)}
              placeholder="Ex: J'ai réussi mon défi ce matin !"
              style={{
            width: "100%", padding: "12px 16px", borderRadius: 12,
              background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#f8fafc", fontSize: 14, minHeight: 80,
              resize: "none", boxSizing: "border-box" as const, fontFamily: "inherit",
              outline: "none",
              }}
            />
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            marginTop: 12,
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            animation: "fadeSlideIn 0.25s ease-out",
          }}>
            <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
            <span style={{ color: "#f87171", fontSize: 13 }}>{error}</span>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || mood === null || actionStatus === null}
          style={{
            width: "100%", marginTop: 24, padding: "14px", borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", border: "none", fontSize: 15, fontWeight: 700,
            cursor: (loading || mood === null || actionStatus === null) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: (mood === null || actionStatus === null) ? 0.5 : 1
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={18} />}
          Envoyer mon Check-in
        </button>
      </div>
    </div>
  );
}
