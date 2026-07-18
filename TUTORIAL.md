# Tutoriel débutant : comprendre et modifier ce projet

Ce document vous explique ce projet, les outils utilisés, les concepts essentiels, le rôle du code existant, ainsi que la manière de le modifier vous-même pas à pas.

---

## 1. Qu’est-ce que ce projet ?

Ce projet est une application web moderne réalisée avec Next.js, React et TypeScript.

Son objectif est de vous montrer une base propre et organisée pour construire une interface web. Même si la page d’accueil actuelle est simple, le projet contient déjà une architecture solide et des données simulées pour apprendre à développer.

En pratique, ce projet vous permet de comprendre :
- comment une application web est structurée ;
- comment afficher du contenu à l’écran ;
- comment organiser les fichiers ;
- comment utiliser des données factices ;
- comment personnaliser l’interface.

---

## 2. Les outils utilisés et leur rôle

### 2.1 Next.js
Next.js est le framework principal du projet.

Il sert à :
- créer des pages web facilement ;
- organiser l’application proprement ;
- gérer les routes ;
- proposer une structure moderne et performante.

### 2.2 React
React est la bibliothèque utilisée pour construire les interfaces utilisateur.

Avec React, on crée des composants, c’est-à-dire de petits blocs réutilisables qui affichent une partie de l’écran.

### 2.3 TypeScript
TypeScript est une version plus sûre de JavaScript.

Il permet de définir les types de données, par exemple :
- texte ;
- nombre ;
- objet ;
- tableau.

Cela aide à éviter les erreurs et rend le code plus clair.

### 2.4 Tailwind CSS
Tailwind CSS est un outil pour styliser rapidement une interface.

Au lieu d’écrire beaucoup de CSS classique, on ajoute des classes directement dans le code.

Exemples :
- `flex`
- `p-4`
- `bg-blue-500`
- `text-center`

### 2.5 ESLint
ESLint sert à vérifier que le code est bien écrit et qu’il ne contient pas de problèmes évidents.

---

## 3. Les concepts essentiels à comprendre

### 3.1 Composant
Un composant est une petite unité de code qui affiche une partie de l’interface.

Par exemple, une carte, un bouton, un titre ou une page entière peuvent être des composants.

### 3.2 Page
Dans Next.js, une page représente une URL.

Par exemple :
- la page d’accueil correspond à `/`
- une autre page peut correspondre à `/about`

### 3.3 Layout
Le layout est la structure globale de l’application.

C’est une enveloppe commune qui contient le contenu des pages.

### 3.4 Route
Une route est l’adresse web d’une page.

### 3.5 Données mockées
Les données mockées sont des fausses données utilisées pour simuler un comportement réel sans avoir besoin d’un backend.

Dans ce projet, elles sont utilisées pour tester l’interface.

---

## 4. Structure du projet

### 4.1 Dossier app
C’est le dossier principal pour les pages et la structure de l’application.

Fichiers principaux :
- [app/page.tsx](app/page.tsx) : la page d’accueil
- [app/layout.tsx](app/layout.tsx) : la structure globale
- [app/globals.css](app/globals.css) : les styles généraux

### 4.2 Dossier src
C’est l’endroit où se trouve la logique et les données du projet.

Le sous-dossier [src/mock](src/mock) contient les données simulées.

### 4.3 Dossier public
Ce dossier sert à stocker des fichiers statiques comme des images.

---

## 5. Ce que fait le code actuel

### 5.1 La page d’accueil
Le fichier [app/page.tsx](app/page.tsx) contient la page visible à l’ouverture du site.

Il affiche :
- un titre ;
- un texte d’introduction ;
- des liens ;
- une mise en forme simple.

C’est le point de départ de votre apprentissage.

### 5.2 Le layout global
Le fichier [app/layout.tsx](app/layout.tsx) organise l’affichage global de l’application.

Il définit par exemple :
- la langue du document ;
- les polices ;
- la structure de base du body.

### 5.3 Les données simulées
Le fichier [src/mock/mockApi.ts](src/mock/mockApi.ts) simule des appels de données.

Il fonctionne comme une fausse API : il retourne des informations après un court délai, sans besoin de base de données.

C’est très pratique pour développer une interface même sans backend.

---

## 6. Comment démarrer le projet

Ouvrez un terminal à la racine du projet, puis exécutez :

```bash
npm install
npm run dev
```

Ensuite, ouvrez votre navigateur à l’adresse :

```text
http://localhost:3000
```

Vous devriez voir la page d’accueil du projet.

---

## 7. Comment modifier le projet vous-même

### 7.1 Changer le texte sur la page d’accueil
Ouvrez [app/page.tsx](app/page.tsx).

Modifiez les textes visibles pour les remplacer par les vôtres.

Exemple :
- remplacez un titre par votre propre titre ;
- changez un texte d’introduction ;
- modifiez les liens.

### 7.2 Ajouter une nouvelle page
Créez un dossier nommé `app/about` puis un fichier `page.tsx` à l’intérieur.

Exemple :

```tsx
export default function AboutPage() {
  return <h1>Bienvenue sur la page About</h1>;
}
```

Ensuite, ouvrez :

```text
http://localhost:3000/about
```

### 7.3 Utiliser des données simulées
Vous pouvez importer des données depuis [src/mock/mockApi.ts](src/mock/mockApi.ts).

Exemple :

```tsx
import { getUsers } from "@/src/mock";

export default async function HomePage() {
  const users = await getUsers();
  return <pre>{JSON.stringify(users, null, 2)}</pre>;
}
```

Cela vous permet d’afficher des données sans backend réel.

---

## 8. Mini exercice pratique

Pour apprendre rapidement, essayez cette progression :

1. Changez le texte de [app/page.tsx](app/page.tsx)
2. Ajoutez une nouvelle page
3. Affichez une liste de données depuis [src/mock/mockApi.ts](src/mock/mockApi.ts)
4. Ajoutez un bouton ou un titre
5. Essayez d’ajouter une couleur avec Tailwind CSS

C’est la meilleure façon d’apprendre.

---

## 9. Conseils pour débuter

- Ne cherchez pas à tout comprendre d’un coup.
- Modifiez un petit élément à la fois.
- Testez souvent le résultat dans le navigateur.
- Lisez les messages d’erreur, ils donnent souvent des indices.
- Prenez l’habitude de garder votre code organisé.

---

## 10. Ce qu’il faut apprendre ensuite

Pour progresser, il est utile d’apprendre dans cet ordre :

1. HTML
2. CSS
3. JavaScript
4. React
5. TypeScript
6. Next.js
7. Consommation d’API

---

## 11. Résumé simple

Ce projet est une base solide pour apprendre le développement web moderne.

Il contient :
- une application Next.js ;
- une page d’accueil ;
- une structure organisée ;
- des données simulées ;
- une base de styles moderne.

Si vous êtes débutant, la meilleure méthode est simple :
- observer ;
- modifier ;
- tester ;
- recommencer.

---

## 12. Prochaine étape recommandée

Si vous le souhaitez, je peux maintenant vous préparer un second tutoriel encore plus pratique, avec :
- une version étape par étape pour créer votre première page ;
- un exercice guidé ;
- ou un tutoriel pour comprendre le fichier [src/mock/mockApi.ts](src/mock/mockApi.ts) en détail.
