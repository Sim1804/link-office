"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Target, Plus, CheckCircle2, Circle, Clock, Trash2, Edit3, Save, X, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: string;
  pilot: string | null;
  dueDate: string | null;
  dimension: string | null;
  campaignId: string | null;
  Campaign?: { title: string };
}

const STATUSES = {
  PROPOSEE: { label: "Recommandation", color: "var(--text-3)", bg: "var(--surface-2)", icon: Circle },
  VALIDEE: { label: "Validée", color: "var(--action)", bg: "rgba(89, 101, 232, 0.1)", icon: CheckCircle2 },
  PLANIFIEE: { label: "Planifiée", color: "var(--primary)", bg: "rgba(0, 169, 157, 0.1)", icon: Calendar },
  EN_COURS: { label: "En cours", color: "var(--energy)", bg: "rgba(255, 198, 41, 0.15)", icon: Clock },
  REALISEE: { label: "Réalisée", color: "var(--success)", bg: "rgba(16, 185, 129, 0.1)", icon: Target },
};

const PRIORITIES: Record<string, string> = { LOW: "Basse", MEDIUM: "Moyenne", HIGH: "Haute" };

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Campaign state
  const [campaigns, setCampaigns] = useState<{ id: string; title: string }[]>([]);
  const [filterCampaign, setFilterCampaign] = useState("ALL");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", pilot: "", priority: "MEDIUM", status: "TODO", dueDate: "", campaignId: "" });
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchActions = async (campaignId = filterCampaign) => {
    setLoading(true);
    try {
      const url = campaignId !== "ALL" ? `/api/actions?campaignId=${campaignId}` : "/api/actions";
      const res = await fetch(url);
      if (res.ok) setActions(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCampaigns();
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
        campaignId: action.campaignId || "",
      });
    } else {
      setEditingId(null);
      setForm({ title: "", description: "", pilot: "", priority: "MEDIUM", status: "PROPOSEE", dueDate: "", campaignId: filterCampaign !== "ALL" ? filterCampaign : "" });
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
      <main className="page-main" style={{ padding: "100px 24px 40px", minHeight: "100vh", background: "var(--bg)" }}>
        <div className="page-container-wide" style={{ maxWidth: 1400, margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
                <Target size={24} color="var(--primary)" />
                Recommandations & Plan d'Action
              </h1>
              <p style={{ color: "var(--text-2)", marginTop: 8 }}>Transformez vos résultats IQRH en initiatives concrètes et suivez leur avancement.</p>
            </div>
            
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <Select 
                value={filterCampaign} 
                onChange={(val) => { setFilterCampaign(val); fetchActions(val); }} 
                options={[
                  { value: "ALL", label: "Toutes les campagnes" },
                  ...campaigns.map(c => ({ value: c.id, label: c.title }))
                ]}
                style={{ width: 250 }} 
              />
              <a href={`/api/actions/export?campaignId=${filterCampaign}`} download style={{ textDecoration: "none" }}>
                <Button variant="secondary">
                  <Download size={18} /> Exporter
                </Button>
              </a>
              <Button onClick={() => handleOpenModal()} variant="primary">
                <Plus size={18} /> Nouvelle action
              </Button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text-3)" }}>Chargement des recommandations...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
              {(Object.keys(STATUSES) as Array<keyof typeof STATUSES>).map((status) => {
                const config = STATUSES[status];
                const Icon = config.icon;
                const columnActions = getActionsByStatus(status);
                
                return (
                  <div key={status} style={{ background: "var(--bg)", border: "1px solid var(--surface-2)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface-2)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon size={18} color={config.color} />
                        <span style={{ fontWeight: 600, color: "var(--text-1)" }}>{config.label}</span>
                      </div>
                      <span style={{ background: config.bg, color: config.color, padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                        {columnActions.length}
                      </span>
                    </div>

                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, minHeight: 300 }}>
                      {columnActions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-2)", fontSize: 13 }}>Aucune action dans cette colonne.</div>
                      ) : (
                        columnActions.map((action) => (
                          <div key={action.id} className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, background: "var(--surface)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", margin: 0, lineHeight: 1.4 }}>{action.title}</h3>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => handleOpenModal(action)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer", padding: 4 }}><Edit3 size={14} /></button>
                                <button onClick={() => setConfirmDeleteId(action.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            
                            {action.description && <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{action.description}</p>}
                            
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                              {action.Campaign && (
                                <span style={{ fontSize: 11, color: "var(--violet)", background: "rgba(89, 101, 232, 0.1)", padding: "4px 8px", borderRadius: 6, fontWeight: 500 }}>
                                  Campagne: {action.Campaign.title}
                                </span>
                              )}
                              {action.dueDate && (
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-3)", background: "rgba(18,61,70,0.05)", padding: "4px 8px", borderRadius: 6 }}>
                                  <Calendar size={12} /> {new Date(action.dueDate).toLocaleDateString("fr-FR")}
                                </span>
                              )}
                              {action.pilot && (
                                <span style={{ fontSize: 11, color: "var(--action)", background: "rgba(89, 101, 232, 0.1)", padding: "4px 8px", borderRadius: 6, fontWeight: 500 }}>
                                  Pilote: {action.pilot}
                                </span>
                              )}
                            </div>

                            {/* Dropdown status selector for quick move */}
                            <div style={{ marginTop: 8 }}>
                              <Select
                                value={action.status}
                                onChange={(val) => handleStatusChange(action.id, val)}
                                options={[
                                  { value: "PROPOSEE", label: "Recommandation" },
                                  { value: "VALIDEE", label: "Validée" },
                                  { value: "PLANIFIEE", label: "Planifiée" },
                                  { value: "EN_COURS", label: "En cours" },
                                  { value: "REALISEE", label: "Réalisée" }
                                ]}
                                style={{ width: "100%", fontSize: 12 }}
                              />
                            </div>
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
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "var(--bg)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 20, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>
                {editingId ? "Modifier l'action" : "Nouvelle action"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "var(--text-3)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: Organiser un atelier QVT" label="Titre de l'action *" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Description</label>
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({...form, description: e.target.value})} 
                  className="input-field" 
                  placeholder="Détails de l'action..." 
                  rows={3} 
                  style={{ resize: "none", width: "100%" }} 
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Statut</label>
                  <Select 
                    value={form.status} 
                    onChange={val => setForm({...form, status: val})} 
                    options={[
                      { value: "PROPOSEE", label: "Recommandation" },
                      { value: "VALIDEE", label: "Validée" },
                      { value: "PLANIFIEE", label: "Planifiée" },
                      { value: "EN_COURS", label: "En cours" },
                      { value: "REALISEE", label: "Réalisée" }
                    ]}
                    style={{ width: "100%" }} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary mb-1.5 block">Priorité</label>
                  <Select 
                    value={form.priority} 
                    onChange={val => setForm({...form, priority: val})} 
                    options={[
                      { value: "LOW", label: "Basse" },
                      { value: "MEDIUM", label: "Moyenne" },
                      { value: "HIGH", label: "Haute" }
                    ]}
                    style={{ width: "100%" }} 
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <Input type="text" value={form.pilot} onChange={e => setForm({...form, pilot: e.target.value})} placeholder="Nom du responsable" label="Responsable (Pilote)" />
                </div>
                <div>
                  <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} label="Échéance" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 block">Liée à la campagne (Optionnel)</label>
                <Select 
                  value={form.campaignId || "NONE"} 
                  onChange={val => setForm({...form, campaignId: val === "NONE" ? "" : val})} 
                  options={[
                    { value: "NONE", label: "Aucune (Action générale)" },
                    ...campaigns.map(c => ({ value: c.id, label: c.title }))
                  ]}
                  style={{ width: "100%" }} 
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" size="lg" style={{ flex: 1 }}>Annuler</Button>
                <Button type="submit" disabled={saving} variant="primary" size="lg" style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone Modal for Deletion */}
      {confirmDeleteId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div className="card" style={{ width: "100%", maxWidth: 400, padding: 20, background: "var(--surface)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 16, animation: "fadeIn 0.2s ease-out" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--error)", fontWeight: 700, marginBottom: 12, fontSize: 18 }}>
              <div style={{ width: 40, height: 40, background: "rgba(239,68,68,0.15)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Trash2 size={20} color="var(--error)" />
              </div>
              Supprimer l'action ?
            </div>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5 }}>
              Cette action/recommandation sera définitivement retirée de votre plan. Voulez-vous continuer ?
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <Button onClick={() => setConfirmDeleteId(null)} variant="secondary" size="md">
                Annuler
              </Button>
              <Button onClick={() => handleDelete(confirmDeleteId)} variant="danger" size="md">
                Oui, supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
