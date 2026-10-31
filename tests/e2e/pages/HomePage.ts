import { expect, type Page, type Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

/** Los anclajes de la home one-page, en el orden en que se recorren. */
export const SECCIONES = ['inicio', 'sobre-mi', 'proyectos', 'qa-board', 'stack', 'formacion', 'contacto'] as const;
export type Seccion = (typeof SECCIONES)[number];

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueSobre: Locator;
  readonly bloqueProyectos: Locator;
  readonly bloqueContacto: Locator;
  readonly stack: Locator;
  readonly stackFiltro: Locator;
  readonly stackItems: Locator;
  readonly qaBoard: Locator;
  readonly qaBoardFiltro: Locator;
  readonly qaBoardKpis: Locator;
  readonly qaBoardFeed: Locator;
  readonly qaBoardItems: Locator;
  /** El listado embebido, el mismo componente que sirve /es/proyectos. */
  readonly lista: Locator;
  /** Todas las cards renderizadas, visibles u ocultas por el filtro. */
  readonly cards: Locator;
  readonly retrato: Locator;
  readonly bloqueFormacion: Locator;
  readonly itemsFormacion: Locator;
  /** El atajo de contacto del hero: `mailto:` que además copia si puede. */
  readonly emailHero: Locator;
  readonly sobreResumen: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueSobre = page.getByTestId('bloque-sobre');
    this.bloqueProyectos = page.getByTestId('bloque-proyectos');
    this.bloqueContacto = page.getByTestId('bloque-contacto');
    this.stack = page.getByTestId('stack');
    this.stackFiltro = page.getByTestId('stack-filtro');
    this.stackItems = page.getByTestId('stack-item');
    this.qaBoard = page.getByTestId('qa-board');
    this.qaBoardFiltro = page.getByTestId('qa-board-filtro');
    this.qaBoardKpis = page.getByTestId('qa-board-kpi');
    this.qaBoardFeed = page.getByTestId('qa-board-feed');
    this.qaBoardItems = page.getByTestId('qa-board-item');
    this.lista = page.getByTestId('lista-proyectos');
    this.cards = this.lista.getByTestId('proyecto-card');
    this.retrato = page.getByTestId('hero-retrato');
    this.bloqueFormacion = page.getByTestId('bloque-formacion');
    this.itemsFormacion = page.getByTestId('formacion-item');
    this.emailHero = page.getByTestId('hero-email');
    this.sobreResumen = page.getByTestId('sobre-resumen');
  }

  /** Cards de un carril que además están visibles: es lo que filtra el CSS. */
  cardsDeTipo(tipo: 'qa' | 'dev'): Locator {
    return this.lista.locator(`[data-item-tipo="${tipo}"]:visible`);
  }

  botonFiltro(clave: 'qa' | 'dev' | 'todos'): Locator {
    return this.page.getByTestId(`filtro-${clave}`);
  }

  botonFiltroStack(nivel: 'todos' | 'avanzado' | 'intermedio'): Locator {
    return this.page.getByTestId(`stack-filtro-${nivel}`);
  }

  /**
   * Lleva una sección `.revelar` al viewport y espera a que termine su
   * entrada. Se revelan con una transición de 500 ms (`translateY(12px)` ->
   * `none`) que arranca justo cuando Playwright las scrollea a la vista; si el
   * click sale mientras corre, el elemento se mueve entre que se calcula el
   * punto y se despacha, y el click cae en la sección en vez de en el botón o
   * el link (PORT-BUG-13). `visible` + `transform: none` es el estado final:
   * de ahí no vuelve a moverse.
   */
  async revelarSeccion(id: Seccion): Promise<void> {
    const seccion = this.seccion(id);
    await seccion.scrollIntoViewIfNeeded();
    await expect(seccion).toHaveClass(/\bvisible\b/);
    await expect(seccion).toHaveCSS('transform', 'none');
  }

  botonFiltroQaBoard(valor: 'todos' | 'bug' | 'us'): Locator {
    return this.page.getByTestId(`qa-board-filtro-${valor}`);
  }

  /** La sección anclada, por su id: es lo que apunta el navbar. */
  seccion(id: Seccion): Locator {
    return this.page.locator(`#${id}`);
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
