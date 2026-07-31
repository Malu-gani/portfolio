import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';

test.describe('Toggle de tema', () => {
  test('arranca en claro cuando el sistema prefiere claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    expect(await new BasePage(page).temaActual()).toBe('light');
  });

  test('arranca en oscuro cuando el sistema prefiere oscuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/es/');
    expect(await new BasePage(page).temaActual()).toBe('dark');
  });

  test('la elección manual persiste al recargar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    const base = new BasePage(page);
    await base.alternarTema();
    expect(await base.temaActual()).toBe('dark');
    await base.recargar();
    expect(await base.temaActual()).toBe('dark');
  });

  test('la píldora activa es la del tema vigente', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    const base = new BasePage(page);
    await expect(base.temaClaro).toHaveAttribute('aria-pressed', 'true');
    await expect(base.temaOscuro).toHaveAttribute('aria-pressed', 'false');

    await base.elegirTema('dark');
    await expect(base.temaOscuro).toHaveAttribute('aria-pressed', 'true');
    await expect(base.temaClaro).toHaveAttribute('aria-pressed', 'false');
  });

  test('elegir el tema ya activo no lo cambia', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    const base = new BasePage(page);
    await base.elegirTema('light');
    expect(await base.temaActual()).toBe('light');
  });

  test('el toggle sigue funcionando después de navegar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    const base = new BasePage(page);
    await base.langToggle.click();
    await expect(page).toHaveURL(/\/en\/$/);
    await base.alternarTema();
    expect(await base.temaActual()).toBe('dark');
  });
});
