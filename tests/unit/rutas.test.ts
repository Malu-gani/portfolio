import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { paginasDeColeccion } from '../e2e/utils/rutas';

// `paginasDeColeccion` (usada por `rutasDelSitio()`, que a su vez alimenta
// `a11y.spec.ts` y `enlaces.spec.ts`) filtra los archivos de una colección
// por extensión. Task 13 migró un caso real (`suite-e2e-portfolio`) de `.md`
// a `.mdx` y amplió ese filtro para aceptar ambas extensiones. Sin un test
// que ejercite el filtro directamente, revertirlo a solo `.md` no rompe nada
// visible: la suite de accesibilidad y de enlaces simplemente barre menos
// rutas y sigue en verde — el falso negativo silencioso que esta tarea
// existe para prevenir. Se usa un directorio temporal (`mkdtempSync`), igual
// que `check-listo.test.ts`, para no depender del contenido real del repo ni
// fijar un número de rutas (frágil ante cualquier caso/proyecto nuevo).

function fixtureBase(): string {
  return mkdtempSync(join(tmpdir(), 'rutas-'));
}

function crearColeccion(base: string, coleccion: string, lang: string) {
  mkdirSync(join(base, 'src', 'content', coleccion, lang), { recursive: true });
}

describe('rutas — paginasDeColeccion (filtro de extensión .md/.mdx)', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('devuelve [] cuando el directorio de la colección no existe', () => {
    const base = fixtureBase();
    dirs.push(base);
    expect(paginasDeColeccion('casos-qa', 'qa', 'es', base)).toEqual([]);
  });

  it('deriva la ruta de un archivo .md', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColeccion(base, 'casos-qa', 'es');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', 'un-caso.md'), 'contenido');
    expect(paginasDeColeccion('casos-qa', 'qa', 'es', base)).toEqual(['/es/qa/un-caso']);
  });

  it('deriva la ruta de un archivo .mdx', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColeccion(base, 'casos-qa', 'es');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', 'con-componentes.mdx'), 'contenido');
    expect(paginasDeColeccion('casos-qa', 'qa', 'es', base)).toEqual(['/es/qa/con-componentes']);
  });

  it('devuelve ambas rutas cuando la colección mezcla .md y .mdx, sin que una tape a la otra', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColeccion(base, 'casos-qa', 'es');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', 'uno.md'), 'contenido');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', 'dos.mdx'), 'contenido');
    expect(paginasDeColeccion('casos-qa', 'qa', 'es', base).sort()).toEqual(
      ['/es/qa/dos', '/es/qa/uno'].sort(),
    );
  });

  it('ignora archivos con otras extensiones (no genera rutas para ellos)', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColeccion(base, 'casos-qa', 'es');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', 'uno.md'), 'contenido');
    writeFileSync(join(base, 'src', 'content', 'casos-qa', 'es', '.DS_Store'), '');
    expect(paginasDeColeccion('casos-qa', 'qa', 'es', base)).toEqual(['/es/qa/uno']);
  });
});
