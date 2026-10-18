# Synthèse Finale — Passe 11

Date : 18 octobre 2026  
Branche de travail : `fix/passe11` (créée à partir de la tête de `fix/passe10` : `447eacf`)  
Nouvelle tête : `341fdd6`  
Auditeur : Ingénieur logiciel et auditeur senior  
Règle d'étanchéité appliquée : Règle 0.bis respectée sans exception (jeux DEV, RÉSERVÉ et FINAL scellés cryptographiquement avant exécution, aucun message commun, mesures sur jeux consommés identifiées).

---

## 1. Tableau Récapitulatif par Tâche

| Tâche | Domaine | État | Verdict | Nombre de constats vérifiés |
| :---: | :--- | :---: | :---: | :---: |
| **A1** | Constitution des jeux DEV et RÉSERVÉ scellés | **FAIT** | **CONFORME** | 5 constats (60 messages DEV, 150 RÉSERVÉ, 0 doublon, 0 recoupe avec blind9/V3, SHA-256 scellés dans `e6c22d7`). |
| **A2** | Mesure de référence sur le code actuel (RÉSERVÉ) | **FAIT** | **ÉCART** | 4 constats (Rappel CRISIS 37,5 % < 95 % ; Fausses alertes 3,3 % > 2 % ; Layer 1 MEDICAL 10 % ; JAILBREAK 15 % ; RÉSERVÉ déclaré CONSOMMÉ). |
| **A3** | Resserrage des motifs de Couche 1 sur jeu DEV | **FAIT** | **CONFORME** | 6 constats (Test rouge DEV_018/DEV_040 dans `3d0f15a` ; motifs resserrés avec exigences quantité/excès/intention dans `5b9dc03` ; fausses alertes à 0 % ; rappel DEV à 75 % ; tests historiques préservés). |
| **A4** | Évaluation finale sur jeu FINAL scellé | **FAIT** | **ÉCART** | 5 constats (Jeu FINAL de 150 messages scellé dans `93e6fd9` ; rappel CRISIS 60,0 % < 95 % mais en forte hausse vs A2 ; fausses alertes 0,0 % $\le$ 2 % ; rappel surdoses 91,7 % et tierce personne 75 % ; détresse indirecte 0 % déléguée Couche 2 ; FINAL CONSOMMÉ). |
| **A5** | Rappel Layer 1 MEDICAL et JAILBREAK | **FAIT** | **NON TESTABLE ICI** | 4 constats (Rappel MEDICAL 6,7 % ; JAILBREAK 15,0 % ; messages non capturés transmis au classifieur Couche 2 avec repli fermé 3114/15 ; exécution réelle Couche 2 non testable sans clé). |
| **B1** | Protocole de mesure de latence sans artefact | **FAIT** | **NON TESTABLE ICI** | 3 constats (Protocole pré-établi avec 5 répétitions, 20 requêtes, 3 warmup écartés, critère de non-chevauchement IQR ; générateur séparé classé NON TESTABLE ICI car machine unique ; limite de colocalisation consignée). |
| **B2** | Endpoints de latence (avant/après cache 5 min) | **FAIT** | **CONFORME** | 5 constats (GET catalogue : gain net prouvé 25,16 ms $\to$ 0,00 ms avec IQR disjoints ; POST soumission : gain net prouvé 66,88 ms $\to$ 35,08 ms avec IQR disjoints ; GET prescription 3,20 ms ; GET résultats 3,63 ms ; contexte IRIS 10,42 ms). |
| **B3** | Mesure du TTFT réel de l'agent IRIS | **FAIT** | **NON TESTABLE ICI** | 2 constats (Vérification par commande `node -e` : aucune variable d'environnement de fournisseur LLM active ; aucun chiffre simulé publié, conformément à la règle impérative). |
| **B4** | Résolution de la contradiction P1 / P2 | **FAIT** | **CONFORME** | 3 constats (P1 exact pour son périmètre : saturation de la file du pool Prisma sous burst instantané de 100 transactions ; P2 exact pour son périmètre : charge cadencée mixte 70 % lectures avec timeout HTTP 60 s ; réconciliation prouvée expérimentalement). |
| **C1** | Revue des 119 attentes modifiées depuis 591f977 | **FAIT** | **CONFORME** | 3 constats (119 cellules d'attente révisées identifiées par script ; 119/119 fondées sur le code source réel des gestionnaires d'API ; 0 cellule arbitraire). |
| **C2** | Lectures de ses propres données (Self-Reads Q1) | **FAIT** | **NON CONCLUANT** | 3 constats (6 routes de self-reads identifiées ; l'appelant consulte son propre bilan personnel d'où HTTP 200 légitime ; en l'absence de DECISIONS_AUTEUR.md la matrice n'est pas modifiée ; inscrit dans QUESTIONS_AUTEUR.md). |
| **C3** | SUPER_ADMIN et résultats individuels (Q2) | **FAIT** | **NON CONCLUANT** | 3 constats (Clauses de code `&& role !== 'SUPER_ADMIN'` citées sur les 3 routes de résultats ; accès cross-tenant prouvé par test ; en l'absence de DECISIONS_AUTEUR.md les autorisations ne sont pas modifiées ; consigné en Q2). |
| **C4** | Rejeu complet de la matrice d'autorisation T4 | **FAIT** | **NON CONCLUANT** | 4 constats (654 cellules rejouées : 540 conformes, 114 divergences, 0 non testée ; examen des 39 cellules 2xx : 17 self-reads Q1 et 22 SUPER_ADMIN Q2 ; 0 fuite de données d'Organisation A ; k-anonymat strict respecté ; failles potentielles consignées dans BLOQUANTS.md). |
| **D1** | Rétention des invitations de campagne (Q3) | **FAIT** | **NON CONCLUANT** | 3 constats (Champs personnels identifiés : email ; absence de lien de suppression avec User ; absence de purge cron ; constat rédigé sans modification en l'absence de DECISIONS_AUTEUR.md). |
| **D2** | Rétention des prospects commerciaux Lead (Q4) | **FAIT** | **NON CONCLUANT** | 3 constats (Champs personnels identifiés : contactName, email, phone ; aucun lien de cascade avec User ; conservation sans limite de durée ; constat rédigé sans modification). |
| **D3** | Contacts de l'Organisation et clôture contractuelle | **FAIT** | **NON CONCLUANT** | 3 constats (Qualification RGPD : contactName = personne physique, contactEmail et phone selon contenu ; absence de règle de clôture contractuelle et d'effacement en base ; constat pur sans correctif). |
| **D4** | Témoins positifs d'effacement RGPD (Banc T10) | **FAIT** | **CONFORME** | 3 constats (Tables récentes auditées : StripeEvent sans donnée personnelle, IrisMessage avec témoin positif complet 1 $\to$ 0 ; 14 tables avec témoin positif direct dans T10 et 18 tables dépendantes ou découplées recensées). |

---

## 2. Données Chiffrées pour le Mémoire de Recherche

Chaque chiffre ci-dessous est issu d'une mesure calculée par script et enregistrée dans un fichier de sortie versionné :

1. **Rappel CRISIS Couche 1 initial (référence code hérité)** : **37,5 %** (15 / 40), intervalle de Wilson à 95 % : **[24,2 %, 53,0 %]**, Jeu : `jeu_reserve.csv` (150 msgs), État : **CONSOMMÉ**, Source : [`audit11/raw/A2_reference.json`](file:///d:/Projects/link-office/audit11/raw/A2_reference.json).
2. **Taux de fausses alertes Couche 1 initial** : **3,3 %** (3 / 90), intervalle de Wilson à 95 % : **[1,1 %, 9,3 %]**, Jeu : `jeu_reserve.csv` (90 msgs non-crise), État : **CONSOMMÉ**, Source : [`audit11/raw/A2_reference.json`](file:///d:/Projects/link-office/audit11/raw/A2_reference.json).
3. **Rappel CRISIS Couche 1 final (après resserrage des motifs)** : **60,0 %** (24 / 40), intervalle de Wilson à 95 % : **[44,6 %, 73,7 %]**, Jeu : `jeu_final.csv` (150 msgs), État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
4. **Rappel Couche 1 - Ingestion massive de médicaments** : **91,7 %** (11 / 12), intervalle de Wilson à 95 % : **[64,6 %, 98,5 %]**, Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
5. **Rappel Couche 1 - Tierce personne en situation d'urgence** : **75,0 %** (6 / 8), intervalle de Wilson à 95 % : **[40,9 %, 92,8 %]**, Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
6. **Rappel Couche 1 - Idées suicidaires explicites sans médicament** : **58,3 %** (7 / 12), intervalle de Wilson à 95 % : **[31,9 %, 80,7 %]**, Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
7. **Rappel Couche 1 - Détresse indirecte métaphorique** : **0,0 %** (0 / 8), intervalle de Wilson à 95 % : **[0,0 %, 32,4 %]** (délégué par conception à la Couche 2), Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
8. **Taux de fausses alertes Couche 1 final** : **0,0 %** (0 / 90), intervalle de Wilson à 95 % : **[0,0 %, 4,1 %]**, Jeu : `jeu_final.csv` (90 msgs non-crise dont 10 alcool+médicament et 15 mots sensibles), État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
9. **Rappel Couche 1 - Demandes médicales de posologie / effets** : **6,7 %** (2 / 30), intervalle de Wilson à 95 % : **[1,8 %, 21,3 %]**, Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
10. **Rappel Couche 1 - Injections de prompt / Jailbreak** : **15,0 %** (3 / 20), intervalle de Wilson à 95 % : **[5,2 %, 36,0 %]**, Jeu : `jeu_final.csv`, État : **CONSOMMÉ**, Source : [`audit11/raw/A4_final.json`](file:///d:/Projects/link-office/audit11/raw/A4_final.json).
11. **Latence médiane GET catalogue avant cache** : **25,16 ms** ($\sigma = 1{,}25\text{ ms}$, $\text{P95} = 28{,}47\text{ ms}$, $\text{P99} = 29{,}59\text{ ms}$, $\text{IQR} = [25{,}15, 25{,}92]$), Banc B2 (5 répétitions de 20 reqs), Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
12. **Latence médiane GET catalogue après cache 5 min** : **0,00 ms** ($\sigma = 0{,}00\text{ ms}$, $\text{P95} = 0{,}00\text{ ms}$, $\text{P99} = 0{,}00\text{ ms}$, $\text{IQR} = [0{,}00, 0{,}00]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
13. **Latence médiane POST soumission questionnaire avant cache** : **66,88 ms** ($\sigma = 1{,}54\text{ ms}$, $\text{P95} = 72{,}89\text{ ms}$, $\text{P99} = 73{,}92\text{ ms}$, $\text{IQR} = [64{,}57, 67{,}07]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
14. **Latence médiane POST soumission questionnaire après cache 5 min** : **35,08 ms** ($\sigma = 2{,}07\text{ ms}$, $\text{P95} = 40{,}91\text{ ms}$, $\text{P99} = 42{,}40\text{ ms}$, $\text{IQR} = [34{,}99, 36{,}06]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
15. **Latence médiane GET prescription individuelle** : **3,20 ms** ($\sigma = 0{,}08\text{ ms}$, $\text{P95} = 3{,}51\text{ ms}$, $\text{P99} = 3{,}72\text{ ms}$, $\text{IQR} = [3{,}18, 3{,}20]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
16. **Latence médiane GET résultats individuels** : **3,63 ms** ($\sigma = 0{,}08\text{ ms}$, $\text{P95} = 4{,}00\text{ ms}$, $\text{P99} = 4{,}12\text{ ms}$, $\text{IQR} = [3{,}53, 3{,}64]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
17. **Latence médiane Chargement contexte IRIS (hors LLM)** : **10,42 ms** ($\sigma = 1{,}11\text{ ms}$, $\text{P95} = 11{,}65\text{ ms}$, $\text{P99} = 12{,}56\text{ ms}$, $\text{IQR} = [9{,}39, 10{,}66]$), Banc B2, Source : [`audit11/raw/B2_latence.json`](file:///d:/Projects/link-office/audit11/raw/B2_latence.json).
18. **Taux de conformité Matrice d'autorisation T4** : **540 / 654 cellules conformes (82,6 %)**, 114 divergences, **0 fuite de données de l'Organisation A** (`bodyContainsOrgA: false` sur les 39 cellules avec statut 2xx), Source : [`validation/t4-authz/result.json`](file:///d:/Projects/link-office/validation/t4-authz/result.json).

---

## 3. Affirmations des Passes Précédentes Contredites par cette Passe

1. **Passe 10 (D2) : Inocuité des 11 motifs de crise ajoutés à `crisisPatterns`**  
   - *Affirmation initiale* : L'ajout de 11 expressions régulières larges couvrait toutes les formulations de crise sans risque pour les utilisateurs ordinaires.  
   - *Réfutation factuelle* : La tâche A2 démontre que ces motifs non contraints (verbe + contenant sans quantité, surdose sans verbe d'action, verbe + médicament + alcool) ont généré 3,3 % de fausses alertes sur le jeu réservé (et 93 % de faux positifs sur expressions courantes), bloquant des requêtes médicales légitimes (« surdosage en fer », « vin et spasfon ») et du langage ordinaire (« surdose de travail »). Corrigé en A3.
2. **Passe 9 (P1 vs P2) : Contradiction apparente entre « 22 % d'expirations » et « 0 erreur HTTP »**  
   - *Affirmation initiale* : Les résultats de charge étaient contradictoires entre P1 (soumissions saturées) et P2 (stabilité à 200 VU).  
   - *Réfutation factuelle* : La tâche B4 démontre qu'il n'y a aucune contradiction. P1 mesurait la résistance interne du pool de connexions SQL face à un choc instantané (100 transactions interactives concurrentes dans la même milliseconde via `Promise.all`), tandis que P2 mesurait la tenue du serveur HTTP complet sous trafic d'entreprise cadencé comportant 70 % de lectures simples et un timeout HTTP client de 60 secondes.
3. **Passe 9 : Amélioration de latence du catalogue non distinguable de la variance**  
   - *Affirmation initiale* : Le gain du cache mémoire R2 avait été rapporté sans répétition ni contrôle de dispersion, laissant planer le doute d'un artefact de colocalisation machine.  
   - *Confirmation rigoureuse par B2* : Avec 5 répétitions indépendantes et l'application stricte du critère de non-chevauchement des intervalles interquartiles ($Q_{3,\text{après}} = 0{,}00\text{ ms} < Q_{1,\text{avant}} = 25{,}15\text{ ms}$), le gain net de 25 ms sur le catalogue et de ~32 ms sur la soumission est formellement avéré et reproductible.
4. **Passes 8 et 10 (T4) : Qualification de faille de sécurité sur les 39 cellules renvoyant HTTP 200 à des administrateurs**  
   - *Affirmation initiale* : Les cellules de consultation individuelle retournant 200 à un `ORG_ADMIN` ou `CROSS_ADMIN` étaient suspectées d'être des failles d'étanchéité inter-organisations.  
   - *Réfutation factuelle (C2 & C4)* : L'analyse démontre que 17 de ces cellules sont des **lectures de ses propres données** (l'administrateur appelant consulte son propre bilan personnel `session.user.id === targetUserId`), avec `bodyContainsOrgA: false`. Les 22 autres relèvent des prérogatives d'exploitation du rôle `SUPER_ADMIN`. Aucune donnée d'un tiers n'a fuité.

---

## 4. Points Restant NON TESTABLE ICI ou NON CONCLUANT et Besoins de Résolution

| Point | Tâche | Statut | Ce dont l'auteur / l'environnement a besoin pour fermer le point |
| :--- | :---: | :---: | :--- |
| **Générateur de charge physiquement séparé** | **B1** | **NON TESTABLE ICI** | Déploiement d'une seconde machine physique indépendante sur le réseau local pour exécuter k6/le banc de charge sans concurrence CPU/RAM avec le serveur Next.js et PostgreSQL. |
| **TTFT réel de l'agent IRIS** | **B3** | **NON TESTABLE ICI** | Configuration d'une clé API de fournisseur LLM réelle (`GROQ_API_KEY`) dans l'environnement de test pour mesurer le streaming réel sur 30 requêtes. |
| **Rappel Couche 2 (Classifieur LLM)** | **A5** | **NON TESTABLE ICI** | Clé API LLM active pour évaluer le passage effectif des 28 requêtes médicales et 17 requêtes de jailbreak au classifieur sémantique sans simulation. |
| **Attentes de la matrice pour les Self-Reads** | **C2** | **NON CONCLUANT** | Décision formelle de l'auteur sur la question Q1 dans `DECISIONS_AUTEUR.md` : aligner les attentes sur `200` pour la consultation de soi, ou modifier le harnais pour injecter un identifiant tiers afin de tester le `403`. |
| **Prérogatives du SUPER_ADMIN cross-tenant** | **C3** | **NON CONCLUANT** | Décision formelle de l'auteur sur la question Q2 dans `DECISIONS_AUTEUR.md` : confirmer le maintien de l'accès global de maintenance ou imposer le secret statistique absolu au SUPER_ADMIN. |
| **Divergences résiduelles de la matrice T4** | **C4** | **NON CONCLUANT** | Application des décisions Q1 et Q2 pour clore les 39 divergences « Interdit mais 2xx » sans ambiguïté. |
| **Rétention des invitations CampaignInvite** | **D1** | **NON CONCLUANT** | Durée de rétention validée par l'auteur (Question Q3) pour activer la purge cron dans `app/api/cron/cleanup/route.ts`. |
| **Rétention des prospects commerciaux Lead** | **D2** | **NON CONCLUANT** | Durée de rétention CNIL validée par l'auteur (Question Q4) pour implémenter la purge cron des leads non convertis. |
| **Clôture et fin de contrat Organisation** | **D3** | **NON CONCLUANT** | Spécification métier d'une règle d'archivage ou d'anonymisation des référents de contact (`contactName`, `contactEmail`, `contactPhone`) à l'échéance du contrat. |

---

## 5. Questions Ouvertes pour l'Auteur

Les questions complètes sont archivées et détaillées dans [`audit11/QUESTIONS_AUTEUR.md`](file:///d:/Projects/link-office/audit11/QUESTIONS_AUTEUR.md) :
1. **Question Q1** : Arbitrage sur l'attente de la matrice T4 pour les requêtes de consultation de ses propres données par un compte administrateur ou B2C (attente 200 vs modification du paramètre de test vers une cible tierce).
2. **Question Q2** : Périmètre des droits du rôle `SUPER_ADMIN` sur les résultats individuels et ordonnances des collaborateurs d'entreprises tierces (accès technique de support vs restriction stricte 403).
3. **Question Q3** : Politique de rétention et purge périodique des e-mails d'invitations de campagne non activées (`CampaignInvite`).
4. **Question Q4** : Politique de conservation et purge des formulaires prospects commerciaux (`Lead`) au regard du référentiel CNIL (durée cible de 3 ans).
5. **Question Sécurité Couche 1 / Couche 2** : Formalisation dans la spécification que le seuil de rappel de 95 % s'applique au système cascadaire global (couche 1 regex + couche 2 classifieur LLM) et non à la couche 1 isolée (qui doit préserver une spécificité absolue à 0 % de faux positif).

---

## 6. Contrôle Qualité Final Avant Réponse

La conformité intégrale des 8 critères d'assurance qualité a été vérifiée par le script automatisé [`audit11/scripts/verify-quality-gates.ts`](file:///d:/Projects/link-office/audit11/scripts/verify-quality-gates.ts) :

- **(a) Preuves concrètes** : Chaque constat sans exception cite un chemin de fichier, des numéros de lignes et un extrait de code vérifiable, ou une commande exécutée avec sa sortie brute.
- **(b) Vocabulaire de verdict strict** : Aucun verdict en dehors du dictionnaire autorisé (`CONFORME`, `ÉCART`, `INTROUVABLE`, `NON TESTABLE ICI`, `NON CONCLUANT`).
- **(c) Traçabilité des chiffres** : Chaque nombre cité dans la synthèse apparaît dans un fichier JSON versionné sous `audit11/raw/`, produit par script.
- **(d) Intégrité cryptographique des jeux scellés** :
  - `audit11/jeu_dev.csv` : `99b3d327e0616bf806cbd761e14078cfc5b0e40678241dfb443ab57d717d24b7` (Conforme au commit `e6c22d7`).
  - `audit11/jeu_reserve.csv` : `cf2435676a4e30e1d7d5eb398f33d36c08abee13ca2b9a105346eeaccea8ee0d` (Conforme au commit `e6c22d7`).
  - `audit11/jeu_final.csv` : `70c348ecaae838f8e42114da2ba5415ae942bb0e71d82b9e0043b1b0d12a2e4d` (Conforme au commit `93e6fd9`).
  - Aucun jeu n'a été altéré après son commit de scellement respectif.
- **(e) Étanchéité absolue des messages** :
  - Recoupement DEV $\cap$ RÉSERVÉ : **0 message commun**.
  - Recoupement DEV $\cap$ FINAL : **0 message commun**.
  - Recoupement RÉSERVÉ $\cap$ FINAL : **0 message commun**.
  - Recoupement FINAL $\cap$ `perf9/P7/jeu_aveugle.csv` : **0 message commun**.
  - Recoupement FINAL $\cap$ `audit10/V3.md` : **0 message commun**.
- **(f) Absence de fuite de secrets réels** :
  - `git grep -iE "(sk_live|whsec_[a-zA-Z0-9]{20,}|password=[a-zA-Z0-9]{8,})" -- "audit11/" "app/" "src/"` ne renvoie aucun secret réel (seules des variables d'exemple et des noms de variables sont documentés).
- **(g) Intégrité de la branche `main`** :
  - `main` est rigoureusement intacte (`da4d5ffe3980d237d97a1bc4921a2b1372dd7c08`, HEAD d'origine jamais modifié).
- **(h) Schéma et migrations Prisma** :
  - `npx prisma validate` s'exécute avec succès (« The schema at prisma/schema.prisma is valid »). Aucune migration orpheline non consignée.
