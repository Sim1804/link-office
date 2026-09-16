/**
 * app/loading.tsx — Skeleton loader global entre les navigations
 * Affiché automatiquement par Next.js lors des transitions de pages.
 */
export default function Loading() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: "-15%", right: "-8%", width: 600, height: 600,
        background: "radial-gradient(circle, rgba(0,169,157,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Spinner animé */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}>
        {/* Logo animé */}
        <div style={{
          width: 52, height: 52,
          background: "linear-gradient(135deg, var(--indigo) 0%, var(--primary) 100%)",
          borderRadius: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 32px rgba(0,169,157,0.2)",
          animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3z"/>
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3z"/>
          </svg>
        </div>

        {/* Texte */}
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-family-display)",
            fontSize: 15, fontWeight: 600, color: "var(--text-2)",
            animation: "fadePulse 1.5s ease-in-out infinite",
          }}>
            Chargement…
          </div>
        </div>

        {/* Barre de progression animée */}
        <div style={{
          width: 200, height: 3,
          background: "var(--border)",
          borderRadius: 999,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            background: "linear-gradient(90deg, var(--indigo), var(--primary))",
            borderRadius: 999,
            animation: "loadingBar 1.8s ease-in-out infinite",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes fadePulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes loadingBar {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
