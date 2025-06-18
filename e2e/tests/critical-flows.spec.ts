/**
 * Critical User Flows E2E Tests
 * By Cheva
 */
import { test, expect } from '../fixtures/auth.fixture';
import { PrecintosPage } from '../pages/PrecintosPage';

test.describe('Critical User Flows', () => {
  test('complete precinto lifecycle', async ({ authenticatedPage }) => {
    const precintosPage = new PrecintosPage(authenticatedPage);
    
    // 1. Login is handled by fixture
    
    // 2. Create new precinto
    await precintosPage.goto();
    
    const newPrecinto = {
      codigo: `PRE-FLOW-${Date.now()}`,
      empresa: 'Flow Test Company',
      descripcion: 'Precinto para test de flujo completo',
    };
    
    await precintosPage.createPrecinto(newPrecinto);
    await expect(authenticatedPage.getByText(/creado exitosamente/i)).toBeVisible();
    
    // 3. Activate the precinto
    await precintosPage.search(newPrecinto.codigo);
    await authenticatedPage.waitForTimeout(1000);
    
    // The new precinto should be inactive by default
    await precintosPage.activatePrecinto(newPrecinto.codigo);
    await expect(authenticatedPage.getByText(/activado/i)).toBeVisible();
    
    // 4. Navigate to Transitos
    await authenticatedPage.getByRole('link', { name: /tránsitos/i }).click();
    await expect(authenticatedPage.getByRole('heading', { name: /tránsitos activos/i })).toBeVisible();
    
    // 5. Create new transit with the precinto
    await authenticatedPage.getByRole('button', { name: /nuevo tránsito/i }).click();
    
    const modal = authenticatedPage.getByRole('dialog');
    await modal.getByLabel(/precinto/i).fill(newPrecinto.codigo);
    await modal.getByLabel(/origen/i).fill('Buenos Aires');
    await modal.getByLabel(/destino/i).fill('Córdoba');
    await modal.getByLabel(/camión/i).fill('ABC123');
    await modal.getByLabel(/conductor/i).fill('Juan Pérez');
    
    await modal.getByRole('button', { name: /crear/i }).click();
    await expect(authenticatedPage.getByText(/tránsito creado/i)).toBeVisible();
    
    // 6. Check alerts page
    await authenticatedPage.getByRole('link', { name: /alertas/i }).click();
    await expect(authenticatedPage.getByRole('heading', { name: /alertas y notificaciones/i })).toBeVisible();
    
    // 7. Go to Torre de Control
    await authenticatedPage.getByRole('link', { name: /torre de control/i }).click();
    await expect(authenticatedPage.getByText(/mapa en tiempo real/i)).toBeVisible();
    
    // Should see the active transit on the map
    await authenticatedPage.waitForTimeout(2000); // Wait for map to load
  });

  test('handle alert workflow', async ({ authenticatedPage }) => {
    // 1. Go to alerts page
    await authenticatedPage.goto('/alertas');
    await expect(authenticatedPage.getByRole('heading', { name: /alertas y notificaciones/i })).toBeVisible();
    
    // 2. Find an active alert
    const alertCards = authenticatedPage.locator('[data-testid="alert-card"]');
    const activeAlertCount = await alertCards.count();
    
    if (activeAlertCount > 0) {
      // 3. Click on first alert
      const firstAlert = alertCards.first();
      await firstAlert.click();
      
      // 4. View alert details
      const alertModal = authenticatedPage.getByRole('dialog');
      await expect(alertModal).toBeVisible();
      await expect(alertModal.getByText(/detalles de la alerta/i)).toBeVisible();
      
      // 5. Acknowledge alert
      await alertModal.getByRole('button', { name: /reconocer/i }).click();
      await expect(authenticatedPage.getByText(/alerta reconocida/i)).toBeVisible();
      
      // 6. Close modal
      await alertModal.getByRole('button', { name: /cerrar/i }).click();
      
      // 7. Alert should show as acknowledged
      await expect(firstAlert.getByText(/reconocida/i)).toBeVisible();
    }
  });

  test('export and reporting workflow', async ({ authenticatedPage }) => {
    // 1. Go to precintos
    await authenticatedPage.goto('/precintos');
    
    // 2. Apply filters
    const precintosPage = new PrecintosPage(authenticatedPage);
    await precintosPage.filterByEstado('Activo');
    await precintosPage.waitForLoad();
    
    // 3. Export filtered data
    const csvDownload = await precintosPage.exportData('csv');
    expect(csvDownload.suggestedFilename()).toMatch(/precintos.*\.csv/);
    
    // 4. Go to dashboard
    await authenticatedPage.getByRole('link', { name: /dashboard/i }).click();
    
    // 5. Check statistics
    await expect(authenticatedPage.getByText(/estadísticas generales/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/precintos activos/i)).toBeVisible();
    await expect(authenticatedPage.getByText(/tránsitos en curso/i)).toBeVisible();
    
    // 6. Download dashboard report
    const reportButton = authenticatedPage.getByRole('button', { name: /generar reporte/i });
    if (await reportButton.isVisible()) {
      await reportButton.click();
      const reportDownload = authenticatedPage.waitForEvent('download');
      await reportDownload;
    }
  });

  test('multi-tab workflow', async ({ authenticatedPage, context }) => {
    // 1. Open Torre de Control in first tab
    await authenticatedPage.goto('/torre-control');
    await expect(authenticatedPage.getByText(/mapa en tiempo real/i)).toBeVisible();
    
    // 2. Open Precintos in second tab
    const precintosTab = await context.newPage();
    await precintosTab.goto('/precintos');
    await precintosTab.getByText(/cargando/i).waitFor({ state: 'hidden' });
    
    // 3. Open Transitos in third tab
    const transitosTab = await context.newPage();
    await transitosTab.goto('/transitos');
    await transitosTab.getByText(/cargando/i).waitFor({ state: 'hidden' });
    
    // 4. Create action in precintos tab
    const precintosPage = new PrecintosPage(precintosTab);
    const testPrecinto = {
      codigo: `PRE-MULTI-${Date.now()}`,
      empresa: 'Multi-tab Test',
    };
    await precintosPage.createPrecinto(testPrecinto);
    
    // 5. Wait for real-time update
    await authenticatedPage.waitForTimeout(2000);
    
    // 6. Should see update in Torre de Control
    // The new precinto should appear in the statistics or recent activities
    
    // 7. Clean up
    await precintosTab.close();
    await transitosTab.close();
  });

  test('responsive mobile workflow', async ({ authenticatedPage }) => {
    // Set mobile viewport
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    
    // 1. Navigate using mobile menu
    await authenticatedPage.getByRole('button', { name: /menu/i }).click();
    await expect(authenticatedPage.getByRole('navigation')).toBeVisible();
    
    // 2. Go to precintos
    await authenticatedPage.getByRole('link', { name: /precintos/i }).click();
    await authenticatedPage.getByText(/cargando/i).waitFor({ state: 'hidden' });
    
    // 3. Check mobile layout
    const precintosCards = authenticatedPage.locator('[data-testid="precinto-card"]');
    const firstCard = precintosCards.first();
    
    // Cards should be stacked vertically on mobile
    const cardBox = await firstCard.boundingBox();
    expect(cardBox?.width).toBeLessThan(360);
    
    // 4. Open mobile search
    const searchButton = authenticatedPage.getByRole('button', { name: /buscar/i });
    if (await searchButton.isVisible()) {
      await searchButton.click();
    }
    
    // 5. Test mobile-specific interactions
    // Swipe gestures, touch interactions, etc.
  });
});