import { test, expect } from '@playwright/test';
import { HomePage, SECCIONES } from './pages/HomePage';

test.describe('Home', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`muestra hero, disponibilidad y las secciones en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.hero).toBeVisible();
      await expect(home.badgeDisponible).toBeVisible();
      await expect(home.bloqueProyectos).toBeVisible();
      await expect(home.stack).toBeVisible();
    });
  }

  // La home es one-page: el navbar ancla contra estos ids. Si alguno se renombra
  // o desaparece, los enlaces del menú quedan apuntando a la nada sin que ningún
  // otro test lo note.
  test('existen todas las secciones ancladas', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    for (const id of SECCIONES) {
      await expect(home.seccion(id), `falta la sección #${id}`).toHaveCount(1);
    }
  });

  // Los carriles separados mostraban 1 destacado cada uno. Ahora la home muestra
  // los 5 publicados: 4 casos QA + 1 proyecto de desarrollo. Si volviera a
  // filtrar por `destacado`, este número bajaría a 2 y el test lo marcaría.
  test('la home lista los cinco proyectos publicados', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.cards).toHaveCount(5);
  });

  test('la home arranca con el filtro en QA', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.lista).toHaveAttribute('data-activo', 'qa');
    await expect(home.cardsDeTipo('dev')).toHaveCount(0);
  });

  // El filtro embebido no puede dejar la URL en /es/proyectos/dev mostrando la
  // home: recargar daría otra página.
  test('filtrar en la home no cambia la URL', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltro('dev').click();
    await expect(home.cardsDeTipo('dev').first()).toBeVisible();
    await expect(page).toHaveURL(/\/es\/$/);
  });

  // Cubre un riesgo concreto: la home embebe ContactContent y el listado
  // filtrable, que fuera de la home son páginas con su propio h1.
  test('hay un único h1', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  // `width` y `height` explícitos son lo que evita el CLS del elemento más
  // grande del primer viewport. El gate de Lighthouse está en performance ≥0.9.
  test('el retrato del hero declara dimensiones y texto alternativo', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const retrato = home.retrato;
    await expect(retrato).toBeVisible();
    await expect(retrato).toHaveAttribute('width', '200');
    await expect(retrato).toHaveAttribute('height', '200');
    const alt = await retrato.getAttribute('alt');
    expect(alt, 'el alt no puede estar vacío ni ser el nombre del archivo').toBeTruthy();
    expect(alt!.length).toBeGreaterThan(10);
  });

  // No se sirve el JPG original: astro:assets emite WebP en build.
  test('el retrato se sirve en WebP', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.retrato).toHaveAttribute('src', /\.webp/);
  });
});

test.describe('El filtro de la home funciona sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la home sirve el estado QA desde el servidor', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.cardsDeTipo('qa').first()).toBeVisible();
    await expect(home.cardsDeTipo('dev')).toHaveCount(0);
  });

  // Sin JS los botones son enlaces reales: navegan al listado, que es una
  // degradación correcta, no una rotura.
  test('sin JS el filtro navega al listado', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltro('dev').click();
    await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
  });
});
