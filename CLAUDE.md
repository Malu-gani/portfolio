# Portfolio personal QA

Sitio estático bilingüe (ES/EN) que funciona como carta de presentación para una búsqueda laboral activa en QA. Dos carriles: `/qa` es el principal, `/dev` es secundario y deliberadamente más chico.

## Stack

Astro 7 (`output: 'static'`) · React 19 solo en islands · Tailwind 4 con configuración CSS-first · TypeScript strict · Playwright · axe-core · Vitest. Node 22.12+.

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run check        # tipos — astro build NO chequea tipos en .tsx
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (agregar -- --project=chromium para una sola corrida)
npm run build
npm run check:listo  # falla mientras quede contenido con `ejemplo: true`
```

## Convenciones que no se negocian

- **TypeScript strict**, sin `any`. El gate es `npm run check`, no el build.
- **Colores solo por tokens semánticos** (`bg`, `surface`, `text`, `muted`, `border`, `accent`, `sev-*`, `est-*`). Nunca hexadecimales sueltos.
- **Severidad y estado nunca se comunican solo por color**: siempre color + ícono + texto.
- **`data-testid` en todo lo verificable.** Los tests seleccionan por `data-testid` o por rol, nunca por clase de Tailwind ni por texto visible (el texto cambia según idioma).
- **Selectores CSS solo dentro de `tests/e2e/pages/`.** `getByTestId` y `getByRole` sí van en los specs.
- **Las páginas espejo ES/EN no duplican contenido**: delegan en un componente compartido que recibe `lang` (ver `HomeContent.astro`, `QaListado.astro`).
- **El idioma vive en la URL** (`/es/`, `/en/`), no en un toggle que reemplaza textos por JS.
- **Contenido:** agregar un caso es crear dos `.md` con el mismo slug en `src/content/casos-qa/es/` y `en/`. Los slugs tienen que ser idénticos en ambos idiomas; hay un test que lo verifica.
- Mensajes de commit en español, formato Conventional Commits.

## Dónde está el contexto

- **Spec:** `docs/superpowers/specs/2026-07-27-portfolio-qa-design.md` — qué se construye y por qué.
- **Plan:** `docs/superpowers/plans/2026-07-27-portfolio-qa.md` — 14 tareas con su código y sus tests.
- **Estado de ejecución:** `.superpowers/sdd/2026-07-27-portfolio-qa/progress.md` — gitignoreado, solo local. Su encabezado explica cómo retomar el trabajo. **Leerlo antes de tocar nada**: dice qué tareas están terminadas y cuál sigue.

## Contenido de ejemplo

Todo el contenido actual lleva `ejemplo: true` en el frontmatter y está pendiente de reemplazo por material real. Se renderiza con un aviso visible al visitante. Antes de publicar, `npm run check:listo` tiene que dar verde.
