import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// El README es público y se escribe a mano: sin una prueba, sigue nombrando
// archivos y comandos que ya no existen y nada más lo nota.
const readme = readFileSync('README.md', 'utf8');

/** Rutas del repo y archivos de prueba citados como código o como enlace. */
function rutasCitadas(texto: string): string[] {
  const enCodigo = [...texto.matchAll(/`([^`\s]+)`/g)].map((m) => m[1]);
  const enEnlaces = [...texto.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  return [...enCodigo, ...enEnlaces].filter(
    (t) =>
      // `<slug>` y los comodines son patrones, no rutas concretas.
      !/[<>*]|^https?:/.test(t) &&
      (/^(src|tests|docs|scripts|public|\.github)\//.test(t) || /\.(spec|test)\.ts$/.test(t)),
  );
}

/** Un archivo de prueba citado sin carpeta se busca entre las dos suites. */
function existe(ruta: string): boolean {
  if (ruta.includes('/')) return existsSync(ruta);
  return ['tests/e2e', 'tests/unit'].some((carpeta) => existsSync(join(carpeta, ruta)));
}

describe('README', () => {
  it('las rutas y los archivos de prueba que nombra existen', () => {
    const rutas = rutasCitadas(readme);
    expect(rutas.length).toBeGreaterThan(0);
    expect(rutas.filter((r) => !existe(r))).toEqual([]);
  });

  it('los comandos npm run que nombra existen en package.json', () => {
    const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
    const comandos = [...readme.matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]);
    expect(comandos.length).toBeGreaterThan(0);
    expect(comandos.filter((c) => !(c in scripts))).toEqual([]);
  });

  it('enlaza el sitio publicado', () => {
    const sitio = readFileSync('astro.config.mjs', 'utf8').match(/site:\s*'([^']+)'/)?.[1];
    expect(sitio).toBeDefined();
    expect(readme).toContain(sitio);
  });
});
