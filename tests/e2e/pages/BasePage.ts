import type { Page, Locator } from '@playwright/test';

export type Lang = 'es' | 'en';

export class BasePage {
  readonly themeToggle: Locator;
  readonly langToggle: Locator;
  readonly nav: Locator;

  constructor(protected readonly page: Page) {
    this.themeToggle = page.getByTestId('theme-toggle');
    this.langToggle = page.getByTestId('lang-toggle');
    this.nav = page.getByTestId('nav-principal');
  }

  async temaActual(): Promise<string | null> {
    return this.page.locator('html').getAttribute('data-theme');
  }

  async alternarTema(): Promise<void> {
    await this.themeToggle.click();
  }

  async recargar(): Promise<void> {
    await this.page.reload();
  }

  async idiomaDelDocumento(): Promise<string | null> {
    return this.page.locator('html').getAttribute('lang');
  }

  hreflangAlterno(lang: Lang): Locator {
    return this.page.locator(`link[rel="alternate"][hreflang="${lang}"]`);
  }

  /** El elemento que tiene el foco del teclado en este momento. */
  elementoEnfocado(): Locator {
    return this.page.locator(':focus');
  }

  /** Formularios `<form>` presentes en la página (se usa para probar ausencia). */
  formularios(): Locator {
    return this.page.locator('form');
  }
}
