/**
 * /consentement/page.tsx — Page de recueil du consentement
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import { getUserStatus } from "@/lib/api";

const S = {
  page: { minHeight: "100vh", background: "#0b0f19", paddingTop: 88, paddingBottom: 64, position: "relative" as const, overflowY: "auto" as const },
  blobTop: { position: "fixed" as const, top: "-15%", right: "-8%", width: 600, height: 600, background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)", pointerEvents: "none" as const, zIndex: 0 },
  blobBot: { position: "fixed" as const, bottom: "-15%", left: "-8%", width: 500, height: 500, background: "radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)", pointerEvents: "none" as const, zIndex: 0 },
  container: { maxWidth: 680, margin: "0 auto", padding: "0 24px", position: "relative" as const, zIndex: 1 },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 32 },
  headerIcon: { width: 44, height: 44, background: "rgba(124,58,237,0.2)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title: { fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", margin: 0 },
  subtitle: { fontFamily: "Inter, sans-serif", color: "#64748b", fontSize: 14, marginTop: 4 },
  card: { background: "rgba(26, 34, 54, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 20, padding: 28, marginBottom: 16 },
  sectionTitle: { fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 600, fontSize: 15, color: "#f8fafc", display: "flex", alignItems: "center", gap: 10, marginBottom: 20 },
};

export default function ConsentementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [form, setForm] = useState({
    consentement_informations: false,
    consentement_utilisation: false,
    consentement_participation: false,
  });

  const setF = (key: string, val: boolean) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (session?.user?.id) {
      getUserStatus(session.user.id)
        .then((status) => {
          if (status.has_completed_demographics) {
            router.replace("/dashboard");
          } else {
            setLoadingStatus(false);
          }
        })
        .catch(() => setLoadingStatus(false));
    } else if (session === null) {
      setLoadingStatus(false);
    }
  }, [session, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("iqrh_consent", JSON.stringify({
      consentInformation: form.consentement_informations,
      consentResearch: form.consentement_utilisation, // mapping to new schema
      consentParticipation: form.consentement_participation,
    }));
    
    router.push("/profil");
  };

  if (loadingStatus) return <div style={{ minHeight: "100vh", background: "#0b0f19" }} />;

  const canSubmit = form.consentement_informations && form.consentement_utilisation;

  return (
    <>
      <Navbar />
      <main style={S.page}>
        <div style={S.blobTop} />
        <div style={S.blobBot} />

        <div style={S.container}>
          <div style={S.header}>
            <div style={S.headerIcon}>
              <ShieldCheck style={{ width: 22, height: 22, color: "#a78bfa" }} />
            </div>
            <div>
              <h1 style={S.title}>Consentements</h1>
              <p style={S.subtitle}>Avant de commencer, veuillez valider les éléments suivants</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={S.card}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  {
                    key: "consentement_informations",
                    label: "J'accepte la charte d'information et de confidentialité",
                    required: true,
                  },
                  {
                    key: "consentement_utilisation",
                    label: "J'accepte l'utilisation de mes données pour l'évaluation personnalisée",
                    required: true,
                  },
                  {
                    key: "consentement_participation",
                    label: "J'accepte de participer à la démarche de recherche (données anonymisées)",
                    required: false,
                  },
                ].map(({ key, label, required }) => {
                  const checked = form[key as keyof typeof form];
                  return (
                    <div
                      key={key}
                      onClick={() => setF(key, !checked)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        cursor: "pointer",
                        padding: "8px 0",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          transition: "all 0.18s",
                          marginTop: 0,
                          flexShrink: 0,
                          border: checked ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.18)",
                          background: checked ? "#7c3aed" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {checked && <Check style={{ width: 14, height: 14, color: "white" }} />}
                      </div>
                      <span style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5, userSelect: "none" }}>
                        {label}
                        {required && <span style={{ color: "#f43f5e", marginLeft: 4 }}>*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: "100%",
                padding: "16px 32px",
                border: "none",
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "inherit",
                background: canSubmit ? "#7c3aed" : "rgba(124,58,237,0.3)",
                color: canSubmit ? "white" : "rgba(255,255,255,0.4)",
                cursor: canSubmit ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: canSubmit ? "0 0 32px rgba(124,58,237,0.35)" : "none",
                transition: "all 0.2s",
                marginTop: 8,
                marginBottom: 32,
              }}
            >
              Continuer vers le profil
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
