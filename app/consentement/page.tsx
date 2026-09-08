/**
 * /consentement/page.tsx — Page de recueil du consentement
 */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import { getUserStatus } from "@/lib/api";

export default function ConsentementPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRetake = searchParams.get("retake") === "true";
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [form, setForm] = useState({
    consentement_informations: false,
    consentement_utilisation: false,
    consentement_participation: false,
  });

  const setF = (key: string, val: boolean) => setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    if (isRetake) {
      setLoadingStatus(false);
      return;
    }
    
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
  }, [session, router, isRetake]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("iqrh_consent", JSON.stringify({
      consentInformation: form.consentement_informations,
      consentResearch: form.consentement_utilisation,
      consentParticipation: form.consentement_participation,
    }));
    
    router.push("/profil?onboarding=true");
  };

  if (loadingStatus) return <div className="page-main" />;

  const canSubmit = form.consentement_informations && form.consentement_utilisation;

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />

        <div className="page-container">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.15)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ShieldCheck style={{ width: 24, height: 24, color: "#a78bfa" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 26, color: "#f8fafc", margin: 0 }}>Bienvenue</h1>
              <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>Avant de commencer, veuillez prendre connaissance des informations suivantes</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 1.6, marginBottom: 12 }}>
              Bienvenue dans le questionnaire IQRH (Indice de Qualité des Relations Humaines).
            </p>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Ce questionnaire vise à mieux comprendre la qualité des relations humaines dans les différentes sphères de vie : personnelle, familiale, sociale, professionnelle et affective.
            </p>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>
              Les réponses que vous fournirez permettront :
            </p>
            <ul style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, paddingLeft: 20, margin: "0 0 16px 0", listStyleType: "disc" }}>
              <li style={{ marginBottom: 4 }}>d'établir votre profil relationnel ;</li>
              <li style={{ marginBottom: 4 }}>de calculer votre Indice de Qualité des Relations Humaines (IQRH) ;</li>
              <li style={{ marginBottom: 4 }}>de vous proposer des recommandations personnalisées ;</li>
              <li style={{ marginBottom: 0 }}>d'alimenter, sous une forme strictement anonymisée, des travaux de recherche destinés à améliorer la compréhension des relations humaines.</li>
            </ul>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              La participation est entièrement volontaire.<br />
              Vous pouvez interrompre le questionnaire à tout moment.<br />
              La durée moyenne est de 8 à 10 minutes.
            </p>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 0 }}>
              Les informations recueillies sont confidentielles et traitées conformément à la réglementation en vigueur relative à la protection des données personnelles.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { key: "consentement_informations", label: "J'ai pris connaissance des informations ci-dessus.", required: true },
                  { key: "consentement_utilisation", label: "J'accepte que mes réponses soient utilisées de manière anonyme à des fins statistiques et scientifiques.", required: true },
                  { key: "consentement_participation", label: "Je consens à participer à cette étude.", required: false },
                ].map(({ key, label, required }) => {
                  const checked = form[key as keyof typeof form];
                  return (
                    <div
                      key={key}
                      onClick={() => setF(key, !checked)}
                      style={{ display: "flex", alignItems: "flex-start", gap: 14, cursor: "pointer", padding: "8px 0" }}
                    >
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, transition: "all 0.18s",
                        flexShrink: 0, border: checked ? "2px solid #7c3aed" : "2px solid rgba(255,255,255,0.18)",
                        background: checked ? "#7c3aed" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {checked && <Check style={{ width: 14, height: 14, color: "white" }} />}
                      </div>
                      <span style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.5, userSelect: "none" }}>
                        {label} {required && <span style={{ color: "#f43f5e", marginLeft: 4 }}>*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={!canSubmit}
              style={{ width: "100%", marginTop: 8, marginBottom: 32 }}
            >
              Continuer vers le profil <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
