# LINK OFFICE — Mock data

Cette couche est autonome : elle ne fait ni `fetch`, ni appel backend, et peut être importée depuis n'importe quelle partie de l'application avec `@/src/mock`.

## Arborescence

- `users`, `questionnaire`, `iqrh` : profils, questionnaire IQRH et résultats des 100 utilisateurs.
- `recommendations`, `ordonnance`, `partners`, `microChallenges` : ressources cohérentes avec la dimension IQRH prioritaire. `recommendations/library.ts` expose aussi les besoins, facteurs, ressources et programmes issus de `Bibliotheques_LINK_OFFICE_V1.xlsm`.
- `binome`, `iris`, `dashboard`, `notifications`, `analytics` : jeux de données destinés aux autres écrans.
- `utils` : générateurs purs et déterministes, réutilisables pour régénérer les données.
- `mockApi.ts` : façade asynchrone simulant les appels API avec une latence de 300 ms.

## Utilisation

```ts
import { getDashboard, mockUsers } from "@/src/mock";

const dashboard = await getDashboard(mockUsers[0].id);
```

Les constantes sont aussi directement disponibles, par exemple `mockUsers`, `mockResults` ou `mockRecommendations`.

Le guide complet pour les cinq équipes se trouve dans [`README-TEAMS.md`](./README-TEAMS.md).

## Passage progressif aux API réelles

Conserver les interfaces et remplacer, appel par appel, l'implémentation de `mockApi.ts` par un client HTTP typé. Les composants continuent alors à appeler les mêmes fonctions. Garder les jeux de données pour les tests visuels, les stories et le développement hors ligne.
