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
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow blobs */}
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,169,157,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: "var(--primary)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-family-display)", fontWeight: 700, fontSize: 20, color: "var(--text-1)" }}>
            Link<span style={{ color: "var(--primary)" }}>Office</span>
          </span>
        </Link>

        {/* Icon */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: "rgba(225,29,72,0.05)",
          border: "1px solid rgba(225,29,72,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
        }}>
          <AlertTriangle size={36} color="#e11d48" />
        </div>

        <h1 style={{ fontFamily: "var(--font-family-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
          Une erreur est survenue
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 36 }}>
          Nous rencontrons un problème technique. Votre progression est sauvegardée.
          Essayez de recharger la page ou retournez à l&apos;accueil.
        </p>

        {error.digest && (
          <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 24, fontFamily: "monospace" }}>
            Référence : {error.digest}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={reset} className="btn btn-primary btn-lg">
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link href="/" className="btn btn-tertiary btn-lg" style={{ textDecoration: "none" }}>
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
