// e2e/02-create-trip.spec.ts

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../e2e/helpers/auth-helper';
import { TripHelper } from '../e2e/helpers/trip-helper';
import { WaitHelper } from '../e2e/helpers/wait-helper';
import { testUsers, testTrip, generators } from './fixtures/test-data';

/**
 * SCÉNARIO CRITIQUE #2 : Création et soumission d'une annonce
 */

test.describe('Création de trajet', () => {
  let authHelper: AuthHelper;
  let tripHelper: TripHelper;
  let waitHelper: WaitHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    tripHelper = new TripHelper(page);
    waitHelper = new WaitHelper(page);

    // ✅ MODIFIÉ : Utiliser un compte vérifié existant au lieu de créer un nouveau compte
    console.log('🔐 Connexion avec compte vérifié:', testUsers.verifiedUser.email);
    await authHelper.login(testUsers.verifiedUser.email, testUsers.verifiedUser.password);
    
    // Vérifier que l'utilisateur est bien connecté
    await expect(page).not.toHaveURL('/login');
    console.log('✅ Utilisateur authentifié et vérifié');
  });

  test("01 - Création complète d'un trajet avec succès", async ({ page }) => {
    const tripData = {
      ...testTrip,
      date: testTrip.date(),
    };

    console.log('📝 Création d\'un trajet:', tripData);

    // NAVIGATION
    await page.goto('/offer-ride');
    await page.waitForLoadState('domcontentloaded');

    // ✅ UTILISER fillLocationField et récupérer les valeurs
    const departureValue = await tripHelper.fillLocationField('departure', tripData.departure);
    const arrivalValue = await tripHelper.fillLocationField('arrival', tripData.arrival);

    // ✅ CORRIGÉ : Vérifier avec les valeurs retournées
    expect(departureValue.toLowerCase()).toContain('alger');
    expect(arrivalValue.toLowerCase()).toContain('oran');
    console.log(`✅ Départ: "${departureValue}", Arrivée: "${arrivalValue}"`);

    // Attendre le calcul de distance
    await tripHelper.waitForDistanceCalculation();

    // Remplir le reste
    await tripHelper.setDateTime(tripData.date, tripData.time);
    await tripHelper.setSeats(tripData.seats);
    await tripHelper.setPrice(tripData.price);

    // Vérifier bouton actif
    const publishButton = page.locator('button:has-text("Publier le trajet")');
    await expect(publishButton).toBeEnabled({ timeout: 5000 });

    // Soumettre
    await publishButton.click();

    // ✅ MODIFIÉ : Vérifier redirection vers la page de confirmation ou mes trajets
    // (pas /documents car l'utilisateur est déjà vérifié)
    await expect(page).toHaveURL(/\/(#hero)?(\?.*)?$/, {
  timeout: 10000
});
    console.log('✅ Trajet créé avec succès, redirection effectuée');
  });

  test('02 - Validation des champs obligatoires', async ({ page }) => {
    await page.goto('/offer-ride');
    await expect(page.locator('h1:has-text("Publier un trajet")')).toBeVisible();

    // Le bouton devrait être désactivé au départ
    await tripHelper.verifyPublishButtonState(false);

    // Remplir seulement le départ
    await tripHelper.fillLocationField('departure', 'Alger');

    // Le bouton devrait toujours être désactivé
    await tripHelper.verifyPublishButtonState(false);

    console.log('✅ Validation des champs obligatoires OK');
  });

  test('03 - Calcul automatique de la distance', async ({ page }) => {
    await page.goto('/offer-ride');

    // ✅ Remplir les deux champs
    await tripHelper.fillLocationField('departure', 'Alger');
    await tripHelper.fillLocationField('arrival', 'Oran');

    await waitHelper.waitForLoadingToFinish();
    await tripHelper.waitForDistanceCalculation();

    const distance = await tripHelper.getDisplayedDistance();
    
    // Alger-Oran fait environ 400-450 km
    expect(distance).toBeGreaterThan(300);
    expect(distance).toBeLessThan(500);

    console.log(`✅ Distance calculée: ${distance} km`);
  });

  test('04 - Prix suggéré basé sur le carburant', async ({ page }) => {
    await page.goto('/offer-ride');

    await tripHelper.fillLocationField('departure', 'Alger');
    await tripHelper.fillLocationField('arrival', 'Oran');

    await waitHelper.waitForLoadingToFinish();
    await tripHelper.waitForDistanceCalculation();

    await tripHelper.setFuelInfo('gasoil', 8.0);

    await expect(page.locator('text=Prix suggéré')).toBeVisible({ timeout: 5000 });

    const suggestedPriceText = await page.locator('text=/Prix suggéré.*\\d+.*DZD/').textContent();
    const suggestedPrice = parseInt(suggestedPriceText?.match(/\d+/)?.[0] || '0');
    
    expect(suggestedPrice).toBeGreaterThan(0);
    console.log(`💡 Prix suggéré: ${suggestedPrice} DZD`);
  });

  test('05 - Option trajet Comfort (+30%)', async ({ page }) => {
    await page.goto('/offer-ride');

    await tripHelper.fillLocationField('departure', 'Alger');
    await tripHelper.fillLocationField('arrival', 'Oran');
    await waitHelper.waitForLoadingToFinish();

    const basePrice = 1000;
    await tripHelper.setPrice(basePrice);

    const priceBeforeComfort = await tripHelper.getPassengerPrice();
    const expectedBeforeComfort = basePrice + Math.round(basePrice * 0.15);
    expect(priceBeforeComfort).toBeGreaterThanOrEqual(expectedBeforeComfort - 10);
    expect(priceBeforeComfort).toBeLessThanOrEqual(expectedBeforeComfort + 10);

    await tripHelper.toggleComfort(true);

    const priceAfterComfort = await tripHelper.getPassengerPrice();
    console.log(`💎 Prix avec Comfort: ${priceAfterComfort} DZD (avant: ${priceBeforeComfort} DZD)`);
    expect(priceAfterComfort).toBeGreaterThan(priceBeforeComfort);
  });

  test('06 - Sélection de préférences de trajet', async ({ page }) => {
    await page.goto('/offer-ride');
    
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Publier un trajet")')).toBeVisible();

    const preferencesSection = page.locator('h2:has-text("Préférences de trajet")');
    await preferencesSection.waitFor({ state: 'visible', timeout: 10000 });
    await preferencesSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    await tripHelper.selectTripPreferences(3);

    const selectedPrefs = page.locator('button').filter({ hasText: /⚡|🛡️|🎶/ });
    const selectedCount = await selectedPrefs.count();
    
    expect(selectedCount).toBeGreaterThanOrEqual(1);
    console.log(`✅ ${selectedCount} préférences sélectionnées`);
  });

  test('07 - Aperçu carte avec itinéraire', async ({ page }) => {
    await page.goto('/offer-ride');

    await tripHelper.fillLocationField('departure', 'Alger');
    await tripHelper.fillLocationField('arrival', 'Oran');
    await waitHelper.waitForLoadingToFinish();

    await tripHelper.verifyMapDisplayed();
    console.log('✅ Carte interactive affichée');

    const fullscreenButton = page.locator('button:has-text("plein écran"), button:has-text("fullscreen")');
    await expect(fullscreenButton).toBeVisible();
  });

  test('08 - Ajout de détails supplémentaires', async ({ page }) => {
    await page.goto('/offer-ride');

    const tripData = {
      ...testTrip,
      date: testTrip.date(),
    };

    await tripHelper.fillLocationField('departure', tripData.departure);
    await tripHelper.fillLocationField('arrival', tripData.arrival);
    await waitHelper.waitForLoadingToFinish();

    await tripHelper.setDateTime(tripData.date, tripData.time);
    await tripHelper.setSeats(tripData.seats);
    await tripHelper.setPrice(tripData.price);

    const details = 'RDV à la station-service Naftal, route de l\'aéroport. Apportez votre masque.';
    await tripHelper.addTripDetails(details);

    const detailsTextarea = page.locator('textarea[placeholder*="point de rencontre"]');
    await expect(detailsTextarea).toHaveValue(details);

    console.log('✅ Détails supplémentaires ajoutés');
  });

  test('09 - Dates futures uniquement', async ({ page }) => {
    await page.goto('/offer-ride');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const dateTimeInput = page.locator('input[type="datetime-local"]');
    await dateTimeInput.fill(`${yesterdayStr}T10:00`);

    await tripHelper.fillLocationField('departure', 'Alger');
    await tripHelper.fillLocationField('arrival', 'Oran');
    await waitHelper.waitForLoadingToFinish();

    await tripHelper.setPrice(1000);

    const publishButton = page.locator('button:has-text("Publier")');
    const isDisabled = await publishButton.isDisabled();
    
    if (!isDisabled) {
      await publishButton.click();
      const errorMessage = page.locator('text=/date.*passée|past date|invalid date/i');
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    }

    console.log('✅ Validation des dates passées OK');
  });
});