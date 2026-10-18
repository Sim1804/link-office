# Politique de Sécurité du Contenu (CSP) — Guide et Procédure de Bascule

**Fichier de configuration** : `next.config.ts`  
**En-tête actif** : `Content-Security-Policy-Report-Only`  
**Statut initial** : Mode observation / non bloquant  

---

## 1. Directive CSP actuelle (`Report-Only`)

```text
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://api.groq.com https://api.stripe.com;
frame-src 'self' https://js.stripe.com;
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

---

## 2. Analyse des sources et intégrations applicatives

| Directive | Sources autorisées | Justification applicative |
| :--- | :--- | :--- |
| `script-src` | `'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com` | - `'self'` : scripts Next.js bundle.<br>- `'unsafe-eval'` : requis en dev pour le Fast Refresh et HMR.<br>- `'unsafe-inline'` : hydratation initiale Next.js.<br>- `https://js.stripe.com` : formulaire Stripe Elements pour abonnements Premium. |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Styles Tailwind CSS injectés dynamiquement et polices Google Fonts. |
| `font-src` | `'self' https://fonts.gstatic.com data:` | Polices Plus Jakarta Sans / Inter hébergées ou via Google Fonts. |
| `img-src` | `'self' data: blob: https:` | Avatars utilisateurs, badges SVG générés dynamiquement, images marketing. |
| `connect-src` | `'self' https://api.groq.com https://api.stripe.com` | Requêtes fetch internes, appels Couche 2 Groq LLM, session Stripe. |
| `frame-src` | `'self' https://js.stripe.com` | Iframe sécurisée Stripe Elements pour saisie des cartes bancaires. |
| `frame-ancestors`| `'none'` | Interdiction absolue de charger l'application dans une iframe (anti-clickjacking). |
| `object-src` | `'none'` | Blocage strict des plugins Flash, Java, PDF embarqués. |

---

## 3. Violations observées et anticipées en environnement local

1. **Next.js Fast Refresh en développement** : En mode `next dev`, Next.js injecte des scripts inline avec `eval()` pour synchroniser les modules modifiés. Si `unsafe-eval` est retiré, le rechargement à chaud échoue.
2. **Extensions de navigateur** : Les extensions de gestion de mot de passe (Bitwarden, 1Password) ou de traduction injectent des scripts `content_script` qui déclenchent des rapports bénins dans la console.
3. **Google Fonts inline CSS** : Next.js précharge les polices avec des styles critiques inline (`@font-face`).

---

## 4. Procédure de bascule vers le mode bloquant (`Content-Security-Policy`)

Pour basculer en mode bloquant strict en production sans risque de régression :

1. **Étape 1 : Collecte des rapports (2 semaines)**
   - Configurer un endpoint de collecte de rapports : `report-uri /api/csp-report;`
   - Déployer en staging et observer le journal des violations réelles des utilisateurs.

2. **Étape 2 : Élimination de `'unsafe-inline'` via Nonces**
   - Remplacer `'unsafe-inline'` par des nonces cryptographiques générés par requête dans le `middleware.ts` :
     ```typescript
     const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
     const cspHeader = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com; ...`;
     ```
   - Passer le nonce aux balises `<Script>` de Next.js.

3. **Étape 3 : Remplacement du nom d'en-tête**
   - Dans `next.config.ts`, renommer la clé :
     ```diff
     - key: "Content-Security-Policy-Report-Only",
     + key: "Content-Security-Policy",
     ```

4. **Étape 4 : Validation sous charge**
   - Exécuter la suite de tests E2E Playwright et vérifier l'absence d'erreurs CSP dans la console navigateur (`page.on('console', msg => ...)`).
