import { test, expect } from '@playwright/test';
import { ContactoPage } from './pages/ContactoPage';

test.describe('Contacto y CV', () => {
  test('muestra email, LinkedIn y GitHub', async ({ page }) => {
    const contacto = new ContactoPage(page);
    await contacto.abrir('es');
    await expect(contacto.emailTexto).toContainText('@');
    await expect(contacto.linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(contacto.github).toHaveAttribute('href', /github\.com/);
  });

  test('no hay formulario de contacto', async ({ page }) => {
    await page.goto('/es/contacto');
    await expect(page.locator('form')).toHaveCount(0);
  });

  test('el botón copia el email al portapapeles', async ({ context, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const contacto = new ContactoPage(page);
    await contacto.abrir('es');
    await contacto.botonCopiar.click();
    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiado).toContain('@');
  });

  test('el CV en español se descarga', async ({ page }) => {
    await page.goto('/es/');
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('cv-descargar').click(),
    ]);
    expect(descarga.suggestedFilename()).toBe('cv-es.pdf');
  });

  test('el CV en inglés se descarga', async ({ page }) => {
    await page.goto('/en/');
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('cv-descargar').click(),
    ]);
    expect(descarga.suggestedFilename()).toBe('cv-en.pdf');
  });
});
