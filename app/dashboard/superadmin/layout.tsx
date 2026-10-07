import { SuperAdminHeader } from "@/src/components/superadmin/SuperAdminHeader";
import { getSuperAdminStats } from "@/lib/adminStats";

export const metadata = { title: "Super Admin — LinkOffice" };

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getSuperAdminStats();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] font-inter flex flex-col selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <SuperAdminHeader stats={stats} />
      <main className="flex-1 max-w-[1480px] w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
