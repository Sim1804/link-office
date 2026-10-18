# Questions pour l'Auteur — Passe 10

Ce document recense les interrogations relatives aux règles métier, spécifications d'autorisation ou arbitrages de conservation des données.

---

## Q1 — Attentes des Routes de Consultation Individuelle pour les Profils Administrateurs (V1)
- **Routes concernées** : `GET /api/resultats/[userId]`, `GET /api/ordonnances/[userId]`, `GET /api/assessment/[id]/prescription`
- **Contexte** : Dans la matrice T4, les attentes pour `ORG_ADMIN` et `CROSS_ADMIN` sont fixées à `403` ou `403_OR_404`. Or, le générateur de test passe comme paramètre d'URL le `userId` et l'`assessmentId` propres à l'administrateur appelant lui-même.
- **Règle métier observée dans le code** : Tout utilisateur connecté peut consulter son propre bilan personnel (`session.user.id === userId`), qu'il soit salarié ou administrateur. En revanche, si un administrateur tente de consulter le bilan d'un tiers (collaborateur de son entreprise ou d'une autre entreprise), la route lève immédiatement HTTP 403 Forbidden (`Interdit — Secret statistique et confidentialité garantis`).
- **Question pour l'auteur** :
  1. Confirmez-vous que les administrateurs ont le droit de consulter leurs propres bilans personnels (auquel cas l'attente de la matrice pour ces cellules doit être corrigée en `200`) ?
  2. Si l'objectif du test était de valider l'interdiction de consulter le bilan d'un tiers, confirmez-vous que le générateur de test doit injecter l'identifiant d'un utilisateur cible différent de l'appelant (`targetUserId !== session.user.id`) pour attendre un `403` ?

---

## Q2 — Prérogatives du SUPER_ADMIN sur les Ressources Multi-Organisations (V1 & V7)
- **Contexte** : Dans la matrice T4, le rôle `SUPER_ADMIN` obtient HTTP 200 sur la plupart des routes de campagnes, organisations et prescriptions de tous les tenants.
- **Question pour l'auteur** : Le `SUPER_ADMIN` doit-il pouvoir lire et modifier les ressources de toute organisation par conception (supervision et support technique de la plateforme SaaS), ou un cloisonnement doit-il lui être appliqué ?

---

## Q3 — Politique de Rétention des Invitations de Campagne non Activées (V4)
- **Modèle concerné** : `CampaignInvite` (`prisma/schema.prisma` l. 542-553)
- **Données personnelles identifiées** : `email String` (adresse e-mail professionnelle de collaborateurs invités par leur employeur).
- **Constat** : Ce modèle n'a pas de lien de clé étrangère avec la table `User` (car l'invité n'a pas encore de compte au moment de l'invitation). Par conséquent, ces adresses e-mails ne sont pas supprimées par la suppression d'un compte utilisateur (`deleteUserAccount`).
- **Question pour l'auteur** : Quelle politique de purge et de rétention souhaitez-vous appliquer sur les e-mails de `CampaignInvite` ?
  - Option A : Purge automatique des invitations non activées à la clôture de la campagne (`Campaign.status = CLOSED`).
  - Option B : Rétention glissante maximale de 90 jours après envoi (`invitedAt + 90j`), puis suppression automatique par tâche cron.

---

## Q4 — Politique de Conservation des Contacts Prospects Commerciaux (V4)
- **Modèle concerné** : `Lead` (`prisma/schema.prisma` l. 609-621)
- **Données personnelles identifiées** : `contactName String`, `email String`, `phone String?`.
- **Constat** : Ce modèle enregistre les demandes de devis et prises de contact B2B issues du site marketing public. Il ne possède aucun lien avec un compte utilisateur `User` applicatif.
- **Question pour l'auteur** : Confirmez-vous la conformité avec le référentiel CNIL de gestion des prospects commerciaux (conservation maximale de 3 ans à compter du dernier contact émanant du prospect, puis purge automatique) ?

