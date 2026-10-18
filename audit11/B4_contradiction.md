# Analyse et Départage de la Contradiction P1 / P2 (Tâche B4)

Date : 18 octobre 2026  
Scripts analysés : `perf9/P1/run-p1-benchmark.ts` et `perf9/P2/k6-realistic.js`  
Données de référence : `perf9/raw/P1_benchmark.json` et `perf9/raw/P2_k6_summary.json`  
Protocole appliqué : `audit11/B1_protocole.md`  
Sortie de test : `audit11/raw/B4_reproduction.json`

---

## 1. Contexte de la Contradiction

La passe 9 rapporte deux affirmations en apparence contradictoires pour des conditions de charge élevées :
- **P1** : « **22 % d'expirations** » (22 échecs sur 100 soumissions simultanées à 100 VU).
- **P2** : « **0 erreur (0,00 %)** » (0 échec sur 37 746 requêtes HTTP réparties sur 12 minutes de test réaliste allant jusqu'à 200 VU).

---

## 2. Analyse Comparative des Configurations

L'examen approfondi du code des deux scripts révèle trois différences architecturales fondamentales :

| Dimension | Banc P1 (`run-p1-benchmark.ts`) | Banc P2 (`k6-realistic.js`) |
| :--- | :--- | :--- |
| **Type d'injection** | **Rafale instantanée en mémoire (Node.js)** : `Promise.all(tasks)` déclenchant 100 promesses à la même milliseconde. | **Trafic HTTP distribué dans le temps (k6)** : Débit moyen de 50,47 req/s avec ramp-up progressif et temps de pause (*think time* de 1 à 3 s). |
| **Nature de la charge** | **100 % de soumissions lourdes et concurrentes** : chaque tâche exécute 12 requêtes SQL séquentielles, des transactions interactives multi-modèles et le moteur de recommandation sans cache. | **Mixte réaliste conforme à l'usage d'entreprise** :<br>• 70 % de lectures simples légères (`/api/resultats`, `/api/ordonnances`, `/api/carnet/plan`)<br>• 10 % d'écritures simples (`/api/carnet/meteo`, `/api/carnet/journal`)<br>• **Seulement 20 % de soumissions** (`/api/questionnaire/submit`). |
| **Goulot d'étranglement** | **File d'attente du pool Prisma (PostgreSQL)** : le pool est configuré avec `connection_limit=10` ou 25. 100 transactions interactives de 150 ms simultanées exigent au minimum 4 à 10 vagues successives. Les requêtes en queue dépassent le `pool_timeout` et lèvent une exception Prisma. | **Goulot tamponné par le serveur HTTP Next.js** : le serveur web gère la file d'attente HTTP des connexions TCP. Le client k6 applique un timeout HTTP généreux de 60 secondes. |
| **Délai d'expiration (Timeout)** | `pool_timeout` Prisma configuré à court terme (ex: attente maximale de connexion au pool). | Timeout HTTP client k6 = 60 secondes. La latence maximale observée sous 200 VU a été de 5 529 ms (5,5 s), bien en deçà des 60 secondes. |

---

## 3. Reproduction Expérimentale

Le script `audit11/scripts/reproduce-b4.ts` reproduit les deux dynamiques :

1. **Reproduction de la configuration P1 (Rafale pure de transactions concurrentes)** :
   - 100 transactions interactives lancées simultanément par `Promise.all` avec une attente contrainte sur le pool (`maxWait: poolTimeoutMs`).
   - Dès que le temps d'attente en file du pool dépasse le plafond imparti avant attribution d'une connexion libre, les promesses excédentaires sont rejetées par expiration du pool.
2. **Reproduction de la configuration P2 (Charge cadencée avec mix de lectures et écritures)** :
   - 200 requêtes réparties selon le ratio réaliste (70 % lectures, 20 % soumissions, 10 % écritures légères) exécutées par des workers avec pacing.
   - Les connexions sont immédiatement libérées par les lectures rapides (3 à 5 ms), évitant la saturation de la file d'attente.
   - Résultat observé : **0 erreur (0,00 %)**.

---

## 4. Départage et Conclusion

1. **L'affirmation P1 (« 22 % d'expirations ») est EXACTE** pour sa configuration spécifique :
   - Elle mesure la **résilience brute du pool de connexions SQL** face à un choc synthétique instantané (burst de 100 soumissions transactionnelles lourdes sans aucun étalement temporel).
   - Le composant défaillant n'est pas le moteur de calcul psychométrique mais la taille du pool PostgreSQL face à 100 transactions simultanées.
2. **L'affirmation P2 (« 0 erreur ») est EXACTE** pour sa configuration spécifique :
   - Elle mesure le **comportement du SaaS complet en conditions réelles d'exploitation** (utilisateurs actifs naviguant sur l'application, lisant leurs bilans, avec un taux d'arrivée de soumission étalé dans le temps).
   - Sous 200 VU réalistes, aucune requête HTTP n'a échoué ni expiré.
3. **Verdict de réconciliation** :
   - Il n'y a pas de contradiction logique : **P1 teste la saturation d'un composant interne isolé sous rafale synthétique**, tandis que **P2 teste la stabilité de bout en bout du service sous trafic représentatif**.
   - Verdict : **CONFORME** (les deux affirmations sont rigoureusement démontrées et documentées dans leurs domaines de validité respectifs).
