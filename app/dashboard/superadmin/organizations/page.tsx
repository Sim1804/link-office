import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, ArrowLeft, Building2, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Organisations (Partenaires) — LinkOffice" };
export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { campaigns: true, users: true } },
      users: { 
        where: { role: { in: ["ADMIN_B2B", "ADMIN_B2B2C", "ADMIN_COLLECTIVITE"] } },
        select: { email: true, firstName: true, lastName: true },
        take: 1
      }
    }
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#f8fafc", display: "flex", alignItems: "center", gap: 12 }}>
            <Building2 size={32} color="#c084fc" />
            Organisations (Partenaires)
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 8 }}>Gérez les comptes clients B2B, partenaires B2B2C et collectivités.</p>
        </div>
        
        <Link href="/dashboard/superadmin/organizations/new" style={{ textDecoration: "none" }}>
          <Button>
            <Plus size={18} /> Ajouter un partenaire
          </Button>
        </Link>
      </div>

      <div style={{ background: "rgba(15,23,42,0.6)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "rgba(30,41,59,0.8)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Nom & Code</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Type</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase" }}>Contact Admin</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "center" }}>Campagnes</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "center" }}>Utilisateurs</th>
              <th style={{ padding: "16px 24px", color: "#94a3b8", fontWeight: 600, fontSize: 13, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => {
              const admin = org.users[0];
              return (
                <tr key={org.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)", transition: "background 0.2s" }} className="table-row-hover">
                  <td style={{ padding: "16px 24px" }}>
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} style={{ textDecoration: "none" }}>
                      <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: 15, cursor: "pointer" }}>{org.name}</div>
                    </Link>
                    <div style={{ color: "#c084fc", fontSize: 12, marginTop: 4, fontWeight: 700, letterSpacing: "0.05em" }}>{org.codeAccess}</div>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ 
                      padding: "4px 10px", 
                      borderRadius: 999, 
                      fontSize: 11, 
                      fontWeight: 700, 
                      background: org.type === "B2B2C" ? "rgba(245,158,11,0.15)" : org.type === "COLLECTIVITE" ? "rgba(56,189,248,0.15)" : "rgba(124,58,237,0.15)",
                      color: org.type === "B2B2C" ? "#fcd34d" : org.type === "COLLECTIVITE" ? "#7dd3fc" : "#c084fc",
                    }}>
                      {org.type}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    {admin ? (
                      <>
                        <div style={{ color: "#e2e8f0", fontSize: 14 }}>{admin.firstName} {admin.lastName}</div>
                        <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{admin.email}</div>
                      </>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: 13, fontStyle: "italic" }}>Aucun administrateur</span>
                    )}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center", color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>
                    {org._count.campaigns}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 13 }}>
                      <Users size={14} /> {org._count.users}
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <Link href={`/dashboard/superadmin/organizations/${org.id}`} style={{ textDecoration: "none" }}>
                      <Button variant="secondary" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
            {organizations.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px 24px", textAlign: "center", color: "#64748b" }}>
                  Aucune organisation trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
