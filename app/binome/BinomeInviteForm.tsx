"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, CheckCircle, AlertCircle, AtSign } from "lucide-react";

export function BinomeInviteForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus("idle");
    setMsg("");

    try {
      const res = await fetch("/api/binome/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMsg("Invitation envoyée ! Votre futur binôme recevra une notification.");
        setEmail("");
        router.refresh();
      } else {
        setStatus("error");
        setMsg(data.error || "Une erreur est survenue");
      }
    } catch {
      setStatus("error");
      setMsg("Impossible d'envoyer l'invitation. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Input avec icône préfixe */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-2)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}>
            <AtSign size={16} />
          </div>
          <input
            type="email"
            required
            placeholder="adresse@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "13px 16px 13px 40px",
              color: "var(--text-1)",
              fontSize: 14,
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
              boxSizing: "border-box",
            }}
            onFocus={e => {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,169,157,0.12)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !email}
          className="btn btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 999,
            padding: "13px 24px",
            fontSize: 14,
            cursor: loading || !email ? "not-allowed" : "pointer",
            opacity: loading || !email ? 0.6 : 1,
          }}
        >
          {loading
            ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Envoi en cours…</>
            : <><Send size={16} /> Envoyer l'invitation</>
          }
        </button>
      </form>

      {/* Feedback message */}
      {msg && (
        <div style={{
          marginTop: 14,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "12px 16px",
          borderRadius: 10,
          background: status === "success"
            ? "rgba(16,185,129,0.08)"
            : "rgba(239,68,68,0.08)",
          border: `1px solid ${status === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          animation: "fadeSlideIn 0.3s ease-out",
        }}>
          {status === "success"
            ? <CheckCircle size={16} style={{ color: "#10b981", flexShrink: 0, marginTop: 1 }} />
            : <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
          }
          <p style={{
            fontSize: 13,
            color: status === "success" ? "#34d399" : "#f87171",
            lineHeight: 1.5,
            margin: 0,
          }}>
            {msg}
          </p>
        </div>
      )}
    </div>
  );
}
