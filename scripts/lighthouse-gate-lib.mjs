// Lógica pura (sin Chrome, sin red, sin process.exit) para que
// lighthouse-gate.mjs sea testeable. Reemplaza lo que hacía `lhci autorun`:
// leer los umbrales de lighthouserc.json, servir dist/ y decidir si pasa.
import { extname, join, normalize, sep } from 'node:path';

const PREFIJO_CATEGORIA = 'categories:';

/**
 * Convierte `assert.assertions` de lighthouserc.json en una lista de umbrales.
 * Solo soporta `categories:<id>` con `minScore`: cualquier otra aserción se
 * rechaza en vez de ignorarse, para que un umbral nuevo nunca quede sin
 * evaluar en silencio.
 */
export function resolverUmbrales(assertions) {
  const umbrales = [];
  for (const [clave, valor] of Object.entries(assertions ?? {})) {
    if (!clave.startsWith(PREFIJO_CATEGORIA)) {
      throw new Error(`Aserción no soportada: "${clave}". Solo se evalúan "categories:*" con minScore.`);
    }
    const [nivel, opciones] = Array.isArray(valor) ? valor : [valor, {}];
    if (nivel === 'off') continue;
    if (typeof opciones?.minScore !== 'number') {
      throw new Error(`"${clave}" necesita un minScore numérico.`);
    }
    umbrales.push({ categoria: clave.slice(PREFIJO_CATEGORIA.length), minScore: opciones.minScore, nivel });
  }
  return umbrales;
}

/**
 * Misma agregación que `lhci assert` por defecto ("optimistic"): para un
 * mínimo cuenta la MEJOR corrida. Una corrida mala por ruido del runner no
 * tumba el gate; sí lo tumba que ninguna de las corridas llegue al umbral.
 */
export function evaluarCategoria(puntajes, minScore) {
  if (puntajes.length === 0) throw new Error('No hay puntajes para evaluar.');
  const mejor = Math.max(...puntajes);
  const peor = Math.min(...puntajes);
  return { mejor, peor, pasa: mejor >= minScore };
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

export function tipoMime(ruta) {
  return TIPOS[extname(ruta).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Ruta absoluta dentro de `distDir` para un pathname de URL, o null si intenta
 * salirse del directorio. Un pathname terminado en "/" sirve su index.html.
 */
export function resolverRuta(distDir, pathname) {
  let decodificado;
  try {
    decodificado = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decodificado.includes('\0')) return null;
  const relativa = decodificado.endsWith('/') ? `${decodificado}index.html` : decodificado;
  const absoluta = normalize(join(distDir, relativa));
  const base = normalize(distDir);
  return absoluta === base || absoluta.startsWith(base + sep) ? absoluta : null;
}
