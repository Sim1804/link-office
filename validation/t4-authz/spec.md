# Spécification et Critères Figés — T4 : Matrice d'Autorisation et Recoupement

## Critères du Protocole (docs/validation-protocol.md)

1. **Cartographie Exhaustive :**
   - Découverte automatique de l'ensemble des routes sous `app/api/**/route.ts`.
   - Évaluation de chaque verbe HTTP exporté (GET, POST, PUT, PATCH, DELETE) contre **6 identités de test distinctes** :
     1. `ANONYMOUS` : Requête brute sans cookie de session.
     2. `B2C` : Utilisateur individuel enregistré sans rattachement à une organisation.
     3. `EMPLOYEE` : Salarié lié à l'Organisation A (rôle `EMPLOYEE`).
     4. `ORG_ADMIN` : Administrateur de l'Organisation A (rôle `ADMIN_B2B`).
     5. `CROSS_ADMIN` : Administrateur d'une Organisation concurrente B (rôle `ADMIN_B2B` ou `ADMIN_B2B2C`).
     6. `SUPER_ADMIN` : Administrateur de la plateforme Link Office.

2. **Référence d'Attente (`expected-status.json`) :**
   - Rédigé **exclusivement** à partir des spécifications fonctionnelles des rôles (documentation `docs/CORRECTIONS.md` et référentiel produit), sans inspection du code applicatif des handlers.
   - Toute cellule non tranchée explicitement par la documentation est étiquetée `"UNSPECIFIED"` et isolée dans le rapport.

3. **Exécution Réelle HTTP :**
   - Envoi de requêtes HTTP réelles (`fetch`) avec de véritables cookies de session signés Auth.js (`authjs.session-token`).
   - Routes protégées par secret machine ou signature (endpoints cron avec `Authorization: Bearer`, webhooks Stripe avec signature) testées avec et sans secret/signature valide.

4. **Épreuve d'Inférence Statistique et Anti-Recoupement :**
   - Test sur des groupes de 5 et 6 répondants différant par un seul individu : vérification algorithmique qu'aucune donnée individuelle (score, dimension, situation) n'est dérivable par soustraction des agrégats ($S_6 - S_5$).
   - Test sur groupe à forte homogénéité ($\ge 90\%$ de réponses identiques) : vérification du masquage ou de la suppression secondaire pour prévenir la fuite d'attribut.

5. **Critères Cibles :**
   - 0 divergence constatée sur cellule interdite (statuts attendus 401/403/404 respectés).
   - 0 code HTTP 2xx autorisé sur une ressource appartenant à un tenant concurrent (Cross-Tenant).
   - 0 valeur individuelle reconstructible par recoupement.

6. **Témoin d'Invalidité :**
   - Altération temporaire d'un contrôle d'autorisation sur branche éphémère (ou suppression d'une clause de tenant).
   - Détection obligatoire de la faille par la matrice d'audit.
   - Restauration de l'état nominal.
