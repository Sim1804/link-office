# Suivi des Correctifs — Passe 8

Branche de travail : `fix/passe8` (basée sur le commit `591f977`)  
Date : Dimanche 18 octobre 2026  
Vocabulaire d'état : `FAIT`, `PARTIEL`, `BLOQUÉ`, `NON FAIT`

| ID | État | Commit | Test | Fichiers modifiés |
| :--- | :---: | :--- | :--- | :--- |
| **C1** | FAIT | fix(iris): C1 inversion de l'ordre quota et filtre de securite | tests/iris/quota-safety-order.test.ts | app/api/iris/conversation/[id]/message/route.ts |
| **C2** | FAIT | fix(iris): C2 delai configurable classifieur securite et repli ferme | tests/iris/classifier-timeout-failsafe.test.ts | src/lib/iris/safety.ts, .env.example |
| **C3** | NON FAIT | — | — | — |
| **C4** | NON FAIT | — | — | — |
| **C5** | NON FAIT | — | — | — |
| **C6** | NON FAIT | — | — | — |
| **C7** | NON FAIT | — | — | — |
| **C8** | NON FAIT | — | — | — |
| **C9** | NON FAIT | — | — | — |
| **C10** | NON FAIT | — | — | — |
| **C11** | NON FAIT | — | — | — |

---

## Liste des migrations Prisma
*(Chaque migration créée au cours de la passe 8 sera listée ici avec son nom et son objet)*

---

## Contrôles qualité finaux
*(Seront complétés à l'issue de tous les correctifs)*
- (a) Un commit par correctif : EN ATTENTE
- (b) Tous les tests verts ou expliqués dans BLOQUANTS.md : EN ATTENTE
- (c) Vérification d'absence de secrets : EN ATTENTE
- (d) Aucune modification sur main : EN ATTENTE
- (e) Validation du schéma Prisma : EN ATTENTE
