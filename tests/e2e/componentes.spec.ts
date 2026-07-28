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
