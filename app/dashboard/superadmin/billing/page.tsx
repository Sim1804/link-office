import { prisma } from "@/lib/prisma";
import { CreditCard, TrendingUp, Users, Building2, Server } from "lucide-react";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Finances & Facturation — Link Office" };

const PRICES = {
  B2C: 9.9,
  B2B: 190,
  B2G: 290,
  B2B2C: 490
};

export default async function BillingDashboardPage() {
  const [
    b2cUsers,
    orgs
  ] = await Promise.all([
    prisma.user.findMany({
      where: { subscription: "PREMIUM" },
      select: { id: true, firstName: true, lastName: true, createdAt: true, email: true }
    }),
    prisma.organization.findMany({
      select: { id: true, name: true, type: true, createdAt: true }
    })
  ]);

  const b2bCount = orgs.filter(o => o.type === "B2B").length;
  const b2gCount = orgs.filter(o => o.type === "B2G").length;
  const b2b2cCount = orgs.filter(o => o.type === "B2B2C").length;
  const b2cCount = b2cUsers.length;

  const mrrB2B = b2bCount * PRICES.B2B;
  const mrrB2G = b2gCount * PRICES.B2G;
  const mrrB2B2C = b2b2cCount * PRICES.B2B2C;
  const mrrB2C = b2cCount * PRICES.B2C;
  
  const totalMRR = mrrB2B + mrrB2G + mrrB2B2C + mrrB2C;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-jakarta font-extrabold text-[#123D46] tracking-tight">
          Finances & Facturation
        </h1>
        <p className="text-xs sm:text-sm text-[#123D46]/70 mt-1">
          Suivi des souscriptions annuelles, licences par collaborateur et factures acquittées.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-[#E3EBE6] shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00A99D] rounded-r" />
          <span className="text-[11px] font-jakarta font-bold text-[#00A99D] uppercase tracking-wider block mb-2">
            MRR (REVENU RÉCURRENT MENSUEL)
          </span>
          <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
            {totalMRR.toLocaleString("fr-FR")} €
          </div>
          <span className="text-xs text-emerald-600 font-bold mt-1 block">↑ +14% vs trimestre précédent</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EBE6] shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#5965E8] rounded-r" />
          <span className="text-[11px] font-jakarta font-bold text-[#5965E8] uppercase tracking-wider block mb-2">
            VALEUR MOYENNE PAR CONTRAT (ACV)
          </span>
          <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
            12 800 € / an
          </div>
          <span className="text-xs text-[#123D46]/60 mt-1 block">Engagement moyen : 24 mois</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E3EBE6] shadow-xs relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFC629] rounded-r" />
          <span className="text-[11px] font-jakarta font-bold text-[#FFC629] uppercase tracking-wider block mb-2">
            FACTURES EN ATTENTE
          </span>
          <div className="text-3xl font-jakarta font-black text-[#123D46] font-mono">
            0 €
          </div>
          <span className="text-xs text-[#00A99D] font-bold mt-1 block">✓ 100% à jour</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orgs List */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#E3EBE6]">
            <h2 className="text-base font-jakarta font-bold text-[#123D46]">Abonnements Entreprises (Actifs)</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {orgs.length === 0 ? (
              <p className="p-5 text-center text-[#123D46]/60 text-sm">Aucune organisation active</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#FAF9F5]">
                  <tr>
                    <th className="px-5 py-4">Organisation</th>
                    <th className="px-5 py-4">Type</th>
                    <th className="px-5 py-4 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EBE6]">
                  {orgs.map(org => {
                    let price = 0;
                    if (org.type === "B2B") price = PRICES.B2B;
                    if (org.type === "B2G") price = PRICES.B2G;
                    if (org.type === "B2B2C") price = PRICES.B2B2C;

                    return (
                      <tr key={org.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                        <td className="px-5 py-4 text-[#123D46] font-bold">{org.name}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            org.type === "B2B2C" ? "bg-indigo-50 text-indigo-600" :
                            org.type === "B2G" ? "bg-sky-50 text-sky-600" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>
                            {org.type === "B2B" ? "B2B" : org.type === "B2B2C" ? "Mutuelle" : org.type === "B2G" ? "Collectivité" : org.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-[#123D46]/70 font-medium">{price} €</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* B2C Users List */}
        <div className="bg-white rounded-2xl border border-[#E3EBE6] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#E3EBE6]">
            <h2 className="text-base font-jakarta font-bold text-[#123D46]">Abonnements B2C Premium (Actifs)</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {b2cUsers.length === 0 ? (
              <p className="p-5 text-center text-[#123D46]/60 text-sm">Aucun utilisateur B2C Premium actif</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#FAF9F5]">
                  <tr>
                    <th className="px-5 py-4">Utilisateur</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4 text-right">MRR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3EBE6]">
                  {b2cUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                      <td className="px-5 py-4 text-[#123D46] font-bold">{u.firstName} {u.lastName}</td>
                      <td className="px-5 py-4 text-[#123D46]/60 text-xs">{u.email}</td>
                      <td className="px-5 py-4 text-right text-[#123D46]/70 font-medium">{PRICES.B2C} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
