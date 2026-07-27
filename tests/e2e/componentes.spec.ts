import { test, expect } from '@playwright/test';

test.describe('Componentes de dominio QA', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/es/demo-componentes'); });

  test('el reporte de bug muestra todos sus campos', async ({ page }) => {
    const bug = page.getByTestId('bug-report').first();
    await expect(bug).toContainText('BUG-001');
    await expect(bug).toContainText('Pasos para reproducir');
    await expect(bug).toContainText('Resultado esperado');
    await expect(bug).toContainText('Resultado obtenido');
  });

  test('la severidad se comunica con texto, no solo con color', async ({ page }) => {
    const severidad = page.getByTestId('bug-severidad').first();
    await expect(severidad).toHaveText(/Crítica|Alta|Media|Baja/);
  });

  test('la matriz de casos renderiza una tabla accesible', async ({ page }) => {
    const matriz = page.getByTestId('test-matrix');
    await expect(matriz.locator('caption')).toBeVisible();
    await expect(matriz.locator('th')).toHaveCount(4);
  });

  test('las métricas muestran etiqueta y valor', async ({ page }) => {
    await expect(page.getByTestId('metricas').locator('dt').first()).toBeVisible();
    await expect(page.getByTestId('metricas').locator('dd').first()).toBeVisible();
  });
});
