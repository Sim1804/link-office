/**
 * app/admin/page.tsx — Console d'administration
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Building2, Plus, CheckCircle2, AlertCircle, Users, Copy, ExternalLink, Inbox, ArrowRight } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  type: string;
  codeAccess: string;
  _count: { users: number };
}

interface Lead {
  id: string;
  organization: string;
  contactName: string;
  email: string;
  phone: string | null;
  planType: string;
  companySize: string | null;
  populationSize: string | null;
  beneficiaries: string | null;
  status: string;
  createdAt: string;
}

type OrgType = "B2B" | "B2B2C" | "COLLECTIVITE";
type TabType = "ORGS" | "LEADS";

const TYPE_LABELS: Record<string, { label: string; color: string; dashboardPath: string }> = {
  B2B: { label: "Entreprise (B2B)", color: "#a78bfa", dashboardPath: "/dashboard/rh" },
  B2B2C: { label: "Mutuelle (B2B2C)", color: "#34d399", dashboardPath: "/dashboard/b2b2c" },
  COLLECTIVITE: { label: "Collectivité", color: "#06b6d4", dashboardPath: "/dashboard/collectivites" },
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("LEADS");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Lead conversion state
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [campaignOffer, setCampaignOffer] = useState<"PREMIUM" | "PREMIUM_PLUS">("PREMIUM");
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertResult, setConvertResult] = useState<any>(null);

  // Quick Org creation state
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", type: "B2B" as OrgType, siren: "", domainName: "" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rOrgs, rLeads] = await Promise.all([
        fetch("/api/admin/organizations"),
        fetch("/api/admin/leads")
      ]);
      if (rOrgs.ok) setOrgs(await rOrgs.json());
      if (rLeads.ok) setLeads(await rLeads.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
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
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreating(false);
    }
  };

  const handleConvertLead = async () => {
    if (!convertingLead) return;
    setConvertLoading(true);
    try {
      const r = await fetch(`/api/admin/leads/${convertingLead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: campaignOffer })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Erreur de conversion");
      
      setConvertResult(data);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setConvertLoading(false);
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
              <p style={{ color: "#64748b", fontSize: 14 }}>Gestion des Leads et Organisations — SUPER_ADMIN uniquement</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button 
              onClick={() => setActiveTab("LEADS")}
              style={{
                background: activeTab === "LEADS" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                border: activeTab === "LEADS" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                color: activeTab === "LEADS" ? "#fbbf24" : "#94a3b8",
                padding: "8px 16px", borderRadius: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
              }}
            >
              <Inbox size={16} /> Demandes (Leads)
              <span style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 10, fontSize: 12 }}>
                {leads.filter(l => l.status !== "CONVERTED").length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab("ORGS")}
              style={{
                background: activeTab === "ORGS" ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                border: activeTab === "ORGS" ? "1px solid #0ea5e9" : "1px solid rgba(255,255,255,0.1)",
                color: activeTab === "ORGS" ? "#38bdf8" : "#94a3b8",
                padding: "8px 16px", borderRadius: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer"
              }}
            >
              <Building2 size={16} /> Organisations actives
            </button>
          </div>

          {activeTab === "LEADS" && (
            <div className="card">
              <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 20 }}>Demandes de devis entrantes</h2>
              
              {convertingLead && (
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 16, padding: 24, marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Convertir le Lead : {convertingLead.organization}</h3>
                      <p style={{ color: "#cbd5e1", fontSize: 14 }}>
                        Cela va créer l'organisation, le compte administrateur <b>{convertingLead.email}</b>, et la première campagne.
                      </p>
                    </div>
                    <button onClick={() => { setConvertingLead(null); setConvertResult(null); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>Fermer</button>
                  </div>

                  {!convertResult ? (
                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                      {convertingLead.planType === "B2B2C_PARTENAIRE" && (
                        <div>
                          <label style={{ display: "block", fontSize: 13, color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>Offre de la Campagne Partenaire *</label>
                          <select value={campaignOffer} onChange={e => setCampaignOffer(e.target.value as any)} style={inputStyle}>
                            <option value="PREMIUM">PREMIUM (Parcours Premium classique, sans Binôme)</option>
                            <option value="PREMIUM_PLUS">PREMIUM+ (Parcours Premium + Module Binôme Relationnel)</option>
                          </select>
                        </div>
                      )}
                      
                      <button 
                        onClick={handleConvertLead} disabled={convertLoading}
                        style={{
                          background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white",
                          padding: "12px 24px", borderRadius: 10, fontWeight: 600, border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start"
                        }}
                      >
                        {convertLoading ? "Conversion en cours..." : "Valider et Créer le Client"}
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 24, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 20 }}>
                      <h4 style={{ color: "#34d399", fontWeight: 700, fontSize: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        <CheckCircle2 size={18} /> Conversion Réussie !
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14, color: "#cbd5e1" }}>
                        <div><b>Organisation :</b> {convertResult.organization}</div>
                        <div><b>Email Admin :</b> {convertResult.adminEmail}</div>
                        <div><b>Mot de passe (temporaire) :</b> <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#a78bfa" }}>{convertResult.tempPassword}</code></div>
                        <div><b>Code d'accès Campagne :</b> <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#38bdf8" }}>{convertResult.codeAccess}</code></div>
                        <div><b>Offre activée :</b> {convertResult.campaignOffer}</div>
                      </div>
                      <p style={{ marginTop: 16, fontSize: 13, color: "#94a3b8" }}>Transmettez ces informations au client. Il pourra se connecter et accéder à son dashboard.</p>
                    </div>
                  )}
                </div>
              )}

              {loading ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>Chargement…</p>
              ) : leads.filter(l => l.status !== "CONVERTED").length === 0 ? (
                <p style={{ color: "#475569", fontSize: 13 }}>Aucun nouveau lead.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {leads.filter(l => l.status !== "CONVERTED").map((lead) => (
                    <div key={lead.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ color: "#f8fafc", fontWeight: 700, fontSize: 16 }}>{lead.organization}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: `rgba(245,158,11,0.1)`, color: "#fbbf24", border: `1px solid rgba(245,158,11,0.3)` }}>
                            {lead.planType.replace("B2G_", "").replace("B2B2C_", "").replace("B2B_", "")}
                          </span>
                          <span style={{ fontSize: 12, color: "#64748b", marginLeft: 8 }}>
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: "#cbd5e1", display: "flex", gap: 16 }}>
                          <span><b>Contact:</b> {lead.contactName} ({lead.email})</span>
                          {lead.companySize && <span><b>Taille:</b> {lead.companySize}</span>}
                          {lead.beneficiaries && <span><b>Bénéficiaires:</b> {lead.beneficiaries}</span>}
                        </div>
                      </div>
                      <button 
                        onClick={() => { setConvertingLead(lead); setConvertResult(null); }}
                        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24", padding: "8px 16px", borderRadius: 8, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        Convertir <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ORGS" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
              {/* Formulaire de création rapide */}
              <div className="card">
                <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Plus size={16} style={{ color: "#a78bfa" }} /> Création manuelle rapide
                </h2>
                <form onSubmit={handleCreateOrg} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                    {creating ? "Création…" : <><Plus size={14} /> Créer l'organisation</>}
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
                      const typeInfo = TYPE_LABELS[org.type] ?? TYPE_LABELS.B2B;
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
          )}

        </div>
      </main>
    </>
  );
}
