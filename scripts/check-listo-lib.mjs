// Lógica pura (sin process.exit) para que check-listo.mjs sea testeable.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Marcador que un componente (no una colección de contenido) tiene que llevar
// mientras su texto sea de relleno. Es booleano por diseño: o la línea exacta
// está en el archivo, o no está — no hay estado intermedio que se pueda dejar
// a medias. Vive dentro del propio archivo con contenido de ejemplo, así que
// no hace falta mantener un registro aparte que alguien se olvide de actualizar
// cuando aparezca un componente nuevo con texto de relleno.
export const MARCADOR_EJEMPLO_COMPONENTE = '@ejemplo-pendiente';

const COLECCIONES = ['casos-qa', 'proyectos'];
const IDIOMAS = ['es', 'en'];
const DIRECTORIOS_COMPONENTES = [join('src', 'components'), join('src', 'pages')];

/**
 * Colecciones de contenido (`.md`) con `ejemplo: true` en el frontmatter.
 */
export function pendientesDeColecciones(baseDir = process.cwd()) {
  const pendientes = [];
  for (const coleccion of COLECCIONES) {
    for (const lang of IDIOMAS) {
      const dir = join(baseDir, 'src', 'content', coleccion, lang);
      let archivos;
      try {
        archivos = readdirSync(dir).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
      } catch (error) {
        throw new Error(`No se pudo leer el directorio "${dir}": ${error.message}`);
      }
      for (const archivo of archivos) {
        const ruta = join(dir, archivo);
        const texto = readFileSync(ruta, 'utf8');
        if (/^ejemplo:\s*true\s*$/im.test(texto)) pendientes.push(ruta);
      }
    }
  }
  return pendientes;
}

function archivosRecursivos(dir, extension) {
  let entradas;
  try {
    entradas = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const resultado = [];
  for (const entrada of entradas) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      resultado.push(...archivosRecursivos(ruta, extension));
    } else if (entrada.isFile() && entrada.name.endsWith(extension)) {
      resultado.push(ruta);
    }
  }
  return resultado;
}

/**
 * Componentes/páginas `.astro` fuera de las colecciones de contenido que
 * todavía llevan el marcador de contenido de ejemplo (ver
 * MARCADOR_EJEMPLO_COMPONENTE más arriba).
 */
export function pendientesDeComponentes(baseDir = process.cwd()) {
  const pendientes = [];
  for (const dirRelativo of DIRECTORIOS_COMPONENTES) {
    const dir = join(baseDir, dirRelativo);
    for (const ruta of archivosRecursivos(dir, '.astro')) {
      const texto = readFileSync(ruta, 'utf8');
      if (texto.includes(MARCADOR_EJEMPLO_COMPONENTE)) pendientes.push(ruta);
    }
  }
  return pendientes;
}
