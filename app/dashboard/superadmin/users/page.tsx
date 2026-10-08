"use client";

import { useState, useEffect } from "react";
import { Users, Search, ShieldAlert, X, Save, Trash2, AlertTriangle, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { SubscriptionBadge, toSubscriptionTier } from "@/components/ui/SubscriptionBadge";

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
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterOrg, setFilterOrg] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ subscription: "", role: "", organizationId: "", campaignId: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    fetch("/api/superadmin/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        if (data.organizations) setOrganizations(data.organizations);
        if (data.campaigns) setCampaigns(data.campaigns);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleManageClick = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      subscription: user.subscription,
      role: user.role,
      organizationId: user.organizationId || "",
      campaignId: user.campaignId || "",
    });
    setConfirmDelete(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    setSaveError(null);
    setSaveSuccess(false);
    setConfirmDelete(false);
  };

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
      const res = await fetch(`/api/superadmin/users/${selectedUser.id}`, { method: "DELETE" });
      if (res.ok) {
        closeDrawer();
        loadUsers();
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Erreur lors de la suppression.");
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

    if (!matchSearch) return false;

    if (filterRole === "B2C") {
      if (user.organizationId || (user.role.startsWith("ADMIN_") || user.role === "SUPER_ADMIN")) {
        return false;
      }
    } else if (filterRole === "ADMINS") {
      if (!(user.role.startsWith("ADMIN_") || user.role === "SUPER_ADMIN")) {
        return false;
      }
    }

    if (filterOrg === "NONE") {
      if (user.organizationId) return false;
    } else if (filterOrg !== "ALL") {
      if (user.organizationId !== filterOrg) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#00A99D]" />
            CRM Utilisateurs
          </h1>
          <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
            Gérez les utilisateurs individuels, rattachements aux organisations, abonnements et modérateurs.
          </p>
        </div>
        <a href="/api/admin/users/export" download className="no-underline shrink-0">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#123D46] hover:bg-[#0D2530] text-white font-jakarta font-bold text-sm transition-colors shadow-2xs cursor-pointer">
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </a>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#123D46]/40" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#E3EBE6] focus:ring-1 focus:ring-[#00A99D] focus:outline-none text-sm text-[#123D46] placeholder:text-[#123D46]/40 bg-white"
          />
        </div>
        <Select
          value={filterRole}
          onChange={(val) => { setFilterRole(val); setCurrentPage(1); }}
          options={[
            { value: "ALL", label: "Tous les statuts" },
            { value: "B2C", label: "Particuliers (B2C)" },
            { value: "ADMINS", label: "Administrateurs" }
          ]}
          className="w-[180px] text-sm font-jakarta"
        />
        <Select
          value={filterOrg}
          onChange={(val) => { setFilterOrg(val); setCurrentPage(1); }}
          options={[
            { value: "ALL", label: "Toutes les organisations" },
            { value: "NONE", label: "Sans organisation (B2C)" },
            ...organizations.map(org => ({
              value: org.id,
              label: `${org.name} (${org.type})`
            }))
          ]}
          className="w-[260px] text-sm font-jakarta"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 bg-[#F8F9FA] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
                <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Rôle & Abonnement</th>
                <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Rattachement</th>
                <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-center">Passations</th>
                <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[#123D46] text-sm">{user.firstName} {user.lastName}</div>
                    <div className="text-[#123D46]/60 text-xs mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mb-1.5 ${
                      user.role.startsWith("ADMIN") || user.role === "SUPER_ADMIN"
                        ? "bg-[#5965E8]/10 text-[#5965E8]"
                        : "bg-[#F8F9FA] text-[#123D46]/70"
                    }`}>
                      {user.role === "SUPER_ADMIN" && <ShieldAlert className="w-3 h-3" />}
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                    <br />
                    <SubscriptionBadge tier={toSubscriptionTier(user.subscription)} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    {user.organization ? (
                      <div>
                        <div className="text-[#123D46] text-xs font-semibold flex items-center gap-1.5">
                          <span>{user.organization.type === "B2G" ? "🏛️" : user.organization.type === "B2B2C" ? "🛡️" : "🏢"}</span>
                          <span>{user.organization.name}</span>
                        </div>
                        {user.campaign && (
                          <div className="text-[#123D46]/60 text-[11px] mt-0.5">
                            Campagne : <span className="font-medium text-[#123D46]/85">{user.campaign.title}</span>
                          </div>
                        )}
                      </div>
                    ) : user.role === "CITIZEN" ? (
                      <div className="text-[#123D46]/60 text-xs italic">Client Individuel (B2C)</div>
                    ) : user.role === "SUPER_ADMIN" ? (
                      <div className="text-[#5965E8] text-xs font-semibold">Plateforme LinkOffice</div>
                    ) : (
                      <div className="text-amber-700/70 text-xs italic">Non rattaché</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-[#123D46]">{user._count?.results || user._count?.assessments || 0}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleManageClick(user)}
                      className="px-4 py-1.5 rounded-full border border-[#E3EBE6] bg-white hover:border-[#00A99D] hover:bg-[#00A99D]/10 text-[#123D46] hover:text-[#00A99D] text-xs font-jakarta font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#123D46]/50 text-sm">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-[#E3EBE6]">
            <span className="text-[#123D46]/60 text-[13px] font-medium">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                if (totalPages > 7 && page > 3 && page < totalPages - 1 && page !== currentPage) {
                  if (page === 4 || page === totalPages - 2) return <span key={page} className="px-1 text-[#123D46]/40">…</span>;
                  return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#00A99D] text-white border-none"
                        : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#F8F9FA]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Side Drawer — User Management */}
      {selectedUser && (
        <>
          {/* Overlay */}
          <div
            onClick={closeDrawer}
            className="fixed inset-0 bg-[#123D46]/30 backdrop-blur-[2px] z-40 animate-fade-in"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white border-l border-[#E3EBE6] z-50 p-8 overflow-y-auto shadow-2xl flex flex-col animate-fade-in">
            <button
              onClick={closeDrawer}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-[#123D46]/50 hover:text-[#123D46] hover:bg-[#F4F1E8] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-jakarta font-bold text-[#123D46] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#00A99D]/10 text-[#00A99D] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                Profil Utilisateur
              </h2>
              <p className="text-[#123D46]/70 text-sm mt-1.5">
                {selectedUser.firstName} {selectedUser.lastName} · <span className="font-mono">{selectedUser.email}</span>
              </p>
            </div>

            <div className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Niveau d'Abonnement</label>
                <Select
                  value={editForm.subscription}
                  onChange={(val) => setEditForm(prev => ({ ...prev, subscription: val }))}
                  options={[
                    { value: "FREEMIUM", label: "Freemium (Gratuit)" },
                    { value: "PREMIUM", label: "Premium" },
                    { value: "PREMIUM_PLUS", label: "Premium+ (Accès Binôme)" }
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Rôle Système</label>
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
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Organisation de Rattachement</label>
                <Select
                  value={editForm.organizationId}
                  onChange={(val) => {
                    setEditForm(prev => ({
                      ...prev,
                      organizationId: val,
                      campaignId: campaigns.some(c => c.id === prev.campaignId && c.organizationId === val) ? prev.campaignId : ""
                    }));
                  }}
                  options={[
                    { value: "", label: "Aucune (Client B2C / Indépendant)" },
                    ...organizations.map(org => ({
                      value: org.id,
                      label: `${org.name} (${org.type})`
                    }))
                  ]}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#123D46]/70 font-semibold mb-2">Campagne / Consultation</label>
                <Select
                  value={editForm.campaignId}
                  onChange={(val) => setEditForm(prev => ({ ...prev, campaignId: val }))}
                  options={[
                    { value: "", label: "Aucune campagne" },
                    ...campaigns
                      .filter(c => !editForm.organizationId || c.organizationId === editForm.organizationId)
                      .map(c => ({
                        value: c.id,
                        label: c.title
                      }))
                  ]}
                  className="w-full"
                />
              </div>

              <div className="h-px bg-[#E3EBE6]" />

              {/* Feedback banners */}
              {saveSuccess && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-[13px] text-emerald-600 font-medium">Modifications enregistrées avec succès.</span>
                </div>
              )}
              {saveError && (
                <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="text-[13px] text-rose-600 font-medium">{saveError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {!confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 text-rose-500 text-xs font-jakarta font-semibold hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 ${confirmDelete ? "ml-auto" : ""}`}
                >
                  {isSaving ? "Enregistrement..." : <><Save className="w-4 h-4" /> Enregistrer</>}
                </button>
              </div>

              {confirmDelete && (
                <div className="mt-2 p-4 rounded-xl bg-rose-50 border border-rose-200">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> Êtes-vous absolument sûr ?
                  </div>
                  <p className="text-[13px] text-rose-500/90 mb-4 leading-relaxed">
                    Cette action est <strong>irréversible</strong>. Toutes les données associées (profil, résultats IQRH, historique) seront définitivement effacées.
                  </p>
                  <div className="flex gap-2.5 justify-end">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-full border border-[#E3EBE6] text-[#123D46] text-xs font-jakarta font-semibold hover:bg-[#F4F1E8] transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSaving}
                      className="px-5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-jakarta font-bold text-xs transition-colors disabled:opacity-60"
                    >
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
