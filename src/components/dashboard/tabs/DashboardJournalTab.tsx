"use client";

import { useState, useEffect } from "react";
import { Book, Plus, Calendar, Tag, Lock } from "lucide-react";

export function DashboardJournalTab({ isPremium }: { isPremium: boolean }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState("");

  useEffect(() => {
    if (!isPremium) {
      setLoading(false);
      return;
    }
    
    fetch("/api/carnet/journal")
      .then(res => res.json())
      .then(data => {
        if (data.success) setEntries(data.entries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isPremium]);

  const handleSubmit = async () => {
    if (!newEntry.trim()) return;
    
    const res = await fetch("/api/carnet/journal", {
      method: "POST",
      body: JSON.stringify({ content: newEntry }),
      headers: { "Content-Type": "application/json" }
    });
    
    const data = await res.json();
    if (data.success) {
      setEntries([data.entry, ...entries]);
      setNewEntry("");
    }
  };

  if (!isPremium) {
    return (
      <div style={{
        marginTop: 8,
        borderRadius: 24,
        border: "1px solid rgba(124,58,237,0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Blurred preview content */}
        <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "24px", pointerEvents: "none" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", padding: 24, borderRadius: 20, marginBottom: 16 }}>
            <h3 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Book size={20} color="#a78bfa" /> Nouvelle note
            </h3>
            <div style={{ width: "100%", height: 100, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
          </div>
        </div>
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 50%)",
        }} />
        {/* CTA */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
          padding: "40px 32px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, margin: "0 auto 16px",
            borderRadius: 12, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Lock size={20} color="#94a3b8" />
          </div>
          <h4 style={{ fontFamily: "Inter, sans-serif", color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Journal réservé aux abonnés Premium
          </h4>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Prenez du recul et notez vos ressentis, petites victoires et réflexions dans votre espace sécurisé.
          </p>
          <a href="/premium" style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "white", fontWeight: 600, textDecoration: "none"
          }}>
            Passer à Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 24, borderRadius: 20
      }}>
        <h3 style={{ color: "#f8fafc", fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Book size={20} color="#a78bfa" />
          Nouvelle note
        </h3>
        <textarea 
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Qu'est-ce qui vous a fait du bien relationnellement aujourd'hui ?"
          style={{
            width: "100%", height: 100,
            background: "rgba(0,0,0,0.2)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: 16,
            color: "#f8fafc", fontSize: 14,
            resize: "none", marginBottom: 16
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={handleSubmit}
            disabled={!newEntry.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: newEntry.trim() ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(255,255,255,0.1)",
              color: newEntry.trim() ? "#fff" : "#64748b",
              border: "none", padding: "10px 20px", borderRadius: 10,
              fontWeight: 600, cursor: newEntry.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}
          >
            <Plus size={16} /> Enregistrer
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <p style={{ color: "#64748b", textAlign: "center" }}>Chargement de votre journal...</p>
        ) : entries.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 16 }}>
            <p style={{ color: "#94a3b8" }}>Votre journal est vide. Prenez le temps d'y noter vos premières réflexions.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} style={{
              background: "rgba(17,24,39,0.5)",
              border: "1px solid rgba(255,255,255,0.05)",
              padding: 20, borderRadius: 16
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, color: "#64748b", fontSize: 12 }}>
                <Calendar size={14} />
                {new Date(entry.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {entry.dimension && (
                  <>
                    <span style={{ margin: "0 4px" }}>•</span>
                    <Tag size={14} /> {entry.dimension}
                  </>
                )}
              </div>
              <p style={{ color: "#f8fafc", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
