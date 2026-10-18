# Lectures de ses Propres Données — Self-Reads (Tâche C2 / Question Q1)

Date : 18 octobre 2026  
Statut : **En attente d'arbitrage auteur (Question Q1)**  
Fichier décisionnel vérifié : `audit11/DECISIONS_AUTEUR.md` (absent)  
Règle appliquée : Aucune modification de la matrice d'autorisation sans validation expresse de l'auteur. Inscription de la liste des cellules concernées dans `audit11/QUESTIONS_AUTEUR.md`.

---

## 1. Contexte du Problème

Dans le harnais de test HTTP de la matrice T4 (`validation/t4-authz/run.ts`), lorsqu'un rôle est testé sur une route paramétrée par un identifiant utilisateur (`[userId]` ou `[id]`), le harnais injecte les identifiants de l'utilisateur **actuellement connecté** :
- Pour `B2C` : injecte le `userId` du compte B2C (`cmv10wzey0001v6w8pn1sw93e`).
- Pour `ORG_ADMIN` : injecte le `userId` de l'administrateur de l'Organisation A (`cmuyj285g0004v6h8y3bm11p4`).
- Pour `CROSS_ADMIN` : injecte le `userId` de l'administrateur de l'Organisation B (`cmuyj288e001sv6h8koubxnap`).

L'appelant demande donc **ses propres données personnelles** (self-read). Or, la matrice T4 attendait un rejet `403` ou `403_OR_404` pour les administrateurs et pour le B2C sur ces routes, sous l'hypothèse erronée qu'un administrateur ne devait pas pouvoir accéder à des bilans individuels.

Dans le code de l'application, tout utilisateur authentifié (salarié, citoyen B2C ou administrateur) possède le droit légitime d'accéder à son propre bilan personnel (`session.user.id === targetUserId`). En revanche, l'accès au bilan d'un tiers est strictement interdit (HTTP 403).

---

## 2. Liste des Six Routes de Consultation de ses Propres Données

| N° | Route | Méthode | Rôle autorisé dans le code | Rôle testé | Attente actuelle dans la matrice | Statut observé | Justification tirée du code source |
| :---: | :--- | :---: | :--- | :--- | :---: | :---: | :--- |
| **1** | `/api/resultats/[userId]` | GET | Tout utilisateur connecté pour son propre `userId` (`session.user.id === userId`), ainsi que `SUPER_ADMIN`. | `B2C`<br>`ORG_ADMIN`<br>`CROSS_ADMIN` | `403`<br>`403`<br>`403_OR_404` | **200** | [app/api/resultats/[userId]/route.ts:L42](file:///d:/Projects/link-office/app/api/resultats/%5BuserId%5D/route.ts#L42)<br>`if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN") return 403;` |
| **2** | `/api/ordonnances/[userId]` | GET | Tout utilisateur connecté pour son propre `userId` (`session.user.id === userId`), ainsi que `SUPER_ADMIN`. | `B2C`<br>`ORG_ADMIN`<br>`CROSS_ADMIN` | `403`<br>`403`<br>`403_OR_404` | **200** | [app/api/ordonnances/[userId]/route.ts:L37](file:///d:/Projects/link-office/app/api/ordonnances/%5BuserId%5D/route.ts#L37)<br>`if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN") return 403;` |
| **3** | `/api/assessment/[id]/prescription` | GET | Tout utilisateur connecté pour sa propre évaluation (`session.user.id === targetUserId`), ainsi que `SUPER_ADMIN`. | `B2C`<br>`ORG_ADMIN`<br>`CROSS_ADMIN` | `403`<br>`403`<br>`403_OR_404` | **200** | [app/api/assessment/[id]/prescription/route.ts:L62](file:///d:/Projects/link-office/app/api/assessment/%5Bid%5D/prescription/route.ts#L62)<br>`if (session.user.id !== targetUserId && session.user.role !== "SUPER_ADMIN") return 403;` |
| **4** | `/api/binome/status` | GET | Tout utilisateur connecté (`session.user.id`) consultant le statut de son propre binôme. | `ORG_ADMIN`<br>`CROSS_ADMIN` | `403`<br>`403` | **200** | [app/api/binome/status/route.ts:L22](file:///d:/Projects/link-office/app/api/binome/status/route.ts#L22)<br>`where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] }` |
| **5** | `/api/b2b/organization` | GET | Administrateur rattaché consultant sa propre organisation (`session.user.organizationId`). | `CROSS_ADMIN` | `403_OR_404` | **200** | [app/api/b2b/organization/route.ts:L15](file:///d:/Projects/link-office/app/api/b2b/organization/route.ts#L15)<br>`where: { id: user.organizationId }` (Organisation B pour CROSS_ADMIN) |
| **6** | `/api/b2b2c/orientation` | GET | Tout utilisateur connecté demandant ses propres partenaires d'orientation territoriale. | `B2C`<br>`CROSS_ADMIN` | `403_OR_404`<br>`403_OR_404` | **200** | [app/api/b2b2c/orientation/route.ts:L18](file:///d:/Projects/link-office/app/api/b2b2c/orientation/route.ts#L18)<br>`const session = await auth(); if (!session) return 401;` |

---

## 3. Comportement Appliqué selon la Consigne

- `audit11/DECISIONS_AUTEUR.md` n'existant pas, **la matrice d'autorisation n'a pas été modifiée**.
- Les 13 cellules concernées par ces 6 routes (qui retournent HTTP 200 en raison de la lecture de ses propres données mais pour lesquelles la matrice attendait 403 ou 403_OR_404) sont inscrites et documentées dans `audit11/QUESTIONS_AUTEUR.md` sous la question Q1.
- Dès que l'auteur aura validé l'arbitrage (soit aligner l'attente sur `200` pour la consultation de soi, soit modifier le harnais de test pour injecter un `targetUserId` tiers et valider le `403`), la matrice pourra être mise à jour sans ambiguïté.
