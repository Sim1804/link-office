import { prisma } from "@/lib/prisma";
import { CreditCard, TrendingUp, Users, Building2, Server } from "lucide-react";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Finances & Facturation — LinkOffice" };

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
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 24, marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <CreditCard size={32} color="var(--primary)" />
            Revenus & Abonnements
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 700, lineHeight: 1.5 }}>
            Suivi du MRR (Revenu Mensuel Récurrent) basé sur les tarifs standards (Mockés) pour les utilisateurs Premium et les Organisations.
          </p>
        </div>
      </div>

      {/* KPI Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,169,157,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>MRR Global</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 800, color: "var(--text-1)" }}>{totalMRR.toLocaleString("fr-FR")} €</span>
            <span style={{ fontSize: 14, color: "var(--text-3)" }}>/ mois</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={20} color="#3b82f6" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Entreprises (B2B) & Collectivités (B2G)</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)" }}>{(mrrB2B + mrrB2G).toLocaleString("fr-FR")} €</span>
            <span style={{ fontSize: 14, color: "var(--text-3)" }}>/ mois</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Server size={20} color="#a855f7" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Mutuelles (B2B2C)</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)" }}>{mrrB2B2C.toLocaleString("fr-FR")} €</span>
            <span style={{ fontSize: 14, color: "var(--text-3)" }}>/ mois</span>
          </div>
        </div>

        <div style={{ background: "var(--surface)", padding: 20, borderRadius: 16, border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(234,179,8,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} color="#eab308" />
            </div>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>B2C Premium</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)" }}>{mrrB2C.toLocaleString("fr-FR")} €</span>
            <span style={{ fontSize: 14, color: "var(--text-3)" }}>/ mois</span>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Orgs List */}
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Abonnements Entreprises (Actifs)</h2>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {orgs.length === 0 ? (
              <p style={{ padding: 20, textAlign: "center", color: "var(--text-3)" }}>Aucune organisation active</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead style={{ background: "rgba(255,255,255,0.02)" }}>
                  <tr>
                    <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-3)", fontWeight: 500 }}>Organisation</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-3)", fontWeight: 500 }}>Type</th>
                    <th style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-3)", fontWeight: 500 }}>MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map(org => {
                    let price = 0;
                    if (org.type === "B2B") price = PRICES.B2B;
                    if (org.type === "B2G") price = PRICES.B2G;
                    if (org.type === "B2B2C") price = PRICES.B2B2C;

                    return (
                      <tr key={org.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 20px", color: "var(--text-1)", fontWeight: 600 }}>{org.name}</td>
                        <td style={{ padding: "12px 20px" }}>
                          <span className="badge" style={{ 
                            padding: "2px 8px", 
                            borderRadius: 12, 
                            fontSize: 11, 
                            fontWeight: 700, 
                            background: org.type === "B2B2C" ? "rgba(89,101,232,0.1)" : org.type === "B2G" ? "rgba(14,165,233,0.1)" : "rgba(0,169,157,0.1)",
                            color: org.type === "B2B2C" ? "var(--indigo)" : org.type === "B2G" ? "var(--cyan)" : "var(--primary)",
                          }}>
                            {org.type === "B2B" ? "Entreprises (B2B)" : org.type === "B2B2C" ? "Mutuelles (B2B2C)" : org.type === "B2G" ? "Collectivités (B2G)" : org.type}
                          </span>
                        </td>
                        <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-2)" }}>{price} €</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* B2C Users List */}
        <div style={{ background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>Abonnements Utilisateurs Premium (Actifs)</h2>
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {b2cUsers.length === 0 ? (
              <p style={{ padding: 20, textAlign: "center", color: "var(--text-3)" }}>Aucun utilisateur B2C Premium actif</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead style={{ background: "rgba(255,255,255,0.02)" }}>
                  <tr>
                    <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-3)", fontWeight: 500 }}>Utilisateur</th>
                    <th style={{ padding: "12px 20px", textAlign: "left", color: "var(--text-3)", fontWeight: 500 }}>Email</th>
                    <th style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-3)", fontWeight: 500 }}>MRR</th>
                  </tr>
                </thead>
                <tbody>
                  {b2cUsers.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 20px", color: "var(--text-1)", fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: "12px 20px", color: "var(--text-3)" }}>{u.email}</td>
                      <td style={{ padding: "12px 20px", textAlign: "right", color: "var(--text-2)" }}>{PRICES.B2C} €</td>
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
