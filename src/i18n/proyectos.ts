import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './ui';

interface ProyectoStaticPath {
  params: { slug: string };
  props: { proyecto: CollectionEntry<'proyectos'> };
}

/**
 * Cuerpo compartido de `getStaticPaths` para las páginas de detalle de proyecto dev.
 * Cada página `[...slug].astro` (una por idioma) invoca esto con su `lang` fijo,
 * porque `getStaticPaths` en sí no se puede exportar desde un módulo compartido.
 *
 * Es una función hermana de `getCasoStaticPaths` (src/i18n/casos.ts) en vez de una
 * versión genérica compartida: las dos colecciones no comparten el mismo shape
 * (`proyectos` no tiene `tags` ni `estado`), y un genérico sobre ambas solo
 * introduciría parámetros de tipo sin ahorrar código real.
 */
export async function getProyectoStaticPaths(lang: Lang): Promise<ProyectoStaticPath[]> {
  const prefijo = `${lang}/`;
  const proyectos = await getCollection('proyectos');
  return proyectos
    .filter((p) => p.id.startsWith(prefijo))
    .map((proyecto) => ({ params: { slug: proyecto.id.replace(prefijo, '') }, props: { proyecto } }));
}
