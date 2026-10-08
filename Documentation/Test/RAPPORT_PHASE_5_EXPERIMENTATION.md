# Rapport d'Exécution — Phase 5 : Assainissement du Script d'Expérimentation & Métriques Réelles

> **Date d'exécution :** 8 octobre 2026  
> **Script source :** `scripts/run-beta-experiment.ts`  
> **Artefact de données brutes produit :** `Documentation/Test/beta_experiment_raw_data.json`  
> **Branche Git :** `kwada`  
> **Règle méthodologique cardinale (Règle 1) :** Élimination intégrale des constantes hardcodées. Chaque métrique est désormais issue d'un calcul réel sur l'exécution du code ou mentionnée explicitement comme « non mesurée ». Le statut du jeu de données est explicitement qualifié de **synthétique**.

---

## 1. Inventaire des Constantes Factices Éliminées

Avant intervention, l'ancien script simulait des métriques par des constantes prédéterminées. Voici l'audit exhaustif et les corrections appliquées :

| Emplacement dans l'ancien code | Constante arbitraire identifiée | Problème méthodologique | Remplacement / Traitement Phase 5 |
| :--- | :---: | :--- | :--- |
| **L. 534** | `uclaCorrelationIndicative: -0.61` | Nombre magique constant, échelle UCLA non administrée | Remplacé par `null` et mention explicite : `« Non mesuré (échelle UCLA-LS non administrée au panel synthétique) »` |
| **L. 620** | `avgSatisfaction: 4.8` | Moyenne de satisfaction écrite en dur | Remplacé par un calcul réel sur les enregistrements `prisma.binomeFeedback.findMany()` (moyenne mesurée : 5.0/5) |
| **L. 686-689** | `p1Sum += 0.60; p3Sum += 0.41; p5Sum += 0.34; mapSum += 0.47` | Constantes arbitraires additionnées dans une boucle factice | Remplacé par le calcul réel de $P@1$, $P@3$, $P@5$ et du $MAP$ par croisement des `PrescriptionItem` et de la dimension prioritaire/secondaire |
| **L. 702-705** | `pAt1: 0.60, pAt3: 0.41, pAt5: 0.34, map: 0.47` | Répétition des constantes arbitraires | Remplacé par les métriques réelles calculées ($P@1=1.0$, $P@3=1.0$, $P@5=1.0$, $MAP=1.0$, latence $= 3,374$ ms) |
| **L. 739-758** | Dialogues IRIS statiques hardcodés | Réponses pré-rédigées sans appel au filtre | Remplacé par l'évaluation en direct des **100 scénarios réels** via `evaluateInputSafety()` |
| **L. 780-787** | `respectLimites: 4.6, tonEmpathique: 4.1, pertinence: 3.9, kappa: 0.61` | Notes qualitatives et Kappa inventés | Notes qualitatives passées à `null` (« non mesuré »). **Kappa de Cohen réel** calculé sur la matrice de confusion ($κ = 0,8571$) |
| **L. 829-840** | Objet `surveyData` statique (53 répondants, moyennes 4.3, 4.1, etc.) | Enquête de satisfaction totalement fictive | Remplacé par `survey = { status: "non mesuré", note: "Enquête de satisfaction non déployée sur ce panel synthétique automatisé", respondents: null }` |
| **En-tête & Métadonnées** | Présenté comme « test bêta sur participants réels » | Flou trompeur sur la nature des données | Cadre requalifié en `« Évaluation automatisée sur comptes de test synthétiques »`, avec `"dataNature": "synthetic"`, `"seed": 42`, `"method": "simulation_and_automated_benchmark"` |

---

## 2. Métadonnées du Benchmark & Nature des Données

L'artefact produit [`Documentation/Test/beta_experiment_raw_data.json`](file:///d:/Projects/link-office/Documentation/Test/beta_experiment_raw_data.json) intègre les garanties de transparence scientifique :

```json
{
  "title": "Évaluation sur comptes de test synthétiques et benchmark automatisé",
  "dataNature": "synthetic",
  "seed": 42,
  "method": "simulation_and_automated_benchmark",
  "timestamp": "2026-10-08T12:47:10.002Z"
}
```

- **Origine du panel :** 84 comptes utilisateurs modélisés à partir de la distribution socio-démographique de `Documentation/Test/Users test.csv` (30 B2B Novatech, 15 B2B2C Mutuelle, 12 B2G Collectivité, 27 B2C Citoyens).
- **Passation psychométrique :** 79 bilans complétés via `ResultService.submit()` réel (5 abandons / brouillons reproduisant un taux de complétion de 94%).

---

## 3. Résultats Empiriques 100% Calculés

### 3.1 Propriétés Psychométriques de l'IQRH
- **Nombre de bilans complets analysés :** $n = 79$
- **Alpha de Cronbach Global (30 items) :** **$0,96$** (Seuil de Nunnally $\ge 0,70$ respecté)
- **Alphas par dimension :**
  - $D1$ (Social) : **$0,96$**
  - $D2$ (Affectif) : **$0,96$**
  - $D3$ (Sentimental) : **$0,96$**
  - $D4$ (Professionnel) : **$0,95$**
  - $D5$ (Relation à soi) : **$0,96$**
- **Distribution des scores :**
  - IQRH Moyen : **$60,8$** (écart-type : $17,9$)
  - IER Moyen (Indice d'Équilibre) : **$63,9$**
- **Corrélation externe UCLA Loneliness Scale :** `null` / Non mesurée.

### 3.2 Moteur de Recommandation & Ordonnances (Objectif O2)
Calculé en direct sur un échantillon de 20 utilisateurs par croisement des ordonnances générées et des besoins prioritaires :
- **Precision@1 :** **$1,00$** (100% de recommandations primaires en cible)
- **Precision@3 :** **$1,00$**
- **Precision@5 :** **$1,00$**
- **Mean Average Precision (MAP) :** **$1,00$**
- **Latence moyenne de récupération :** **$3,374$ ms** (largement sous le SLA de 100 ms)

### 3.3 Filtre de Sécurité IRIS & Kappa de Cohen (Objectif O3)
Évaluation directe des 100 scénarios réels de test (`tests/iris/scenarios.json`) :
- **Précision globale de classification :** **$95,00$ %** ($95/100$)
  - **CRISIS (Détresse vitale, suicide, 3114/15) :** **$100,00$ %** ($20/20$, Règle de Trois borne inf $= 85,00$ %)
  - **MEDICAL (Prescriptions, diagnostics) :** **$95,00$ %** ($19/20$)
  - **OFF_TOPIC (Maths, code, culture) :** **$95,00$ %** ($19/20$)
  - **JAILBREAK (Injections de consignes) :** **$85,00$ %** ($17/20$)
  - **NOMINAL (Demandes relationnelles valides) :** **$100,00$ %** ($20/20$, Règle de Trois borne inf $= 85,00$ %)
- **Table de contingence (Annotations humaines vs Décision filtre) :**
  - $a$ (Both Block) = $75$
  - $b$ (Human Block, Model Allow - Faux Négatifs) = $5$
  - $c$ (Human Allow, Model Block - Faux Positifs) = $0$
  - $d$ (Both Allow) = $20$
- **Calcul formel du Kappa de Cohen :**
  $$P_o = \frac{75 + 20}{100} = 0,95$$
  $$P_e = (0,80 \times 0,75) + (0,20 \times 0,25) = 0,60 + 0,05 = 0,65$$
  $$\kappa = \frac{0,95 - 0,65}{1 - 0,65} = \frac{0,30}{0,35} = \mathbf{0,8571}$$
  *(Accord quasi-parfait selon l'échelle de Landis & Koch).*
- **Latence d'exécution du filtre :** moyenne **$0,0874$ ms**, p95 **$0,1927$ ms**.
- **Notes qualitatives (empathie, pertinence) :** `null` / Non mesurées (absence de panel en double aveugle).

### 3.4 Binôme Relationnel & Accountability (Objectif O6)
- **Suggestions calculées :** 10
- **Binômes actifs constitués :** 10
- **Satisfaction moyenne réelle mesurée sur feedbacks :** **$5,00 / 5$**

### 3.5 Gamification & Protection Anti-Race Condition
- **Micro-défis complétés :** 15
- **Verrouillage anti-double soumission validé :** **OUI (bloqué)** via transaction atomique Prisma.

### 3.6 Isolation Multi-Tenant & k-Anonymat (Objectif O4)
- **Fuites croisées entre organisations (B2B vs B2B2C) :** **0 (aucune fuite)**
- **k-anonymat :** Seuil $k < 5$ vérifié et actif sur les sous-groupes statistiques.

### 3.7 Enquête de Satisfaction
- **Statut :** **Non mesuré**.
- **Mention explicite :** Aucune enquête de satisfaction terrain n'ayant été déployée sur ce panel synthétique automatisé, aucune note arbitraire n'a été insérée.

---

## 4. Preuves d'Exécution Réelles

### 4.1 Sortie du script de benchmark (`npx tsx scripts/run-beta-experiment.ts`)
```text
════════════════════════════════════════════════════════════════
   ÉVALUATION AUTOMATISÉE SUR COMPTES DE TEST SYNTHÉTIQUES     
   (BENCHMARK DE PERFORMANCE & CONFORMITÉ SCIENTIFIQUE)        
════════════════════════════════════════════════════════════════

🏢 1. Configuration des Organisations & Campagnes de test...
   ✓ Organisations et campagnes créées avec succès.

👥 2. Ingestion des comptes synthétiques depuis 'Documentation/Test/Users test.csv'...
   ✓ 84 comptes utilisateurs synthétiques créés/synchronisés en BDD.

📝 3. Exécution des bilans IQRH via le ResultService réel...
   ✓ 79/84 questionnaires calculés par ResultService.

📊 4. Calcul psychométrique réel (Alpha de Cronbach, Scores & Distribution)...
   • Alpha de Cronbach Global (30 items) : 0.96 (Seuil Nunnally: >= 0.70)
   • D1 (Social) : 0.96 | D2 (Affectif) : 0.96 | D3 (Sentimental) : 0.96
   • D4 (Pro) : 0.95    | D5 (Soi) : 0.96
   • IQRH Moyen : 60.8 (std: 17.9) | IER Moyen : 63.9
   • Corrélation UCLA-LS : non mesurée (échelle externe non administrée au panel synthétique)

🤝 5. Test du Binôme Relationnel (Matching déterministe, Check-ins, Feedbacks)...
   ✓ 10 suggestions calculées par l'algorithme explicable (seuil >= 75 pts).
   ✓ 10 binômes actifs constitués avec check-ins et feedbacks.
   ✓ Satisfaction moyenne calculée sur feedbacks : 5/5.

🎯 6. Test des Micro-défis & Gamification (complétion atomique sous transaction)...
   ✓ 15 micro-défis validés avec attribution atomique de points.
   ✓ Verrouillage anti-double soumission validé : OUI (bloqué)

📦 7. Calcul réel des métriques de Recommandation (Precision@k, MAP, Latence)...
   • Precision@1 mesurée : 1
   • Precision@3 mesurée : 1
   • Precision@5 mesurée : 1
   • Mean Average Precision (MAP) mesuré : 1
   • Latence moyenne de récupération : 3.374 ms

💬 8. Évaluation réelle d'IRIS (100 scénarios, latence, précision et Kappa)...
   ✓ 100 scénarios exécutés par evaluateInputSafety().
   • Précision globale mesurée : 95% (95/100)
   • CRISIS (Suicide / 3114) : 100% (20/20)
   • MEDICAL : 95% | OFF_TOPIC : 95% | JAILBREAK : 85%
   • Kappa de Cohen calculé (décisions filtre vs annotations) : 0.8571
   • Latence moyenne du filtre : 0.0874 ms (p95: 0.1927 ms)
   • Notes qualitatives (empathie, pertinence) : non mesurées (absence de double panel aveugle)

🔒 9. Test d'Isolation Multi-Tenant et k-Anonymat (seuil k >= 5)...
   ✓ Comptes B2B isolés : 30 | Comptes B2B2C isolés : 15
   ✓ Fuite cross-tenant détectée : 0 (AUCUNE FUITE)
   ✓ Règle de k-anonymat (k < 5) vérifiée sur sous-groupe : VERROU ACTIF

⭐ 10. Enquête de satisfaction : non mesurée sur ce panel automatisé...

💾 Données brutes de l'expérimentation enregistrées dans Documentation\Test\beta_experiment_raw_data.json
```

### 4.2 Sortie de la suite de tests (`npm test`)
```text
Test Files  8 passed (8)
     Tests  60 passed (60)
  Duration  1.16s
```

### 4.3 Validation Typescript & Lint
- `npx tsc --noEmit` : **0 erreur** (Code 0).
- `npx eslint . --quiet` : **0 erreur** (Code 0).
