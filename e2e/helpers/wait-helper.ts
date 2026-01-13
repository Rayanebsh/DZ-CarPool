import { Page } from '@playwright/test';

export class WaitHelper {
  constructor(private page: Page) {}

  async waitForLoadingToFinish(timeout = 10000) {
    // 1. Attendre les loaders visuels
    const loaders = [
      '.loading',
      '.spinner',
      '[data-loading]',
      '.animate-spin',
      '[aria-busy="true"]',
      '[data-loading="true"]'
    ];

    for (const selector of loaders) {
      try {
        await this.page.locator(selector).waitFor({ 
          state: 'hidden', 
          timeout: 2000 
        });
      } catch {
        // Ignoré si le loader n'existe pas
      }
    }

    // 2. Attendre la stabilité du réseau (appels API terminés)
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Attendre qu'une requête API spécifique se termine
   */
  async waitForApiCall(urlPattern: string | RegExp, timeout = 10000) {
    try {
      await this.page.waitForResponse(
        response => {
          const url = response.url();
          const matches = typeof urlPattern === 'string' 
            ? url.includes(urlPattern)
            : urlPattern.test(url);
          return matches && response.status() === 200;
        },
        { timeout }
      );
      console.log(`✅ API call completed: ${urlPattern}`);
    } catch (error) {
      console.warn(`⚠️ API call timeout: ${urlPattern}`);
    }
  }

  /**
   * Attendre que les suggestions d'autocomplete apparaissent
   */
  async waitForAutocomplete(timeout = 5000) {
    const suggestionSelectors = [
      '[role="listbox"]',
      '[role="menu"]',
      '.suggestions',
      '.autocomplete-results',
      '[data-suggestions]'
    ];

    for (const selector of suggestionSelectors) {
      try {
        await this.page.locator(selector).first().waitFor({ 
          state: 'visible', 
          timeout: 2000 
        });
        console.log(`✅ Autocomplete visible: ${selector}`);
        return;
      } catch {
        // Essayer le prochain sélecteur
      }
    }
    
    console.warn('⚠️ Aucun autocomplete trouvé');
  }
}