import { test, expect } from '@playwright/test';
import { rutasDelSitio } from './utils/rutas';

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

// Guarda del invariante que evita el crash de WebKit, no de su síntoma.
// La transición cliente-a-cliente de Astro crashea el proceso de render de
// WebKit cuando una navegación cambia el estado de scroll del documento: ir de
// una página corta, que no es contenedor de scroll, a una larga que sí lo es.
// `overflow-y: scroll` en `html` (global.css) hace que el documento sea
// siempre contenedor de scroll, con lo que ese cambio de estado nunca ocurre.
//
// Se afirma sobre el estilo computado y no sobre `scrollHeight`: el arreglo no
// alarga las páginas cortas (scrollHeight sigue igualando clientHeight ahí), lo
// que cambia es que el documento ya es contenedor de scroll de entrada.
//
// Hace falta esta aserción además de los tests de navegación listado→detalle,
// porque esos solo detectan el crash de casualidad, cuando el contenido deja el
// listado más corto que el viewport — el bug apareció recién al borrar un caso
// y quedar /es/qa con dos tarjetas. Esta no depende del largo del contenido.
test.describe('Estabilidad del scroll entre navegaciones', () => {
  for (const ruta of rutasDelSitio()) {
    test(`${ruta} es contenedor de scroll aunque su contenido entre en el viewport`, async ({ page }) => {
      await page.goto(ruta);
      const overflowY = await page.evaluate(
        () => getComputedStyle(document.documentElement).overflowY
      );
      expect(overflowY, `${ruta} no es contenedor de scroll: una transición hacia o desde acá puede crashear WebKit`).toBe('scroll');
    });
  }
});
