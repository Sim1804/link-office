"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle2, Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  
  const successUrl = searchParams.get("success_url") || "/dashboard";
  const amount = searchParams.get("amount") || "49,00";

  const handlePay = () => {
    setLoading(true);
    // Simulate payment processing delay
    setTimeout(() => {
      // The database was already updated by the API route before reaching here.
      // So we just need to redirect to the success URL.
      window.location.href = successUrl;
    }, 2500);
  };

  return (
    <>
      <Navbar />
      <main className="page-main" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Blobs for premium effect */}
        <div className="blob-violet" style={{ top: "10%", right: "10%", width: 500, height: 500, opacity: 0.4 }} />
        <div className="blob-cyan" style={{ bottom: "10%", left: "10%", width: 500, height: 500, opacity: 0.4 }} />

        <div style={{ maxWidth: 500, width: "100%", padding: "20px", position: "relative", zIndex: 10 }}>
          
          <div className="card" style={{ padding: "40px 30px", overflow: "hidden", position: "relative" }}>
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #7c3aed, #0ea5e9)" }} />
            
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 20, 
                background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.15) 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
                border: "1px solid rgba(124,58,237,0.2)",
              }}>
                <CreditCard size={28} color="#a78bfa" />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>
                Paiement Sécurisé (Mock)
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>
                Mode test: Aucune vraie transaction ne sera effectuée.
              </p>
            </div>

            <div style={{ 
              background: "rgba(15, 23, 42, 0.6)", 
              borderRadius: 16, 
              padding: 20, 
              marginBottom: 30,
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "#cbd5e1", fontWeight: 500 }}>Montant à régler</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc" }}>{amount}€</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.1)", margin: "16px 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#10b981", fontSize: 13, fontWeight: 500 }}>
                <CheckCircle2 size={16} />
                <span>Mise à jour du compte incluse</span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                  Numéro de carte (Fictif)
                </label>
                <div style={{ 
                  display: "flex", alignItems: "center", gap: 10,
                  background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.1)",
                  padding: "14px 16px", borderRadius: 12,
                }}>
                  <CreditCard size={18} color="#64748b" />
                  <input 
                    type="text" 
                    value="4242 4242 4242 4242" 
                    readOnly
                    style={{ 
                      background: "transparent", border: "none", color: "#f8fafc", 
                      fontSize: 15, width: "100%", outline: "none", letterSpacing: "2px"
                    }} 
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 30 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                    Date d'exp
                  </label>
                  <input 
                    type="text" 
                    value="12/28" 
                    readOnly
                    style={{ 
                      background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", 
                      padding: "14px 16px", borderRadius: 12, fontSize: 15, width: "100%", outline: "none"
                    }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                    CVC
                  </label>
                  <input 
                    type="password" 
                    value="123" 
                    readOnly
                    style={{ 
                      background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", 
                      padding: "14px 16px", borderRadius: 12, fontSize: 15, width: "100%", outline: "none", letterSpacing: "4px"
                    }} 
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "16px", borderRadius: 12, border: "none",
                  background: loading ? "#334155" : "linear-gradient(135deg, #7c3aed, #0ea5e9)",
                  color: "white", fontSize: 16, fontWeight: 700, 
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", justifyContent: "center", alignItems: "center", gap: 10,
                  transition: "all 0.2s",
                  boxShadow: "0 10px 25px rgba(124,58,237,0.25)"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Payer {amount}€
                  </>
                )}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 24, color: "#64748b", fontSize: 12 }}>
              <ShieldCheck size={14} />
              <span>Environnement de test sécurisé</span>
            </div>
            
          </div>
        </div>
      </main>
      
      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>Chargement...</div>}>
      <MockCheckoutContent />
    </Suspense>
  );
}
