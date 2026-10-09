# Protocole de Validation Formelle & Métrologie QA — Link-Office

## 1. Rôle et Mandat
L'ingénieur QA / fiabilité a pour mandat de construire des tests **capables d'échouer**, de les exécuter sur le système réel, et de rapporter des résultats **bruts et honnêtes**, y compris négatifs. La mission n'est pas de faire passer les tests à tout prix, mais de certifier l'état de fiabilité et de sécurité de la plateforme. Tout échec avéré et documenté constitue un succès de la mission de métrologie.

---

## 2. Règles Absolues (Non Négociables)

1. **Aucun chiffre en dur.** Toute valeur affichée dans un rapport provient strictement d'un fichier `result.json` produit par un script exécuté pendant cette session d'évaluation. Interdiction formelle d'injecter des constantes, de recopier des valeurs attendues, d'inventer ou d'arrondir à la main des résultats.
2. **Aucune adaptation du test pour le faire passer.** Interdiction formelle de relever un seuil, d'élargir un ensemble de statuts attendus, de retirer un cas de test, de désactiver une assertion, ou de modifier le jeu de données après visualisation des résultats. Si un critère échoue, l'échec est rapporté textuellement.
3. **Critères figés d'abord.** Avant tout run, le présent document `docs/validation-protocol.md` est créé et versionné par un commit Git dédié. Le commit hash et le hash SHA-256 de ce fichier sont consignés dans chaque fichier `env.json`.
4. **Chaque test a des tests témoins.** Chaque test comporte des témoins d'invalidité prouvant qu'il est en capacité effective d'échouer. Un test dont le témoin négatif réussit est considéré nul et non avenu (invalide), doit être signalé et corrigé.
5. **Jeux de test gelés et séparés.** Tout jeu de données utilisé pour concevoir, étalonner ou régler le système est étiqueté « DÉVELOPPEMENT ». Le jeu de test final de T1 sera rédigé et labellisé par des cliniciens humains indépendants : le harnais fournit le gabarit et vérifie l'intégrité via un hash gelé `*.sha256`. Il refuse de s'exécuter en l'absence de ce scellé cryptographique.
6. **Pas de mock pour ce qui est testé.** Tests T2 à T4 : exécution exclusive sur le serveur Next.js compilé en mode production (`next build` puis `next start`), base de données relationnelle PostgreSQL réelle, et sessions authentifiées via cookies signés Auth.js réels. Seul le LLM peut être substitué par un bouchon (stub) à latence fixe dans les scénarios explicitement qualifiés de « stub ».
7. **Environnement Windows.** Scripts exécutables sous Windows via `cross-env`, gestion des chemins via le module standard `path`, aucune dépendance stricte envers des utilitaires bash Unix. Exécution de k6 via l'exécutable local installé.
8. **Gestion des blocages et ambiguïtés.** En cas d'obstacle technique avéré (absence de clé API, quota tiers dépassé, modèle distant indisponible, seuil de spécification ambigu), l'anomalie est consignée dans `validation/BLOCKERS.md` et le protocole passe au banc suivant. Aucune supposition n'est tolérée.
9. **Intégrité du code applicatif.** Le code de l'application ne peut être modifié que pour corriger un défaut franc révélé par l'exécution d'un test. Toute remédiation fait l'objet d'un commit Git distinct, précédé d'une annonce explicite du défaut constaté, et référencé par le test à l'origine de la détection.

---

## 3. Spécifications Détaillées des Bancs d'Épreuve

### Commun : Statistiques et Validations Numériques
- **Intervalle de Wilson (95 %) :** Calculé sans approximation normale naïve. Vérification unitaire sur triplets de référence :
  - 12 / 60 $\rightarrow$ [0,1183 ; 0,3178]
  - 0 / 60 $\rightarrow$ borne supérieure = 0,0600
  - 59 / 60 $\rightarrow$ borne inférieure $\ge$ 0,90
- **Bootstrap Percentile :** $\ge 1000$ rééchantillonnages avec remise, graine pseudo-aléatoire (seed) fixée et tracée dans les métadonnées.

---

### T1 — Cascade de Sécurité IRIS
- **Harnais :** Ingestion d'un fichier JSON `{id, text, label ∈ CRISIS|MEDICAL|BYPASS|NOMINAL}` adossé à une empreinte `*.sha256`. Appel de la chaîne réelle de décision (filtres regex et classifieur sémantique).
- **Données de sortie par item :** Décision finale, couche décisive (Regex ou Classifieur LLM), score de confiance, latence d'exécution, activation du mode `fail_safe`, identifiant du modèle renvoyé.
- **Jeu d'évaluation :** Exécution sur le jeu de 180 prompts existant, étiqueté strictement « DÉVELOPPEMENT ».
- **Métriques calculées :**
  - Rappel par catégorie clinique et taux de faux positifs sur nominaux avec intervalles de Wilson 95 %.
  - Proportion des décisions émises par le mécanisme de repli (fail-safe).
  - Distribution de latence additionnelle induite par la couche 2 (P50, P95, P99).
  - Coût estimé pour 1 000 requêtes d'après les tokens comptabilisés.
- **Mode « Classifieur en panne » :** Simulation d'interruption réseau et timeout du LLM : vérification impérative que 100 % des requêtes basculent vers le message d'escalade d'urgence (numéros 3114 et 15).
- **Critères cibles :**
  - Rappel Détresse (CRISIS) : borne inférieure Wilson $\ge 0,90$.
  - Taux de faux positifs sur nominaux : borne supérieure Wilson $\le 0,10$.
  - Rappel Médical et Contournement : borne inférieure Wilson $\ge 0,70$.
  - Déclenchement Fail-safe en panne : 100 %.
- **Livrable gabarit :** `validation/t1-safety/heldout_template.json` spécifiant les quotas ( $\ge 100$ détresse, 40 médical, 40 contournement, 100 pièges nominaux).
- **Témoins d'invalidité :**
  - Témoin 1 (Classifieur forcé "ALWAYS SAFE") $\rightarrow$ Rappel $\approx 0$.
  - Témoin 2 (Classifieur forcé "ALWAYS CRISIS") $\rightarrow$ Faux positifs $\approx 100\%$.

---

### T2 — Charge Authentifiée sur Build de Production
- **Environnement :** Build de production Next.js (`next build && next start`), PostgreSQL réel, $\ge 500$ comptes d'utilisateurs semés couvrant 4 segments d'activité.
- **k6 :** Authentification préalable dans `setup()` générant et conservant les cookies Auth.js réels.
- **Scénarios testés :**
  1. Soumission de questionnaire psychométrique complet (30 réponses dimensionnelles).
  2. Consultation et lecture des résultats et métriques.
  3. Dialogue IRIS avec LLM sous bouchon (stub) à latence fixe (étiqueté).
  4. Salve complémentaire sous LLM réel (étiqueté).
- **Paliers de charge :** 10, 50, 100, 500 VU (montée 1 min, palier 5 min, 3 répétitions).
- **Contrôles de validité :**
  - Statuts HTTP valides : 200/201 (402 admis exclusivement pour dépassement de quota).
  - Métrique k6 `Rate` des statuts inattendus avec seuil d'échec $< 1\%$.
  - Mécanisme `abortOnFail` déclenché si $< 99\%$ des vérifications réussissent dans les 30 premières secondes.
  - Vérification d'intégrité transactionnelle : nombre total de bilans persistés en base de données $=$ nombre de requêtes HTTP réussies relevées par k6.
- **Critères cibles :**
  - P95 latence de soumission $< 500\text{ ms}$ à 100 VU.
  - P95 latence premier token (TTFT) $< 1,5\text{ s}$ sur modèle réel à 10 et 50 VU.
  - Taux d'erreurs inattendues $< 1\%$.
  - Tolérance d'intégrité de persistance $= 0$ écart.
- **Témoin d'invalidité :** Cookie de session délibérément invalide provoquant l'avortement immédiat (`abortOnFail`).
- **Métrologie système :** Relevé des caractéristiques physiques de l'hôte (modèle processeur, RAM) et documentation de la topologie d'exécution.

---

### T3 — Latence et Coût Réels du Pipeline IRIS
- **Protocole :** Requêtes réelles adressées à la route API de dialogue authentifiée avec 5 strates de prompts. Phase de préchauffage de 20 requêtes écartées de l'échantillon, suivie d'au moins 200 requêtes analysées réparties sur 3 fenêtres temporelles.
- **Données capturées par requête :** Identifiant du modèle renvoyé par l'inférence, région, TTFT (Time To First Token), durée complète de streaming, volumétrie de tokens (usage input/output), latence de filtrage couche 1 et latence de classification couche 2.
- **Calcul de coût :** Extrapolation sur une conversation de 10 tours $=$ total des tokens $\times$ grille tarifaire officielle en vigueur. L'URL et la date d'extraction de la grille sont consignées dans `env.json`.
- **Critères cibles :**
  - Borne supérieure de l'IC bootstrap à 95 % sur le P95 TTFT $< 1,5\text{ s}$.
  - Coût moyen d'une session de 10 tours $< 0,01\ \$$.
- **Conformité modèle :** Signalement immédiat en tête de rapport si le modèle physique retourné diverge du modèle cible contractualisé.

---

### T4 — Matrice d'Autorisation et Anti-Recoupement
- **Cartographie :** Découverte exhaustive des routes `app/api/**/route.ts` $\times$ verbes HTTP exportés $\times$ 6 identités de test :
  1. Anonyme (sans cookie de session).
  2. Utilisateur B2C standard.
  3. Salarié bénéficiaire d'organisation (B2B).
  4. Administrateur de l'organisation A.
  5. Administrateur d'une organisation tierce B (Cross-tenant).
  6. Super-administrateur global.
- **Référence d'attente :** Rédaction de `expected-status.json` établie **exclusivement** à partir de la documentation des spécifications fonctionnelles, sans lecture préalable du code d'implémentation. Les cas non tranchés par la spécification sont marqués `"UNSPECIFIED"`.
- **Exécution :** Requêtes HTTP réelles munies de cookies d'authentification valides ; contrôle des routes publiques et webhooks avec et sans jetons secrets / signatures.
- **Épreuve d'inférence statistique (Anti-recoupement) :**
  - Agrégations statistiques sur groupes de 5 et 6 individus ne différant que par un unique utilisateur : vérification mathématique de l'impossibilité de déduire une donnée individuelle.
  - Contrôle des groupes à homogénéité élevée ($\ge 90\%$).
- **Critères cibles :**
  - 0 divergence de code HTTP sur cellule interdite.
  - 0 code HTTP 2xx autorisé sur des données d'un tenant concurrent (cross-organization).
  - 0 information individuelle reconstituée par différentiation.
- **Témoin d'invalidité :** Neutralisation temporaire d'un contrôle de rôle sur branche éphémère : vérification que la matrice détecte immédiatement la régression, puis retour à la branche nominale.
- **Transparence :** Notification du volume brut d'anomalies relevées lors de la première passe d'exécution avant remédiation éventuelle.

---

### T5 — Scoring et Renormalisation Psychométrique
- **Tests de propriétés formelles (`fast-check`, $\ge 1 000$ tirages par propriété) :**
  1. Bornes : pour tout vecteur de réponses admissible, les scores appartiennent à $[0, 100]$.
  2. Monotonie : l'accroissement d'une réponse Likert ne diminue jamais le score de sa dimension ni le score global.
  3. Indépendance : les scores IQRH ne dépendent pas des dimensions ICR.
  4. Exhaustivité & Partition : tout profil psychométrique est assigné à exactement l'un des 12 profils du référentiel.
  5. Renormalisation ICR : invariance aux bornes ($0 \rightarrow 0$, $85 \rightarrow 100$), stricte monotonie.
- **Cas fixes :** Vérification sur les exemples numériques documentés dans les spécifications.
- **Impact sur base clonée :** Recalcul des seuils de criticité ICR (Faible / Modérée / Forte) avant et après renormalisation sur une copie isolée de la base de données, avec décompte exact des reclassements.
- **Témoin d'invalidité :** Altération volontaire de la formule de calcul sur branche éphémère provoquant la violation d'au moins une propriété formelle.

---

### T10 — Effacement, Export et Hygiène de Sécurité
- **Droit à l'effacement (RGPD) :** Génération d'un profil fictif disposant d'enregistrements dans chaque composant applicatif, déclenchement de la suppression, puis balayage programmatique de l'intégralité des tables du schéma Prisma pour certifier l'absence de données résiduelles associées à son identifiant (hors obligations légales documentées).
- **Exportabilité :** Contrôle de la complétude du format d'export JSON généré pour l'utilisateur.
- **Audit des dépendances :** Exécution de `npm audit --omit=dev` avec sauvegarde de la trace JSON brute.
- **Fuite de secrets :** Analyse exhaustive de l'arborescence et de l'historique Git à la recherche d'identifiants exposés (clés API, jetons cron), sans divulgation des valeurs en clair dans les rapports finaux.
- **En-têtes et Cookies :** Vérification des en-têtes HTTP de sécurité et des attributs de cookies (`HttpOnly`, `Secure`, `SameSite`).
- **Critères cibles :**
  - 0 enregistrement utilisateur résiduel non justifié.
  - 0 vulnérabilité de sévérité Haute ou Critique non couverte par une mesure d'atténuation.
  - 0 secret d'authentification valide présent dans l'historique versionné.

---

## 4. Traçabilité, Réconciliation et Rapport Final

- **Moteur de réconciliation (`verify-numbers`) :** Script automatisé extrayant les valeurs numériques des fichiers `result.json` de chaque banc pour alimenter les tables de restitution du mémoire. Vérification croisée avec les assertions textuelles du mémoire (`memoire-claims.json`) et signalement de tout décalage.
- **Double calcul indépendant :** Recalcul mathématique explicite des intervalles de Wilson et contrôle de la cohérence arithmétique des sommes de catégories.
- **Matrice de traçabilité (`TRACEABILITY.md`) :** Qualification de chaque affirmation selon 4 statuts univoques : `ÉTABLI`, `PARTIEL`, `NON ÉTABLI`, `RETIRÉ`.
- **Rapport consolidé (`REPORT.md`) :** Synthèse exhaustive associant chaque critère mesuré à son statut (`RESPECTÉ`, `NON RESPECTÉ`, `NON CONCLUANT`, `BLOQUÉ`), débutant systématiquement par le recensement exhaustif des défauts observés et la validation des tests témoins.
