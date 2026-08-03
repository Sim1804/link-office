import { Navbar } from "@/components/layout/Navbar";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Mentions légales — LinkOffice",
  description: "Mentions légales de la plateforme LinkOffice.",
};

export default function MentionsLegales() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "rgba(6,182,212,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 24, height: 24, color: "#06b6d4" }} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "#f8fafc" }}>
              Mentions légales
            </h1>
          </div>

          {[
            {
              title: "Éditeur du site",
              content: [
                "Dénomination : Link-Office SAS",
                "Siège social : [Adresse à compléter]",
                "Email : contact@link-office.fr",
                "Responsable de la publication : [Nom du dirigeant]",
              ],
            },
            {
              title: "Hébergement",
              content: [
                "Hébergeur : Neon Inc. (base de données PostgreSQL serverless)",
                "Infrastructure cloud : conforme RGPD, données hébergées en Union Européenne",
              ],
            },
            {
              title: "Propriété intellectuelle",
              content: [
                "Le contenu de ce site (textes, algorithmes, scores IQRH/ICR, profils relationnels, ordonnances) est protégé par le droit d'auteur.",
                "La reproduction sans autorisation écrite de l'éditeur est interdite.",
                "Le moteur de scoring IQRH et ICR est la propriété intellectuelle de Link-Office.",
              ],
            },
            {
              title: "Limitation de responsabilité",
              content: [
                "LinkOffice est un outil d'évaluation et d'accompagnement. Il ne constitue pas un acte médical, psychologique ou thérapeutique.",
                "Les résultats fournis sont indicatifs et ne se substituent pas à un avis professionnel de santé.",
                "L'éditeur ne peut être tenu responsable des décisions prises sur la base des résultats fournis par la plateforme.",
              ],
            },
          ].map(({ title, content }) => (
            <div key={title} className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>{title}</h2>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {content.map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
                    <span style={{ color: "#06b6d4", flexShrink: 0, marginTop: 2 }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
