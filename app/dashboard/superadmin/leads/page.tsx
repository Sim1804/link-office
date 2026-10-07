"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Inbox, CheckCircle2, ArrowRight, AlertCircle, X, Users, Building2, Calendar } from "lucide-react";
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

  const planLabel = (type: string) => {
    if (type === "B2B_PREMIUM") return "Entreprises (B2B)";
    if (type === "B2B2C_PARTENAIRE") return "Mutuelles (B2B2C)";
    if (type === "B2G") return "Collectivités (B2G)";
    return type;
  };
  const planBadge = (type: string) => {
    if (type === "B2B2C_PARTENAIRE") return "bg-amber-50 text-amber-500";
    if (type === "B2G") return "bg-sky-50 text-sky-600";
    return "bg-[#5965E8]/10 text-[#5965E8]";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-[#00A99D]" />
            Demandes de Devis (Leads)
          </h1>
          <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
            Gérez les prospects et convertissez-les en clients avec génération automatique de compte.
          </p>
        </div>
        {pendingLeads.length > 0 && (
          <span className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[13px] font-bold">
            {pendingLeads.length} en attente
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-white border border-[#E3EBE6] rounded-full shadow-2xs">
        <button
          onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full text-xs font-jakarta font-bold transition-colors ${
            activeTab === 'pending'
              ? 'bg-[#00A99D]/15 text-[#00A99D]'
              : 'text-[#123D46]/70 hover:text-[#123D46]'
          }`}
        >
          En attente ({pendingLeads.length})
        </button>
        <button
          onClick={() => { setActiveTab('converted'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full text-xs font-jakarta font-bold transition-colors ${
            activeTab === 'converted'
              ? 'bg-[#00A99D]/15 text-[#00A99D]'
              : 'text-[#123D46]/70 hover:text-[#123D46]'
          }`}
        >
          Convertis ({convertedLeads.length})
        </button>
      </div>

      {/* Conversion Panel */}
      {convertingLead && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-jakarta font-bold text-[#123D46]">
                Convertir : {convertingLead.organization}
              </h3>
              <p className="text-[#123D46]/60 text-[13px] mt-1">
                Cela va créer l&apos;organisation, le compte{' '}
                <strong className="text-[#123D46]/80">{convertingLead.email}</strong>{' '}
                et la première campagne.
              </p>
            </div>
            <button
              onClick={() => { setConvertingLead(null); setConvertResult(null); setConvertError(null); }}
              className="p-1.5 rounded-lg text-[#123D46]/50 hover:text-[#123D46] hover:bg-amber-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {convertError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-4 bg-rose-50 border border-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-rose-500 text-[13px]">{convertError}</p>
            </div>
          )}

          {!convertResult ? (
            <div className="flex flex-col gap-4">
              {convertingLead.planType === "B2B2C_PARTENAIRE" && (
                <div>
                  <label className="block text-[13px] text-amber-600 font-semibold mb-2">
                    Offre de la Campagne *
                  </label>
                  <Select
                    value={campaignOffer}
                    onChange={(val) => setCampaignOffer(val as any)}
                    options={[
                      { value: "PREMIUM", label: "PREMIUM - Parcours Premium classique" },
                      { value: "PREMIUM_PLUS", label: "PREMIUM+ - Inclut Module Binôme Relationnel" }
                    ]}
                    className="w-[350px]"
                  />
                </div>
              )}
              <button
                onClick={handleConvertLead}
                disabled={convertLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm transition-colors disabled:opacity-60 self-start"
              >
                {convertLoading
                  ? "Conversion en cours..."
                  : <><span>Valider et Créer le Client</span><ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h4 className="text-emerald-600 font-jakarta font-bold text-[15px] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Conversion Réussie !
              </h4>
              <div className="grid grid-cols-2 gap-2.5 text-[13px] text-[#123D46]/80">
                <div><span className="text-[#123D46]/60 font-semibold">Organisation :</span> {convertResult.organization}</div>
                <div><span className="text-[#123D46]/60 font-semibold">Admin :</span> {convertResult.adminEmail}</div>
                <div>
                  <span className="text-[#123D46]/60 font-semibold">Mot de passe :</span>{' '}
                  <code className="bg-white border border-[#E3EBE6] px-1.5 py-0.5 rounded text-[#00A99D] font-mono">
                    {convertResult.tempPassword}
                  </code>
                </div>
                <div>
                  <span className="text-[#123D46]/60 font-semibold">Code :</span>{' '}
                  <code className="bg-white border border-[#E3EBE6] px-1.5 py-0.5 rounded text-[#00A99D] font-mono">
                    {convertResult.codeAccess}
                  </code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-10 text-center text-[#123D46]/70 text-sm">Chargement...</div>
        ) : activeTab === "pending" ? (
          pendingLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-[#123D46]/20 mx-auto mb-3" />
              <p className="text-[#123D46]/50 text-sm">Aucune demande de devis en attente.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Organisation</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Offre souhaitée</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#123D46] text-sm">{lead.organization}</div>
                      <div className="text-[#123D46]/60 text-xs mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#123D46] text-sm font-medium">{lead.contactName}</div>
                      <div className="text-[#123D46]/60 text-xs mt-0.5">{lead.email}</div>
                      {lead.phone && <div className="text-[#123D46]/60 text-xs">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${planBadge(lead.planType)}`}>
                        {planLabel(lead.planType)}
                      </span>
                      <div className="text-[#123D46]/60 text-xs mt-1.5 flex flex-col gap-0.5">
                        {lead.companySize && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {lead.companySize}</span>}
                        {lead.beneficiaries && <span>Bénéficiaires : {lead.beneficiaries}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setConvertingLead(lead); setConvertResult(null); setConvertError(null); }}
                        className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors ml-auto"
                      >
                        Convertir <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          convertedLeads.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#123D46]/20 mx-auto mb-3" />
              <p className="text-[#123D46]/50 text-sm">Aucun lead converti pour le moment.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E3EBE6]">
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Organisation</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider">Offre</th>
                  <th className="px-6 py-4 text-[10px] font-jakarta font-bold text-[#123D46]/60 uppercase tracking-wider text-center">Converti le</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map(lead => (
                  <tr key={lead.id} className="border-b border-[#E3EBE6] hover:bg-[#FAF9F5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#123D46] text-sm">{lead.organization}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#123D46] text-sm font-medium">{lead.contactName}</div>
                      <div className="text-[#123D46]/60 text-xs">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">
                        {planLabel(lead.planType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-[#123D46]/70 text-[13px]">
                      {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#E3EBE6] flex justify-center items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-[#00A99D] text-white"
                      : "bg-transparent border border-[#E3EBE6] text-[#123D46]/70 hover:bg-[#F8F9FA]"
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
