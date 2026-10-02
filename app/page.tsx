"use client";

import React, { useState } from 'react';
import { SaaSPlatform } from '@/src/components/saas/SaaSPlatform';
import { InteriorDashboard } from '@/src/components/dashboard/InteriorDashboard';
import { Logo } from '@/src/components/brand/Logo';
import { Footer } from '@/src/components/layout/Footer';
import Link from 'next/link';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = 90;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // If user is logged in, show the Interior Dashboard (pages intérieures après connexion)
  if (currentUser) {
    return (
      <InteriorDashboard
        onLogout={() => setCurrentUser(null)}
        onReturnToPublic={() => setCurrentUser(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#123D46] flex flex-col font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      {/* Main View Port - Full Narrative Flow on Accueil */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <SaaSPlatform onLogin={userData => setCurrentUser(userData)} />
      </main>

      {/* Pristine, Executive-Grade Footer for LINK OFFICE */}
      <Footer />
    </div>
  );
}
