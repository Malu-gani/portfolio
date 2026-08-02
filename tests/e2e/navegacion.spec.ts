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

  // El navbar es contextual: en la home los items son anclas (`#proyectos`) y
  // fuera de ella apuntan a la home posicionada en esa sección
  // (`/en/#proyectos`). El idioma solo se puede verificar en la segunda
  // forma, que es la única que lleva prefijo.
  test('fuera de la home los enlaces del menú apuntan al idioma correcto', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/en/#proyectos');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/en/#sobre-mi');

    await page.goto('/es/contacto');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/es/#proyectos');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/es/#sobre-mi');
  });

  // La página completa de Sobre mí ya no está en el menú: se llega desde el
  // resumen de la home. Este test es lo que quedó cubriendo que esa ruta
  // respete el idioma.
  test('el resumen de Sobre mí enlaza a la página completa en el idioma correcto', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByTestId('link-sobre-completo')).toHaveAttribute('href', '/en/about');

    await page.goto('/es/');
    await expect(page.getByTestId('link-sobre-completo')).toHaveAttribute('href', '/es/sobre-mi');
  });

  // El pie pasa a tener los enlaces de las secciones además de las redes. Sin
  // esta aserción, que quede solo el copyright no rompería nada.
  test('el pie enlaza secciones y redes', async ({ page }) => {
    await page.goto('/es/');
    const pie = page.getByTestId('pie');
    await expect(pie.getByTestId('pie-github')).toHaveAttribute('href', /github\.com/);
    await expect(pie.getByTestId('pie-linkedin')).toHaveAttribute('href', /linkedin\.com/);
    await expect(pie.getByTestId('pie-secciones').getByRole('link')).toHaveCount(3);
  });
});

test.describe('Scroll-spy del navbar', () => {
  // El menú de secciones existe recién a partir del breakpoint sm; fijar un
  // viewport de escritorio hace que este bloque diga lo mismo en los cuatro
  // proyectos, incluido `mobile`, donde si no el enlace estaría oculto y no se
  // podría clickear. La pantalla angosta se cubre en el bloque de abajo.
  test.use({ viewport: { width: 1280, height: 720 } });

  // Se navega por el ancla en vez de scrollear con `scrollIntoViewIfNeeded`:
  // ese método scrollea lo mínimo indispensable y deja la sección más abajo de
  // la banda del IntersectionObserver (medido: `#proyectos` quedaba en y=252
  // con la banda en 144–216, y el marcado correcto era `sobre-mi`). El ancla,
  // además, es cómo llega el usuario de verdad.
  test('la sección a la que se salta queda marcada en el menú', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByTestId('nav-inicio')).toHaveAttribute('aria-current', 'true');

    await page.getByTestId('nav-proyectos').click();

    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('aria-current', 'true', { timeout: 5000 });
    await expect(page.getByTestId('nav-inicio')).not.toHaveAttribute('aria-current', 'true');
  });

  test('fuera de la home el menú apunta a la home con ancla', async ({ page }) => {
    await page.goto('/es/contacto');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/es/#proyectos');
  });
});

test.describe('Menú en pantallas chicas', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('el menú de escritorio se oculta y el desplegable navega', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByTestId('nav-secciones')).toBeHidden();

    const menu = page.getByTestId('nav-mobile');
    await menu.locator('summary').click();
    await expect(page.getByTestId('m-nav-proyectos')).toBeVisible();

    await page.getByTestId('m-nav-proyectos').click();
    // El panel se cierra solo: si quedara abierto, taparía la sección.
    await expect(page.getByTestId('m-nav-proyectos')).toBeHidden();
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

test.describe('Navegación por ancla', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  // No alcanza con `toBeInViewport`: acepta una intersección parcial, así que
  // una sección que quedó medio tapada por el header sticky lo satisface igual.
  // Se mide dónde aterriza el borde superior, que es lo que el usuario ve.
  test('la sección aterriza por debajo del header, no tapada', async ({ page }) => {
    await page.goto('/es/');
    const alturaHeader = await page.evaluate(
      () => document.querySelector('header')!.getBoundingClientRect().height
    );

    for (const [testid, id] of [
      ['nav-sobre', 'sobre-mi'],
      ['nav-proyectos', 'proyectos'],
      ['nav-formacion', 'formacion'],
    ] as const) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByTestId(testid).click();
      await expect
        .poll(
          async () => page.evaluate((s) => Math.round(document.getElementById(s)!.getBoundingClientRect().top), id),
          { message: `#${id} nunca llegó a su posición`, timeout: 5000 }
        )
        .toBeLessThan(alturaHeader + 40);
      const top = await page.evaluate((s) => document.getElementById(s)!.getBoundingClientRect().top, id);
      expect(top, `#${id} quedó tapada por el header sticky`).toBeGreaterThanOrEqual(alturaHeader - 2);
    }
  });
});

// `scroll-snap-type: y proximity` estuvo en `html` y se revirtió el 02/08/2026.
// El snap tira del viewport después de que el scroll llega a destino, así que un
// click sobre un elemento a mitad de sección no aterriza: el test del filtro sin
// JavaScript fallaba 6 de 6 corridas con el snap puesto y pasaba 6 de 6 sin él,
// en chromium y en mobile. Esta guarda existe para que no vuelva sin que alguien
// lo decida a propósito y mida de nuevo — si vuelve, este test avisa.
test('la home no reintroduce scroll-snap', async ({ page }) => {
  await page.goto('/es/');
  const tipo = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollSnapType
  );
  expect(tipo, 'volvió el scroll-snap: rompe el click sobre elementos a mitad de sección').toBe('none');
});
