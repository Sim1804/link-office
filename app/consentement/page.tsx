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
import { Button } from "@/components/ui/Button";

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
      <main className="min-h-screen bg-[#FAF9F5] pt-28 pb-20 px-4 sm:px-6 flex flex-col items-center relative overflow-hidden">
        {/* Decor blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#00A99D]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tl from-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-2xl relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-white border border-[#E3EBE6] rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#00A99D]" />
            </div>
            <div>
              <h1 className="font-jakarta font-extrabold text-2xl text-[#123D46] m-0 tracking-tight">Bienvenue</h1>
              <p className="text-[#123D46]/70 text-sm mt-1">Avant de commencer, veuillez prendre connaissance des informations suivantes</p>
            </div>
          </div>

          <div className="bg-white border border-[#E3EBE6] rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
            <p className="text-[#123D46] text-[15px] font-semibold leading-relaxed mb-4">
              Bienvenue dans le questionnaire IQRH (Indice de Qualité des Relations Humaines).
            </p>
            <p className="text-[#123D46]/80 text-sm leading-relaxed mb-5">
              Ce questionnaire vise à mieux comprendre la qualité des relations humaines dans les différentes sphères de vie : personnelle, familiale, sociale, professionnelle et affective.
            </p>
            <p className="text-[#123D46]/80 text-sm leading-relaxed mb-2 font-medium">
              Les réponses que vous fournirez permettront :
            </p>
            <ul className="text-[#123D46]/80 text-sm leading-relaxed pl-5 mb-5 list-disc marker:text-[#00A99D]">
              <li className="mb-1.5">d'établir votre profil relationnel ;</li>
              <li className="mb-1.5">de calculer votre Indice de Qualité des Relations Humaines (IQRH) ;</li>
              <li className="mb-1.5">de vous proposer des recommandations personnalisées ;</li>
              <li className="mb-0">d'alimenter, sous une forme strictement anonymisée, des travaux de recherche destinés à améliorer la compréhension des relations humaines.</li>
            </ul>
            <div className="bg-[#FAF9F5] border border-[#E3EBE6] p-4 rounded-2xl mb-5 text-sm text-[#123D46]/80 leading-relaxed">
              <span className="block mb-1 font-medium text-[#123D46]">À noter :</span>
              La participation est entièrement volontaire.<br />
              Vous pouvez interrompre le questionnaire à tout moment.<br />
              La durée moyenne est de 8 à 10 minutes.
            </div>
            <p className="text-[#123D46]/70 text-xs leading-relaxed m-0 italic">
              Les informations recueillies sont confidentielles et traitées conformément à la réglementation en vigueur relative à la protection des données personnelles.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-white border border-[#E3EBE6] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-4">
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
                      className="flex items-start gap-3 cursor-pointer py-1.5 group"
                    >
                      <div className={`w-5 h-5 rounded-md transition-all shrink-0 border-2 flex items-center justify-center mt-0.5 ${
                        checked ? "border-[#00A99D] bg-[#00A99D]" : "border-[#E3EBE6] bg-[#FAF9F5] group-hover:border-[#00A99D]/40"
                      }`}>
                        {checked && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[14px] text-[#123D46]/80 leading-snug select-none group-hover:text-[#123D46] transition-colors">
                        {label} {required && <span className="text-red-500 ml-1 font-bold">*</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              className="w-full flex items-center justify-center gap-2"
            >
              Continuer vers le profil <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
