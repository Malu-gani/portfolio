import { test, expect } from '@playwright/test';

test.describe('Carril Dev', () => {
  test('el listado muestra los proyectos en ambos idiomas', async ({ page }) => {
    for (const lang of ['es', 'en']) {
      await page.goto(`/${lang}/dev`);
      await expect(page.getByTestId('proyecto-card')).toHaveCount(1);
    }
  });

  test('se navega al detalle del proyecto', async ({ page }) => {
    // WebKit crasheaba el proceso de render en la transición cliente-a-cliente
    // del <ClientRouter/> de Astro específicamente entre /es/dev (listado) y
    // /es/dev/gestor-operaciones (detalle) — ver docs/cross-browser-diagnostico.md.
    // Se mitigó con `data-astro-reload` en el enlace de ProyectoCard.astro, que
    // fuerza navegación de página completa para ese link puntual, evitando la
    // transición nativa donde WebKit tiene un bug documentado
    // (withastro/astro#15727). Ya no hace falta test.skip en webkit.
    await page.goto('/es/dev');
    await page.getByTestId('proyecto-card').first().getByRole('link').click();
    await expect(page.getByTestId('proyecto-detalle')).toBeVisible();
  });

  test('el detalle enlaza al repositorio', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });
});
