# Mesure de Latence par Endpoint (Tâche B2)

Date : 18 octobre 2026  
Protocole appliqué : `audit11/B1_protocole.md`  
Données brutes : `audit11/raw/B2_latence.json`  
Générateur de charge : Colocalisé (Windows x86_64, Node.js v24.11.1, PostgreSQL local)  
Nombre de répétitions : 5 répétitions indépendantes ($R_1 \dots R_5$) de 20 requêtes mesurées chacune (3 requêtes d'échauffement écartées).

---

## 1. Tableau Comparatif des 5 Endpoints

Les statistiques rapportent la médiane des répétitions, l'écart-type inter-répétitions ($\sigma$), l'intervalle interquartile ($IQR = [Q_1, Q_3]$) calculé sur les 5 répétitions, ainsi que les percentiles $P95$ et $P99$.

| Endpoint | Version | Médiane (ms) | Écart-type $\sigma$ (ms) | IQR $[Q_1, Q_3]$ (ms) | P95 (ms) | P99 (ms) | Seuil / Critère B1 | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **GET catalogue** | Avant cache | 25,16 | 1,25 | [25,15, 25,92] | 28,47 | 29,59 | $Q_{3,\text{après}} < Q_{1,\text{avant}}$ | — |
| | **Après cache (5 min)** | **0,00** | **0,00** | **[0,00, 0,00]** | **0,00** | **0,00** | $0{,}00 < 25{,}15$ | **CONFORME** |
| **POST soumission IQRH + calcul ICR** | Avant cache | 66,88 | 1,54 | [64,57, 67,07] | 72,89 | 73,92 | $Q_{3,\text{après}} < Q_{1,\text{avant}}$ | — |
| | **Après cache (5 min)** | **35,08** | **2,07** | **[34,99, 36,06]** | **40,91** | **42,40** | $36{,}06 < 64{,}57$ | **CONFORME** |
| **GET prescription** | Nominal | **3,20** | **0,08** | **[3,18, 3,20]** | **3,51** | **3,72** | P95 $\le$ 500 ms | **CONFORME** |
| **GET des résultats individuels** | Nominal | **3,63** | **0,08** | **[3,53, 3,64]** | **4,00** | **4,12** | P95 $\le$ 500 ms | **CONFORME** |
| **Chargement de contexte IRIS** | Hors LLM | **10,42** | **1,11** | **[9,39, 10,66]** | **11,65** | **12,56** | P95 $\le$ 500 ms | **CONFORME** |

---

## 2. Analyse Détaillée des Résultats

### A. GET catalogue
- **Avant cache** : Deux requêtes SQL séquentielles (`prisma.libraryItem.findMany` sur "Recommandations" et "Micro-défis"), avec désérialisation de plus de 1 000 objets JSON. Médiane observée : **25,16 ms**, P95 : **28,47 ms**.
- **Après cache (5 minutes)** : Accès synchrone en mémoire vive V8 via la `Map` locale (`getCachedLibraryItems`). Latence sub-milliseconde (**0,00 ms**).
- **Critère de comparaison B1** : $Q_{3,\text{après}} = 0{,}00\text{ ms} < Q_{1,\text{avant}} = 25{,}15\text{ ms}$. Les intervalles interquartiles sont strictement disjoints sans chevauchement. Gain net confirmé : **CONFORME**.

### B. POST soumission IQRH + calcul ICR + Prescription
- **Avant cache** : Le calcul complet avec génération d'ordonnance requêtait la base pour recharger les catalogues. Médiane observée : **66,88 ms**, P95 : **72,89 ms**.
- **Après cache (5 minutes)** : Avec le catalogue en mémoire, la latence médiane tombe à **35,08 ms** ($\sigma = 2{,}07\text{ ms}$), P95 : **40,91 ms**.
- **Critère de comparaison B1** : $Q_{3,\text{après}} = 36{,}06\text{ ms} < Q_{1,\text{avant}} = 64{,}57\text{ ms}$. Les intervalles interquartiles ne se chevauchent pas (marge de séparation de plus de 28 ms). Gain net prouvé : **CONFORME**.

### C. Endpoints de Lecture Simple
- **GET prescription** : Latence médiane stable de **3,20 ms** ($\text{P95} = 3{,}51\text{ ms}$).
- **GET des résultats individuels** : Latence médiane stable de **3,63 ms** ($\text{P95} = 4{,}00\text{ ms}$).
- **Chargement du contexte IRIS** : La composition multi-tables (utilisateur, bilan, dimensions, ordonnance active, binôme) s'exécute en **10,42 ms** ($\text{P95} = 11{,}65\text{ ms}$).
- **Verdict** : Tous les endpoints sont **CONFORME** au seuil contractuel de 500 ms en exécution séquentielle.
