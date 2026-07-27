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
  it('devuelve el texto en el idioma pedido', () => {
    expect(useTranslations('en')('nav.qa')).toBe('QA');
    expect(useTranslations('es')('nav.sobre')).toBe('Sobre mí');
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
});
