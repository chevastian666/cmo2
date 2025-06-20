/**
 * Precintos E2E Tests
 * By Cheva
 */
import { test, expect } from '../fixtures/auth.fixture';
import { PrecintosPage } from '../pages/PrecintosPage';

test.describe('Precintos Management', () => {
  let precintosPage: PrecintosPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    precintosPage = new PrecintosPage(authenticatedPage);
    await precintosPage.goto();
  });

  test('should display precintos page correctly', async ({ authenticatedPage }) => {
    // Check page title
    await expect(authenticatedPage.getByRole('heading', { name: /precintos electrónicos/i })).toBeVisible();
    
    // Check main elements
    await expect(precintosPage.searchInput).toBeVisible();
    await expect(precintosPage.createButton).toBeVisible();
    await expect(precintosPage.filterButton).toBeVisible();
    await expect(precintosPage.exportButton).toBeVisible();
    
    // Should have precintos loaded
    const count = await precintosPage.getPrecintoCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search precintos', async () => {
    // Get initial count
    const initialCount = await precintosPage.getPrecintoCount();
    
    // Search for specific precinto
    await precintosPage.search('PRE-001');
    
    // Wait for search results
    await precintosPage.page.waitForTimeout(1000);
    
    // Should have fewer results
    const searchCount = await precintosPage.getPrecintoCount();
    expect(searchCount).toBeLessThanOrEqual(initialCount);
    
    // Clear search
    await precintosPage.searchInput.clear();
    await precintosPage.page.waitForTimeout(1000);
    
    // Should restore original results
    const clearedCount = await precintosPage.getPrecintoCount();
    expect(clearedCount).toBe(initialCount);
  });

  test('should filter precintos by estado', async () => {
    // Apply filter for "Activo" estado
    await precintosPage.filterByEstado('Activo');
    
    // Wait for filtered results
    await precintosPage.waitForLoad();
    
    // Check all visible precintos have "Activo" estado
    const cards = await precintosPage.precintoCards.all();
    for (const card of cards) {
      const estadoText = await card.getByText(/activo/i).textContent();
      expect(estadoText?.toLowerCase()).toContain('activo');
    }
  });

  test('should navigate through pages', async () => {
    // Get initial page info
    const initialPage = await precintosPage.getCurrentPageInfo();
    
    if (initialPage && initialPage.totalPages > 1) {
      // Go to next page
      await precintosPage.goToNextPage();
      
      // Verify page changed
      const nextPage = await precintosPage.getCurrentPageInfo();
      expect(nextPage?.currentPage).toBe(2);
      
      // Go back to previous page
      await precintosPage.goToPrevPage();
      
      // Verify returned to page 1
      const prevPage = await precintosPage.getCurrentPageInfo();
      expect(prevPage?.currentPage).toBe(1);
    }
  });

  test('should create new precinto', async ({ authenticatedPage }) => {
    const newPrecinto = {
      codigo: `PRE-TEST-${Date.now()}`,
      empresa: 'Test Company E2E',
      descripcion: 'Precinto creado en test E2E',
    };
    
    await precintosPage.createPrecinto(newPrecinto);
    
    // Verify success message
    await expect(authenticatedPage.getByText(/creado exitosamente/i)).toBeVisible();
    
    // Search for the new precinto
    await precintosPage.search(newPrecinto.codigo);
    await precintosPage.page.waitForTimeout(1000);
    
    // Should find the created precinto
    const createdCard = authenticatedPage.locator(`[data-testid="precinto-card"]:has-text("${newPrecinto.codigo}")`);
    await expect(createdCard).toBeVisible();
  });

  test('should view precinto details', async () => {
    // Get first precinto code
    const firstCard = precintosPage.precintoCards.first();
    const codigo = await firstCard.getByText(/PRE-\d+/).textContent();
    
    if (codigo) {
      const modal = await precintosPage.viewPrecintoDetails(codigo);
      
      // Check modal content
      await expect(modal.getByText(codigo)).toBeVisible();
      await expect(modal.getByText(/información general/i)).toBeVisible();
      await expect(modal.getByText(/ubicación/i)).toBeVisible();
      await expect(modal.getByText(/estado del dispositivo/i)).toBeVisible();
      
      // Close modal
      await modal.getByRole('button', { name: /cerrar/i }).click();
      await expect(modal).not.toBeVisible();
    }
  });

  test('should activate inactive precinto', async ({ authenticatedPage }) => {
    // First, we need to find an inactive precinto
    // For this test, we'll filter by inactive estado
    await precintosPage.filterByEstado('Inactivo');
    await precintosPage.waitForLoad();
    
    const inactiveCount = await precintosPage.getPrecintoCount();
    
    if (inactiveCount > 0) {
      // Get first inactive precinto
      const firstCard = precintosPage.precintoCards.first();
      const codigo = await firstCard.getByText(/PRE-\d+/).textContent();
      
      if (codigo) {
        await precintosPage.activatePrecinto(codigo);
        
        // Verify success message
        await expect(authenticatedPage.getByText(/activado/i)).toBeVisible();
        
        // The card should update to show "Activo" estado
        await expect(firstCard.getByText(/activo/i)).toBeVisible();
      }
    }
  });

  test('should export precintos data', async ({ authenticatedPage }) => {
    // Test CSV export
    const download = await precintosPage.exportData('csv');
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/precintos.*\.csv/);
    
    // Verify success message
    await expect(authenticatedPage.getByText(/exportación completada/i)).toBeVisible();
  });

  test('should handle empty search results', async ({ authenticatedPage }) => {
    // Search for non-existent precinto
    await precintosPage.search('NONEXISTENT999999');
    await precintosPage.page.waitForTimeout(1000);
    
    // Should show no results message
    await expect(authenticatedPage.getByText(/no se encontraron precintos/i)).toBeVisible();
  });

  test('should validate form when creating precinto', async ({ authenticatedPage }) => {
    // Open create modal
    await precintosPage.createButton.click();
    
    const modal = authenticatedPage.getByRole('dialog');
    await expect(modal).toBeVisible();
    
    // Try to submit empty form
    await modal.getByRole('button', { name: /crear/i }).click();
    
    // Should show validation errors
    await expect(modal.getByText(/el código es requerido/i)).toBeVisible();
    await expect(modal.getByText(/la empresa es requerida/i)).toBeVisible();
    
    // Cancel
    await modal.getByRole('button', { name: /cancelar/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test('should handle real-time updates', async ({ context }) => {
    // Open second tab
    const newPage = await context.newPage();
    const secondPrecintosPage = new PrecintosPage(newPage);
    await newPage.goto('/precintos');
    await secondPrecintosPage.waitForLoad();
    
    // Create precinto in first tab
    const newPrecinto = {
      codigo: `PRE-RT-${Date.now()}`,
      empresa: 'Real-time Test',
    };
    
    await precintosPage.createPrecinto(newPrecinto);
    
    // Wait for real-time update
    await newPage.waitForTimeout(2000);
    
    // Should see the new precinto in second tab
    const updatedCard = newPage.locator(`[data-testid="precinto-card"]:has-text("${newPrecinto.codigo}")`);
    await expect(updatedCard).toBeVisible();
    
    await newPage.close();
  });
});