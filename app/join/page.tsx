"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Key, ArrowRight, ShieldCheck } from "lucide-react";

export default function JoinCampaignPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/campaigns/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codeAccess: code.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Rediriger vers l'onboarding normal, l'assessment est maintenant rattaché à la campagne
        router.push("/profil?onboarding=true");
      } else {
        setError(data.error || "Code invalide ou expiré.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
        {/* Blobs */}
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div className="card" style={{ maxWidth: 460, width: "100%", padding: 40, position: "relative", zIndex: 1, background: "rgba(17,24,39,0.8)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, background: "rgba(124,58,237,0.15)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key size={32} color="#a78bfa" />
            </div>
          </div>
          
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 24, color: "#f8fafc", textAlign: "center", marginBottom: 12 }}>
            Rejoindre une campagne
          </h1>
          <p style={{ color: "#94a3b8", textAlign: "center", fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
            Saisissez le code d'accès fourni par votre organisation (entreprise, collectivité, mutuelle) pour accéder à votre espace dédié.
          </p>

          <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#cbd5e1", marginBottom: 8, fontWeight: 500 }}>Code d'accès</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: MAIRIE-LYON-2026"
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 12, fontSize: 15, fontFamily: "inherit",
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f8fafc", outline: "none", transition: "all 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#a78bfa"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 10, color: "#f43f5e", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={16} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", color: "white",
                border: "none", cursor: (loading || !code.trim()) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 4px 14px rgba(124,58,237,0.3)", opacity: (loading || !code.trim()) ? 0.7 : 1,
                transition: "all 0.2s"
              }}
            >
              {loading ? "Vérification..." : <>Continuer <ArrowRight size={18} /></>}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#64748b", fontSize: 12 }}>
            <ShieldCheck size={14} /> Vos données restent strictement confidentielles et anonymisées.
          </div>
        </div>
      </main>
    </>
  );
}

function ShieldAlert({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
      <path d="m12 8-1.5 2.5h3L12 16"/>
    </svg>
  );
}
