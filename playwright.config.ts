// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour DZ-CarPool
 * Tests E2E automatisés avec scénarios critiques
 */
export default defineConfig({
  testDir: './e2e',
  
  /* Timeout par test */
  timeout: 60 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 10 * 1000
  },
  
  /* Configuration des tests */
  fullyParallel: false, // Séquentiel pour éviter les conflits de BDD
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  /* Configuration globale */
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    /* Timeouts */
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },

  /* Projets de tests */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    /* Décommenter pour tester sur d'autres navigateurs */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    /* Tests mobile */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Serveur de développement */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});