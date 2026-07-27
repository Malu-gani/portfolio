import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from './ui';

interface CasoStaticPath {
  params: { slug: string };
  props: { caso: CollectionEntry<'casos-qa'> };
}

/**
 * Cuerpo compartido de `getStaticPaths` para las páginas de detalle de caso QA.
 * Cada página `[...slug].astro` (una por idioma) invoca esto con su `lang` fijo,
 * porque `getStaticPaths` en sí no se puede exportar desde un módulo compartido.
 */
export async function getCasoStaticPaths(lang: Lang): Promise<CasoStaticPath[]> {
  const prefijo = `${lang}/`;
  const casos = await getCollection('casos-qa');
  return casos
    .filter((c) => c.id.startsWith(prefijo))
    .map((caso) => ({ params: { slug: caso.id.replace(prefijo, '') }, props: { caso } }));
}
