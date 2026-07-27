import { test, expect } from '@playwright/test';

const paginas = ['/es/', '/es/qa', '/es/qa/suite-e2e-portfolio', '/es/contacto'];

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
        await expect(page).toHaveScreenshot(nombre, { fullPage: true, maxDiffPixelRatio: 0.01 });
      });
    }
  }
});
