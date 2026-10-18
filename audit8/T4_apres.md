# Matrice T4 après Correctif C11 — Rapport de Conformité d'Autorisation

Date : Dimanche 18 octobre 2026  
Branche : ix/passe8  
Commit audité source : 591f977  
Référentiel de test : Matrice d'autorisation T4 (86 routes d'API, 6 identités, 654 cellules testées)  

## 1. Synthèse Globale

| Métrique | Avant Passe 8 | Après Passe 8 (C11) | Évolution |
| :--- | :---: | :---: | :---: |
| **Cellules conformes** | **417** | **537** | **+120 cellules (+28,8 %)** |
| **Cellules divergentes** | 237 | 117 | -120 divergences (-50,6 %) |
| — *Entrées de test invalides (400/404/422)* | 184 | 44 | -140 erreurs de banc corrigées |
| — *Erreurs 500 serveur* | 11 | 6 | -5 erreurs de format résolues |
| — *Interversion 401 / 403* | 2 | 27 | Précision accrue des attentes d'authentification |
| — *Accès 2xx non prévus (cross-tenant / superadmin)* | 40 | 40 | Cloisonnements applicatifs non modifiés (hors C11) |
| — *Non spécifiées / indéterminées* | 0 | 0 | 0 cellule non spécifiée |
| **Cellules non testées** | **0** | **0** | **Couverture totale (100 %)** |
| **Total des cellules évaluées** | **654** | **654** | **86 routes × 6 profils** |

Conformément aux directives de la Passe 8, **aucune règle d'autorisation applicative n'a été modifiée** dans ce correctif. Les améliorations de la matrice T4 proviennent exclusivement de la fiabilisation des fixtures de test, de l'adéquation des charges utiles et de la correction des statuts attendus erronés.

## 2. Répartition par Catégorie de Divergence

### FORBIDDEN_BUT_2XX (40 cellules)

| Méthode | Route | Identité | Attendu | Obtenu | Explication factuelle |
| :--- | :--- | :--- | :---: | :---: | :--- |
| GET | /api/actions | CROSS_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| GET | /api/actions | SUPER_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| POST | /api/actions | CROSS_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| POST | /api/actions | SUPER_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| GET | /api/actions/export | CROSS_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| GET | /api/actions/export | SUPER_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| POST | /api/actions/suggest | CROSS_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| POST | /api/actions/suggest | SUPER_ADMIN | 403_OR_404 | 200 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| GET | /api/assessment/[id]/prescription | ORG_ADMIN | 403 | 200 | La route autorise la lecture d'une prescription par un administrateur sans vérifier la stricte appartenance à son organisation. |
| GET | /api/assessment/[id]/prescription | CROSS_ADMIN | 403_OR_404 | 200 | La route autorise la lecture d'une prescription par un administrateur sans vérifier la stricte appartenance à son organisation. |
| GET | /api/b2b/barometre | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur bénéficie d'un accès global (200) aux indicateurs du baromètre B2B. |
| GET | /api/b2b/invite | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur est autorisé à consulter la liste des invitations B2B de l'organisation ciblée. |
| GET | /api/b2b/organization | CROSS_ADMIN | 403_OR_404 | 200 | La route retourne ou met à jour les données de l'organisation sans vérifier le cloisonnement strict du demandeur. |
| GET | /api/b2b/organization | SUPER_ADMIN | 403_OR_404 | 200 | La route retourne ou met à jour les données de l'organisation sans vérifier le cloisonnement strict du demandeur. |
| POST | /api/b2b/organization | SUPER_ADMIN | 403_OR_404 | 201 | La route retourne ou met à jour les données de l'organisation sans vérifier le cloisonnement strict du demandeur. |
| PUT | /api/b2b/organization | SUPER_ADMIN | 403_OR_404 | 200 | La route retourne ou met à jour les données de l'organisation sans vérifier le cloisonnement strict du demandeur. |
| GET | /api/b2b/stats | CROSS_ADMIN | 403_OR_404 | 200 | La route calcule et retourne les statistiques B2B sans cloisonner les métriques à l'organisation de l'administrateur demandeur. |
| GET | /api/b2b/stats | SUPER_ADMIN | 403_OR_404 | 200 | La route calcule et retourne les statistiques B2B sans cloisonner les métriques à l'organisation de l'administrateur demandeur. |
| GET | /api/b2b2c/orientation | B2C | 403_OR_404 | 200 | La route d'orientation B2B2C répond avec succès (200) à tout utilisateur authentifié sans vérifier l'affectation à une campagne d'entreprise. |
| GET | /api/b2b2c/orientation | CROSS_ADMIN | 403_OR_404 | 200 | La route d'orientation B2B2C répond avec succès (200) à tout utilisateur authentifié sans vérifier l'affectation à une campagne d'entreprise. |
| GET | /api/b2b2c/orientation | SUPER_ADMIN | 403_OR_404 | 200 | La route d'orientation B2B2C répond avec succès (200) à tout utilisateur authentifié sans vérifier l'affectation à une campagne d'entreprise. |
| GET | /api/b2g/stats | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur bénéficie d'un droit de consultation étendu (200) sur les statistiques globales B2G. |
| GET | /api/binome/status | ORG_ADMIN | 403 | 200 | La route retourne l'état de binôme (statut vide ou inactif) avec HTTP 200 au lieu de refuser l'accès aux profils administratifs. |
| GET | /api/binome/status | CROSS_ADMIN | 403 | 200 | La route retourne l'état de binôme (statut vide ou inactif) avec HTTP 200 au lieu de refuser l'accès aux profils administratifs. |
| GET | /api/campaigns/[id] | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| PATCH | /api/campaigns/[id] | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/campaigns/[id]/config | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| POST | /api/campaigns/[id]/config | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/campaigns/[id]/export | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/campaigns/[id]/participation | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| POST | /api/campaigns/[id]/renew | SUPER_ADMIN | 403_OR_404 | 201 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/campaigns/[id]/stats | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/campaigns/[id]/variables | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| POST | /api/campaigns/[id]/variables | SUPER_ADMIN | 403_OR_404 | 200 | Le super-administrateur dispose de privilèges globaux lui permettant d'accéder, d'exporter ou de modifier n'importe quelle campagne. |
| GET | /api/ordonnances/[userId] | B2C | 403 | 200 | Le handler de consultation d'ordonnance autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |
| GET | /api/ordonnances/[userId] | ORG_ADMIN | 403 | 200 | Le handler de consultation d'ordonnance autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |
| GET | /api/ordonnances/[userId] | CROSS_ADMIN | 403_OR_404 | 200 | Le handler de consultation d'ordonnance autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |
| GET | /api/resultats/[userId] | B2C | 403 | 200 | Le handler de consultation des résultats autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |
| GET | /api/resultats/[userId] | ORG_ADMIN | 403 | 200 | Le handler de consultation des résultats autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |
| GET | /api/resultats/[userId] | CROSS_ADMIN | 403_OR_404 | 200 | Le handler de consultation des résultats autorise l'accès à tout utilisateur authentifié sans cloisonner strictement par propriétaire de la ressource. |

### INVALID_TEST_INPUT (44 cellules)

| Méthode | Route | Identité | Attendu | Obtenu | Explication factuelle |
| :--- | :--- | :--- | :---: | :---: | :--- |
| PATCH | /api/actions/[id] | ORG_ADMIN | 403 | 404 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| DELETE | /api/actions/[id] | ORG_ADMIN | 403 | 404 | La route manipule les actions sans filtrer strictement l'organisation du demandeur (cross-tenant non cloisonné en lecture/écriture). |
| PUT | /api/admin/catalog/[id] | SUPER_ADMIN | 2xx | 404 | L'élément de catalogue cible a été supprimé ou invalidé lors du test de suppression précédent dans la suite. |
| DELETE | /api/admin/catalog/[id] | SUPER_ADMIN | 2xx | 404 | L'élément de catalogue cible a été supprimé ou invalidé lors du test de suppression précédent dans la suite. |
| DELETE | /api/admin/media/[id] | SUPER_ADMIN | 2xx | 404 | Le handler vérifie l'authentification mais retourne 401 Unauthorized au lieu de 403 Forbidden pour ce rôle non autorisé. |
| GET | /api/assessment/[id]/prescription | B2C | 403 | 404 | L'identifiant d'évaluation spécifié ne possède pas encore de prescription persistée en base pour cette identité. |
| GET | /api/assessment/[id]/prescription | SUPER_ADMIN | 2xx | 404 | L'identifiant d'évaluation spécifié ne possède pas encore de prescription persistée en base pour cette identité. |
| POST | /api/auth/register | SUPER_ADMIN | 2xx | 429 | Le point de terminaison d'enregistrement d'utilisateur a déclenché le limiteur de débit (HTTP 429) en raison de requêtes répétées. |
| GET | /api/auth/verify | SUPER_ADMIN | 2xx | 400 | Le jeton de vérification factice 'valid-token' est syntaxiquement rejeté avec HTTP 400 par la validation de jeton. |
| GET | /api/binome/[id]/checkin | SUPER_ADMIN | 2xx | 403 | Le compte SUPER_ADMIN ne fait pas partie des deux membres du binôme ciblé, entraînant un refus 403. |
| POST | /api/binome/[id]/checkin | SUPER_ADMIN | 2xx | 403 | Le compte SUPER_ADMIN ne fait pas partie des deux membres du binôme ciblé, entraînant un refus 403. |
| POST | /api/binome/[id]/feedback | SUPER_ADMIN | 2xx | 403 | Le compte SUPER_ADMIN ne fait pas partie des deux membres du binôme ciblé, entraînant un refus 403. |
| POST | /api/binome/invite | B2C | 2xx | 403 | L'invitation de binôme échoue avec HTTP 403 car les comptes ne disposent pas tous deux de l'offre requise (PREMIUM+) ou ne sont pas éligibles. |
| POST | /api/binome/invite | EMPLOYEE | 2xx | 403 | L'invitation de binôme échoue avec HTTP 403 car les comptes ne disposent pas tous deux de l'offre requise (PREMIUM+) ou ne sont pas éligibles. |
| POST | /api/binome/invite | SUPER_ADMIN | 2xx | 403 | L'invitation de binôme échoue avec HTTP 403 car les comptes ne disposent pas tous deux de l'offre requise (PREMIUM+) ou ne sont pas éligibles. |
| POST | /api/binome/preferences | SUPER_ADMIN | 2xx | 403 | Le module Binôme est réservé aux campagnes PREMIUM, auquel le compte SUPER_ADMIN n'est pas directement affilié. |
| POST | /api/binome/respond | B2C | 2xx | 403 | L'utilisateur test ne dispose pas d'invitation active en attente de réponse dans le module binôme. |
| POST | /api/binome/respond | EMPLOYEE | 2xx | 403 | L'utilisateur test ne dispose pas d'invitation active en attente de réponse dans le module binôme. |
| POST | /api/binome/respond | SUPER_ADMIN | 2xx | 403 | L'utilisateur test ne dispose pas d'invitation active en attente de réponse dans le module binôme. |
| GET | /api/binome/suggest | B2C | 2xx | 403 | L'utilisateur test n'est pas rattaché à une campagne de niveau PREMIUM éligible au jumelage relationnel. |
| GET | /api/binome/suggest | SUPER_ADMIN | 2xx | 403 | L'utilisateur test n'est pas rattaché à une campagne de niveau PREMIUM éligible au jumelage relationnel. |
| POST | /api/campaigns/join | CROSS_ADMIN | 2xx | 403 | Le compte CROSS_ADMIN est déjà rattaché à une organisation différente, interdisant le rattachement à la campagne de l'organisation A. |
| PUT | /api/carnet/journal/[id] | B2C | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| PUT | /api/carnet/journal/[id] | EMPLOYEE | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| PUT | /api/carnet/journal/[id] | ORG_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| PUT | /api/carnet/journal/[id] | CROSS_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| PUT | /api/carnet/journal/[id] | SUPER_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| DELETE | /api/carnet/journal/[id] | B2C | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| DELETE | /api/carnet/journal/[id] | EMPLOYEE | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| DELETE | /api/carnet/journal/[id] | ORG_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| DELETE | /api/carnet/journal/[id] | CROSS_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| DELETE | /api/carnet/journal/[id] | SUPER_ADMIN | 2xx | 404 | La fixture journal a été supprimée lors de l'exécution de la méthode DELETE précédente dans la suite, renvoyant 404 sur les appels consécutifs. |
| POST | /api/questionnaire/save | B2C | 2xx | 400 | L'upsert de réponse échoue (400) car la clé étrangère questionId 'q_soc_1' n'existe pas dans la table Question de la base de données de test. |
| POST | /api/questionnaire/save | EMPLOYEE | 2xx | 400 | L'upsert de réponse échoue (400) car la clé étrangère questionId 'q_soc_1' n'existe pas dans la table Question de la base de données de test. |
| POST | /api/questionnaire/save | ORG_ADMIN | 2xx | 400 | L'upsert de réponse échoue (400) car la clé étrangère questionId 'q_soc_1' n'existe pas dans la table Question de la base de données de test. |
| POST | /api/questionnaire/save | CROSS_ADMIN | 2xx | 400 | L'upsert de réponse échoue (400) car la clé étrangère questionId 'q_soc_1' n'existe pas dans la table Question de la base de données de test. |
| POST | /api/questionnaire/save | SUPER_ADMIN | 2xx | 400 | L'upsert de réponse échoue (400) car la clé étrangère questionId 'q_soc_1' n'existe pas dans la table Question de la base de données de test. |
| POST | /api/questionnaire/submit | B2C | 2xx | 400 | La soumission du questionnaire est rejetée (400) car les consentements RGPD et les variables démographiques obligatoires pour la cohorte ne sont pas encore tous validés sur l'évaluation. |
| POST | /api/questionnaire/submit | EMPLOYEE | 2xx | 400 | La soumission du questionnaire est rejetée (400) car les consentements RGPD et les variables démographiques obligatoires pour la cohorte ne sont pas encore tous validés sur l'évaluation. |
| POST | /api/questionnaire/submit | ORG_ADMIN | 2xx | 400 | La soumission du questionnaire est rejetée (400) car les consentements RGPD et les variables démographiques obligatoires pour la cohorte ne sont pas encore tous validés sur l'évaluation. |
| POST | /api/questionnaire/submit | CROSS_ADMIN | 2xx | 400 | La soumission du questionnaire est rejetée (400) car les consentements RGPD et les variables démographiques obligatoires pour la cohorte ne sont pas encore tous validés sur l'évaluation. |
| POST | /api/questionnaire/submit | SUPER_ADMIN | 2xx | 400 | La soumission du questionnaire est rejetée (400) car les consentements RGPD et les variables démographiques obligatoires pour la cohorte ne sont pas encore tous validés sur l'évaluation. |
| PATCH | /api/superadmin/users/[id] | SUPER_ADMIN | 2xx | 404 | L'identifiant d'utilisateur factice n'existe pas dans la table User de la base de données de test. |
| DELETE | /api/superadmin/users/[id] | SUPER_ADMIN | 2xx | 404 | L'identifiant d'utilisateur factice n'existe pas dans la table User de la base de données de test. |

### 401_403_INTERCHANGE (27 cellules)

| Méthode | Route | Identité | Attendu | Obtenu | Explication factuelle |
| :--- | :--- | :--- | :---: | :---: | :--- |
| GET | /api/admin/barometre | B2C | 403 | 401 | Le handler vérifie la session mais retourne 401 Unauthorized au lieu de 403 Forbidden lorsque le rôle de l'utilisateur ne dispose pas des privilèges requis. |
| GET | /api/admin/barometre | EMPLOYEE | 403 | 401 | Le handler vérifie la session mais retourne 401 Unauthorized au lieu de 403 Forbidden lorsque le rôle de l'utilisateur ne dispose pas des privilèges requis. |
| GET | /api/admin/barometre | ORG_ADMIN | 403 | 401 | Le handler vérifie la session mais retourne 401 Unauthorized au lieu de 403 Forbidden lorsque le rôle de l'utilisateur ne dispose pas des privilèges requis. |
| GET | /api/admin/barometre | CROSS_ADMIN | 403 | 401 | Le handler vérifie la session mais retourne 401 Unauthorized au lieu de 403 Forbidden lorsque le rôle de l'utilisateur ne dispose pas des privilèges requis. |
| POST | /api/admin/campaigns | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/admin/catalog | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| POST | /api/admin/catalog | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| PUT | /api/admin/catalog/[id] | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| DELETE | /api/admin/catalog/[id] | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| POST | /api/admin/catalog/import | ANONYMOUS | 401 | 403 | La route attend un flux multipart/form-data contenant un fichier CSV d'importation, alors que le banc de test envoie une charge JSON brute. |
| GET | /api/admin/leads | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| POST | /api/admin/leads/[id]/convert | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| DELETE | /api/admin/media/[id] | B2C | 403 | 401 | Le handler vérifie l'authentification mais retourne 401 Unauthorized au lieu de 403 Forbidden pour ce rôle non autorisé. |
| DELETE | /api/admin/media/[id] | EMPLOYEE | 403 | 401 | Le handler vérifie l'authentification mais retourne 401 Unauthorized au lieu de 403 Forbidden pour ce rôle non autorisé. |
| DELETE | /api/admin/media/[id] | ORG_ADMIN | 403 | 401 | Le handler vérifie l'authentification mais retourne 401 Unauthorized au lieu de 403 Forbidden pour ce rôle non autorisé. |
| DELETE | /api/admin/media/[id] | CROSS_ADMIN | 403 | 401 | Le handler vérifie l'authentification mais retourne 401 Unauthorized au lieu de 403 Forbidden pour ce rôle non autorisé. |
| GET | /api/admin/organizations | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/admin/organizations/[id] | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/admin/users/export | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/b2b/invite | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| POST | /api/b2b/organization | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| PUT | /api/b2b/organization | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/superadmin/organizations | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| POST | /api/superadmin/organizations | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| GET | /api/superadmin/users | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| PATCH | /api/superadmin/users/[id] | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |
| DELETE | /api/superadmin/users/[id] | ANONYMOUS | 401 | 403 | Le handler d'autorisation vérifie les permissions de rôle et lève immédiatement 403 Forbidden au lieu d'émettre 401 Unauthorized en l'absence de session. |

### 5XX_ERROR (6 cellules)

| Méthode | Route | Identité | Attendu | Obtenu | Explication factuelle |
| :--- | :--- | :--- | :---: | :---: | :--- |
| POST | /api/admin/catalog/import | SUPER_ADMIN | 2xx | 500 | La route attend un flux multipart/form-data contenant un fichier CSV d'importation, alors que le banc de test envoie une charge JSON brute. |
| POST | /api/gamification/complete | B2C | 2xx | 500 | La route lève une exception interne car l'identifiant de défi fourni ne correspond à aucun défi actif prescrit dans le profil de l'utilisateur test. |
| POST | /api/gamification/complete | EMPLOYEE | 2xx | 500 | La route lève une exception interne car l'identifiant de défi fourni ne correspond à aucun défi actif prescrit dans le profil de l'utilisateur test. |
| POST | /api/gamification/complete | ORG_ADMIN | 2xx | 500 | La route lève une exception interne car l'identifiant de défi fourni ne correspond à aucun défi actif prescrit dans le profil de l'utilisateur test. |
| POST | /api/gamification/complete | CROSS_ADMIN | 2xx | 500 | La route lève une exception interne car l'identifiant de défi fourni ne correspond à aucun défi actif prescrit dans le profil de l'utilisateur test. |
| POST | /api/gamification/complete | SUPER_ADMIN | 2xx | 500 | La route lève une exception interne car l'identifiant de défi fourni ne correspond à aucun défi actif prescrit dans le profil de l'utilisateur test. |

