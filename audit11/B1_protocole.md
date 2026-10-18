# Protocole de Mesure de Latence sans Artefact (Tâche B1)

Date : 18 octobre 2026  
Auteur : Auditeur senior / Ingénieur système  
Version du code évaluée : `3913aa4` (branche `fix/passe11`)

---

## 1. Environnement d'Exécution Matériel et Logiciel

- **Machine Serveur** :
  - OS : Windows (x86_64)
  - Runtime : Node.js v24.11.1
  - Serveur HTTP : Next.js 15
  - Base de données : PostgreSQL local (via Prisma ORM 6.19.3)
- **Machine du Générateur de Charge** :
  - **NON TESTABLE ICI (pour la partie « générateur séparé »)** : Une seule machine physique est disponible dans cet environnement d'évaluation.
  - **Limite méthodologique notée** : Le générateur de mesure et l'application serveur s'exécutent sur le même hôte physique (partage des cœurs CPU, de la mémoire vive et du bus d'entrées/sorties). Les mesures sont conduites en consignant explicitement ce biais de colocalisation.

---

## 2. Base de Données

- **Taille de la base** :
  - Utilisateurs (`User`) : 713
  - Évaluations (`Assessment`) : 2 897 (dont 329 brouillons `DRAFT` et 2 568 `SUBMITTED`)
  - Résultats psychométriques (`IqrhResult`) : 2 565
  - Prescriptions relationnelles (`RelationalPrescription`) : 2 563
  - Catalogue (`LibraryItem`) : 1 056 items
- **Graine / Déterminisme** :
  - Données injectées lors des campagnes précédentes (passes 8, 9 et 10).
  - Échantillonnage stable sur identifiants fixes pour les requêtes de lecture et les utilisateurs tests.

---

## 3. Paramètres d'Exécution de la Mesure

Pour chaque endpoint et chaque configuration (« avant » et « après ») :
- **Nombre de répétitions** : **5 répétitions indépendantes** ($R_1, R_2, R_3, R_4, R_5$).
- **Requêtes par répétition** : **20 requêtes séquentielles mesurées**.
- **Échauffement (Warmup)** : **3 requêtes préliminaires exécutées et écartées** avant le début des 20 requêtes mesurées, afin d'éliminer les artefacts d'initialisation (JIT V8, handshake Prisma pool, amorçage réseau local).
- **Mesure temporelle** : `performance.now()` haute précision (résolution sub-milliseconde).
- **Statistiques calculées par répétition** :
  - Médiane ($P50$)
  - 95e percentile ($P95$)
  - 99e percentile ($P99$)
- **Statistiques agrégées sur les 5 répétitions** :
  - Médiane des médianes
  - Médiane des P95
  - Médiane des P99
  - Écart-type inter-répétitions ($\sigma_{P50}$, $\sigma_{P95}$)
  - Intervalle interquartile ($IQR = [Q_1, Q_3]$) des 5 répétitions pour la médiane et le P95.

---

## 4. Endpoints à Mesurer

1. **`GET catalogue`** : Chargement complet du catalogue des recommandations et micro-défis (`LibraryItem`).
2. **`POST soumission IQRH + calcul ICR`** : Pipeline complet de soumission de questionnaire (lecture base, calcul psychométrique IQRH, calcul ICR, profils, génération de prescription et mise à jour base).
3. **`GET prescription`** : Récupération de l'ordonnance relationnelle active d'un utilisateur (`RelationalPrescription` + `PrescriptionItem` + `LibraryItem`).
4. **`GET des résultats individuels`** : Récupération du résultat psychométrique complet d'un utilisateur (`IqrhResult` + dimensions).
5. **`Chargement de contexte IRIS (hors appel au modèle)`** : Construction du prompt contextuel IRIS (`buildIrisContext` / `loadUserContext`) sans appel API LLM externe.

---

## 5. Configurations Comparées

- **Configuration « Avant »** : Sans cache mémoire du catalogue (invalidation systématique du cache `libraryCache.clear()` ou requêtage direct de la table `LibraryItem`).
- **Configuration « Après »** : Avec cache mémoire actif TTL 5 minutes (`getCachedLibraryItems`).

---

## 6. Critère de Comparaison Pré-Établi

Conformément à la consigne de rigueur scientifique :
- **CONFORME** : Un gain n'est déclaré CONFORME que si l'intervalle interquartile ($IQR = [Q_1, Q_3]$) des 5 répétitions « avant » et celui des 5 répétitions « après » **ne se chevauchent pas** ($Q_{3,\text{après}} < Q_{1,\text{avant}}$), démontrant un gain net et reproductible distinct de la variance de mesure.
- **NON CONCLUANT** : Si les intervalles interquartiles se chevauchent ($Q_{1,\text{avant}} \le Q_{3,\text{après}}$), l'écart observé est indistinguable de la variance d'échantillonnage et du bruit machine colocalisé.
- **ÉCART** : Si l'intervalle après est supérieur à l'intervalle avant ($Q_{1,\text{après}} > Q_{3,\text{avant}}$), indiquant une régression de performance.
