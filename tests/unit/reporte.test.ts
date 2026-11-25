import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { camposReporte, plantillaReporte } from '../../src/data/reporte';

describe('camposReporte', () => {
  // Si un idioma suma un campo y el otro no, el reporte que llega cambia
  // según desde dónde se copió, y nadie se entera hasta leer dos issues.
  it('pide los mismos campos en los dos idiomas', () => {
    expect(camposReporte.en).toHaveLength(camposReporte.es.length);
  });

  it('no tiene campos vacíos', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const campo of camposReporte[lang]) {
        expect(campo.trim().length, `campo vacío en ${lang}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('plantillaReporte', () => {
  it('incluye todos los campos del idioma pedido', () => {
    const texto = plantillaReporte('es');
    for (const campo of camposReporte.es) {
      expect(texto).toContain(campo);
    }
  });

  it('no mezcla idiomas', () => {
    expect(plantillaReporte('en')).not.toContain(camposReporte.es[0]);
  });

  // Es una plantilla para completar: cada campo deja lugar debajo. Sin esto
  // la función podría devolver los títulos pegados y el test seguiría verde.
  it('deja un espacio en blanco debajo de cada campo', () => {
    const texto = plantillaReporte('es');
    expect(texto.split('\n\n').length).toBeGreaterThan(camposReporte.es.length);
  });
});

// PORT-US-14: GitHub no deja enviar el issue si falta un campo obligatorio, y
// pedir cuatro a quien encontró un problema espanta reportes. Solo "Qué pasó"
// es obligatorio; lo demás ayuda a reproducir, pero no se exige.
describe('plantillas de GitHub (.github/ISSUE_TEMPLATE)', () => {
  const plantillas = { es: 'que-paso', en: 'what-happened' } as const;

  for (const lang of ['es', 'en'] as const) {
    it(`bug-${lang}.yml exige solo el primer campo`, () => {
      const texto = readFileSync(join('.github', 'ISSUE_TEMPLATE', `bug-${lang}.yml`), 'utf8');
      const campos = texto.split(/\r?\n(?=  - type: )/).filter((bloque) => /^\s*- type: (textarea|input)/.test(bloque));
      const obligatorios = campos
        .filter((bloque) => /required:\s*true/.test(bloque))
        .map((bloque) => /id:\s*(\S+)/.exec(bloque)?.[1]);
      expect(obligatorios).toEqual([plantillas[lang]]);
    });
  }
});
