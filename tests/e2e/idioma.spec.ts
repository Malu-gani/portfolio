import { test, expect } from '@playwright/test';

test.describe('Cambio de idioma', () => {
  test('la raíz redirige a español', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
  });

  test('el toggle lleva a la home equivalente', async ({ page }) => {
    await page.goto('/es/');
    await page.getByTestId('lang-toggle').click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('la página declara su alternativa con hreflang', async ({ page }) => {
    await page.goto('/es/');
    const alterno = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(alterno).toHaveAttribute('href', /\/en\/$/);
  });
});
