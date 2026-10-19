import { Navbar } from "@/components/layout/Navbar";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { FileText, ArrowLeft, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Mentions légales — Link Office",
  description: "Mentions légales de la plateforme Link Office.",
};

export default async function MentionsLegales() {
  const session = await auth();

  return (
    <>
      {session ? <Navbar /> : <PublicNavbar />}
      <main className="page-main">
        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>

          {/* Fil d'Ariane & Bouton Retour vers l'accueil */}
          <div style={{ marginBottom: 20 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-jakarta font-semibold text-[#123D46]/75 hover:text-[#00A99D] bg-white hover:bg-[#FAF9F5] border border-[#E3EBE6] px-3.5 py-1.5 rounded-full shadow-2xs transition-all group no-underline"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Retour à l&apos;accueil</span>
            </Link>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "rgba(0,169,157,0.1)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText style={{ width: 24, height: 24, color: "#00A99D" }} />
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "var(--text-1)", margin: 0 }}>
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
                "Link Office est un outil d'évaluation et d'accompagnement. Il ne constitue pas un acte médical, psychologique ou thérapeutique.",
                "Les résultats fournis sont indicatifs et ne se substituent pas à un avis professionnel de santé.",
                "L'éditeur ne peut être tenu responsable des décisions prises sur la base des résultats fournis par la plateforme.",
              ],
            },
          ].map(({ title, content }) => (
            <div key={title} className="card" style={{ marginBottom: 16 }}>
              <h2 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>{title}</h2>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 0, listStyle: "none" }}>
                {content.map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, color: "var(--text-2)", fontSize: 14, lineHeight: 1.6 }}>
                    <span style={{ color: "#00A99D", flexShrink: 0, marginTop: 2 }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Navigation bas de page */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 24, borderTop: "1px solid #E3EBE6", marginTop: 32 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-jakarta font-bold text-[#00A99D] hover:text-[#199E9A] group transition-colors no-underline"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour à la page d&apos;accueil</span>
            </Link>
            <Link
              href="/politique-confidentialite"
              className="inline-flex items-center gap-1.5 text-xs font-jakarta text-[#123D46]/70 hover:text-[#00A99D] group transition-colors no-underline"
            >
              <span>Consulter la politique de confidentialité</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
