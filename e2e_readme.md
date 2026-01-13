# Tests E2E - DZ-CarPool

Documentation complète des tests end-to-end avec Playwright.

## 📁 Structure des fichiers

```
e2e/
├── fixtures/
│   └── test-data.ts              # Données de test réutilisables
├── helpers/
│   ├── auth-helper.ts            # Helper d'authentification
│   ├── trip-helper.ts            # Helper de gestion des trajets
│   ├── wait-helper.ts            # Helper d'attentes
│   └── database-helper.ts        # Helper de nettoyage BDD
├── 01-user-registration.spec.ts  # Tests d'inscription
├── 02-create-trip.spec.ts        # Tests de création de trajets
└── ...

playwright/
└── test.ts                        # Export personnalisé de Playwright

playwright.config.ts               # Configuration Playwright
```

## 🚀 Installation

```bash
# Installer Playwright
npm install -D @playwright/test

# Installer les navigateurs
npx playwright install
```

## 🎯 Lancer les tests

```bash
# Tous les tests
npm run test:e2e

# Ou directement
npx playwright test

# Tests en mode UI (interactif)
npx playwright test --ui

# Tests spécifiques
npx playwright test 01-user-registration

# Tests avec un navigateur spécifique
npx playwright test --project=chromium

# Mode debug
npx playwright test --debug

# Mode headed (voir le navigateur)
npx playwright test --headed
```

## 📊 Rapports

```bash
# Générer et ouvrir le rapport HTML
npx playwright show-report

# Rapport JSON
cat test-results.json | jq
```

## 🧪 Scénarios de test

### 01 - Inscription utilisateur (`01-user-registration.spec.ts`)

- ✅ Inscription complète avec succès
- ✅ Validation des erreurs du formulaire
- ✅ Configuration des préférences
- ✅ Inscription avec Google OAuth
- ✅ Toggle langue FR/EN
- ✅ Détection email déjà existant
- ✅ Flow complet avec skip des étapes

### 02 - Création de trajet (`02-create-trip.spec.ts`)

- ✅ Création complète d'un trajet
- ✅ Validation des champs obligatoires
- ✅ Calcul automatique de distance
- ✅ Prix suggéré basé sur le carburant
- ✅ Option trajet Comfort (+30%)
- ✅ Sélection de préférences
- ✅ Aperçu carte avec itinéraire
- ✅ Ajout de détails supplémentaires
- ✅ Validation dates futures uniquement
- ✅ Modification du nombre de places

## 🛠️ Helpers disponibles

### AuthHelper

```typescript
// Inscription
await authHelper.signup(userData);

// Connexion
await authHelper.login(email, password);

// Flow complet (signup + verify + preferences)
await authHelper.completeSignupFlow(userData);

// Vérifier si connecté
const isLoggedIn = await authHelper.isLoggedIn();

// Déconnexion
await authHelper.logout();

// Nettoyer session
await authHelper.clearSession();
```

### TripHelper

```typescript
// Créer un trajet
await tripHelper.createTrip(tripData);

// Remplir un champ de localisation
await tripHelper.fillLocationField('departure', 'Alger');

// Définir date/heure
await tripHelper.setDateTime(date, time);

// Définir le nombre de places
await tripHelper.setSeats(3);

// Définir le prix
await tripHelper.setPrice(1500);

// Activer option Comfort
await tripHelper.toggleComfort(true);

// Rechercher un trajet
await tripHelper.searchTrip('Alger', 'Oran', date);
```

### WaitHelper

```typescript
// Attendre une réponse API
await waitHelper.waitForApiResponse('/api/trajets');

// Attendre que le loader disparaisse
await waitHelper.waitForLoadingToFinish();

// Attendre la navigation
await waitHelper.waitForNavigation('/dashboard');

// Attendre une condition personnalisée
await waitHelper.waitForCondition(async () => {
  return condition === true;
}, 10000);
```

### DatabaseHelper

```typescript
// Nettoyer un utilisateur de test
await dbHelper.deleteTestUser(email, adminToken);

// Nettoyer les trajets d'un utilisateur
await dbHelper.cleanUserTrips(userId, token);

// Vérifier santé de l'API
const isHealthy = await dbHelper.checkApiHealth();
```

## 📝 Données de test

Les données de test sont dans `fixtures/test-data.ts` :

```typescript
import { testUsers, testTrip, generators } from './fixtures/test-data';

// Utilisateur de test
const user = {
  ...testUsers.newUser,
  email: generators.randomEmail()
};

// Trajet de test
const trip = {
  ...testTrip,
  date: testTrip.date() // Génère demain
};
```

## 🔧 Configuration

### Variables d'environnement

```bash
# .env.test
BASE_URL=http://localhost:3000
API_URL=http://localhost:8000
CI=false
```

### Timeouts

Les timeouts sont configurés dans `playwright.config.ts` :

- Test timeout: 60s
- Expect timeout: 10s
- Action timeout: 15s
- Navigation timeout: 30s

## 🐛 Debugging

### Mode debug

```bash
npx playwright test --debug
```

### Screenshots et vidéos

Les screenshots et vidéos sont automatiquement capturés en cas d'échec :

- `test-results/` : Screenshots et vidéos
- `playwright-report/` : Rapport HTML détaillé

### Traces

```bash
# Voir les traces d'un test échoué
npx playwright show-trace test-results/.../trace.zip
```

## 📌 Bonnes pratiques

### 1. Utiliser les helpers

❌ **Mauvais** :
```typescript
await page.goto('/signup');
await page.fill('#email', 'test@example.com');
// ...
```

✅ **Bon** :
```typescript
await authHelper.signup(userData);
```

### 2. Générer des données uniques

❌ **Mauvais** :
```typescript
email: 'test@example.com' // Peut causer des conflits
```

✅ **Bon** :
```typescript
email: generators.randomEmail() // Unique à chaque run
```

### 3. Attendre correctement

❌ **Mauvais** :
```typescript
await page.waitForTimeout(5000); // Attente fixe
```

✅ **Bon** :
```typescript
await waitHelper.waitForLoadingToFinish(); // Attente intelligente
```

### 4. Vérifications robustes

❌ **Mauvais** :
```typescript
expect(await page.textContent('div')).toBe('Text');
```

✅ **Bon** :
```typescript
await expect(page.locator('div')).toHaveText('Text');
```

## 🔄 CI/CD

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 📚 Ressources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## 🆘 Problèmes courants

### Tests qui échouent aléatoirement

- Augmenter les timeouts
- Utiliser `waitForLoadingToFinish()`
- Vérifier la stabilité du réseau

### Conflits de base de données

- Utiliser `generators.randomEmail()`
- Nettoyer la BDD entre les tests
- Utiliser une BDD de test dédiée

### Éléments non trouvés

- Vérifier les sélecteurs
- Attendre que l'élément soit visible
- Utiliser `page.locator()` avec timeout

## 📞 Support

Pour toute question, créer une issue sur GitHub ou contacter l'équipe de développement.