import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';

test.describe('Cambio de idioma', () => {
  test('la raíz redirige a español', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
  });

  test('el toggle lleva a la home equivalente', async ({ page }) => {
    await page.goto('/es/');
    const base = new BasePage(page);
    await base.langToggle.click();
    await expect(page).toHaveURL(/\/en\/$/);
    expect(await base.idiomaDelDocumento()).toBe('en');
  });

  test('la página declara su alternativa con hreflang', async ({ page }) => {
    await page.goto('/es/');
    const alterno = new BasePage(page).hreflangAlterno('en');
    await expect(alterno).toHaveAttribute('href', /\/en\/$/);
  });
});
