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
    <div className="card" style={{
      padding: "32px",
    }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "rgba(0,169,157,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
          border: "1px solid rgba(0,169,157,0.2)"
        }}>
          <HandHeart size={28} style={{ color: "var(--primary)" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", marginBottom: 12 }}>
          Et si vous n&apos;avanciez pas seul ?
        </h2>
        <p style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
          IRIS peut vous proposer un Binôme Relationnel : une personne avec laquelle progresser, vous encourager et relever vos défis relationnels pendant 30 jours.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "var(--surface-2)", padding: 20, borderRadius: 16, border: "1px solid var(--border)" }}>
          <Sparkles size={20} style={{ color: "var(--primary)", marginBottom: 12 }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>Matching intelligent</h3>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
            IRIS analyse les profils pour suggérer des binômes complémentaires. Vous avez toujours le dernier mot.
          </p>
        </div>
        <div style={{ background: "var(--surface-2)", padding: 20, borderRadius: 16, border: "1px solid var(--border)" }}>
          <ShieldCheck size={20} style={{ color: "var(--primary)", marginBottom: 12 }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)", marginBottom: 6 }}>Cadre bienveillant</h3>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, lineHeight: 1.5 }}>
            Respect, confidentialité et absence de jugement. Le programme est anonymisé et sécurisé par LINK OFFICE.
          </p>
        </div>
      </div>

      <div style={{ background: "var(--surface-2)", padding: 20, borderRadius: 12, marginBottom: 32, border: "1px solid var(--border)" }}>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Info size={16} style={{ color: "var(--primary)" }} />
          La Charte du Binôme
        </h4>
        <ul style={{ fontSize: 13, color: "var(--text-2)", paddingLeft: 20, margin: 0, lineHeight: 1.6 }}>
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
          className="btn btn-primary btn-md"
          style={{
            borderRadius: 999,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
          Accepter et configurer mes préférences
        </button>
      </div>
    </div>
  );
}
