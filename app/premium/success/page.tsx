"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function PremiumSuccessPage() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const isMock = searchParams.get("mock") === "true";

  useEffect(() => {
    setMounted(true);
    // Dans une implémentation sans webhook immédiat, 
    // on pourrait rafraîchir la session ici si nécessaire.
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", position: "relative", overflow: "hidden" }}>
        
        {/* Confetti effect background blobs */}
        <div className="blob-violet" style={{ top: "20%", left: "20%", width: 300, height: 300, animationDuration: "3s" }} />
        <div className="blob-cyan" style={{ bottom: "20%", right: "20%", width: 300, height: 300, animationDuration: "4s" }} />

        <div className="card" style={{ maxWidth: 500, padding: 50, textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "rgba(52,211,153,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px"
          }}>
            <CheckCircle2 size={48} color="#34d399" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Paiement réussi !</h1>
          <p style={{ fontSize: 16, color: "var(--text-2)", lineHeight: 1.6, marginBottom: 40 }}>
            {isMock 
              ? "Bienvenue dans l'expérience Premium (Mode test)."
              : "Félicitations, vous avez débloqué l'ensemble des fonctionnalités Premium. Vos nouvelles analyses sont prêtes."
            }
          </p>

          <Link href="/dashboard" className="btn btn-primary" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "16px", borderRadius: 999, textDecoration: "none"
          }}>
            Accéder à mon Dashboard Premium
            <ArrowRight size={20} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
