"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Inbox, CheckCircle2, ArrowRight } from "lucide-react";
import { Select } from "@/components/ui/Select";

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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [loading, setLoading] = useState(true);

  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [campaignOffer, setCampaignOffer] = useState<"PREMIUM" | "PREMIUM_PLUS">("PREMIUM");
  const [convertLoading, setConvertLoading] = useState(false);
  const [convertResult, setConvertResult] = useState<any>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "converted">("pending");

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
    setConvertError(null);
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
      // Remplacement du alert() natif par une notification inline
      setConvertError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setConvertLoading(false);
    }
  };

  if (status === "loading") return null;

  const pendingLeads   = leads.filter(l => l.status !== "CONVERTED");
  const convertedLeads = leads.filter(l => l.status === "CONVERTED");

  const currentLeads = activeTab === "pending" ? pendingLeads : convertedLeads;
  const totalPages = Math.ceil(currentLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = currentLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", display: "flex", alignItems: "center", gap: 12 }}>
            <Inbox size={32} color="#34d399" />
            Demandes de Devis (Leads)
          </h1>
          <p style={{ color: "var(--text-3)", marginTop: 8 }}>Gérez les prospects et convertissez-les en clients avec génération automatique de compte.</p>
        </div>
        {/* Compteur de leads en attente */}
        {pendingLeads.length > 0 && (
          <span style={{
            background: "rgba(245,158,11,0.1)", color: "#d97706",
            border: "1px solid rgba(251,191,36,0.25)",
            padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700,
          }}>
            {pendingLeads.length} en attente
          </span>
        )}
      </div>

      {/* Tabs Pending / Convertis */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--surface-2)", padding: 4, borderRadius: 9999, border: "1px solid var(--border)", width: "fit-content" }}>
        {([
          { key: "pending",   label: `En attente (${pendingLeads.length})` },
          { key: "converted", label: `Convertis (${convertedLeads.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setCurrentPage(1); }}
            style={{
              padding: "8px 16px", borderRadius: 9999,
              fontSize: 13, fontWeight: activeTab === key ? 600 : 500, fontFamily: "inherit",
              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              background: activeTab === key ? "var(--surface)" : "transparent",
              color: activeTab === key ? "var(--text-1)" : "var(--text-2)",
              boxShadow: activeTab === key ? "var(--shadow-card)" : "none",
              border: activeTab === key ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {convertingLead && (
        <div style={{
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 16, padding: 20, marginBottom: 24
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Convertir : {convertingLead.organization}</h3>
              <p style={{ color: "var(--text-3)", fontSize: 13, marginTop: 4 }}>
                Cela va créer l&apos;organisation, le compte <b style={{ color: "var(--text-2)" }}>{convertingLead.email}</b> et la première campagne.
              </p>
            </div>
            <button onClick={() => { setConvertingLead(null); setConvertResult(null); setConvertError(null); }} className="btn btn-ghost btn-sm">
              Fermer
            </button>
          </div>

          {convertError && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "12px 16px", borderRadius: 10, marginBottom: 8,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
            }}>
              <ArrowRight size={14} style={{ color: "#f87171", flexShrink: 0, marginTop: 2 }} />
              <p style={{ color: "#f87171", fontSize: 13, margin: 0 }}>{convertError}</p>
            </div>
          )}

          {!convertResult ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {convertingLead.planType === "B2B2C_PARTENAIRE" && (
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#d97706", fontWeight: 600, marginBottom: 8 }}>
                    Offre de la Campagne *
                  </label>
                  <Select 
                    value={campaignOffer} 
                    onChange={(val) => setCampaignOffer(val as any)}
                    options={[
                      { value: "PREMIUM", label: "PREMIUM - Parcours Premium classique" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+ - Inclut Module Binôme Relationnel" }
                    ]}
                    style={{ width: 350 }} 
                  />
                </div>
              )}
              <button onClick={handleConvertLead} disabled={convertLoading} className="btn btn-primary btn-md" style={{ alignSelf: "flex-start" }}>
                {convertLoading ? "Conversion en cours..." : <>Valider et Créer le Client <ArrowRight size={14} /></>}
              </button>
            </div>
          ) : (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 20 }}>
              <h4 style={{ color: "#059669", fontWeight: 700, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} /> Conversion Réussie !
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13, color: "var(--text-2)" }}>
                <div><b style={{ color: "var(--text-3)" }}>Organisation :</b> {convertResult.organization}</div>
                <div><b style={{ color: "var(--text-3)" }}>Admin :</b> {convertResult.adminEmail}</div>
                <div><b style={{ color: "var(--text-3)" }}>Mot de passe :</b> <code style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, color: "var(--primary)" }}>{convertResult.tempPassword}</code></div>
                <div><b style={{ color: "var(--text-3)" }}>Code :</b> <code style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, color: "var(--primary)" }}>{convertResult.codeAccess}</code></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Chargement...</div>
        ) : pendingLeads.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Aucune demande de devis en attente.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Organisation</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Contact</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Offre souhaitée</th>
                <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 15 }}>{lead.organization}</div>
                    <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 4 }}>Date : {new Date(lead.createdAt).toLocaleDateString("fr-FR")}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ color: "var(--text-2)", fontSize: 14 }}>{lead.contactName}</div>
                    <div style={{ color: "var(--text-3)", fontSize: 13, marginTop: 2 }}>{lead.email}</div>
                    {lead.phone && <div style={{ color: "var(--text-3)", fontSize: 13 }}>{lead.phone}</div>}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: 999, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: lead.planType === "B2B2C_PARTENAIRE" ? "rgba(245,158,11,0.15)" : lead.planType === "B2G" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
                      color: lead.planType === "B2B2C_PARTENAIRE" ? "#fcd34d" : lead.planType === "B2G" ? "#7dd3fc" : "#c084fc",
                    }}>
                      {lead.planType === "B2B_PREMIUM" ? "Entreprises (B2B)" : lead.planType === "B2B2C_PARTENAIRE" ? "Mutuelles (B2B2C)" : lead.planType === "B2G" ? "Collectivités (B2G)" : lead.planType}
                    </span>
                    <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>
                      {lead.companySize && <span>Taille : {lead.companySize}</span>}
                      {lead.beneficiaries && <span>Bénéficiaires : {lead.beneficiaries}</span>}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <button onClick={() => { setConvertingLead(lead); setConvertResult(null); }} className="btn btn-primary btn-sm">
                      Convertir <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
          {totalPages > 1 && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "var(--surface)" }}>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "white" : "var(--text-2)",
                      background: isActive ? "var(--primary)" : "transparent",
                      border: isActive ? "none" : "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}

      </div>

      {/* Onglet Convertis */}
      {activeTab === "converted" && (
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Chargement...</div>
          ) : convertedLeads.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Aucun lead converti pour le moment.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Organisation</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Contact</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Offre</th>
                  <th style={{ padding: "16px 24px", color: "var(--text-3)", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "center" }}>Converti le</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map(lead => (
                  <tr key={lead.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 15 }}>{lead.organization}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ color: "var(--text-2)", fontSize: 14 }}>{lead.contactName}</div>
                      <div style={{ color: "var(--text-3)", fontSize: 12 }}>{lead.email}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "rgba(16,185,129,0.12)", color: "#059669" }}>
                        {lead.planType}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "center", color: "var(--text-2)", fontSize: 13 }}>
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, background: "var(--surface)" }}>
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? "white" : "var(--text-2)",
                      background: isActive ? "var(--primary)" : "transparent",
                      border: isActive ? "none" : "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseOut={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      )}
    </>
  );
}
