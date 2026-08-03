"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";

export function BinomeRespondButtons({ pairId }: { pairId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRespond = async (accept: boolean) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader2 style={{ width: 20, height: 20, color: "#94a3b8", animation: "spin 1s linear infinite" }} />;
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button 
        onClick={() => handleRespond(true)}
        style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        title="Accepter"
      >
        <Check style={{ width: 18, height: 18 }} />
      </button>
      <button 
        onClick={() => handleRespond(false)}
        style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        title="Refuser"
      >
        <X style={{ width: 18, height: 18 }} />
      </button>
    </div>
  );
}
