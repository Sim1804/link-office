"use client";

import { useState } from "react";
import { Sparkles, Loader2, UserPlus, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  id: string;
  firstName: string;
  rationale: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  SOCIAL: "Relations sociales",
  AFFECTIVE: "Relations affectives",
  SENTIMENTAL: "Vie sentimentale",
  PROFESSIONAL: "Vie pro. & engagement",
  SELF: "Relation à soi",
};

export function BinomeSuggest({ optIn }: { optIn: boolean }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inviting, setInviting] = useState<string | null>(null);
  const [invited, setInvited] = useState<Set<string>>(new Set());
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
          setError("Aucun partenaire compatible trouvé pour le moment dans votre campagne.");
        }
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (receiverId: string) => {
    setInviting(receiverId);
    try {
      const res = await fetch("/api/binome/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId }),
      });
      if (res.ok) {
        setInvited(prev => new Set([...prev, receiverId]));
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      console.error("Erreur d'invitation");
    } finally {
      setInviting(null);
    }
  };

  if (!optIn) return null;

  return (
    <div className="card" style={{
      padding: "24px 28px",
      borderRadius: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: "rgba(0,169,157,0.1)",
            border: "1px solid rgba(0,169,157,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={18} style={{ color: "var(--primary)" }} />
          </div>
          <div>
            <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 15, margin: 0 }}>
              Suggestions IRIS
            </h3>
            <p style={{ color: "var(--text-2)", fontSize: 12, margin: "2px 0 0" }}>
              Matching par complémentarité de profil
            </p>
          </div>
        </div>

        {suggestions.length === 0 && !loading && !error && (
          <button
            onClick={handleSuggest}
            className="btn btn-secondary btn-sm"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              borderRadius: 999,
            }}
          >
            <Sparkles size={14} />
            Analyser
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          padding: "32px 0",
        }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "2px solid rgba(0,169,157,0.15)",
              borderTopColor: "var(--primary)",
              animation: "spin 1s linear infinite",
            }} />
          </div>
          <p style={{ color: "var(--text-2)", fontSize: 14, margin: 0 }}>
            IRIS analyse les profils anonymisés…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div style={{
          padding: "14px 16px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.15)",
          color: "#f87171",
          fontSize: 13,
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

      {/* No suggestions yet */}
      {suggestions.length === 0 && !loading && !error && (
        <p style={{ color: "var(--text-2)", fontSize: 13, textAlign: "center", margin: "8px 0 0", lineHeight: 1.6 }}>
          IRIS peut analyser les profils anonymisés de votre campagne pour vous suggérer le binôme idéal basé sur la complémentarité de vos dimensions relationnelles.
        </p>
      )}

      {/* Suggestions list */}
      {suggestions.length > 0 && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {suggestions.map((s, i) => {
            const isInvited = invited.has(s.id);
            const isInviting = inviting === s.id;
            const initial = s.firstName?.[0]?.toUpperCase() || "?";
            const colors = ["#a855f7", "#06b6d4", "#10b981"];
            const color = colors[i % colors.length];

            return (
              <div key={s.id} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                transition: "border-color 0.2s",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: `${color}20`,
                  border: `2px solid ${color}50`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: color,
                  fontWeight: 700,
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {initial}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15, margin: "0 0 4px" }}>
                    {s.firstName}
                  </p>
                  <p style={{ color: "var(--text-2)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                    {s.rationale}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {isInvited ? (
                    <span style={{
                      display: "flex", alignItems: "center", gap: 6,
                      fontSize: 13, fontWeight: 600,
                      color: "#10b981",
                      background: "rgba(16,185,129,0.1)",
                      padding: "8px 14px", borderRadius: 8,
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}>
                      ✓ Invité
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleInvite(s.id)}
                        disabled={isInviting || inviting !== null}
                        className="btn btn-primary btn-sm"
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          borderRadius: 999,
                          opacity: isInviting ? 0.6 : 1,
                        }}
                      >
                        {isInviting
                          ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                          : <UserPlus size={13} />
                        }
                        Inviter
                      </button>
                      <button
                        onClick={() => setSuggestions(suggestions.filter(x => x.id !== s.id))}
                        disabled={inviting !== null}
                        className="btn btn-tertiary btn-sm"
                        style={{
                          borderRadius: 999,
                        }}
                      >
                        Passer
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
