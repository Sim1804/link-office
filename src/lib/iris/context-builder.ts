/**
 * @file context-builder.ts
 * @module lib/iris
 * @description Constructeur du contexte système injecté dans les conversations avec IRIS.
 *
 * IRIS est l'IA de coaching relationnel de LinkOffice. Avant chaque message de l'utilisateur,
 * IRIS reçoit un contexte système contenant le bilan IQRH complet de l'utilisateur.
 * Ce contexte est construit par `buildIrisContext()` et permet à IRIS de :
 *
 * 1. Personnaliser son coaching selon le profil exact de l'utilisateur
 * 2. Faire référence aux dimensions faibles/fortes avec précision
 * 3. Guider intelligemment l'utilisateur dans la réalisation de ses défis (micro-challenges)
 * 4. Appliquer les instructions cachées `texte_iris` des recommandations de la librairie
 * 5. Savoir quels défis elle peut valider elle-même (flag `compatible_iris`)
 *
 * @see app/api/iris/conversation/[id]/message/route.ts — Route qui injecte ce contexte
 * @see lib/iqrh/types.ts — Utilitaire `getDimensionStatusInfo` utilisé ici
 */

import { prisma } from "@/lib/prisma";
import { getDimensionStatusInfo } from "@/lib/iqrh/types";

/**
 * Construit la chaîne de contexte IQRH formatée pour le prompt système d'IRIS.
 *
 * Ce texte est injecté en tant que "system prompt" dans chaque appel LLM.
 * Il est intentionnellement lisible par un humain (plain text structuré)
 * car les LLMs traitement mieux ce format que du JSON brut pour les instructions.
 *
 * Sections incluses (si les données existent) :
 * - Bilan IQRH global (score, météo, IER)
 * - Scores par dimension avec niveau qualitatif
 * - 3 forces principales et 3 points de vigilance
 * - Profil relationnel primaire et secondaire
 * - Score ICR et niveau de complexité
 * - Ordonnance relationnelle (recommandations + défis) avec :
 *   · Instructions cachées `texte_iris` pour les recommandations
 *   · Flag `compatible_iris` pour les défis (autorisation de validation par IRIS)
 *
 * @param userId - L'identifiant de l'utilisateur dont on construit le contexte IRIS
 * @returns Une chaîne de texte formatée prête à être injectée dans le prompt système
 *          Si l'utilisateur n'a pas de résultats, retourne un message court explicatif
 *
 * @example
 * const systemContext = await buildIrisContext("user_abc123");
 * const messages = [
 *   { role: "system", content: `Tu es IRIS...\n\n${systemContext}` },
 *   { role: "user", content: userMessage },
 * ];
 */
export async function buildIrisContext(userId: string): Promise<string> {
  // Récupération de l'utilisateur (pour le prénom/nom)
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Récupération du dernier assessment de l'utilisateur avec toutes ses données associées
  const latestAssessment = await prisma.assessment.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      demographic: true,
      result: {
        include: {
          icr: true,
          profile: true,
          prescription: {
            include: {
              items: {
                include: { libraryItem: true },
              },
            },
          },
        },
      },
    },
  });

  // Cas : l'utilisateur n'a pas encore fait le questionnaire
  if (!latestAssessment?.result) {
    return "L'utilisateur n'a pas encore complété son questionnaire IQRH.";
  }

  const result = latestAssessment.result;
  const demo = latestAssessment.demographic;

  // Récupération des configurations visuelles/sémantiques pour chaque dimension
  const socialDimensionInfo = getDimensionStatusInfo(result.socialScore);
  const affectiveDimensionInfo = getDimensionStatusInfo(result.affectiveScore);
  const sentimentalDimensionInfo = getDimensionStatusInfo(result.sentimentalScore);
  const professionalDimensionInfo = getDimensionStatusInfo(result.professionalScore);
  const selfDimensionInfo = getDimensionStatusInfo(result.selfScore);

  const isPremium = user?.subscription === "PREMIUM" || user?.subscription === "PREMIUM_PLUS";

  const dimDetails = (result.dimensionDetails as any[]) || [];
  const getDimText = (dim: string) => {
    const detail = dimDetails.find(d => d.dimension === dim);
    return isPremium ? (detail?.longText || detail?.shortText) : (detail?.shortText || "Interprétation non disponible");
  };

  // ── Construction du contexte — Section principale ────────────────────────
  let irisContext = `=== CONTEXTE PERSONNEL ET DÉMOGRAPHIQUE ===
- Rôle / Type de contrat : ${user?.role || "Non spécifié"}
- Âge : ${demo?.ageRange ? `${demo.ageRange}` : "Non spécifié"}
- Situation pro. principale : ${demo?.occupation || "Non spécifiée"}
- Situations spécifiques : ${demo?.selectedSituations?.join(", ") || "Aucune"}

=== BILAN IQRH DE L'UTILISATEUR ===
- Score Global IQRH : ${result.globalScore}/100
- Interprétation Score Global : "${isPremium ? (result.globalScoreTextPremium || result.globalScoreText) : result.globalScoreText}"
- Météo Relationnelle : ${result.weatherIcon} ${result.weatherTitleFull || result.weatherTitle}
- Interprétation Météo Officielle : "${isPremium ? (result.weatherTextPremium || result.weatherText) : result.weatherText}"
- Indice d'Équilibre Relationnel (IER) : ${result.balanceIndex}/100 (${result.balanceLevel})

=== SOUS-SCORES ET STATUTS PAR DIMENSION ===
1. Relations Sociales (D1) : ${result.socialScore}/100 — ${socialDimensionInfo.icon} ${socialDimensionInfo.statusLabel} (${socialDimensionInfo.levelLabel})
   > ${getDimText("SOCIAL")}
2. Relations Affectives (D2) : ${result.affectiveScore}/100 — ${affectiveDimensionInfo.icon} ${affectiveDimensionInfo.statusLabel} (${affectiveDimensionInfo.levelLabel})
   > ${getDimText("AFFECTIVE")}
3. Vie Sentimentale (D3) : ${result.sentimentalScore}/100 — ${sentimentalDimensionInfo.icon} ${sentimentalDimensionInfo.statusLabel} (${sentimentalDimensionInfo.levelLabel})
   > ${getDimText("SENTIMENTAL")}
4. Vie Pro & Engagement (D4) : ${result.professionalScore}/100 — ${professionalDimensionInfo.icon} ${professionalDimensionInfo.statusLabel} (${professionalDimensionInfo.levelLabel})
   > ${getDimText("PROFESSIONAL")}
5. Relation à Soi (D5) : ${result.selfScore}/100 — ${selfDimensionInfo.icon} ${selfDimensionInfo.statusLabel} (${selfDimensionInfo.levelLabel})
   > ${getDimText("SELF")}

- Dimension la plus forte (Force) : ${result.bestDimension}
- Dimension prioritaire (Point d'attention) : ${result.priorityDimension}`;

  // ── Section : Forces ─────────────────────────────────────────────────────
  if (result.strengths.length) {
    irisContext += `\n\n=== 3 PRINCIPALES FORCES ===\n${result.strengths.map((strength, index) => `${index + 1}. ${strength}`).join("\n")}`;
  }

  // ── Section : Points de vigilance ────────────────────────────────────────
  if (result.watchpoints.length) {
    irisContext += `\n\n=== 3 POINTS DE VIGILANCE ===\n${result.watchpoints.map((watchpoint, index) => `${index + 1}. ${watchpoint}`).join("\n")}`;
  }

  // ── Section : Profil relationnel ─────────────────────────────────────────
  if (result.profile) {
    irisContext += `\n\n=== PROFIL RELATIONNEL ===
- Profil Principal : ${result.primaryProfile}
- Profil Secondaire : ${result.secondaryProfile}
- Signature Relationnelle : ${result.profile.signature}
- Résumé : ${result.profileSummary}`;
  }

  // ── Section : ICR ────────────────────────────────────────────────────────
  if (result.icr) {
    const icrInterpretation = isPremium ? (result.icr.interpretationPremium || result.icr.interpretation) : result.icr.interpretation;
    irisContext += `\n\n=== INDICE DE COMPLEXITÉ RELATIONNELLE (ICR) ===
- Score ICR : ${result.icr.score}/100 (${result.icr.level})
- Interprétation ICR : "${icrInterpretation}"`;

    const dominantNeeds = result.icr.dominantNeeds || [];
    const dominantNeedDetails = (result.icr.dominantNeedDetails as any[]) || [];
    
    if (dominantNeeds.length > 0) {
      irisContext += `\n- Besoins Relationnels Dominants : ${dominantNeeds.join(", ")}`;
      dominantNeedDetails.forEach(need => {
        irisContext += `\n  * Besoin de ${need.title} : ${need.interpretation}`;
        irisContext += `\n    Piste d'action : ${need.action}`;
      });
    }

    const moduleDetails = (result.icr.moduleDetails as any[]) || [];
    if (moduleDetails.length > 0) {
      irisContext += `\n\n=== MODULES ADAPTATIFS & SITUATIONS SPÉCIFIQUES ===`;
      moduleDetails.forEach(mod => {
        irisContext += `\n- ${mod.title} :`;
        irisContext += `\n  Interprétation : ${mod.interpretation}`;
        irisContext += `\n  Action recommandée : ${mod.action}`;
      });
    }
  }

  // ── Section : Ordonnance relationnelle (Recommandations + Défis) ─────────
  if (result.prescription?.items.length) {
    irisContext += `\n\n=== ORDONNANCE RELATIONNELLE PRESCRITE ===\n`;

    result.prescription.items.forEach((prescriptionItem) => {
      const itemMetadata = prescriptionItem.libraryItem.data as any;

      // `texte_iris` : instruction cachée réservée à IRIS (non affichée à l'utilisateur)
      const hiddenIrisInstruction = itemMetadata?.texte_iris || "";

      // `compatible_iris` : flag indiquant si IRIS peut valider ce défi à la place de l'utilisateur
      const isCompatibleWithIrisValidation = itemMetadata?.compatible_iris === "Oui";

      const statusFr = prescriptionItem.status === "PROPOSED" ? "À réaliser" : prescriptionItem.status === "COMPLETED" ? "Déjà fait" : "Ignoré";
      irisContext += `- [${prescriptionItem.kind}] Titre: ${prescriptionItem.libraryItem.title} | Statut pour l'utilisateur: ${statusFr}\n`;
      irisContext += `  Description affichée à l'utilisateur : ${prescriptionItem.rationale}\n`;

      // Injection des instructions cachées IQRH pour les recommandations
      if (prescriptionItem.kind === "RECOMMENDATION" && hiddenIrisInstruction) {
        irisContext += `  INSTRUCTION CACHÉE POUR TOI (IRIS) : "${hiddenIrisInstruction}"\n`;
      }

      // Indication pour les défis : IRIS peut-elle les valider via tool_call ?
      if (prescriptionItem.kind === "MICRO_CHALLENGE") {
        const expectedValidation = itemMetadata?.validation_attendue || "";
        irisContext += `  Compatible avec ton coaching et validation auto : ${isCompatibleWithIrisValidation ? "OUI" : "NON (ne propose pas de le valider toi-même)"}\n`;
        if (isCompatibleWithIrisValidation && expectedValidation) {
          irisContext += `  CRITÈRE DE VALIDATION EXIGÉ : Pour valider ce défi, tu dois t'assurer que l'utilisateur respecte ce critère : "${expectedValidation}"\n`;
        }
      }
    });
  }

  return irisContext;
}
