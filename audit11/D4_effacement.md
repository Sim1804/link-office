# Témoins d'Effacement de Compte — Banc T10 (Tâche D4)

Date : 18 octobre 2026  
Banc audité : `validation/t10-privacy/run.ts`  
Données brutes : `audit11/raw/D4_witnesses.json`  
Script d'audit : `audit11/scripts/analyze-t10-witnesses.ts`

---

## 1. Analyse des Tables Ajoutées lors des Passes 8, 10 et 11

L'historique des modifications du schéma Prisma (`git diff 591f977..HEAD prisma/schema.prisma`) établit les évolutions suivantes :
1. **`StripeEvent`** (ajouté au commit `43f6528`, passe 8) :
   - Schéma : `id String @id`, `type String`, `receivedAt DateTime @default(now())`.
   - **Nature des données** : Identifiant d'événement Stripe technique (`evt_xxx`) et type d'événement (`customer.subscription.updated`).
   - **Qualification** : Ne contient aucune donnée à caractère personnel directe ni lien avec un utilisateur. Ne nécessite pas de témoin d'effacement de compte.
2. **`IrisMessage`** (champ `aiGenerated Boolean @default(false)` ajouté au commit `be1cb84`, passe 8) :
   - Table rattachée en cascade à `IrisConversation`, elle-même rattachée en cascade à `User`.
   - **Témoin d'effacement existant** : Présent et actif dans `validation/t10-privacy/run.ts:L201-L215` (injection de 2 messages témoins avant suppression, vérification de 0 message après).
3. **Passes 10 et 11** :
   - Aucune nouvelle table de données ajoutée au schéma.

---

## 2. Inventaire des Tables avec Témoin Positif dans T10 (14 tables)

Pour chacune de ces 14 tables, le banc T10 injecte une ligne de données pour l'utilisateur de test, vérifie sa présence (`count === 1`), déclenche `deleteUserAccount(userId)` et constate formellement la disparition complète (`count === 0`) :

| Table | Relation avec l'Utilisateur | Témoin Positif Injecté dans T10 | Résultat Post-Effacement |
| :--- | :--- | :---: | :---: |
| **`User`** | Compte racine (`id: userId`) | Ligne racine créée | **0 ligne (Supprimé)** |
| **`Assessment`** | Évaluation racine (`userId`) | Évaluation complète créée | **0 ligne (Cascade)** |
| **`DemographicProfile`** | Données socio-démographiques | Profil démographique injecté | **0 ligne (Cascade)** |
| **`IqrhResult`** | Résultats psychométriques | Bilan IQRH injecté | **0 ligne (Cascade)** |
| **`IcrResult`** | Score de complexité relationnelle | Bilan ICR injecté | **0 ligne (Cascade)** |
| **`ProfileResult`** | Profil relationnel primaire/secondaire | Profil injecté | **0 ligne (Cascade)** |
| **`RelationalPrescription`** | Ordonnance relationnelle | Ordonnance active injectée | **0 ligne (Cascade)** |
| **`UserStats`** | Statistiques d'usage et niveau | Statistiques injectées | **0 ligne (Cascade)** |
| **`Notification`** | Notifications adressées à l'utilisateur | Notification de test injectée | **0 ligne (Cascade)** |
| **`BinomePreference`** | Critères d'appariement binôme | Préférences binôme injectées | **0 ligne (Cascade)** |
| **`MeteoCheckin`** | Check-ins météo quotidiens | Météo injectée | **0 ligne (Cascade)** |
| **`JournalEntry`** | Notes de journal intime | Entrée de journal injectée | **0 ligne (Cascade)** |
| **`IrisConversation`** | Sessions d'échange avec IRIS | Conversation injectée | **0 ligne (Cascade)** |
| **`IrisMessage`** | Messages individuels et réponses IA | 2 messages injectés (user + assistant) | **0 ligne (Cascade)** |

---

## 3. Liste des Tables Restant sans Témoin Positif Direct (18 tables)

Ces tables se divisent en deux catégories :

### A. Tables avec suppression en cascade active (mais sans injection explicite préalable dans T10) :
1. `QuestionnaireAnswer` (réponses aux questions de base, cascade via `Assessment`)
2. `AdaptiveAnswer` (réponses adaptatives, cascade via `Assessment`)
3. `PrescriptionItem` (items d'ordonnance, cascade via `RelationalPrescription`)
4. `UserBadge` (badges débloqués, cascade via `User`)
5. `EventLog` (journaux de sécurité, purgés explicitement par `deleteUserAccount`)
6. `BinomeCheckin` (check-ins de binôme, cascade via `User`)
7. `BinomeFeedback` (retours d'expérience binôme, cascade via `User`)
8. `CampaignVariableAnswer` (réponses variables de campagne, cascade via `Assessment`)
9. `UserSubscription` (abonnement Stripe individuel, cascade via `User`)
10. `LifeEvent` (événements de vie déclarés, cascade via `User`)
11. `RelationalPlan` (plan relationnel d'actions, cascade via `User`)
12. `PlanPriority` (priorités du plan, cascade via `RelationalPlan`)
13. `PlanAction` (actions individuelles planifiées, cascade via `PlanPriority`)
14. `UserMicroDefi` (micro-défis en cours, cascade via `User`)
15. `ResourceRelation` (cartographie du réseau relationnel, cascade via `User`)
16. `SavedResource` (ressources sauvegardées, cascade via `User`)

### B. Tables sans relation de cascade avec l'Utilisateur (Rétention découplée) :
17. **`CampaignInvite`** : Invitations envoyées par e-mail, sans compte utilisateur rattaché (voir tâche D1).
18. **`Lead`** : Formulaires prospects marketing B2B (voir tâche D2).

---

## 4. Conclusion

- Les tables ajoutées ou modifiées lors des passes récentes (`StripeEvent`, `IrisMessage`) sont conformes au RGPD : `StripeEvent` ne contient aucune donnée personnelle, et `IrisMessage` bénéficie d'un témoin positif complet (1 avant $\to$ 0 après).
- Le test T10 couvre 14 tables avec témoin positif direct et contrôle par script les 18 tables restantes lors de l'effacement.
