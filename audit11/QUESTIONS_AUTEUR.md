# Questions pour l'Auteur — Passe 11

Ce document recense les interrogations et arbitrages métier nécessitant validation de l'auteur.

---

## Q1 — Attentes des Routes de Consultation de ses Propres Données (Self-Reads)
- **Routes concernées** :
  - `GET /api/resultats/[userId]` (pour `B2C`, `ORG_ADMIN`, `CROSS_ADMIN`)
  - `GET /api/ordonnances/[userId]` (pour `B2C`, `ORG_ADMIN`, `CROSS_ADMIN`)
  - `GET /api/assessment/[id]/prescription` (pour `B2C`, `ORG_ADMIN`, `CROSS_ADMIN`)
  - `GET /api/binome/status` (pour `ORG_ADMIN`, `CROSS_ADMIN`)
  - `GET /api/b2b/organization` (pour `CROSS_ADMIN`)
  - `GET /api/actions` et `GET /api/actions/export` (pour `CROSS_ADMIN`)
- **Constat** : Le harnais de test de la matrice T4 injecte le `userId` ou `organizationId` propre à l'utilisateur connecté lui-même. L'appelant reçoit donc ses propres données personnelles ou d'entreprise (HTTP 200). La matrice attendait un rejet `403` ou `403_OR_404`.
- **Question pour l'auteur** :
  1. Confirmez-vous que les utilisateurs (y compris administrateurs et citoyens B2C) ont le droit légitime de consulter leurs propres bilans et ressources personnelles (auquel cas l'attente de la matrice pour ces cellules doit être corrigée en `200`) ?
  2. Si le test vise à valider l'interdiction d'accéder aux données d'un tiers, confirmez-vous que le harnais de test doit injecter l'identifiant d'un utilisateur cible différent (`targetUserId !== session.user.id`) pour attendre un statut `403` ?

---

## Q2 — Prérogatives du SUPER_ADMIN sur les Résultats Individuels Cross-Tenant
- **Routes concernées** :
  - `GET /api/resultats/[userId]`
  - `GET /api/ordonnances/[userId]`
  - `GET /api/assessment/[id]/prescription`
- **Constat** : Le code applicatif comporte expressément la clause d'exemption `&& session.user.role !== "SUPER_ADMIN"`. Un SUPER_ADMIN peut ainsi accéder aux bilans individuels et ordonnances de n'importe quel collaborateur de n'importe quelle entreprise.
- **Question pour l'auteur** : Le rôle SUPER_ADMIN doit-il conserver cet accès complet à des fins de maintenance et support technique de la plateforme, ou le secret statistique individuel absolu doit-il s'appliquer même au SUPER_ADMIN (rejet 403 strict pour tout compte qui n'est pas le propriétaire de la ressource) ?

---

## Q3 — Durée de Rétention des Invitations de Campagne non Activées (`CampaignInvite`)
- **Modèle concerné** : `CampaignInvite` ([prisma/schema.prisma:L542-L553](file:///d:/Projects/link-office/prisma/schema.prisma#L542-L553))
- **Constat** : Les adresses e-mail de collaborateurs invités à une campagne mais n'ayant pas créé de compte restent stockées indéfiniment en base de données, sans purge par le cron de nettoyage ni suppression lors de la clôture de la campagne.
- **Question pour l'auteur** : Quelle durée de rétention maximale (en jours) souhaitez-vous appliquer pour la purge automatique des invitations non activées (`status = 'INVITED'`) via la variable `IRIS_INVITE_RETENTION_DAYS` (ex: 30, 60, ou 90 jours) ?

---

## Q4 — Durée de Rétention des Formulaires de Contact Prospects (`Lead`)
- **Modèle concerné** : `Lead` ([prisma/schema.prisma:L531-L540](file:///d:/Projects/link-office/prisma/schema.prisma#L531-L540))
- **Constat** : Les formulaires de contact commerciaux (nom, e-mail, téléphone) sont conservés sans limite de durée dans la table `Lead`, sans purge programmée. Le référentiel CNIL préconise un effacement ou archivage au terme de 3 ans sans contact actif.
- **Question pour l'auteur** : Quelle durée de rétention maximale (en jours) souhaitez-vous fixer pour la purge automatique des leads inactifs via `IRIS_LEAD_RETENTION_DAYS` (ex: 1095 jours / 3 ans) ?

---

## Question Sécurité Couche 1 / Couche 2 (Issue de A4)
- **Constat** : La couche 1 (regex déterministe immédiate) a été ajustée pour atteindre 0,0 % de fausses alertes sur 90 messages médicaux et de vie courante. Sur le jeu FINAL scellé, elle capture 91,7 % des ingestions massives et 75 % des urgences de tierce personne, mais n'intercepte pas la détresse indirecte métaphorique (0,0 %), ce qui donne un rappel global de 60,0 %. Les messages non interceptés sont systématiquement transmis à la couche 2 (classifieur LLM avec repli fermé d'urgence vers le 3114/15).
- **Question pour l'auteur** : Faut-il formaliser dans la spécification que le seuil de rappel de 95 % s'applique au système complet en cascade (couche 1 + couche 2) et non à la couche 1 regex isolée ?


