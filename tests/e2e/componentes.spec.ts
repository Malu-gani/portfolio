import { test, expect } from '@playwright/test';
import { ComponentesPage } from './pages/ComponentesPage';

test.describe('Componentes de dominio QA', () => {
  let componentes: ComponentesPage;

  test.beforeEach(async ({ page }) => {
    componentes = new ComponentesPage(page);
    await componentes.abrir();
  });

  test('el reporte de bug muestra todos sus campos', async () => {
    await expect(componentes.bug).toContainText('BUG-001');
    await expect(componentes.bug).toContainText('Pasos para reproducir');
    await expect(componentes.bug).toContainText('Resultado esperado');
    await expect(componentes.bug).toContainText('Resultado obtenido');
  });

  test('la severidad muestra la etiqueta exacta que corresponde al valor', async () => {
    // La demo pasa severidad="alto", cuya etiqueta es "Alta".
    await expect(componentes.severidad).toContainText('Alta');
    await expect(componentes.severidad).not.toContainText('Crítica');
    await expect(componentes.severidad).not.toContainText('Media');
    await expect(componentes.severidad).not.toContainText('Baja');
  });

  test('la matriz de casos renderiza una tabla accesible', async () => {
    await expect(componentes.matrizCaption()).toBeVisible();
    await expect(componentes.matrizEncabezados()).toHaveCount(4);
  });

  test('las métricas muestran etiqueta y valor', async () => {
    await expect(componentes.metricaEtiquetas().first()).toBeVisible();
    await expect(componentes.metricaValores().first()).toBeVisible();
  });
});

// En mobile el hover no existe y con teclado tampoco se dispara: una elevación
// que solo responda a `:hover` deja el estado de foco sin ninguna señal visual.
// Es la regla firme de la spec, y esta es la única forma de que se sostenga.
test.describe('Elevación de las cards', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('la card se eleva al enfocar su enlace con teclado', async ({ page }) => {
    await page.goto('/es/proyectos');
    const card = page.getByTestId('proyecto-card').first();

    const reposo = await card.evaluate((el) => getComputedStyle(el).transform);

    await card.getByRole('link').first().focus();

    // La transición dura 150ms: leer el transform apenas se llama a `focus()`
    // depende de cuánto tardó el round-trip. `expect.poll` espera a que
    // termine de verdad en vez de confiar en la latencia de turno.
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe(reposo);
  });

  test('la card se eleva al pasar el mouse', async ({ page }) => {
    await page.goto('/es/proyectos');
    const card = page.getByTestId('proyecto-card').first();

    const reposo = await card.evaluate((el) => getComputedStyle(el).transform);
    await card.hover();
    const encima = await card.evaluate((el) => getComputedStyle(el).transform);

    expect(encima).not.toBe(reposo);
  });
});
