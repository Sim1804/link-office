# Mesure du TTFT de IRIS (Tâche B3)

Date : 18 octobre 2026  
Statut : **NON TESTABLE ICI**

---

## 1. Vérification de la Présence d'une Clé de Fournisseur de Modèle

Conformément à la consigne de sécurité (Règle 3 et consigne B3 : interdiction formelle d'ouvrir les fichiers `.env*` et interdiction d'inventer des valeurs), la présence d'une clé de modèle a été vérifiée directement par commande Node.js sur l'environnement d'exécution :

```bash
node -e "console.log('GROQ_API_KEY:', !!process.env.GROQ_API_KEY); console.log('OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY); console.log('MISTRAL_API_KEY:', !!process.env.MISTRAL_API_KEY); console.log('ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY)"
```

### Sortie observée :
```text
GROQ_API_KEY: false
OPENAI_API_KEY: false
MISTRAL_API_KEY: false
ANTHROPIC_API_KEY: false
```

---

## 2. Constat et Verdict

- **Constat** : Aucune clé d'accès à un fournisseur de modèle réel (Groq, OpenAI, Mistral, Anthropic) n'est injectée ou active dans l'environnement d'exécution.
- **Règle impérative B3** : « Un TTFT mesuré avec un classifieur simulé est interdit. »
- **Verdict** : **NON TESTABLE ICI : pas de fournisseur réel**. Aucun chiffre de TTFT simulé n'est publié.

---

## 3. Éléments Nécessaires pour Fermer ce Point

Pour mesurer le TTFT réel de bout en bout (30 requêtes séquentielles réelles) :
1. Une clé API valide pour le fournisseur LLM de production (`GROQ_API_KEY` pour LLaMA 3.3 70B Versatile / 8B Instant).
2. Un réseau autorisant les flux sortants vers l'API du fournisseur.
3. Le calcul du temps jusqu'à réception du premier chunk de streaming (`response.body.getReader().read()`).
