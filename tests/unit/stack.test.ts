import { describe, it, expect } from 'vitest';
import { stack, ordenCategorias, type Categoria, type Nivel } from '../../src/data/stack';
import { stackIconos } from '../../src/data/stack-iconos';

const CATEGORIAS: Categoria[] = ['qa-testing', 'desarrollo-datos', 'devops-herramientas'];
const NIVELES: Nivel[] = ['avanzado', 'intermedio', 'aprendiendo'];

describe('stack', () => {
  it('no está vacío', () => {
    expect(stack.length).toBeGreaterThan(0);
  });

  it('toda tecnología tiene una categoría válida', () => {
    for (const t of stack) {
      expect(CATEGORIAS, `categoría inválida en ${t.nombre}`).toContain(t.categoria);
    }
  });

  it('toda tecnología tiene un nivel válido', () => {
    for (const t of stack) {
      expect(NIVELES, `nivel inválido en ${t.nombre}`).toContain(t.nivel);
    }
  });

  it('todo ícono referenciado existe en stack-iconos.ts', () => {
    for (const t of stack) {
      expect(stackIconos, `ícono "${t.icono}" de ${t.nombre} no existe`).toHaveProperty(t.icono);
    }
  });

  it('no hay tecnologías repetidas', () => {
    const nombres = stack.map((t) => t.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('ordenCategorias cubre exactamente las categorías usadas', () => {
    const usadas = new Set(stack.map((t) => t.categoria));
    expect(new Set(ordenCategorias)).toEqual(usadas);
  });

  // PORT-US-18: Jira y Zephyr Scale se conocen solo por el curso (el CV los
  // declara "conocidos por formación"). Si alguna vez se usan en un proyecto
  // real, este test se cambia a propósito.
  it('Jira y Zephyr Scale figuran como "aprendiendo", igual que en el CV', () => {
    for (const nombre of ['Jira', 'Zephyr Scale']) {
      const tec = stack.find((t) => t.nombre === nombre);
      expect(tec, `${nombre} no está en el stack`).toBeDefined();
      expect(tec?.nivel, `${nombre} declara más nivel que el curso`).toBe('aprendiendo');
    }
  });

  it('no declara tecnologías sin respaldo en ningún proyecto', () => {
    // Se retiraron el 2026-07-31 tras escanear los repositorios en disco:
    // ninguna aparecía en un proyecto real. Trello se suma el 2026-08-04:
    // se muda a una futura sección de Metodología de Trabajo (PORT-US-04).
    // Este test evita que vuelvan sin que alguien lo decida a propósito.
    const retiradas = ['Cypress', 'Selenium', 'TestRail', 'Xray', 'Trello'];
    const nombres = stack.map((t) => t.nombre);
    for (const r of retiradas) {
      expect(nombres, `${r} volvió al stack sin justificación`).not.toContain(r);
    }
  });
});
