// helpers/auth-helper.ts
import { Page, expect } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  async signup(user: any) {
    await this.page.goto('/signup');
    
    await this.page.fill('#first_name', user.firstName);
    await this.page.fill('#last_name', user.lastName);
    await this.page.fill('#email', user.email);
    await this.page.fill('#phoneNumber', user.phone);
    await this.page.fill('#password', user.password);
    await this.page.fill('#passwordConfirm', user.password);
    
    await this.page.click('button[type="submit"]');
  }

  async skipVerification() {
    // ✅ Vérifier si on est sur /verify
    if (!this.page.url().includes('/verify')) {
      return; // Déjà passé
    }

    // ✅ CORRECTION : Aller directement à /preferences ou /
    console.log('⏭️  Skip verification: navigation directe');
    await this.page.goto('/preferences');
    
    // Si /preferences n'existe pas ou redirige, aller à /
    await this.page.waitForTimeout(1000);
    if (this.page.url().includes('/verify')) {
      await this.page.goto('/');
    }
  }

  async completeSignupFlow(user: any) {
    await this.signup(user);
    
    // ✅ Attendre redirection
    try {
      await this.page.waitForURL(/\/(verify|preferences|\/)/, { timeout: 15000 });
    } catch (e) {
      console.warn('⚠️ Timeout redirection, continuer...');
    }
    
    // ✅ Si sur /verify, skip
    if (this.page.url().includes('/verify')) {
      await this.skipVerification();
    }
    
    // ✅ Ne PAS configurer les préférences (comme demandé)
    
    // ✅ Attendre d'être sur / ou /preferences
    await this.page.waitForURL(/\/(preferences|\/)/, { timeout: 10000 });
  }

  async verifyAuthSuccess() {
    const user = await this.page.evaluate(() => {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    });
    
    expect(user).not.toBeNull();
    return { user };
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.locator('text=/Se déconnecter|Logout|Déconnexion/i').isVisible().catch(() => false);
  }

  async clearSession() {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }
}