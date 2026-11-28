import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { formatearFecha } from '../../src/data/fecha';

// Una fecha del contenido (`fecha: 2026-07-30`) se lee como medianoche UTC. Se
// fuerza una zona al oeste de Greenwich para que la prueba también pueda fallar
// en un runner en UTC si el formateo vuelve a depender del equipo que compila.
describe('formatearFecha', () => {
  const zonaOriginal = process.env.TZ;

  beforeAll(() => {
    process.env.TZ = 'America/Argentina/Buenos_Aires';
  });

  afterAll(() => {
    if (zonaOriginal === undefined) delete process.env.TZ;
    else process.env.TZ = zonaOriginal;
  });

  it('corre con la zona forzada', () => {
    // Si esto dejara de cumplirse, las dos pruebas de abajo pasarían sin probar nada.
    expect(new Date('2026-07-30').getDate()).toBe(29);
  });

  it('en español muestra el día escrito en el contenido', () => {
    expect(formatearFecha(new Date('2026-07-30'), 'es')).toBe('30/7/2026');
  });

  it('en inglés muestra el día escrito en el contenido', () => {
    expect(formatearFecha(new Date('2026-07-30'), 'en')).toBe('7/30/2026');
  });
});
