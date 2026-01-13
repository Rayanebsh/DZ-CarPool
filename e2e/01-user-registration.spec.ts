// e2e/01-user-registration.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth-helper';
import { WaitHelper } from './helpers/wait-helper';
import { testUsers, generators } from './fixtures/test-data';

/**
 * SCÉNARIO CRITIQUE #1 : Inscription d'un utilisateur
 * 
 * Flow complet :
 * 1. Accès à la page d'inscription
 * 2. Remplissage du formulaire
 * 3. Soumission
 * 4. Vérification email/téléphone (skip en dev)
 * 5. Configuration des préférences
 * 6. Redirection vers l'accueil
 */

test.describe('Inscription utilisateur', () => {
  let authHelper: AuthHelper;
  let waitHelper: WaitHelper;
  
  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    waitHelper = new WaitHelper(page);
  });

  test('01 - Inscription complète avec succès', async ({ page }) => {
    // ARRANGE - Générer des données uniques
    const newUser = {
      ...testUsers.newUser,
      email: generators.randomEmail(),
      phone: generators.randomPhone()
    };

    console.log('📝 Creating user:', newUser.email);

    // ACT - Aller sur la page d'inscription
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign up|Inscription/i);

    // Vérifier que le formulaire est visible
    await expect(page.locator('h2:has-text("Créer votre compte")')).toBeVisible();

    // Remplir les informations personnelles
    await page.fill('#first_name', newUser.firstName);
    await page.fill('#last_name', newUser.lastName);
    
    // Vérifier la validation en temps réel
    const firstNameInput = page.locator('#first_name');
    await expect(firstNameInput).toHaveValue(newUser.firstName);

    // Remplir l'email et vérifier le format
    await page.fill('#email', newUser.email);
    await expect(page.locator('#email')).toHaveValue(newUser.email);

    // Remplir le téléphone
    await page.fill('#phoneNumber', newUser.phone);

    // Remplir les mots de passe
    await page.fill('#password', newUser.password);
    await page.fill('#passwordConfirm', newUser.password);

    // ASSERT - Le bouton submit doit être activé
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();

    // ACT - Soumettre le formulaire
    await submitButton.click();

    // ASSERT - Attendre la redirection vers /verify ou /preferences
    await page.waitForURL(/\/(verify|preferences)/, { timeout: 15000 });
    
    // Vérifier que l'utilisateur est bien connecté
    const userInfo = await authHelper.verifyAuthSuccess();
    expect(userInfo.user.email).toBe(newUser.email);
    expect(userInfo.user.first_name).toBe(newUser.firstName);
    expect(userInfo.user.last_name).toBe(newUser.lastName);

    console.log('✅ Inscription réussie pour:', newUser.email);
  });

  test('02 - Validation des erreurs du formulaire', async ({ page }) => {
    await page.goto('/signup');

    // Tenter de soumettre sans remplir
    await page.click('button[type="submit"]');

    // Les champs requis doivent empêcher la soumission
    await expect(page).toHaveURL(/signup/);

    // Tester email invalide
    await page.fill('#email', 'email-invalide');
    await page.fill('#password', 'short');
    await page.click('button[type="submit"]');

    // La page ne devrait pas changer
    await expect(page).toHaveURL(/signup/);

    // Tester mots de passe non correspondants
    await page.fill('#email', 'valid@example.com');
    await page.fill('#password', 'ValidPassword123!');
    await page.fill('#passwordConfirm', 'DifferentPassword123!');
    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    const errorMessage = page.locator('text=/ne correspondent pas|do not match/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    console.log('✅ Validation des erreurs OK');
  });

  test('03 - Configuration des préférences après inscription', async ({ page }) => {
    // Créer un utilisateur
    const userData = {
      ...testUsers.newUser,
      email: generators.randomEmail(),
      phone: generators.randomPhone()
    };

    console.log('📝 Testing preferences flow for:', userData.email);

    await authHelper.signup(userData);

    // Si redirection vers /verify, passer cette étape
    if (page.url().includes('/verify')) {
      await authHelper.skipVerification();
    }

    // Devrait être sur /preferences
    await page.waitForURL(/preferences/, { timeout: 10000 });

    // Vérifier le titre de la page
    await expect(page.locator('h1')).toContainText(/Parlez-nous de vous|Tell us about yourself/i);

    // Sélectionner quelques préférences
    const preferences = page.locator('button:has(div.text-3xl)');
    const preferenceCount = await preferences.count();
    
    if (preferenceCount > 0) {
      // Sélectionner les 3 premières préférences
      for (let i = 0; i < Math.min(3, preferenceCount); i++) {
        await preferences.nth(i).click();
        await page.waitForTimeout(300);
      }

      // Vérifier que les préférences sont bien sélectionnées (bordure orange)
      const selectedPrefs = page.locator('button.border-\\[\\#FF5722\\]');
      await expect(selectedPrefs.first()).toBeVisible();

      // Soumettre les préférences
      await page.click('button:has-text("Continuer"), button:has-text("Continue")');

      // Attendre la redirection vers l'accueil
      await page.waitForURL('/', { timeout: 10000 });
      
      // Vérifier qu'on est bien sur la page d'accueil
      await expect(page.locator('text=/Trouvez votre trajet|Find your ride/i')).toBeVisible();
      
      console.log('✅ Préférences configurées avec succès');
    }
  });

  test('04 - Inscription avec Google (OAuth)', async ({ page }) => {
    await page.goto('/signup');

    // Vérifier que le bouton Google est présent
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();

    // Note: Le test complet de Google OAuth nécessite une configuration spéciale
    console.log('⚠️  Test OAuth Google nécessite une configuration supplémentaire');
  });

  test('05 - Toggle langue français/anglais', async ({ page }) => {
    await page.goto('/signup');

    // Vérifier la langue par défaut (français)
    const frenchText = page.locator('text=/S\'inscrire|Inscription/i');
    if (await frenchText.count() > 0) {
      await expect(frenchText.first()).toBeVisible();

      // Changer pour anglais
      const langButton = page.locator('button:has-text("FR")');
      if (await langButton.count() > 0) {
        await langButton.click();
        await page.waitForTimeout(500);

        // Vérifier le changement
        await expect(page.locator('text=/Sign up/i')).toBeVisible();

        // Retour en français
        await page.click('button:has-text("EN")');
        await page.waitForTimeout(500);
        await expect(page.locator('text=/S\'inscrire/i')).toBeVisible();
        
        console.log('✅ Toggle langue fonctionne');
      }
    }
  });

  test('06 - Email déjà existant', async ({ page }) => {
    // Première inscription
    const userData = {
      ...testUsers.newUser,
      email: generators.randomEmail(),
      phone: generators.randomPhone()
    };

    console.log('📝 Testing duplicate email for:', userData.email);

    await authHelper.signup(userData);
    
    // Attendre que l'inscription soit complète
    await page.waitForURL(/\/(verify|preferences|$)/, { timeout: 10000 });

    // Déconnexion
    await authHelper.clearSession();

    // Tenter de s'inscrire à nouveau avec le même email
    await page.goto('/signup');
    
    await page.fill('#first_name', userData.firstName);
    await page.fill('#last_name', userData.lastName);
    await page.fill('#email', userData.email); // Même email
    await page.fill('#phoneNumber', generators.randomPhone()); // Nouveau téléphone
    await page.fill('#password', userData.password);
    await page.fill('#passwordConfirm', userData.password);

    await page.click('button[type="submit"]');

    // Vérifier le message d'erreur
    const errorMessage = page.locator('text=/existe déjà|already exists|email.*taken/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Détection de doublon email OK');
  });

  test('07 - Flow complet avec skip des étapes optionnelles', async ({ page }) => {
    const userData = {
      ...testUsers.newUser,
      email: generators.randomEmail(),
      phone: generators.randomPhone()
    };

    console.log('📝 Testing complete flow for:', userData.email);

    // Inscription complète
    await authHelper.completeSignupFlow(userData);

    // Vérifier qu'on est sur l'accueil
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=/Trouvez votre trajet|Find your ride/i')).toBeVisible();

    // Vérifier que l'utilisateur est connecté
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    console.log('✅ Flow complet réussi');
  });
});

/**
 * NOTES DE MAINTENANCE :
 * 
 * - Ces tests créent de vrais utilisateurs dans la base de données
 * - En CI/CD, utiliser une base de données de test dédiée
 * - Nettoyer les utilisateurs de test après chaque run
 * - Considérer l'utilisation de fixtures Django pour pré-remplir la BDD
 * - Les emails test.* sont filtrables pour cleanup
 */