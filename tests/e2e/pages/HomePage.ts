import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

/** Los anclajes de la home one-page, en el orden en que se recorren. */
export const SECCIONES = ['inicio', 'sobre-mi', 'proyectos', 'stack', 'contacto'] as const;
export type Seccion = (typeof SECCIONES)[number];

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueSobre: Locator;
  readonly bloqueProyectos: Locator;
  readonly bloqueContacto: Locator;
  readonly stack: Locator;
  /** El listado embebido, el mismo componente que sirve /es/proyectos. */
  readonly lista: Locator;
  /** Todas las cards renderizadas, visibles u ocultas por el filtro. */
  readonly cards: Locator;
  readonly retrato: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueSobre = page.getByTestId('bloque-sobre');
    this.bloqueProyectos = page.getByTestId('bloque-proyectos');
    this.bloqueContacto = page.getByTestId('bloque-contacto');
    this.stack = page.getByTestId('stack');
    this.lista = page.getByTestId('lista-proyectos');
    this.cards = this.lista.getByTestId('proyecto-card');
    this.retrato = page.getByTestId('hero-retrato');
  }

  /** Cards de un carril que además están visibles: es lo que filtra el CSS. */
  cardsDeTipo(tipo: 'qa' | 'dev'): Locator {
    return this.lista.locator(`[data-item-tipo="${tipo}"]:visible`);
  }

  botonFiltro(clave: 'qa' | 'dev' | 'todos'): Locator {
    return this.page.getByTestId(`filtro-${clave}`);
  }

  /** La sección anclada, por su id: es lo que apunta el navbar. */
  seccion(id: Seccion): Locator {
    return this.page.locator(`#${id}`);
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
