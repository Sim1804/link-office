import { Navbar } from "@/components/layout/Navbar";
import { SuperAdminNavigation } from "@/components/superadmin/SuperAdminNavigation";
import { getSuperAdminStats } from "@/lib/adminStats";

export const metadata = { title: "Super Admin — LinkOffice" };

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getSuperAdminStats();

  return (
    <>
      <Navbar />
      <main className="page-main">
        <SuperAdminNavigation stats={stats} />
        
        <div className="page-container-wide">
          {children}
        </div>
      </main>
    </>
  );
}
