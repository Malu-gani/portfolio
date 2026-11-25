import { describe, it, expect } from 'vitest';
import config from '../../playwright.config';

// PORT-US-20: `astro preview` con `localhost` escucha en una sola dirección
// (en Windows, solo `[::1]`), y firefox a veces resuelve `localhost` a la otra
// (`127.0.0.1`) y recibe NS_ERROR_CONNECTION_REFUSED. Chromium y webkit
// reintentan con la otra dirección; firefox no siempre. La salida es no dejar
// nada librado a la resolución de `localhost`: el servidor y los tests usan la
// misma dirección IPv4 explícita.
describe('playwright.config', () => {
  const HOST = '127.0.0.1';
  const webServer = config.webServer as { command: string; url: string };

  it('los tests apuntan a la dirección explícita, no a "localhost"', () => {
    expect(new URL(config.use!.baseURL!).hostname).toBe(HOST);
  });

  it('el servidor de prueba escucha en esa misma dirección', () => {
    expect(webServer.command).toContain(`--host ${HOST}`);
  });

  it('Playwright espera al servidor en esa misma dirección', () => {
    expect(new URL(webServer.url).hostname).toBe(HOST);
  });

  // El puerto lo fija el script `preview` de package.json (4321).
  it('el puerto de Playwright y el de los tests coinciden', () => {
    expect(new URL(webServer.url).port).toBe(new URL(config.use!.baseURL!).port);
  });
});
