"use client";

import { Navbar } from "@/components/layout/Navbar";
import { XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PremiumCancelPage() {
  return (
    <>
      <Navbar />
      <main className="page-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)", position: "relative" }}>
        
        <div className="card" style={{ maxWidth: 500, padding: 50, textAlign: "center", position: "relative", zIndex: 10 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%", background: "rgba(244,63,94,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 30px"
          }}>
            <XCircle size={48} color="#f43f5e" />
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Paiement annulé</h1>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, marginBottom: 40 }}>
            Votre paiement n'a pas été finalisé. Aucun montant n'a été débité de votre compte. Vous restez sur l'offre Freemium.
          </p>

          <Link href="/premium" style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            width: "100%", padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "white", fontSize: 16, fontWeight: 600, textDecoration: "none",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)" }}
          >
            <ArrowLeft size={20} />
            Retourner à l'offre Premium
          </Link>
        </div>
      </main>
    </>
  );
}
