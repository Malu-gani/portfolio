import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Home', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`muestra hero, disponibilidad y ambos bloques en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.hero).toBeVisible();
      await expect(home.badgeDisponible).toBeVisible();
      await expect(home.bloqueQa).toBeVisible();
      await expect(home.bloqueDev).toBeVisible();
      await expect(home.stack).toBeVisible();
    });
  }

  test('lista solo los casos destacados', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    // De los 3 casos de ejemplo, "testing-freelance" tiene `destacado: false`
    // a propósito: si este test diera 3 (con o sin el filtro de
    // HomeContent.astro), no estaría verificando el filtro en absoluto. El
    // listado completo (sin filtrar) se cubre en casos.spec.ts, que sigue
    // esperando 3 en /qa.
    await expect(home.casos).toHaveCount(2);
  });

  test('el bloque QA precede al bloque Dev en el DOM', async ({ page }) => {
    await page.goto('/es/');
    const orden = await page.evaluate(() => {
      const qa = document.querySelector('[data-testid="bloque-qa"]')!;
      const dev = document.querySelector('[data-testid="bloque-dev"]')!;
      return qa.compareDocumentPosition(dev) & Node.DOCUMENT_POSITION_FOLLOWING ? 'qa-primero' : 'dev-primero';
    });
    expect(orden).toBe('qa-primero');
  });

  test('hay un único h1', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
});
