"use client";

/**
 * app/error.tsx — Page d'erreur globale Link Office
 * Capte les erreurs non-gérées dans le tree React.
 */
import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Logo } from "@/src/components/brand/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En production, envoyer l'erreur à un service de monitoring (Sentry, etc.)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F4F1E8] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Glow blobs */}
      <div className="absolute -top-[15%] -right-[8%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%)" }} />
      <div className="absolute -bottom-[15%] -left-[8%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,169,157,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" className="inline-block transition-opacity hover:opacity-80">
            <Logo size="md" variant="light" showTagline={false} />
          </Link>
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200/50 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertTriangle size={36} className="text-rose-600" />
        </div>

        <h1 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-[#123D46] mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-[15px] text-[#123D46]/70 leading-relaxed mb-8">
          Nous rencontrons un problème technique. Votre progression est sauvegardée.
          Essayez de recharger la page ou retournez à l&apos;accueil.
        </p>

        {error.digest && (
          <p className="text-xs text-[#123D46]/50 mb-6 font-mono bg-black/5 inline-block px-3 py-1.5 rounded-lg">
            Référence : {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button 
            onClick={reset} 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00A99D] hover:bg-[#199E9A] text-white font-jakarta font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Réessayer
          </button>
          <Link 
            href="/" 
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white border border-[#E3EBE6] text-[#123D46] hover:bg-[#F8F9FA] hover:border-[#00A99D]/30 font-jakarta font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
