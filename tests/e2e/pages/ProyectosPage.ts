import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ProyectosPage extends BasePage {
  readonly lista: Locator;
  readonly filtro: Locator;

  constructor(page: Page) {
    super(page);
    this.lista = page.getByTestId('lista-proyectos');
    this.filtro = page.getByTestId('filtro-proyectos');
  }

  /** El listado unificado; `qa` es la ruta por defecto en ambos idiomas. */
  async abrir(lang: Lang = 'es', filtro: 'qa' | 'dev' | 'todos' = 'qa'): Promise<void> {
    await this.page.goto(this.ruta(lang, filtro));
  }

  ruta(lang: Lang, filtro: 'qa' | 'dev' | 'todos' = 'qa'): string {
    const base = lang === 'es' ? '/es/proyectos' : '/en/projects';
    if (filtro === 'qa') return base;
    if (filtro === 'dev') return `${base}/dev`;
    return lang === 'es' ? `${base}/todos` : `${base}/all`;
  }

  /** Cards efectivamente visibles, ya filtradas por el CSS. */
  cardsVisibles(): Locator {
    return this.lista.locator('[data-item-tipo]:visible');
  }

  cardsDeTipo(tipo: 'qa' | 'dev'): Locator {
    return this.lista.locator(`[data-item-tipo="${tipo}"]:visible`);
  }

  botonFiltro(clave: 'qa' | 'dev' | 'todos'): Locator {
    return this.page.getByTestId(`filtro-${clave}`);
  }

  async filtroActivo(): Promise<string | null> {
    return this.lista.getAttribute('data-activo');
  }
}
