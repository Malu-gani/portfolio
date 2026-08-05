import { describe, it, expect } from 'vitest';
import { ui } from '../../src/i18n/ui';

const CLAVES_QA_BOARD = [
  'qaBoard.titulo',
  'qaBoard.bajada',
  'qaBoard.kpi.bugsReportados',
  'qaBoard.kpi.bugsResueltosPct',
  'qaBoard.kpi.usResueltas',
  'qaBoard.kpi.enProgreso',
  'qaBoard.filtro.etiqueta',
  'qaBoard.filtro.todos',
  'qaBoard.filtro.bug',
  'qaBoard.filtro.us',
  'qaBoard.cta.bugs',
  'qaBoard.cta.tareas',
] as const;

describe('copy del QA Board', () => {
  for (const clave of CLAVES_QA_BOARD) {
    for (const lang of ['es', 'en'] as const) {
      it(`"${clave}" existe y no está vacía en ${lang}`, () => {
        const texto = ui[lang][clave];
        expect(texto).toBeTruthy();
        expect(texto.trim().length).toBeGreaterThan(0);
      });
    }
  }

  it('el título en inglés se mantiene como nombre propio de la sección', () => {
    expect(ui.en['qaBoard.titulo']).toBe('QA Board & Backlog Live');
  });
});
