import { test, expect } from '@playwright/test';
import { esPill } from './utils/es-pill';

test.describe('Botones de acción en formato pill', () => {
  test('los 7 lugares de la home usan rounded-full', async ({ page }) => {
    await page.goto('/es/');

    for (const testid of ['link-sobre-completo', 'hero-github', 'hero-linkedin', 'hero-email', 'reportar-github', 'reportar-copiar']) {
      await esPill(page.getByTestId(testid));
    }

    // El CV vive en el Footer, fuera del viewport inicial pero igual en el DOM.
    await esPill(page.getByTestId('cv-descargar'));
  });

  test('Ver repositorio y Ver la app en una tarjeta de proyecto usan rounded-full', async ({ page }) => {
    await page.goto('/es/proyectos/dev');
    const card = page.getByTestId('proyecto-card').first();
    await esPill(card.getByTestId('card-repo'));
    await esPill(card.getByTestId('card-demo'));
  });

  test('Copiar email en la página de Contacto usa rounded-full', async ({ page }) => {
    await page.goto('/es/contacto');
    await esPill(page.getByTestId('email-copiar'));
  });
});
