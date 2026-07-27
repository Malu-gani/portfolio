import { test, expect } from '@playwright/test';

test.describe('Carril Dev', () => {
  test('el listado muestra los proyectos en ambos idiomas', async ({ page }) => {
    for (const lang of ['es', 'en']) {
      await page.goto(`/${lang}/dev`);
      await expect(page.getByTestId('proyecto-card')).toHaveCount(1);
    }
  });

  test('se navega al detalle del proyecto', async ({ page, browserName }) => {
    // WebKit crashea el proceso de render (no es un fallo de aserción: el
    // contexto muere) al hacer la transición cliente-a-cliente del
    // <ClientRouter/> de Astro específicamente entre /es/dev (listado) y
    // /es/dev/gestor-operaciones (detalle). Se descartó con evidencia que sea
    // el contenido de la página (goto directo funciona, y el mismo contenido
    // vía /es/qa tampoco crashea), el wrapper de ProyectoDetalle, o el patrón
    // de link de la tarjeta (un <a> inyectado también lo dispara). Navegación
    // dura (sin pasar por el router) al mismo URL no crashea: el disparador
    // es la View Transitions API nativa que usa ClientRouter, con bugs de
    // renderizado documentados en Safari (ver withastro/astro#15727). Detalle
    // completo de la investigación en
    // .superpowers/sdd/2026-07-27-portfolio-qa/cross-browser-diagnostico.md
    test.skip(browserName === 'webkit', 'Crash de WebKit en la transición de ClientRouter /dev -> /dev/[slug], ver comentario arriba');
    await page.goto('/es/dev');
    await page.getByTestId('proyecto-card').first().getByRole('link').click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('el detalle enlaza al repositorio', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });
});
