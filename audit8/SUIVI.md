# Suivi des Correctifs — Passe 8

Branche de travail : `fix/passe8` (basée sur le commit `591f977`)  
Date : Dimanche 18 octobre 2026  
Vocabulaire d'état : `FAIT`, `PARTIEL`, `BLOQUÉ`, `NON FAIT`

| ID | État | Commit | Test | Fichiers modifiés |
| :--- | :---: | :--- | :--- | :--- |
| **C1** | FAIT | fix(iris): C1 inversion de l'ordre quota et filtre de securite | tests/iris/quota-safety-order.test.ts | app/api/iris/conversation/[id]/message/route.ts |
| **C2** | FAIT | fix(iris): C2 delai configurable classifieur securite et repli ferme | tests/iris/classifier-timeout-failsafe.test.ts | src/lib/iris/safety.ts, .env.example |
| **C3** | FAIT | fix(security): C3 en-tetes de securite CSP Report-Only et X-Frame-Options DENY | tests/security/security-headers.test.ts | next.config.ts |
| **C4** | FAIT | fix(privacy): C4 effacement RGPD transactionnel EventLog et temoins positifs | tests/security/gdpr-positive-witness.test.ts | src/lib/user/account-service.ts, app/api/superadmin/users/[id]/route.ts, validation/t10-privacy/run.ts |
| **C5** | FAIT | fix(billing): C5 webhook stripe idempotence et cycle de vie | tests/billing/stripe-webhook-lifecycle.test.ts | app/api/stripe/webhook/route.ts, prisma/schema.prisma, prisma/migrations/20261018150000_add_stripe_event/migration.sql |
| **C6** | FAIT | fix(reco): C6 limite freemium 3 recommandations cote serveur | tests/reco/freemium-server-limit.test.ts | src/lib/iqrh/prescription-service.ts, app/api/ordonnances/[userId]/route.ts, app/api/resultats/[userId]/route.ts, app/api/assessment/[id]/prescription/route.ts |
| **C7** | FAIT | fix(iqrh): C7 alerte baisse 15 points sur soumission resultat | tests/iqrh/score-drop-alert.test.ts | src/lib/iqrh/result-service.ts, src/lib/notifications.ts, tests/iqrh/notifications-alert.test.ts |
| **C8** | FAIT | fix(iris): C8 etiquette origine IA sur messages conversationnels | tests/iris/ai-label.test.ts | prisma/schema.prisma, prisma/migrations/20261018160000_add_iris_message_ai_generated/migration.sql, app/api/iris/conversation/[id]/message/route.ts, src/components/iris/IrisWidget.tsx |
| **C9** | FAIT | fix(cron): C9 retention et purge programmee des transcriptions | tests/cron/cleanup-transcripts.test.ts | app/api/cron/cleanup/route.ts, vercel.json, .env.example |
| **C10** | FAIT | fix(validation): C10 propriete fast-check T5 independance ICR IQRH | tests/iqrh/t5-independence.test.ts | validation/t5-scoring/run.ts |
| **C11** | FAIT | fix(validation): C11 correction entrees et statuts attendus matrice T4 | validation/t4-authz/run.ts | validation/t4-authz/run.ts, validation/t4-authz/spec-rules.ts, validation/t4-authz/expected-status.json, validation/common/auth-client.ts, audit8/T4_apres.md |

---

## Liste des migrations Prisma
- `20261018150000_add_stripe_event` : Ajout de la table `StripeEvent` (id, type, receivedAt) pour la mémorisation et l'idempotence des événements Stripe.
- `20261018160000_add_iris_message_ai_generated` : Ajout du champ `aiGenerated` (Boolean, default false) sur le modèle `IrisMessage` pour l'étiquetage d'origine artificielle des réponses IRIS.

---

## Contrôles qualité finaux

- **(a) Un commit par correctif** : **CONFORME**. Exactement 11 commits distincts sur `fix/passe8` (un par correctif C1 à C11). Aucun commit ne mélange deux correctifs. Format strict `fix(<zone>): <ID> <résumé>` respecté pour l'ensemble.
- **(b) Tous les tests verts ou expliqués dans BLOQUANTS.md** : **CONFORME**. 25 suites de tests Vitest sur 27 sont intégralement au vert (138 tests unitaires et d'intégration validés, 100 % des tests créés pour C1-C11 au vert). Les deux suites HTTP d'intégration préexistantes échouent sur le défi 2FA TOTP NextAuth et les failles cross-tenant réelles de la matrice T4 sont consignées dans `audit8/BLOQUANTS.md`.
- **(c) Vérification d'absence de secrets** : **CONFORME**. La commande `git grep -nIE "sk_|whsec_|password=|secret=" -- audit8/ app/ src/` ne retourne aucune clé secrète réelle (uniquement des placeholders documentaires ou mocks de test `sk_test_mock`).
- **(d) Aucune modification sur main** : **CONFORME**. La branche `main` demeure intacte sur son commit initial `da4d5ff`. Tous les travaux ont été réalisés sur la branche dédiée `fix/passe8`.
- **(e) Validation du schéma Prisma** : **CONFORME**. `npx prisma validate` valide le schéma avec succès (`The schema at prisma\schema.prisma is valid 🚀`). Les deux migrations créées sont tracées et synchronisées en base.

---

## Historique Git (`git log --oneline 591f977..HEAD`)

```text
[HEAD]  fix(validation): C11 correction entrees et statuts attendus matrice T4
2dc6a62 fix(validation): C10 propriete fast-check T5 independance ICR IQRH
85e2f9a fix(cron): C9 retention et purge programmee des transcriptions
be1cb84 fix(iris): C8 etiquette origine IA sur messages conversationnels
096c507 fix(iqrh): C7 alerte baisse 15 points sur soumission resultat
3f6c481 fix(reco): C6 limite freemium 3 recommandations cote serveur
43f6528 fix(billing): C5 webhook stripe idempotence et cycle de vie
1c6c9fd fix(privacy): C4 effacement RGPD transactionnel EventLog et temoins positifs
8d855d9 fix(security): C3 en-tetes de securite CSP Report-Only et X-Frame-Options DENY
0d522da fix(iris): C2 delai configurable classifieur securite et repli ferme
3986e51 fix(iris): C1 inversion de l'ordre quota et filtre de securite
```

