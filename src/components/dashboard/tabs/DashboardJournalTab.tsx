"use client";

import { useState, useEffect, useRef } from "react";
import { Book, Plus, Calendar, Tag, Lock, MoreHorizontal, Pencil, Trash, X, Check } from "lucide-react";

export function DashboardJournalTab({ isPremium }: { isPremium: boolean }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState("");
  
  // Edit & Menu states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleEdit = (entry: any) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setOpenMenuId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editContent.trim()) return;
    
    // Optimistic UI update
    setEntries(entries.map(e => e.id === id ? { ...e, content: editContent } : e));
    setEditingId(null);
    
    await fetch(`/api/carnet/journal/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content: editContent }),
      headers: { "Content-Type": "application/json" }
    });
  };

  const handleDelete = async (id: string) => {
    setOpenMenuId(null);
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;
    
    // Optimistic UI update
    setEntries(entries.filter(e => e.id !== id));
    
    await fetch(`/api/carnet/journal/${id}`, { method: "DELETE" });
  };

  if (!isPremium) {
    return (
      <div style={{
        marginTop: 8,
        borderRadius: 16,
        border: "1px solid rgba(124,58,237,0.2)",
        overflow: "hidden",
        position: "relative",
      }}>
        <div style={{ filter: "blur(6px)", opacity: 0.4, padding: "24px", pointerEvents: "none" }}>
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 20, borderRadius: 16, marginBottom: 16 }}>
            <h3 style={{ color: "var(--text-1)", fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Book size={20} color="var(--primary)" /> Nouvelle note
            </h3>
            <div style={{ width: "100%", height: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }} />
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,15,25,0) 0%, rgba(11,15,25,0.97) 50%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2, padding: "40px 32px 32px", textAlign: "center" }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 16px", borderRadius: 12, background: "rgba(18,61,70,0.05)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={20} color="var(--text-3)" />
          </div>
          <h4 style={{ fontFamily: "Inter, sans-serif", color: "var(--text-1)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Journal réservé aux abonnés Premium
          </h4>
          <p style={{ color: "var(--text-3)", fontSize: 14, marginBottom: 24, maxWidth: 420, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Prenez du recul et notez vos ressentis, petites victoires et réflexions dans votre espace sécurisé.
          </p>
          <a href="/premium" className="btn btn-primary btn-md" style={{ textDecoration: "none" }}>
            Passer à Premium
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeSlideIn 0.4s ease-out" }}>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 20, borderRadius: 16 }}>
        <h3 style={{ color: "var(--text-1)", fontSize: 18, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Book size={20} color="var(--primary)" />
          Nouvelle note
        </h3>
        <textarea 
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Qu'est-ce qui vous a fait du bien relationnellement aujourd'hui ?"
          style={{ width: "100%", height: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, color: "var(--text-1)", fontSize: 14, resize: "none", marginBottom: 16 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button 
            onClick={handleSubmit}
            disabled={!newEntry.trim()}
            className={`btn btn-md ${newEntry.trim() ? "btn-primary" : "btn-secondary"}`}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={16} /> Enregistrer
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          <p style={{ color: "var(--text-3)", textAlign: "center" }}>Chargement de votre journal...</p>
        ) : entries.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", background: "var(--surface-2)", border: "1px dashed var(--border)", borderRadius: 16 }}>
            <p style={{ color: "var(--text-2)" }}>Votre journal est vide. Prenez le temps d'y noter vos premières réflexions.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} style={{ background: "var(--surface)", border: "1px solid rgba(18,61,70,0.05)", padding: 20, borderRadius: 16, position: "relative" }}>
              
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 12 }}>
                  <Calendar size={14} />
                  {new Date(entry.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  {entry.dimension && (
                    <>
                      <span style={{ margin: "0 4px" }}>•</span>
                      <Tag size={14} /> {entry.dimension}
                    </>
                  )}
                </div>

                {/* Options Menu */}
                {editingId !== entry.id && (
                  <div style={{ position: "relative" }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === entry.id ? null : entry.id); }}
                      style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4, borderRadius: 8 }}
                      onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-2)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {openMenuId === entry.id && (
                      <div ref={menuRef} style={{ position: "absolute", top: "100%", right: 0, marginTop: 4, background: "var(--surface)", border: "1px solid var(--border-strong)", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.15)", padding: 4, zIndex: 10, minWidth: 150 }}>
                        <button onClick={() => handleEdit(entry)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "none", color: "var(--text-1)", fontSize: 13, cursor: "pointer", borderRadius: 8, textAlign: "left" }} onMouseOver={(e) => e.currentTarget.style.background = "var(--surface-2)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                          <Pencil size={14} /> Modifier
                        </button>
                        <button onClick={() => handleDelete(entry.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "none", color: "#ef4444", fontSize: 13, cursor: "pointer", borderRadius: 8, textAlign: "left" }} onMouseOver={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"} onMouseOut={(e) => e.currentTarget.style.background = "transparent"}>
                          <Trash size={14} /> Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Editing Mode vs View Mode */}
              {editingId === entry.id ? (
                <div>
                  <textarea 
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{ width: "100%", minHeight: 80, background: "var(--surface)", border: "1px solid var(--primary)", borderRadius: 12, padding: 12, color: "var(--text-1)", fontSize: 14, resize: "vertical", marginBottom: 12, outline: "none" }}
                    autoFocus
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button onClick={() => setEditingId(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "1px solid var(--border)", background: "transparent", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>
                      <X size={14} /> Annuler
                    </button>
                    <button onClick={() => saveEdit(entry.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, border: "none", background: "var(--primary)", color: "white", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                      <Check size={14} /> Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <p style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap", margin: 0 }}>
                  {entry.content}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
