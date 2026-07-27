import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ContactoPage extends BasePage {
  readonly botonCopiar: Locator;
  readonly emailTexto: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;

  constructor(page: Page) {
    super(page);
    this.botonCopiar = page.getByTestId('email-copiar');
    this.emailTexto = page.getByTestId('email-texto');
    this.linkedin = page.getByTestId('link-linkedin');
    this.github = page.getByTestId('link-github');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(lang === 'es' ? '/es/contacto' : '/en/contact');
  }
}
