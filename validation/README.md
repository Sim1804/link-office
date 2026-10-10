# Guide d'Exécution des Bancs d'Essais Formels (validation/README.md)

Ce répertoire contient l'ensemble des bancs de test de fiabilité et d'audit formel pour la plateforme Link-Office.
Chaque test s'exécute contre les composants réels du système (build de production Next.js, base de données PostgreSQL 15, cookies de session Auth.js réels).

---

## 1. Prérequis d'Environnement

1. **Serveur de Production Actif :**
   Le serveur Next.js doit tourner en mode production sur le port 3000 :
   ```powershell
   npm run build
   npx next start -p 3000
   ```

2. **Base de Données PostgreSQL :**
   PostgreSQL 15 doit être accessible localement sur `localhost:5432` (`postgresql://linkuser:linkpassword@localhost:5432/linkoffice`).

3. **Générateur k6 :**
   k6 doit être installé (`C:\Program Files\k6\k6.exe` ou dans le `PATH`).

---

## 2. Rejouer les Tests Individuels (Une commande par banc)

### T1 — Cascade de Sécurité IRIS (Harnais + Évaluation Développement)
Exécute l'évaluation sur le jeu gelé de 180 messages, vérifie l'intégrité SHA-256, teste la résilience fail-safe et valide les témoins de réfutabilité :
```powershell
npm run validate:t1
```
*Artefacts produits :* \`validation/t1-safety/result.json\`, \`validation/t1-safety/env.json\`, \`validation/t1-safety/raw/eval_development_180.json\`.

---

### T2 — Charge Authentifiée k6 sur Build de Production
Exécute le tir k6 sur les paliers 10, 50, 100 et 500 VU avec sessions Auth.js réelles et contrôle d'intégrité PostgreSQL :
```powershell
npm run validate:t2
```
*Artefacts produits :* \`validation/t2-load/result.json\`, \`validation/t2-load/env.json\`, \`validation/t2-load/raw/k6-summary.json\`.

---

### T3 — Latence et Coût Réels du Pipeline IRIS
Mesure la latence TTFT, la durée totale de génération SSE et modélise les coûts économiques par session :
```powershell
npm run validate:t3
```
*Artefacts produits :* \`validation/t3-latency-cost/result.json\`, \`validation/t3-latency-cost/env.json\`, \`validation/t3-latency-cost/raw/measurements.json\`.

---

### T4 — Matrice d'Autorisation et Recoupement Multi-Tenant
Génère et sonde les 642 combinaisons (84 routes $\times$ 6 identités) avec de vraies requêtes HTTP et teste l'anti-recoupement statistique :
```powershell
npm run validate:t4
```
*Artefacts produits :* \`validation/t4-authz/result.json\`, \`validation/t4-authz/env.json\`, \`validation/t4-authz/expected-status.json\`, \`validation/t4-authz/raw/divergences.json\`.

---

### T5 — Scoring Psychométrique et Renormalisation
Exécute les tests de propriété (\`fast-check\`, 1 000 vecteurs par propriété), vérifie les cas pivots et audite la base réelle :
```powershell
npm run validate:t5
```
*Artefacts produits :* \`validation/t5-scoring/result.json\`, \`validation/t5-scoring/env.json\`.

---

### T10 — Effacement RGPD, Export, Audit Dépendances et Secrets
Vérifie la suppression totale (0 ligne résiduelle sur 57 tables), génère l'export complet, audite les vulnérabilités npm et fouille l'historique git :
```powershell
npm run validate:t10
```
*Artefacts produits :* \`validation/t10-privacy/result.json\`, \`validation/t10-privacy/env.json\`, \`validation/t10-privacy/raw/npm-audit.json\`.

---

## 3. Vérification de Cohérence Mémoire & Tableaux

Pour recalculer indépendamment tous les intervalles de Wilson par formule explicite, comparer les résultats aux affirmations du mémoire et régénérer les tableaux Markdown :
```powershell
npx tsx validation/verify-numbers/verify.ts
```
*Artefacts produits :* \`validation/verify-numbers/generated/tables.md\`.

---

## 4. Rejouer l'Ensemble de la Suite
Pour exécuter la séquence complète d'un seul trait :
```powershell
npm run validate:all
```
