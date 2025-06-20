/**
 * Auth Test Fixtures
 * By Cheva
 */
/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import path from 'path';

export const test = base.extend({
  // Extend the context with authenticated state
  context: async ({ browser }, use) => {
    // Create a new context with saved auth state if it exists
    const authFile = path.join(__dirname, '../.auth/user.json');
    
    let context;
    try {
      context = await browser.newContext({
        storageState: authFile,
      });
    } catch {
      // If auth file doesn't exist, create a new context
      context = await browser.newContext();
    }
    
    await use(context);
    await context.close();
  },
  
  // Provide an authenticated page
  authenticatedPage: async ({ context, page }, use) => {
    // Check if already authenticated
    await page.goto('/');
    
    if (page.url().includes('/login')) {
      // Perform login
      await page.fill('input[type="email"]', 'admin@cmo.com');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('/');
      
      // Save auth state
      await context.storageState({ path: path.join(__dirname, '../.auth/user.json') });
    }
    
    await use(page);
  },
});

export { expect } from '@playwright/test';