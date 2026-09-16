/**
 * app/not-found.tsx — Page 404 personnalisée LinkOffice
 */
import Link from "next/link";
import { Brain, Home, Search } from "lucide-react";

export const metadata = {
  title: "Page introuvable — LinkOffice",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
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
      {/* Glow blobs (subtle light) */}
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,169,157,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(89,101,232,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

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

        {/* 404 Number */}
        <div style={{
          fontFamily: "var(--font-family-display)",
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          color: "var(--primary)",
          marginBottom: 24,
          letterSpacing: "-0.04em",
          opacity: 0.1
        }}>
          404
        </div>

        <h1 style={{ fontFamily: "var(--font-family-display)", fontSize: 28, fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
          Page introuvable
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 36 }}>
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-primary btn-lg" style={{ textDecoration: "none" }}>
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
          <Link href="/dashboard" className="btn btn-tertiary btn-lg" style={{ textDecoration: "none" }}>
            <Search size={16} /> Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
