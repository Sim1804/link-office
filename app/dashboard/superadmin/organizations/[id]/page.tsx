"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Calendar, Users, ShieldCheck, Crown, Plus } from "lucide-react";

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
      if (res.ok) setOrg(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [params.id]);

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-[#F8F9FA] rounded-xl w-48" />
      <div className="h-32 bg-[#F8F9FA] rounded-2xl" />
      <div className="h-64 bg-[#F8F9FA] rounded-2xl" />
    </div>
  );

  if (!org) return (
    <div className="p-10 text-center text-rose-500 text-sm">Organisation introuvable.</div>
  );

  const typeBadge =
    org.type === "B2B2C" ? "bg-amber-50 text-amber-500 border border-amber-200"
    : org.type === "B2G"  ? "bg-sky-50 text-sky-600 border border-sky-200"
    : "bg-[#5965E8]/10 text-[#5965E8] border border-[#5965E8]/20";

  const typeLabel =
    org.type === "B2B" ? "Entreprises B2B"
    : org.type === "B2B2C" ? "Mutuelles B2B2C"
    : org.type === "B2G" ? "Collectivités B2G"
    : org.type;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/dashboard/superadmin/organizations"
        className="inline-flex items-center gap-1.5 text-[#123D46]/60 no-underline text-sm hover:text-[#00A99D] transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux organisations
      </Link>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-[#5965E8]" />
            {org.name}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${typeBadge}`}>
              {typeLabel}
            </span>
            <code className="bg-white border border-[#E3EBE6] px-2.5 py-1 rounded-lg text-xs text-[#00A99D] font-mono shadow-xs">
              {org.codeAccess}
            </code>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 max-w-[1100px]">

        {/* Row 1: Contract info + Admins */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">

          {/* Contract card */}
          <div className="p-6 bg-white rounded-2xl border border-[#E3EBE6] shadow-xs h-full">
            <h2 className="text-base font-jakarta font-bold text-[#123D46] mb-5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Informations & Contrat
            </h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                { label: "Contact principal", value: org.contactName },
                { label: "Email contact", value: org.contactEmail },
                { label: "Type de contrat", value: org.contractType },
                { label: "Territoire cible", value: org.territory },
                { label: "Population visée", value: org.targetPopulation },
                { label: "Quota (Accès Max)", value: org.quota },
                { label: "Date de début", value: org.startDate ? new Date(org.startDate).toLocaleDateString('fr-FR') : null },
                { label: "Date de fin", value: org.endDate ? new Date(org.endDate).toLocaleDateString('fr-FR') : null },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-[11px] font-jakarta font-bold text-[#123D46]/50 uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-[#123D46] font-medium">{value || "—"}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Admins card */}
          <div className="p-6 bg-white rounded-2xl border border-[#E3EBE6] shadow-xs h-full">
            <h2 className="text-base font-jakarta font-bold text-[#123D46] mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-500" /> Administrateurs
            </h2>
            {org.users?.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {org.users.map((u: any) => (
                  <div key={u.id} className="px-4 py-3 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6]">
                    <div className="text-[#123D46] font-semibold text-sm">{u.firstName} {u.lastName}</div>
                    <div className="text-[#123D46]/60 text-xs mt-0.5">{u.email}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#123D46]/50 text-sm">Aucun administrateur trouvé.</p>
            )}
          </div>
        </div>

        {/* Row 2: Campaigns */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-jakarta font-bold text-[#123D46] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00A99D]" /> Campagnes
            </h2>
            <button
              onClick={() => {
                const route = org.type === "B2B" ? "b2b" : org.type === "B2B2C" ? "b2b2c" : "b2g";
                router.push(`/dashboard/${route}/campaigns/new?orgId=${org.id}`);
              }}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-xs transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Nouvelle campagne
            </button>
          </div>

          {org.campaigns?.length > 0 ? (
            <div className="flex flex-col gap-3">
              {org.campaigns.map((c: any) => {
                const route = org.type === "B2B" ? "b2b" : org.type === "B2B2C" ? "b2b2c" : "b2g";
                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/${route}/campaigns/${c.id}`}
                    className="flex items-center justify-between p-4 bg-[#FAF9F5] rounded-xl border border-[#E3EBE6] hover:border-[#00A99D]/40 hover:bg-white transition-all no-underline group"
                  >
                    <div>
                      <div className="text-[#123D46] font-semibold text-sm group-hover:text-[#00A99D] transition-colors">{c.title}</div>
                      <div className="text-[#123D46]/60 text-xs mt-0.5">
                        Du {new Date(c.startDate).toLocaleDateString('fr-FR')} au {c.endDate ? new Date(c.endDate).toLocaleDateString('fr-FR') : "—"}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-500 border border-amber-200 flex items-center gap-1.5">
                      <Crown className="w-3 h-3" />
                      {c.offer}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed border-[#123D46]/15 rounded-xl">
              <Calendar className="w-8 h-8 text-[#123D46]/20 mx-auto mb-3" />
              <h3 className="text-[#123D46]/60 text-sm font-semibold mb-1">Aucune campagne</h3>
              <p className="text-[#123D46]/40 text-xs">Cette organisation n&apos;a pas encore de campagne configurée.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
