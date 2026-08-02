import { describe, it, expect } from 'vitest';
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
