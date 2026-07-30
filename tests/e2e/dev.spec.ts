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

  // El campo `repo` es opcional en el esquema y CaseLayout lo renderiza
  // condicionalmente. Se cubren las dos ramas, cada una donde hoy aplica de
  // verdad: el caso de suite-sauce no lo declara (ese repositorio sigue siendo
  // privado), y el de este portfolio sí.
  test('el detalle no muestra enlace al repositorio si el contenido no lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-sauce');
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
    await expect(page.getByTestId('caso-repo')).toHaveCount(0);
  });

  test('el detalle enlaza al repositorio cuando el contenido lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-e2e-portfolio');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });

  // Mismo par de ramas para `demo`, que hasta ahora estaba declarado en el
  // esquema pero no lo renderizaba ninguna plantilla.
  test('el detalle no muestra enlace al demo si el contenido no lo declara', async ({ page }) => {
    await page.goto('/es/qa/suite-sauce');
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
    await expect(page.getByTestId('caso-demo')).toHaveCount(0);
  });

  test('el detalle enlaza al demo cuando el contenido lo declara', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-demo'))
      .toHaveAttribute('href', 'https://registro-de-operaciones-chi.vercel.app');
  });
});
