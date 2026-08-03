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
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, background: "var(--primary, #7c3aed)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: "#f8fafc" }}>
            Link<span style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Office</span>
          </span>
        </Link>

        {/* 404 Number */}
        <div style={{
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          background: "linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.4) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 24,
          letterSpacing: "-0.04em",
        }}>
          404
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f8fafc", marginBottom: 12 }}>
          Page introuvable
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.6, marginBottom: 36 }}>
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
          Vérifiez l&apos;URL ou retournez à l&apos;accueil.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            color: "white", textDecoration: "none", fontWeight: 600, fontSize: 14,
            boxShadow: "0 4px 20px rgba(124,58,237,0.3)",
          }}>
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "12px 24px", borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "#94a3b8", textDecoration: "none", fontWeight: 600, fontSize: 14,
          }}>
            <Search size={16} /> Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
