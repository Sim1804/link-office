# Tableaux Statistiques Certifiés & Résultats Empiriques

Ce document est généré automatiquement par le script `validation/verify-numbers/verify.ts` à partir des fichiers réels `result.json`.

---

## 1. Tableau d'Évaluation de la Cascade de Sécurité IRIS (Banc T1)
*Jeu de données : DÉVELOPPEMENT (180 messages) — SHA-256 : `0eab9b5453b84b27d2d6a7fb27f7ea4d6ef3e99df6fa2cdf6871be5dcf12005f`*

| Catégorie Testée | Effectif Total ($n$) | Détections ($x$) | Proportion ($p$) | IC Wilson 95 % [Borne Basse ; Borne Haute] | Seuil Protocole | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Détresse / Crise (CRISIS)** | 60 | 12 | 20.0 % | [0.1183 ; 0.3178] | Borne basse $\ge 0,90$ | **NON RESPECTÉ** |
| **Demande Médicale (MEDICAL)** | 30 | 11 | 36.7 % | [0.2187 ; 0.5449] | Borne basse $\ge 0,70$ | **NON RESPECTÉ** |
| **Contournement (BYPASS)** | 30 | 8 | 26.7 % | [0.1418 ; 0.4445] | Borne basse $\ge 0,70$ | **NON RESPECTÉ** |
| **Faux Positifs (NOMINAL)** | 60 | 0 | 0.0 % | [0.0000 ; 0.0602] | Borne haute $\le 0,10$ | **RESPECTÉ** |

*Résilience Fail-Safe (Couche 2 indisponible) :* 12/60 (20.0 %) — Seuil : 100 % $\rightarrow$ **NON RESPECTÉ**.

---

## 2. Tableau de Charge Authentifiée (Banc T2)
*Hôte : AMD Ryzen 5 6600H, 16 Go RAM — Moteur : k6 v1.0.0 — 500 comptes semés*

| Scénario de Charge | Paliers VU | Statuts 2xx / Attendus | Statuts Inattendus | Latence P95 Soumission | Seuil P95 | Verdict |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **k6 Suite Authentifiée** | 10 $\rightarrow$ 50 $\rightarrow$ 100 $\rightarrow$ 500 | Interruption précoce | Taux inattendu > 1 % | 0 ms | $< 500\text{ ms}$ | **NON RESPECTÉ (`abortOnFail`)** |

*Intégrité BDD :* 200 questionnaires persistés en base vs 0 succès k6 validés (mismatch: 200).

---

## 3. Métrologie du Pipeline IRIS & Tarification (Banc T3)
*Fournisseur : Groq — Modèle configuré : `qwen/qwen3.8-27b` — Modèle documenté : `llama-3.3-70b-versatile`*

| Indicateur | Valeur Mesurée / Observée | Seuil Protocole | Verdict |
| :--- | :---: | :---: | :---: |
| **Modèle exécuté vs documenté** | qwen/qwen3.8-27b $\neq$ llama-3.3-70b-versatile | Identique | **DIVERGENCE DOCUMENTÉE** |
| **Quota Fournisseur (OTPM)** | Plafonné à 1 000 jetons de sortie / min (HTTP 429) | $\ge 200$ appels durables | **BLOQUÉ (QUOTA)** |
| **Coût théorique session 10 tours (Qwen 27B)** | 0.0178 $ | $< 0,01\ \$$ | **NON RESPECTÉ** |
| **Coût théorique session 10 tours (Llama 70B)** | 0.005565 $ | $< 0,01\ \$$ | **RESPECTÉ (Théorique)** |

---

## 4. Matrice d'Autorisation & Isolation Multi-Tenant (Banc T4)
*Volume : 84 routes API $\times$ 6 rôles $=$ 642 cellules évaluées par requêtes HTTP réelles*

| Dimension Contrôlée | Total Évalué | Violations Constatées | Seuil Toléré | Verdict |
| :--- | :---: | :---: | :---: | :---: |
| **Cellules Interdites (401/403 attendus)** | 642 | 56 divergences | 0 | **NON RESPECTÉ** |
| **Isolation Cross-Tenant (Inter-organisations)** | 84 routes | 6 fuites 2xx | 0 | **NON RESPECTÉ** |
| **Cellules Non Spécifiées (`UNSPECIFIED`)** | 642 | 6 cellules | 0 | **NON RESPECTÉ** |
| **Anti-recoupement Statistique (k-anonymat)** | Filtres combinés $n=5$ et $n=6$ | 0 valeur dérivable | 0 | **RESPECTÉ** |

---

## 5. Propriétés Psychométriques & Renormalisation (Banc T5)
*Moteur : `fast-check` (1 000 vecteurs par propriété) + 79 évaluations de production réelles*

| Propriété / Test | Échantillon | Succès | Seuil | Verdict |
| :--- | :---: | :---: | :---: | :---: |
| **Bornes [0, 100] sur tous les scores** | 1 000 vecteurs | 1 000 / 1 000 | 100 % | **RESPECTÉ** |
| **Monotonie des réponses** | 1 000 paires | 1 000 / 1 000 | 100 % | **RESPECTÉ** |
| **Indépendance IQRH vs ICR** | 1 000 vecteurs | 1 000 / 1 000 | 100 % | **RESPECTÉ** |
| **Unicité du profil psychométrique (1 des 12)** | 1 000 vecteurs | 1 000 / 1 000 | 100 % | **RESPECTÉ** |
| **Renormalisation ICR (0 $\rightarrow$ 0, 85 $\rightarrow$ 100)** | 1 000 vecteurs | 1 000 / 1 000 | 100 % | **RESPECTÉ** |
| **Cas fixes de la spécification (docs/)** | 2 profils pivots | 2 / 2 | 100 % | **RESPECTÉ** |
| **Changements de bande ICR en base réelle** | 79 bilans réels | 0 bascule | Information | **DOCUMENTÉ** |

---

## 6. Effacement RGPD, Export & Audit de Sécurité (Banc T10)
*Schéma Prisma : 57 tables inspectées — Outils : Prisma, npm audit, git log*

| Domaine Audit | Éléments Inspectés | Résultat Mesuré | Seuil Toléré | Verdict |
| :--- | :---: | :---: | :---: | :---: |
| **Effacement RGPD (`prisma.user.delete`)** | 57 tables Prisma | 0 ligne résiduelle | 0 | **RESPECTÉ** |
| **Portabilité RGPD (Export complet)** | 27 collections relationnelles | Export JSON validé | Intégralité | **RESPECTÉ** |
| **Audit Vulnérabilités NPM (`--omit=dev`)** | 748 dépendances | 1 Critical, 7 High | 0 | **NON RESPECTÉ** |
| **Secrets dans l'Historique Git** | Historique complet | 2 occurrences (toutes atténuées) | 0 actif | **RESPECTÉ** |
| **Entêtes de Sécurité HTTP** | HSTS, X-Frame, X-Content | Conformes (HSTS max-age=63072000) | Conformes | **RESPECTÉ** |

---

## 7. Tableau de Rapprochement des Affirmations du Mémoire (`memoire-claims.json`)

| Identifiant | Affirmation du Mémoire | Valeur Affirmée | Valeur Réellement Mesurée | Statut Rapprochement |
| :--- | :--- | :---: | :---: | :---: |
| **CLAIM-01** | Rappel de détresse / crise IRIS sur l'évaluation | `0.9667` | `0.2` | **ÉCART_DÉTECTÉ** |
| **CLAIM-02** | Taux de faux positifs sur messages nominaux | `0` | `0` | **CONFORME** |
| **CLAIM-03** | Taux de repli fail-safe en cas d'indisponibilité du classifieur | `1` | `0.2` | **ÉCART_DÉTECTÉ** |
| **CLAIM-04** | P95 latence soumission questionnaire à 100 VU | `500` | `0` | **ÉCART_DÉTECTÉ** |
| **CLAIM-05** | Intégrité des écritures en base k6 vs DB | `0` | `200` | **ÉCART_DÉTECTÉ** |
| **CLAIM-06** | Modèle d'inférence LLM pour IRIS | `llama-3.3-70b-versatile` | `qwen/qwen3.8-27b` | **ÉCART_DÉTECTÉ** |
| **CLAIM-07** | Coût moyen d'une session de 10 tours IRIS | `0.01` | `0.0178` | **ÉCART_DÉTECTÉ** |
| **CLAIM-08** | Écarts d'autorisation en cellule interdite | `0` | `56` | **ÉCART_DÉTECTÉ** |
| **CLAIM-09** | Fuites d'isolation multi-tenant inter-organisations | `0` | `6` | **ÉCART_DÉTECTÉ** |
| **CLAIM-10** | Propriétés psychométriques formelles validées | `5` | `79` | **CONFORME** |
| **CLAIM-11** | Lignes résiduelles post-suppression utilisateur RGPD | `0` | `0` | **CONFORME** |
| **CLAIM-12** | Vulnérabilités critiques/élevées dans les dépendances de production | `0` | `8` | **ÉCART_DÉTECTÉ** |
