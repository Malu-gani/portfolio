import { describe, expect, it } from 'vitest';
import { join, resolve } from 'node:path';
import { evaluarCategoria, resolverRuta, resolverUmbrales, tipoMime } from '../../scripts/lighthouse-gate-lib.mjs';

describe('resolverUmbrales', () => {
  it('lee los umbrales de lighthouserc.json', () => {
    expect(
      resolverUmbrales({
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['warn', { minScore: 1 }],
      }),
    ).toEqual([
      { categoria: 'performance', minScore: 0.9, nivel: 'error' },
      { categoria: 'accessibility', minScore: 1, nivel: 'warn' },
    ]);
  });

  it('descarta las aserciones apagadas', () => {
    expect(resolverUmbrales({ 'categories:seo': 'off' })).toEqual([]);
  });

  it('rechaza una aserción que no sabe evaluar en vez de ignorarla', () => {
    expect(() => resolverUmbrales({ 'first-contentful-paint': ['error', { maxNumericValue: 2000 }] })).toThrow(
      /no soportada/,
    );
  });

  it('rechaza una categoría sin minScore numérico', () => {
    expect(() => resolverUmbrales({ 'categories:seo': ['error', {}] })).toThrow(/minScore/);
  });
});

describe('evaluarCategoria', () => {
  it('pasa si la mejor corrida llega al mínimo, aunque otra no', () => {
    expect(evaluarCategoria([0.85, 0.92, 0.88], 0.9)).toEqual({ mejor: 0.92, peor: 0.85, pasa: true });
  });

  it('falla si ninguna corrida llega al mínimo', () => {
    expect(evaluarCategoria([0.85, 0.89, 0.88], 0.9).pasa).toBe(false);
  });

  it('acepta justo el mínimo', () => {
    expect(evaluarCategoria([1], 1).pasa).toBe(true);
  });

  it('no evalúa sin corridas', () => {
    expect(() => evaluarCategoria([], 0.9)).toThrow();
  });
});

describe('resolverRuta', () => {
  const dist = resolve('dist');

  it('sirve index.html para un pathname terminado en barra', () => {
    expect(resolverRuta(dist, '/es/')).toBe(join(dist, 'es', 'index.html'));
  });

  it('resuelve un archivo concreto', () => {
    expect(resolverRuta(dist, '/es/index.html')).toBe(join(dist, 'es', 'index.html'));
  });

  it('no deja salir de dist con ../', () => {
    expect(resolverRuta(dist, '/../package.json')).toBeNull();
    expect(resolverRuta(dist, '/%2e%2e/package.json')).toBeNull();
  });

  it('rechaza bytes nulos y codificaciones inválidas', () => {
    expect(resolverRuta(dist, '/a%00.html')).toBeNull();
    expect(resolverRuta(dist, '/%E0%A4%A')).toBeNull();
  });
});

describe('tipoMime', () => {
  it('devuelve el tipo correcto por extensión', () => {
    expect(tipoMime('x.html')).toContain('text/html');
    expect(tipoMime('x.webp')).toBe('image/webp');
    expect(tipoMime('x.WOFF2')).toBe('font/woff2');
  });

  it('cae a octet-stream para lo desconocido', () => {
    expect(tipoMime('x.bin')).toBe('application/octet-stream');
  });
});
