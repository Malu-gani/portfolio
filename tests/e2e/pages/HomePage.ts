import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

/** Los seis anclajes de la home one-page, en el orden en que se recorren. */
export const SECCIONES = ['inicio', 'sobre-mi', 'qa', 'dev', 'stack', 'contacto'] as const;
export type Seccion = (typeof SECCIONES)[number];

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueSobre: Locator;
  readonly bloqueQa: Locator;
  readonly bloqueDev: Locator;
  readonly bloqueContacto: Locator;
  readonly stack: Locator;
  /** Cards destacadas del carril QA (el listado completo vive en /es/proyectos). */
  readonly casos: Locator;
  /** Cards destacadas del carril de desarrollo. */
  readonly proyectos: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueSobre = page.getByTestId('bloque-sobre');
    this.bloqueQa = page.getByTestId('bloque-qa');
    this.bloqueDev = page.getByTestId('bloque-dev');
    this.bloqueContacto = page.getByTestId('bloque-contacto');
    this.stack = page.getByTestId('stack');
    this.casos = this.bloqueQa.getByTestId('proyecto-card');
    this.proyectos = this.bloqueDev.getByTestId('proyecto-card');
  }

  /** La sección anclada, por su id: es lo que apunta el navbar. */
  seccion(id: Seccion): Locator {
    return this.page.locator(`#${id}`);
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
