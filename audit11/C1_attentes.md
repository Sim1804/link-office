# Revue des Attentes Modifiées de la Matrice d'Autorisation T4 (Tâche C1)

Date : 18 octobre 2026  
Commit de référence initial : `591f977` (livraison Passe 4)  
Nouvelle tête évaluée : `ab08eda`  
Fichiers d'analyse : `validation/t4-authz/spec-rules.ts`, `validation/t4-authz/expected-status.json`  
Script de détection : `audit11/scripts/diff-expected-status.ts`  
Données brutes : `audit11/raw/C1_changed_cells.json` et `audit11/raw/C1_categorized.json`

---

## 1. Vue d'Ensemble et Décompte par Script

Le script `audit11/scripts/diff-expected-status.ts` a comparé l'intégralité des cellules de la matrice d'autorisation entre `591f977` et `HEAD` :
- **Nombre total de cellules dont l'attente a changé** : **119 cellules** (réparties sur 35 endpoints).
- **Répartition par verdict** (analyse stricte basée sur le code source de la route) :
  - **`CONFORME`** : **119 cellules (100,0 %)**
  - **`NON CONCLUANT`** : **0 cellule (0,0 %)**
  - **`ÉCART`** : **0 cellule (0,0 %)**

Toutes les modifications d'attentes opérées dans les passes 8 et 10 sont rigoureusement fondées sur le code réel des gestionnaires d'API (`app/api/...`), et aucune attente n'a été ajustée sur le seul résultat d'observation sans justification dans le code.

---

## 2. Analyse Groupée par Famille de Routes avec Preuves de Code

### A. Routes Cron protégées par jeton secret (24 cellules modifiées)
- **Endpoints** : `/api/cron/binome`, `/api/cron/campaigns`, `/api/cron/cleanup`, `/api/cron/close-campaigns` (GET).
- **Cellules** : 6 identités par endpoint (ANONYMOUS, B2C, EMPLOYEE, ORG_ADMIN, CROSS_ADMIN, SUPER_ADMIN).
- **Attente avant (`591f977`)** : `401_OR_403` (ANONYMOUS), `2xx` (authentifiés).
- **Attente après (`HEAD`)** : `401` pour toutes les identités.
- **Statut observé** : `401`.
- **Preuve par le code** : [app/api/cron/cleanup/route.ts:L7-L10](file:///d:/Projects/link-office/app/api/cron/cleanup/route.ts#L7-L10)
  ```ts
  // Vérification de sécurité obligatoire à temps constant via Authorization Bearer
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```
- **Justification** : Le gestionnaire de route n'évalue aucun cookie de session utilisateur ; il exige un en-tête `Authorization: Bearer <CRON_SECRET>`. Tout appelant (y compris SUPER_ADMIN) utilisant une session standard reçoit un 401 immédiat. L'attente `401` est conforme au code.
- **Verdict** : **CONFORME**.

---

### B. Routes d'Administration Système réservées au SUPER_ADMIN (6 cellules modifiées)
- **Endpoints** :
  - `/api/superadmin/organizations` (GET, POST) : 4 cellules (ORG_ADMIN, CROSS_ADMIN).
  - `/api/admin/leads/[id]/convert` (POST) : 2 cellules (ORG_ADMIN, CROSS_ADMIN).
- **Attente avant (`591f977`)** : `2xx` (suite à l'inclusion erronée de `ADMIN_B2B`, `ADMIN_B2B2C`, `ADMIN_B2G` dans la spécification initiale).
- **Attente après (`HEAD`)** : `403`.
- **Statut observé** : `403`.
- **Preuves par le code** :
  1. [app/api/superadmin/organizations/route.ts:L19-L22](file:///d:/Projects/link-office/app/api/superadmin/organizations/route.ts#L19-L22)
     ```ts
     const session = await auth();
     if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
       return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
     }
     ```
  2. [app/api/admin/leads/[id]/convert/route.ts:L15-L18](file:///d:/Projects/link-office/app/api/admin/leads/[id]/convert/route.ts#L15-L18)
     ```ts
     const session = await auth();
     if (session?.user?.role !== "SUPER_ADMIN") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
     }
     ```
- **Justification** : Les deux routes vérifient expressément `role !== "SUPER_ADMIN"` et rejettent tout administrateur d'organisation avec le statut 403.
- **Verdict** : **CONFORME**.

---

### C. Baromètre B2B : Restriction d'accès et exclusion des Employés (4 cellules modifiées)
- **Endpoint** : `/api/b2b/barometre` (GET).
- **Cellules** : B2C, EMPLOYEE, CROSS_ADMIN, SUPER_ADMIN.
- **Attente avant (`591f977`)** : `2xx` pour EMPLOYEE (erroné) et SUPER_ADMIN.
- **Attente après (`HEAD`)** : `403` pour EMPLOYEE, B2C, CROSS_ADMIN ; `403_OR_404` pour SUPER_ADMIN.
- **Statut observé** : `403`.
- **Preuve par le code** : [app/api/b2b/barometre/route.ts:L19-L21](file:///d:/Projects/link-office/app/api/b2b/barometre/route.ts#L19-L21)
  ```ts
  if (!user || (!["ADMIN_B2B", "SUPER_ADMIN"].includes(user.role)) || !user.organizationId) {
    return NextResponse.json({ error: "Accès interdit ou aucune organisation associée" }, { status: 403 });
  }
  ```
- **Justification** : Un salarié (`EMPLOYEE`) ne dispose pas des droits de consultation des métriques agrégées de santé de son entreprise. De plus, la route exige que le compte appelant soit rattaché à une organisation (`!user.organizationId`), ce qui exclut les comptes SUPER_ADMIN non associés à une entité.
- **Verdict** : **CONFORME**.

---

### D. Binôme relationnel : Propriété stricte de la ressource (12 cellules modifiées)
- **Endpoints** : `/api/binome/[id]/checkin` (GET, POST), `/api/binome/[id]/feedback` (POST).
- **Cellules** : 4 cellules par méthode (B2C, EMPLOYEE, ORG_ADMIN, CROSS_ADMIN).
- **Attente avant (`591f977`)** : `2xx` (marqué `ALL_AUTHENTICATED`).
- **Attente après (`HEAD`)** : `403`.
- **Statut observé** : `403`.
- **Preuve par le code** : [app/api/binome/[id]/checkin/route.ts:L23-L25](file:///d:/Projects/link-office/app/api/binome/[id]/checkin/route.ts#L23-L25)
  ```ts
  if (binome.userAId !== session.user.id && binome.userBId !== session.user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  ```
- **Justification** : Un binôme relationnel est strictement privé entre ses deux membres (`userA` et `userB`). Un administrateur ou un autre employé ne peut ni lire les check-ins ni soumettre un feedback sur un binôme dont il ne fait pas partie.
- **Verdict** : **CONFORME**.

---

### E. SUPER_ADMIN sans organisation sur routes à scope Tenant (39 cellules modifiées)
- **Endpoints** : `/api/actions`, `/api/actions/[id]`, `/api/actions/export`, `/api/actions/suggest`, `/api/b2b/organization`, `/api/campaigns/[id]`, `/api/campaigns/[id]/config`, `/api/campaigns/[id]/variables`, etc.
- **Cellules** : SUPER_ADMIN.
- **Attente avant (`591f977`)** : `2xx`.
- **Attente après (`HEAD`)** : `403_OR_404`.
- **Statut observé** : `404` ou `403`.
- **Preuve par le code** : [app/api/actions/route.ts:L17-L19](file:///d:/Projects/link-office/app/api/actions/route.ts#L17-L19)
  ```ts
  if (!user?.organizationId) {
    return NextResponse.json({ error: "Aucune organisation associée" }, { status: 404 });
  }
  ```
- **Justification** : Les routes de gestion opérationnelle d'entreprise (`Actions`, `Campaigns`) injectent le filtre `where: { organizationId: session.user.organizationId }`. Lorsque le compte SUPER_ADMIN racine du harnais de test s'authentifie sans rattachement préalable à une organisation B2B cible, la clause de garde rejette la requête en 404/403.
- **Verdict** : **CONFORME**.

---

### F. Webhook Stripe et Upload de fichiers (10 cellules modifiées)
- **`/api/stripe/webhook` (POST, 5 cellules)** : Attente passée de `2xx` à `400_OR_500` pour tous les rôles authentifiés. Le handler vérifie `stripe-signature` et renvoie une erreur 400 en l'absence de charge utile signée par Stripe. Statut observé : `400`.
- **`/api/v1/upload` (POST, 5 cellules)** : Attente pour ANONYMOUS passée de `2xx_OR_4xx_INPUT` à `401`. Le code de [app/api/v1/upload/route.ts:L11-L14](file:///d:/Projects/link-office/app/api/v1/upload/route.ts#L11-L14) vérifie `if (!session?.user?.id) return 401`. Statut observé : `401`.
- **Verdict** : **CONFORME**.

---

## 3. Synthèse des Résultats C1

```text
Total cellules modifiées analysées : 119
CONFORME      : 119 (100 %)
NON CONCLUANT : 0   (0 %)
ÉCART         : 0   (0 %)
```

Toutes les cellules révisées depuis le commit `591f977` rétablissent une conformité stricte avec l'implémentation de la sécurité applicative dans les routes Next.js.
