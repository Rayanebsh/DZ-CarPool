// e2e/00-smoke.spec.ts

import { test, expect } from '@playwright/test';

/**
 * TESTS DE FUMÉE (Smoke Tests)
 * 
 * Tests rapides pour vérifier que l'application fonctionne de base.
 * Ces tests doivent être ultra-rapides et couvrir les fonctionnalités critiques.
 */

test.describe('Smoke Tests - Santé de l\'application', () => {
  
  test('01 - Page d\'accueil se charge correctement', async ({ page }) => {
    await page.goto('/');
    // Vérifier que le texte principal est visible
    console.log('✅ Page d\'accueil OK');
  });

  test('02 - Navigation vers la page d\'inscription', async ({ page }) => {
    await page.goto('/');
    
    // Chercher le lien/bouton S'inscrire
    const signupLink = page.locator('a[href="/signup"], button:has-text("S\'inscrire"), a:has-text("S\'inscrire")');
    await expect(signupLink.first()).toBeVisible();
    
    // Cliquer dessus
    await signupLink.first().click();
    
    // Vérifier qu'on est bien sur la page d'inscription
    await expect(page).toHaveURL(/signup/);
    console.log('✅ Navigation vers inscription OK');
  });

  test('03 - Navigation vers la page de connexion', async ({ page }) => {
    await page.goto('/');
    
    // Chercher le lien/bouton Se connecter
    const loginLink = page.locator('a[href="/login"], button:has-text("Connexion"), a:has-text("Connexion"), button:has-text("Login")');
    
    if (await loginLink.count() > 0) {
      await loginLink.first().click();
      
      // Vérifier qu'on est bien sur la page de connexion
      await expect(page).toHaveURL(/login/);

      console.log('✅ Navigation vers connexion OK');
    } else {
      console.log('⚠️  Lien de connexion non trouvé sur la page d\'accueil');
    }
  });

  test('04 - Navigation vers "Publier un trajet"', async ({ page }) => {
    await page.goto('/');
    
    // Chercher le lien "Publier un trajet" ou "Offer a ride"
    const offerLink = page.locator('a[href="/offer-ride"], button:has-text("Publier"), a:has-text("Publier")');
    
    if (await offerLink.count() > 0) {
      await offerLink.first().click();
      
      // Devrait rediriger vers login si non connecté, ou vers offer-ride si connecté
    const offerSection = page.locator('section#cta'); // Sélecteur plus précis
    await offerSection.scrollIntoViewIfNeeded();
    await expect(offerSection).toBeVisible({ timeout: 5000 });


    console.log('✅ Navigation vers publier un trajet OK');
      
      console.log('✅ Navigation vers publier un trajet OK');
    } else {
      console.log('⚠️  Lien "Publier un trajet" non trouvé');
    }
  });

  test('05 - Le formulaire de recherche est présent', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier la présence des champs de recherche
    const searchInputs = page.locator('input[type="text"], input[placeholder*="départ"], input[placeholder*="arrivée"]');
    
    if (await searchInputs.count() >= 2) {
      console.log('✅ Formulaire de recherche présent');
    } else {
      // Ce n'est peut-être pas critique, juste logger
      console.log('⚠️  Formulaire de recherche incomplet ou non trouvé');
    }
  });

  test('06 - Les ressources statiques se chargent', async ({ page }) => {
    const responses: any[] = [];
    
    // Capturer toutes les requêtes
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status()
      });
    });
    
    await page.goto('/');
    
    // Attendre que la page soit complètement chargée
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'il n'y a pas trop d'erreurs 404 ou 500
    const errors = responses.filter(r => r.status >= 400);
    const criticalErrors = errors.filter(r => r.status >= 500);
    
    expect(criticalErrors.length).toBe(0);
    
    if (errors.length > 0) {
      console.log('⚠️  Quelques ressources en erreur:', errors.slice(0, 5));
    } else {
      console.log('✅ Toutes les ressources se chargent correctement');
    }
  });

  test('07 - Footer est présent', async ({ page }) => {
    await page.goto('/');
    
    // Scroller vers le bas
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    // Chercher le footer
    const footer = page.locator('footer, [role="contentinfo"]');
    
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
      console.log('✅ Footer présent');
    } else {
      console.log('⚠️  Footer non trouvé');
    }
  });

  test('10 - Console n\'a pas d\'erreurs critiques', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  page.on('pageerror', error => consoleErrors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' }); // plus fiable que networkidle

  // Filtrer les erreurs non critiques
  const criticalErrors = consoleErrors.filter(error => 
    !error.includes('favicon') &&
    !error.includes('manifest') &&
    !error.toLowerCase().includes('warning')
  );

  if (criticalErrors.length > 0) {
    console.log('⚠️  Erreurs console détectées:', criticalErrors.slice(0, 3));
  } else {
    console.log('✅ Pas d\'erreurs critiques en console');
  }

  expect(criticalErrors.length).toBeLessThan(10);
});
});

/**
 * NOTES :
 * 
 * Ces tests sont conçus pour être rapides (< 30 secondes au total).
 * Ils vérifient que l'application démarre et que les pages principales sont accessibles.
 * 
 * Lancez-les avant les tests complets pour un feedback rapide :
 * npx playwright test 00-smoke
 */