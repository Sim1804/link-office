# Correctif authentification mobile

## Problème corrigé

La PWA mobile pouvait rester sur l'écran de connexion/inscription après un clic sur le bouton.

La cause principale était que l'application mobile n'avait pas d'URL API configurée par défaut (`apiUrl` était vide). Elle ne pouvait donc pas joindre les routes `/api/mobile/auth/*` du backend Next.js.

Un second problème rendait le comportement plus fragile : après une authentification réussie, une erreur de récupération du statut d'onboarding pouvait faire échouer toute la fonction `login`/`register` et empêcher la navigation.

## Correctifs

- URL API mobile configurée par défaut sur `https://link-office-git-test-mobile-sim1804s-projects.vercel.app`.
- L'URL reste surchargeable avec `EXPO_PUBLIC_API_URL` sur Vercel/EAS.
- Connexion/inscription validées et session enregistrée avant de récupérer le statut d'onboarding.
- Une panne temporaire de l'onboarding ne déconnecte plus l'utilisateur et n'annule plus la navigation.
- Messages d'erreur réseau plus explicites.
- Suppression des doubles slash éventuels dans l'URL API.

## Déploiement

Pour le projet Vercel qui utilise le dossier `mobile`, conserver la variable :

`EXPO_PUBLIC_API_URL=https://link-office-git-test-mobile-sim1804s-projects.vercel.app`

Puis redéployer le projet mobile pour que le nouveau bundle soit généré.
