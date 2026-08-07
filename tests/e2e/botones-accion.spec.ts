import { test, expect } from '@playwright/test';
import { esPill } from './utils/es-pill';

test.describe('Botones de acción en formato pill', () => {
  test('los 8 lugares de la home usan rounded-full', async ({ page }) => {
    await page.goto('/es/');

    for (const testid of ['hero-ver-proyectos', 'link-sobre-completo', 'hero-github', 'hero-linkedin', 'hero-email', 'reportar-github', 'reportar-copiar']) {
      await esPill(page.getByTestId(testid));
    }

    // El CV vive en el Footer, fuera del viewport inicial pero igual en el DOM.
    await esPill(page.getByTestId('cv-descargar'));
  });

  test('Ver proyectos del hero lleva a la sección de Proyectos', async ({ page }) => {
    await page.goto('/es/');
    await page.getByTestId('hero-ver-proyectos').click();
    await expect(page.locator('#proyectos')).toBeInViewport();
  });

  test('Ver repositorio y Ver la app en una tarjeta de proyecto usan rounded-full', async ({ page }) => {
    await page.goto('/es/proyectos/dev');
    const card = page.getByTestId('proyecto-card').first();
    await esPill(card.getByTestId('card-repo'));
    await esPill(card.getByTestId('card-demo'));
  });

  test('Ver repositorio y Ver la app en la página de detalle del caso usan rounded-full', async ({ page }) => {
    await page.goto('/es/qa/gestor-operaciones');
    await esPill(page.getByTestId('caso-repo'));
    await esPill(page.getByTestId('caso-demo'));
  });

  test('Copiar email en la página de Contacto usa rounded-full', async ({ page }) => {
    await page.goto('/es/contacto');
    await esPill(page.getByTestId('email-copiar'));
  });
});
