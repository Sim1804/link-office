"use client";

/**
 * app/error.tsx — Page d'erreur globale LinkOffice
 * Capte les erreurs non-gérées dans le tree React.
 */
import { useEffect } from "react";
import Link from "next/link";
import { Brain, RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production, envoyer l'erreur à un service de monitoring (Sentry, etc.)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0f19",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Plus Jakarta Sans', Inter, sans-serif",
    }}>
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(244,63,94,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: "#7c3aed", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#f8fafc" }}>
            Link<span style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Office</span>
          </span>
        </Link>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "rgba(244,63,94,0.1)",
          border: "1px solid rgba(244,63,94,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <AlertTriangle size={36} color="#f43f5e" />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>
          Une erreur est survenue
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 36 }}>
          Nous rencontrons un problème technique. Votre progression est sauvegardée.
          Essayez de recharger la page ou retournez à l&apos;accueil.
        </p>

        {error.digest && (
          <p style={{ fontSize: 12, color: "#334155", marginBottom: 24, fontFamily: "monospace" }}>
            Référence : {error.digest}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "12px 24px", borderRadius: 12,
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              color: "white", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 14, fontFamily: "inherit",
              boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
            }}
          >
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#94a3b8", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
