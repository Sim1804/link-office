# Constat de Rétention et Effacement — CampaignInvite (Tâche D1 / Question Q3)

Date : 18 octobre 2026  
Modèle audité : `CampaignInvite` ([prisma/schema.prisma:L542-L553](file:///d:/Projects/link-office/prisma/schema.prisma#L542-L553))  
Statut : **Constat uniquement (en attente de DECISIONS_AUTEUR.md)**  
Règle appliquée : « Ce bloc ne s’exécute pour chaque point que si DECISIONS_AUTEUR.md contient la réponse correspondante. Sans réponse : écris le constat, ne change rien. »

---

## 1. Inventaire des Champs et Données Personnelles

Définition du modèle `CampaignInvite` dans le schéma Prisma :
```prisma
model CampaignInvite {
  id         String   @id @default(cuid())
  campaignId String
  email      String
  status     String   @default("INVITED") // INVITED | ACTIVATED | STARTED | COMPLETED
  invitedAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  @@unique([campaignId, email])
  @@index([campaignId, status])
}
```

### Analyse des champs :
- **`email` (String)** : **Donnée personnelle d'une personne physique**. Adresse électronique professionnelle ou personnelle du collaborateur invité par l'administrateur de son organisation.
- **`id` (String)** : Identifiant technique interne (cuid).
- **`campaignId` (String)** : Référence technique vers la campagne parente.
- **`status` (String)** : État d'avancement du cycle d'invitation (`INVITED`, `ACTIVATED`, `STARTED`, `COMPLETED`).
- **`invitedAt` (DateTime)** : Horodatage d'émission de l'invitation.
- **`updatedAt` (DateTime)** : Horodatage de dernière mise à jour.
- **Note sur nom et jeton** : Le modèle ne comporte aucun champ `name` / `nom` ni `token` / `jeton` dédié (l'accès se fait via le code d'accès de campagne `codeAccess` ou par authentification sur l'e-mail).

---

## 2. Comportement Actuel face à l'Effacement et au Nettoyage

1. **Effacement de compte utilisateur (`deleteUserAccount`)** :
   - Fichier : [`src/lib/user/account-service.ts`](file:///d:/Projects/link-office/src/lib/user/account-service.ts)
   - **Comportement actuel** : `CampaignInvite` n'a aucune relation de clé étrangère avec la table `User`. Lorsqu'un utilisateur demande l'effacement de son compte via la procédure RGPD, les lignes `CampaignInvite` associées à son adresse e-mail **ne sont pas supprimées**.
2. **Cron de nettoyage périodique (`app/api/cron/cleanup/route.ts`)** :
   - Fichier : [`app/api/cron/cleanup/route.ts`](file:///d:/Projects/link-office/app/api/cron/cleanup/route.ts#L12-L35)
   - **Comportement actuel** : Le cron actuel ne purge que les conversations et messages de l'agent IRIS (`IrisConversation`, `IrisMessage`) selon la variable `IRIS_TRANSCRIPT_RETENTION_DAYS`. **Aucune purge des invitations n'est effectuée**.
3. **Suppression de campagne** :
   - En cas de suppression explicite d'une `Campaign` en base, la contrainte `@relation(..., onDelete: Cascade)` supprime les invitations rattachées. En revanche, la simple clôture d'une campagne (`status = CLOSED`) conserve les lignes en base indéfiniment.

---

## 3. Options d'Implémentation Prêtes pour la Décision Auteur (Q3)

Dès qu'une durée de rétention sera validée par l'auteur dans `DECISIONS_AUTEUR.md` (ex: `IRIS_INVITE_RETENTION_DAYS=90`) :
1. Ajout de la purge automatique dans `app/api/cron/cleanup/route.ts` :
   ```typescript
   const inviteRetentionDays = parseInt(process.env.IRIS_INVITE_RETENTION_DAYS || "90", 10);
   const inviteCutoff = new Date(Date.now() - inviteRetentionDays * 24 * 60 * 60 * 1000);
   const deletedInvites = await prisma.campaignInvite.deleteMany({
     where: { status: "INVITED", invitedAt: { lt: inviteCutoff } }
   });
   ```
2. Documentation de la variable `IRIS_INVITE_RETENTION_DAYS` dans `.env.example`.
3. Tests de non-régression avec invitations de 10 jours et invitations antérieures au seuil.
