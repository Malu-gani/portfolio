import type { Lang } from './ui';

export type SeccionKey = 'proyectos' | 'qa' | 'dev' | 'about' | 'contact';

export const seccionSlugs: Record<SeccionKey, Record<Lang, string>> = {
  proyectos: { es: 'proyectos', en: 'projects' },
  // `qa` y `dev` ya no son listados, pero siguen siendo el prefijo de las
  // páginas de detalle (`/es/qa/<slug>`), y `getAlternateUrl` los necesita
  // para traducir la URL de un detalle al otro idioma.
  qa: { es: 'qa', en: 'qa' },
  dev: { es: 'dev', en: 'dev' },
  about: { es: 'sobre-mi', en: 'about' },
  contact: { es: 'contacto', en: 'contact' },
};

export const rutas: Record<SeccionKey, Record<Lang, string>> = Object.entries(seccionSlugs).reduce(
  (acc, [seccion, slugs]) => ({
    ...acc,
    [seccion]: {
      es: `/es/${slugs.es}`,
      en: `/en/${slugs.en}`,
    },
  }),
  {} as Record<SeccionKey, Record<Lang, string>>,
);
