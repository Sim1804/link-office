"use client";

import { useState } from "react";

const MOODS = [
  { id: "TRES_BIEN", label: "Très bien", emoji: "☀️" },
  { id: "PLUTOT_BIEN", label: "Plutôt bien", emoji: "🌤️" },
  { id: "MITIGE", label: "Mitigé(e)", emoji: "⛅" },
  { id: "FRAGILE", label: "Fragile", emoji: "🌧️" },
  { id: "EN_DIFFICULTE", label: "Difficile", emoji: "⛈️" },
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

  return (
    <div className="pt-4 border-t border-[#E3EBE6] flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-xs font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider shrink-0">
        AUJOURD'HUI :
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleSubmit(mood.id)}
              disabled={loading || submitted}
              className={`px-3.5 py-1.5 rounded-full text-xs font-jakarta font-semibold transition-all ${
                isSelected
                  ? 'bg-[#00A99D] text-white shadow-xs'
                  : 'bg-[#FAF9F5] text-[#123D46]/75 hover:bg-[#F4F1E8] border border-[#E3EBE6]'
              } ${(loading || submitted) && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="mr-1.5">{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          );
        })}
      </div>
      {submitted && (
        <span className="text-[11px] text-[#00A99D] font-medium sm:ml-auto">
          ✓ Météo du jour enregistrée
        </span>
      )}
    </div>
  );
}
