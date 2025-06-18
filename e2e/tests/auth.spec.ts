/**
 * Authentication E2E Tests
 * By Cheva
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should display login page correctly', async ({ page }) => {
    await expect(loginPage.title).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    
    // Check demo credentials hint
    await expect(page.getByText(/demo:/i)).toBeVisible();
    await expect(page.getByText(/admin@cmo.com/i)).toBeVisible();
  });

  test('should show validation errors for empty fields', async () => {
    await loginPage.submitButton.click();
    
    await expect(loginPage.page.getByText(/el email es requerido/i)).toBeVisible();
    await expect(loginPage.page.getByText(/la contraseña es requerida/i)).toBeVisible();
  });

  test('should show error for invalid email format', async () => {
    await loginPage.emailInput.fill('invalid-email');
    await loginPage.passwordInput.fill('password123');
    await loginPage.submitButton.click();
    
    await expect(loginPage.page.getByText(/email inválido/i)).toBeVisible();
  });

  test('should toggle password visibility', async () => {
    await loginPage.passwordInput.fill('password123');
    
    // Initially password should be hidden
    expect(await loginPage.isPasswordVisible()).toBe(false);
    
    // Toggle visibility
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.isPasswordVisible()).toBe(true);
    
    // Toggle back
    await loginPage.togglePasswordVisibility();
    expect(await loginPage.isPasswordVisible()).toBe(false);
  });

  test('should show error for invalid credentials', async () => {
    await loginPage.login('wrong@email.com', 'wrongpassword');
    
    // Wait for error message
    const hasError = await loginPage.expectError('Credenciales inválidas');
    expect(hasError).toBe(true);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await loginPage.login('admin@cmo.com', 'admin123');
    
    // Should redirect to dashboard
    await page.waitForURL('/');
    
    // Should see dashboard content
    await expect(page.getByText(/Centro de Monitoreo de Operaciones/i)).toBeVisible();
    
    // User menu should be visible
    await expect(page.getByRole('button', { name: /admin/i })).toBeVisible();
  });

  test('should persist login state', async ({ page, context }) => {
    // Login
    await loginPage.login('admin@cmo.com', 'admin123');
    await page.waitForURL('/');
    
    // Save storage state
    await context.storageState({ path: 'e2e/.auth/user.json' });
    
    // Open new page
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    // Should not redirect to login
    expect(newPage.url()).not.toContain('/login');
    await expect(newPage.getByText(/Centro de Monitoreo de Operaciones/i)).toBeVisible();
    
    await newPage.close();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginPage.login('admin@cmo.com', 'admin123');
    await page.waitForURL('/');
    
    // Open user menu
    await page.getByRole('button', { name: /admin/i }).click();
    
    // Click logout
    await page.getByRole('menuitem', { name: /cerrar sesión/i }).click();
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(loginPage.title).toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/precintos');
    
    // Should redirect to login
    await page.waitForURL('/login');
    await expect(loginPage.title).toBeVisible();
  });

  test('should handle login with Enter key', async ({ page }) => {
    await loginPage.emailInput.fill('admin@cmo.com');
    await loginPage.passwordInput.fill('admin123');
    
    // Press Enter in password field
    await loginPage.passwordInput.press('Enter');
    
    // Should login successfully
    await page.waitForURL('/');
    await expect(page.getByText(/Centro de Monitoreo de Operaciones/i)).toBeVisible();
  });
});