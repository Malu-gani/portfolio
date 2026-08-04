import { test, expect } from '@playwright/test';
import { ReportarPage } from './pages/ReportarPage';
import { camposReporte } from '../../src/data/reporte';

test.describe('Sección Reportar un problema', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`la sección está en la home en ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      await expect(reportar.bloque).toBeVisible();
      await expect(page.locator('#reportar')).toHaveCount(1);
    });

    // La plantilla se muestra, no se describe: quien solo lee ya se lleva la
    // señal, y el botón de copiar no copia algo invisible.
    test(`la plantilla está a la vista con todos sus campos en ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      const texto = await reportar.plantilla.textContent();
      for (const campo of camposReporte[lang]) {
        expect(texto, `falta el campo "${campo}" en ${lang}`).toContain(campo);
      }
    });

    test(`el enlace a GitHub apunta a la plantilla de ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      await expect(reportar.enGithub).toHaveAttribute(
        'href',
        `https://github.com/Malu-gani/portfolio/issues/new?template=bug-${lang}.yml`
      );
    });
  }

  // El repo exige rel="noopener" en todo target="_blank" (enlaces.spec.ts).
  // Sin esto el enlace nuevo rompe el barrido en las 11 rutas del sitio.
  test('el enlace a GitHub abre en pestaña nueva con rel de seguridad', async ({ page }) => {
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await expect(reportar.enGithub).toHaveAttribute('target', '_blank');
    await expect(reportar.enGithub).toHaveAttribute('rel', /noopener/);
  });

  test('copiar la plantilla la deja en el portapapeles', async ({ context, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await reportar.botonCopiar.click();
    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    for (const campo of camposReporte.es) {
      expect(copiado).toContain(campo);
    }
    await expect(reportar.aviso).toHaveText('Plantilla copiada');
  });

  // Mentir sobre el resultado es peor que no copiar.
  test('si falla la copia, avisa en vez de decir que copió', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Sobrescribe navigator.clipboard; estable solo en Chromium');
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('permiso denegado')) },
      });
    });
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await reportar.botonCopiar.click();
    await expect(reportar.aviso).toHaveText('No se pudo copiar. Seleccionala a mano.');
  });

  // El botón no tiene acción por defecto como el `mailto:` del hero: si no
  // avisa, el clic no hace absolutamente nada.
  test('sin portapapeles avisa en vez de no hacer nada', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Sobrescribe navigator.clipboard; estable solo en Chromium');
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', { configurable: true, value: undefined });
    });
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await reportar.botonCopiar.click();
    await expect(reportar.aviso).toHaveText('No se pudo copiar. Seleccionala a mano.');
  });
});

// El botón de copiar no puede esconder la plantilla detrás suyo: sin
// JavaScript tiene que seguir estando toda a la vista para seleccionarla.
test.describe('La sección Reportar sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la plantilla sigue visible y el enlace a GitHub funciona', async ({ page }) => {
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await expect(reportar.plantilla).toBeVisible();
    await expect(reportar.enGithub).toHaveAttribute('href', /issues\/new/);
  });
});

test.describe('El acceso del navbar', () => {
  test.describe('en desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    // Va sin texto visible: sin nombre accesible es un enlace mudo para un
    // lector de pantalla. Es lo que le pasó al toggle de tema (531d8dc).
    test('el ícono tiene nombre accesible', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(reportar.accesoDesktop).toBeVisible();
      await expect(reportar.accesoDesktop).toHaveAccessibleName(
        'Reportar un problema del sitio'
      );
    });

    test('el ícono ancla a la sección', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(reportar.accesoDesktop).toHaveAttribute('href', '#reportar');
      await reportar.accesoDesktop.click();
      await expect(page).toHaveURL(/#reportar$/);
      await expect(reportar.bloque).toBeInViewport();
    });

    // No compite con Proyectos: no entra en la lista de secciones, entra en el
    // grupo de herramientas de la derecha junto a idioma y tema.
    test('no entra en la lista de secciones', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(page.getByTestId('nav-secciones').getByRole('link')).toHaveCount(6);
    });

    // Fuera de la home el ancla suelta no lleva a ningún lado.
    test('fuera de la home apunta a la home posicionada', async ({ page }) => {
      await page.goto('/en/contact');
      await expect(page.getByTestId('nav-reportar')).toHaveAttribute('href', '/en/#reportar');
    });
  });

  test.describe('en pantalla chica', () => {
    test.use({ viewport: { width: 375, height: 700 } });

    // El ícono ya no vive en un panel desplegable propio: sin el menú
    // hamburguesa (reemplazado por BottomNav), queda siempre visible en el
    // header, igual que en desktop.
    test('el ícono está siempre visible en el header', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(reportar.accesoDesktop).toBeVisible();
      await expect(reportar.accesoDesktop).toHaveAccessibleName('Reportar un problema del sitio');
    });
  });
});
