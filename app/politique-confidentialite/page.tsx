import { Navbar } from "@/components/layout/Navbar";
import { Shield, Lock, Database, UserX, Mail } from "lucide-react";

export const metadata = {
  title: "Politique de confidentialité — LinkOffice",
  description: "Politique de confidentialité et protection des données personnelles de LinkOffice.",
};

export default function PolitiqueConfidentialite() {
  return (
    <>
      <Navbar />
      <main className="page-main">
        <div className="blob-violet" />
        <div className="page-container" style={{ position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, background: "rgba(124,58,237,0.12)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield style={{ width: 24, height: 24, color: "#a78bfa" }} />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', Inter, sans-serif", fontWeight: 700, fontSize: 28, color: "#f8fafc" }}>
                Politique de confidentialité
              </h1>
              <p style={{ color: "#64748b", fontSize: 13 }}>Dernière mise à jour : 1er août 2026</p>
            </div>
          </div>

          {[
            {
              icon: Database,
              title: "1. Données collectées",
              content: [
                "Données d'identification : prénom, nom, adresse email.",
                "Données démographiques : tranche d'âge, situation professionnelle, situation familiale, pays et département de résidence.",
                "Données d'évaluation : réponses au questionnaire IQRH (30 questions sur une échelle de Likert), réponses aux modules adaptatifs.",
                "Données calculées : scores IQRH par dimension, Indice de Complexité Relationnelle (ICR), profil relationnel, météo relationnelle.",
                "Données techniques : logs de connexion (sans adresse IP stockée en production), heure de soumission du questionnaire.",
              ],
            },
            {
              icon: Lock,
              title: "2. Finalités du traitement",
              content: [
                "Fourniture du service d'évaluation IQRH et de restitution des résultats.",
                "Personnalisation des recommandations (ordonnance relationnelle) via le moteur IA IRIS.",
                "Amélioration scientifique et statistique des modèles d'évaluation (données anonymisées, avec votre consentement explicite).",
                "Calcul d'indicateurs agrégés anonymisés pour les espaces B2B, B2B2C et Collectivités (seuil minimum de 5 répondants).",
              ],
            },
            {
              icon: Shield,
              title: "3. Base légale du traitement",
              content: [
                "Exécution du contrat : traitement de vos données d'identification pour la fourniture du service.",
                "Consentement explicite : traitement de vos données d'évaluation psychologique (données sensibles selon l'article 9 du RGPD).",
                "Intérêt légitime : amélioration de la qualité du service (données agrégées et anonymisées uniquement).",
              ],
            },
            {
              icon: UserX,
              title: "4. Vos droits",
              content: [
                "Droit d'accès : vous pouvez demander une copie de toutes les données vous concernant.",
                "Droit de rectification : corriger toute information inexacte.",
                "Droit à l'effacement (\"droit à l'oubli\") : demander la suppression complète de votre compte et de vos données.",
                "Droit à la portabilité : recevoir vos données dans un format structuré et lisible.",
                "Droit d'opposition : s'opposer au traitement de vos données à des fins statistiques.",
                "Droit de retrait du consentement : à tout moment, sans effet rétroactif.",
                "Pour exercer vos droits : contactez-nous à privacy@link-office.fr",
              ],
            },
            {
              icon: Mail,
              title: "5. Conservation & Sécurité",
              content: [
                "Vos données sont conservées pendant 3 ans après votre dernière connexion, puis supprimées automatiquement.",
                "Vos données sont stockées sur des serveurs PostgreSQL hébergés dans l'Union Européenne.",
                "Les mots de passe sont hachés avec bcrypt (facteur de coût 12) — jamais stockés en clair.",
                "Les communications sont chiffrées via HTTPS (TLS 1.3).",
                "L'accès aux données est restreint aux personnes habilitées par rôle (RBAC).",
                "Les données agrégées B2B ne contiennent jamais de données individuelles identifiables.",
              ],
            },
          ].map(({ icon: Icon, title, content }) => (
            <div key={title} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Icon size={16} style={{ color: "#a78bfa" }} />
                <h2 style={{ color: "#f8fafc", fontWeight: 600, fontSize: 16 }}>{title}</h2>
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {content.map((item) => (
                  <li key={item} style={{ display: "flex", gap: 10, color: "#94a3b8", fontSize: 14, lineHeight: 1.6 }}>
                    <span style={{ color: "#a78bfa", flexShrink: 0, marginTop: 2 }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ textAlign: "center", marginTop: 24, padding: "20px", background: "rgba(124,58,237,0.05)", borderRadius: 12, border: "1px solid rgba(124,58,237,0.1)" }}>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Pour toute question relative à la protection de vos données :{" "}
              <a href="mailto:privacy@link-office.fr" style={{ color: "#a78bfa", textDecoration: "none" }}>
                privacy@link-office.fr
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
