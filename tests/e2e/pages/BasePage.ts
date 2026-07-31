import type { Page, Locator } from '@playwright/test';

export type Lang = 'es' | 'en';

export class BasePage {
  /** El contenedor del control segmentado; agrupa las dos píldoras. */
  readonly themeToggle: Locator;
  readonly temaClaro: Locator;
  readonly temaOscuro: Locator;
  readonly langToggle: Locator;
  readonly nav: Locator;

  constructor(protected readonly page: Page) {
    this.themeToggle = page.getByTestId('theme-toggle');
    this.temaClaro = page.getByTestId('theme-claro');
    this.temaOscuro = page.getByTestId('theme-oscuro');
    this.langToggle = page.getByTestId('lang-toggle');
    this.nav = page.getByTestId('nav-principal');
  }

  async temaActual(): Promise<string | null> {
    return this.page.locator('html').getAttribute('data-theme');
  }

  /**
   * Cambia al tema opuesto al vigente. El control ya no es un botón que
   * alterna: son dos píldoras y cada una fija un tema explícito, así que
   * "alternar" es elegir la que no está activa.
   */
  async alternarTema(): Promise<void> {
    const actual = await this.temaActual();
    await (actual === 'dark' ? this.temaClaro : this.temaOscuro).click();
  }

  /** Elige un tema concreto, sin depender de cuál esté activo. */
  async elegirTema(tema: 'light' | 'dark'): Promise<void> {
    await (tema === 'dark' ? this.temaOscuro : this.temaClaro).click();
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
