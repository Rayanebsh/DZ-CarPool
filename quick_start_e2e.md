# 🚀 Quick Start - Tests E2E

Guide de démarrage rapide pour lancer vos tests Playwright.

## 📦 Installation (Une seule fois)

```bash
# 1. Installer Playwright
npm install -D @playwright/test

# 2. Installer les navigateurs
npx playwright install chromium

# Ou tous les navigateurs (chromium, firefox, webkit)
npx playwright install
```

## 📁 Structure des fichiers à créer

Créez cette structure dans votre projet :

```
votre-projet/
├── e2e/
│   ├── fixtures/
│   │   └── test-data.ts
│   ├── helpers/
│   │   ├── auth-helper.ts
│   │   ├── trip-helper.ts
│   │   ├── wait-helper.ts
│   │   └── database-helper.ts
│   ├── 01-user-registration.spec.ts
│   └── 02-create-trip.spec.ts
├── playwright/
│   └── test.ts
├── playwright.config.ts (déjà présent)
└── package.json
```

## ⚡ Lancement rapide

```bash
# 1. Démarrer votre application
npm run dev

# 2. Dans un autre terminal, lancer les tests
npm run test:e2e

# Ou avec Playwright directement
npx playwright test
```

## 🎯 Commandes essentielles

### Mode UI (Recommandé pour débuter)

```bash
npm run test:e2e:ui
```

Ce mode vous permet de :
- ✅ Voir les tests en temps réel
- ✅ Débugger visuellement
- ✅ Relancer des tests spécifiques
- ✅ Voir les traces détaillées

### Tests en mode visible (headed)

```bash
npm run test:e2e:headed
```

Vous voyez le navigateur s'exécuter en temps réel.

### Tests spécifiques

```bash
# Tests d'inscription uniquement
npm run test:e2e:registration

# Tests de création de trajet
npm run test:e2e:trips

# Un test spécifique
npx playwright test -g "Inscription complète"
```

### Mode debug

```bash
npm run test:e2e:debug
```

Le navigateur s'ouvre en mode debug avec des points d'arrêt.

## 📊 Voir les résultats

```bash
# Ouvrir le rapport HTML
npm run test:e2e:report
```

## 🔧 Configuration minimale

Votre `playwright.config.ts` est déjà configuré ! Vous pouvez ajuster :

```typescript
use: {
  baseURL: 'http://localhost:3000', // Votre URL locale
  // ...
}
```

## 📝 Premiers tests

### Test 1 : Vérifier que l'app se lance

```typescript
// e2e/00-smoke.spec.ts
import { test, expect } from '@playwright/test';

test('Page d\'accueil se charge', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/DZ-CarPool/);
});
```

Lancez-le :
```bash
npx playwright test 00-smoke
```

### Test 2 : Navigation simple

```typescript
test('Navigation vers inscription', async ({ page }) => {
  await page.goto('/');
  await page.click('text=S\'inscrire');
  await expect(page).toHaveURL(/signup/);
});
```

## 🐛 Debugging

### Voir ce qui se passe

```bash
# Mode headed + slow
npx playwright test --headed --slow-mo=1000
```

### Capturer une trace

```bash
npx playwright test --trace on
```

Puis voir la trace :
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Console logs

Dans votre test :
```typescript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

## ✅ Checklist avant de lancer

- [ ] Application démarrée (`npm run dev`)
- [ ] Backend accessible (`http://localhost:8000`)
- [ ] Playwright installé (`npx playwright --version`)
- [ ] Navigateurs installés (`npx playwright install`)

## 🎓 Apprendre progressivement

### Niveau 1 : Tests basiques
```bash
npx playwright test 00-smoke.spec.ts
```

### Niveau 2 : Avec helpers
```bash
npx playwright test 01-user-registration.spec.ts
```

### Niveau 3 : Tests complets
```bash
npx playwright test 02-create-trip.spec.ts
```

## 💡 Tips

### 1. Commencez petit

Ne créez pas tous les tests d'un coup. Commencez par un test simple qui fonctionne.

### 2. Utilisez le mode UI

```bash
npm run test:e2e:ui
```

C'est le meilleur moyen de débugger visuellement.

### 3. Vérifiez les sélecteurs

```bash
npx playwright codegen http://localhost:3000
```

Cet outil génère automatiquement les sélecteurs pour vous !

### 4. Logs utiles

```typescript
console.log('📝 Test started:', testName);
console.log('✅ Step completed');
console.log('❌ Error:', error);
```

## 🚨 Problèmes courants

### "Cannot find module"

```bash
# Installer les dépendances
npm install

# Installer Playwright
npm install -D @playwright/test
```

### "Executable doesn't exist"

```bash
npx playwright install
```

### "Connection refused"

Vérifiez que votre app tourne sur `http://localhost:3000` :
```bash
npm run dev
```

### Tests qui timeout

Augmentez les timeouts dans `playwright.config.ts` :
```typescript
timeout: 90 * 1000, // 90 secondes
```

## 📚 Ressources

- [Documentation Playwright](https://playwright.dev/)
- [Exemples de tests](https://github.com/microsoft/playwright/tree/main/tests)
- [Sélecteurs](https://playwright.dev/docs/selectors)

## 🎉 Vous êtes prêt !

Lancez votre premier test :

```bash
npx playwright test --headed
```

Et regardez la magie opérer ! ✨

---

**Besoin d'aide ?** 
- Consultez la [documentation complète](./E2E-README.md)
- Créez une issue sur GitHub
- Demandez à l'équipe