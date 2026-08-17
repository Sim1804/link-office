"use client";

import { useEffect, useState } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

type LibraryItem = { id: string; title: string; data: Record<string, unknown> };
type Result = {
  globalScore: number; weather: string; weatherText: string; weatherTextPremium?: string; weatherTitleFull?: string; primaryProfile: string; secondaryProfile: string; profileSummary: string;
  assessment?: { user?: { subscription?: string } };
  balanceIndex: number; priorityDimension: string; strengths: string[]; watchpoints: string[];
  socialScore: number; affectiveScore: number; sentimentalScore: number; professionalScore: number; selfScore: number;
  icr: { score: number; level: string; interpretation: string; interpretationPremium: string; riskFactors: string[]; protectiveFactors: string[]; dominantNeeds: string[]; vulnerabilityDetails?: any[]; dominantNeedDetails?: any[] } | null;
  profile: { signature: string; primaryConfidence: number; secondaryConfidence: number } | null;
  prescription: { title: string; summary: string; items: Array<{ id: string; kind: string; rationale: string; libraryItem: LibraryItem }> } | null;
  primaryProfileDetails?: { name: string; shortDescription: string; longDescription: string; dominantNeeds: string[]; strengths: string[]; watchpoints: string[] } | null;
  secondaryProfileDetails?: { name: string; shortDescription: string; longDescription: string; dominantNeeds: string[]; strengths: string[]; watchpoints: string[] } | null;
  strengthDetails?: Array<{ title: string; interpretation: string; lever: string }>;
  watchpointDetails?: Array<{ title: string; interpretation: string; lever: string }>;
};

const labels = ["Relations sociales", "Relations affectives", "Vie sentimentale", "Vie professionnelle", "Relation à soi"];

export default function Results({ params }: { params: Promise<{ userId: string }> }) {
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(async ({ userId }) => {
      const response = await fetch(`/api/resultats/${userId}`);
      const body = await response.json() as Result & { error?: string };
      if (!response.ok) setError(body.error ?? "Résultats indisponibles.");
      else setResult(body);
    });
  }, [params]);

  if (error) {
    return (
      <main className="page-main" style={{ display: "grid", placeItems: "center" }}>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--rose)" }}>{error}</p>
        </div>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="page-main" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ color: "var(--text-2)" }}>Chargement de vos résultats…</p>
      </main>
    );
  }

  const radarData = [
    { dimension: labels[0], score: result.socialScore },
    { dimension: labels[1], score: result.affectiveScore },
    { dimension: labels[2], score: result.sentimentalScore },
    { dimension: labels[3], score: result.professionalScore },
    { dimension: labels[4], score: result.selfScore },
  ];

  const subscription = result.assessment?.user?.subscription || "FREEMIUM";
  const isPremium = subscription === "PREMIUM" || subscription === "PREMIUM_PLUS";
  const isPremiumPlus = subscription === "PREMIUM_PLUS";

  const allPrescriptionItems = result.prescription?.items || [];
  const prescriptionItemsToDisplay = isPremium ? allPrescriptionItems : [
    ...allPrescriptionItems.filter(i => i.kind === "RECOMMENDATION").slice(0, 3),
    ...allPrescriptionItems.filter(i => i.kind === "MICRO_CHALLENGE").slice(0, 3)
  ];

  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="blob-cyan" />
        
        <div className="page-container" style={{ maxWidth: 1000 }}>
          <header style={{ marginBottom: 40 }}>
            <span className="badge badge-violet" style={{ marginBottom: 12 }}>BILAN IQRH</span>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>Votre qualité relationnelle, aujourd'hui</h1>
            <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.6 }}>Cette restitution présente vos résultats IQRH, votre indice de complexité relationnelle et les premières actions de votre ordonnance relationnelle.</p>
          </header>

          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1.25fr", marginBottom: 24 }}>
            <div className="card" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)", borderColor: "rgba(124,58,237,0.2)" }}>
              <p style={{ color: "var(--primary-light)", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", marginBottom: 12 }}>SCORE GLOBAL IQRH</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16 }}>
                <span className="gradient-text" style={{ fontSize: 56, fontWeight: 800 }}>{Math.round(result.globalScore)}</span>
                <span style={{ color: "var(--text-3)", fontSize: 20 }}>/100</span>
              </div>
              <p style={{ color: "var(--text-1)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{result.weatherTitleFull || result.weather}</p>
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>{isPremium ? (result.weatherTextPremium || result.weatherText) : result.weatherText}</p>
              <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)" }}>Indice d'équilibre relationnel</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)" }}>{Math.round(result.balanceIndex)} / 100</p>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 20 }}>Votre radar relationnel</h2>
              <div style={{ height: 320, width: "100%" }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fill: "var(--text-3)", fontSize: 11 }} />
                    <Radar dataKey="score" stroke="#a78bfa" fill="#7c3aed" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginBottom: 32 }}>
            {radarData.map((item) => (
              <div key={item.dimension} className="card" style={{ padding: 20 }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>{item.dimension}</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>{Math.round(item.score)}</p>
                <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg, #7c3aed, #06b6d4)", width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", marginBottom: 32 }}>
            <div className="card">
              <span className="badge badge-violet" style={{ marginBottom: 12 }}>PROFIL PRINCIPAL</span>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>{result.primaryProfile}</h2>
              <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                {isPremium ? result.primaryProfileDetails?.longDescription : result.primaryProfileDetails?.shortDescription || result.profileSummary}
              </p>
              
              {isPremium && result.primaryProfileDetails && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <MiniList title="Besoins dominants" items={result.primaryProfileDetails.dominantNeeds} />
                  <MiniList title="Forces associées" items={result.primaryProfileDetails.strengths} />
                  <MiniList title="Points de vigilance" items={result.primaryProfileDetails.watchpoints} />
                </div>
              )}

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <span className="badge badge-cyan" style={{ marginBottom: 12 }}>PROFIL SECONDAIRE</span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>{result.secondaryProfile}</h3>
                
                <div style={{ padding: 16, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, fontStyle: "italic" }}>
                    {isPremium 
                      ? `Votre profil secondaire complète votre profil principal. Cette combinaison signifie que vous ne fonctionnez pas selon une seule logique relationnelle.`
                      : `Votre profil secondaire nuance votre profil principal et montre qu’une autre dynamique relationnelle est présente.`
                    }
                  </p>
                </div>

                <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>
                  {isPremium ? result.secondaryProfileDetails?.longDescription : result.secondaryProfileDetails?.shortDescription}
                </p>
                {isPremium && result.secondaryProfileDetails && (
                  <div style={{ marginTop: 16 }}>
                    <MiniList title="Besoins dominants" items={result.secondaryProfileDetails.dominantNeeds} />
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card">
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>Votre dimension prioritaire</h2>
                <p style={{ fontSize: 20, fontWeight: 700, color: "var(--primary-light)", marginBottom: 8 }}>{result.priorityDimension}</p>
                <p style={{ fontSize: 13, color: "var(--text-3)" }}>Elle guide les actions proposées dans votre ordonnance relationnelle.</p>
              </div>

              {result.strengthDetails?.length ? <DetailsCard title="Vos principales forces" items={result.strengthDetails} isPremium={isPremium} actionLabel="Levier :" /> : <ListCard title="Vos principales forces" items={result.strengths} />}
              {result.watchpointDetails?.length ? <DetailsCard title="Vos points de vigilance" items={result.watchpointDetails} isPremium={isPremium} actionLabel="Levier :" /> : <ListCard title="Vos points de vigilance" items={result.watchpoints} />}
            </div>
          </div>
          
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", marginBottom: 32 }}>
            {isPremium && result.icr?.vulnerabilityDetails?.length ? (
              <DetailsCard title="Facteurs de vulnérabilité" items={result.icr.vulnerabilityDetails} isPremium={isPremium} actionLabel="Action :" />
            ) : isPremium ? (
              <Placeholder title="Analyse Psychorelationnelle" text="Vos vulnérabilités et dynamiques relationnelles profondes." />
            ) : (
              <PremiumLock title="Facteurs de vulnérabilité" text="Débloquez le Premium pour découvrir vos dynamiques relationnelles profondes." />
            )}

            {isPremium && result.icr?.dominantNeedDetails?.length ? (
              <DetailsCard title="Besoins dominants" items={result.icr.dominantNeedDetails.map((n: any) => ({...n, lever: n.action}))} isPremium={isPremium} actionLabel="Piste :" />
            ) : isPremium ? (
              <Placeholder title="Besoins relationnels dominants" text="Vos besoins seront analysés ici." />
            ) : (
              <PremiumLock title="Besoins relationnels dominants" text="Débloquez le Premium pour découvrir vos principaux besoins." />
            )}
          </div>

          {result.icr && (
            <div style={{ display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr", marginBottom: 32 }}>
              <div className="card" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(124,58,237,0.15) 100%)", borderColor: "rgba(6,182,212,0.2)" }}>
                <span className="badge badge-cyan" style={{ marginBottom: 16 }}>COMPLEXITÉ RELATIONNELLE (ICR)</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: "var(--text-1)" }}>{result.icr.score}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 18 }}>/100</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>{result.icr.level}</p>
                <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>{isPremium && result.icr.interpretationPremium ? result.icr.interpretationPremium : result.icr.interpretation}</p>
              </div>
              
              {isPremium ? (
                <div className="card">
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>Vos repères de contexte</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <MiniList title="Facteurs de risque" items={result.icr.riskFactors} />
                    <MiniList title="Facteurs protecteurs" items={result.icr.protectiveFactors} />
                  </div>
                </div>
              ) : (
                <PremiumLock title="Analyse ICR complète" text="Débloquez le Premium pour accéder au détail de vos vulnérabilités et facteurs protecteurs." />
              )}
            </div>
          )}

          <div className="card" style={{ marginBottom: 32 }}>
            <span className="badge badge-amber" style={{ marginBottom: 16 }}>ORDONNANCE RELATIONNELLE</span>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)", marginBottom: 12 }}>{result.prescription?.title ?? "Préparation de votre ordonnance"}</h2>
            <p style={{ color: "var(--text-2)", fontSize: 15, marginBottom: 24 }}>{result.prescription?.summary ?? "Votre ordonnance sera disponible sous peu."}</p>
            
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
              {prescriptionItemsToDisplay.map((item) => (
                <div key={item.id} style={{ padding: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: item.kind === "MICRO_CHALLENGE" ? "#f59e0b" : "#34d399", textTransform: "uppercase" }}>
                    {item.kind === "MICRO_CHALLENGE" ? "Micro-défi" : "Recommandation"}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginTop: 8, marginBottom: 8 }}>{item.libraryItem.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>{item.rationale}</p>
                </div>
              ))}
            </div>
            {!isPremium && allPrescriptionItems.length > prescriptionItemsToDisplay.length && (
              <div style={{ marginTop: 24 }}>
                <PremiumLock title="Ordonnance complète" text="Débloquez le Premium pour accéder à toutes vos recommandations." />
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="card">
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>{title}</h2>
      <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 12, fontSize: 14, color: "var(--text-2)" }}>
            <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>0{i + 1}</span>
            <span style={{ lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailsCard({ title, items, isPremium, actionLabel }: { title: string; items: any[]; isPremium: boolean; actionLabel: string }) {
  if (!items?.length) return null;
  return (
    <div className="card">
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 20 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "var(--primary-light)", fontWeight: 700 }}>0{i + 1}</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>{item.title}</p>
              <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>{item.interpretation}</p>
              {isPremium && item.lever && (
                <div style={{ marginTop: 12, padding: 12, background: "rgba(124,58,237,0.1)", borderRadius: 8, color: "var(--primary-light)", fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{actionLabel} </span> {item.lever}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>{items.length ? items.join(" · ") : "Aucun élément identifié."}</p>
    </div>
  );
}

function Placeholder({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 24, padding: 32, background: "rgba(255,255,255,0.01)" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function PremiumLock({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ padding: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.05)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <Lock size={20} color="var(--text-3)" />
      </div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5, maxWidth: 300 }}>{text}</p>
    </div>
  );
}
