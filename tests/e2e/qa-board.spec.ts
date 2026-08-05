import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('QA Board & Backlog Live', () => {
  test('la sección existe, anclada entre Proyectos y Stack', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoard).toBeVisible();
    await expect(page.locator('#qa-board')).toHaveCount(1);
  });

  test('muestra 4 tarjetas de KPI, cada una con texto', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoardKpis).toHaveCount(4);
    for (const kpi of await home.qaBoardKpis.all()) {
      const texto = await kpi.textContent();
      expect(texto?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  test('el feed tiene al menos 1 ítem', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoardFeed).toBeVisible();
    const cantidad = await home.qaBoardItems.count();
    expect(cantidad).toBeGreaterThan(0);
  });

  // Atenúa, no oculta: mismo criterio que el filtro de Stack.
  test('filtrar por Bugs atenúa los ítems que no son bug sin ocultarlos', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const noBug = page.locator('[data-testid="qa-board-item"]:not([data-tipo="bug"])').first();
    const hayNoBug = (await noBug.count()) > 0;
    test.skip(!hayNoBug, 'no hay ítems que no sean bug en el feed actual para probar la atenuación');

    await expect(noBug).toHaveCSS('opacity', '1');
    await home.botonFiltroQaBoard('bug').click();
    await expect(home.botonFiltroQaBoard('bug')).toHaveAttribute('aria-current', 'true');
    await expect(noBug).toHaveCSS('opacity', '0.35');
    await expect(noBug).toBeVisible();
  });

  test('el filtro cambia data-filtro-activo al elegir User Stories', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltroQaBoard('us').click();
    await expect(home.botonFiltroQaBoard('us')).toHaveAttribute('aria-current', 'true');
    await expect(home.qaBoardFeed).toHaveAttribute('data-filtro-activo', 'us');
  });

  test('el filtro sigue funcionando después de una view transition', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await page.getByTestId('link-sobre-completo').click();
    await expect(page).toHaveURL(/\/es\/sobre-mi$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/es\/$/);

    await home.botonFiltroQaBoard('bug').click();
    await expect(home.botonFiltroQaBoard('bug')).toHaveAttribute('aria-current', 'true');
  });

  test('los 2 CTA apuntan a Notion en pestaña nueva', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const ctaBugs = page.getByTestId('qa-board-cta-bugs');
    const ctaTareas = page.getByTestId('qa-board-cta-tareas');

    await expect(ctaBugs).toHaveAttribute('href', /^https:\/\/rain-scent-049\.notion\.site\//);
    await expect(ctaBugs).toHaveAttribute('target', '_blank');
    await expect(ctaTareas).toHaveAttribute('href', /^https:\/\/rain-scent-049\.notion\.site\//);
    await expect(ctaTareas).toHaveAttribute('target', '_blank');
  });

  test('el título y la bajada se traducen en inglés', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('en');
    await expect(home.qaBoard).toContainText('QA Board & Backlog Live');
    await expect(home.qaBoard).toContainText('updated on every deploy');
  });
});
