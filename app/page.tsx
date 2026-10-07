"use client";

import React, { useState } from 'react';
import { SaaSPlatform } from '@/src/components/saas/SaaSPlatform';
import { InteriorDashboard } from '@/src/components/dashboard/InteriorDashboard';
import { PublicNavbar } from '@/src/components/layout/PublicNavbar';
import { Footer } from '@/src/components/layout/Footer';
import { useRouter } from 'next/navigation';

export default function App() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  // If user is logged in, show the Interior Dashboard (pages intérieures après connexion)
  if (currentUser) {
    return (
      <InteriorDashboard
        onLogout={() => setCurrentUser(null)}
        onReturnToPublic={() => setCurrentUser(null)}
        onSwitchToRHAdmin={() => router.push('/dashboard/b2b')}
        onSwitchToSuperAdmin={() => router.push('/dashboard/superadmin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] flex flex-col font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <PublicNavbar />
      {/* Main View Port - Full Narrative Flow on Accueil */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <SaaSPlatform onLogin={userData => setCurrentUser(userData)} />
      </main>

      {/* Pristine, Executive-Grade Footer for LINK OFFICE */}
      <Footer />
    </div>
  );
}
