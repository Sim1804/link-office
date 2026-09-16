# Link Office Design System Manifesto

Ce document est la SOURCE DE VÉRITÉ VISUELLE et structurelle pour le développement de l'interface de "LINK OFFICE - LABORATOIRE DU LIEN HUMAIN". Il doit être strictement appliqué lors de la création ou modification de tout composant.

## 1. Identité de Marque
- **Nom** : LINK OFFICE
- **Signature** : LABORATOIRE DU LIEN HUMAIN
- **Positionnement verbal** : Comprendre. Observer. Mesurer. Agir.
- **Valeurs** : HUMAIN, CLARTÉ, FIABILITÉ, ACTION
- **Ton** : Bienveillant, inclusif, inspirant, professionnel, clair, humain.

## 2. Palette de Couleurs (Sémantique stricte)
Chaque couleur a un rôle précis, ne pas les utiliser pour "faire joli".
- **Primary Teal** (`#00A99D`) : Lien, confiance, clarté, relation.
- **Secondary Teal** (`#199E9A`)
- **Soft Teal** (`#4DBDB2`) : Sérénité, zones secondaires.
- **Action/Transformation** (`#5965E8`) : Violet action, progression, interaction importante.
- **Light/Energy** (`#FFC629`) : Jaune lumière, attention légère.
- **Deep Navy** (`#123D46`) : Texte principal, titres importants, profondeur.
- **Ivory** (`#F4F1E8`) : Fond chaud, respiration.
- **Serenity** (`#E3EBE6`) : Fond doux.

## 3. Typographie
Deux familles principales (jamais plus) :
- **Plus Jakarta Sans** : Pour les H1, H2, H3, grands chiffres, éléments de marque.
- **Inter** : Pour les paragraphes, labels, formulaires, tableaux, navigation secondaire.

## 4. Règles Structurelles Communes
- **Espacement** : Utiliser une échelle stricte (4, 8, 12, 16, 20, 24, 32, 40, 48...).
- **Border Radius** : Arrondis modérés (moderne, doux, professionnel).
- **Ombres** : Légères et élégantes, pas de grosses ombres noires.
- **Boutons** : États `hover`, `focus`, `active`, `disabled`, `loading` obligatoires. Le bouton principal utilise le Teal, l'action importante utilise le Violet.
- **Inputs** : États `focus` (bordure Teal/Glow), `error`, `success`, `disabled`.
- **Loading & Empty States** : Toujours présents. Pas d'écrans vides bruts ni de "No data".
- **Erreurs (404, 500...)** : Écrans d'erreur personnalisés aux couleurs et ton de la marque. Pas de rouge vif agressif.
- **Cohérence des Onglets** : Chaque sous-onglet doit rigoureusement hériter du Design System (spacing, hover, focus).

## 5. Règle Critique de Non-Régression
Toutes les pages doivent utiliser les composants partagés (`.btn`, `.card`, etc.). Ne jamais dupliquer de CSS ni utiliser de styles en ligne (inline styles) arbitraires `style={{ ... }}` pour les espacements ou couleurs. Utiliser les CSS properties et classes génériques de `globals.css`.
