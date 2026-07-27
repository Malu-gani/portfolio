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
  const segmentos = pathname.split('/').filter(Boolean);
  const [actual, seccion, ...resto] = segmentos;
  if (actual !== 'es' && actual !== 'en') return `/${destino}/`;
  if (!seccion) return `/${destino}/`;

  const claves = Object.keys(seccionSlugs) as SeccionKey[];
  const clave = claves.find((k) => seccionSlugs[k][actual] === seccion);
  if (!clave) return `/${destino}/`;

  return ['', destino, seccionSlugs[clave][destino], ...resto].join('/');
}
