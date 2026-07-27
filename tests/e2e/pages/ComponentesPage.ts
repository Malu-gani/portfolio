import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ComponentesPage extends BasePage {
  readonly bug: Locator;
  readonly severidad: Locator;
  readonly matriz: Locator;
  readonly metricas: Locator;

  constructor(page: Page) {
    super(page);
    this.bug = page.getByTestId('bug-report').first();
    this.severidad = page.getByTestId('bug-severidad').first();
    this.matriz = page.getByTestId('test-matrix');
    this.metricas = page.getByTestId('metricas');
  }

  async abrir(): Promise<void> {
    await this.page.goto('/es/demo-componentes');
  }

  matrizCaption(): Locator {
    return this.matriz.locator('caption');
  }

  matrizEncabezados(): Locator {
    return this.matriz.locator('th');
  }

  metricaEtiquetas(): Locator {
    return this.metricas.locator('dt');
  }

  metricaValores(): Locator {
    return this.metricas.locator('dd');
  }
}
