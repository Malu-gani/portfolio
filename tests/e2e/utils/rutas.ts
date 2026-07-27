import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Deriva las rutas reales del sitio a partir del código fuente, en vez de mantener
 * una lista copiada a mano. Dos fuentes:
 *
 * 1. `src/pages/{lang}/**​/*.astro` — páginas estáticas. Se excluyen los templates
 *    dinámicos (`[...slug].astro`): sus rutas concretas salen de las colecciones.
 * 2. `src/content/{coleccion}/{lang}/*.md` — un archivo por caso o proyecto; el
 *    nombre de archivo es el slug (confirmado en `src/i18n/casos.ts` y
 *    `src/i18n/proyectos.ts`, que arman los `getStaticPaths` a partir del `id`
 *    del entry, que es exactamente `{lang}/{nombre-de-archivo}`).
 *
 * Si mañana se agrega una página estática o un caso/proyecto nuevo, esta función
 * lo recoge solo con que el archivo exista en el filesystem — no hace falta tocar
 * este archivo ni la suite de accesibilidad.
 */

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '../../..');

type Lang = 'es' | 'en';

function listarArchivos(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const resultado: string[] = [];
  const pila: string[] = [dir];
  while (pila.length > 0) {
    const actual = pila.pop()!;
    for (const entrada of fs.readdirSync(actual, { withFileTypes: true })) {
      const rutaCompleta = path.join(actual, entrada.name);
      if (entrada.isDirectory()) {
        pila.push(rutaCompleta);
      } else {
        resultado.push(rutaCompleta);
      }
    }
  }
  return resultado;
}

/** Páginas estáticas de `src/pages/{lang}`, excluyendo templates dinámicos. */
function paginasEstaticas(lang: Lang): string[] {
  const baseDir = path.join(RAIZ, 'src', 'pages', lang);
  const archivos = listarArchivos(baseDir).filter(
    (archivo) => archivo.endsWith('.astro') && !path.basename(archivo).includes('[')
  );

  return archivos.map((archivo) => {
    const relativo = path.relative(baseDir, archivo).replace(/\\/g, '/');
    const sinExtension = relativo.replace(/\.astro$/, '');
    const segmentos = sinExtension.split('/').filter((s) => s !== 'index');
    return segmentos.length === 0 ? `/${lang}/` : `/${lang}/${segmentos.join('/')}`;
  });
}

/** Rutas de detalle derivadas de los archivos de una colección de contenido. */
function paginasDeColeccion(coleccion: string, prefijoRuta: string, lang: Lang): string[] {
  const dir = path.join(RAIZ, 'src', 'content', coleccion, lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => `/${lang}/${prefijoRuta}/${e.name.replace(/\.md$/, '')}`);
}

/** Todas las rutas reales del sitio, en ambos idiomas. */
export function rutasDelSitio(): string[] {
  const langs: Lang[] = ['es', 'en'];
  const rutas: string[] = [];
  for (const lang of langs) {
    rutas.push(...paginasEstaticas(lang));
    rutas.push(...paginasDeColeccion('casos-qa', 'qa', lang));
    rutas.push(...paginasDeColeccion('proyectos', 'dev', lang));
  }
  return [...new Set(rutas)].sort();
}
