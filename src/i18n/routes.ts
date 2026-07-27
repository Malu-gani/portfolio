import type { Lang } from './ui';

export type SeccionKey = 'qa' | 'dev' | 'about' | 'contact';

export const seccionSlugs: Record<SeccionKey, Record<Lang, string>> = {
  qa: { es: 'qa', en: 'qa' },
  dev: { es: 'dev', en: 'dev' },
  about: { es: 'sobre-mi', en: 'about' },
  contact: { es: 'contacto', en: 'contact' },
};

export const rutas: Record<SeccionKey, Record<Lang, string>> = {
  qa: { es: '/es/qa', en: '/en/qa' },
  dev: { es: '/es/dev', en: '/en/dev' },
  about: { es: '/es/sobre-mi', en: '/en/about' },
  contact: { es: '/es/contacto', en: '/en/contact' },
};
