import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLoading() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        <div className="page-container">
          <div style={{
            display: "flex", flexDirection: "column", gap: 24,
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}>
            {/* Header Skeleton */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, background: "rgba(255,255,255,0.05)", borderRadius: 16 }} />
              <div>
                <div style={{ width: 250, height: 24, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 8 }} />
                <div style={{ width: 150, height: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }} />
              </div>
            </div>

            {/* Weather / Alert Skeleton */}
            <div style={{ width: "100%", height: 140, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }} />

            {/* Grid Skeleton */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              <div style={{ height: 350, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }} />
              <div style={{ height: 350, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }} />
            </div>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </>
  );
}
