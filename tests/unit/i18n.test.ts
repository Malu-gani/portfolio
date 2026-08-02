import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations, getAlternateUrl } from '../../src/i18n/utils';

describe('getLangFromUrl', () => {
  it('detecta español', () => {
    expect(getLangFromUrl(new URL('https://x.com/es/qa'))).toBe('es');
  });
  it('detecta inglés', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/about'))).toBe('en');
  });
  it('cae al idioma por defecto si la ruta no tiene prefijo', () => {
    expect(getLangFromUrl(new URL('https://x.com/'))).toBe('es');
  });
});

describe('useTranslations', () => {
  it('devuelve texto en inglés', () => {
    expect(useTranslations('en')('nav.contacto')).toBe('Contact');
  });
  it('devuelve texto en español', () => {
    expect(useTranslations('es')('nav.sobre')).toBe('Sobre mí');
  });
  it('traduce claves al idioma solicitado', () => {
    expect(useTranslations('en')('nav.sobre')).toBe('About');
  });
});

describe('getAlternateUrl', () => {
  it('traduce la home', () => {
    expect(getAlternateUrl('/es/', 'en')).toBe('/en/');
  });
  it('mantiene secciones de slug compartido', () => {
    expect(getAlternateUrl('/es/qa', 'en')).toBe('/en/qa');
  });
  it('traduce secciones de slug distinto', () => {
    expect(getAlternateUrl('/es/sobre-mi', 'en')).toBe('/en/about');
    expect(getAlternateUrl('/en/contact', 'es')).toBe('/es/contacto');
  });
  it('preserva el slug del caso al cambiar de idioma', () => {
    expect(getAlternateUrl('/es/qa/mi-caso', 'en')).toBe('/en/qa/mi-caso');
  });
  it('tolera la barra final', () => {
    expect(getAlternateUrl('/es/qa/mi-caso/', 'en')).toBe('/en/qa/mi-caso');
  });
  it('cae a la home del idioma destino si la sección es desconocida', () => {
    expect(getAlternateUrl('/es/inexistente', 'en')).toBe('/en/');
  });
  it('preserva query string', () => {
    expect(getAlternateUrl('/es/qa?tag=e2e', 'en')).toBe('/en/qa?tag=e2e');
  });
  it('preserva fragmento', () => {
    expect(getAlternateUrl('/es/sobre-mi#formacion', 'en')).toBe('/en/about#formacion');
  });
  it('preserva query string y fragmento juntos', () => {
    expect(getAlternateUrl('/es/qa?tag=e2e#resultados', 'en')).toBe('/en/qa?tag=e2e#resultados');
  });
  it('traduce el slug del filtro "todos" al cambiar de idioma', () => {
    expect(getAlternateUrl('/es/proyectos/todos', 'en')).toBe('/en/projects/all');
    expect(getAlternateUrl('/en/projects/all', 'es')).toBe('/es/proyectos/todos');
  });

  it('deja intacto el resto de los slugs de proyectos', () => {
    expect(getAlternateUrl('/es/proyectos/dev', 'en')).toBe('/en/projects/dev');
    expect(getAlternateUrl('/es/proyectos', 'en')).toBe('/en/projects');
  });
});
