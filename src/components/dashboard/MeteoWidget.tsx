"use client";

import { useState } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Zap, Check } from "lucide-react";

const MOODS = [
  { id: "TRES_BIEN", icon: Sun, label: "Très bien", color: "#f59e0b" },
  { id: "PLUTOT_BIEN", icon: CloudSun, label: "Plutôt bien", color: "#10b981" },
  { id: "MITIGE", icon: Cloud, label: "Mitigé(e)", color: "#94a3b8" },
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
        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
        padding: "16px 24px", borderRadius: 16, display: "flex", alignItems: "center", gap: 12,
        color: "#10b981", fontSize: 14, fontWeight: 600, animation: "fadeSlideIn 0.3s ease-out"
      }}>
        <Check size={20} />
        Météo du jour enregistrée ! Merci pour votre check-in.
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(17,24,39,0.4)", border: "1px solid rgba(255,255,255,0.06)",
      padding: "16px 24px", borderRadius: 16, marginBottom: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
    }}>
      <h3 style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
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
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "50%", cursor: "pointer", transition: "all 0.2s",
                opacity: loading && selectedMood !== mood.id ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = mood.color;
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
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
