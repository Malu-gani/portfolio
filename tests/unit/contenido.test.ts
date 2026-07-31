import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const colecciones = ['casos-qa', 'proyectos'];

/**
 * Lee la lista `metricas` del frontmatter sin traer un parser de YAML: el
 * esquema la restringe a un array de objetos planos `{ etiqueta, valor }` de
 * como mucho tres elementos, así que alcanza con recorrer las líneas del
 * bloque. Devuelve `[]` cuando el archivo no declara métricas, que es el caso
 * de la mayoría.
 *
 * No se valida acá que `etiqueta` y `valor` sean no vacíos: eso ya lo impone
 * `z.string().min(1)` en el esquema de la colección y falla el build, así que
 * un test que lo repita no podría ponerse en rojo nunca.
 */
function leerMetricas(archivo: string): { etiqueta: string; valor: string }[] {
  const frontmatter = readFileSync(archivo, 'utf8').split(/^---$/m)[1] ?? '';
  const lineas = frontmatter.split('\n');
  const inicio = lineas.findIndex((l) => l.trim() === 'metricas:');
  if (inicio === -1) return [];

  const metricas: { etiqueta: string; valor: string }[] = [];
  for (const linea of lineas.slice(inicio + 1)) {
    // El bloque termina en la primera clave de nivel superior.
    if (/^\S/.test(linea)) break;
    const etiqueta = linea.match(/^\s*-\s*etiqueta:\s*"?(.*?)"?\s*$/);
    if (etiqueta) {
      metricas.push({ etiqueta: etiqueta[1], valor: '' });
      continue;
    }
    const valor = linea.match(/^\s*valor:\s*"?(.*?)"?\s*$/);
    if (valor && metricas.length > 0) metricas[metricas.length - 1].valor = valor[1];
  }
  return metricas;
}

describe('Integridad del contenido', () => {
  for (const coleccion of colecciones) {
    const base = join('src', 'content', coleccion);
    const es = readdirSync(join(base, 'es')).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
    const en = readdirSync(join(base, 'en')).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));

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

    // Las métricas son las cifras que ProyectoCard muestra en la card. Las
    // etiquetas se traducen, pero los valores no: son números medidos, los
    // mismos en los dos idiomas. Si una versión suma, pierde o cambia una
    // métrica, las dos cards dejan de decir lo mismo y nada más lo detecta
    // (el esquema valida cada archivo por separado, nunca el par).
    it(`las métricas de ${coleccion} son las mismas en ambos idiomas`, () => {
      for (const archivo of es) {
        const enEs = leerMetricas(join(base, 'es', archivo));
        const enEn = leerMetricas(join(base, 'en', archivo));
        expect(enEn.map((m) => m.valor),
          `${archivo}: los valores de las métricas difieren entre idiomas`)
          .toEqual(enEs.map((m) => m.valor));
      }
    });
  }
});
