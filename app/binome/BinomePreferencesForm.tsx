"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Settings2, CheckCircle2 } from "lucide-react";

export function BinomePreferencesForm({ initialData }: { initialData?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [availability, setAvailability] = useState<string[]>(initialData?.availability || []);
  const [frequency, setFrequency] = useState(initialData?.preferredFrequency || "reguliere");
  const [expectations, setExpectations] = useState<string[]>(initialData?.expectations || []);

  const toggleAvailability = (val: string) => {
    setAvailability(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const toggleExpectation = (val: string) => {
    setExpectations(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/binome/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optIn: true,
          availability,
          preferredFrequency: frequency,
          expectations,
        }),
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
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: "32px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "rgba(16,185,129,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(16,185,129,0.2)"
        }}>
          <Settings2 size={24} style={{ color: "#34d399" }} />
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Vos préférences</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, margin: "4px 0 0" }}>Pour trouver le partenaire idéal.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>Vos disponibilités idéales</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Matin", "Midi", "Après-midi", "Soirée", "Week-end", "Flexible"].map(opt => {
              const val = opt.toLowerCase();
              const isSelected = availability.includes(val);
              return (
                <button
                  key={opt}
                  onClick={() => toggleAvailability(val)}
                  style={{
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isSelected ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#c084fc" : "#94a3b8",
                    border: `1px solid ${isSelected ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.1)"}`,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>Fréquence souhaitée</h3>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { id: "legere", label: "Légère", desc: "1 fois par semaine" },
              { id: "reguliere", label: "Régulière", desc: "2-3 fois par semaine" },
              { id: "soutenue", label: "Soutenue", desc: "Quotidienne" }
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setFrequency(opt.id)}
                style={{
                  flex: 1, padding: "16px", borderRadius: 12, textAlign: "left",
                  background: frequency === opt.id ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${frequency === opt.id ? "rgba(56,189,248,0.3)" : "rgba(255,255,255,0.05)"}`,
                  cursor: "pointer", transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: frequency === opt.id ? "#38bdf8" : "#cbd5e1", marginBottom: 4 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>Vos attentes principales</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Encouragement", "Passage à l'action", "Partage d'expérience", "Routine relationnelle", "Écoute"].map(opt => {
              const isSelected = expectations.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleExpectation(opt)}
                  style={{
                    padding: "8px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isSelected ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                    color: isSelected ? "#34d399" : "#94a3b8",
                    border: `1px solid ${isSelected ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)"}`,
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 32 }}>
        <button
          onClick={handleSave}
          disabled={loading || availability.length === 0 || expectations.length === 0}
          style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff", border: "none", padding: "12px 24px", borderRadius: 10,
            fontSize: 14, fontWeight: 700, cursor: (loading || availability.length === 0 || expectations.length === 0) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
            opacity: (availability.length === 0 || expectations.length === 0) ? 0.5 : 1
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={16} />}
          Enregistrer mes préférences
        </button>
      </div>
    </div>
  );
}
