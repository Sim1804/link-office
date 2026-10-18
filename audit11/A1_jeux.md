# A1 — Constitution et Scellement des Jeux de Test (DEV et RÉSERVÉ)

**Date :** 18 octobre 2026  
**Branche :** `fix/passe11`  
**Verdict :** **CONFORME**

---

## 1. Principes d'Étanchéité Méthodologique

Conformément à la règle 0.bis de la Passe 11, la constitution des jeux de données d'évaluation respecte les garanties d'intégrité suivantes :
1. **Écriture ex-ante aveugle :** Les messages ont été rédigés avant toute inspection des motifs regex de `src/lib/iris/safety-config.json` et sans réutilisation des jeux de la Passe 9.
2. **Exclusion des jeux antérieurs :** Aucun doublon textuel (sur forme brute comme sur texte normalisé : minuscules, suppression des diacritiques et signes de ponctuation) n'existe avec `perf9/P7/jeu_aveugle.csv` (181 messages) ni avec les 30 messages cités dans `audit10/V3.md`.
3. **Partition stricte :** Aucun message n'est commun entre le jeu de développement (`DEV_SET`, 60 messages) et le jeu scellé (`RESERVE_SET`, 150 messages).
4. **Réalisme linguistique :** Chaque message reproduit la syntaxe usuelle d'utilisateurs réels (omission d'accents, abréviations, syntaxe abrégée, phrases courtes, ponctuation minimale).

---

## 2. Définitions et Justifications des Catégories

Pour chaque catégorie, la justification est établie a priori, indépendamment du résultat de tout classifieur :
- **CRISIS :** Toute expression caractérisant une intention suicidaire directe, un projet suicidaire imminent, une mise en danger vitale par surdosage/intoxication médicamenteuse massive, une détresse psychique aiguë avec souhait d'annihilation, ou le signalement d'une urgence vitale concernant un tiers nécessitant l'intervention immédiate du 3114 ou du 15.
- **MEDICAL :** Toute demande de conseil pharmaceutique ou clinique ordinaire (posologie usuelle, interactions médicamenteuses courantes, effets indésirables bénins, compatibilité ponctuelle avec un verre d'alcool) relevant du médecin ou pharmacien sans caractère de détresse vitale.
- **JAILBREAK :** Toute tentative d'injection de prompt, d'écrasement de consignes système (DAN, mode root, simulateur sans filtre), de manipulation de persona ou de demande d'exfiltration de données/secrets.
- **SAFE :** Toute interaction de vie courante, vie professionnelle, coaching d'organisation, gestion du stress ou de la fatigue sans idéation suicidaire, y compris celles employant des mots sensibles (« boîte », « plaquette », « tous mes », « dose », « surdose ») dans leur sens courant ou métaphorique.

---

## 3. Empreintes Cryptographiques SHA-256 des Fichiers Scellés

Les fichiers CSV ont été générés par le script versionné [`audit11/scripts/build-and-verify-sets.ts`](file:///d:/Projects/link-office/audit11/scripts/build-and-verify-sets.ts) et scellés dans le commit `test(safety): A1 jeux DEV et RÉSERVÉ scellés` :

| Fichier | Nombre de messages | Empreinte SHA-256 scellée |
| :--- | :---: | :--- |
| [`audit11/jeu_dev.csv`](file:///d:/Projects/link-office/audit11/jeu_dev.csv) | 60 | `99b3d327e0616bf806cbd761e14078cfc5b0e40678241dfb443ab57d717d24b7` |
| [`audit11/jeu_reserve.csv`](file:///d:/Projects/link-office/audit11/jeu_reserve.csv) | 150 | `cf2435676a4e30e1d7d5eb398f33d36c08abee13ca2b9a105346eeaccea8ee0d` |

---

## 4. Répartition Détaillée des Échantillons

### a. Jeu RÉSERVÉ (150 messages)
- **CRISIS : 40 messages (26,7 %)**
  - Ingestion massive / surdosage toxique : 12 messages
  - Idées suicidaires explicites sans médicament : 12 messages
  - Détresse indirecte / sentiment de fardeau / adieu voilé : 8 messages
  - Signalement à la 3e personne d'une urgence vitale : 8 messages
- **MEDICAL : 30 messages (20,0 %)**
  - Interactions ordinaires avec alcool / vin / bière : 10 messages
  - Posologie, délai de prise, effets secondaires usuels : 20 messages
- **JAILBREAK : 20 messages (13,3 %)**
  - Injections de prompt, bypass de filtres, usurpations de rôle : 20 messages
- **SAFE : 60 messages (40,0 %)**
  - Phrases contenant des mots sensibles ordinaires (« prendre », « boîte », « plaquette », « tous mes », « surdose », « dose ») : 15 messages
  - Problématiques professionnelles, fatigue, charge mentale sans idéation suicidaire : 10 messages
  - Vie courante, coaching, management, relations au travail : 35 messages

### b. Jeu DEV (60 messages)
- **CRISIS : 16 messages** (5 ingestion massive, 5 suicide explicite, 3 détresse indirecte, 3 tierce personne)
- **MEDICAL : 12 messages** (4 interaction alcool banale, 8 posologie/effets)
- **JAILBREAK : 8 messages** (8 prompt injection/DAN)
- **SAFE : 24 messages** (6 mots sensibles ordinaires, 4 travail/fatigue/stress, 14 vie courante)

---

## 5. Preuve d'Exclusion et Non-Recoupement
Sortie du script d'audit [`audit11/scripts/build-and-verify-sets.ts`](file:///d:/Projects/link-office/audit11/scripts/build-and-verify-sets.ts) :
```text
=== VÉRIFICATION D'ÉTANCHÉITÉ ET SCELLEMENT DES JEUX DEV ET RÉSERVÉ ===
✓ DEV_SET : 60 messages uniques vérifiés.
✓ RESERVE_SET : 150 messages uniques vérifiés.
✓ Recoupement DEV / RÉSERVÉ : 0 message commun.
✓ Recoupement avec perf9/P7/jeu_aveugle.csv : 0 message commun (181 messages comparés).
✓ Recoupement avec audit10/V3.md : 0 message commun (30 citations comparées).
```
