import { ui, defaultLang, type Lang, type ClaveUI } from './ui';
import { seccionSlugs, type SeccionKey } from './routes';

export function getLangFromUrl(url: URL): Lang {
  const [, prefijo] = url.pathname.split('/');
  return prefijo === 'en' || prefijo === 'es' ? prefijo : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(clave: ClaveUI): string {
    return ui[lang][clave];
  };
}

export function getAlternateUrl(pathname: string, destino: Lang): string {
  // Extraer query y fragmento
  const hashIndex = pathname.indexOf('#');
  const queryIndex = pathname.indexOf('?');

  const fragment = hashIndex !== -1 ? pathname.substring(hashIndex) : '';
  const queryString = queryIndex !== -1 && queryIndex < (hashIndex !== -1 ? hashIndex : Infinity)
    ? pathname.substring(queryIndex, hashIndex !== -1 ? hashIndex : undefined)
    : '';

  const pathOnly = pathname.substring(0, queryIndex !== -1 ? queryIndex : hashIndex !== -1 ? hashIndex : pathname.length);

  const segmentos = pathOnly.split('/').filter(Boolean);
  const [actual, seccion, ...resto] = segmentos;
  if (actual !== 'es' && actual !== 'en') return `/${destino}/${queryString}${fragment}`;
  if (!seccion) return `/${destino}/${queryString}${fragment}`;

  const claves = Object.keys(seccionSlugs) as SeccionKey[];
  const clave = claves.find((k) => seccionSlugs[k][actual] === seccion);
  if (!clave) return `/${destino}/${queryString}${fragment}`;

  return `${['', destino, seccionSlugs[clave][destino], ...resto].join('/')}${queryString}${fragment}`;
}
