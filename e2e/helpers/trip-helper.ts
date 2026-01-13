import { Page, expect } from '@playwright/test';

export class TripHelper {
  constructor(private page: Page) {}

  async createTrip(trip: any) {
    await this.page.goto('/offer-ride');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    await this.fillLocationField('departure', trip.departure);
    await this.fillLocationField('arrival', trip.arrival);

    await this.setDateTime(trip.date, trip.time);
    await this.setSeats(trip.seats);
    await this.setPrice(trip.price);

    const publishButton = this.page.locator(
      'button:has-text("Publier le trajet"), button:has-text("Publish")'
    );
    await publishButton.click();
  }

  async fillLocationField(type: 'departure' | 'arrival', value: string) {
    const label = type === 'departure' ? 'DÉPART' : 'ARRIVÉE';
    const index = type === 'departure' ? 0 : 1;
    
    console.log(`\n📍 Remplissage du champ ${label} avec "${value}"`);
    
    // 1. Sélection par index
    const allTextInputs = this.page.locator('input[type="text"]:visible');
    const inputCount = await allTextInputs.count();
    console.log(`   → ${inputCount} input(s) text trouvé(s) sur la page`);
    
    const input = allTextInputs.nth(index);
    
    // 2. Vérifier le placeholder
    const placeholder = await input.getAttribute('placeholder');
    console.log(`   → Input #${index} avec placeholder: "${placeholder}"`);
    
    // 3. Attendre visibilité (SANS SCROLL)
    await input.waitFor({ state: 'visible', timeout: 10000 });
    
    // 4. Vérifier la valeur actuelle
    const currentValue = await input.inputValue();
    console.log(`   → Valeur actuelle: "${currentValue}"`);
    
    // 5. Sécurité
    if (type === 'arrival' && currentValue.toLowerCase().includes('alger')) {
      throw new Error(
        `❌ ERREUR : On essaye de remplir ARRIVÉE mais le champ contient "${currentValue}"!\n` +
        `   Le sélecteur pointe vers DÉPART au lieu d'ARRIVÉE.`
      );
    }
    
    // 6. Focus
    console.log(`   → Clic : Focus sur ${label}`);
    await input.click({ force: true });
    await this.page.waitForTimeout(300);
    
    // 7. Effacer si nécessaire
    if (currentValue.length > 0) {
      console.log(`   → Effacement de "${currentValue}"`);
      await input.fill('');
      await this.page.waitForTimeout(200);
    }
    
    // 8. Taper
    console.log(`   → Saisie de "${value}"`);
    await input.type(value, { delay: 100 });
    await this.page.waitForTimeout(800);
    
    // 9. Attendre suggestions avec un sélecteur plus précis
    // Chercher dans le container d'autocomplete (la div avec z-50)
    const suggestionsContainer = this.page.locator(
      'div.absolute.z-50:has(button):visible'
    ).first();
    
    const suggestions = suggestionsContainer.locator('button:visible')
      .filter({ hasText: new RegExp(value, 'i') });
    
    try {
      await suggestions.first().waitFor({ state: 'visible', timeout: 5000 });
      const count = await suggestions.count();
      console.log(`   → ${count} suggestion(s) trouvée(s)`);
      
      // 10. Cliquer sur la première suggestion
      const firstSuggestion = suggestions.first();
      const suggestionText = await firstSuggestion.textContent();
      console.log(`   → Clic sur suggestion: "${suggestionText}"`);
      
      await firstSuggestion.click();
      await this.page.waitForTimeout(500);
      
      // ✅ 11. IMPORTANT : Attendre que la liste disparaisse AUTOMATIQUEMENT
      // Grâce au fix, la liste doit se fermer seule après le clic
      console.log(`   → Attente fermeture automatique de la liste...`);
      await suggestionsContainer.waitFor({ 
        state: 'hidden', 
        timeout: 2000 
      }).catch(() => {
        console.log(`   ⚠️ Liste toujours visible, fermeture manuelle`);
      });
      
    } catch (error) {
      console.warn(`   ⚠️ Pas de suggestion trouvée`);
      // Si pas de suggestion, appuyer sur Enter
      await this.page.keyboard.press('Enter');
      await this.page.waitForTimeout(500);
    }
    
    // 12. Vérifier que l'autocomplete ne se réouvre PAS
    console.log(`   → Vérification que la liste reste fermée...`);
    await this.page.waitForTimeout(300);
    
    // Si la liste est toujours visible, c'est un problème
    const isStillVisible = await suggestionsContainer.isVisible().catch(() => false);
    if (isStillVisible) {
      console.warn(`   ⚠️ BUG : La liste s'est réouverte ! Fermeture forcée...`);
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(300);
    } else {
      console.log(`   ✅ Liste correctement fermée`);
    }
    
    // 13. Validation finale
    const finalValue = await input.inputValue();
    console.log(`   → Valeur finale: "${finalValue}"`);
    
    if (!finalValue.toLowerCase().includes(value.toLowerCase())) {
      await this.page.screenshot({ 
        path: `debug-${type}-failed.png`,
        fullPage: true 
      });
      
      throw new Error(
        `❌ ${label} incorrect!\n` +
        `   Attendu: "${value}"\n` +
        `   Reçu: "${finalValue}"`
      );
    }
    
    console.log(`✅ ${label} rempli avec succès: "${finalValue}"\n`);
    await this.page.waitForTimeout(300);
    
    // ✅ 14. RETOURNER la valeur finale pour permettre les vérifications
    return finalValue;
  }

  async waitForDistanceCalculation() {
    console.log('⏳ Attente calcul distance...');
    await this.page.waitForTimeout(2000);
    
    // ✅ CORRIGÉ : Sélecteur plus spécifique pour éviter les 4 matchs
    // Cible uniquement la distance dans la section itinéraire (pas dans "300 km" des pauses ni "L/100km")
    const distanceText = this.page.locator('span.font-semibold:has-text("km")').first();
    await expect(distanceText).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Distance calculée\n');
  }

  async getDisplayedDistance(): Promise<number> {
    // ✅ CORRIGÉ : Même sélecteur spécifique
    const distanceLocator = this.page.locator('span.font-semibold:has-text("km")').first();
    await distanceLocator.waitFor({ state: 'visible', timeout: 5000 });

    const text = await distanceLocator.textContent();
    if (!text) return 0;

    const match = text.match(/(\d+)\s*km/);
    return match ? parseInt(match[1]) : 0;
  }

  async setFuelInfo(type: string, consumption: number) {
    const fuelSelect = this.page.locator('select').first();
    
    const fuelTypeMap: Record<string, string> = {
      'gasoil': 'Gasoil',
      'essence': 'Essence Sans Plomb',
      'gpl': 'GPL',
      'electrique': 'Électrique'
    };
    
    await fuelSelect.selectOption({ label: fuelTypeMap[type.toLowerCase()] || type });
    
    const consumptionInput = this.page.locator(
      'div:has-text("CONSOMMATION")').locator('input[type="number"][max="20"]'
    );
    
    await consumptionInput.fill(consumption.toString());
    await this.page.waitForTimeout(500);
  }

  async setDateTime(date: string, time: string) {
    const dateInput = this.page.locator('input[type="datetime-local"]');
    await dateInput.waitFor({ state: 'visible', timeout: 5000 });
    await dateInput.fill(`${date}T${time}`);
    await this.page.waitForTimeout(300);
  }

  async setSeats(seats: number) {
    const seatsSection = this.page.locator('div:has-text("PLACES DISPONIBLES")').first();
    await seatsSection.waitFor({ state: 'visible', timeout: 5000 });
    
    for (let current = 3; current !== seats; ) {
      const currentValue = seatsSection.locator('div').filter({ hasText: /^\d+$/ }).first();
      const displayedValue = parseInt(await currentValue.textContent() || '0');
      
      if (displayedValue === seats) break;
      
      if (displayedValue < seats) {
        const incrementBtn = seatsSection.locator('button').last();
        await incrementBtn.click();
        await this.page.waitForTimeout(300);
      } else {
        const decrementBtn = seatsSection.locator('button').first();
        await decrementBtn.waitFor({ state: 'visible', timeout: 2000 });
        await decrementBtn.click();
        await this.page.waitForTimeout(300);
      }
    }
  }

  async setPrice(price: number) {
    const priceSection = this.page.locator('div:has-text("PRIX CONDUCTEUR")').first();
    const input = priceSection.locator('input[type="number"][min="100"]');
    
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.click();
    await input.fill(price.toString());
    await this.page.waitForTimeout(300);
  }

  async getPassengerPrice(): Promise<number> {
    const priceDetail = this.page.locator(
      'div.flex.items-center.justify-between:has-text("Le passager paie")'
    ).last();
    
    await priceDetail.waitFor({ state: 'visible', timeout: 5000 });
    
    const text = await priceDetail.textContent();
    // ✅ CORRIGÉ : Regex plus précise pour capturer uniquement les chiffres + espaces
    const match = text?.match(/(\d[\d,\s]*)\s*DA/);
    return match ? parseInt(match[1].replace(/[,\s]/g, '')) : 0;
  }

  async toggleComfort(enable: boolean) {
    // ✅ CORRIGÉ : Cliquer sur le label visible, vérifier l'état via data-state ou aria-checked
    const comfortSection = this.page.locator('div:has-text("Trajet Comfort (+30%)")').first();
    const comfortCheckbox = comfortSection.locator('button[role="checkbox"]').first();
    
    await comfortCheckbox.waitFor({ state: 'visible', timeout: 5000 });
    
    // Vérifier l'état via data-state (shadcn/ui) ou aria-checked
    const isChecked = await comfortCheckbox.getAttribute('data-state') === 'checked' ||
                      await comfortCheckbox.getAttribute('aria-checked') === 'true';
    
    if (isChecked !== enable) {
      // Cliquer sur la checkbox visible (bouton avec rôle checkbox)
      await comfortCheckbox.click();
      await this.page.waitForTimeout(800);
    }
  }

  async selectTripPreferences(count: number) {
    // ✅ CORRIGÉ : Utiliser getByRole au lieu de sélecteur CSS avec regex
    const prefs = this.page.getByRole('button').filter({ 
      has: this.page.locator('div').first().filter({ 
        hasText: /[⚡🛡️🎶🔇🚬🚭🐾🤫💬⚽🎵🎭🤔📚🎬🔬💻✈️]/ 
      }) 
    });
    
    const total = await prefs.count();
    console.log(`📝 ${total} préférences trouvées`);
    
    for (let i = 0; i < Math.min(count, total); i++) {
      await prefs.nth(i).click();
      await this.page.waitForTimeout(200);
    }
  }

  async verifyPublishButtonState(enabled: boolean) {
    const button = this.page.locator(
      'button:has-text("Publier le trajet"), button:has-text("Publier")'
    );
    
    await button.waitFor({ state: 'visible', timeout: 5000 });
    
    if (enabled) {
      await expect(button).toBeEnabled({ timeout: 5000 });
    } else {
      await expect(button).toBeDisabled({ timeout: 5000 });
    }
  }

  async verifyMapDisplayed() {
    // ✅ CORRIGÉ : Vérifier l'iframe OpenStreetMap au lieu de Leaflet
    const mapIframe = this.page.locator('iframe[title="Route Map"]');
    
    await expect(mapIframe).toBeVisible({ timeout: 15000 });
    console.log('✅ Carte OpenStreetMap affichée dans iframe');
  }

  async addTripDetails(details: string) {
    const textarea = this.page.locator('textarea');
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    await textarea.fill(details);
  }
}