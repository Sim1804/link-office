# Spécification et Critères Figés — T10 : Effacement, Export, Hygiène

## Critères du Protocole (docs/validation-protocol.md)

1. **Effacement RGPD & Lignes Résiduelles :**
   - Créer un utilisateur de test avec des données injectées dans **toutes les fonctionnalités applicatives** (évaluation, réponses, profil démographique, résultats IQRH/ICR/Profil, ordonnance, items d'ordonnance, journal, météo, notifications, badges, statistiques, conversations et messages IRIS, binôme, carnet).
   - Déclencher le processus d'effacement de l'utilisateur (via la route de suppression `/api/superadmin/users/[id]`).
   - Extraire dynamiquement la liste exhaustive de **toutes les tables du schéma Prisma** et interroger chaque table pour vérifier l'absence d'identifiants résiduels (`userId`, clé étrangère ou liaison d'évaluation).
   - Comptabiliser précisément le nombre de lignes résiduelles par table.
   - Critère cible : **0 ligne résiduelle** (hors éventuelle obligation de rétention légale explicitement documentée).

2. **Droit à la Portabilité (Export RGPD) :**
   - Vérifier la capacité d'export intégral de l'ensemble des données personnelles associées à l'utilisateur sous format exploitable (JSON).

3. **Audit de Sécurité des Dépendances :**
   - Exécution de `npm audit --omit=dev --json` et conservation intégrale du flux brut dans `raw/npm-audit.json`.
   - Critère cible : **0 avis de vulnérabilité High ou Critical** sans mitigation documentée.

4. **Recherche de Secrets dans l'Historique Git :**
   - Analyse automatisée de l'intégralité de l'historique des commits Git (recherche de clés privées, mots de passe, tokens d'API, et chaîne historique sensible telle que `?secret=` sur les cron jobs).
   - Règle de confidentialité : Lister chaque occurrence (commit, fichier, nature du secret) **sans jamais afficher la valeur brute du secret** dans les rapports ou logs publics.
   - Critère cible : **0 secret actif ou non révoqué dans l'historique**.

5. **Entêtes de Sécurité HTTP & Drapeaux de Cookies :**
   - Contrôle des en-têtes HTTP de sécurité sur le serveur de production : `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`.
   - Vérification des drapeaux de sécurité sur les cookies de session Auth.js (`HttpOnly`, `SameSite`, `Secure`).
