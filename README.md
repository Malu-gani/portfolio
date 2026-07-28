[![CI](https://github.com/Malu-gani/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Malu-gani/portfolio/actions/workflows/ci.yml)

# Portfolio personal QA

Portfolio bilingüe (ES/EN) de **Juan Manuel Malugani**, carta de presentación para una búsqueda laboral activa en QA. Sitio estático construido con Astro, con dos carriles: `/qa` es el principal, `/dev` es secundario y deliberadamente más chico — muestra que además de testear puedo escribir el código que se testea, sin competir con el carril principal.

> **Estado del contenido:** todo lo que ves publicado hoy — los tres casos de QA, el proyecto de `/dev` y la sección "Sobre mí" — es contenido de ejemplo, marcado como tal en el frontmatter (`ejemplo: true`) y avisado con un banner visible en cada página. Está ahí para que el layout y las pruebas tengan algo real que renderizar mientras se redacta el contenido definitivo. El script `npm run check:listo` falla a propósito mientras quede alguna pieza de ejemplo sin reemplazar — es la señal de "no publicar todavía", no un bug.

## Stack

Astro 7 (`output: 'static'`) · React 19 solo en islands puntuales (el toggle de tema) · Tailwind 4 con configuración CSS-first · TypeScript strict · Playwright · axe-core · Vitest · Lighthouse CI. Node 22.12+.

## Cómo está verificado

Esto es lo que distingue este repo de un portfolio estático cualquiera: viene con su propia suite de calidad, corrida en CI en cada push y cada pull request a `main` (ver el badge arriba y `.github/workflows/ci.yml`).

- **Tipos:** `npm run check` (Astro Check) — 0 errores, 0 warnings sobre 76 archivos `.astro`/`.ts` al momento de escribir esto. Es el gate real de tipos; `astro build` no chequea los `.tsx`.
- **Unitarios:** `npm run test:unit` (Vitest) — 35 tests en 4 archivos, todos verdes.
- **Build:** `npm run build` genera las 19 páginas estáticas del sitio (ambos idiomas, ambos carriles) sin errores.
- **End-to-end:** `npm run test:e2e` (Playwright), suite propia de 120 tests que cubre navegación, cambio de idioma, tema claro/oscuro, contenido de los carriles QA y Dev, integridad de enlaces internos y externos (con `rel="noopener"` en los que abren pestaña nueva), y los componentes de dominio QA (reporte de bug, matriz de casos, métricas). Corre en 4 proyectos de navegador: Chromium, Firefox, WebKit y un perfil mobile (Pixel 7).
- **Accesibilidad:** `axe-core` integrado en la suite E2E — cero violaciones WCAG AA en las 19 rutas, en tema claro y en tema oscuro, en los 4 navegadores.
- **Regresión visual:** capturas de referencia por página y tema (excluidas al correr contra un entorno distinto al local, porque el renderizado de subpíxeles varía entre máquinas).
- **Lighthouse:** `npm run test:lighthouse` corre en CI sobre el build de producción.

**Limitación conocida y aceptada, no escondida:** en la configuración de fábrica de Safari (con "Full Keyboard Access" apagado, que es el default para la mayoría de usuarios), los enlaces del sitio no son alcanzables tabulando con el teclado — es el comportamiento por defecto del motor WebKit, no un defecto del markup. El skip-link sí se hizo explícitamente alcanzable (`tabindex="0"`), porque ahí la excepción está justificada: un skip-link que no se puede alcanzar con teclado no cumple su función. El detalle completo de este diagnóstico, con la evidencia y las alternativas consideradas, está en `.superpowers/sdd/2026-07-27-portfolio-qa/cross-browser-diagnostico.md`.

## Decisiones técnicas

**Astro y no Next.** El sitio es contenido mayormente estático — casos de QA, proyectos, una página "Sobre mí" — sin estado de cliente que justifique un framework de aplicación. Astro renderiza a HTML por defecto y solo envía JavaScript donde hay interactividad real (el toggle de tema), lo que mantiene el sitio liviano y el TTI bajo sin esfuerzo extra. Next tiene sentido cuando hay rutas dinámicas con datos que cambian por request o un dashboard interactivo; acá no hay ninguna de las dos cosas.

**El idioma vive en la URL (`/es/`, `/en/`), no en un toggle que reemplaza texto por JS.** Cada idioma es una ruta real, indexable por separado, con su propia etiqueta `hreflang` apuntando a la equivalente. Un toggle que sustituye el DOM del lado del cliente rompe el deep-linking (compartir un link no comparte el idioma), es peor para SEO, y obliga a duplicar todo el contenido en memoria del cliente en vez de dejar que el servidor (o el build estático, en este caso) resuelva qué versión servir.

**No hay React en el layout, solo en islands puntuales.** El toggle de tema es el único componente que necesita estado de cliente e interactividad real; todo lo demás — navegación, tarjetas de casos, layout de detalle — es HTML estático de Astro. Meter React en el árbol de render de páginas que no lo necesitan agrega hidratación, bundle y superficie de bugs sin ningún beneficio: la regla del proyecto es "React solo donde hay una razón concreta para pagar su costo".

**No hay formulario de contacto.** Un formulario implica un backend (o un servicio de terceros) para recibir los envíos, superficie para spam, y una promesa implícita de respuesta rápida que compite con la búsqueda laboral activa que este sitio representa. La página de contacto muestra el email (copiable con un botón, con aviso si falla la copia), LinkedIn y GitHub — canales que ya uso y reviso, sin intermediario ni mantenimiento adicional.

## Cómo correrlo

```bash
npm install
npm run dev
```

El servidor de desarrollo queda en `http://localhost:4321`.

## Cómo correr los tests

```bash
npm run check        # tipos (Astro Check) — el gate real, no el build
npm run test:unit    # Vitest
npm run test:e2e      # Playwright, los 4 navegadores
npm run test:e2e -- --project=chromium   # una sola corrida, más rápida para iterar
npm run test:e2e -- --ui                  # modo interactivo
```

## Cómo agregar un caso

Un caso de QA nuevo son **dos archivos con el mismo slug**, uno por idioma:

- `src/content/casos-qa/es/<slug>.md` (o `.mdx` si necesita componentes, como `suite-e2e-portfolio.mdx`)
- `src/content/casos-qa/en/<slug>.md`

Los slugs tienen que ser idénticos entre ambos idiomas — hay un test que lo verifica (`tests/e2e/casos.spec.ts`, "el cambio de idioma preserva el caso abierto").

Frontmatter (ver `src/content.config.ts` para el schema completo):

| Campo | Qué es |
|---|---|
| `titulo` | Título del caso, string no vacío. |
| `resumen` | Bajada de 20 a 200 caracteres — se usa en tarjetas de listado. |
| `tags` | Array de al menos un valor, limitado a un enum fijo (`manual`, `automation`, `e2e`, `api`, `exploratorio`, `regresion`, `accesibilidad`, `performance`, `mobile`). |
| `stack` | Array de strings libres con las herramientas usadas. |
| `fecha` | Fecha del caso (se coacciona a `Date`). |
| `destacado` | Booleano; si es `true`, aparece en la home. Default `false`. |
| `estado` | `completo` o `en-progreso`. |
| `ejemplo` | Booleano; `true` mientras el contenido sea de muestra — dispara el banner de aviso. Default `false`. |
| `repo` / `demo` | URLs opcionales. |

El cuerpo tiene seis bloques fijos, en este orden (ver cualquier caso existente en `src/content/casos-qa/` como referencia):

1. **Contexto** — quién pidió qué y bajo qué restricciones.
2. **Estrategia de prueba** — qué se priorizó, qué se descartó y por qué.
3. **Ejecución** — cómo se llevó a cabo.
4. **Hallazgos** — qué se encontró (bugs, riesgos, evidencia).
5. **Automatización** — qué se automatizó, o por qué conscientemente no.
6. **Resultado y aprendizajes** — cómo terminó y qué se aprendió.

Un proyecto del carril `/dev` sigue el mismo patrón (mismo slug en `src/content/proyectos/es/` y `en/`), con un frontmatter más chico (sin `tags` ni `estado`) y tres bloques: Descripción, Motivación, Estado actual.

## Antes de publicar

Este sitio no está listo para mostrarse como definitivo todavía. Antes de linkearlo desde un CV real:

1. Correr `npm run check:listo` hasta que dé verde — hoy falla a propósito porque queda contenido de ejemplo.
2. Reemplazar los tres casos de QA de ejemplo por casos reales.
3. Reemplazar el proyecto de ejemplo del carril `/dev`.
4. Escribir el texto real de "Sobre mí" y quitar su banner de ejemplo.
5. Reemplazar `public/cv/cv-es.pdf` y `public/cv/cv-en.pdf` por el CV real.
6. Verificar que las URLs de LinkedIn y GitHub en `ContactContent.astro` y `Footer.astro` sean las correctas.

## Método de trabajo

Este repo se construyó con spec y plan escritos antes de tocar código, con criterios de verificación explícitos por tarea:

- **Spec:** [`docs/superpowers/specs/2026-07-27-portfolio-qa-design.md`](docs/superpowers/specs/2026-07-27-portfolio-qa-design.md) — qué se construye y por qué.
- **Plan:** [`docs/superpowers/plans/2026-07-27-portfolio-qa.md`](docs/superpowers/plans/2026-07-27-portfolio-qa.md) — 14 tareas, cada una con su código y sus tests.

Quedan públicos a propósito: son una muestra de método de trabajo, no solo de resultado.

## Despliegue

El sitio está pensado para desplegarse en Vercel como sitio estático (`vercel.json` en la raíz define `buildCommand`, `outputDirectory: dist` y el framework). El despliegue en sí y la actualización del dominio en `astro.config.mjs` (`site`, usado por el sitemap y las etiquetas `hreflang`) quedan pendientes de un paso manual fuera de este repo.
