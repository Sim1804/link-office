# Journal des Points Bloquants — Passe 8

Ce document recense les tests préexistants ou contraintes techniques qui empêcheraient la validation normale d'un correctif.

*(Aucun test préexistant bloquant la suite de tests).*

---

## Failles d'autorisation réelles constatées lors de l'évaluation T4 (C11)

Conformément aux instructions de la Passe 8 (« *Ne modifie aucune règle d'autorisation de l'application dans ce correctif : si une vraie faille apparaît, note-la dans audit8/BLOQUANTS.md* »), les failles réelles suivantes ont été identifiées et tracées sans modification du code applicatif :

1. **Absence d'isolation multi-tenant sur les actions (`/api/actions`, `/api/actions/export`, `/api/actions/suggest`)** :
   - *Constat* : Un administrateur d'une organisation B (`CROSS_ADMIN`) accède en lecture (GET) et écriture (POST) aux plans d'actions de l'organisation A sans filtrage strict de la session tenant.
   - *Impact* : Fuite d'informations organisationnelles et possibilité d'altération de plan d'action inter-entreprises.

2. **Absence de cloisonnement tenant sur `/api/b2b/stats`** :
   - *Constat* : Un administrateur `CROSS_ADMIN` reçoit les statistiques agrégées sans restriction systématique à son propre `organizationId`.
   - *Impact* : Divulgation non autorisée de métriques RH globales.

3. **Absence de vérification d'appartenance de ressource sur `/api/ordonnances/[userId]` et `/api/resultats/[userId]`** :
   - *Constat* : Tout utilisateur authentifié (ex: compte B2C ou administrateur) fournissant le `userId` d'un tiers peut consulter ses ordonnances et résultats d'évaluation sans vérification que `session.user.id === params.userId`.
   - *Impact* : Atteinte à la confidentialité des données de santé/bien-être psychométrique.

4. **Absence de validation tenant sur `/api/assessment/[id]/prescription` pour les rôles administratifs** :
   - *Constat* : Un administrateur d'organisation (`ORG_ADMIN` ou `CROSS_ADMIN`) peut interroger une prescription par son `id` sans vérification que l'évaluation appartient à un collaborateur de son organisation.
   - *Impact* : Divulgation de prescriptions individuelles hors périmètre organisationnel.

