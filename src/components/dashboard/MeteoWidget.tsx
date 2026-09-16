"use client";

import { useState } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Zap, Check } from "lucide-react";

const MOODS = [
  { id: "TRES_BIEN", icon: Sun, label: "Très bien", color: "#f59e0b" },
  { id: "PLUTOT_BIEN", icon: CloudSun, label: "Plutôt bien", color: "#10b981" },
  { id: "MITIGE", icon: Cloud, label: "Mitigé(e)", color: "var(--text-2)" },
  { id: "FRAGILE", icon: CloudRain, label: "Fragile", color: "#6366f1" },
  { id: "EN_DIFFICULTE", icon: Zap, label: "En difficulté", color: "#ef4444" },
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
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        background: "rgba(0,169,157,0.05)", border: "1px solid rgba(0,169,157,0.2)",
        padding: "16px 24px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12,
        color: "var(--primary)", fontSize: 14, fontWeight: 700, animation: "fadeSlideIn 0.3s ease-out"
      }}>
        <Check size={20} />
        Météo du jour enregistrée ! Merci pour votre check-in.
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      padding: "16px 24px", borderRadius: 16, marginBottom: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
    }}>
      <h3 style={{ color: "var(--text-1)", fontSize: 14, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
        Comment vous sentez-vous dans vos relations aujourd'hui ?
      </h3>
      <div style={{ display: "flex", gap: 8 }}>
        {MOODS.map(mood => {
          const Icon = mood.icon;
          return (
            <button
              key={mood.id}
              onClick={() => handleSubmit(mood.id)}
              disabled={loading}
              title={mood.label}
              style={{
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "50%", cursor: "pointer", transition: "all 0.2s",
                opacity: loading && selectedMood !== mood.id ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.borderColor = mood.color;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Icon size={18} color={mood.color} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
