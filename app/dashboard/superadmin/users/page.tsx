"use client";

import { useState, useEffect } from "react";
import { Users, Search, Crown, ShieldAlert, X, Save, Trash2, AlertTriangle } from "lucide-react";

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ subscription: "", role: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/superadmin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleManageClick = (user: any) => {
    setSelectedUser(user);
    setEditForm({ subscription: user.subscription, role: user.role });
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        loadUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error(error);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadUsers();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error(error);
    }
    setIsSaving(false);
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterRole === "B2C") return matchSearch && ["CITIZEN", "INDIVIDUAL", "EMPLOYEE", "MEMBER"].includes(user.role) && !user.organizationId;
    if (filterRole === "ADMINS") return matchSearch && (user.role.startsWith("ADMIN_") || user.role === "SUPER_ADMIN");
    
    return matchSearch;
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <Users size={32} color="#34d399" />
            CRM Utilisateurs (B2C & Admins)
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Gérez les utilisateurs individuels, abonnements et modérateurs.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 44, width: "100%", maxWidth: 400 }}
          />
        </div>
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field" style={{ width: 200 }}>
          <option value="ALL">Tous les utilisateurs</option>
          <option value="B2C">Particuliers (B2C)</option>
          <option value="ADMINS">Administrateurs (B2B/Admin)</option>
        </select>
      </div>

      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Chargement...</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Utilisateur</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Rôle & Abonnement</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Rattachement</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "center" }}>Passations</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: 15 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, 
                      background: user.role.startsWith("ADMIN") || user.role === "SUPER_ADMIN" ? "rgba(124,58,237,0.15)" : "rgba(100,116,139,0.15)",
                      color: user.role.startsWith("ADMIN") || user.role === "SUPER_ADMIN" ? "#c084fc" : "#94a3b8",
                      marginBottom: 6,
                    }}>
                      {user.role === "SUPER_ADMIN" ? <ShieldAlert size={12} /> : null}
                      {user.role}
                    </span>
                    <br />
                    <span style={{ 
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: user.subscription === "PREMIUM_PLUS" ? "rgba(245,158,11,0.15)" : user.subscription === "PREMIUM" ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.05)",
                      color: user.subscription === "PREMIUM_PLUS" ? "#fbbf24" : user.subscription === "PREMIUM" ? "#34d399" : "#64748b"
                    }}>
                      {user.subscription !== "FREEMIUM" && <Crown size={10} />}
                      {user.subscription}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {user.organization ? (
                      <div style={{ color: "#e2e8f0", fontSize: 13 }}>🏢 {user.organization.name}</div>
                    ) : (
                      <div style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>Client Individuel (B2C)</div>
                    )}
                    {user.campaign && (
                      <div style={{ color: "#a78bfa", fontSize: 12, marginTop: 4 }}>🎯 {user.campaign.title}</div>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center", color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>
                    {user._count?.assessments || 0}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button onClick={() => handleManageClick(user)} className="btn btn-secondary btn-sm">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "#64748b" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedUser && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(2,6,23,0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }}>
          <div className="card" style={{ width: "100%", maxWidth: 500, padding: 32, position: "relative" }}>
            <button 
              onClick={() => setSelectedUser(null)} 
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={20} style={{ color: "#38bdf8" }} />
              Profil Utilisateur
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Niveau d'Abonnement</label>
                <select 
                  value={editForm.subscription} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, subscription: e.target.value }))}
                  className="input-field" style={{ width: "100%" }}
                >
                  <option value="FREEMIUM">Freemium (Gratuit)</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="PREMIUM_PLUS">Premium+ (Accès Binôme)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", fontWeight: 600, marginBottom: 8 }}>Rôle Système</label>
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                  className="input-field" style={{ width: "100%" }}
                  disabled={selectedUser.role === "SUPER_ADMIN"}
                >
                  <option value="CITIZEN">Client (CITIZEN)</option>
                  <option value="EMPLOYEE">Employé (EMPLOYEE)</option>
                  <option value="MEMBER">Membre (MEMBER)</option>
                  <option value="ADMIN_B2B">Admin RH (ADMIN_B2B)</option>
                  <option value="ADMIN_B2B2C">Admin Mutuelle (ADMIN_B2B2C)</option>
                  <option value="SUPER_ADMIN" disabled>Super Admin (SUPER_ADMIN)</option>
                </select>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => setConfirmDelete(true)} className="btn btn-sm" style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)", display: confirmDelete ? "none" : "flex" }}>
                  <Trash2 size={16} style={{ marginRight: 6 }} />
                  Supprimer le compte
                </button>

                <button onClick={handleSave} disabled={isSaving} className="btn btn-primary btn-md" style={{ marginLeft: confirmDelete ? "auto" : 0 }}>
                  {isSaving ? "Enregistrement..." : <><Save size={16} /> Enregistrer</>}
                </button>
              </div>

              {confirmDelete && (
                <div style={{
                  marginTop: 8, padding: 16, borderRadius: 12,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  animation: "fadeIn 0.2s ease-out"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fca5a5", fontWeight: 600, marginBottom: 8 }}>
                    <AlertTriangle size={18} /> Êtes-vous absolument sûr ?
                  </div>
                  <p style={{ fontSize: 13, color: "#fca5a5", opacity: 0.9, marginBottom: 16, lineHeight: 1.5 }}>
                    Cette action est <strong>irréversible</strong>. Toutes les données associées (profil, résultats IQRH, historique) seront définitivement effacées.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button onClick={() => setConfirmDelete(false)} disabled={isSaving} className="btn btn-secondary btn-sm" style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "none" }}>
                      Annuler
                    </button>
                    <button onClick={handleDelete} disabled={isSaving} className="btn btn-primary btn-sm" style={{ background: "#ef4444", color: "white", border: "none" }}>
                      {isSaving ? "Suppression..." : "Oui, supprimer définitivement"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
