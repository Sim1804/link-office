"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function BinomeRespondButtons({ pairId }: { pairId: string }) {
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const router = useRouter();

  const handleRespond = async (accept: boolean) => {
    setLoading(accept ? "accept" : "reject");
    try {
      const res = await fetch("/api/binome/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairId, accept }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
      <button
        onClick={() => handleRespond(true)}
        disabled={loading !== null}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          borderRadius: 10,
          background: "rgba(16,185,129,0.12)",
          color: "#34d399",
          border: "1px solid rgba(16,185,129,0.25)",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading !== null ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: loading === "reject" ? 0.4 : 1,
        }}
        title="Accepter l'invitation"
      >
        {loading === "accept"
          ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          : <CheckCircle size={14} />
        }
        Accepter
      </button>
      <button
        onClick={() => handleRespond(false)}
        disabled={loading !== null}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "9px 16px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.08)",
          color: "#f87171",
          border: "1px solid rgba(239,68,68,0.2)",
          fontSize: 13,
          fontWeight: 500,
          cursor: loading !== null ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          opacity: loading === "accept" ? 0.4 : 1,
        }}
        title="Refuser l'invitation"
      >
        {loading === "reject"
          ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
          : <XCircle size={14} />
        }
        Décliner
      </button>
    </div>
  );
}
