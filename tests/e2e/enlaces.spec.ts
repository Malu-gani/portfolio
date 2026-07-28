import { test, expect } from '@playwright/test';
import { rutasDelSitio } from './utils/rutas';
import { EnlacesPage } from './pages/EnlacesPage';

// Las rutas se derivan del filesystem (ver `./utils/rutas.ts`), igual que en
// `a11y.spec.ts`: si se agrega una página o un caso/proyecto nuevo, este barrido
// lo cubre solo, sin tocar este archivo.
const paginas = rutasDelSitio();

test.describe('Integridad de enlaces internos', () => {
  for (const ruta of paginas) {
    test(`los enlaces internos de ${ruta} responden 200`, async ({ page, request }) => {
      await page.goto(ruta);
      const internos = await new EnlacesPage(page).hrefsInternos();

      // Falsificabilidad: si esta lista viniera vacía por un selector roto o
      // una página sin enlaces, las aserciones de abajo pasarían trivialmente.
      // Todas las páginas del sitio tienen nav + footer, así que siempre debe
      // haber al menos un enlace interno.
      expect(internos.length, `no se encontró ningún enlace interno en ${ruta}`).toBeGreaterThan(0);

      for (const href of internos) {
        const respuesta = await request.get(href);
        expect(respuesta.status(), `enlace roto: ${href} en ${ruta}`).toBe(200);
      }
    });
  }
});

test.describe('Integridad de enlaces externos', () => {
  // Los enlaces externos (LinkedIn, GitHub) dependen de la red y de servicios
  // de terceros que a veces bloquean bots (LinkedIn responde 999 a scrapers,
  // por ejemplo) o cortan momentáneamente. Un test así no es determinista, así
  // que no debe bloquear un pipeline de CI como si lo fuera: se salta en CI y
  // queda disponible para correrlo a mano cuando se quiera auditar la salud de
  // los enlaces externos reales.
  test.skip(!!process.env.CI, 'Depende de servicios externos (LinkedIn, GitHub); no es determinista para CI');

  test('todos los enlaces externos del sitio responden', async ({ page, request }) => {
    const externosUnicos = new Set<string>();
    for (const ruta of paginas) {
      await page.goto(ruta);
      const externos = await new EnlacesPage(page).hrefsExternos();
      for (const href of externos) externosUnicos.add(href);
    }

    expect(externosUnicos.size, 'no se encontró ningún enlace externo en todo el sitio').toBeGreaterThan(0);

    for (const href of externosUnicos) {
      const respuesta = await request.get(href, { failOnStatusCode: false, timeout: 15_000 });
      const status = respuesta.status();
      // LinkedIn responde 999 ("Request denied") a clientes que detecta como
      // bots/scrapers -- lo hace incluso con la URL de perfil correcta y
      // accesible desde un navegador real. No es una señal de que el enlace
      // esté roto, es anti-scraping de terceros. Verificado a mano: el mismo
      // link abierto en un navegador funciona.
      const esBloqueoDeBotConocido = href.includes('linkedin.com') && status === 999;
      if (esBloqueoDeBotConocido) continue;
      expect(status, `enlace externo caído: ${href}`).toBeLessThan(400);
    }
  });
});

test.describe('Enlaces externos abren con rel de seguridad', () => {
  for (const ruta of paginas) {
    test(`los enlaces target="_blank" de ${ruta} llevan rel="noopener"`, async ({ page }) => {
      await page.goto(ruta);
      const enlaces = new EnlacesPage(page).targetBlank();
      const total = await enlaces.count();

      // Falsificabilidad: el footer (presente en todas las rutas del sitio) lleva un
      // enlace target="_blank" a GitHub, así que siempre debería haber al
      // menos uno. Sin esta guarda, si alguien le saca el target="_blank"
      // al footer el día de mañana, este test sigue en verde con cero
      // elementos en vez de detectar la regresión.
      expect(total, `no se encontró ningún enlace target="_blank" en ${ruta}`).toBeGreaterThan(0);

      for (let i = 0; i < total; i++) {
        await expect(enlaces.nth(i)).toHaveAttribute('rel', /noopener/);
      }
    });
  }
});
