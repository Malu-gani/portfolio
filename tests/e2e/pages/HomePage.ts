import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueQa: Locator;
  readonly bloqueDev: Locator;
  readonly casos: Locator;
  readonly stack: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueQa = page.getByTestId('bloque-qa');
    this.bloqueDev = page.getByTestId('bloque-dev');
    this.casos = page.getByTestId('caso-card');
    this.stack = page.getByTestId('stack');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
