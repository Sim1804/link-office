"use client";

import { useState } from "react";

const MOODS = [
  { id: "TRES_BIEN",     label: "Très bien",   color: "#10b981", borderColor: "rgba(16,185,129,0.35)",  bg: "rgba(16,185,129,0.08)"  },
  { id: "PLUTOT_BIEN",   label: "Plutôt bien", color: "var(--primary)", borderColor: "rgba(0,169,157,0.35)", bg: "rgba(0,169,157,0.08)" },
  { id: "MITIGE",        label: "Mitigé(e)",   color: "var(--text-2)", borderColor: "var(--border-strong)", bg: "var(--surface-2)"     },
  { id: "FRAGILE",       label: "Fragile",      color: "#6366f1", borderColor: "rgba(99,102,241,0.35)",  bg: "rgba(99,102,241,0.08)"  },
  { id: "EN_DIFFICULTE", label: "Difficile",   color: "#ef4444", borderColor: "rgba(239,68,68,0.35)",   bg: "rgba(239,68,68,0.08)"   },
];

export function MeteoWidget() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (moodId: string) => {
    setSelectedMood(moodId);
    setLoading(true);
    try {
      const res = await fetch("/api/carnet/meteo", {
        method: "POST",
        body: JSON.stringify({ weather: moodId }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) setSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const mood = MOODS.find((m) => m.id === selectedMood);
    return (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "6px 16px", borderRadius: 16,
        background: "rgba(0,169,157,0.08)", border: "1px solid rgba(0,169,157,0.3)",
        fontSize: 13, fontWeight: 600, color: "var(--primary)",
      }}>
        ✓ {mood?.label}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span style={{
        fontSize: 12, fontWeight: 600, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}>
        Aujourd'hui
      </span>

      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", scrollbarWidth: "none" }}>
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleSubmit(mood.id)}
              disabled={loading}
              title={mood.label}
              style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 16px", borderRadius: 16, fontFamily: "inherit",
                border: isSelected ? `1px solid ${mood.borderColor}` : "1px solid var(--border)",
                background: isSelected ? mood.bg : "var(--surface)",
                color: isSelected ? mood.color : "var(--text-2)",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
                whiteSpace: "nowrap",
                opacity: loading && !isSelected ? 0.4 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = mood.bg;
                  e.currentTarget.style.borderColor = mood.borderColor;
                  e.currentTarget.style.color = mood.color;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-2)";
                }
              }}
            >
              {mood.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
