import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class CasoPage extends BasePage {
  readonly detalle: Locator;
  readonly titulo: Locator;
  readonly bannerEjemplo: Locator;

  constructor(page: Page) {
    super(page);
    this.detalle = page.getByTestId('caso-detalle');
    this.titulo = page.getByTestId('caso-titulo');
    this.bannerEjemplo = page.getByTestId('banner-ejemplo');
  }

  async abrir(lang: Lang, slug: string): Promise<void> {
    await this.page.goto(`/${lang}/qa/${slug}`);
  }
}
