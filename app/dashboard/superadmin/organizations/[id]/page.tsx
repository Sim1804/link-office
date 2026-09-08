"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Users, AlertCircle, CheckCircle2, ShieldCheck, Crown } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: string;
  codeAccess: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contractType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  targetPopulation?: number | null;
  quota?: number | null;
  territory?: string | null;
  users: any[];
  campaigns: any[];
}

export default function OrganizationDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [org, setOrg] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // Campaign Form
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [form, setForm] = useState({ title: "", offer: "PREMIUM", startDate: "", endDate: "", targetPopulation: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/organizations/${params.id}`);
      if (res.ok) {
        setOrg(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setCreating(true); setError(null); setSuccess(null);
    try {
      const r = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId: org.id }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erreur serveur");
      setSuccess("Campagne créée avec succès !");
      setForm({ title: "", offer: "PREMIUM", startDate: "", endDate: "", targetPopulation: "" });
      setShowCampaignForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Chargement...</div>;
  if (!org) return <div style={{ padding: 40, color: "#f43f5e" }}>Organisation introuvable.</div>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/dashboard/superadmin/organizations" style={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Retour aux organisations
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <Building2 size={32} color={org.type === "B2B2C" ? "#fcd34d" : "#c084fc"} />
            {org.name}
          </h1>
          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
            <span style={{ 
              padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, 
              background: org.type === "B2B2C" ? "rgba(245,158,11,0.15)" : org.type === "COLLECTIVITE" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
              color: org.type === "B2B2C" ? "#fcd34d" : org.type === "COLLECTIVITE" ? "#7dd3fc" : "#c084fc",
            }}>
              {org.type}
            </span>
            <code style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6, fontSize: 12, color: "#a78bfa" }}>
              Code: {org.codeAccess}
            </code>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
        
        {/* Ligne 1 : Contrat et Admins */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          
          {/* Fiche Contrat */}
          <div className="card" style={{ padding: 24, height: "100%" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color="#34d399" /> Informations et Contrat
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, color: "#cbd5e1", fontSize: 13 }}>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Contact principal</b> {org.contactName || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Email contact</b> {org.contactEmail || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Type de contrat</b> {org.contractType || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Territoire cible</b> {org.territory || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Population visée</b> {org.targetPopulation || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Quota (Accès Max)</b> {org.quota || "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Date de début</b> {org.startDate ? new Date(org.startDate).toLocaleDateString() : "—"}</div>
              <div><b style={{ color: "#94a3b8", display: "block", marginBottom: 4 }}>Date de fin</b> {org.endDate ? new Date(org.endDate).toLocaleDateString() : "—"}</div>
            </div>
          </div>

          {/* Liste Administrateurs */}
          <div className="card" style={{ padding: 24, height: "100%" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color="#38bdf8" /> Administrateurs
            </h2>
            {org.users?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {org.users.map((u: any) => (
                  <div key={u.id} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{u.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b", fontSize: 13 }}>Aucun administrateur trouvé.</p>
            )}
          </div>
        </div>

        {/* Ligne 2 : Campagnes */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="#a78bfa" /> Campagnes
            </h2>
            <button onClick={() => setShowCampaignForm(!showCampaignForm)} className={showCampaignForm ? "btn btn-ghost btn-sm" : "btn btn-primary btn-sm"}>
              {showCampaignForm ? "Annuler" : "+ Nouvelle campagne"}
            </button>
          </div>

          {showCampaignForm ? (
            <div style={{ background: "rgba(15,23,42,0.4)", borderRadius: 12, border: "1px solid rgba(192,132,252,0.2)", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#c084fc", marginBottom: 16 }}>Configurer une nouvelle campagne</h3>
              <form onSubmit={handleCreateCampaign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Nom de la campagne *</label>
                    <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Ex: Campagne 2026" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Population cible / Quota</label>
                    <input type="number" value={form.targetPopulation} onChange={e => setForm(f => ({ ...f, targetPopulation: e.target.value }))} className="input-field" placeholder="Ex: 500" />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Offre proposée *</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label style={{ flex: 1, padding: 12, background: form.offer === "PREMIUM" ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.offer === "PREMIUM" ? "#7c3aed" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="radio" checked={form.offer === "PREMIUM"} onChange={() => setForm(f => ({ ...f, offer: "PREMIUM" }))} style={{ accentColor: "#7c3aed", width: 16, height: 16 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: form.offer === "PREMIUM" ? "#fff" : "#94a3b8" }}>Premium</span>
                    </label>
                    <label style={{ flex: 1, padding: 12, background: form.offer === "PREMIUM_PLUS" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${form.offer === "PREMIUM_PLUS" ? "#f59e0b" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="radio" checked={form.offer === "PREMIUM_PLUS"} onChange={() => setForm(f => ({ ...f, offer: "PREMIUM_PLUS" }))} style={{ accentColor: "#f59e0b", width: 16, height: 16 }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: form.offer === "PREMIUM_PLUS" ? "#fff" : "#94a3b8" }}>Premium+</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Début *</label>
                    <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6 }}>Fin *</label>
                    <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                  </div>
                </div>

                {error && <div style={{ color: "#f43f5e", fontSize: 13, display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}><AlertCircle size={14} /> {error}</div>}
                {success && <div style={{ color: "#34d399", fontSize: 13, display: "flex", gap: 6, alignItems: "center", marginTop: 8 }}><CheckCircle2 size={14} /> {success}</div>}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  <button type="submit" disabled={creating} className="btn btn-primary btn-md" style={{ minWidth: 200 }}>
                    {creating ? "Création..." : "Créer la campagne"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {org.campaigns?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {org.campaigns.map((c: any) => (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div>
                        <div style={{ color: "#f8fafc", fontWeight: 600, fontSize: 15 }}>{c.title}</div>
                        <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                          Du {new Date(c.startDate).toLocaleDateString()} au {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.2)" }}>
                        <Crown size={14} style={{ display: "inline", marginRight: 6, marginBottom: -2 }} />
                        {c.offer}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 40, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12 }}>
                  <Calendar size={32} color="#475569" style={{ marginBottom: 12 }} />
                  <h3 style={{ color: "#cbd5e1", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aucune campagne</h3>
                  <p style={{ color: "#64748b", fontSize: 13 }}>Cette organisation n'a pas encore de campagne configurée.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
