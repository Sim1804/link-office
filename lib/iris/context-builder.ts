import { prisma } from "@/lib/prisma";
import { getDimensionStatusInfo } from "@/lib/iqrh/types";

export async function buildIrisContext(userId: string): Promise<string> {
  const assessment = await prisma.assessment.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      result: {
        include: {
          icr: true,
          profile: true,
          prescription: { include: { items: { include: { libraryItem: true } } } },
        },
      },
    },
  });

  if (!assessment?.result) {
    return "L'utilisateur n'a pas encore complété son questionnaire IQRH.";
  }

  const r = assessment.result;
  const socialInfo = getDimensionStatusInfo(r.socialScore);
  const affectiveInfo = getDimensionStatusInfo(r.affectiveScore);
  const sentimentalInfo = getDimensionStatusInfo(r.sentimentalScore);
  const professionalInfo = getDimensionStatusInfo(r.professionalScore);
  const selfInfo = getDimensionStatusInfo(r.selfScore);

  let context = `=== BILAN IQRH DE L'UTILISATEUR ===
- Score Global IQRH : ${r.globalScore}/100
- Météo Relationnelle : ${r.weatherIcon} ${r.weatherTitle} (${r.weather})
- Interprétation Météo Officielle : "${r.weatherText}"
- Indice d'Équilibre Relationnel (IER) : ${r.balanceIndex}/100 (${r.balanceLevel})

=== SOUS-SCORES ET STATUTS PAR DIMENSION ===
1. Relations Sociales (D1) : ${r.socialScore}/100 — ${socialInfo.icon} ${socialInfo.statusLabel} (${socialInfo.levelLabel})
2. Relations Affectives (D2) : ${r.affectiveScore}/100 — ${affectiveInfo.icon} ${affectiveInfo.statusLabel} (${affectiveInfo.levelLabel})
3. Vie Sentimentale (D3) : ${r.sentimentalScore}/100 — ${sentimentalInfo.icon} ${sentimentalInfo.statusLabel} (${sentimentalInfo.levelLabel})
4. Vie Pro & Engagement (D4) : ${r.professionalScore}/100 — ${professionalInfo.icon} ${professionalInfo.statusLabel} (${professionalInfo.levelLabel})
5. Relation à Soi (D5) : ${r.selfScore}/100 — ${selfInfo.icon} ${selfInfo.statusLabel} (${selfInfo.levelLabel})

- Dimension la plus forte (Force) : ${r.bestDimension}
- Dimension prioritaire (Point d'attention) : ${r.priorityDimension}`;

  if (r.strengths.length) {
    context += `\n\n=== 3 PRINCIPALES FORCES ===\n${r.strengths.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
  }

  if (r.watchpoints.length) {
    context += `\n\n=== 3 POINTS DE VIGILANCE ===\n${r.watchpoints.map((w, i) => `${i + 1}. ${w}`).join("\n")}`;
  }

  if (r.profile) {
    context += `\n\n=== PROFIL RELATIONNEL ===
- Profil Principal : ${r.primaryProfile}
- Profil Secondaire : ${r.secondaryProfile}
- Signature Relationnelle : ${r.profile.signature}
- Résumé : ${r.profileSummary}`;
  }

  if (r.icr) {
    context += `\n\n=== INDICE DE COMPLEXITÉ RELATIONNELLE (ICR) ===
- Score ICR : ${r.icr.score}/100 (${r.icr.level})
- Interprétation ICR : "${r.icr.interpretation}"`;
  }

  if (r.prescription?.items.length) {
    context += `\n\n=== ORDONNANCE RELATIONNELLE PRESCRITE ===\n` +
      r.prescription.items.map((item) => `- [${item.kind}] ID: "${item.id}" | Titre: ${item.libraryItem.title} | Statut: ${item.status}\n  Description: ${item.rationale}`).join("\n");
  }

  return context;
}
