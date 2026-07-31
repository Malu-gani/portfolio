import { test, expect } from '@playwright/test';

// `/es/qa` dejó de ser una página: hoy es un redirect al listado unificado, y
// capturarla comparaba contra un `meta refresh`, no contra un listado. La
// captura del listado tiene que tomarse en su ruta real.
const paginas = ['/es/', '/es/proyectos', '/es/qa/suite-e2e-portfolio', '/es/contacto'];

test.describe('Regresión visual', () => {
  // Las capturas de referencia se generan y comparan solo en el proyecto
  // `chromium` del config: no hay snapshot de referencia para firefox/webkit/
  // mobile, y Playwright falla en CI (no las genera solo) si un proyecto sin
  // referencia intenta comparar. No es una preferencia, es lo que evita que
  // la Task 13 (CI) corra estos tests en los otros 3 proyectos y los vea
  // romper por falta de snapshot.
  //
  // OJO: se compara `testInfo.project.name`, no `browserName`. El proyecto
  // `mobile` (Pixel 7) también corre sobre el motor Chromium, así que
  // `browserName !== 'chromium'` NO lo excluye -- se comprobó empíricamente:
  // con esa condición, `mobile` generaba sus propias capturas sin querer y
  // fallaba en la corrida siguiente por falta de referencia versionada,
  // exactamente el escenario que esta guarda existe para evitar.
  //
  // Además, estas 8 capturas están atadas a la plataforma donde se generaron
  // (el nombre de archivo incluye `-win32`: Playwright versiona un snapshot
  // por plataforma). El job de CI corre en `ubuntu-latest`, que buscaría
  // `-linux` y no la encontraría -- escribiría una captura nueva como
  // baseline y fallaría esa corrida, pasando en el reintento porque ya
  // compara contra la que acaba de escribir (falso verde). Por eso la
  // regresión visual es un gate **local**, explícitamente excluido de CI,
  // igual que ya se hace con los enlaces externos (ver enlaces.spec.ts).
  test.skip(!!process.env.CI, 'Capturas de referencia atadas a la plataforma donde se generaron (win32); gate local, no de CI. Ver comentario arriba.');

  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium',
      'Las capturas de referencia se generan solo en el proyecto chromium');
  });

  for (const tema of ['light', 'dark'] as const) {
    for (const ruta of paginas) {
      test(`${ruta} en tema ${tema}`, async ({ page }) => {
        // reducedMotion: 'reduce' es imprescindible: sin eso, las transiciones
        // de tema/hover producen capturas distintas en cada corrida.
        await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
        await page.goto(ruta);
        await page.waitForLoadState('networkidle');
        // Espera a que las fuentes variables (Inter, JetBrains Mono) estén
        // cargadas: si la captura se toma mientras el navegador todavía
        // renderiza con la fuente de reemplazo, el layout shiftea entre
        // corridas y la referencia queda inestable.
        await page.evaluate(() => document.fonts.ready);
        const nombre = `${ruta.replace(/\//g, '_')}-${tema}.png`;
        // 0.002 y no el 0.01 anterior. Medido durante el rediseño de la home:
        // con 0.01, `/es/contacto` pasó con 7.606 píxeles distintos (light) y
        // 7.725 (dark) pese a que su cabecera había cambiado de verdad —
        // rozando el techo desde abajo sin marcar nada. 0.002 deja ~1.100
        // píxeles de tolerancia, suficiente para el antialiasing y el
        // renderizado de fuentes entre corridas, y habría puesto en rojo ese
        // cambio de cabecera, que es exactamente lo que estas capturas existen
        // para avisar.
        await expect(page).toHaveScreenshot(nombre, { fullPage: true, maxDiffPixelRatio: 0.002 });
      });
    }
  }
});
