import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { rutasDelSitio } from './utils/rutas';

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

test.describe('Navegación por teclado', () => {
  test('el primer tabulador revela el enlace de salto al contenido', async ({ page }) => {
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    const enfocado = page.locator(':focus');
    await expect(enfocado).toHaveAttribute('href', '#contenido');
  });

  test('se llega al toggle de tema solo con el teclado', async ({ page }) => {
    await page.goto('/es/');
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const testid = await page.locator(':focus').getAttribute('data-testid');
      if (testid === 'theme-toggle') return;
    }
    throw new Error('No se alcanzó el toggle de tema con el teclado en 20 tabulaciones');
  });

  test('el foco siempre es visible', async ({ page }) => {
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.locator(':focus').evaluate(
      (el) => getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe('none');
  });
});
