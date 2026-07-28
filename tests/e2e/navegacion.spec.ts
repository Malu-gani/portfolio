import { test, expect } from '@playwright/test';

const rutas = ['/es/', '/en/'];

test.describe('Navegación', () => {
  for (const ruta of rutas) {
    test(`la cabecera y el pie están presentes en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByTestId('nav-principal')).toBeVisible();
      await expect(page.getByTestId('pie')).toBeVisible();
    });
  }

  test('los enlaces del menú apuntan al idioma correcto', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByTestId('nav-qa')).toHaveAttribute('href', '/en/qa');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/en/about');
  });
});
