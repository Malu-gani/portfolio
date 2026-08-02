import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ReportarPage extends BasePage {
  readonly bloque: Locator;
  readonly plantilla: Locator;
  readonly enGithub: Locator;
  readonly botonCopiar: Locator;
  readonly aviso: Locator;
  /** El acceso del navbar en desktop: ícono con nombre accesible. */
  readonly accesoDesktop: Locator;
  /** El acceso dentro del panel `<details>` de pantallas chicas. */
  readonly accesoMobile: Locator;
  readonly panelMobile: Locator;

  constructor(page: Page) {
    super(page);
    this.bloque = page.getByTestId('bloque-reportar');
    this.plantilla = page.getByTestId('reportar-plantilla');
    this.enGithub = page.getByTestId('reportar-github');
    this.botonCopiar = page.getByTestId('reportar-copiar');
    this.aviso = page.getByTestId('reportar-aviso');
    this.accesoDesktop = page.getByTestId('nav-reportar');
    this.accesoMobile = page.getByTestId('m-nav-reportar');
    this.panelMobile = page.getByTestId('nav-mobile');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }

  /**
   * El panel es un `<details>` y lo que lo abre es su `<summary>`. Va por
   * selector CSS y no por rol: Chromium no expone el `<summary>` como `button`
   * -se verificó, el locator por rol expira-, así que el rol no sirve de
   * ancla. Por eso vive acá y no en el spec.
   */
  async abrirPanelMobile(): Promise<void> {
    await this.panelMobile.locator('summary').click();
  }
}
