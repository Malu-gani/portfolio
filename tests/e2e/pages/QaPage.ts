import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class QaPage extends BasePage {
  readonly lista: Locator;
  readonly casos: Locator;

  constructor(page: Page) {
    super(page);
    this.lista = page.getByTestId('lista-casos');
    this.casos = page.getByTestId('caso-card');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/qa`);
  }
}
