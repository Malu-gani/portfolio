import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const colecciones = ['casos-qa', 'proyectos'];

describe('Integridad del contenido', () => {
  for (const coleccion of colecciones) {
    it(`cada archivo de ${coleccion} existe en ambos idiomas`, () => {
      const base = join('src', 'content', coleccion);
      const es = readdirSync(join(base, 'es')).filter((f) => f.endsWith('.md'));
      expect(es.length).toBeGreaterThan(0);
      for (const archivo of es) {
        expect(existsSync(join(base, 'en', archivo)), `falta en/${archivo}`).toBe(true);
      }
    });
  }
});
