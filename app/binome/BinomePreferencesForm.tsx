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

  const toggleAvailability = (val: string) =>
    setAvailability(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const toggleExpectation = (val: string) =>
    setExpectations(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/binome/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: true, availability, preferredFrequency: frequency, expectations }),
      });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isValid = availability.length > 0 && expectations.length > 0;

  return (
    <div className="card" style={{ padding: 32 }}>
      {/* En-tête */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "rgba(0,169,157,0.1)", border: "1px solid rgba(0,169,157,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Settings2 size={22} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>Vos préférences</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, margin: "3px 0 0" }}>Pour trouver le partenaire idéal.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 24 }}>

        {/* Disponibilités */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Vos disponibilités idéales
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Matin", "Midi", "Après-midi", "Soirée", "Week-end", "Flexible"].map(opt => {
              const val = opt.toLowerCase();
              const isSelected = availability.includes(val);
              return (
                <button
                  key={opt}
                  onClick={() => toggleAvailability(val)}
                  style={{
                    padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isSelected ? "rgba(0,169,157,0.12)" : "var(--bg)",
                    color: isSelected ? "var(--primary)" : "var(--text-2)",
                    border: `1px solid ${isSelected ? "rgba(0,169,157,0.35)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fréquence */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Fréquence souhaitée
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[
              { id: "legere", label: "Légère", desc: "1 fois/semaine" },
              { id: "reguliere", label: "Régulière", desc: "2-3 fois/semaine" },
              { id: "soutenue", label: "Soutenue", desc: "Quotidienne" },
            ].map(opt => {
              const isSelected = frequency === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFrequency(opt.id)}
                  style={{
                    padding: "14px 12px", borderRadius: 12, textAlign: "left",
                    background: isSelected ? "rgba(0,169,157,0.08)" : "var(--bg)",
                    border: `1px solid ${isSelected ? "rgba(0,169,157,0.35)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--primary)" : "var(--text-1)", marginBottom: 3 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Attentes */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Vos attentes principales
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Encouragement", "Passage à l'action", "Partage d'expérience", "Routine relationnelle", "Écoute"].map(opt => {
              const isSelected = expectations.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() => toggleExpectation(opt)}
                  style={{
                    padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: isSelected ? "rgba(0,169,157,0.12)" : "var(--bg)",
                    color: isSelected ? "var(--primary)" : "var(--text-2)",
                    border: `1px solid ${isSelected ? "rgba(0,169,157,0.35)" : "var(--border)"}`,
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <button
          onClick={handleSave}
          disabled={loading || !isValid}
          className="btn btn-primary btn-md"
          style={{ borderRadius: 999, gap: 8, opacity: isValid ? 1 : 0.5 }}
        >
          {loading ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={15} />}
          Enregistrer mes préférences
        </button>
      </div>
    </div>
  );
}
