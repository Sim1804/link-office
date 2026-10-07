/**
 * app/not-found.tsx — Page 404 personnalisée LinkOffice
 */
import Link from "next/link";
import { Home, Search, AlertCircle } from "lucide-react";
import { Logo } from "@/src/components/brand/Logo";

export const metadata = {
  title: "Page introuvable — LinkOffice",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow blobs (subtle light) */}
      <div className="absolute -top-[15%] -right-[8%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,169,157,0.05) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-[15%] -left-[8%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(89,101,232,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <Logo size="md" variant="light" showTagline={false} />
          </Link>
        </div>

        {/* 404 Number */}
        <div className="relative mb-8">
          <div className="font-jakarta text-[140px] font-black leading-none text-[#00A99D] tracking-tighter opacity-10 select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 rounded-3xl bg-white border border-[#E3EBE6] shadow-lg flex items-center justify-center text-[#00A99D]">
                <AlertCircle size={36} strokeWidth={2.5} />
             </div>
          </div>
        </div>

        <h1 className="font-jakarta text-3xl sm:text-4xl font-extrabold text-[#123D46] mb-4">
          Page introuvable
        </h1>
        <p className="text-base text-[#123D46]/70 leading-relaxed mb-10 max-w-[320px] mx-auto">
          La page que vous recherchez n&apos;existe pas, a été déplacée ou nécessite des droits d&apos;accès différents.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 no-underline"
          >
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
          <Link 
            href="/dashboard" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:bg-[#F8F9FA] hover:border-[#00A99D]/30 font-jakarta font-bold text-sm transition-all flex items-center justify-center gap-2 no-underline"
          >
            <Search size={16} /> Mon tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
