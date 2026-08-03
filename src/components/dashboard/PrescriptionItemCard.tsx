"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function PrescriptionItemCard({ item }: { item: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isCompleted = item.status === "COMPLETED";
  const points = item.libraryItem?.data?.points || 50;

  const handleComplete = async () => {
    if (isCompleted || item.kind !== "MICRO_CHALLENGE") return;
    setLoading(true);
    try {
      const res = await fetch("/api/gamification/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionItemId: item.id }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        console.error("Erreur de complétion");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className={`card ${!isCompleted ? 'card-hover' : ''}`}
      style={{
        padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between",
        ...(isCompleted ? { background: "rgba(16, 185, 129, 0.05)", borderColor: "rgba(16, 185, 129, 0.2)" } : {})
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            color: item.kind === "MICRO_CHALLENGE" ? "#38bdf8" : "#c084fc",
            background: item.kind === "MICRO_CHALLENGE" ? "rgba(56,189,248,0.12)" : "rgba(192,132,252,0.12)",
            padding: "2px 8px", borderRadius: 6,
          }}>
            {item.kind === "MICRO_CHALLENGE" ? "🎯 Micro-défi" : "💡 Recommandation"}
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>#{item.position}</span>
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", marginBottom: 6 }}>
          {item.libraryItem?.title}
        </h4>
        <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
          {item.rationale}
        </p>
      </div>

      {item.kind === "MICRO_CHALLENGE" && (
        <button
          onClick={handleComplete}
          disabled={isCompleted || loading}
          className={`btn ${isCompleted ? 'btn-ghost' : 'btn-primary'}`}
          style={{
            marginTop: 16, width: "100%", padding: "10px", 
            ...(isCompleted ? { background: "rgba(16, 185, 129, 0.15)", color: "#34d399", cursor: "default" } : {})
          }}
        >
          {loading ? (
            <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} />
          ) : isCompleted ? (
            <>
              <Check style={{ width: 16, height: 16 }} /> Complété (+{points} pts)
            </>
          ) : (
            `Valider ce défi (+${points} pts)`
          )}
        </button>
      )}
    </div>
  );
}
