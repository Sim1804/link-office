# RAPPORT D'AUDIT ET JOURNAL DES CORRECTIONS — LINK-OFFICE

Ce document constitue le journal de bord exhaustif et non-négociable des corrections apportées au dépôt `link-office` pour réconcilier le code réel avec la spécification et les engagements du mémoire.

---

## Sommaire
- [Phase 0 : État des lieux (Audit exhaustif initial)](#phase-0--état-des-lieux)
- [Phase 1 : Sécurité et Confidentialité](#phase-1--sécurité-et-confidentialité)
- [Phase 2 : IRIS (LLM, Sécurité, Quotas)](#phase-2--iris)
- [Phase 3 : Moteurs et Cohérence avec la Spécification](#phase-3--moteurs)
- [Phase 4 : Tests Réels et Preuves](#phase-4--tests-réels)
- [Phase 5 : Script d'Expérimentation](#phase-5--script-dexpérimentation)
- [Phase 6 : Hygiène du Codebase](#phase-6--hygiène)
- [Tableau Final : Mémoire vs Code vs Preuve](#tableau-final)

---

## Phase 0 : État des Lieux

### 1. Cartographie des Routes API (`app/api` - 84 routes réelles)
Toutes les 84 routes de `app/api` ont été répertoriées :
- **Actions RH (4 routes) :** `app/api/actions`, `app/api/actions/export`, `app/api/actions/suggest`, `app/api/actions/[id]`
- **Administration & Back-office (11 routes) :** `app/api/admin/barometre`, `app/api/admin/campaigns`, `app/api/admin/catalog`, `app/api/admin/catalog/import`, `app/api/admin/catalog/[id]`, `app/api/admin/leads`, `app/api/admin/leads/[id]/convert`, `app/api/admin/media/[id]`, `app/api/admin/organizations`, `app/api/admin/organizations/[id]`, `app/api/admin/users/export` *(🚨 Aucune authentification requise)*
- **Authentification & Sécurité (6 routes) :** `app/api/auth/2fa/enable`, `app/api/auth/2fa/generate`, `app/api/auth/change-password`, `app/api/auth/register`, `app/api/auth/verify`, `app/api/auth/[...nextauth]`
- **Portails B2B, B2B2C, B2G (7 routes) :** `app/api/b2b/barometre`, `app/api/b2b/invite`, `app/api/b2b/organization`, `app/api/b2b/organization/by-code/[code]`, `app/api/b2b/stats` *(🚨 Fuite cross-tenant si campaignId externe)*, `app/api/b2b2c/orientation`, `app/api/b2g/stats` *(🚨 ANONYMITY_THRESHOLD = 0)*
- **Binôme Relationnel (8 routes) :** `app/api/binome/invite`, `app/api/binome/preferences`, `app/api/binome/respond`, `app/api/binome/settings`, `app/api/binome/status`, `app/api/binome/suggest`, `app/api/binome/[id]/checkin`, `app/api/binome/[id]/feedback`
- **Campagnes d'évaluation (12 routes) :** `app/api/campaigns`, `app/api/campaigns/join`, `app/api/campaigns/[id]`, `app/api/campaigns/[id]/close`, `app/api/campaigns/[id]/config`, `app/api/campaigns/[id]/export`, `app/api/campaigns/[id]/invites`, `app/api/campaigns/[id]/participation`, `app/api/campaigns/[id]/renew`, `app/api/campaigns/[id]/snapshot`, `app/api/campaigns/[id]/stats`, `app/api/campaigns/[id]/variables`
- **Carnet de bord relationnel (7 routes) :** `app/api/carnet`, `app/api/carnet/journal`, `app/api/carnet/journal/[id]`, `app/api/carnet/life-events`, `app/api/carnet/meteo`, `app/api/carnet/plan`, `app/api/carnet/relations`
- **Crons (3 routes) :** `app/api/cron/binome`, `app/api/cron/campaigns`, `app/api/cron/close-campaigns` *(Incohérences de vérification de secret et timing-unsafe)*
- **Gamification & Profils (4 routes) :** `app/api/demographics/renew`, `app/api/gamification/complete`, `app/api/profile/change-situation`, `app/api/v1/demographics`
- **Agent IRIS (3 routes) :** `app/api/iris/conversation`, `app/api/iris/conversation/[id]/message`, `app/api/iris/explication`
- **Notifications & Observatoire (2 routes) :** `app/api/notifications`, `app/api/observatoire`
- **Bilan IQRH / Évaluation (6 routes) :** `app/api/ordonnances/[userId]`, `app/api/questionnaire/start`, `app/api/questionnaire/save`, `app/api/questionnaire/submit`, `app/api/questions`, `app/api/resultats/[userId]`
- **Stripe & Abonnements (2 routes) :** `app/api/stripe/checkout`, `app/api/stripe/webhook`
- **Superadmin (3 routes) :** `app/api/superadmin/organizations`, `app/api/superadmin/users`, `app/api/superadmin/users/[id]`
- **API V1 Publique & Settings (6 routes) :** `app/api/v1/business/lead`, `app/api/v1/business/register`, `app/api/v1/upload`, `app/api/v1/user/settings`, `app/api/v1/users/register`

---

### 2. Cartographie des Services (`src/lib` - 26 fichiers)
1. `src/lib/adminStats.ts`
2. `src/lib/api.ts`
3. `src/lib/auth.ts`
4. `src/lib/env.ts`
5. `src/lib/gamification.ts`
6. `src/lib/get-stripe.ts`
7. `src/lib/logger.ts`
8. `src/lib/mail.ts`
9. `src/lib/notifications.ts`
10. `src/lib/pricing.ts`
11. `src/lib/prisma.ts`
12. `src/lib/rate-limit.ts`
13. `src/lib/stripe.ts`
14. `src/lib/tokens.ts`
15. `src/lib/constants/dashboard.ts`
16. `src/lib/binome/matching-service.ts`
17. `src/lib/gamification/gamification-service.ts`
18. `src/lib/iqrh/calculation-service.ts`
19. `src/lib/iqrh/icr-calculation-service.ts`
20. `src/lib/iqrh/prescription-service.ts`
21. `src/lib/iqrh/profile-calculation-service.ts`
22. `src/lib/iqrh/questionnaire-service.ts`
23. `src/lib/iqrh/result-service.ts`
24. `src/lib/iqrh/schemas.ts`
25. `src/lib/iqrh/types.ts`
26. `src/lib/iris/context-builder.ts`

---

### 3. État des Tests Existants
- **Framework de test :** Aucun framework de tests automatisés n'est installé (`vitest`, `jest`, etc. sont absents de `package.json`).
- **Scripts manuels :** `prisma/e2e-test.ts`, `scratch/test-matching.ts`, `scratch/test_obs.js`, `scratch-test.ts`, `test-login.js`, `test-register.js`.

---

### 4. Analyse Critique de `scripts/run-beta-experiment.ts`
- **Fausse assertion sur les participants :** La mention « 84 participants réels » est factuellement inexacte : les réponses Likert sont synthétiques, générées via la constante `PROFILE_PROFILES_WEIGHTS` (L62-74).
- **Constantes de résultats injectées :**
  - Recommandations (L686-689) : `p1Sum += 0.60`, `p3Sum += 0.41`, `p5Sum += 0.34`, `mapSum += 0.47`.
  - Évaluation IRIS (L779-786) : Notes et métriques codées en dur (`respectLimites: 4.6`, `interRaterKappa: 0.61`, `avgSessionCostUsd: 0.004`).
  - Enquête UX (L829-840) : Moyennes codées en dur.
- **Simulations d'échanges IRIS (L739-758) :** Textes insérés directement en base de données sans jamais requêter le LLM ni tester de vrais filtres.

---

### 5. Réponses aux Points Ouverts de l'Audit

#### (a) Atomicité de `GamificationService.completeChallenge`
- **Fichier:Ligne :** `src/lib/gamification/gamification-service.ts:23-85`
- **Défaut :** Non atomique. Une vérification applicative `if (item.status === "COMPLETED")` précède les `update` de la prescription et des points utilisateur, sans transaction interactive ni condition SQL atomique. Vulnérable à la duplication de points sous concurrence.

#### (b) Code HTTP dépassement quota IRIS
- **Fichier:Ligne :** `app/api/iris/conversation/[id]/message/route.ts:87-90` et `106-110`
- **Défaut :** Renvoie `403` (Forbidden). Le renouvellement est mensuel (`isNewMonth` L79-82) et non quotidien ("5 par jour").

#### (c) Filtres de sécurité IRIS & 3114
- **Fichier:Ligne :** `app/api/iris/conversation/[id]/message/route.ts:123-177`
- **Défaut :** Aucun filtre logiciel d'entrée ni de sortie. Tout repose sur le prompt système. Le 3114 n'existe pas dans le moteur conversationnel d'IRIS (uniquement dans `prisma/link-office-library.json:17421` et en texte statique dans le script de simulation `scripts/run-beta-experiment.ts:752`).

#### (d) Formule de `MatchingService`
- **Fichier:Ligne :** `src/lib/binome/matching-service.ts:4-8` et `159-178`
- **Formule :** Base = 50. Bonus synergie = 60 * 0.5 (+30). Bonus similarité = 40 * 0.5 (+20). Seuil minimal = 75. La synergie seule produit 80 (éligible). La similarité seule produit 70 (refusé car < 75).

#### (e) Protection d'organisation (`organizationId`)
- **Fichier:Ligne :** `app/api/admin/users/export/route.ts:6-41` (🚨 Pas d'authentification)
- **Fichier:Ligne :** `app/api/b2b/stats/route.ts:181-182` (🚨 Si `campaignId` renseigné, le filtre d'organisation est escamoté, fuite cross-tenant)
- **Fichier:Ligne :** `app/api/b2g/stats/route.ts:42` (`ANONYMITY_THRESHOLD = 0`, brisant le k-anonymat)
- **Fichier:Ligne :** `app/api/admin/barometre/route.ts:60-108` (Pas de seuil de k-anonymat)

---

## Décisions Produit Validées par l'Utilisateur
- **DÉCISION 1.2 :** Option A retenue — Règle stricte de suppression (refus de tout sous-groupe croisé < 5 et masquage des cellules faibles).
- **DÉCISION 2.2 :** Option A retenue — Streaming en direct via `streamText` (Time-to-first-token < 300 ms).
- **DÉCISION 2.4 :** Option A retenue — Quota de 5 messages par jour calendaire (reset 00:00 UTC) et code HTTP 402 (Payment Required).
- **DÉCISION 3.2 :** Option A retenue — Renormalisation à 100 via le ratio `100 / 85` pour garantir la plage `[0, 100]`.
- **DÉCISION 3.6 :** Option A retenue — Maintien du filtrage optimisé par règles et métadonnées (latence < 5 ms, 0 surcoût d'infrastructure).

---

## Phase 1 : Sécurité et Confidentialité (Corrections Appliquées & Preuves)

### 1.1 Centralisation du seuil de k-anonymat (`ANONYMITY_THRESHOLD = 5`)
- **Fichier / Lignes avant :**
  - `app/api/b2g/stats/route.ts:42` (`const ANONYMITY_THRESHOLD = 0;`)
  - `app/api/b2b/stats/route.ts:40` (constante locale dupliquée)
  - `app/api/admin/barometre/route.ts:60` (aucun seuil de k-anonymat, fuite dès 1 répondant)
  - `app/api/observatoire/route.ts:41` (aucun seuil de k-anonymat)
  - `app/api/campaigns/[id]/stats/route.ts:22` (constante locale dupliquée)
  - `app/api/campaigns/[id]/export/route.ts:8` (constante locale dupliquée)
- **Défaut :** Risque de ré-identification directe des agents de collectivités territoriales (B2G) et des salariés de petites équipes (B2B). En B2G, le seuil était neutralisé à 0.
- **Correction :**
  - Création du module unique [src/lib/privacy.ts](file:///d:/Projects/link-office/src/lib/privacy.ts) exportant `ANONYMITY_THRESHOLD = 5`, `isSampleAnonymized()`, `anonymizeCell()`, `validateCrossFilterSample()`, et `createAnonymityBlockedResponse()`.
  - Remplacement de toutes les occurrences locales par l'import partagé.
  - Activation du blocage sur `b2g/stats`, `b2b/stats`, `admin/barometre`, `campaigns/[id]/stats`, et `observatoire`.
- **Test qui le prouve :** `tests/security/privacy.test.ts` (5 tests unitaires passés avec succès).

### 1.2 Protection contre le recoupement d'agrégats (Décision 1.2 Option A)
- **Fichier / Lignes :**
  - `src/lib/privacy.ts:31-64`
  - `app/api/b2b/stats/route.ts:324-405`
  - `app/api/admin/barometre/route.ts:114-124`
- **Défaut :** La différence entre deux requêtes successives avec ou sans filtre (ex. filtre genre ou tranche d'âge) permettait d'isoler un micro-groupe de 1 à 4 personnes et de déduire leurs scores individuels.
- **Correction :**
  - Application de la règle stricte de suppression : tout sous-groupe issu de filtres croisés ayant un effectif $0 < n < 5$ est bloqué.
  - Masquage systématique des cellules de ventilation (facteurs de risque, facteurs protecteurs, besoins dominants, profils et moments de vie) ayant un effectif inférieur à 5.
- **Test qui le prouve :** `tests/security/privacy.test.ts` et `tests/security/cross-tenant-access.test.ts`.

### 1.3 Sécurisation des routes Cron (`app/api/cron/*`) et `vercel.json`
- **Fichiers / Lignes avant :**
  - `app/api/cron/binome/route.ts:7-11` (`cronSecret !== process.env.CRON_SECRET` via `?secret=`)
  - `app/api/cron/campaigns/route.ts:8-12` (`cronSecret !== process.env.CRON_SECRET` via `?secret=`)
  - `app/api/cron/close-campaigns/route.ts:50-56` (comparaison non constante `!==`, bypass si non configuré)
  - `vercel.json:4,8,12` (`path: "/api/cron/...?secret=YOUR_CRON_SECRET"`)
- **Défaut :** Exposition du secret dans les journaux d'accès HTTP et les URL de requêtes ; vulnérabilité aux attaques temporelles (timing attacks) par comparaison lexicographique standard `!==`.
- **Correction :**
  - Création de [src/lib/cron.ts](file:///d:/Projects/link-office/src/lib/cron.ts) avec `validateCronSecret(request)`.
  - Comparaison cryptographique à temps constant via `crypto.timingSafeEqual` sur `Authorization: Bearer <CRON_SECRET>`.
  - Nettoyage des URL dans [vercel.json](file:///d:/Projects/link-office/vercel.json) pour supprimer les paramètres d'URL.
- **Test qui le prouve :** `tests/security/cron.test.ts` (6 tests unitaires passés avec succès).

### 1.4 Sécurisation du script de build et cycle de migration
- **Fichier / Lignes avant :** [package.json:7](file:///d:/Projects/link-office/package.json#L7)
  `"build": "prisma db push --accept-data-loss && next build"`
- **Défaut :** Risque critique de perte irrémédiable de données en production : `db push --accept-data-loss` applique les modifications de schéma sans enregistrer de migrations et supprime silencieusement les colonnes ou tables conflictuelles lors du build.
- **Correction :**
  - Remplacement par `"build": "prisma generate && next build"`.
  - Ajout du script de déploiement sécurisé `"db:deploy": "prisma migrate deploy"`.

### 1.5 Tableau d'Audit d'Accès & Correction des Trous d'Isolation Multi-Tenant

| Route | Méthode | Rôle Requis | Source de l'Organisation | Vérification de Propriété | Statut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `admin/users/export` | GET | `SUPER_ADMIN` | N/A (Global) | **Corrigé :** Session requise, rôle SUPER_ADMIN obligatoire. | Corrigé |
| `b2b/stats` | GET | `ADMIN_B2B`, `SUPER_ADMIN` | `user.organizationId` | **Corrigé :** Si `campaignId` renseigné, vérification stricte `campaign.organizationId === user.organizationId` (403 si étranger). | Corrigé |
| `b2g/stats` | GET | `ADMIN_B2G`, `SUPER_ADMIN` | `user.organizationId` | Filtrage sur `user.organizationId` et k-anonymat rétabli à 5. | Corrigé |
| `admin/barometre` | GET | `SUPER_ADMIN` | N/A (Global) | Filtrage k-anonymat >= 5 appliqué, masquage des départements < 5. | Corrigé |
| `campaigns/[id]/stats` | GET | `ADMIN_*`, `SUPER_ADMIN` | `campaign.organizationId` | Vérifie `campaign.organizationId === user.organizationId` (403 sinon). | Conforme |
| `campaigns/[id]/export` | GET | `ADMIN_*`, `SUPER_ADMIN` | `campaign.organizationId` | Vérifie `campaign.organizationId === user.organizationId` (403 sinon). | Conforme |
| `actions/[id]` | PATCH, DELETE | `ADMIN_*`, `SUPER_ADMIN` | `user.organizationId` | **Corrigé :** `existingAction.organizationId !== user.organizationId` (404 sinon), SUPER_ADMIN autorisé. | Corrigé |
| `ordonnances/[userId]` | GET | Propriétaire, `SUPER_ADMIN` | `user.id` | **Corrigé :** Retrait du bypass `ADMIN_B2B` : seules les personnes concernées et le SUPER_ADMIN ont accès aux ordonnances personnelles. | Corrigé |
| `resultats/[userId]` | GET | Propriétaire, `SUPER_ADMIN` | `user.id` | Vérifie `session.user.id === userId \|\| SUPER_ADMIN` (403 sinon). | Conforme |
| `carnet/journal/[id]` | PUT, DELETE | Propriétaire | `journalEntry.userId` | Vérifie `existing.userId === session.user.id` (404 sinon). | Conforme |
| `binome/[id]/checkin` | POST | Membre du binôme | `binome.userAId/BId` | Vérifie `session.user.id === userAId \|\| userBId` (403 sinon). | Conforme |

- **Test qui le prouve :** `tests/security/cross-tenant-access.test.ts` (7 tests d'accès croisé validés).

### 1.6 Analyse du Rate Limiting (`auth/register`)
- **Fichier :** `src/lib/rate-limit.ts`
- **Constat :** L'implémentation actuelle repose sur une `Map` en mémoire de processus. Dans un environnement serverless (Vercel Lambdas), les instances sont recyclées lors des cold starts et la mémoire n'est pas partagée entre les conteneurs concurrents.
- **Recommandation pour la production :** Déployer un store distribué Redis avec Upstash (`@upstash/ratelimit` + `@upstash/redis`) ou une table PostgreSQL `RateLimitAttempt` avec nettoyage périodique.

### 1.7 Déclaration des Dépendances & Tests Automatisés
- Ajout de `zod` (`^4.6.5` / `^3.x`) dans `dependencies` de `package.json`.
- Ajout de `vitest` (`^3.2.7`) et `fast-check` (`^4.5.3`) dans `devDependencies`.
- Ajout des scripts `"test": "vitest run"` et `"test:watch": "vitest"`.

---

## Preuves d'Exécution Réelles (Sorties de Terminal)

### Sortie réelle de Vitest (`npm test`) :
```text
> link-office@0.1.0 test
> vitest run

 RUN  v3.2.7 D:/Projects/link-office

 ✓ tests/security/cron.test.ts (6 tests) 6ms
 ✓ tests/security/privacy.test.ts (5 tests) 10ms
 ✓ tests/security/cross-tenant-access.test.ts (7 tests) 10ms

 Test Files  3 passed (3)
      Tests  18 passed (18)
   Start at  13:52:02
   Duration  704ms (transform 206ms, setup 0ms, collect 452ms, tests 26ms, environment 0ms, prepare 387ms)
```

### Sortie réelle du TypeCheck (`npx tsc --noEmit`) :
```text
Code de retour : 0 (0 erreur de compilation TypeScript)
```

### Sortie réelle du Linter (`npx eslint . --quiet`) :
```text
Code de retour : 0 (0 erreur de linting)
```
