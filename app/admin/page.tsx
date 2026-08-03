/**
 * app/admin/page.tsx — Console d'administration
 * ─────────────────────────────────────────────────────────
 * Accessible uniquement aux SUPER_ADMIN.
 * Permet de créer des organisations de test pour valider
 * les dashboards B2B, B2B2C et Collectivités.
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Building2, Plus, CheckCircle2, AlertCircle, Users, Copy, ExternalLink } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: string;
  codeAccess: string;
  _count: { users: number };
}

type OrgType = "B2B" | "B2B2C" | "COLLECTIVITE";

const TYPE_LABELS: Record<OrgType, { label: string; color: string; dashboardPath: string }> = {
  B2B: { label: "Entreprise (B2B)", color: "#a78bfa", dashboardPath: "/dashboard/b2b" },
  B2B2C: { label: "Mutuelle (B2B2C)", color: "#34d399", dashboardPath: "/dashboard/b2b2c" },
  COLLECTIVITE: { label: "Collectivité", color: "#06b6d4", dashboardPath: "/dashboard/collectivites" },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "B2B" as OrgType, siren: "", domainName: "" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      // Chargement via une API dédiée SUPER_ADMIN
      const r = await fetch("/api/admin/organizations");
      if (r.ok) setOrgs(await r.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrgs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const r = await fetch("/api/b2b/organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Erreur");
      setSuccess(`Organisation "${data.name}" créée ! Code d'accès : ${data.codeAccess}`);
      setForm({ name: "", type: "B2B", siren: "", domainName: "" });
      loadOrgs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "var(--surface-2)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "10px 14px", color: "var(--text-1)", fontSize: 14,
    fontFamily: "inherit", outline: "none",
  };

  if (status === "loading") return null;

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="page-container-wide" style={{ position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: "rgba(245,158,11,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 style={{ width: 26, height: 26, color: "#f59e0b" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc" }}>
                Console d&apos;Administration
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>Gestion des organisations — SUPER_ADMIN uniquement</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>

            {/* Formulaire de création */}
            <div className="card">
              <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Plus size={16} style={{ color: "#a78bfa" }} /> Créer une organisation
              </h2>
              <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Nom *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OrgType }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="B2B">Entreprise (B2B)</option>
                    <option value="B2B2C">Mutuelle (B2B2C)</option>
                    <option value="COLLECTIVITE">Collectivité</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>SIREN</label>
                  <input type="text" value={form.siren} onChange={e => setForm(f => ({ ...f, siren: e.target.value }))} placeholder="123456789" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, color: "var(--text-2)", marginBottom: 5 }}>Domaine SSO</label>
                  <input type="text" value={form.domainName} onChange={e => setForm(f => ({ ...f, domainName: e.target.value }))} placeholder="acme.com" style={inputStyle} />
                </div>

                {success && (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                    <CheckCircle2 size={14} style={{ color: "#34d399", flexShrink: 0, marginTop: 1 }} />
                    <span style={{ color: "#6ee7b7", fontSize: 12 }}>{success}</span>
                  </div>
                )}
                {error && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 8, padding: "10px 12px" }}>
                    <AlertCircle size={14} style={{ color: "#f43f5e", flexShrink: 0 }} />
                    <span style={{ color: "#f43f5e", fontSize: 12 }}>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={creating} className="btn btn-primary btn-md">
                  {creating ? "Création…" : <><Plus size={14} /> Créer l&apos;organisation</>}
                </button>
              </form>
            </div>

            {/* Liste des organisations */}
            <div className="card">
              <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={16} style={{ color: "#06b6d4" }} /> Organisations existantes
                <span className="badge badge-cyan" style={{ marginLeft: "auto" }}>{orgs.length}</span>
              </h2>

              {loading ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>Chargement…</p>
              ) : orgs.length === 0 ? (
                <p style={{ color: "#475569", fontSize: 13 }}>Aucune organisation créée.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {orgs.map((org) => {
                    const typeInfo = TYPE_LABELS[org.type as OrgType] ?? TYPE_LABELS.B2B;
                    return (
                      <div key={org.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{org.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 999, background: `${typeInfo.color}18`, color: typeInfo.color, border: `1px solid ${typeInfo.color}30` }}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#475569" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Users size={10} /> {org._count?.users ?? 0} utilisateur(s)
                            </span>
                            <span>Code : <code style={{ color: "#a78bfa", fontSize: 11 }}>{org.codeAccess}</code></span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join/${org.codeAccess}`)}
                            title="Copier le lien d'invitation"
                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#64748b" }}
                          >
                            <Copy size={13} />
                          </button>
                          <a href={typeInfo.dashboardPath} target="_blank" rel="noopener noreferrer"
                            title="Voir le dashboard" style={{ display: "flex", alignItems: "center", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", color: "#64748b", textDecoration: "none" }}>
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
