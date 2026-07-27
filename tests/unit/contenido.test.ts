import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const colecciones = ['casos-qa', 'proyectos'];

describe('Integridad del contenido', () => {
  for (const coleccion of colecciones) {
    const base = join('src', 'content', coleccion);
    const es = readdirSync(join(base, 'es')).filter((f) => f.endsWith('.md'));
    const en = readdirSync(join(base, 'en')).filter((f) => f.endsWith('.md'));

    it(`cada archivo de ${coleccion}/es existe también en en/`, () => {
      expect(es.length).toBeGreaterThan(0);
      for (const archivo of es) {
        expect(existsSync(join(base, 'en', archivo)), `falta en/${archivo}`).toBe(true);
      }
    });

    it(`cada archivo de ${coleccion}/en existe también en es/ (sin huérfanos)`, () => {
      expect(en.length).toBeGreaterThan(0);
      for (const archivo of en) {
        expect(existsSync(join(base, 'es', archivo)), `falta es/${archivo}`).toBe(true);
      }
    });

    it(`los slugs de ${coleccion} son idénticos en ambos idiomas`, () => {
      const soloEnEs = es.filter((f) => !en.includes(f));
      const soloEnEn = en.filter((f) => !es.includes(f));
      expect(soloEnEs, `archivos solo en es/: ${soloEnEs.join(', ')}`).toEqual([]);
      expect(soloEnEn, `archivos solo en en/: ${soloEnEn.join(', ')}`).toEqual([]);
    });
  }
});
