// Gate de Lighthouse sobre dist/. Reemplaza `lhci autorun`: @lhci/cli no tiene
// releases desde junio de 2025 y su cadena de dependencias deja avisos de
// seguridad sin parche (extract-zip, zod 3.x). Lee los mismos umbrales de
// lighthouserc.json, así que cambiar un mínimo sigue siendo editar ese archivo.
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { evaluarCategoria, resolverRuta, resolverUmbrales, tipoMime } from './lighthouse-gate-lib.mjs';

const DIST = resolve('dist');
const { ci } = JSON.parse(readFileSync('lighthouserc.json', 'utf8'));
const urls = ci.collect.url.map((u) => new URL(u).pathname);
const corridas = ci.collect.numberOfRuns ?? 1;
const umbrales = resolverUmbrales(ci.assert?.assertions);

async function leerArchivo(pathname) {
  let ruta = resolverRuta(DIST, pathname);
  if (!ruta) return null;
  try {
    if ((await stat(ruta)).isDirectory()) ruta = join(ruta, 'index.html');
    return { ruta, cuerpo: await readFile(ruta) };
  } catch {
    return null;
  }
}

const servidor = createServer(async (req, res) => {
  const archivo = await leerArchivo(new URL(req.url, 'http://localhost').pathname);
  if (!archivo) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
    return;
  }
  res.writeHead(200, { 'Content-Type': tipoMime(archivo.ruta) });
  res.end(archivo.cuerpo);
});
await new Promise((listo) => servidor.listen(0, '127.0.0.1', listo));
const origen = `http://127.0.0.1:${servidor.address().port}`;

async function medir(url) {
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
  try {
    const { lhr } = await lighthouse(url, { port: chrome.port, logLevel: 'error', output: 'json' });
    return lhr;
  } finally {
    // En Windows Chrome puede tener la carpeta temporal tomada y el borrado
    // falla con EPERM aunque la medición ya terminó. No es un fallo del gate.
    try {
      await chrome.kill();
    } catch (error) {
      if (error.code !== 'EPERM') throw error;
    }
  }
}

let fallos = 0;
try {
  for (const pathname of urls) {
    console.log(`\n${pathname}  (${corridas} corridas, cuenta la mejor)`);
    const porCategoria = Object.fromEntries(umbrales.map((u) => [u.categoria, []]));
    for (let i = 0; i < corridas; i++) {
      const lhr = await medir(`${origen}${pathname}`);
      if (lhr.runtimeError) throw new Error(`Lighthouse falló en ${pathname}: ${lhr.runtimeError.message}`);
      for (const u of umbrales) {
        const categoria = lhr.categories[u.categoria];
        if (!categoria) throw new Error(`La categoría "${u.categoria}" no existe en el reporte de Lighthouse.`);
        porCategoria[u.categoria].push(categoria.score);
      }
    }
    for (const u of umbrales) {
      const { mejor, peor, pasa } = evaluarCategoria(porCategoria[u.categoria], u.minScore);
      if (!pasa && u.nivel === 'error') fallos++;
      const marca = pasa ? '✔' : u.nivel === 'error' ? '✖' : '!';
      console.log(`  ${marca} ${u.categoria}: mejor ${mejor}, peor ${peor} (mínimo ${u.minScore})`);
    }
  }
} finally {
  servidor.close();
  servidor.closeAllConnections();
}

if (fallos > 0) {
  console.error(`\n✖ ${fallos} umbral(es) de Lighthouse sin cumplir.\n`);
  process.exit(1);
}
console.log('\n✔ Lighthouse: todos los umbrales se cumplen.');
