# Spécification et Critères Figés — T5 : Scoring et Renormalisation

## Critères du Protocole (docs/validation-protocol.md)

1. **Tests de propriété formelle (`fast-check`, $\ge 1 000$ vecteurs par propriété) :**
   - **Propriété 1 (Bornes) :** Pour tout vecteur de 30 réponses (Likert 1-5), les scores de chaque dimension, le score global IQRH, l'IER et le score ICR appartiennent strictement à $[0, 100]$.
   - **Propriété 2 (Monotonie) :** L'incrémentation d'une réponse Likert d'une unité ne diminue jamais le score de sa dimension ni le score global.
   - **Propriété 3 (Indépendance) :** Le calcul IQRH (dimensions, global, IER) est rigoureusement indépendant des entrées démographiques et contextuelles de l'ICR.
   - **Propriété 4 (Partition et Unicité des Profils) :** Tout vecteur de scores produit exactement un et un seul des 12 profils relationnels officiels.
   - **Propriété 5 (Renormalisation ICR) :** Invariance aux bornes ($0 \rightarrow 0$, $85 \rightarrow 100$) et stricte monotonie pour tout score brut dans $[0, 85]$.

2. **Cas Fixes de la Spécification :**
   - Vecteur « 1 partout » $\rightarrow$ Global = 0, IER = 100, Météo = "Tempête".
   - Vecteur « 5 partout » $\rightarrow$ Global = 100, IER = 100, Météo = "Grand soleil".
   - Vecteur « dimensions opposées » $\rightarrow$ D1 = 100, D2 = 0, IER = 0 ("Déséquilibre majeur").
   - Couverture déterministe des 12 profils relationnels documentés.

3. **Évaluation sur Copie de la Base de Données :**
   - Recalcul des bandes de complexité ICR (Faible : $< 35$, Modérée : $[35, 65]$, Forte : $> 65$) avant et après renormalisation sur les évaluations en base.
   - Décompte exact des évaluations dont la bande de classification change.

4. **Témoin d'Invalidité :**
   - Injection d'une fonction de calcul délibérément erronée : vérification formelle qu'au moins une propriété de `fast-check` échoue.
