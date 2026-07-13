# LINK OFFICE — Guide mock data par équipe

Ce dossier permet à toutes les équipes de développer en parallèle avant l'arrivée de l'API et de PostgreSQL. Les données sont déterministes : un même `userId` donne toujours le même profil, résultat IQRH, parcours de prescription et tableau de bord.

> Point d'entrée unique : `import { ... } from "@/src/mock"`.

## Démarrage rapide

```ts
import { getDashboard, getUser, mockUsers } from "@/src/mock";

const userId = mockUsers[0].id; // "usr_001"
const user = await getUser(userId);
const dashboard = await getDashboard(userId);
```

Les fonctions de `mockApi.ts` retournent toutes une `Promise` avec une latence de 300 ms, afin de reproduire le comportement d'une API. Elles ne font aucun appel réseau et ne nécessitent ni `.env`, ni serveur, ni BDD.

## Référence des identifiants

- Utilisateurs : `usr_001` à `usr_100`.
- Tous les liens de données utilisent le même `userId`.
- Toujours partir d'un utilisateur existant dans `mockUsers`, jamais d'un ID construit à la main hors de cette plage.

```ts
import { mockUsers } from "@/src/mock";

const user = mockUsers[0];
```

## Équipe 1 — IRIS & Intelligence

### Données à utiliser

```ts
import {
  getResult,
  getOrdonnance,
  getRecommendations,
  getUser,
  getMockIrisConversation,
  mockLinkOfficePrograms,
  mockResources,
} from "@/src/mock";

const userId = "usr_001";
const [user, result, ordonnance, recommendations] = await Promise.all([
  getUser(userId),
  getResult(userId),
  getOrdonnance(userId),
  getRecommendations(userId),
]);
const conversation = getMockIrisConversation(userId);
```

| Besoin IRIS | Source mock |
| --- | --- |
| Résultat, sous-scores, météo, forces et vigilances | `ResultatIQRH`, via `getResult(userId)` |
| Profil relationnel | `result.profile`, `result.secondaryProfile` |
| Ordonnance et prochaine action | `Ordonnance`, via `getOrdonnance(userId)` |
| Recommandations personnalisées | `Recommendation[]`, via `getRecommendations(userId)` |
| Conversation d'exemple | `ConversationIRIS`, via `getMockIrisConversation(userId)` |
| Connaissance à exploiter plus tard pour le RAG | `mockResources`, `mockLinkOfficePrograms`, `mockRelationalNeeds`, `mockRiskFactors` |

À respecter : IRIS doit rester bienveillante, factuelle et non diagnostique. Les mocks ne simulent pas d'appel LLM : l'équipe peut construire l'interface, les prompts et l'adaptateur IA à partir de ces contrats.

## Équipe 2 — Moteur scientifique

### Données à utiliser

```ts
import {
  mockQuestionnaire,
  generateQuestionnaireForUser,
  mockResults,
  getResult,
  getDashboard,
} from "@/src/mock";

const userId = "usr_001";
const answers = generateQuestionnaireForUser(userId, 0);
const result = await getResult(userId);
const dashboard = await getDashboard(userId);
```

| Besoin scientifique | Source mock |
| --- | --- |
| Les 30 questions communes IQRH | `mockQuestionnaire.questions` |
| Échelle Likert | `LikertAnswer` (1 à 5) |
| Réponses complètes d'un utilisateur | `generateQuestionnaireForUser(userId, index)` |
| Score et sous-scores | `ResultatIQRH`, via `getResult(userId)` |
| Radar | `result.dimensions` (les 5 dimensions et leurs scores) |
| Météo et profils | `result.weather`, `result.profile`, `result.secondaryProfile` |
| Dashboard, progression et historique | `getDashboard(userId)` |

Les résultats actuels sont des données de simulation cohérentes, pas l'implémentation scientifique définitive du calcul IQRH. L'équipe scientifique pourra remplacer progressivement `generateResult` et `generateQuestionnaireForUser`, tout en gardant les interfaces `Questionnaire`, `QuestionAnswer`, `DimensionScore` et `ResultatIQRH`.

## Équipe 3 — Prescription sociale

### Données à utiliser

```ts
import {
  getOrdonnance,
  getRecommendations,
  getMockChallenges,
  mockPartners,
  mockLinkOfficePrograms,
  mockResources,
  mockRelationalNeeds,
  mockRiskFactors,
} from "@/src/mock";

const userId = "usr_001";
const ordonnance = await getOrdonnance(userId);
const recommendations = await getRecommendations(userId);
const challenges = getMockChallenges(userId);
```

| Besoin prescription | Source mock |
| --- | --- |
| Ordonnance 30 jours | `getOrdonnance(userId)` |
| Cinq recommandations cohérentes | `getRecommendations(userId)` |
| Trois micro-défis cohérents | `getMockChallenges(userId)` |
| Partenaires | `mockPartners` et `getPartnersForDimension(dimension)` |
| Programmes LINK OFFICE | `mockLinkOfficePrograms` |
| Ressources de bibliothèque | `mockResources` |
| Besoins et risques | `mockRelationalNeeds`, `mockRiskFactors` |

Les règles de simulation sont déjà appliquées : score inférieur à 40 → ordonnance `prioritaire`; score supérieur à 75 → `préventive`; sinon → `accompagnement`. Chaque ordonnance contient au maximum 5 recommandations, 3 partenaires et 3 défis.

## Équipe 4 — Communauté

### Données à utiliser

```ts
import {
  getBinome,
  mockBinomes,
  getNotifications,
  getDashboard,
  getMockChallenges,
} from "@/src/mock";

const userId = "usr_004";
const binome = await getBinome(userId);
const notifications = await getNotifications(userId);
const dashboard = await getDashboard(userId);
```

| Besoin communauté | Source mock |
| --- | --- |
| Matching et état du binôme | `Binome`, via `getBinome(userId)` |
| Compatibilité | `binome.compatibilityScore` (0–100) |
| Santé, inactivité, alertes | `healthScore`, `inactiveDays`, `alertsSent`, `status` |
| Défis communs/progression | `getMockChallenges(userId)`, `dashboard.progress` |
| Badges et historique | `dashboard.badges`, `dashboard.history` |
| Notifications | `getNotifications(userId)` |

Les premiers binômes sont disponibles avec les utilisateurs Premium. Tester par exemple `usr_001`, `usr_004` ou parcourir `mockBinomes`. Le chat binôme et les check-ins ne sont pas encore des objets de mock dédiés : l'équipe peut les modéliser localement sans dépendre du backend, puis intégrer leur contrat à cette couche.

## Équipe 5 — Plateforme & Expérience utilisateur

### Données à utiliser

```ts
import {
  getUsers,
  getUser,
  getDashboard,
  getNotifications,
  mockAnalytics,
  UserRole,
  SubscriptionType,
} from "@/src/mock";

const users = await getUsers();
const dashboard = await getDashboard(users[0].id);
```

| Besoin plateforme | Source mock |
| --- | --- |
| Liste de personnes, rôles et abonnement | `getUsers()` / `mockUsers`, `UserRole`, `SubscriptionType` |
| Fiche personne | `getUser(userId)` |
| Écran dashboard | `getDashboard(userId)` |
| Centre de notifications | `getNotifications(userId)` |
| Indicateurs de démonstration | `mockAnalytics` |

L'authentification, les organisations, les campagnes et PostgreSQL ne sont pas simulés dans cette V1. Pour des écrans front, utilisez un utilisateur de `mockUsers` comme session temporaire. La plateforme doit fournir plus tard les mêmes contrats de lecture que `mockApi.ts`, afin d'éviter de réécrire les écrans.

## Contrat de remplacement par la vraie API

Les composants ne doivent pas importer directement les tableaux `mock*` sauf pour des pages de démonstration, tests ou stories. Pour les écrans applicatifs, préférez `mockApi.ts` :

```ts
import { getDashboard, getNotifications, getResult } from "@/src/mock";
```

Quand l'API existe, conserver les signatures et remplacer leur implémentation :

```ts
// Aujourd'hui dans src/mock/mockApi.ts
export const getResult = (userId: string) => delay(getMockResult(userId));

// Plus tard dans un client API typé
export const getResult = (userId: string) => apiClient.get<ResultatIQRH>(`/users/${userId}/result`);
```

Les interfaces TypeScript restent la référence de contrat. Ne modifiez pas leur forme dans un composant : faites évoluer les interfaces puis les mocks et l'API ensemble.

## Carte des dépendances

```text
Équipe 5 — Plateforme
    └─ User / Dashboard / Notification
            │
Équipe 2 — Moteur scientifique
    └─ Questionnaire / ResultatIQRH
            │
     ┌──────┴──────┐
Équipe 3          Équipe 1
Prescription      IRIS
Ordonnance        ConversationIRIS
Recommandation    Explications
MicroChallenge
     │              │
     └──────┬───────┘
            │
Équipe 4 — Communauté
    └─ Binome / défis / badges / notifications
```

## Où trouver les données

- Point d'entrée : `src/mock/index.ts`
- API locale : `src/mock/mockApi.ts`
- Données utilisateurs : `src/mock/users/users.ts`
- Questionnaire : `src/mock/questionnaire/questionnaire.ts`
- IQRH : `src/mock/iqrh/results.ts`
- Prescription et bibliothèques : `src/mock/recommendations`, `src/mock/ordonnance`, `src/mock/partners`, `src/mock/microChallenges`
- Communauté : `src/mock/binome`, `src/mock/notifications`, `src/mock/dashboard`
