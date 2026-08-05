import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * Guarda contra una regresión futura a `rounded-md`, mismo espíritu que el
 * test que protege contra el retorno del scroll-snap. Se afirma sobre la
 * relación real entre el radio y la altura (mitad de la altura = pill),
 * no sobre un valor de píxeles puntual: así no importa si Tailwind emite
 * `9999px` o el `calc(infinity * 1px)` de la v4.
 */
async function esPill(locator: Locator): Promise<void> {
  const { radio, altura } = await locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const radioStr = style.borderTopLeftRadius;
    const radio = radioStr.includes('%') ? Infinity : parseFloat(radioStr);
    return { radio, altura: el.getBoundingClientRect().height };
  });
  expect(radio, `radio insuficiente para ser pill (altura ${altura}px)`).toBeGreaterThanOrEqual(altura / 2 - 1);
}

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
