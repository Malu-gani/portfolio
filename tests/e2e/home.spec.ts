import { test, expect } from '@playwright/test';
import { HomePage, SECCIONES } from './pages/HomePage';
import { esPill } from './utils/es-pill';

const EMAIL = 'maluganijuanmanuel@gmail.com';

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

  // Todas las secciones de la home centran su bajada bajo un título centrado.
  // Sobre mí era la única que no: el párrafo y el enlace colgaban del borde
  // izquierdo, y la asimetría se veía al compararla con Proyectos o Formación.
  test('la bajada de Sobre mí queda centrada como la del resto de las secciones', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.sobreResumen).toHaveCSS('text-align', 'center');

    // El `text-align` centra el renglón dentro de la caja; lo que faltaba
    // además era centrar la caja misma. Sin el margen automático el párrafo
    // arranca pegado a la izquierda de la sección y esta diferencia lo delata.
    const desvio = await page.evaluate(() => {
      const seccion = document.querySelector('[data-testid="bloque-sobre"]')!.getBoundingClientRect();
      const parrafo = document.querySelector('[data-testid="sobre-resumen"]')!.getBoundingClientRect();
      return Math.abs(parrafo.left - seccion.left - (seccion.right - parrafo.right));
    });
    expect(desvio, 'la caja del párrafo no está centrada en su sección').toBeLessThanOrEqual(1);
  });
});

test.describe('El atajo de email del hero', () => {
  // Copiar es una mejora encima del `mailto:`, no un reemplazo: sin JavaScript,
  // o en un navegador sin portapapeles, el clic tiene que seguir haciendo lo que
  // siempre hizo. Si el href se fuera del HTML, ese camino desaparecería.
  test('sigue siendo un mailto en el HTML', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.emailHero).toHaveAttribute('href', `mailto:${EMAIL}`);
  });

  test('al clickearlo copia la dirección y avisa', async ({ context, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const home = new HomePage(page);
    await home.abrir('es');
    await home.emailHero.click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    await expect(home.emailHero).toHaveText('Copiado');
  });

  // El aviso tiene que llegar también a quien no ve el cambio de texto.
  test('anuncia la copia por región viva', async ({ context, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const home = new HomePage(page);
    await home.abrir('es');
    await home.emailHero.click();
    // Acotado al hero a propósito: la sección Contacto monta su propio
    // `role="status"` y sin el acote el locator resolvería a dos elementos.
    await expect(home.hero.getByRole('status')).toHaveText('Copiado');
  });

  // El modo en que esto falla importa: si el portapapeles no está, el botón no
  // puede decir "Copiado" igual. Mentir es peor que no copiar.
  test('sin portapapeles no finge que copió', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Sobrescribe navigator.clipboard; estable solo en Chromium');
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: undefined });
    });
    const home = new HomePage(page);
    await home.abrir('es');
    // El clic cae al `mailto:`, que es justamente lo que queremos. Lo frenamos
    // acá para no dejar que el runner intente abrir un cliente de correo que no
    // existe; nuestro listener ya corrió antes que este, en el mismo document.
    await page.evaluate(() => document.addEventListener('click', (e) => e.preventDefault()));
    await home.emailHero.click();
    await expect(home.emailHero).toHaveText('Email');
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
  // se cursó sin rendir el examen final y el de ISTQB no está rendido.
  test('ningún ítem promete más de lo que hay', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const textos = (await home.itemsFormacion.allTextContents()).join(' ');
    expect(textos).toContain('Cursado');
    expect(textos).toContain('examen pendiente');
    expect(textos).toContain('Experto Universitario en Mercado de Capitales');
    expect(textos).not.toContain('Operador de Mercados Financieros');
    // "Título" o "Graduado" serían afirmaciones que no se sostienen.
    expect(textos).not.toMatch(/Graduado|Titulado|Certificado ISTQB/);
  });

  // Mismo criterio ya aplicado a los botones de acción: el estado no puede
  // volver a ser un rectángulo `rounded-md` sin que un test lo note.
  test('los 4 estados de Formación usan badge pill', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const estados = home.itemsFormacion.getByTestId('formacion-estado');
    const total = await estados.count();
    for (let i = 0; i < total; i++) {
      await esPill(estados.nth(i));
    }
  });

  // Bootcamp, ISTQB y UTN explican qué le aportan al perfil de QA; inglés no
  // suma esta línea porque ya está cubierto por su detalle.
  test('bootcamp, ISTQB y UTN muestran una descripción de qué aportan', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const items = home.itemsFormacion;
    await expect(items.nth(0)).toContainText('Fundamentos de testing manual y automatizado');
    await expect(items.nth(1)).toContainText('Fundamentos de testing según el estándar ISTQB');
    await expect(items.nth(2)).toContainText('Operar en bolsa y administrar carteras');
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

test.describe('El filtro del Stack', () => {
  test('los 3 bloques se ven con sus títulos', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    for (const grupo of ['stack-grupo-qa-testing', 'stack-grupo-desarrollo-datos', 'stack-grupo-devops-herramientas']) {
      await expect(page.getByTestId(grupo)).toBeVisible();
    }
  });

  // Atenúa, no oculta: el badge sigue en el DOM y sigue "visible" para
  // Playwright, solo cambia su opacidad.
  test('filtrar por Avanzado atenúa las tecnologías de otro nivel sin ocultarlas', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const noAvanzado = page.locator('[data-testid="stack-item"]:not([data-nivel="avanzado"])').first();
    await expect(noAvanzado).toHaveCSS('opacity', '1');

    await home.botonFiltroStack('avanzado').click();
    await expect(home.botonFiltroStack('avanzado')).toHaveAttribute('aria-current', 'true');
    await expect(noAvanzado).toHaveCSS('opacity', '0.35');
    await expect(noAvanzado).toBeVisible();
  });

  test('el filtro sigue funcionando después de una view transition', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    // Ida y vuelta real (no page.goto) para disparar el <ClientRouter/> de
    // Astro dos veces: sin volver a registrar el listener en
    // astro:after-swap, este click final no haría nada. `goBack()` en vez de
    // clickear un link del navbar: el navbar de escritorio (`nav-inicio`)
    // está oculto en mobile (ahí vive la Bottom Nav), así que un click
    // directo no serviría en todos los viewports.
    await page.getByTestId('link-sobre-completo').click();
    await expect(page).toHaveURL(/\/es\/sobre-mi$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/es\/$/);

    await home.botonFiltroStack('intermedio').click();
    await expect(home.botonFiltroStack('intermedio')).toHaveAttribute('aria-current', 'true');
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
