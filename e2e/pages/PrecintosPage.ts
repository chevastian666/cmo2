/**
 * Precintos Page Object Model
 * By Cheva
 */
import { Page, Locator } from '@playwright/test';

export class PrecintosPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly createButton: Locator;
  readonly filterButton: Locator;
  readonly exportButton: Locator;
  readonly precintoCards: Locator;
  readonly loadingSpinner: Locator;
  readonly pagination: {
    nextButton: Locator;
    prevButton: Locator;
    pageInfo: Locator;
  };

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder(/buscar/i);
    this.createButton = page.getByRole('button', { name: /nuevo precinto/i });
    this.filterButton = page.getByRole('button', { name: /filtrar/i });
    this.exportButton = page.getByRole('button', { name: /exportar/i });
    this.precintoCards = page.locator('[data-testid="precinto-card"]');
    this.loadingSpinner = page.getByText(/cargando/i);
    
    this.pagination = {
      nextButton: page.getByRole('button', { name: /siguiente/i }),
      prevButton: page.getByRole('button', { name: /anterior/i }),
      pageInfo: page.getByText(/página \d+ de \d+/i),
    };
  }

  async goto() {
    await this.page.goto('/precintos');
    await this.waitForLoad();
  }

  async waitForLoad() {
    // Wait for loading to disappear
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    // Wait for at least one precinto card
    await this.precintoCards.first().waitFor({ state: 'visible' });
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(500); // Debounce delay
  }

  async filterByEstado(estado: string) {
    await this.filterButton.click();
    await this.page.getByRole('option', { name: estado }).click();
    await this.page.getByRole('button', { name: /aplicar/i }).click();
  }

  async createPrecinto(data: {
    codigo: string;
    empresa: string;
    descripcion?: string;
  }) {
    await this.createButton.click();
    
    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });
    
    await modal.getByLabel(/código/i).fill(data.codigo);
    await modal.getByLabel(/empresa/i).fill(data.empresa);
    
    if (data.descripcion) {
      await modal.getByLabel(/descripción/i).fill(data.descripcion);
    }
    
    await modal.getByRole('button', { name: /crear/i }).click();
    
    // Wait for success message
    await this.page.getByText(/creado exitosamente/i).waitFor({ state: 'visible' });
  }

  async activatePrecinto(codigo: string) {
    const card = this.page.locator(`[data-testid="precinto-card"]:has-text("${codigo}")`);
    await card.getByRole('button', { name: /activar/i }).click();
    
    // Confirm in dialog
    await this.page.getByRole('button', { name: /confirmar/i }).click();
    
    // Wait for success
    await this.page.getByText(/activado/i).waitFor({ state: 'visible' });
  }

  async viewPrecintoDetails(codigo: string) {
    const card = this.page.locator(`[data-testid="precinto-card"]:has-text("${codigo}")`);
    await card.click();
    
    // Wait for modal
    const modal = this.page.getByRole('dialog');
    await modal.waitFor({ state: 'visible' });
    
    return modal;
  }

  async exportData(format: 'csv' | 'excel' | 'pdf') {
    await this.exportButton.click();
    await this.page.getByRole('menuitem', { name: new RegExp(format, 'i') }).click();
    
    // Wait for download
    const downloadPromise = this.page.waitForEvent('download');
    const download = await downloadPromise;
    
    return download;
  }

  async goToNextPage() {
    await this.pagination.nextButton.click();
    await this.waitForLoad();
  }

  async goToPrevPage() {
    await this.pagination.prevButton.click();
    await this.waitForLoad();
  }

  async getPrecintoCount() {
    return await this.precintoCards.count();
  }

  async getCurrentPageInfo() {
    const text = await this.pagination.pageInfo.textContent();
    const match = text?.match(/página (\d+) de (\d+)/i);
    
    if (match) {
      return {
        currentPage: parseInt(match[1]),
        totalPages: parseInt(match[2]),
      };
    }
    
    return null;
  }
}