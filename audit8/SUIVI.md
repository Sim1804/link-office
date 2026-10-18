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
| **C10** | NON FAIT | — | — | — |
| **C11** | NON FAIT | — | — | — |

---

## Liste des migrations Prisma
- `20261018150000_add_stripe_event` : Ajout de la table `StripeEvent` (id, type, receivedAt) pour la mémorisation et l'idempotence des événements Stripe.
- `20261018160000_add_iris_message_ai_generated` : Ajout du champ `aiGenerated` (Boolean, default false) sur le modèle `IrisMessage` pour l'étiquetage d'origine artificielle des réponses IRIS.

---

## Contrôles qualité finaux
*(Seront complétés à l'issue de tous les correctifs)*
- (a) Un commit par correctif : EN ATTENTE
- (b) Tous les tests verts ou expliqués dans BLOQUANTS.md : EN ATTENTE
- (c) Vérification d'absence de secrets : EN ATTENTE
- (d) Aucune modification sur main : EN ATTENTE
- (e) Validation du schéma Prisma : EN ATTENTE
