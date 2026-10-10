# Spécification et Critères Figés — T3 : Latence et Coût Réels du Pipeline IRIS

## Critères du Protocole (docs/validation-protocol.md)

1. **Protocole de Mesure :**
   - Appels réels adressés à la route de production authentifiée (`/api/iris/conversation/[id]/message`).
   - Échantillonnage sur **5 strates de prompts** (salutations, questions courtes, cas complexes, analyse météo, demande d'action).
   - Phase de préchauffage : **20 appels d'échauffement systématiquement écartés** des calculs statistiques.
   - Volume cible : $\ge 200$ appels mesurés. En cas de blocage ou d'épuisement de quota du fournisseur (HTTP 429), consigner l'incident dans `validation/BLOCKERS.md` et documenter l'échantillon effectivement recueilli.

2. **Données Enregistrées par Appel :**
   - Modèle réel renvoyé par l'inférence.
   - Région d'exécution / fournisseur d'API.
   - TTFT (Time To First Token) mesuré dès l'arrivée du premier octet SSE.
   - Durée totale de génération complète.
   - Tokens d'entrée et de sortie consommés.
   - Latence de la couche de filtrage d'entrée.

3. **Modélisation Économique :**
   - Coût d'une session de 10 tours $=$ total moyen des tokens consommés (entrée et sortie) $\times$ grille tarifaire officielle du fournisseur.
   - La date d'interrogation et l'URL officielle de la grille tarifaire sont obligatoirement inscrites dans `env.json`.

4. **Critères Cibles :**
   - Borne supérieure de l'intervalle de confiance Bootstrap (95 %, $\ge 1 000$ rééchantillonnages, graine fixée) sur le P95 du TTFT $< 1,5\text{ s}$ ($1 500\text{ ms}$).
   - Coût moyen estimé d'une session complète de 10 tours $< 0,01\ \$$.

5. **Alerte de Dérive de Modèle :**
   - Si le modèle physique exécuté (`qwen/qwen3.8-27b`) diverge du modèle documenté (`llama-3.3-70b-versatile`), l'anomalie doit être immédiatement signalée en tête du rapport.
