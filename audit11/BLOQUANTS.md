# Points Bloquants et Failles Potentielles — Passe 11

Ce document recense les échecs de tests préexistants, contraintes d'infrastructure bloquantes et divergences de matrice d'autorisation qualifiées de « failles potentielles » (règle C4).

---

## 1. Failles Potentielles de la Matrice d'Autorisation (39 cellules « Interdit mais statut 2xx »)

Lors du rejeu de la matrice T4 (tâche C4), 39 cellules ont retourné HTTP 200 alors que la matrice attendait un code d'erreur (`403` ou `403_OR_404`).

L'analyse de sécurité approfondie (`audit11/scripts/analyze-c4.ts`) confirme qu'**aucune de ces 39 cellules ne constitue une fuite de données de l'Organisation A vers un tiers** (`bodyContainsOrgA: false` sur les 39 cellules).

Ces 39 cellules se décomposent en deux familles en attente d'arbitrage auteur :
1. **Lectures de ses propres données — Self-Reads (17 cellules — Question Q1)** :
   - Routes : `GET /api/resultats/[userId]`, `GET /api/ordonnances/[userId]`, `GET /api/assessment/[id]/prescription`, `GET /api/binome/status`, `GET /api/b2b/organization`, `GET /api/actions`, `GET /api/actions/export`, `GET /api/b2b/stats`, `GET /api/b2b2c/orientation`.
   - Rôles : `B2C`, `ORG_ADMIN`, `CROSS_ADMIN`.
   - Cause : Le harnais de test injecte le `userId` de l'appelant lui-même. L'appelant consulte son propre bilan ou sa propre organisation, ce qui est légitime dans le code applicatif.
   - Arbitrage requis (Q1) : Corriger l'attente en `200` pour la consultation de soi, ou modifier le harnais pour injecter un identifiant tiers et valider le `403`.
2. **SUPER_ADMIN sur routes de tenant (22 cellules — Question Q2)** :
   - Routes : `/api/actions`, `/api/campaigns/[id]`, `/api/b2b/barometre`, `/api/b2b/invite`, `/api/b2b/stats`, etc.
   - Rôle : `SUPER_ADMIN`.
   - Cause : Le code applicatif accorde une exemption explicite au rôle `SUPER_ADMIN` (`user.role === "SUPER_ADMIN"`). La matrice attendait un rejet `403_OR_404` en raison de l'absence de session d'organisation rattachée.
   - Arbitrage requis (Q2) : Confirmer si le SUPER_ADMIN doit conserver ces prérogatives globales d'exploitation ou si un cloisonnement strict doit lui être imposé.

---

## 2. Tests Préexistants Défaillants

- **Aucun test préexistant défaillant** : l'ensemble des 31 suites de tests vitest (163 tests) et les vérifications TypeScript (`npx tsc --noEmit`) et ESLint (`npm run lint`) sont au vert.

