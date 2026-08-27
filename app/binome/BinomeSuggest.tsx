"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  firstName: string;
  rationale: string;
}

export function BinomeSuggest({ optIn }: { optIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/binome/suggest");
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions);
        if (data.suggestions.length === 0) {
          setError("Aucun partenaire compatible trouvé pour le moment.");
        }
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (e) {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (receiverId: string) => {
    try {
      const res = await fetch("/api/binome/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        setSuggestions(suggestions.filter(s => s.id !== receiverId));
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!optIn) return null;

  return (
    <div className="card" style={{ borderColor: "rgba(168,85,247,0.3)" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <Sparkles style={{ width: 18, height: 18, color: "#a855f7" }} />
        Suggestions de l'Assistant IRIS
      </h3>
      
      {suggestions.length === 0 && !loading && !error && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 16 }}>
            IRIS peut analyser les profils anonymisés de votre campagne pour vous suggérer un binôme idéal basé sur la complémentarité de vos besoins.
          </p>
          <button 
            onClick={handleSuggest}
            style={{ background: "rgba(168,85,247,0.1)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.2)", padding: "10px 20px", borderRadius: 8, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}
          >
            Générer des suggestions
          </button>
        </div>
      )}

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 24 }}>
          <Loader2 className="animate-spin" size={24} color="#a855f7" />
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Analyse IA en cours...</p>
        </div>
      )}

      {error && (
        <p style={{ color: "#f43f5e", fontSize: 14, textAlign: "center", padding: 12 }}>{error}</p>
      )}

      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {suggestions.map(s => (
            <div key={s.id} style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)", padding: 16, borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <p style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>{s.firstName}</p>
                  <p style={{ color: "#c084fc", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>
                    {s.rationale}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button 
                  onClick={() => handleInvite(s.id)}
                  style={{ background: "#a855f7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", flex: 1 }}
                >
                  Inviter ce Binôme
                </button>
                <button 
                  onClick={() => setSuggestions(suggestions.filter(x => x.id !== s.id))}
                  style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "none", padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                >
                  Ignorer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
