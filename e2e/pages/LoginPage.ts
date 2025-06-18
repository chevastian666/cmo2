/**
 * Login Page Object Model
 * By Cheva
 */
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly showPasswordButton: Locator;
  readonly errorMessage: Locator;
  readonly title: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.showPasswordButton = page.getByLabel(/mostrar contraseña/i);
    this.errorMessage = page.getByRole('alert');
    this.title = page.getByText('CMO - Centro de Monitoreo');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(100); // Small delay for message to appear
    const errorText = await this.errorMessage.textContent();
    return errorText?.includes(message);
  }

  async togglePasswordVisibility() {
    await this.showPasswordButton.click();
  }

  async isPasswordVisible() {
    const type = await this.passwordInput.getAttribute('type');
    return type === 'text';
  }
}