import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  pendientesDeColecciones,
  pendientesDeComponentes,
  MARCADOR_EJEMPLO_COMPONENTE,
} from '../../scripts/check-listo-lib.mjs';

function fixtureBase(): string {
  return mkdtempSync(join(tmpdir(), 'check-listo-'));
}

function crearColecciones(base: string) {
  for (const coleccion of ['casos-qa', 'proyectos']) {
    for (const lang of ['es', 'en']) {
      mkdirSync(join(base, 'src', 'content', coleccion, lang), { recursive: true });
    }
  }
}

describe('check-listo — colecciones de contenido', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('no marca nada cuando ningún archivo tiene ejemplo: true', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColecciones(base);
    writeFileSync(
      join(base, 'src', 'content', 'casos-qa', 'es', 'uno.md'),
      '---\ntitulo: Real\nejemplo: false\n---\ncontenido',
    );
    expect(pendientesDeColecciones(base)).toEqual([]);
  });

  it('detecta ejemplo: true en minúscula', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColecciones(base);
    const ruta = join(base, 'src', 'content', 'casos-qa', 'es', 'uno.md');
    writeFileSync(ruta, '---\ntitulo: Ejemplo\nejemplo: true\n---\ncontenido');
    expect(pendientesDeColecciones(base)).toEqual([ruta]);
  });

  it('detecta la variante con mayúscula (Ejemplo: True)', () => {
    const base = fixtureBase();
    dirs.push(base);
    crearColecciones(base);
    const ruta = join(base, 'src', 'content', 'proyectos', 'en', 'uno.md');
    writeFileSync(ruta, '---\ntitle: Sample\nejemplo: True\n---\ncontent');
    expect(pendientesDeColecciones(base)).toEqual([ruta]);
  });
});

describe('check-listo — componentes con marcador @ejemplo-pendiente', () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });

  it('falla (reporta el archivo) cuando el marcador está presente', () => {
    const base = fixtureBase();
    dirs.push(base);
    mkdirSync(join(base, 'src', 'components'), { recursive: true });
    const ruta = join(base, 'src', 'components', 'AboutContent.astro');
    writeFileSync(
      ruta,
      `---\n// ${MARCADOR_EJEMPLO_COMPONENTE}: bio de relleno\n---\n<p>placeholder</p>\n`,
    );
    expect(pendientesDeComponentes(base)).toEqual([ruta]);
  });

  it('pasa (no reporta nada) cuando el marcador no está', () => {
    const base = fixtureBase();
    dirs.push(base);
    mkdirSync(join(base, 'src', 'components'), { recursive: true });
    writeFileSync(
      join(base, 'src', 'components', 'AboutContent.astro'),
      '---\n// biografía real ya cargada\n---\n<p>contenido real</p>\n',
    );
    expect(pendientesDeComponentes(base)).toEqual([]);
  });

  it('busca recursivamente dentro de src/pages y src/components', () => {
    const base = fixtureBase();
    dirs.push(base);
    mkdirSync(join(base, 'src', 'pages', 'es'), { recursive: true });
    const ruta = join(base, 'src', 'pages', 'es', 'sobre-mi.astro');
    writeFileSync(ruta, `---\n// ${MARCADOR_EJEMPLO_COMPONENTE}\n---\n<p>x</p>\n`);
    expect(pendientesDeComponentes(base)).toEqual([ruta]);
  });

  it('el estado actual del repo lleva el marcador en AboutContent.astro (documenta la regresión que este gate evita)', () => {
    const pendientes = pendientesDeComponentes(process.cwd());
    const rutas = pendientes.map((p) => p.replace(/\\/g, '/'));
    expect(rutas.some((p) => p.endsWith('src/components/AboutContent.astro'))).toBe(true);
  });
});
