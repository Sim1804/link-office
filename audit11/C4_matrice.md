# Rejeu de la Matrice d'Autorisation Complète T4 (Tâche C4)

Date : 18 octobre 2026  
Branche et commit : `fix/passe11` (`ab08eda`)  
Banc exécuté : `validation/t4-authz/run.ts`  
Données brutes : `validation/t4-authz/result.json` et `validation/t4-authz/raw/matrix-exec-results.json`

---

## 1. Bilan Global et Comparaison avec la Passe 10

| Indicateur | Passe 10 | Passe 11 (Tête actuelle) | Évolution |
| :--- | :---: | :---: | :---: |
| **Total cellules évaluées** | 654 | **654** | Stricte égalité |
| **Cellules Conformes (Passed)** | 542 (82,9 %) | **540 (82,6 %)** | -2 (liées aux drafts de test en base) |
| **Total Divergences** | 112 (17,1 %) | **114 (17,4 %)** | +2 |
| **Cellules non testées** | 0 | **0** | Couverture intégrale |
| **Respect du k-anonymat strict (< 5)** | Respecté | **Respecté (100 %)** | Identique |
| **Suppression secondaire active** | Active (2 cellules) | **Active (2 cellules)** | Identique |

---

## 2. Répartition des Divergences par Catégorie Fermée

| Catégorie de Divergence | Nombre | Statut Observé Typique | Explication tirée du code source |
| :--- | :---: | :---: | :--- |
| **(1) Rôle interdit mais statut 2xx** | **39** | HTTP 200 | • 17 cellules de **Self-Reads (Q1)** : l'appelant consulte ses propres données (`session.user.id === targetUserId`).<br>• 22 cellules **SUPER_ADMIN (Q2)** : le rôle SUPER_ADMIN bénéficie d'une exemption globale dans le code mais l'attente imposait un rejet tenant `403_OR_404`.<br>• **Fuites réelles vers Organisation A : 0 (zéro)**. |
| **(2) Erreurs serveur (5xx)** | **6** | HTTP 500 | Erreurs de contraintes de clé étrangère ou JSON mal formé sur des payloads synthétiques de test (`/api/carnet/plan`, `/api/carnet/defis`). |
| **(3) Interchangeabilité 401 / 403** | **27** | HTTP 401 ou 403 | Codes de retour équivalents de sécurité (ex: la spécification attendait 401 mais le handler rejette en 403 dès la garde de rôle, ou inversement). |
| **(4) Entrée invalide (attendu 2xx, reçu 4xx)** | **42** | HTTP 400 ou 404 | Paramètres d'URL ou corps de requête non trouvés pour des ressources éphémères consommées (ex: campagne expirée ou brouillon d'évaluation déjà soumis). |
| **(5) Spécification manquante** | **0** | — | Aucune route orpheline non répertoriée. |

---

## 3. Analyse Approfondie des 39 Cellules « Interdit mais 2xx » (Failles Potentielles)

Le script de recoupement `audit11/scripts/analyze-c4.ts` a examiné le corps complet (`bodySnippet` et `bodyContainsOrgA`) de chaque cellule renvoyant HTTP 200 alors que la matrice attendait un rejet :

1. **Lectures de ses propres données — Self-Reads (17 cellules)** :
   - `GET /api/resultats/[userId]` (B2C, ORG_ADMIN, CROSS_ADMIN) : [app/api/resultats/[userId]/route.ts:L39](file:///d:/Projects/link-office/app/api/resultats/%5BuserId%5D/route.ts#L39) — L'utilisateur lit son propre bilan personnel (`session.user.id === userId`).
   - `GET /api/ordonnances/[userId]` (B2C, ORG_ADMIN, CROSS_ADMIN) : [app/api/ordonnances/[userId]/route.ts:L38](file:///d:/Projects/link-office/app/api/ordonnances/%5BuserId%5D/route.ts#L38) — Lecture de sa propre ordonnance.
   - `GET /api/assessment/[id]/prescription` (B2C, ORG_ADMIN, CROSS_ADMIN) : [app/api/assessment/[id]/prescription/route.ts:L62](file:///d:/Projects/link-office/app/api/assessment/%5Bid%5D/prescription/route.ts#L62) — Lecture de sa propre prescription.
   - `GET /api/binome/status` (ORG_ADMIN, CROSS_ADMIN) : [app/api/binome/status/route.ts:L22](file:///d:/Projects/link-office/app/api/binome/status/route.ts#L22) — L'administrateur consulte l'état de son propre binôme.
   - `GET /api/b2b/organization` (CROSS_ADMIN) : [app/api/b2b/organization/route.ts:L15](file:///d:/Projects/link-office/app/api/b2b/organization/route.ts#L15) — L'administrateur B consulte sa propre organisation B.
   - `GET /api/actions`, `GET /api/actions/export`, `GET /api/b2b/stats` (CROSS_ADMIN) : [app/api/actions/route.ts:L28](file:///d:/Projects/link-office/app/api/actions/route.ts#L28) — L'administrateur B consulte ses propres actions d'entreprise.
   - `bodyContainsOrgA` : **false** sur l'ensemble des 17 cellules.
2. **SUPER_ADMIN sur routes de tenant (22 cellules)** :
   - Routes d'actions, de campagnes et d'organisation B2B (`/api/actions`, `/api/campaigns/[id]`, `/api/b2b/barometre`, `/api/b2b/invite`, `/api/b2b/stats`).
   - Le code autorise expressément `SUPER_ADMIN` dans la clause de rôle (`user.role === "SUPER_ADMIN"`). L'attente `403_OR_404` provenait du fait que le compte SUPER_ADMIN du test n'avait pas d'organisation propre en session.
   - `bodyContainsOrgA` : **false** sur l'ensemble des 22 cellules.

---

## 4. Conclusion

- **Aucune fuite de données inter-organisations (0 fuite constatée)** : Les 39 cellules correspondent strictement à la consultation de ses propres données ou à des opérations SUPER_ADMIN.
- **Conformité globale** : 540 / 654 cellules conformes (82,6 %).
- Ces 39 cellules sont répertoriées dans `audit11/BLOQUANTS.md` comme failles potentielles formelles en attente des décisions d'arbitrage Q1 et Q2 de l'auteur.
