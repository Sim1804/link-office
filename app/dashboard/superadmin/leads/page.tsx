"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Inbox, CheckCircle2, ArrowRight } from "lucide-react";

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

export default function LeadsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [campaignOffer, setCampaignOffer] = useState<"PREMIUM" | "PREMIUM_PLUS">("PREMIUM");
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertResult, setConvertResult] = useState<any>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads");
      if (res.ok) setLeads(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleConvertLead = async () => {
    if (!convertingLead) return;
    setConvertLoading(true);
    try {
      const r = await fetch(`/api/admin/leads/${convertingLead.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: campaignOffer }),
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

  if (status === "loading") return null;

  const pendingLeads = leads.filter(l => l.status !== "CONVERTED");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <Inbox size={32} color="#34d399" />
            Demandes de Devis (Leads)
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Gérez les prospects et convertissez-les en clients avec génération automatique de compte.</p>
        </div>
      </div>

      {convertingLead && (
        <div style={{
          background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 16, padding: 24, marginBottom: 24
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>Convertir : {convertingLead.organization}</h3>
              <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
                Cela va créer l&apos;organisation, le compte <b style={{ color: "#cbd5e1" }}>{convertingLead.email}</b> et la première campagne.
              </p>
            </div>
            <button onClick={() => { setConvertingLead(null); setConvertResult(null); }} className="btn btn-ghost btn-sm">
              Fermer
            </button>
          </div>

          {!convertResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {convertingLead.planType === "B2B2C_PARTENAIRE" && (
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#fbbf24", fontWeight: 600, marginBottom: 8 }}>
                    Offre de la Campagne *
                  </label>
                  <select value={campaignOffer} onChange={e => setCampaignOffer(e.target.value as any)} className="input-field" style={{ maxWidth: 300 }}>
                    <option value="PREMIUM">PREMIUM - Parcours Premium classique</option>
                    <option value="PREMIUM_PLUS">PREMIUM+ - Inclut Module Binôme Relationnel</option>
                  </select>
                </div>
              )}
              <button onClick={handleConvertLead} disabled={convertLoading} className="btn btn-amber btn-md" style={{ alignSelf: "flex-start" }}>
                {convertLoading ? "Conversion en cours..." : <>Valider et Créer le Client <ArrowRight size={14} /></>}
              </button>
            </div>
          ) : (
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 20 }}>
              <h4 style={{ color: "#34d399", fontWeight: 700, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> Conversion Réussie !
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "#cbd5e1" }}>
                <div><b style={{ color: "#94a3b8" }}>Organisation :</b> {convertResult.organization}</div>
                <div><b style={{ color: "#94a3b8" }}>Admin :</b> {convertResult.adminEmail}</div>
                <div><b style={{ color: "#94a3b8" }}>Mot de passe :</b> <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#a78bfa" }}>{convertResult.tempPassword}</code></div>
                <div><b style={{ color: "#94a3b8" }}>Code :</b> <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, color: "#38bdf8" }}>{convertResult.codeAccess}</code></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Chargement...</div>
        ) : pendingLeads.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Aucune demande de devis en attente.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Organisation</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Contact</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Offre souhaitée</th>
                <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: 15 }}>{lead.organization}</div>
                    <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>Date : {new Date(lead.createdAt).toLocaleDateString("fr-FR")}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ color: "#e2e8f0", fontSize: 14 }}>{lead.contactName}</div>
                    <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{lead.email}</div>
                    {lead.phone && <div style={{ color: "#94a3b8", fontSize: 13 }}>{lead.phone}</div>}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: 999, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: lead.planType === "B2B2C_PARTENAIRE" ? "rgba(245,158,11,0.15)" : lead.planType === "B2G_COLLECTIVITE" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
                      color: lead.planType === "B2B2C_PARTENAIRE" ? "#fcd34d" : lead.planType === "B2G_COLLECTIVITE" ? "#7dd3fc" : "#c084fc",
                    }}>
                      {lead.planType}
                    </span>
                    <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 6 }}>
                      {lead.companySize && <span>Taille : {lead.companySize}</span>}
                      {lead.beneficiaries && <span>Bénéficiaires : {lead.beneficiaries}</span>}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button onClick={() => { setConvertingLead(lead); setConvertResult(null); }} className="btn btn-amber btn-sm">
                      Convertir <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
