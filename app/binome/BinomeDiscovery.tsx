"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Sparkles, HandHeart, ShieldCheck, Loader2 } from "lucide-react";

export function BinomeDiscovery() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOptIn = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/binome/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: true, charterVersion: "1.0" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(6,182,212,0.05) 100%)",
      border: "1px solid rgba(124,58,237,0.15)",
      borderRadius: 20,
      padding: "32px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(124,58,237,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          border: "1px solid rgba(124,58,237,0.2)"
        }}>
          <HandHeart size={28} style={{ color: "#7c3aed" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", marginBottom: 12 }}>
          Et si vous n&apos;avanciez pas seul ?
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
          IRIS peut vous proposer un Binôme Relationnel : une personne avec laquelle progresser, vous encourager et relever vos défis relationnels pendant 30 jours.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
          <Sparkles size={20} style={{ color: "#a855f7", marginBottom: 12 }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Matching intelligent</h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            IRIS analyse les profils pour suggérer des binômes complémentaires. Vous avez toujours le dernier mot.
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
          <ShieldCheck size={20} style={{ color: "#10b981", marginBottom: 12 }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 6 }}>Cadre bienveillant</h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
            Respect, confidentialité et absence de jugement. Le programme est anonymisé et sécurisé par LINK OFFICE.
          </p>
        </div>
      </div>

      <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 12, marginBottom: 32 }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={16} style={{ color: "#38bdf8" }} />
          La Charte du Binôme
        </h4>
        <ul style={{ fontSize: 13, color: "#94a3b8", paddingLeft: 20, margin: 0, lineHeight: 1.6 }}>
          <li>Bienveillance, respect et absence de jugement.</li>
          <li>Confidentialité absolue de vos échanges.</li>
          <li>Liberté de ne pas répondre ou de quitter le binôme à tout moment.</li>
          <li>Aucune vocation sentimentale, sexuelle, ou thérapeutique.</li>
        </ul>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={handleOptIn}
          disabled={loading}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", border: "none", padding: "14px 28px", borderRadius: 12,
            fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(124,58,237,0.3)"
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          Accepter et configurer mes préférences
        </button>
      </div>
    </div>
  );
}
