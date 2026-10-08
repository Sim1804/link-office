"use client";

import React from "react";
import { SaaSPlatform } from "@/src/components/saas/SaaSPlatform";
import { PublicNavbar } from "@/src/components/layout/PublicNavbar";
import { Footer } from "@/src/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4F1E8] text-[#123D46] flex flex-col font-inter selection:bg-[#00A99D]/20 selection:text-[#123D46]">
      <PublicNavbar />
      {/* Main View Port - Full Narrative Flow on Accueil */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <SaaSPlatform />
      </main>

      {/* Pristine, Executive-Grade Footer for LINK OFFICE */}
      <Footer />
    </div>
  );
}
