import { describe, it, expect } from 'vitest';
import { stack, ordenCategorias, type Categoria, type Nivel } from '../../src/data/stack';

const CATEGORIAS: Categoria[] = ['lenguajes', 'testing', 'frameworks', 'datos', 'herramientas'];
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

  it('no hay tecnologías repetidas', () => {
    const nombres = stack.map((t) => t.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('ordenCategorias cubre exactamente las categorías usadas', () => {
    const usadas = new Set(stack.map((t) => t.categoria));
    expect(new Set(ordenCategorias)).toEqual(usadas);
  });

  it('no declara tecnologías sin respaldo en ningún proyecto', () => {
    // Se retiraron el 2026-07-31 tras escanear los repositorios en disco:
    // ninguna aparecía en un proyecto real. Este test evita que vuelvan sin
    // que alguien lo decida a propósito.
    const retiradas = ['Cypress', 'Selenium', 'TestRail', 'Xray'];
    const nombres = stack.map((t) => t.nombre);
    for (const r of retiradas) {
      expect(nombres, `${r} volvió al stack sin justificación`).not.toContain(r);
    }
  });
});
