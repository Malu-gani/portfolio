import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rutasDelSitio } from './utils/rutas';
import { BasePage } from './pages/BasePage';

// Las rutas se derivan del filesystem (páginas estáticas + colecciones de
// contenido, ver `./utils/rutas.ts`) en vez de copiarse a mano: si se agrega una
// página o un caso/proyecto nuevo, este barrido lo cubre solo, sin tocar este
// archivo. La ruta raíz `/` no se incluye: es un `Astro.redirect('/es/')` sin
// contenido propio, y `page.goto` la resuelve igual en `/es/`, que ya está en
// la lista.
const paginas = rutasDelSitio();

for (const tema of ['light', 'dark'] as const) {
  test.describe(`Accesibilidad · tema ${tema}`, () => {
    for (const ruta of paginas) {
      test(`${ruta} no tiene violaciones WCAG AA`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.goto(ruta);
        const resultados = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(resultados.violations).toEqual([]);
      });
    }
  });
}

// axe-core clasifica `heading-order` como "best-practice", no como WCAG A/AA,
// así que el barrido de arriba (withTags wcag2a/wcag2aa/wcag21a/wcag21aa) no
// lo evalúa y puede dar cero violaciones aunque haya un salto de nivel real.
// Lighthouse sí lo audita y lo detectó en producción (h1 de la página seguido
// de un h3 en las tarjetas, sin h2 intermedio). Esta aserción propia cierra
// ese agujero de cobertura sin ensanchar los tags de axe para toda la suite.
test.describe('Orden de headings', () => {
  for (const ruta of paginas) {
    test(`${ruta} no salta niveles de heading`, async ({ page }) => {
      await page.goto(ruta);
      const niveles = await page.$$eval('h1, h2, h3, h4, h5, h6', (elementos) =>
        elementos.map((el) => Number(el.tagName.slice(1)))
      );
      let nivelMaximoVisto = 0;
      for (const nivel of niveles) {
        expect(nivel, `salto de heading detectado en ${ruta}: niveles ${niveles.join(',')}`)
          .toBeLessThanOrEqual(nivelMaximoVisto + 1);
        nivelMaximoVisto = Math.max(nivelMaximoVisto, nivel);
      }
    });
  }
});

test.describe('Navegación por teclado', () => {
  test('el primer tabulador revela el enlace de salto al contenido', async ({ page }) => {
    const base = new BasePage(page);
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    await expect(base.elementoEnfocado()).toHaveAttribute('href', '#contenido');
  });

  test('se llega al toggle de tema solo con el teclado', async ({ page }) => {
    const base = new BasePage(page);
    await page.goto('/es/');
    // El control es un grupo de dos píldoras: lo focusable son los botones, no
    // el contenedor `theme-toggle`. Alcanzar cualquiera de los dos prueba que
    // el control es operable con teclado.
    const pildoras = ['theme-claro', 'theme-oscuro'];
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const testid = await base.elementoEnfocado().getAttribute('data-testid');
      if (testid !== null && pildoras.includes(testid)) return;
    }
    throw new Error('No se alcanzó el toggle de tema con el teclado en 20 tabulaciones');
  });

  test('el foco siempre es visible', async ({ page }) => {
    const base = new BasePage(page);
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await base.elementoEnfocado().evaluate(
      (el) => getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe('none');
  });
});
