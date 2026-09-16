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



  if (loading) return <div style={{ padding: 40, color: "var(--text-2)" }}>Chargement...</div>;
  if (!org) return <div style={{ padding: 40, color: "var(--rose)" }}>Organisation introuvable.</div>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/dashboard/superadmin/organizations" style={{ color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 13 }}>
          <ArrowLeft size={15} /> Retour aux organisations
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 12 }}>
            <Building2 size={32} color={org.type === "B2B2C" ? "#fcd34d" : "var(--violet)"} />
            {org.name}
          </h1>
          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
            <span style={{ 
              padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, 
              background: org.type === "B2B2C" ? "rgba(245,158,11,0.15)" : org.type === "B2G" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
              color: org.type === "B2B2C" ? "#fcd34d" : org.type === "B2G" ? "#7dd3fc" : "var(--violet)",
            }}>
              {org.type}
            </span>
            <code style={{ background: "var(--surface)", padding: "4px 8px", borderRadius: 6, fontSize: 12, color: "var(--primary)" }}>
              Code: {org.codeAccess}
            </code>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 }}>
        
        {/* Ligne 1 : Contrat et Admins */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, alignItems: "start" }}>
          
          {/* Fiche Contrat */}
          <div className="card" style={{ padding: 20, height: "100%" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={18} color="var(--emerald)" /> Informations et Contrat
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, color: "var(--text-2)", fontSize: 13 }}>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Contact principal</b> {org.contactName || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Email contact</b> {org.contactEmail || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Type de contrat</b> {org.contractType || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Territoire cible</b> {org.territory || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Population visée</b> {org.targetPopulation || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Quota (Accès Max)</b> {org.quota || "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Date de début</b> {org.startDate ? new Date(org.startDate).toLocaleDateString() : "—"}</div>
              <div><b style={{ color: "var(--text-2)", display: "block", marginBottom: 4 }}>Date de fin</b> {org.endDate ? new Date(org.endDate).toLocaleDateString() : "—"}</div>
            </div>
          </div>

          {/* Liste Administrateurs */}
          <div className="card" style={{ padding: 20, height: "100%" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color="var(--cyan)" /> Administrateurs
            </h2>
            {org.users?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {org.users.map((u: any) => (
                  <div key={u.id} style={{ padding: "12px 16px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--surface)" }}>
                    <div style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                    <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>{u.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-3)", fontSize: 13 }}>Aucun administrateur trouvé.</p>
            )}
          </div>
        </div>

        {/* Ligne 2 : Campagnes */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 8 }}>
              <Calendar size={18} color="var(--primary)" /> Campagnes
            </h2>
            <button 
              onClick={() => {
                const route = org.type === "B2B" ? "rh" : org.type.toLowerCase();
                router.push(`/dashboard/${route}/campaigns/new?orgId=${org.id}`);
              }} 
              className="btn btn-primary btn-sm"
            >
              + Nouvelle campagne
            </button>
          </div>

          <>
            {org.campaigns?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {org.campaigns.map((c: any) => (
                  <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--surface)" }}>
                    <div>
                      <div style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15 }}>{c.title}</div>
                      <div style={{ color: "var(--text-2)", fontSize: 13, marginTop: 4 }}>
                        Du {new Date(c.startDate).toLocaleDateString()} au {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "rgba(245,158,11,0.1)", color: "var(--amber)", border: "1px solid rgba(245,158,11,0.2)" }}>
                      <Crown size={14} style={{ display: "inline", marginRight: 6, marginBottom: -2 }} />
                      {c.offer}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: 40, border: "1px dashed var(--border-strong)", borderRadius: 12 }}>
                <Calendar size={32} color="var(--text-2)" style={{ marginBottom: 12 }} />
                <h3 style={{ color: "var(--text-2)", fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aucune campagne</h3>
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>Cette organisation n'a pas encore de campagne configurée.</p>
              </div>
            )}
          </>
        </div>
      </div>
    </>
  );
}
