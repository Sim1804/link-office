"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Target, Plus, CheckCircle2, Circle, Clock, Trash2, Edit3, Save, X, Calendar } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: string;
  pilot: string | null;
  dueDate: string | null;
  dimension: string | null;
}

const STATUSES = {
  PROPOSEE: { label: "Proposée", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.1)", icon: Circle },
  VALIDEE: { label: "Validée", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)", icon: CheckCircle2 },
  PLANIFIEE: { label: "Planifiée", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", icon: Calendar },
  EN_COURS: { label: "En cours", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", icon: Clock },
  REALISEE: { label: "Réalisée", color: "#22c55e", bg: "rgba(34, 197, 94, 0.1)", icon: Target },
};

const PRIORITIES: Record<string, string> = { LOW: "Basse", MEDIUM: "Moyenne", HIGH: "Haute" };

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", pilot: "", priority: "MEDIUM", status: "TODO", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/actions");
      if (res.ok) setActions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleOpenModal = (action?: ActionItem) => {
    if (action) {
      setEditingId(action.id);
      setForm({
        title: action.title,
        description: action.description || "",
        pilot: action.pilot || "",
        priority: action.priority,
        status: action.status,
        dueDate: action.dueDate ? action.dueDate.split("T")[0] : "",
      });
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", pilot: "", priority: "MEDIUM", status: "PROPOSEE", dueDate: "" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/actions/${editingId}` : "/api/actions";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchActions();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const original = [...actions];
    setActions(actions.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) setActions(original);
    } catch {
      setActions(original);
    }
  };

  const handleDelete = async (id: string) => {
    const original = [...actions];
    setActions(actions.filter(a => a.id !== id));
    setConfirmDeleteId(null);
    try {
      const res = await fetch(`/api/actions/${id}`, { method: "DELETE" });
      if (!res.ok) setActions(original);
    } catch {
      setActions(original);
    }
  };

  const getActionsByStatus = (status: string) => actions.filter(a => a.status === status);

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ padding: "100px 24px 40px", minHeight: "100vh" }}>
        <div className="blob-violet" />
        <div className="blob-cyan" />
        
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.15) 100%)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={24} style={{ color: "#a78bfa" }} />
                </div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Plan d'Action Interactif</h1>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 15, margin: 0, paddingLeft: 60 }}>Transformez vos résultats IQRH en initiatives concrètes et suivez leur avancement.</p>
            </div>
            
            <button 
              onClick={() => handleOpenModal()}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 24px",
                background: "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600,
                cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.25)", transition: "all 0.2s"
              }}
            >
              <Plus size={18} /> Nouvelle action
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#64748b" }}>Chargement du plan d'action...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
              {(Object.keys(STATUSES) as Array<keyof typeof STATUSES>).map((status) => {
                const config = STATUSES[status];
                const Icon = config.icon;
                const columnActions = getActionsByStatus(status);
                
                return (
                  <div key={status} style={{ background: "rgba(11, 15, 25, 0.4)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={18} color={config.color} />
                        <span style={{ fontWeight: 600, color: "#f8fafc" }}>{config.label}</span>
                      </div>
                      <span style={{ background: config.bg, color: config.color, padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                        {columnActions.length}
                      </span>
                    </div>

                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
                      {columnActions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569", fontSize: 13 }}>Aucune action dans cette colonne.</div>
                      ) : (
                        columnActions.map((action) => (
                          <div key={action.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "rgba(30,41,59,0.5)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f8fafc", margin: 0, lineHeight: 1.4 }}>{action.title}</h3>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => handleOpenModal(action)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                                <button onClick={() => setConfirmDeleteId(action.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            
                            {action.description && <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{action.description}</p>}
                            
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                              {action.dueDate && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#94a3b8", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6 }}>
                                  <Calendar size={12} /> {new Date(action.dueDate).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                              {action.pilot && (
                                <span style={{ fontSize: 11, color: "#0ea5e9", background: "rgba(14, 165, 233, 0.1)", padding: "4px 8px", borderRadius: 6, fontWeight: 500 }}>
                                  Pilote: {action.pilot}
                                </span>
                              )}
                            </div>

                            {/* Dropdown status selector for quick move */}
                            <select 
                              value={action.status} 
                              onChange={(e) => handleStatusChange(action.id, e.target.value)}
                              style={{ marginTop: 8, background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", borderRadius: 6, padding: "6px 8px", fontSize: 12, cursor: "pointer" }}
                            >
                              <option value="PROPOSEE">Proposée</option>
                              <option value="VALIDEE">Validée</option>
                              <option value="PLANIFIEE">Planifiée</option>
                              <option value="EN_COURS">En cours</option>
                              <option value="REALISEE">Réalisée</option>
                            </select>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(11,15,25,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 32, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", margin: 0 }}>
                {editingId ? "Modifier l'action" : "Nouvelle action"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Titre de l'action <span style={{color: "#ef4444"}}>*</span></label>
                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Ex: Organiser un atelier QVT" />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" placeholder="Détails de l'action..." rows={3} style={{ resize: "none" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Statut</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                    <option value="PROPOSEE">Proposée</option>
                    <option value="VALIDEE">Validée</option>
                    <option value="PLANIFIEE">Planifiée</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="REALISEE">Réalisée</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Priorité</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Responsable (Pilote)</label>
                  <input type="text" value={form.pilot} onChange={e => setForm({...form, pilot: e.target.value})} className="input-field" placeholder="Nom du responsable" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6, fontWeight: 500 }}>Échéance</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="input-field" />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "12px", background: "transparent", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: "12px", background: "#7c3aed", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone Modal for Deletion */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 24, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fca5a5", fontWeight: 700, marginBottom: 12, fontSize: 18 }}>
              <div style={{ width: 40, height: 40, background: "rgba(239,68,68,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} color="#ef4444" />
              </div>
              Supprimer l'action ?
            </div>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24, lineHeight: 1.5 }}>
              Cette action sera définitivement retirée de votre plan d'action. Voulez-vous continuer ?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDeleteId(null)} className="btn btn-secondary btn-md" style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="btn btn-primary btn-md" style={{ background: "#ef4444", color: "white", border: "none" }}>
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
