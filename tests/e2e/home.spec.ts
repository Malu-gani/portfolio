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

  // La separación entre secciones pasa a ser espacio, no una línea. Si volviera
  // un `border-t`, la home tendría dos sistemas de separación conviviendo.
  test('las secciones se separan por espacio, no por línea', async ({ page }) => {
    await page.goto('/es/');
    const conBorde = await page.evaluate(() =>
      ['bloque-sobre', 'bloque-proyectos', 'stack', 'bloque-formacion', 'bloque-contacto']
        .map((id) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          if (!el) return `${id}: no existe`;
          const w = getComputedStyle(el).borderTopWidth;
          return w === '0px' ? null : `${id}: ${w}`;
        })
        .filter(Boolean)
    );
    expect(conBorde, 'quedaron secciones con border-t').toEqual([]);
  });
});

test.describe('Formación', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`lista los cuatro ítems en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.bloqueFormacion).toBeVisible();
      await expect(home.itemsFormacion).toHaveCount(4);
    });
  }

  // El estado va en texto, no solo por color ni por posición: es la misma
  // restricción que ya rige para severidad, estado de caso y nivel de stack.
  test('cada ítem declara su estado en texto', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const estados = home.itemsFormacion.getByTestId('formacion-estado');
    await expect(estados).toHaveCount(4);
    for (const texto of await estados.allTextContents()) {
      expect(texto.trim().length, 'un estado quedó vacío').toBeGreaterThan(0);
    }
  });

  // Ninguno de los cuatro ítems puede prometer más de lo que hay: el de la UTN
  // se cursó sin completar y el examen de ISTQB no está rendido.
  test('ningún ítem promete más de lo que hay', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const textos = (await home.itemsFormacion.allTextContents()).join(' ');
    expect(textos).toContain('Cursado sin completar');
    expect(textos).toContain('examen pendiente');
    // "Título" o "Graduado" serían afirmaciones que no se sostienen.
    expect(textos).not.toMatch(/Graduado|Titulado|Certificado ISTQB/);
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

test.describe('Aparición al scrollear', () => {
  test('las secciones terminan en su posición al recorrer la página', async ({ page }) => {
    await page.goto('/es/');

    // Antes de scrollear el efecto tiene que estar vivo: la clase que habilita
    // el CSS está puesta y al menos una sección bajo el pliegue sigue
    // desplazada. Si el <script> desapareciera esto nunca sería cierto, y sin
    // esta aserción el test de abajo pasaría igual con el efecto borrado.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('js-revelar')))
      .toBe(true);
    const hayDesplazada = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.revelar')].some(
        (el) => getComputedStyle(el).transform !== 'none'
      )
    );
    expect(hayDesplazada, 'con el efecto vivo debería haber al menos una sección desplazada').toBe(true);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // El observador es asíncrono y el desplazamiento se retira con una
    // transición de 500ms: `toBeVisible` no sirve de gate porque ni la clase
    // ni el desplazamiento cambian `display` o `visibility`, y leer el
    // transform apenas se agrega la clase captura un fotograma a mitad de
    // camino. Se espera a que la transición termine de verdad en las cinco
    // secciones antes de leer.
    await expect
      .poll(() =>
        page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('.revelar')].every(
            (el) => getComputedStyle(el).transform === 'none'
          )
        )
      )
      .toBe(true);
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll('.revelar')].map((el) => getComputedStyle(el).transform)
    );
    expect(transforms.length, 'ninguna sección declara la clase revelar').toBeGreaterThan(0);
    expect(transforms.every((t) => t === 'none'), `quedaron secciones desplazadas: ${transforms}`).toBe(true);
  });
});

// La restricción más importante del tratamiento visual: si el CSS escondiera
// o desplazara los elementos y el JS los revelara, un visitante sin
// JavaScript vería una página rota. El JS opta por el efecto, no lo habilita.
test.describe('Sin JavaScript no queda nada invisible', () => {
  test.use({ javaScriptEnabled: false });

  test('todas las secciones de la home están en su posición', async ({ page }) => {
    await page.goto('/es/');
    const transforms = await page.evaluate(() =>
      [...document.querySelectorAll('.revelar')].map((el) => getComputedStyle(el).transform)
    );
    expect(transforms.length).toBeGreaterThan(0);
    expect(transforms.every((t) => t === 'none'), `sin JS quedaron secciones desplazadas: ${transforms}`).toBe(true);
  });

  test('el documento no declara la clase que habilita el efecto', async ({ page }) => {
    await page.goto('/es/');
    const tiene = await page.evaluate(() => document.documentElement.classList.contains('js-revelar'));
    expect(tiene, 'la clase js-revelar apareció sin JavaScript').toBe(false);
  });
});
