import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pendientes = [];
for (const coleccion of ['casos-qa', 'proyectos']) {
  for (const lang of ['es', 'en']) {
    const dir = join('src', 'content', coleccion, lang);
    let archivos;
    try {
      archivos = readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch (error) {
      console.error(`\n✖ No se pudo leer el directorio "${dir}": ${error.message}\n`);
      process.exit(1);
    }
    for (const archivo of archivos) {
      const texto = readFileSync(join(dir, archivo), 'utf8');
      if (/^ejemplo:\s*true\s*$/im.test(texto)) pendientes.push(join(dir, archivo));
    }
  }
}

if (pendientes.length > 0) {
  console.error(`\n✖ Hay ${pendientes.length} archivo(s) con contenido de ejemplo:\n`);
  for (const p of pendientes) console.error(`  - ${p}`);
  console.error('\nReemplazá el contenido y quitá "ejemplo: true" antes de publicar.\n');
  process.exit(1);
}
console.log('✔ Todo el contenido es real. Listo para publicar.');
