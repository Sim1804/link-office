# Link Office Mobile

Application Expo / React Native iOS + Android avec le parcours d'authentification, consentement, démographie et questionnaire IQRH.

## Développement avec Expo Go

```bash
npm install
npx expo start
```

## APK Android installable par QR code

Le profil `download` produit un APK installable directement :

```bash
npm install -g eas-cli
eas login
eas build -p android --profile download
```

EAS fournit ensuite une URL d'installation/téléchargement. Publiez cette URL derrière `NEXT_PUBLIC_ANDROID_APK_URL` sur le site Link Office.

## Version web installable

```bash
npx expo export --platform web
```

La configuration PWA (`public/manifest.json` et `app/+html.tsx`) permet d'ajouter Link Office à l'écran d'accueil sur mobile. Sur iPhone : Safari → Partager → Sur l'écran d'accueil.

## QR code du site

Le site Next.js utilise `/mobile` comme page d'aiguillage :
- Android : bouton de téléchargement APK si `NEXT_PUBLIC_ANDROID_APK_URL` est configurée ;
- iPhone : ouverture de la version web installable, ou TestFlight/App Store si `NEXT_PUBLIC_IOS_APP_URL` est configurée ;
- autres appareils : choix manuel.

Le service worker est également fourni pour améliorer l'expérience d'installation et de retour sur l'application web.
