import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ReportarPage extends BasePage {
  readonly bloque: Locator;
  readonly plantilla: Locator;
  readonly enGithub: Locator;
  readonly botonCopiar: Locator;
  readonly aviso: Locator;
  /** El acceso del navbar: ícono con nombre accesible, visible en todos los viewports. */
  readonly accesoDesktop: Locator;

  constructor(page: Page) {
    super(page);
    this.bloque = page.getByTestId('bloque-reportar');
    this.plantilla = page.getByTestId('reportar-plantilla');
    this.enGithub = page.getByTestId('reportar-github');
    this.botonCopiar = page.getByTestId('reportar-copiar');
    this.aviso = page.getByTestId('reportar-aviso');
    this.accesoDesktop = page.getByTestId('nav-reportar');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
