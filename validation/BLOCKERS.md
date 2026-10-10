# Journal des Blocages & Incidents d'Environnement (BLOCKERS.md)

Ce fichier consigne de manière factuelle et transparente tout obstacle technique, limite de quota, indisponibilité de ressource ou ambiguïté rencontré au cours des bancs de test formels.

---

## Incidents Documentés

### Topologie d'Hôte Unique (Banc T2)
- **Date :** 2026-10-09
- **Constat :** Le générateur de charge k6 et les services sous test (serveur Next.js de production, base PostgreSQL 15) ont été exécutés sur la même machine physique (AMD Ryzen 5 6600H, 16 Go RAM).
- **Conséquence :** Concurrence CPU locale entre les 100 VU de k6 et les workers Next.js lors du palier de crête.

### Dérive du Modèle Réel vs Modèle Documenté (Bancs T2 / T3)
- **Date :** 2026-10-09
- **Constat :** Le modèle d'inférence physique configuré et retourné par Groq est `qwen/qwen3.8-27b`, alors que le mémoire et la documentation préliminaire faisaient référence à `llama-3.3-70b-versatile`.
- **Conséquence :** Divergence documentée. La tarification appliquée pour le modèle réel est celle de Groq pour Qwen 3.8 27B ($0.80 / 1M input, $4.00 / 1M output).

### Quota et Rate Limiting Groq On-Demand (Banc T3)
- **Date :** 2026-10-09
- **Constat :** L'organisation Groq `org_01kxtjt9zeey2vejakrk56qmqf` relève du service tier `on_demand` (gratuit) plafonné à **1 000 jetons de sortie par minute (OTPM)**.
- **Incident mesuré :** Lors de l'exécution séquentielle du banc de mesure de latence (même espacée de 10 secondes), Groq renvoie systématiquement une erreur HTTP 429 :
  `Rate limit reached for model qwen/qwen3.8-27b ... on output tokens per minute (OTPM): Limit 1000, Used 969, Requested 800. Please try again in 46.14s.`
  Le SDK Vercel AI SDK tente 3 relances exponentielles avec des délais de 30 à 47 secondes avant d'échouer en `AI_RetryError: maxRetriesExceeded`.
- **Conséquence directe :** L'objectif protocolaire de $\ge 200$ appels mesurés sur 3 plages horaires est **physiquement impossible à honorer** sans souscrire au tier payant Groq Dev Tier.
- **Action selon Règle 8 du protocole :** Incident consigné formellement ici, statut du banc T3 basculé en `BLOQUÉ (QUOTA FOURNISSEUR)`, et passage au banc suivant (T1).

