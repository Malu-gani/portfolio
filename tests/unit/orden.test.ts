import { describe, it, expect } from 'vitest';
import { ordenarPorDestacadoYFecha, type Ordenable } from '../../src/data/orden';

function item(fecha: string, destacado: boolean): Ordenable {
  return { fecha: new Date(fecha), datos: { destacado } };
}

describe('ordenarPorDestacadoYFecha', () => {
  it('un destacado viejo queda antes que uno no destacado nuevo', () => {
    // Es el caso que separa esta implementación de un simple orden por fecha:
    // con el contenido real de hoy no existe (el destacado además es el más
    // reciente), así que esta prueba usa datos construidos a propósito.
    const viejoDestacado = item('2026-01-01', true);
    const nuevoNoDestacado = item('2026-07-30', false);
    const resultado = ordenarPorDestacadoYFecha([nuevoNoDestacado, viejoDestacado]);
    expect(resultado).toEqual([viejoDestacado, nuevoNoDestacado]);
  });

  it('entre dos destacados, gana el más reciente', () => {
    const viejo = item('2026-01-01', true);
    const nuevo = item('2026-06-01', true);
    const resultado = ordenarPorDestacadoYFecha([viejo, nuevo]);
    expect(resultado).toEqual([nuevo, viejo]);
  });

  it('entre dos no destacados, gana el más reciente', () => {
    const viejo = item('2026-01-01', false);
    const nuevo = item('2026-06-01', false);
    const resultado = ordenarPorDestacadoYFecha([viejo, nuevo]);
    expect(resultado).toEqual([nuevo, viejo]);
  });

  it('no muta el array que recibe', () => {
    const original = [item('2026-01-01', false), item('2026-06-01', true)];
    const copia = [...original];
    ordenarPorDestacadoYFecha(original);
    expect(original).toEqual(copia);
  });
});
