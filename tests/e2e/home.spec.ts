import { test, expect } from '@playwright/test';
import { HomePage, SECCIONES } from './pages/HomePage';

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

  // La home es one-page: el navbar ancla contra estos seis ids. Si alguno se
  // renombra o desaparece, los enlaces del menú quedan apuntando a la nada sin
  // que ningún otro test lo note.
  test('existen las seis secciones ancladas', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    for (const id of SECCIONES) {
      await expect(home.seccion(id), `falta la sección #${id}`).toHaveCount(1);
    }
  });

  test('lista solo los casos destacados', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    // De los 4 casos publicados, solo "gestor-operaciones" tiene
    // `destacado: true`. La brecha entre 4 y 1 es lo que hace que este test
    // verifique el filtro de HomeContent.astro: si diera 4, estaría pasando
    // con o sin filtro y no probaría nada. El listado completo sin filtrar se
    // cubre en proyectos.spec.ts, que espera 4 en /es/proyectos.
    await expect(home.casos).toHaveCount(1);
  });

  // El bloque dev dejó de ser un párrafo: ahora renderiza las mismas cards que
  // QA. Sin esta aserción, que el carril quede vacío no rompería nada.
  test('el bloque dev muestra cards de proyecto', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.proyectos.first()).toBeVisible();
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

  // Ahora cubre un riesgo concreto: la home embebe ContactContent y
  // AboutContent, que fuera de la home son páginas con su propio h1.
  test('hay un único h1', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
});
