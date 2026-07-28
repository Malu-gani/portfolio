import { test, expect } from '@playwright/test';
import { QaPage } from './pages/QaPage';
import { CasoPage } from './pages/CasoPage';

test.describe('Carril QA', () => {
  test('el listado muestra todos los casos', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('es');
    await expect(qa.casos).toHaveCount(3);
  });

  test('el listado en inglés muestra la misma cantidad', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('en');
    await expect(qa.casos).toHaveCount(3);
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

  test('el contenido de ejemplo se avisa al visitante', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await expect(caso.bannerEjemplo).toBeVisible();
  });

  test('el cambio de idioma preserva el caso abierto', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await caso.langToggle.click();
    await expect(page).toHaveURL(/\/en\/qa\/suite-e2e-portfolio$/);
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });
});
