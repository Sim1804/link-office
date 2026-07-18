# LinkOffice — Évaluez et développez votre qualité relationnelle

LinkOffice est une application visant à mesurer l'Indice de Qualité Relationnelle et Humaine (IQRH) de ses utilisateurs à travers un questionnaire interactif. L'application propose un tableau de bord détaillé et un assistant virtuel (IRIS) pour accompagner l'utilisateur dans l'amélioration de ses relations.

Ce projet a été construit avec [Next.js](https://nextjs.org) (App Router), Tailwind CSS v4, et Recharts.

## Structure du Projet (Modulaire)

Le projet est organisé par "domaines" ou "modules" métier afin de faciliter la maintenance et de respecter les meilleures pratiques :

- `app/` : Les pages de l'application (routage Next.js).
  - `app/dashboard/` : Tableau de bord principal (Scores IQRH, Météo, Radar, ICR).
  - `app/questionnaire/` : Le test IQRH avec ses 30 questions.
  - `app/iris/` : Interface de chat avec le coach virtuel IRIS.
  - `app/profil/`, `app/adaptive/`, `app/consentement/` : Différents écrans de la plateforme.
- `src/` : La logique applicative (composants et services).
  - `src/core/layout/` : Composants de layout globaux (Navbar, Footer).
  - `src/core/ui/` : Composants génériques de l'UI (Boutons, Badges, etc.).
  - `src/dashboard/components/` : Composants spécifiques au tableau de bord (RadarChart, DimensionsList, etc.).
  - `src/mock/` : Données de test et fausses API permettant de faire fonctionner l'interface en mode "standalone".

## Installation & Démarrage

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

3. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour tester l'application.

## Fonctionnalités Principales

- **Dashboard IQRH** : Visualisation globale de votre qualité relationnelle (Score, Météo, Radar des 5 dimensions).
- **Questionnaire interactif** : 30 questions évaluées sur une échelle de Likert.
- **Coach IRIS** : Chat IA pour l'introspection et le développement personnel basé sur vos résultats.
- **Profil Utilisateur** : Analyse de votre Indice de Complexité Relationnelle (ICR) et de votre profil type.
