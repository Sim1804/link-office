# Link Office — déploiement PWA mobile

## Architecture

- Site Next.js : `https://votre-site.fr`
- Page d'installation : `https://votre-site.fr/mobile`
- Application Expo Web/PWA : `https://mobile.votre-site.fr`
- API mobile : `https://votre-site.fr/api/mobile/...`

## Vercel — projet Next.js

Configurer :

```env
NEXT_PUBLIC_MOBILE_DOWNLOAD_URL=https://votre-site.fr/mobile
NEXT_PUBLIC_MOBILE_WEB_URL=https://mobile.votre-site.fr
MOBILE_WEB_ORIGIN=https://mobile.votre-site.fr
NEXT_PUBLIC_ANDROID_APK_URL=https://expo.dev/artifacts/eas/VOTRE_APK.apk
NEXT_PUBLIC_IOS_APP_URL=
```

Conserver aussi `DATABASE_URL`, `AUTH_SECRET` (ou `NEXTAUTH_SECRET` pendant la transition), `NEXTAUTH_URL` et `GROQ_API_KEY`.

`AUTH_SECRET` doit être une valeur longue, aléatoire et stable entre les déploiements. Pour les jetons mobiles, configurez aussi `MOBILE_AUTH_SALT` avec une chaîne stable (par exemple `link-office-mobile-auth`) : ne la régénérez pas à chaque déploiement.

## Vercel — projet Expo Web

Créer un second projet Vercel en sélectionnant le dossier `mobile` comme Root Directory.

Variable :

```env
EXPO_PUBLIC_API_URL=https://votre-site.fr
```

`mobile/vercel.json` et le script `npm run build` construisent `dist/`.

## iPhone

Ouvrir `https://mobile.votre-site.fr` dans Safari, puis Partager → Sur l’écran d’accueil → activer « Ouvrir comme application Web » si proposé.

Expo Go n’est pas nécessaire.

## Android

La page `/mobile` propose l’APK EAS configuré par `NEXT_PUBLIC_ANDROID_APK_URL`.
