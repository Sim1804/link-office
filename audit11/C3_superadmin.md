# SUPER_ADMIN et Résultats Individuels Cross-Tenant (Tâche C3 / Question Q2)

Date : 18 octobre 2026  
Statut : **En attente d'arbitrage auteur (Question Q2)**  
Fichier décisionnel vérifié : `audit11/DECISIONS_AUTEUR.md` (absent)  
Règle appliquée : Aucune modification des autorisations du SUPER_ADMIN sans réponse explicite de l'auteur. Inscription de la question dans `audit11/QUESTIONS_AUTEUR.md`.

---

## 1. Citation du Code et Clauses Laissant Passer le SUPER_ADMIN

L'analyse du code source des routes de résultats individuels et ordonnances identifie les clauses explicites d'exemption accordées au rôle `SUPER_ADMIN` :

### A. Route `GET /api/resultats/[userId]` (Scores IQRH, Complexité ICR, Profils psychométriques)
- **Fichier source** : [app/api/resultats/[userId]/route.ts:L39-L41](file:///d:/Projects/link-office/app/api/resultats/%5BuserId%5D/route.ts#L39-L41)
- **Extrait exact de code** :
  ```typescript
  if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Interdit — Secret statistique et confidentialité garantis." }, { status: 403 });
  }
  ```
- **Clause active** : `session.user.role !== "SUPER_ADMIN"`  
  Cette condition autorise expressément le `SUPER_ADMIN` à contourner la vérification de propriété (`session.user.id !== userId`) et à récupérer le rapport complet (`ResultService.byUser(userId)` qui inclut l'IQRH, l'ICR, le profil et l'ordonnance).

---

### B. Route `GET /api/ordonnances/[userId]` (Ordonnance Relationnelle individuelle)
- **Fichier source** : [app/api/ordonnances/[userId]/route.ts:L38-L40](file:///d:/Projects/link-office/app/api/ordonnances/%5BuserId%5D/route.ts#L38-L40)
- **Extrait exact de code** :
  ```typescript
  if (session.user.id !== userId && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Interdit — Données personnelles strictement confidentielles." }, { status: 403 });
  }
  ```
- **Clause active** : `session.user.role !== "SUPER_ADMIN"`  
  Cette condition exempte le `SUPER_ADMIN` de l'interdiction de lecture, lui permettant d'accéder aux recommandations et micro-défis individuels assignés à l'utilisateur.

---

### C. Route `GET /api/assessment/[id]/prescription` (Ordonnance via l'évaluation)
- **Fichier source** : [app/api/assessment/[id]/prescription/route.ts:L62-L64](file:///d:/Projects/link-office/app/api/assessment/%5Bid%5D/prescription/route.ts#L62-L64)
- **Extrait exact de code** :
  ```typescript
  if (session.user.id !== targetUserId && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  ```
- **Clause active** : `session.user.role !== "SUPER_ADMIN"`  
  Même mécanisme d'exemption globale pour le compte `SUPER_ADMIN`.

---

## 2. Établissement par Test des Routes Accessibles au SUPER_ADMIN Cross-Tenant

Le script `audit11/scripts/test-superadmin-individual.ts` a vérifié l'accès d'un compte racine `SUPER_ADMIN` (`superadmin@linkoffice.fr`) aux données personnelles d'un salarié d'une organisation distincte (`alice.richard@novatech-conseil.fr`, Organisation Novatech Conseil Paris) :

| Route | Donnée Individuelle Renvoyée | Statut Observé pour SUPER_ADMIN sur un Salarié Tiers | Accès Cross-Tenant Constaté |
| :--- | :--- | :---: | :---: |
| `GET /api/resultats/[userId]` | Scores IQRH (5 dimensions), score global, ICR (Indice de Complexité), profil psychométrique primaire et secondaire | **200 OK** | **OUI** |
| `GET /api/ordonnances/[userId]` | Ordonnance relationnelle (recommandations prescrites, micro-défis, statut de réalisation) | **200 OK** | **OUI** |
| `GET /api/assessment/[id]/prescription` | Prescription rattachée à une évaluation spécifique d'un salarié | **200 OK** | **OUI** |

---

## 3. Comportement Appliqué et Statut

Conformément à la règle impérative de la tâche C3 :
- Le fichier `audit11/DECISIONS_AUTEUR.md` n'existant pas, **les autorisations applicatives du SUPER_ADMIN n'ont pas été modifiées**.
- La question Q2 est consignée dans `audit11/QUESTIONS_AUTEUR.md` pour arbitrage formel :
  1. Si l'auteur confirme que le rôle `SUPER_ADMIN` est un rôle technique d'exploitation/support plateforme ayant accès global de maintenance : l'accès actuel est conforme à la spécification visée.
  2. Si l'auteur décide de restreindre cet accès pour respecter le secret statistique strict même vis-à-vis du super-administrateur : les clauses `&& session.user.role !== "SUPER_ADMIN"` devront être retirées après écriture des tests rouges correspondants.
