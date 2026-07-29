import { test, expect } from '@playwright/test';
import { QaPage } from './pages/QaPage';
import { CasoPage } from './pages/CasoPage';
import { rutasDelSitio } from './utils/rutas';

test.describe('Carril QA', () => {
  test('el listado muestra todos los casos', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('es');
    await expect(qa.casos).toHaveCount(2);
  });

  test('el listado en inglés muestra la misma cantidad', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('en');
    await expect(qa.casos).toHaveCount(2);
  });

  test('se navega del listado al detalle', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('es');
    await qa.casos.first().getByRole('link').click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('el detalle muestra el título y los seis bloques', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await expect(caso.titulo).toBeVisible();
    for (const bloque of ['Contexto', 'Estrategia de prueba', 'Ejecución',
                          'Hallazgos', 'Automatización', 'Resultado y aprendizajes']) {
      await expect(page.getByRole('heading', { name: bloque })).toBeVisible();
    }
  });

  // Ya no queda contenido con `ejemplo: true`, así que no hay dónde ejercitar
  // el banner encendido: el test que lo hacía se invirtió en el invariante que
  // ahora importa, que es que el sitio no muestre ese aviso en ninguna ruta.
  // Es el equivalente en la suite E2E de `npm run check:listo`, que valida lo
  // mismo sobre el frontmatter. Falsable: poner `ejemplo: true` en cualquier
  // caso o proyecto hace fallar este test.
  test('ninguna ruta muestra el aviso de contenido de ejemplo', async ({ page }) => {
    for (const ruta of rutasDelSitio()) {
      await page.goto(ruta);
      await expect(page.getByTestId('banner-ejemplo'),
        `${ruta} todavía muestra el aviso de contenido de ejemplo`).toHaveCount(0);
    }
  });

  test('el cambio de idioma preserva el caso abierto', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await caso.langToggle.click();
    await expect(page).toHaveURL(/\/en\/qa\/suite-e2e-portfolio$/);
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });
});
