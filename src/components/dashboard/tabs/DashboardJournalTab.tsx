"use client";

import { useState, useEffect, useRef } from "react";
import { Book, Plus, Calendar, Tag, MoreHorizontal, Pencil, Trash, X, Check } from "lucide-react";
import { LockedContentOverlay } from "@/components/ui/LockedContentOverlay";

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
      <div className="mt-2">
        <LockedContentOverlay
          tier="PREMIUM"
          title="Mon Journal Relationnel"
          description="Prenez du recul et notez vos ressentis, petites victoires et réflexions dans votre espace sécurisé."
          actionLabel="Débloquer avec Premium"
        >
          <div className="p-8 w-full">
            <div className="bg-[#FAF9F5] border border-[#E3EBE6] p-6 rounded-2xl mb-4">
              <h3 className="text-[#123D46] text-lg font-bold mb-4 flex items-center gap-2">
                <Book size={20} className="text-[#00A99D]" /> Nouvelle note
              </h3>
              <div className="w-full h-36 bg-white border border-[#E3EBE6] rounded-xl" />
            </div>
          </div>
        </LockedContentOverlay>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-[#E3EBE6] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center text-xl shrink-0">
            📖
          </div>
          <div>
            <h3 className="font-jakarta font-extrabold text-lg text-[#123D46]">
              Mon Journal
            </h3>
            <p className="text-xs text-[#123D46]/70 mt-0.5">
              Prenez du recul et notez vos ressentis, petites victoires et réflexions.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#FAF9F5] border border-[#E3EBE6] p-5 sm:p-6 rounded-3xl shadow-xs">
        <h3 className="text-[#123D46] font-jakarta text-lg font-extrabold mb-4 flex items-center gap-2">
          Nouvelle note
        </h3>
        <textarea 
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="Qu'est-ce qui vous a fait du bien relationnellement aujourd'hui ?"
          className="w-full h-24 bg-white border border-[#E3EBE6] rounded-2xl p-4 text-[#123D46] text-sm resize-none mb-4 focus:outline-none focus:border-[#00A99D]/50 focus:ring-2 focus:ring-[#00A99D]/10 transition-all placeholder:text-[#123D46]/40"
        />
        <div className="flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={!newEntry.trim()}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-xs flex items-center gap-2 ${
              newEntry.trim() 
                ? "bg-[#00A99D] hover:bg-[#199E9A] text-white cursor-pointer" 
                : "bg-white border border-[#E3EBE6] text-[#123D46]/40 cursor-not-allowed"
            }`}
          >
            <Plus size={16} /> Enregistrer
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-center text-[#123D46]/60 text-sm">Chargement de votre journal...</p>
        ) : entries.length === 0 ? (
          <div className="p-10 text-center bg-[#FAF9F5] border border-dashed border-[#E3EBE6] rounded-3xl">
            <p className="text-[#123D46]/60 text-sm">Votre journal est vide. Prenez le temps d'y noter vos premières réflexions.</p>
          </div>
        ) : (
          entries.map(entry => (
            <div key={entry.id} className="bg-white border border-[#E3EBE6] p-5 sm:p-6 rounded-3xl relative shadow-xs group transition-colors hover:border-[#00A99D]/20">
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2 text-[#123D46]/50 text-xs font-medium">
                  <span className="flex items-center gap-1.5 bg-[#FAF9F5] px-2.5 py-1 rounded-full border border-[#E3EBE6]">
                    <Calendar size={13} />
                    {new Date(entry.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {entry.dimension && (
                    <span className="flex items-center gap-1.5 bg-[#FAF9F5] px-2.5 py-1 rounded-full border border-[#E3EBE6]">
                      <Tag size={13} /> {entry.dimension}
                    </span>
                  )}
                </div>

                {/* Options Menu */}
                {editingId !== entry.id && (
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === entry.id ? null : entry.id); }}
                      className="p-1.5 rounded-lg text-[#123D46]/40 hover:text-[#123D46] hover:bg-[#FAF9F5] transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {openMenuId === entry.id && (
                      <div ref={menuRef} className="absolute top-full right-0 mt-1 w-40 bg-white border border-[#E3EBE6] rounded-xl shadow-lg p-1.5 z-10">
                        <button 
                          onClick={() => handleEdit(entry)} 
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#123D46] hover:bg-[#FAF9F5] rounded-lg transition-colors"
                        >
                          <Pencil size={14} /> Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(entry.id)} 
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
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
                    className="w-full min-h-[80px] bg-white border border-[#00A99D]/50 rounded-xl p-3 text-[#123D46] text-sm resize-y mb-3 focus:outline-none focus:ring-2 focus:ring-[#00A99D]/20 transition-all"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="px-4 py-2 rounded-full border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#FAF9F5] text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Annuler
                    </button>
                    <button 
                      onClick={() => saveEdit(entry.id)} 
                      className="px-4 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Check size={14} /> Enregistrer
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#123D46]/80 text-[14px] leading-relaxed whitespace-pre-wrap m-0">
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
