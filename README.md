[![CI](https://github.com/Malu-gani/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Malu-gani/portfolio/actions/workflows/ci.yml)

# Portfolio personal QA

Portfolio bilingüe (ES/EN) de **Juan Manuel Malugani**, carta de presentación para una búsqueda laboral activa en QA. Es un sitio estático construido con Astro y probado como cualquier otro producto.

- **Sitio publicado:** <https://portfolio-lovat-five-65.vercel.app>
- **Reportes de Playwright de `main`:** [Chromium](https://malu-gani.github.io/portfolio/reporte/playwright-report-chromium/) · [Firefox](https://malu-gani.github.io/portfolio/reporte/playwright-report-firefox/) · [WebKit](https://malu-gani.github.io/portfolio/reporte/playwright-report-webkit/) · [mobile](https://malu-gani.github.io/portfolio/reporte/playwright-report-mobile/)

## Qué hay en el sitio

La home reúne en una página: presentación, Sobre mí, Proyectos, el tablero de QA y backlog en vivo, Stack, Formación, Contacto y "Reportar un problema".

QA pesa más que desarrollo, a propósito: el listado de proyectos arranca filtrado en QA, y desarrollo muestra que además de probar puedo escribir el código que se prueba.

| Español | Inglés | Contenido |
|---|---|---|
| `/es/` | `/en/` | Home |
| `/es/proyectos` | `/en/projects` | Casos de QA (también `…/dev` y, para ver todo, `/es/proyectos/todos` y `/en/projects/all`) |
| `/es/qa/<slug>` | `/en/qa/<slug>` | Detalle de un caso de QA |
| `/es/dev/<slug>` | `/en/dev/<slug>` | Detalle de un proyecto de desarrollo |
| `/es/sobre-mi` | `/en/about` | Sobre mí |
| `/es/contacto` | `/en/contact` | Contacto y CV |

`/es/qa`, `/es/dev` y sus pares en inglés redirigen a los listados.

## Stack

Astro 7 (salida estática) · React 19 solo en dos islands · Tailwind 4 · TypeScript estricto · MDX · Playwright · axe-core · Vitest · Lighthouse · GitHub Actions · Vercel. Node 22.19 o superior.

## Cómo está verificado

| Qué | Comando | Qué cubre |
|---|---|---|
| Tipos | `npm run check` | Astro Check. `astro build` no verifica los tipos de los `.tsx`, por eso es un paso aparte. |
| Unitarios | `npm run test:unit` | Lógica de datos, paridad del contenido entre idiomas y textos escritos a mano que tienden a quedar viejos (CV, cifras de los casos, este README). |
| End-to-end | `npm run test:e2e` | Playwright con Page Object Model en Chromium, Firefox, WebKit y un perfil mobile (Pixel 7): navegación, idioma, tema, filtros, detalles, contacto y descarga del CV, reporte de problemas, tablero de QA y enlaces. |
| Accesibilidad | dentro de la suite E2E | axe-core con las reglas WCAG 2.0 y 2.1 A y AA en todas las rutas, en tema claro y oscuro, más el orden de encabezados y la navegación por teclado. |
| Regresión visual | dentro de la suite E2E | Capturas de las páginas principales en ambos temas, solo en Chromium y solo en local. |
| Lighthouse | `npm run test:lighthouse` | Sobre el build, en la home y el listado en español: rendimiento, buenas prácticas y SEO desde 90, accesibilidad en 100. |
| Contenido | `npm run check:listo` | Falla si queda contenido de ejemplo. |

Las rutas que recorren las pruebas de accesibilidad y de enlaces salen del filesystem ([`tests/e2e/utils/rutas.ts`](tests/e2e/utils/rutas.ts)): una página o un caso nuevo queda cubierto sin tocar la suite.

La regresión visual no corre en CI porque las capturas quedan atadas al sistema operativo donde se generaron (sufijo `-win32`): en el runner Linux no hay referencia válida contra la que comparar. Los enlaces externos también se saltan en CI, porque dependen de servicios de terceros.

### En CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) corre en cada pull request a `main` y en cada push a `main`:

1. Un job con tipos, unitarios, build, Lighthouse y control de contenido.
2. Si pasa, un job por navegador con `--workers=1`.
3. En `main`, la publicación de los cuatro reportes en GitHub Pages.

## Diagnósticos que vale la pena leer

El detalle, con la evidencia y las alternativas descartadas, está en [`docs/cross-browser-diagnostico.md`](docs/cross-browser-diagnostico.md).

**Un crash de WebKit que diagnostiqué mal la primera vez.** Al navegar de un listado al detalle, el proceso de render de WebKit se caía. Primero lo atribuí a un par de rutas puntual y lo tapé forzando la recarga completa en ese enlace. La causa real apareció después en otro listado: se cae cuando la transición va de una página que no es contenedor de scroll a una que sí lo es. El arreglo es `overflow-y: scroll` en `html`, la recarga forzada se quitó y [`tests/e2e/navegacion.spec.ts`](tests/e2e/navegacion.spec.ts) verifica esa condición en cada ruta.

**Un "servidor saturado" que no lo estaba.** Los rechazos de conexión intermitentes de Firefox en local se debían a que, en Windows, el servidor de prueba escuchaba en una sola de las dos direcciones de `localhost`. La suite usa `127.0.0.1` y [`tests/unit/playwright-config.test.ts`](tests/unit/playwright-config.test.ts) fija que servidor y pruebas coincidan.

**Una limitación conocida y aceptada.** Con la configuración de fábrica de Safari, los enlaces no se alcanzan tabulando: es el comportamiento por defecto del navegador. Entre los enlaces, solo el de salto al contenido lleva `tabindex="0"`, porque inalcanzable por teclado no cumpliría su función.

## Decisiones técnicas

**Astro y no Next.** El sitio es contenido estático, sin datos que cambien por request ni un panel interactivo. Astro genera HTML y solo envía JavaScript donde hace falta.

**El idioma vive en la URL (`/es/`, `/en/`).** Cada idioma es una ruta real, indexable, con su `hreflang`. Reemplazar textos en el cliente impediría compartir un enlace en un idioma determinado.

**React solo en dos islands:** el cambio de tema (`ThemeToggle.tsx`) y el botón de copiar el email (`CopyEmail.tsx`). El resto es HTML de Astro, con scripts sin framework para los filtros, el resaltado del menú y la aparición de las secciones.

**Sin formulario de contacto.** Necesitaría un backend o un tercero, y puede fallar en silencio. En su lugar: email copiable, LinkedIn y GitHub. Para reportar un problema del sitio, un enlace a una plantilla de Issue de GitHub y la misma plantilla para copiar.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local
npm run dev
```

El servidor de desarrollo queda en `http://localhost:4321`.

Antes de compilar hay que completar `NOTION_TOKEN` en `.env.local`: el tablero de QA consulta Notion durante el build, con un token que tenga acceso a las bases de este portfolio. Sin él, el build falla, y también la suite E2E, que compila antes de probar.

## Cómo correr las pruebas

```bash
npx playwright install                      # la primera vez
npm run check
npm run test:unit
npm run test:e2e                            # los cuatro navegadores
npm run test:e2e -- --project=chromium      # uno solo, para iterar
npm run build                               # Lighthouse mide sobre el build
npm run test:lighthouse
```

Conviene cerrar `npm run dev` antes de la suite E2E: Playwright reusa lo que esté escuchando en el puerto 4321 y probaría el servidor de desarrollo en lugar del build.

## Cómo agregar un caso

Un caso de QA son **dos archivos con el mismo slug**, uno por idioma:

- `src/content/casos-qa/es/<slug>.md` (o `.mdx` si usa componentes, como `suite-e2e-portfolio.mdx`)
- `src/content/casos-qa/en/<slug>.md`

[`tests/unit/contenido.test.ts`](tests/unit/contenido.test.ts) falla si falta una de las dos versiones o si sus métricas difieren.

Frontmatter (el esquema completo está en [`src/content.config.ts`](src/content.config.ts)):

| Campo | Qué es |
|---|---|
| `titulo` | Título del caso. |
| `resumen` | Bajada de 20 a 200 caracteres, la que muestran las tarjetas. |
| `tags` | Al menos uno de: `manual`, `automation`, `e2e`, `api`, `exploratorio`, `regresion`, `accesibilidad`, `performance`, `mobile`. |
| `stack` | Herramientas usadas, al menos una. |
| `fecha` | Fecha del caso. Se muestra en UTC. |
| `destacado` | Los destacados van primero en los listados. Por defecto `false`. |
| `estado` | `completo` o `en-progreso`. |
| `ejemplo` | `true` mientras el contenido sea de muestra: muestra un aviso y bloquea el CI. Por defecto `false`. |
| `metricas` | Opcional, hasta tres pares `etiqueta` y `valor`. |
| `repo` / `demo` | URLs opcionales. |

El cuerpo sigue seis bloques: **Contexto**, **Estrategia de prueba**, **Ejecución**, **Hallazgos**, **Automatización** y **Resultado y aprendizajes**.

Un proyecto de desarrollo va en `src/content/proyectos/` con el mismo criterio de dos idiomas y sin `tags` ni `estado`.

### Qué actualizar junto con el contenido

- La cantidad de casos y proyectos que fijan [`tests/e2e/home.spec.ts`](tests/e2e/home.spec.ts) y [`tests/e2e/proyectos.spec.ts`](tests/e2e/proyectos.spec.ts).
- La cantidad de rutas que declara el caso de la suite del portfolio (una prueba unitaria lo exige).
- Las capturas de las páginas que cambiaron, solo esas y revisando la diferencia:

```bash
npx playwright test tests/e2e/visual.spec.ts --project=chromium -g "es/proyectos en tema" --update-snapshots=all
```

Sin `=all`, un cambio que queda bajo el margen de tolerancia no reescribe la captura y la referencia queda vieja.

## CV

Los PDF de `public/cv/` se generan desde `scripts/cv/` con `node scripts/gen-cv-pdfs.cjs`. [`tests/unit/cv.test.ts`](tests/unit/cv.test.ts) comprueba que el CV no contradiga al sitio.

## Método de trabajo

El proyecto arrancó con especificación y plan escritos antes del código, con criterios de verificación por tarea:

- [Especificación inicial](docs/superpowers/specs/2026-07-27-portfolio-qa-design.md) y [plan inicial](docs/superpowers/plans/2026-07-27-portfolio-qa.md).
- Los tramos siguientes, en [`docs/superpowers/specs/`](docs/superpowers/specs/) y [`docs/superpowers/plans/`](docs/superpowers/plans/).

Esos documentos reflejan lo que se sabía en su momento; el estado actual es el del código y este README. Quedan públicos como muestra de método.

## Despliegue

Vercel publica `main` en producción y genera una vista previa por pull request. [`vercel.json`](vercel.json) define las redirecciones y las cabeceras de seguridad; la URL del sitio se declara en [`astro.config.mjs`](astro.config.mjs).
