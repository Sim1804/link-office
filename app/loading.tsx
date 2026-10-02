
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center relative overflow-hidden">
      {/* Glow blob */}
      <div className="absolute -top-[15%] -right-[8%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,169,157,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Spinner animé */}
      <div className="flex flex-col items-center gap-5 relative z-10">
        {/* Logo animé */}
        <div className="animate-pulse">
          <img src="/logo_link_graphique.png" alt="LinkOffice Logo" width={120} height={120} className="object-contain" />
        </div>

        {/* Texte */}
        <div className="text-center">
          <div className="font-jakarta text-sm font-semibold text-[#123D46]/70 animate-pulse">
            Chargement…
          </div>
        </div>

        {/* Barre de progression animée */}
        <div className="w-[200px] h-1 bg-[#E3EBE6] rounded-full overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-[#00A99D] rounded-full animate-[loadingBar_1.5s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loadingBar {
          0% { left: -30%; width: 30%; }
          50% { width: 40%; }
          100% { left: 100%; width: 30%; }
        }
      `}</style>
    </div>
  );
}
