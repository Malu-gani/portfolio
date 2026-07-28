# Diagnóstico cross-browser — suite Playwright fuera de Chromium

Árbol base del diagnóstico: commit `c2565a1`. No se tocó código de producción durante la investigación; los cambios de esta nota ya están reflejados en el código (ver "Resolución" al final de cada sección).

## Resumen

Corriendo la suite completa (`npx playwright test`, 4 proyectos) contra un `npm run preview` local, el único navegador con fallas deterministas es **WebKit**, en tres tests:

| Archivo | Test | Navegador |
|---|---|---|
| `tests/e2e/a11y.spec.ts` | `el primer tabulador revela el enlace de salto al contenido` | webkit |
| `tests/e2e/a11y.spec.ts` | `el foco siempre es visible` | webkit |
| `tests/e2e/dev.spec.ts` | `se navega al detalle del proyecto` | webkit |

Los otros navegadores mostraron, en corridas con varios workers en paralelo, `NS_ERROR_CONNECTION_REFUSED` intermitente en rutas distintas cada vez. Aislado con `--workers=1` (un proyecto a la vez, sin concurrencia interna), el error no reaparece: es saturación del `npm run preview` local bajo carga de varios workers, no un bug de accesibilidad ni de contenido. Es la razón por la que CI corre cada proyecto de Playwright en su propio job con `--workers=1` (ver `.github/workflows/ci.yml`).

Los 4 tests `skipped` de `contacto.spec.ts` (portapapeles, restringidos a Chromium) están escritos correctamente y no requieren acción.

## Falla 1 y 2: tab-order en WebKit (`a11y.spec.ts`, "Navegación por teclado")

### Causa raíz

En WebKit, el primer `Tab` en `/es/` va directo al botón de tema (`ThemeToggle.tsx`), nunca al skip-link (`<a href="#contenido">`) ni a ningún otro `<a>` de la página. Confirmado con una página HTML mínima: un `<a href="#a">` plano nunca recibe foco por `Tab` en WebKit; el mismo `<a>` con `tabindex="0"` sí entra al ciclo de tabulación.

Esto es el comportamiento **por defecto** de Safari/WebKit: "Press Tab to highlight each item on a webpage" viene apagado de fábrica en macOS (equivalente a "Full Keyboard Access" apagado), así que los motores WebKit no incluyen `<a>` en el tab-order salvo que tengan `tabindex` explícito. No hay ninguna regla CSS en el proyecto que oculte el anillo de foco — una vez que un elemento recibe foco, es visible.

### Clasificación

Zona intermedia: es comportamiento por defecto de la plataforma, pero el skip-link es la excepción defendible, porque un skip-link inalcanzable por teclado no cumple su función y arreglarlo no le quita nada a nadie.

### Resolución aplicada

Se agregó `tabindex="0"` **únicamente** al skip-link, en `src/layouts/BaseLayout.astro`, con un comentario en el propio archivo. No se tocaron los enlaces de nav, footer ni tarjetas: forzar `tabindex="0"` en toda la navegación equivaldría a sobreescribir una preferencia de accesibilidad del usuario (la de no tabular por todos los enlaces de una página), no a corregir un defecto del sitio.

**Limitación conocida y aceptada, no escondida:** en la configuración de fábrica de Safari, ningún enlace del sitio — nav, footer, tarjetas de caso o proyecto — es alcanzable con `Tab`, salvo el skip-link (ya corregido) y los controles que no son `<a>` (el botón de tema). Esto es real para usuarios de Safari con teclado que no activaron "Full Keyboard Access", que es la configuración por defecto de la mayoría. Se decidió no forzarlo en toda la navegación por la razón de arriba.

Verificado: las dos pruebas de "Navegación por teclado" pasan en `webkit`.

## Falla 3: crash de WebKit en `dev.spec.ts` ("se navega al detalle del proyecto")

### Reproducción

```
npx playwright test tests/e2e/dev.spec.ts --project=webkit -g "se navega al detalle"
```

Con un listener `page.on('crash', ...)` se confirma que es un **crash real del proceso de render de WebKit** (`Error: page.waitForTimeout: Page crashed`), 100% determinista en más de 10 corridas con servidor reconstruido desde cero.

### Causa raíz

Descartado con evidencia, en orden:

1. **No es el contenido de `gestor-operaciones.md`**: `page.goto` directo a `/es/dev/gestor-operaciones` funciona; el mismo contenido alcanzado vía el carril QA (mismo `CaseLayout`) tampoco crashea.
2. **No es el wrapper `<div data-testid="proyecto-detalle">`** de `ProyectoDetalle.astro`: quitarlo no cambia el resultado.
3. **No es el patrón de "stretched link"** de la tarjeta (`after:absolute after:inset-0`): un `<a>` común inyectado y clickeado reproduce el mismo crash.
4. **No es la navegación en sí**: forzar `window.location.href` al mismo URL (navegación dura, sin pasar por el router de Astro) no crashea.
5. **Es específico del par de rutas `/es/dev` → `/es/dev/gestor-operaciones` vía la transición cliente-a-cliente de Astro**: un link inyectado que navega de `/es/dev` a `/es/qa/gestor-operaciones` no crashea; uno que navega de `/es/qa` a `/es/dev/gestor-operaciones` tampoco. Solo crashea cuando el origen es el listado `/es/dev` y el destino es `/es/dev/gestor-operaciones`, usando el `ClientRouter` de Astro.

Conclusión: el disparador es la transición de **navegación client-side de Astro** (`<ClientRouter />`, que usa la View Transitions API nativa del navegador cuando está disponible) entre esas dos páginas puntuales del carril `/dev`. Hay un issue documentado de Astro (`withastro/astro#15727`) sobre bugs de renderizado reales en la implementación nativa de View Transitions de Safari 18 (corrupción de composición con canvas/stylesheets tras la transición), consistente con lo observado acá.

### Clasificación

Zona gris, más cerca de "diferencia/bug de plataforma" que de "bug de nuestro código": se descartaron las hipótesis de código más plausibles (wrapper, patrón de link) y ninguna era la causa. Pero no es un caso de "no hay nada para hacer": el sitio puede mitigar el disparo sin renunciar a la navegación.

### Resolución aplicada

Se agregó `data-astro-reload` al enlace de la tarjeta de proyecto (`src/components/ProyectoCard.astro`), que fuerza una navegación de página completa en vez de la transición cliente-a-cliente de Astro para ese enlace puntual. Es exactamente el camino que el diagnóstico confirmó que no crashea (paso 4 arriba). El costo es perder la transición animada al entrar al detalle desde el listado de `/dev` — aceptable dado que `/dev` es el carril secundario del sitio y la alternativa era un crash real de proceso para usuarios de Safari.

Verificado: `tests/e2e/dev.spec.ts` — el test "se navega al detalle del proyecto" pasa en los 4 proyectos de Playwright, incluido `webkit`, sin necesidad de `test.skip`.
