# Constat sur les Contacts de l'Organisation (Tâche D3)

Date : 18 octobre 2026  
Modèle audité : `Organization` ([prisma/schema.prisma:L463-L490](file:///d:/Projects/link-office/prisma/schema.prisma#L463-L490))  
Statut : **Constat uniquement (aucun correctif, conforme aux consignes)**

---

## 1. Inventaire des Champs de Contact de l'Organisation

Définition des champs pertinents dans le modèle `Organization` :
```prisma
model Organization {
  id         String           @id @default(cuid())
  name       String
  type       OrganizationType
  siren      String?
  domainName String?
  codeAccess String           @unique
  logoUrl    String?

  // Champs de contact pour le contrat partenaire
  contactName      String?
  contactEmail     String?
  contactPhone     String?
  contractType     String?
  startDate        DateTime?
  endDate          DateTime?
  targetPopulation Int?
  territory        String?
  quota            Int?

  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt
  ...
}
```

---

## 2. Qualification des Données : Personne Physique vs Personne Morale

Conformément à la consigne, pour chaque champ de contact, examen de la qualification juridique au sens du RGPD (article 4.1 du RGPD) :

| Champ | Type Prisma | Contenu Attendu | Donnée d'une Personne Physique ? | Justification RGPD |
| :--- | :---: | :--- | :---: | :--- |
| **`contactName`** | `String?` | Prénom et nom du référent ou interlocuteur contractuel (ex: "Alice Dupont", DRH). | **OUI** | Identifie directement une personne physique dans l'entreprise cliente. |
| **`contactEmail`** | `String?` | Adresse électronique du point de contact. | **OUI / NON** (selon contenu) | • **OUI** si adresse nominative (ex: `alice.dupont@novatech-conseil.fr`).<br>• **NON** si boîte fonctionnelle impersonnelle (ex: `drh@novatech-conseil.fr` ou `contact@novatech.fr`).<br>*Par précaution juridique, ce champ doit être traité comme donnée personnelle sauf validation d'une adresse générique.* |
| **`contactPhone`** | `String?` | Numéro de téléphone de contact. | **OUI / NON** (selon contenu) | • **OUI** si ligne directe personnelle ou numéro mobile professionnel individuel.<br>• **NON** s'il s'agit du numéro du standard général de l'entreprise. |
| **`name`** | `String` | Raison sociale de l'organisation. | **NON** | Identifie une personne morale (société commerciale, collectivité). |
| **`siren`** | `String?` | Numéro SIREN (9 chiffres). | **NON** | Identifiant au répertoire SIRENE d'une personne morale (hors entreprise individuelle). |
| **`domainName`** | `String?` | Nom de domaine internet (ex: `novatech-conseil.fr`). | **NON** | Infrastructure technique de la personne morale. |

---

## 3. Absence de Règle d'Effacement à la Clôture de l'Organisation

L'audit approfondi de la base de données et du code applicatif établit les faits suivants :
1. **Absence de statut de clôture pour l'Organisation** : Le modèle `Organization` ne dispose d'aucun champ d'état (`status` ou `isArchived`). Il possède uniquement une date de début et de fin de contrat (`startDate`, `endDate`).
2. **Absence d'effacement automatique à l'échéance contractuelle** : L'arrivée à échéance (`endDate < NOW()`) ne déclenche aucune suppression, ni anonymisation, ni archivage des champs `contactName`, `contactEmail` et `contactPhone`.
3. **Absence de route d'effacement** : Il n'existe aucune route API d'effacement d'une organisation dans `app/api/b2b/organization` ni dans `app/api/superadmin/organizations`.
4. **Impact RGPD** : Les coordonnées nominatives du représentant de l'organisation restent stockées de manière permanente en base de données PostgreSQL, sans limitation de durée, même après la fin de la relation contractuelle.

---

## 4. Recommandation pour l'Auteur

Lorsqu'une politique de fin de contrat sera formalisée :
- Prévoir une tâche de purge ou d'anonymisation des champs `contactName`, `contactEmail`, `contactPhone` au-delà du délai légal de prescription commerciale (5 ans selon l'article L110-4 du Code de commerce pour les pièces contractuelles, ou 3 ans pour la simple prospection).
