"use client";

import { useState, useEffect } from "react";
import { Users, Search, Crown, ShieldAlert, X, Save, Trash2, AlertTriangle, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

const ROLE_LABELS: Record<string, string> = {
  CITIZEN: "Client B2C",
  EMPLOYEE: "Employé (B2B)",
  MEMBER: "Membre (Mutuelle)",
  ADMIN_B2B: "Admin Entreprises",
  ADMIN_B2B2C: "Admin Mutuelles",
  ADMIN_B2G: "Admin Collectivités",
  SUPER_ADMIN: "Super Admin"
};

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
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
    fetch("/api/superadmin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      });
  }, []);

  const handleManageClick = (user: any) => {
    setSelectedUser(user);
    setEditForm({ subscription: user.subscription, role: user.role });
    setConfirmDelete(false);
  };

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setSaveSuccess(true);
        loadUsers();
        setTimeout(() => setSelectedUser(null), 800);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Erreur lors de la sauvegarde.");
      }
    } catch {
      setSaveError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadUsers();
        setSelectedUser(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Impossible de supprimer ce compte.");
        setConfirmDelete(false);
      }
    } catch {
      setSaveError("Erreur réseau lors de la suppression.");
      setConfirmDelete(false);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch =
      user.email.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower);

    // B2C = utilisateurs individuels sans organisation (CITIZEN, EMPLOYEE, MEMBER)
    // Note: INDIVIDUAL n'existe pas dans l'enum Prisma UserRole
    if (filterRole === "B2C") {
      return matchSearch && ["CITIZEN", "EMPLOYEE", "MEMBER"].includes(user.role) && !user.organizationId;
    }
    if (filterRole === "ADMINS") {
      return matchSearch && (user.role.startsWith("ADMIN_") || user.role === "SUPER_ADMIN");
    }
    return matchSearch;
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 10 }}>
            <Users size={24} color="#34d399" />
            CRM Utilisateurs (B2C & Admins)
          </h1>
          <p style={{ color: "var(--text-2)", marginTop: 8 }}>Gérez les utilisateurs individuels, abonnements et modérateurs.</p>
        </div>
        <a href="/api/admin/users/export" download style={{ textDecoration: "none" }}>
          <button className="btn btn-primary btn-md">
            <Download size={18} />
            Exporter (CSV)
          </button>
        </a>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <Input 
            icon={<Search size={18} />}
            type="text" 
            placeholder="Rechercher par nom, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", maxWidth: 400 }}
          />
        </div>
        <Select 
          value={filterRole} 
          onChange={(val) => setFilterRole(val)} 
          options={[
            { value: "ALL", label: "Tous les utilisateurs" },
            { value: "B2C", label: "Particuliers (B2C)" },
            { value: "ADMINS", label: "Administrateurs (Orgas & Super)" }
          ]}
          style={{ width: 220 }}
        />
      </div>

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
        {loading ? (
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12, animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ height: 64, background: "var(--surface)", borderRadius: 12 }} />
            ))}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Utilisateur</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rôle & Abonnement</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Rattachement</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Passations</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span className="badge" style={{ 
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700, 
                      background: user.role.startsWith("ADMIN") || user.role === "SUPER_ADMIN" ? "rgba(89,101,232,0.1)" : "rgba(255,255,255,0.05)",
                      color: user.role.startsWith("ADMIN") || user.role === "SUPER_ADMIN" ? "var(--indigo)" : "var(--text-2)",
                      marginBottom: 6,
                    }}>
                      {user.role === "SUPER_ADMIN" ? <ShieldAlert size={12} /> : null}
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                    <br />
                    <span className="badge" style={{ 
                      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
                      background: user.subscription === "PREMIUM_PLUS" ? "rgba(245,158,11,0.1)" : user.subscription === "PREMIUM" ? "rgba(0,169,157,0.1)" : "rgba(255,255,255,0.05)",
                      color: user.subscription === "PREMIUM_PLUS" ? "var(--amber)" : user.subscription === "PREMIUM" ? "var(--primary)" : "var(--text-2)"
                    }}>
                      {user.subscription !== "FREEMIUM" && <Crown size={10} />}
                      {user.subscription}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {user.organization ? (
                      <div style={{ color: "var(--text-1)", fontSize: 12 }}>🏢 {user.organization.name}</div>
                    ) : (
                      <div style={{ color: "var(--text-2)", fontSize: 12, fontStyle: "italic" }}>Client Individuel (B2C)</div>
                    )}
                    {user.campaign && (
                      <div style={{ color: "var(--text-2)", fontSize: 11, marginTop: 4 }}>Campagne: {user.campaign.name}</div>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{user._count?.results || user._count?.assessments || 0}</div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button onClick={() => handleManageClick(user)} className="btn btn-tertiary btn-sm" style={{ padding: "6px 12px" }}>
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "var(--text-3)" }}>
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!loading && Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) > 1 && (
          <div style={{ padding: "16px 24px", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-3)", fontSize: 13, fontWeight: 500 }}>
              Affichage de {((currentPage - 1) * ITEMS_PER_PAGE) + 1} à {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length} éléments
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {Array.from({ length: Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
                if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                  if (page === 4 || page === totalPages - 2) return <span key={page} style={{ padding: "0 4px", color: "var(--text-3)" }}>…</span>;
                  return null;
                }
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{ 
                    width: 32, height: 32, borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isActive ? "var(--primary)" : "transparent", 
                    border: isActive ? "none" : "1px solid var(--border)", 
                    color: isActive ? "white" : "var(--text-2)", 
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                  onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <>
          {/* Overlay léger au lieu du noir profond */}
          <div 
            onClick={() => {
              setSelectedUser(null);
              setSaveError(null);
              setSaveSuccess(false);
              setConfirmDelete(false);
            }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(18,61,70,0.3)", backdropFilter: "blur(2px)",
              zIndex: 90, animation: "fadeIn 0.2s ease-out"
            }} 
          />

          {/* Panneau latéral (Drawer) */}
          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: "100%", maxWidth: 480,
            background: "var(--surface)", borderLeft: "1px solid var(--border)",
            zIndex: 100, padding: "32px", overflowY: "auto",
            boxShadow: "-8px 0 32px rgba(18,61,70,0.1)",
            animation: "fadeIn 0.3s ease-out",
            display: "flex", flexDirection: "column"
          }}>
            <button
              onClick={() => {
                setSelectedUser(null);
                setSaveError(null);
                setSaveSuccess(false);
                setConfirmDelete(false);
              }}
              style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "var(--text-2)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={20} style={{ color: "#38bdf8" }} />
              Profil Utilisateur
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: 14, marginBottom: 24 }}>
              {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", fontWeight: 600, marginBottom: 8 }}>Niveau d'Abonnement</label>
                <Select 
                  value={editForm.subscription} 
                  onChange={(val) => setEditForm(prev => ({ ...prev, subscription: val }))}
                  options={[
                    { value: "FREEMIUM", label: "Freemium (Gratuit)" },
                    { value: "PREMIUM", label: "Premium" },
                    { value: "PREMIUM_PLUS", label: "Premium+ (Accès Binôme)" }
                  ]}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "var(--text-2)", fontWeight: 600, marginBottom: 8 }}>Rôle Système</label>
                <Select 
                  value={editForm.role} 
                  onChange={(val) => setEditForm(prev => ({ ...prev, role: val }))}
                  disabled={selectedUser.role === "SUPER_ADMIN"}
                  options={[
                    { value: "CITIZEN", label: "Client (CITIZEN)" },
                    { value: "EMPLOYEE", label: "Employé (EMPLOYEE)" },
                    { value: "MEMBER", label: "Membre (MEMBER)" },
                    { value: "ADMIN_B2B", label: "Admin Entreprises (ADMIN_B2B)" },
                    { value: "ADMIN_B2B2C", label: "Admin Mutuelles (ADMIN_B2B2C)" },
                    { value: "ADMIN_B2G", label: "Admin Collectivités (ADMIN_B2G)" },
                    { value: "SUPER_ADMIN", label: "Super Admin (SUPER_ADMIN)" }
                  ]}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "8px 0" }} />

              {/* Feedback inline succès / erreur */}
              {saveSuccess && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  borderRadius: 10, background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}>
                  <CheckCircle2 size={14} style={{ color: "#34d399", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#34d399" }}>Modifications enregistrées avec succès.</span>
                </div>
              )}
              {saveError && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                  borderRadius: 10, background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}>
                  <AlertCircle size={14} style={{ color: "#f87171", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#f87171" }}>{saveError}</span>
                </div>
              )}

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
                    <button onClick={() => setConfirmDelete(false)} disabled={isSaving} className="btn btn-tertiary btn-sm" style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "none" }}>
                      Annuler
                    </button>
                    <button onClick={handleDelete} disabled={isSaving} className="btn btn-danger btn-sm">
                      {isSaving ? "Suppression..." : "Oui, supprimer définitivement"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
