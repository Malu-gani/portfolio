import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Encapsula los selectores CSS usados por `enlaces.spec.ts`, siguiendo la
 * convención del proyecto: ningún `page.locator(css)` fuera de `tests/e2e/pages/`.
 */
export class EnlacesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** `href` únicos de todos los enlaces internos (`href` que empieza con `/`). */
  async hrefsInternos(): Promise<string[]> {
    return this.page
      .locator('a[href^="/"]')
      .evaluateAll((enlaces) => [...new Set(enlaces.map((a) => (a as HTMLAnchorElement).getAttribute('href')!))]);
  }

  /** URLs absolutas únicas de todos los enlaces externos (`href` que empieza con `http`). */
  async hrefsExternos(): Promise<string[]> {
    return this.page
      .locator('a[href^="http"]')
      .evaluateAll((enlaces) => [...new Set(enlaces.map((a) => (a as HTMLAnchorElement).href))]);
  }

  /** Enlaces que abren en una pestaña nueva (`target="_blank"`). */
  targetBlank() {
    return this.page.locator('a[target="_blank"]');
  }
}
