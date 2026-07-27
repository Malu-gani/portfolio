import { test, expect } from '@playwright/test';

test.describe('Carril Dev', () => {
  test('el listado muestra los proyectos en ambos idiomas', async ({ page }) => {
    for (const lang of ['es', 'en']) {
      await page.goto(`/${lang}/dev`);
      await expect(page.getByTestId('proyecto-card')).toHaveCount(1);
    }
  });

  test('se navega al detalle del proyecto', async ({ page }) => {
    await page.goto('/es/dev');
    await page.getByTestId('proyecto-card').first().getByRole('link').click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('el detalle enlaza al repositorio', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });
});
