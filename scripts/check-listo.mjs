import { pendientesDeColecciones, pendientesDeComponentes } from './check-listo-lib.mjs';

let coleccionesPendientes;
try {
  coleccionesPendientes = pendientesDeColecciones();
} catch (error) {
  console.error(`\n✖ ${error.message}\n`);
  process.exit(1);
}

const componentesPendientes = pendientesDeComponentes();

const pendientes = [...coleccionesPendientes, ...componentesPendientes];

if (pendientes.length > 0) {
  console.error(`\n✖ Hay ${pendientes.length} archivo(s) con contenido de ejemplo:\n`);
  for (const p of pendientes) console.error(`  - ${p}`);
  console.error('\nReemplazá el contenido y quitá "ejemplo: true" (colecciones) o el marcador "@ejemplo-pendiente" (componentes) antes de publicar.\n');
  process.exit(1);
}
console.log('✔ Todo el contenido es real. Listo para publicar.');
