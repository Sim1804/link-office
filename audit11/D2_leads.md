# Constat de Rétention et Effacement — Lead (Tâche D2 / Question Q4)

Date : 18 octobre 2026  
Modèle audité : `Lead` ([prisma/schema.prisma:L609-L621](file:///d:/Projects/link-office/prisma/schema.prisma#L609-L621))  
Statut : **Constat uniquement (en attente de DECISIONS_AUTEUR.md)**  
Règle appliquée : « Ce bloc ne s’exécute pour chaque point que si DECISIONS_AUTEUR.md contient la réponse correspondante. Sans réponse : écris le constat, ne change rien. »

---

## 1. Inventaire des Champs et Données Personnelles

Définition du modèle `Lead` dans le schéma Prisma :
```prisma
model Lead {
  id             String   @id @default(cuid())
  organization   String
  contactName    String
  email          String
  phone          String?
  planType       String
  companySize    String?
  populationSize String?
  beneficiaries  String?
  status         String   @default("NEW")
  createdAt      DateTime @default(now())
}
```

### Analyse des champs :
- **`contactName` (String)** : **Donnée personnelle d'une personne physique**. Prénom et nom du contact référent ayant formulé la demande commerciale.
- **`email` (String)** : **Donnée personnelle d'une personne physique**. Adresse électronique professionnelle ou personnelle de contact.
- **`phone` (String?)** : **Donnée personnelle d'une personne physique** (optionnelle). Numéro de téléphone direct ou standard.
- **`organization` (String)** : Raison sociale de la personne morale cliente ou prospecte.
- **`planType`, `companySize`, `populationSize`, `beneficiaries`** : Caractéristiques commerciales du besoin d'accompagnement.
- **`status` (String)** : Statut commercial (`NEW`, `CONTACTED`, `CONVERTED`, etc.).
- **`createdAt` (DateTime)** : Horodatage d'enregistrement de la demande.

---

## 2. Comportement Actuel face à l'Effacement et au Nettoyage

1. **Effacement de compte utilisateur (`deleteUserAccount`)** :
   - Fichier : [`src/lib/user/account-service.ts`](file:///d:/Projects/link-office/src/lib/user/account-service.ts)
   - **Comportement actuel** : La table `Lead` est totalement découplée de la table `User` (les prospects n'étant pas encore utilisateurs de la plateforme SaaS). La suppression d'un compte utilisateur ne supprime aucune ligne dans `Lead`.
2. **Cron de nettoyage périodique (`app/api/cron/cleanup/route.ts`)** :
   - Fichier : [`app/api/cron/cleanup/route.ts`](file:///d:/Projects/link-office/app/api/cron/cleanup/route.ts)
   - **Comportement actuel** : Aucune routine de purge n'existe pour `Lead`. Les coordonnées des prospects demeurent indéfiniment en base de données.
3. **Conformité au Référentiel CNIL** :
   - La norme CNIL (Gestion des fichiers de prospects et clients) limite la conservation des données de prospects non convertis à un maximum de **3 ans** à compter de leur collecte ou du dernier contact émanant du prospect.

---

## 3. Options d'Implémentation Prêtes pour la Décision Auteur (Q4)

Dès qu'une durée de rétention sera validée par l'auteur dans `DECISIONS_AUTEUR.md` (ex: `IRIS_LEAD_RETENTION_DAYS=1095` pour 3 ans, ou `365` pour 1 an) :
1. Ajout de la purge automatique dans `app/api/cron/cleanup/route.ts` :
   ```typescript
   const leadRetentionDays = parseInt(process.env.IRIS_LEAD_RETENTION_DAYS || "1095", 10);
   const leadCutoff = new Date(Date.now() - leadRetentionDays * 24 * 60 * 60 * 1000);
   const deletedLeads = await prisma.lead.deleteMany({
     where: { status: { not: "CONVERTED" }, createdAt: { lt: leadCutoff } }
   });
   ```
2. Documentation de la variable `IRIS_LEAD_RETENTION_DAYS` dans `.env.example`.
3. Tests automatisés vérifiant la purge sélective des leads expirés sans affecter les leads récents.
