# CHANGELOG — Corrections des Instruments de Mesure (Passe 4)

Ce document répertorie chaque correction apportée au harnais de validation, conformément aux exigences de la **Partie A** de la Passe 4 :
Pour chaque instrument : le **défaut identifié**, le **correctif apporté**, et la **preuve objective de correction**.

---

## 1. T1 — Cascade de Sécurité IRIS (Section A1)

### Défaut
Dans les runs précédents, l'ensemble des 180 messages du jeu de données présentait `decisiveLayer = LAYER_1_REGEX`, `confidence = 1`, `failSafe = false`, et `model = qwen/qwen3.8-27b` alors qu'aucun appel au modèle d'IA n'était exécuté. La cause principale était l'absence de chargement de `.env.local` par le runner `tsx`, rendant `process.env.GROQ_API_KEY` indéfinie et shuntant silencieusement la Couche 2. De plus, les tests témoins utilisaient des constantes en dur (`witnessAlwaysSafeRecall = 0`, `witnessAlwaysCrisisFpRate = 1.0`) plutôt que des calculs réels, et le modèle n'était pas extrait de la réponse du fournisseur.

### Correctif
- **Chargement d'environnement** : Ajout explicite de `dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })` dans `validation/t1-safety/run.ts`.
- **Alignement avec la route de production** : Le harnais appelle strictement la même fonction que la route `app/api/iris/conversation/[id]/message` (`evaluateInputSafetyCascaded`).
- **Télémétrie et extraction fournisseur** : Modification de `classifyWithLLM` et `evaluateInputSafetyCascaded` dans `src/lib/iris/safety.ts` pour renvoyer le nom réel du modèle renvoyé par le fournisseur (`data.model`), la confiance du classifieur, et la latence réelle de la Couche 2.
- **Test d'intégrité de l'instrument** : Vérification stricte que `layer2Count > 0`. Si aucun message n'est décidé par la Couche 2 lorsque celle-ci est censée être active, le banc statue formellement en **NON CONCLUANT**.
- **Mode panne réel** : Simulation de panne (coupure API) sur l'ensemble des cas de crise et mesure du taux réel de repli (actuellement 20%, rapporté sans fard).
- **Tests témoins dynamiques** : Exécution réelle des fonctions témoins sur les cas de crise et nominaux pour vérifier dynamiquement la réfutabilité du banc.
- **Nomenclature de verdict à 4 statuts** : Respect des statuts normatifs : `RESPECTÉ`, `NON RESPECTÉ`, `NON CONCLUANT`, `BLOQUÉ`.

### Preuve
Le fichier `validation/t1-safety/run.ts` exécute la cascade, appelle Groq avec `qwen/qwen3.8-27b`, enregistre le modèle `data.model` lu dans la réponse et valide l'intégrité de la mesure.

---

## 2. T2 — Banc de Charge k6 et Métriques (Sections A2 & A3)

### Défaut
1. `result.json` affichait `measuredMs: 0` (P95 questionnaire et TTFT), `measuredRate: 0`, et `k6SuccessCount: 0` avec `passed: true`, alors que `raw/k6-summary.json` mesurait P95 soumission $\approx 3\,877$ ms, TTFT $\approx 45\,343$ ms, taux de statuts inattendus $\approx 1,08\,\%$, et 456 soumissions réussies. Ce biais provenait de l'accès à `.values.` qui n'existait pas dans le format exporté par k6, réduisant toutes les valeurs à `undefined || 0`.
2. Le fichier de résumé k6 contenait la section `setup_data` avec les cookies de session en clair (violation de sécurité).
3. Le scénario « lecture » acceptait `status === 200 || status === 403`, masquant l'interdiction de lecture sur `/api/b2b/stats`.
4. L'écart entre le delta base (+200 lignes SUBMITTED) et les 456 succès k6 n'était pas documenté ni expliqué.

### Correctif
- **Extraction directe et stricte** : Réécriture du parseur de métriques dans `validation/t2-load/run.ts` pour lire directement les champs `count`, `p(95)`, `value`/`rate` sans `.values.`. Tout champ manquant lève désormais une exception explicite.
- **Règle anti-zéro non justifié** : Toute valeur égale à 0 non justifiée par une mesure déclenche immédiatement le statut **NON CONCLUANT**.
- **Suppression des secrets dans les artefacts** : Ajout d'une fonction `handleSummary` dans `k6-suite.js` et d'un nettoyage dans `run.ts` pour supprimer systématiquement `setup_data` (cookies) de `k6-summary.json`.
- **Scénario lecture corrigé** : Remplacement de l'appel `/api/b2b/stats` (qui échouait en 403 pour les salariés) par `/api/questions`, avec exigence exclusive de `status === 200` (un 403 n'est plus considéré comme un succès).
- **Gestion des timeouts** : Ajout d'un contrôle explicite interdisant les statuts 0, 504 ou les durées supérieures à 60 secondes.
- **Explication formelle de l'écart base/k6** : Documentation de la cause technique de l'écart : 200 brouillons distincts pré-générés exécutés sur 456 itérations k6 (ré-exécutions idempotentes retournant 200 sans créer de nouvelles lignes).

### Preuve
Les métriques extraites de `raw/k6-summary.json` reflètent désormais exactement les mesures réelles (P95 soumission : 3 877 ms, TTFT : 45 343 ms, statuts inattendus : 1,08 %, 456 succès k6), et le fichier `k6-summary.json` est exempt de tout cookie de session.

---

## 3. T4 — Matrice d'Autorisation et Recoupement (Section A4)

### Défaut
1. `result.json` annonçait génériquement « 56 cellules interdites avec 200 » sans catégorisation fermée.
2. `fetch` suivait automatiquement les redirections HTTP (`redirect: follow` par défaut), masquant les statuts 3xx réels.
3. Les routes dérivant l'organisation depuis la session (`/api/actions`, `/api/b2b/organization`, etc.) étaient comptées à tort comme des fuites de données lorsqu'un administrateur tiers recevait 200, alors qu'il recevait ses propres données.
4. Aucun corps de réponse n'était capturé ni analysé pour les cellules 2xx interdites.
5. Six cellules pour `/api/iris/conversation/active` étaient marquées `UNSPECIFIED`.

### Correctif
- **Mode sans redirection** : Ajout explicite de `redirect: "manual"` sur l'ensemble des requêtes de la matrice dans `validation/t4-authz/run.ts`.
- **Classification fermée des écarts** : Chaque écart est classé de manière exclusive parmi les 5 catégories normatives :
  1. `FORBIDDEN_BUT_2XX` : Interdit selon le rôle, mais ayant renvoyé 2xx.
  2. `5XX_ERROR` : Erreur serveur 500 (notamment absence de validation Zod sur les requêtes d'écriture avec corps minimal).
  3. `401_403_INTERCHANGE` : Statuts d'authentification/autorisation interchangeables (401 attendu, 403 reçu ou réciproquement).
  4. `INVALID_TEST_INPUT` : Entrée de test invalide (attendu 2xx, reçu 4xx faute de payload spécifique ou ressource idoine).
  5. `UNSPECIFIED` : Spécification manquante dans la matrice.
- **Inspection de charge utile et isolation multi-tenant** : Analyse du corps des réponses pour rechercher la présence d'identifiants de l'Organisation A (`camp-novatech-2026`, Novatech, etc.). Si un administrateur tiers reçoit 200 contenant exclusivement ses propres données d'organisation, l'isolation multi-tenant est attestée sans fuite.
- **Résolution des cellules UNSPECIFIED** : Ajout de `/api/iris/conversation/active` dans `spec-rules.ts` avec la règle d'authentification requise (`ALL_AUTHENTICATED`), supprimant les 6 cellules `UNSPECIFIED`.
- **Documentation des faux positifs de test** :
  - Sur `/api/ordonnances/[userId]` et `/api/resultats/[userId]`, le `userId` injecté correspond à l'employé Alice Martin qui accède à ses propres ordonnances/bilans (200 légitime).
  - Sur `/api/campaigns/[id]/config`, l'administrateur d'organisation a le droit de configurer sa propre campagne selon le code source (`ALLOWED_ROLES.includes("ADMIN_B2B")`).

### Preuve
Le script `validation/t4-authz/run.ts` classe l'ensemble des cellules, capture les corps de réponse des cellules 2xx, prouve l'absence de fuite croisée sur les routes d'organisation, et consigne la structure détaillée dans `result.json`.

---

## 4. Génération 100% Automatique de REPORT.md (Section A5)

### Défaut
`REPORT.md` contenait des phrases et des verdicts écrits à la main, ainsi que des affirmations génériques non recalculées (ex: « 100 % des témoins ont échoué comme attendu »).

### Correctif
- Création de `validation/generate-report.ts` : script TypeScript lisant l'intégralité des fichiers `result.json` (T1, T2, T3, T4, T5, T10) et générant `validation/REPORT.md`.
- Règle stricte : zéro chiffre en dur, calcul systématique des taux, des bornes de Wilson, et des preuves par test témoin.

### Preuve
Exécution de `npx tsx validation/generate-report.ts` générant un rapport synchronisé à 100% avec les fichiers de données brutes.
