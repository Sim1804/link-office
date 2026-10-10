# Spécification et Critères Figés — T2 : Charge Authentifiée sur Build de Production

## Critères du Protocole (docs/validation-protocol.md)

1. **Environnement & Topologie :**
   - Serveur de production Next.js compilé (`next build` puis `next start`) sur `http://localhost:3000`.
   - Base de données PostgreSQL réaliste avec $\ge 500$ comptes d'utilisateurs semés sur les 4 segments (B2B, B2B2C, B2G, B2C).
   - Machine de test répertoriée (CPU, RAM). Générateur de charge exécuté dans un processus séparé du serveur.

2. **Scénarios k6 :**
   - `setup()` : authentification préalable de chaque utilisateur virtuel via le flux Credentials Auth.js avec conservation du cookie de session réel.
   - Scénario 1 : Soumission de questionnaire psychométrique complet (30 réponses).
   - Scénario 2 : Consultation / lecture des résultats psychométriques.
   - Scénario 3 : Dialogue IRIS sous bouchon (stub à latence fixe étiqueté).
   - Scénario 4 : Salve de dialogue IRIS sous modèle réel Groq (étiqueté).

3. **Paliers de Charge & Répétitions :**
   - Paliers cibles : 10, 50, 100, 500 VU.
   - Montée progressive et paliers de maintien, 3 répétitions mesurées.

4. **Vérifications & Arrêt Automatique :**
   - Ensemble des statuts HTTP valides : 200, 201 (statut 402 toléré exclusivement lors du dépassement normal de quota freemium).
   - Métrique `Rate` des statuts inattendus avec seuil formel $< 1\%$.
   - Déclenchement impératif de l'arrêt automatique (`abortOnFail`) si moins de 99 % des vérifications réussissent dans les 30 premières secondes.

5. **Contrôle d'Intégrité Transactionnelle :**
   - Comparaison stricte : le nombre de bilans persistés en base de données (`Assessment` et `IqrhResult`) doit être rigoureusement égal au nombre de soumissions réussies rapportées par k6 (écart nul toléré).

6. **Critères Cibles :**
   - P95 de la durée de soumission du questionnaire $< 500\text{ ms}$ à 100 VU.
   - P95 de latence du premier token (TTFT) $< 1,5\text{ s}$ sur modèle réel à 10 et 50 VU.
   - Taux d'erreurs inattendues $< 1\%$.
   - Intégrité de persistance : 0 écart.

7. **Témoin d'Invalidité :**
   - Exécution sous un cookie de session délibérément corrompu ou falsifié : le test doit déclencher l'arrêt immédiat (`abortOnFail`).
