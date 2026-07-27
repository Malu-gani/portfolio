# Portfolio QA — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un portfolio personal bilingüe ES/EN, estático y accesible, con dos carriles (`/qa` dominante y `/dev` secundario), testeado por su propia suite E2E corriendo en CI.

**Architecture:** Astro 5 en modo estático puro compila todo a HTML servido desde CDN. El idioma vive en la URL mediante carpetas espejo (`/es/`, `/en/`). El contenido son archivos Markdown en dos colecciones validadas por esquema Zod, de modo que publicar un caso nuevo no requiere tocar código. El sistema visual usa tokens CSS semánticos, lo que permite el toggle claro/oscuro sin duplicar estilos. La suite Playwright vive en el mismo repo y es a la vez garantía de calidad y pieza del portfolio.

**Tech Stack:** Astro 7, React 19 (solo islands), TypeScript (strict), Tailwind CSS 4, Vitest, Playwright, @axe-core/playwright, Lighthouse CI, GitHub Actions, Vercel.

## Global Constraints

- **Node.js 22.12 o superior** (requisito de Astro 7; local hay v24.14.1). El proyecto usa ESM en todos los archivos de configuración. El CI debe declarar Node 22 o mayor: un runtime viejo en el host es la forma más común de que un build que pasa en local falle al desplegar.
- **Astro 7** con `output: 'static'`. Nunca cambiar a SSR: no hay backend en este proyecto.
- **Zod se importa desde `astro/zod`, no desde `astro:content`.** Astro 7 usa Zod 4, donde los validadores de string son funciones de primer nivel: `z.url()` en vez de `z.string().url()`, `z.email()` en vez de `z.string().email()`.
- **El compilador Rust de Astro 7 es estricto con el HTML.** Toda etiqueta no vacía debe cerrarse explícitamente y el HTML semánticamente inválido ya no se autocorrige: un `<div>` sin cerrar o un `<p>` anidando un `<div>` ahora es un error de compilación, no una advertencia.
- **TypeScript en modo `strict`** (`astro/tsconfigs/strict`). No usar `any`. El gate es `npm run check` (`astro check`), que corre en CI: `astro build` **no** verifica tipos en archivos `.tsx` porque Vite los borra sin chequearlos.
- **Tailwind CSS 4** vía plugin de Vite (`@tailwindcss/vite`). No existe `tailwind.config.js`: la configuración es CSS-first mediante `@theme inline` en `src/styles/global.css`.
- **La interactividad se implementa como islands de React** (`.tsx` con `client:load`). Todo lo demás es `.astro` estático. Un componente solo se vuelve island si tiene estado o maneja eventos: si únicamente renderiza, va en `.astro`.
- **Fuentes servidas localmente** con paquetes `@fontsource-variable`. Prohibido enlazar Google Fonts u otro CDN de fuentes.
- **Todo elemento interactivo o verificable lleva `data-testid`.** Los selectores de Playwright usan exclusivamente `data-testid`; nunca clases de Tailwind ni texto visible (el texto cambia según idioma).
- **Los tests E2E usan Page Object Model.** Ningún `page.locator(...)` fuera de `tests/e2e/pages/`.
- **Los slugs de contenido son idénticos en ambos idiomas.** `src/content/casos-qa/es/mi-caso.md` exige `src/content/casos-qa/en/mi-caso.md`. Hay un test que lo verifica.
- **WCAG AA como mínimo, en ambos temas**, verificado por axe-core en CI.
- **Severidad y estado nunca se comunican solo por color:** siempre color + ícono + texto.
- **Todo contenido de ejemplo lleva `ejemplo: true` en el frontmatter** y se renderiza con un aviso visible. El script `npm run check:listo` falla si queda alguno.
- **Mensajes de commit en español, formato Conventional Commits** (`feat:`, `test:`, `docs:`, `chore:`, `style:`).

## Nota sobre el uso de React

El spec (sección 3) prevé islands de React para el toggle de tema, el de idioma y los futuros filtros. Este plan los implementa así, con dos precisiones:

1. **El toggle de idioma queda como `.astro`.** No es una excepción por conveniencia: es un enlace `<a href>` cuya URL destino se calcula al compilar. No tiene estado ni maneja eventos, así que no hay nada que hidratar. Envolverlo en React agregaría un componente cliente que solo renderizaría un link.
2. **El script inline anti-parpadeo del `<head>` es obligatorio igual.** React hidrata después del primer pintado, así que sin ese script se vería un destello blanco al entrar en modo oscuro. El island de React lee el tema que ese script ya dejó puesto en `<html data-theme>`, y a partir de ahí lo gobierna.

Componentes que son islands de React: `ThemeToggle.tsx` y `CopyEmail.tsx`. Todo el resto es `.astro`.

---

## Estructura de archivos

```
astro.config.mjs             Config de Astro: site, static, sitemap, Tailwind
tsconfig.json                TS strict
package.json                 Scripts: dev, build, preview, test, test:e2e, check:listo
playwright.config.ts         Proyectos por navegador, webServer, reporter HTML
vitest.config.ts             Tests unitarios de i18n
lighthouserc.json            Umbrales de performance/a11y/SEO
.github/workflows/ci.yml     build → unit → e2e → a11y → lighthouse
scripts/check-listo.mjs      Falla si queda contenido con ejemplo:true
public/
  cv/cv-es.pdf, cv-en.pdf    CV descargable por idioma
src/
  content.config.ts          Esquemas Zod de las dos colecciones
  content/
    casos-qa/es/*.md · en/*.md
    proyectos/es/*.md · en/*.md
  i18n/
    ui.ts                    Diccionarios de textos de interfaz
    routes.ts                Mapa de slugs de sección por idioma
    utils.ts                 getLang, useTranslations, getAlternateUrl
  styles/global.css          Tokens semánticos + @theme inline de Tailwind
  layouts/
    BaseLayout.astro         html/head/body, hreflang, script anti-parpadeo
    CaseLayout.astro         Envoltorio de páginas de detalle
  components/
    Header.astro  Footer.astro  LangToggle.astro
    ThemeToggle.tsx  CopyEmail.tsx          ← islands de React
    Hero.astro  StackGrid.astro  CvButton.astro
    CasoCard.astro  ProyectoCard.astro  Tag.astro  EjemploBanner.astro
    BugReport.astro  TestMatrix.astro  Metricas.astro
  pages/
    index.astro              Redirección a /es/
    es/index.astro  es/qa/index.astro  es/qa/[...slug].astro
    es/dev/index.astro  es/dev/[...slug].astro  es/sobre-mi.astro  es/contacto.astro
    en/index.astro  en/qa/index.astro  en/qa/[...slug].astro
    en/dev/index.astro  en/dev/[...slug].astro  en/about.astro  en/contact.astro
tests/
  unit/i18n.test.ts
  e2e/
    pages/BasePage.ts  HomePage.ts  QaPage.ts  CasoPage.ts  ContactoPage.ts
    smoke.spec.ts  tema.spec.ts  idioma.spec.ts  navegacion.spec.ts
    casos.spec.ts  contacto.spec.ts  enlaces.spec.ts  a11y.spec.ts  visual.spec.ts
```

---

### Task 1: Scaffold del proyecto con smoke test

Levanta el esqueleto de Astro, Tailwind y Playwright, y deja un test verde que prueba que el pipeline completo (build → preview → test) funciona.

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `playwright.config.ts`, `.gitignore`
- Create: `src/pages/es/index.astro`, `src/styles/global.css`
- Test: `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: nada (primera tarea)
- Produces: proyecto Astro ejecutable con `npm run dev` en `http://localhost:4321` y `npm run preview` en `http://localhost:4321`; comando `npm run test:e2e`

- [ ] **Step 1: Crear el proyecto y las dependencias**

```bash
cd C:/Users/maluganiJ/Desktop/proyects/portoflio
npm create astro@latest . -- --template minimal --no-install --no-git --skip-houston --typescript strict
npm install
npm install tailwindcss @tailwindcss/vite @astrojs/sitemap
npx astro add react --yes
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
npm install -D @playwright/test @axe-core/playwright vitest
npx playwright install chromium firefox webkit
```

El flag `--with-deps` se omite a propósito: instala librerías de sistema con `apt` y solo aplica en Linux. En el CI (Task 13), que corre sobre Ubuntu, sí se usa.

- [ ] **Step 2: Configurar Astro**

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://portfolio.vercel.app',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

Este archivo sobrescribe lo que dejó `astro add react`, así que la integración de React tiene que estar declarada acá explícitamente.

- [ ] **Step 3: Crear la hoja de estilos base**

`src/styles/global.css`:

```css
@import 'tailwindcss';
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';
```

- [ ] **Step 4: Crear la página mínima**

`src/pages/es/index.astro`:

```astro
---
import '../../styles/global.css';
---
<html lang="es">
  <head><meta charset="utf-8" /><title>Portfolio</title></head>
  <body><h1 data-testid="titulo">Portfolio</h1></body>
</html>
```

- [ ] **Step 5: Configurar Playwright**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: { baseURL: 'http://localhost:4321', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 6: Escribir el smoke test (falla)**

`tests/e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('la home en español responde y renderiza el título', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.getByTestId('titulo')).toBeVisible();
});
```

- [ ] **Step 7: Agregar los scripts a package.json**

Dentro de `"scripts"`:

```json
"dev": "astro dev",
"build": "astro build",
"preview": "astro preview --port 4321",
"test:e2e": "playwright test",
"test:unit": "vitest run"
```

- [ ] **Step 8: Correr el smoke test**

Run: `npm run test:e2e -- --project=chromium`
Expected: PASS, 1 test.

Si falla con "port already in use", cerrar procesos de Node previos y reintentar.

- [ ] **Step 9: Crear .gitignore y commitear**

`.gitignore`:

```
node_modules/
dist/
.astro/
test-results/
playwright-report/
.vercel/
.DS_Store
```

```bash
git add -A
git commit -m "chore: scaffold de Astro con Tailwind y Playwright"
```

---

### Task 2: Sistema de tokens y tema claro/oscuro

Define los tokens semánticos de color en ambos temas y el toggle sin parpadeo, con test que verifica la persistencia entre recargas.

**Files:**
- Modify: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`, `src/components/ThemeToggle.tsx`
- Modify: `src/pages/es/index.astro`
- Test: `tests/e2e/tema.spec.ts`, `tests/e2e/pages/BasePage.ts`

**Interfaces:**
- Consumes: `src/styles/global.css` (Task 1)
- Produces:
  - `BaseLayout.astro` con props `{ lang: 'es' | 'en'; title: string; description: string }`
  - Atributo `data-theme="light" | "dark"` en `<html>`
  - `data-testid`: `theme-toggle`
  - Clases Tailwind disponibles: `bg-bg`, `bg-surface`, `text-text`, `text-muted`, `border-border`, `text-accent`, `bg-accent`

- [ ] **Step 1: Escribir el Page Object base**

`tests/e2e/pages/BasePage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';

export type Lang = 'es' | 'en';

export class BasePage {
  readonly themeToggle: Locator;
  readonly langToggle: Locator;
  readonly nav: Locator;

  constructor(protected readonly page: Page) {
    this.themeToggle = page.getByTestId('theme-toggle');
    this.langToggle = page.getByTestId('lang-toggle');
    this.nav = page.getByTestId('nav-principal');
  }

  async temaActual(): Promise<string | null> {
    return this.page.locator('html').getAttribute('data-theme');
  }

  async alternarTema(): Promise<void> {
    await this.themeToggle.click();
  }

  async recargar(): Promise<void> {
    await this.page.reload();
  }
}
```

- [ ] **Step 2: Escribir los tests de tema (fallan)**

`tests/e2e/tema.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { BasePage } from './pages/BasePage';

test.describe('Toggle de tema', () => {
  test('arranca en claro cuando el sistema prefiere claro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    expect(await new BasePage(page).temaActual()).toBe('light');
  });

  test('arranca en oscuro cuando el sistema prefiere oscuro', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/es/');
    expect(await new BasePage(page).temaActual()).toBe('dark');
  });

  test('la elección manual persiste al recargar', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/es/');
    const base = new BasePage(page);
    await base.alternarTema();
    expect(await base.temaActual()).toBe('dark');
    await base.recargar();
    expect(await base.temaActual()).toBe('dark');
  });
});
```

- [ ] **Step 3: Correr los tests para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/tema.spec.ts`
Expected: FAIL — el locator `theme-toggle` no existe.

- [ ] **Step 4: Definir los tokens**

Reemplazar `src/styles/global.css` por:

```css
@import 'tailwindcss';
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';

:root,
[data-theme='light'] {
  --bg: #ffffff;
  --surface: #f6f8fa;
  --text: #0b0f14;
  --text-muted: #5a6672;
  --border: #e3e8ee;
  --accent: #0f766e;
  --sev-critico: #b42318;
  --sev-alto: #c2410c;
  --sev-medio: #a16207;
  --sev-bajo: #3f6212;
  --est-paso: #15803d;
  --est-fallo: #b42318;
  --est-bloqueado: #57534e;
}

[data-theme='dark'] {
  --bg: #0b0f14;
  --surface: #141a21;
  --text: #e6edf3;
  --text-muted: #9aa7b4;
  --border: #242c35;
  --accent: #2dd4bf;
  --sev-critico: #ff6b6b;
  --sev-alto: #fb923c;
  --sev-medio: #fbbf24;
  --sev-bajo: #a3e635;
  --est-paso: #4ade80;
  --est-fallo: #ff6b6b;
  --est-bloqueado: #a8a29e;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-text: var(--text);
  --color-muted: var(--text-muted);
  --color-border: var(--border);
  --color-accent: var(--accent);
  --color-sev-critico: var(--sev-critico);
  --color-sev-alto: var(--sev-alto);
  --color-sev-medio: var(--sev-medio);
  --color-sev-bajo: var(--sev-bajo);
  --color-est-paso: var(--est-paso);
  --color-est-fallo: var(--est-fallo);
  --color-est-bloqueado: var(--est-bloqueado);
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;

  --text-base: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
  --text-lg: clamp(1.125rem, 1.06rem + 0.3vw, 1.25rem);
  --text-2xl: clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem);
  --text-3xl: clamp(1.75rem, 1.45rem + 1.4vw, 2.25rem);
  --text-4xl: clamp(2.125rem, 1.7rem + 2vw, 3rem);
  --text-5xl: clamp(2.5rem, 1.9rem + 3vw, 3.75rem);
}

html { color-scheme: light dark; }
[data-theme='dark'] { color-scheme: dark; }

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) {
    animation: none !important;
  }
}
```

Los tamaños con `clamp()` sobrescriben la escala de Tailwind: `text-4xl` pasa a ser fluido entre 2.125rem y 3rem según el ancho del viewport, sin necesidad de breakpoints. El bloque de `prefers-reduced-motion` cancela también las transiciones de vista, que se activan en la Task 4.

- [ ] **Step 5: Crear el island de toggle de tema**

`src/components/ThemeToggle.tsx`:

```tsx
import { useEffect, useState } from 'react';

type Tema = 'light' | 'dark';

interface Props {
  etiqueta: string;
}

export default function ThemeToggle({ etiqueta }: Props) {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema((document.documentElement.dataset.theme as Tema | undefined) ?? 'light');
  }, []);

  function alternar(): void {
    const nuevo: Tema = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nuevo;
    localStorage.setItem('theme', nuevo);
    setTema(nuevo);
  }

  return (
    <button
      type="button"
      data-testid="theme-toggle"
      aria-label={etiqueta}
      aria-pressed={tema === 'dark'}
      onClick={alternar}
      className="rounded-md border border-border p-2 text-text hover:bg-surface"
    >
      <span aria-hidden="true">{tema === 'dark' ? '☾' : '☀'}</span>
    </button>
  );
}
```

El estado arranca en `null` y se completa en el `useEffect` a propósito. Si se inicializara leyendo `document` directamente, el HTML generado en compilación y el primer render del cliente diferirían y React tiraría un error de hidratación. Con `null`, ambos coinciden y el ícono correcto aparece en el siguiente frame.

La fuente de verdad del tema es el atributo `data-theme` del `<html>`, no el estado de React: el estado solo refleja el ícono. Así el script inline del `<head>` y el island nunca se contradicen.

- [ ] **Step 6: Crear el layout con el script anti-parpadeo**

`src/layouts/BaseLayout.astro`:

```astro
---
import '../styles/global.css';
interface Props { lang: 'es' | 'en'; title: string; description: string }
const { lang, title, description } = Astro.props;
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <script is:inline>
      (() => {
        const guardado = localStorage.getItem('theme');
        const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = guardado ?? (prefiereOscuro ? 'dark' : 'light');
      })();
    </script>
  </head>
  <body class="bg-bg text-text">
    <slot />
  </body>
</html>
```

El script va `is:inline` y antes del `<body>` a propósito: se ejecuta de forma bloqueante, así el atributo `data-theme` ya está puesto cuando el navegador pinta el primer frame. Sin eso, se ve un destello blanco al entrar en modo oscuro.

- [ ] **Step 7: Usar el layout en la home**

`src/pages/es/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ThemeToggle from '../../components/ThemeToggle.tsx';
---
<BaseLayout lang="es" title="Portfolio" description="Portfolio QA">
  <ThemeToggle etiqueta="Cambiar tema" client:load />
  <h1 data-testid="titulo">Portfolio</h1>
</BaseLayout>
```

`client:load` hidrata el island apenas carga la página. Es la directiva correcta acá: el toggle está en la cabecera, visible de entrada, y con `client:visible` habría una ventana en la que el botón está a la vista pero no responde al clic.

- [ ] **Step 8: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/tema.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: sistema de tokens de color y toggle de tema sin parpadeo"
```

---

### Task 3: Utilidades de internacionalización

Diccionarios de textos y la lógica de equivalencia de rutas entre idiomas, con tests unitarios.

**Files:**
- Create: `src/i18n/ui.ts`, `src/i18n/routes.ts`, `src/i18n/utils.ts`, `vitest.config.ts`
- Test: `tests/unit/i18n.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - `type Lang = 'es' | 'en'`, `defaultLang: Lang`, `languages: Record<Lang, string>`
  - `getLangFromUrl(url: URL): Lang`
  - `useTranslations(lang: Lang): (key: keyof typeof ui['es']) => string`
  - `getAlternateUrl(pathname: string, destino: Lang): string`
  - `type SeccionKey = 'qa' | 'dev' | 'about' | 'contact'`
  - `rutas: Record<SeccionKey, Record<Lang, string>>` — ruta absoluta por sección e idioma

- [ ] **Step 1: Configurar Vitest**

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
```

- [ ] **Step 2: Escribir los tests unitarios (fallan)**

`tests/unit/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations, getAlternateUrl } from '../../src/i18n/utils';

describe('getLangFromUrl', () => {
  it('detecta español', () => {
    expect(getLangFromUrl(new URL('https://x.com/es/qa'))).toBe('es');
  });
  it('detecta inglés', () => {
    expect(getLangFromUrl(new URL('https://x.com/en/about'))).toBe('en');
  });
  it('cae al idioma por defecto si la ruta no tiene prefijo', () => {
    expect(getLangFromUrl(new URL('https://x.com/'))).toBe('es');
  });
});

describe('useTranslations', () => {
  it('devuelve el texto en el idioma pedido', () => {
    expect(useTranslations('en')('nav.qa')).toBe('QA');
    expect(useTranslations('es')('nav.sobre')).toBe('Sobre mí');
    expect(useTranslations('en')('nav.sobre')).toBe('About');
  });
});

describe('getAlternateUrl', () => {
  it('traduce la home', () => {
    expect(getAlternateUrl('/es/', 'en')).toBe('/en/');
  });
  it('mantiene secciones de slug compartido', () => {
    expect(getAlternateUrl('/es/qa', 'en')).toBe('/en/qa');
  });
  it('traduce secciones de slug distinto', () => {
    expect(getAlternateUrl('/es/sobre-mi', 'en')).toBe('/en/about');
    expect(getAlternateUrl('/en/contact', 'es')).toBe('/es/contacto');
  });
  it('preserva el slug del caso al cambiar de idioma', () => {
    expect(getAlternateUrl('/es/qa/mi-caso', 'en')).toBe('/en/qa/mi-caso');
  });
  it('tolera la barra final', () => {
    expect(getAlternateUrl('/es/qa/mi-caso/', 'en')).toBe('/en/qa/mi-caso');
  });
  it('cae a la home del idioma destino si la sección es desconocida', () => {
    expect(getAlternateUrl('/es/inexistente', 'en')).toBe('/en/');
  });
});
```

- [ ] **Step 3: Correr los tests para verificar que fallan**

Run: `npm run test:unit`
Expected: FAIL — no se puede resolver `src/i18n/utils`.

- [ ] **Step 4: Crear los diccionarios**

`src/i18n/ui.ts`:

```ts
export const languages = { es: 'Español', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'es';

export const ui = {
  es: {
    'nav.inicio': 'Inicio',
    'nav.qa': 'QA',
    'nav.dev': 'Desarrollo',
    'nav.sobre': 'Sobre mí',
    'nav.contacto': 'Contacto',
    'nav.principal': 'Navegación principal',
    'tema.cambiar': 'Cambiar tema',
    'idioma.cambiar': 'Ver en inglés',
    'home.rol': 'QA Engineer · Manual & Automation',
    'home.disponible': 'Disponible para trabajar',
    'home.qa.titulo': 'Trabajo en QA',
    'home.dev.titulo': 'También escribo código',
    'home.dev.bajada': 'Escribo código, y eso me hace mejor testeando.',
    'home.stack': 'Stack',
    'qa.titulo': 'Casos de QA',
    'dev.titulo': 'Proyectos de desarrollo',
    'caso.estrategia': 'Estrategia de prueba',
    'caso.enProgreso': 'En progreso',
    'caso.completo': 'Completo',
    'caso.verRepo': 'Ver repositorio',
    'caso.verDemo': 'Ver demo',
    'cv.descargar': 'Descargar CV',
    'contacto.copiar': 'Copiar email',
    'contacto.copiado': 'Copiado',
    'ejemplo.aviso': 'Contenido de ejemplo — pendiente de reemplazo.',
    'volver': 'Volver',
  },
  en: {
    'nav.inicio': 'Home',
    'nav.qa': 'QA',
    'nav.dev': 'Development',
    'nav.sobre': 'About',
    'nav.contacto': 'Contact',
    'nav.principal': 'Main navigation',
    'tema.cambiar': 'Toggle theme',
    'idioma.cambiar': 'View in Spanish',
    'home.rol': 'QA Engineer · Manual & Automation',
    'home.disponible': 'Available for hire',
    'home.qa.titulo': 'QA work',
    'home.dev.titulo': 'I also write code',
    'home.dev.bajada': 'I write code, and that makes me a better tester.',
    'home.stack': 'Stack',
    'qa.titulo': 'QA case studies',
    'dev.titulo': 'Development projects',
    'caso.estrategia': 'Test strategy',
    'caso.enProgreso': 'In progress',
    'caso.completo': 'Complete',
    'caso.verRepo': 'View repository',
    'caso.verDemo': 'View demo',
    'cv.descargar': 'Download CV',
    'contacto.copiar': 'Copy email',
    'contacto.copiado': 'Copied',
    'ejemplo.aviso': 'Sample content — pending replacement.',
    'volver': 'Back',
  },
} as const;

export type ClaveUI = keyof (typeof ui)['es'];
```

**Corregido durante la ejecución:** derivar `ClaveUI` de `es` deja la paridad asimétrica — si a `es` le falta una clave que está en `en`, el tipo se achica junto con el diccionario y nadie se queja; la clave queda muerta e inaccesible sin ninguna señal. La versión implementada declara `ClaveUI` como unión explícita de literales, define `type Diccionario = Record<ClaveUI, string>` y aplica `as const satisfies Diccionario` a **ambos** diccionarios, de modo que a cualquiera de los dos al que le falte una clave el compilador lo marca.

- [ ] **Step 5: Crear el mapa de rutas**

`src/i18n/routes.ts`:

```ts
import type { Lang } from './ui';

export type SeccionKey = 'qa' | 'dev' | 'about' | 'contact';

export const seccionSlugs: Record<SeccionKey, Record<Lang, string>> = {
  qa: { es: 'qa', en: 'qa' },
  dev: { es: 'dev', en: 'dev' },
  about: { es: 'sobre-mi', en: 'about' },
  contact: { es: 'contacto', en: 'contact' },
};

export const rutas: Record<SeccionKey, Record<Lang, string>> = {
  qa: { es: '/es/qa', en: '/en/qa' },
  dev: { es: '/es/dev', en: '/en/dev' },
  about: { es: '/es/sobre-mi', en: '/en/about' },
  contact: { es: '/es/contacto', en: '/en/contact' },
};
```

- [ ] **Step 6: Implementar las utilidades**

`src/i18n/utils.ts`:

```ts
import { ui, defaultLang, type Lang, type ClaveUI } from './ui';
import { seccionSlugs, type SeccionKey } from './routes';

export function getLangFromUrl(url: URL): Lang {
  const [, prefijo] = url.pathname.split('/');
  return prefijo === 'en' || prefijo === 'es' ? prefijo : defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(clave: ClaveUI): string {
    return ui[lang][clave];
  };
}

export function getAlternateUrl(pathname: string, destino: Lang): string {
  const segmentos = pathname.split('/').filter(Boolean);
  const [actual, seccion, ...resto] = segmentos;
  if (actual !== 'es' && actual !== 'en') return `/${destino}/`;
  if (!seccion) return `/${destino}/`;

  const claves = Object.keys(seccionSlugs) as SeccionKey[];
  const clave = claves.find((k) => seccionSlugs[k][actual] === seccion);
  if (!clave) return `/${destino}/`;

  return ['', destino, seccionSlugs[clave][destino], ...resto].join('/');
}
```

- [ ] **Step 7: Correr los tests**

Run: `npm run test:unit`
Expected: PASS, 10 tests (3 de `getLangFromUrl`, 1 de `useTranslations`, 6 de `getAlternateUrl`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: utilidades de i18n con equivalencia de rutas entre idiomas"
```

---

### Task 4: Layout completo, cabecera, pie y hreflang

Cabecera con navegación y ambos toggles, pie, y las etiquetas `hreflang` que le dicen a Google que existen dos versiones del sitio.

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/LangToggle.astro`
- Create: `src/pages/index.astro`, `src/pages/en/index.astro`
- Test: `tests/e2e/idioma.spec.ts`, `tests/e2e/navegacion.spec.ts`

**Interfaces:**
- Consumes: `getLangFromUrl`, `useTranslations`, `getAlternateUrl`, `rutas` (Task 3); `ThemeToggle` (Task 2)
- Produces:
  - `BaseLayout` props ampliadas: `{ lang: Lang; title: string; description: string }`
  - `data-testid`: `nav-principal`, `lang-toggle`, `nav-inicio`, `nav-qa`, `nav-dev`, `nav-sobre`, `nav-contacto`, `pie`

- [ ] **Step 1: Escribir los tests de idioma (fallan)**

`tests/e2e/idioma.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Cambio de idioma', () => {
  test('la raíz redirige a español', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/es\/$/);
  });

  test('el toggle lleva a la home equivalente', async ({ page }) => {
    await page.goto('/es/');
    await page.getByTestId('lang-toggle').click();
    await expect(page).toHaveURL(/\/en\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('la página declara su alternativa con hreflang', async ({ page }) => {
    await page.goto('/es/');
    const alterno = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(alterno).toHaveAttribute('href', /\/en\/$/);
  });
});
```

- [ ] **Step 2: Escribir los tests de navegación (fallan)**

`tests/e2e/navegacion.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const rutas = ['/es/', '/en/'];

test.describe('Navegación', () => {
  for (const ruta of rutas) {
    test(`la cabecera y el pie están presentes en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByTestId('nav-principal')).toBeVisible();
      await expect(page.getByTestId('pie')).toBeVisible();
    });
  }

  test('los enlaces del menú apuntan al idioma correcto', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.getByTestId('nav-qa')).toHaveAttribute('href', '/en/qa');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/en/about');
  });
});
```

- [ ] **Step 3: Correr ambos para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/idioma.spec.ts tests/e2e/navegacion.spec.ts`
Expected: FAIL — no existen `lang-toggle` ni `nav-principal`.

- [ ] **Step 4: Crear el toggle de idioma**

`src/components/LangToggle.astro`:

```astro
---
import { getLangFromUrl, useTranslations, getAlternateUrl } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const destino = lang === 'es' ? 'en' : 'es';
const href = getAlternateUrl(Astro.url.pathname, destino);
---
<a href={href} data-testid="lang-toggle" aria-label={t('idioma.cambiar')} hreflang={destino}
  class="rounded-md border border-border px-2 py-1 font-mono text-sm text-text hover:bg-surface">
  {destino.toUpperCase()}
</a>
```

Es un `<a>`, no un botón: la equivalencia de ruta se resuelve al compilar, así que no hace falta JavaScript. Además permite abrir la otra versión en pestaña nueva.

- [ ] **Step 5: Crear la cabecera**

`src/components/Header.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.tsx';
import LangToggle from './LangToggle.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import { rutas } from '../i18n/routes';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const enlaces = [
  { testid: 'nav-inicio', href: `/${lang}/`, texto: t('nav.inicio') },
  { testid: 'nav-qa', href: rutas.qa[lang], texto: t('nav.qa') },
  { testid: 'nav-dev', href: rutas.dev[lang], texto: t('nav.dev') },
  { testid: 'nav-sobre', href: rutas.about[lang], texto: t('nav.sobre') },
  { testid: 'nav-contacto', href: rutas.contact[lang], texto: t('nav.contacto') },
];
---
<header class="border-b border-border">
  <nav data-testid="nav-principal" aria-label={t('nav.principal')}
    class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
    <ul class="flex flex-wrap gap-4">
      {enlaces.map((e) => (
        <li>
          <a href={e.href} data-testid={e.testid}
            class="text-muted hover:text-accent focus-visible:text-accent">{e.texto}</a>
        </li>
      ))}
    </ul>
    <div class="flex gap-2">
      <LangToggle />
      <ThemeToggle etiqueta={t('tema.cambiar')} client:load />
    </div>
  </nav>
</header>
```

- [ ] **Step 6: Crear el pie**

`src/components/Footer.astro`:

```astro
---
import { getLangFromUrl } from '../i18n/utils';
const lang = getLangFromUrl(Astro.url);
const anio = new Date().getFullYear();
---
<footer data-testid="pie" class="mt-16 border-t border-border">
  <div class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-muted">
    <span>© {anio} Juan Manuel Malugani</span>
    <a href="https://github.com/maluganiJ" class="hover:text-accent">GitHub</a>
  </div>
</footer>
```

- [ ] **Step 7: Ampliar el layout**

Reemplazar el `<body>` de `src/layouts/BaseLayout.astro` y agregar los `hreflang` en el `<head>`:

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { getAlternateUrl } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; title: string; description: string }
const { lang, title, description } = Astro.props;
const otro: Lang = lang === 'es' ? 'en' : 'es';
const urlOtro = getAlternateUrl(Astro.url.pathname, otro);
---
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="alternate" hreflang={lang} href={new URL(Astro.url.pathname, Astro.site)} />
    <link rel="alternate" hreflang={otro} href={new URL(urlOtro, Astro.site)} />
    <link rel="alternate" hreflang="x-default" href={new URL('/es/', Astro.site)} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <script is:inline>
      (() => {
        const guardado = localStorage.getItem('theme');
        const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.dataset.theme = guardado ?? (prefiereOscuro ? 'dark' : 'light');
      })();
    </script>
  </head>
  <body class="flex min-h-screen flex-col bg-bg text-text">
    <a href="#contenido" class="sr-only focus:not-sr-only focus:absolute focus:p-4">
      {lang === 'es' ? 'Saltar al contenido' : 'Skip to content'}
    </a>
    <Header />
    <main id="contenido" class="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

El enlace "saltar al contenido" no es decorativo: es un requisito de WCAG que la suite de accesibilidad de la Task 11 va a verificar.

- [ ] **Step 8: Activar las transiciones de vista**

En `src/layouts/BaseLayout.astro`, importar el router y agregarlo al `<head>`:

```astro
import { ClientRouter } from 'astro:transitions';
```

```astro
<ClientRouter />
```

**Atención a este efecto secundario:** con `ClientRouter` las navegaciones no recargan la página, así que el script inline del `<head>` se ejecuta una sola vez. Al navegar, el `<html>` de la página nueva llega sin `data-theme` y el sitio vuelve al tema por defecto — un bug silencioso que los tests de la Task 2 no detectan porque solo cargan una página.

Corrección en `BaseLayout.astro`, después del script inline:

```astro
<script>
  document.addEventListener('astro:after-swap', () => {
    const guardado = localStorage.getItem('theme');
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = guardado ?? (prefiereOscuro ? 'dark' : 'light');
  });
</script>
```

El island de React **no** necesita corrección: Astro rehidrata los componentes `client:load` en cada navegación, así que el `useEffect` de `ThemeToggle` vuelve a correr solo y el ícono queda sincronizado. Esa es una ventaja concreta de haberlo hecho island en vez de script suelto — un listener vanilla sí habría que rearmarlo a mano.

Agregar el test que cubre este caso en `tests/e2e/tema.spec.ts`:

```ts
test('el toggle sigue funcionando después de navegar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  await page.getByTestId('lang-toggle').click();
  await expect(page).toHaveURL(/\/en\/$/);
  await page.getByTestId('theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});
```

Se navega con el toggle de idioma y no con un enlace del menú porque en este punto del plan las únicas páginas que existen son las dos homes; el resto todavía daría 404.

- [ ] **Step 9: Crear la redirección de la raíz y la home en inglés**

`src/pages/index.astro`:

```astro
---
return Astro.redirect('/es/');
---
```

`src/pages/en/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout lang="en" title="Portfolio" description="QA portfolio">
  <h1 data-testid="titulo">Portfolio</h1>
</BaseLayout>
```

`src/pages/es/index.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout lang="es" title="Portfolio" description="Portfolio QA">
  <h1 data-testid="titulo">Portfolio</h1>
</BaseLayout>
```

- [ ] **Step 10: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/idioma.spec.ts tests/e2e/navegacion.spec.ts tests/e2e/tema.spec.ts`
Expected: PASS, 10 tests (3 de idioma, 3 de navegación, 4 de tema).

**Nota:** la verificación de que el toggle preserva la sección cuando el slug difiere entre idiomas (`/es/sobre-mi` → `/en/about`) **no** va acá: esas páginas recién existen en la Task 10, y en modo estático una ruta inexistente sirve un 404 sin cabecera, así que el test daría timeout esperando el toggle. La lógica ya está cubierta por los tests unitarios de `getAlternateUrl` (Task 3); el test E2E equivalente se agrega en la Task 10.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: layout con cabecera, pie, transiciones de vista y hreflang"
```

---

### Task 5: Colecciones de contenido y contenido de ejemplo

Esquemas Zod de las dos colecciones, contenido de ejemplo marcado, y el guardián que verifica que cada caso exista en ambos idiomas.

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/casos-qa/es/{suite-e2e-portfolio,testing-freelance,gestor-operaciones}.md` y sus espejos en `en/`
- Create: `src/content/proyectos/es/gestor-operaciones.md` y `en/gestor-operaciones.md`
- Create: `scripts/check-listo.mjs`
- Test: `tests/unit/contenido.test.ts`

**Interfaces:**
- Consumes: nada
- Produces:
  - Colecciones `casos-qa` y `proyectos` accesibles vía `getCollection('casos-qa')`
  - `id` de cada entrada con formato `<lang>/<slug>` (ej.: `es/testing-freelance`)
  - Campos del esquema `casos-qa`: `titulo, resumen, tags[], stack[], fecha, destacado, estado, ejemplo, repo?, demo?`
  - Campos del esquema `proyectos`: `titulo, resumen, stack[], fecha, destacado, ejemplo, repo?, demo?`
  - Script `npm run check:listo`

- [ ] **Step 1: Escribir el test de integridad del contenido (falla)**

`tests/unit/contenido.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const colecciones = ['casos-qa', 'proyectos'];

describe('Integridad del contenido', () => {
  for (const coleccion of colecciones) {
    it(`cada archivo de ${coleccion} existe en ambos idiomas`, () => {
      const base = join('src', 'content', coleccion);
      const es = readdirSync(join(base, 'es')).filter((f) => f.endsWith('.md'));
      expect(es.length).toBeGreaterThan(0);
      for (const archivo of es) {
        expect(existsSync(join(base, 'en', archivo)), `falta en/${archivo}`).toBe(true);
      }
    });
  }
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `npm run test:unit -- tests/unit/contenido.test.ts`
Expected: FAIL — el directorio `src/content/casos-qa/es` no existe.

- [ ] **Step 3: Definir los esquemas**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const tags = z.enum([
  'manual', 'automation', 'e2e', 'api', 'exploratorio',
  'regresion', 'accesibilidad', 'performance', 'mobile',
]);

const casosQa = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/casos-qa' }),
  schema: z.object({
    titulo: z.string().min(1),
    resumen: z.string().min(20).max(200),
    tags: z.array(tags).min(1),
    stack: z.array(z.string()).min(1),
    fecha: z.coerce.date(),
    destacado: z.boolean().default(false),
    estado: z.enum(['completo', 'en-progreso']),
    ejemplo: z.boolean().default(false),
    repo: z.url().optional(),
    demo: z.url().optional(),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string().min(1),
    resumen: z.string().min(20).max(200),
    stack: z.array(z.string()).min(1),
    fecha: z.coerce.date(),
    destacado: z.boolean().default(false),
    ejemplo: z.boolean().default(false),
    repo: z.url().optional(),
    demo: z.url().optional(),
  }),
});

export const collections = { 'casos-qa': casosQa, proyectos };
```

El `min(20).max(200)` en `resumen` no es capricho: obliga a que los resúmenes sean informativos pero quepan en las tarjetas sin romper el diseño. Si te pasás, el build falla y te enterás antes de publicar.

- [ ] **Step 4: Crear el caso de ejemplo principal en español**

`src/content/casos-qa/es/suite-e2e-portfolio.md`:

```markdown
---
titulo: "Suite E2E de este portfolio"
resumen: "Estrategia de prueba y automatización del sitio que estás viendo: navegación, i18n, tema y accesibilidad."
tags: [automation, e2e, accesibilidad]
stack: [Playwright, TypeScript, axe-core, GitHub Actions]
fecha: 2026-07-27
destacado: true
estado: completo
ejemplo: true
repo: "https://github.com/maluganiJ/portfolio"
---

## Contexto

Este portfolio es un sitio estático bilingüe con dos carriles de contenido. Aunque no tiene backend, concentra varios puntos donde un fallo silencioso arruinaría su único objetivo: que un reclutador lo abra y funcione.

## Estrategia de prueba

Prioricé por impacto sobre ese objetivo:

- **Riesgo alto:** un enlace roto o una página que no carga. Corta la evaluación en seco.
- **Riesgo alto:** el cambio de idioma que devuelve a la home en vez de a la página equivalente.
- **Riesgo medio:** el tema oscuro que no persiste, o que arranca con parpadeo blanco.
- **Riesgo medio:** fallas de contraste que dejan texto ilegible en uno de los dos temas.

**Decidí no automatizar** la validación de la redacción ni la calidad de las imágenes: son revisiones humanas y automatizarlas daría falsos positivos sin aportar valor.

## Ejecución

Suite en Playwright con Page Object Model, corriendo en Chromium, Firefox, WebKit y viewport mobile.

## Hallazgos

Reemplazar por los bugs reales encontrados durante el desarrollo, usando el componente BugReport.

## Automatización

Automaticé lo que se repite en cada deploy y lo que un humano no detecta a simple vista: enlaces rotos, contraste y regresiones visuales.

## Resultado y aprendizajes

Reemplazar al completar la implementación.
```

- [ ] **Step 5: Crear el espejo en inglés**

`src/content/casos-qa/en/suite-e2e-portfolio.md`: mismo frontmatter con `titulo: "E2E suite for this portfolio"` y `resumen: "Test strategy and automation for the site you are viewing: navigation, i18n, theming and accessibility."`, y el cuerpo traducido con los encabezados `## Context`, `## Test strategy`, `## Execution`, `## Findings`, `## Automation`, `## Outcome and takeaways`.

- [ ] **Step 6: Crear los otros dos casos y el proyecto**

Con la misma estructura de seis bloques, en ambos idiomas y todos con `ejemplo: true`:

- `testing-freelance.md` — `tags: [manual, exploratorio]`, `estado: completo`, `destacado: true`
- `gestor-operaciones.md` — `tags: [manual, automation, api]`, `estado: en-progreso`, `destacado: true`
- `proyectos/{es,en}/gestor-operaciones.md` — `stack: [React, TypeScript, Node]`, `destacado: true`

- [ ] **Step 7: Crear el guardián de publicación**

`scripts/check-listo.mjs`:

```js
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const pendientes = [];
for (const coleccion of ['casos-qa', 'proyectos']) {
  for (const lang of ['es', 'en']) {
    const dir = join('src', 'content', coleccion, lang);
    for (const archivo of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const texto = readFileSync(join(dir, archivo), 'utf8');
      if (/^ejemplo:\s*true\s*$/m.test(texto)) pendientes.push(join(dir, archivo));
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
```

Agregar a `package.json`: `"check:listo": "node scripts/check-listo.mjs"`

Este script **no corre en CI**: si lo hiciera, el pipeline estaría en rojo desde el día uno, que es exactamente lo que no queremos mostrar. Es una herramienta para ejecutar a mano antes de compartir el link.

- [ ] **Step 8: Correr los tests**

Run: `npm run test:unit && npm run build`
Expected: unit PASS (12 tests: 10 de i18n + 2 de contenido); build PASS sin errores de esquema.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: colecciones de contenido con esquema y contenido de ejemplo"
```

---

### Task 6: Componentes de dominio QA

Las tres piezas que hacen que un caso se lea como trabajo profesional de QA y no como un post de blog.

**Files:**
- Create: `src/components/BugReport.astro`, `src/components/TestMatrix.astro`, `src/components/Metricas.astro`, `src/components/Tag.astro`, `src/components/EjemploBanner.astro`
- Create: `src/pages/es/demo-componentes.astro` (página temporal para testearlos)
- Test: `tests/e2e/componentes.spec.ts`

**Interfaces:**
- Consumes: tokens de color `sev-*` y `est-*` (Task 2)
- Produces:
  - `<BugReport id severidad prioridad entorno pasos[] esperado obtenido />` con `severidad: 'critico'|'alto'|'medio'|'bajo'`
  - `<TestMatrix casos={[{ id, escenario, tipo, estado }]} />` con `estado: 'paso'|'fallo'|'bloqueado'`
  - `<Metricas items={[{ etiqueta, valor }]} />`
  - `<Tag nombre />`, `<EjemploBanner texto />`
  - `data-testid`: `bug-report`, `bug-severidad`, `test-matrix`, `metricas`, `banner-ejemplo`

- [ ] **Step 1: Escribir los tests (fallan)**

`tests/e2e/componentes.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Componentes de dominio QA', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/es/demo-componentes'); });

  test('el reporte de bug muestra todos sus campos', async ({ page }) => {
    const bug = page.getByTestId('bug-report').first();
    await expect(bug).toContainText('BUG-001');
    await expect(bug).toContainText('Pasos para reproducir');
    await expect(bug).toContainText('Resultado esperado');
    await expect(bug).toContainText('Resultado obtenido');
  });

  test('la severidad se comunica con texto, no solo con color', async ({ page }) => {
    const severidad = page.getByTestId('bug-severidad').first();
    await expect(severidad).toHaveText(/Crítica|Alta|Media|Baja/);
  });

  test('la matriz de casos renderiza una tabla accesible', async ({ page }) => {
    const matriz = page.getByTestId('test-matrix');
    await expect(matriz.locator('caption')).toBeVisible();
    await expect(matriz.locator('th')).toHaveCount(4);
  });

  test('las métricas muestran etiqueta y valor', async ({ page }) => {
    await expect(page.getByTestId('metricas').locator('dt').first()).toBeVisible();
    await expect(page.getByTestId('metricas').locator('dd').first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Correr para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/componentes.spec.ts`
Expected: FAIL — 404 en `/es/demo-componentes`.

- [ ] **Step 3: Crear BugReport**

`src/components/BugReport.astro`:

```astro
---
type Severidad = 'critico' | 'alto' | 'medio' | 'bajo';
interface Props {
  id: string; titulo: string; severidad: Severidad; prioridad: string;
  entorno: string; pasos: string[]; esperado: string; obtenido: string;
}
const { id, titulo, severidad, prioridad, entorno, pasos, esperado, obtenido } = Astro.props;

const etiquetas: Record<Severidad, string> = {
  critico: 'Crítica', alto: 'Alta', medio: 'Media', bajo: 'Baja',
};
const iconos: Record<Severidad, string> = {
  critico: '⬤', alto: '◆', medio: '▲', bajo: '■',
};
const colores: Record<Severidad, string> = {
  critico: 'text-sev-critico', alto: 'text-sev-alto',
  medio: 'text-sev-medio', bajo: 'text-sev-bajo',
};
---
<article data-testid="bug-report" class="my-6 rounded-lg border border-border bg-surface p-5">
  <header class="mb-4 flex flex-wrap items-baseline justify-between gap-2">
    <h3 class="text-lg font-semibold"><span class="font-mono text-muted">{id}</span> · {titulo}</h3>
    <span data-testid="bug-severidad" class={`font-medium ${colores[severidad]}`}>
      <span aria-hidden="true">{iconos[severidad]}</span> {etiquetas[severidad]}
    </span>
  </header>

  <dl class="mb-4 grid grid-cols-2 gap-2 text-sm">
    <dt class="text-muted">Prioridad</dt><dd>{prioridad}</dd>
    <dt class="text-muted">Entorno</dt><dd class="font-mono text-xs">{entorno}</dd>
  </dl>

  <h4 class="mt-4 font-medium">Pasos para reproducir</h4>
  <ol class="ml-5 list-decimal text-sm text-muted">
    {pasos.map((p) => <li>{p}</li>)}
  </ol>

  <h4 class="mt-4 font-medium">Resultado esperado</h4>
  <p class="text-sm text-muted">{esperado}</p>

  <h4 class="mt-4 font-medium">Resultado obtenido</h4>
  <p class="text-sm text-muted">{obtenido}</p>
</article>
```

La severidad lleva ícono **y** texto además del color. Un usuario daltónico distingue "Crítica ⬤" de "Baja ■" sin depender del rojo.

- [ ] **Step 4: Crear TestMatrix**

`src/components/TestMatrix.astro`:

```astro
---
type Estado = 'paso' | 'fallo' | 'bloqueado';
interface Caso { id: string; escenario: string; tipo: string; estado: Estado }
interface Props { titulo: string; casos: Caso[] }
const { titulo, casos } = Astro.props;

const etiquetas: Record<Estado, string> = { paso: 'Pasó', fallo: 'Falló', bloqueado: 'Bloqueado' };
const iconos: Record<Estado, string> = { paso: '✓', fallo: '✕', bloqueado: '⊘' };
const colores: Record<Estado, string> = {
  paso: 'text-est-paso', fallo: 'text-est-fallo', bloqueado: 'text-est-bloqueado',
};
---
<div class="my-6 overflow-x-auto">
  <table data-testid="test-matrix" class="w-full border-collapse text-sm">
    <caption class="mb-2 text-left font-medium">{titulo}</caption>
    <thead>
      <tr class="border-b border-border text-left text-muted">
        <th scope="col" class="py-2 pr-4">ID</th>
        <th scope="col" class="py-2 pr-4">Escenario</th>
        <th scope="col" class="py-2 pr-4">Tipo</th>
        <th scope="col" class="py-2">Estado</th>
      </tr>
    </thead>
    <tbody>
      {casos.map((c) => (
        <tr class="border-b border-border">
          <td class="py-2 pr-4 font-mono text-xs">{c.id}</td>
          <td class="py-2 pr-4">{c.escenario}</td>
          <td class="py-2 pr-4 text-muted">{c.tipo}</td>
          <td class={`py-2 ${colores[c.estado]}`}>
            <span aria-hidden="true">{iconos[c.estado]}</span> {etiquetas[c.estado]}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

- [ ] **Step 5: Crear Metricas, Tag y EjemploBanner**

`src/components/Metricas.astro`:

```astro
---
interface Props { items: { etiqueta: string; valor: string }[] }
const { items } = Astro.props;
---
<dl data-testid="metricas" class="my-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
  {items.map((i) => (
    <div class="rounded-lg border border-border bg-surface p-4">
      <dt class="text-xs uppercase tracking-wide text-muted">{i.etiqueta}</dt>
      <dd class="mt-1 font-mono text-2xl text-accent">{i.valor}</dd>
    </div>
  ))}
</dl>
```

`src/components/Tag.astro`:

```astro
---
interface Props { nombre: string }
const { nombre } = Astro.props;
---
<span class="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted">{nombre}</span>
```

`src/components/EjemploBanner.astro`:

```astro
---
interface Props { texto: string }
const { texto } = Astro.props;
---
<p data-testid="banner-ejemplo"
  class="mb-6 rounded-md border border-sev-medio bg-surface px-4 py-2 text-sm text-sev-medio">
  <span aria-hidden="true">⚠</span> {texto}
</p>
```

- [ ] **Step 6: Crear la página de demostración**

`src/pages/es/demo-componentes.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import BugReport from '../../components/BugReport.astro';
import TestMatrix from '../../components/TestMatrix.astro';
import Metricas from '../../components/Metricas.astro';
---
<BaseLayout lang="es" title="Demo de componentes" description="Página interna de verificación">
  <BugReport id="BUG-001" titulo="El toggle de idioma pierde la sección actual"
    severidad="alto" prioridad="P2" entorno="Chrome 130 · Windows 11"
    pasos={['Abrir /es/sobre-mi', 'Hacer clic en el toggle EN', 'Observar la URL resultante']}
    esperado="Redirige a /en/about manteniendo la sección."
    obtenido="Redirige a /en/ perdiendo la sección." />

  <TestMatrix titulo="Casos de navegación" casos={[
    { id: 'TC-01', escenario: 'Cambio de idioma en home', tipo: 'E2E', estado: 'paso' },
    { id: 'TC-02', escenario: 'Persistencia de tema', tipo: 'E2E', estado: 'paso' },
    { id: 'TC-03', escenario: 'Descarga de CV en inglés', tipo: 'E2E', estado: 'bloqueado' },
  ]} />

  <Metricas items={[
    { etiqueta: 'Casos', valor: '24' }, { etiqueta: 'Bugs', valor: '7' },
    { etiqueta: 'Automatizados', valor: '82%' }, { etiqueta: 'Duración', valor: '48s' },
  ]} />
</BaseLayout>
```

Esta página es temporal y se elimina en la Task 13. Existe para que los componentes tengan tests desde su primer commit, en vez de esperar a que haya casos reales que los usen.

- [ ] **Step 7: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/componentes.spec.ts`
Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: componentes de dominio QA (BugReport, TestMatrix, Metricas)"
```

---

### Task 7: Home en ambos idiomas

**Files:**
- Modify: `src/pages/es/index.astro`, `src/pages/en/index.astro`
- Create: `src/components/Hero.astro`, `src/components/StackGrid.astro`, `src/components/CasoCard.astro`
- Test: `tests/e2e/pages/HomePage.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4), `Tag` (Task 6), colección `casos-qa` (Task 5)
- Produces:
  - `<Hero lang />`, `<StackGrid lang />`, `<CasoCard caso lang />`
  - `data-testid`: `hero`, `badge-disponible`, `bloque-qa`, `bloque-dev`, `stack`, `caso-card`, `cta-contacto`
  - `HomePage` con `abrir(lang)`, `casos`, `badgeDisponible`, `bloqueQa`, `bloqueDev`

- [ ] **Step 1: Escribir el Page Object**

`tests/e2e/pages/HomePage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueQa: Locator;
  readonly bloqueDev: Locator;
  readonly casos: Locator;
  readonly stack: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueQa = page.getByTestId('bloque-qa');
    this.bloqueDev = page.getByTestId('bloque-dev');
    this.casos = page.getByTestId('caso-card');
    this.stack = page.getByTestId('stack');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
```

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/e2e/home.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Home', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`muestra hero, disponibilidad y ambos bloques en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.hero).toBeVisible();
      await expect(home.badgeDisponible).toBeVisible();
      await expect(home.bloqueQa).toBeVisible();
      await expect(home.bloqueDev).toBeVisible();
      await expect(home.stack).toBeVisible();
    });
  }

  test('lista solo los casos destacados', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.casos).toHaveCount(3);
  });

  test('el bloque QA precede al bloque Dev en el DOM', async ({ page }) => {
    await page.goto('/es/');
    const orden = await page.evaluate(() => {
      const qa = document.querySelector('[data-testid="bloque-qa"]')!;
      const dev = document.querySelector('[data-testid="bloque-dev"]')!;
      return qa.compareDocumentPosition(dev) & Node.DOCUMENT_POSITION_FOLLOWING ? 'qa-primero' : 'dev-primero';
    });
    expect(orden).toBe('qa-primero');
  });

  test('hay un único h1', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.locator('h1')).toHaveCount(1);
  });
});
```

- [ ] **Step 3: Correr para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/home.spec.ts`
Expected: FAIL — no existe `hero`.

- [ ] **Step 4: Crear Hero**

`src/components/Hero.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
const posicionamiento = lang === 'es'
  ? 'Testing manual y automatización con Playwright. Busco mi primer puesto full-time en QA.'
  : 'Manual testing and automation with Playwright. Looking for my first full-time QA role.';
---
<section data-testid="hero" class="py-10">
  <p data-testid="badge-disponible"
    class="inline-flex items-center gap-2 rounded-full border border-est-paso px-3 py-1 text-sm text-est-paso">
    <span aria-hidden="true">●</span> {t('home.disponible')}
  </p>
  <h1 class="mt-4 text-4xl font-bold sm:text-5xl">Juan Manuel Malugani</h1>
  <p class="mt-2 font-mono text-accent">{t('home.rol')}</p>
  <p class="mt-4 max-w-prose text-lg text-muted">{posicionamiento}</p>
</section>
```

- [ ] **Step 5: Crear CasoCard y StackGrid**

`src/components/CasoCard.astro`:

```astro
---
import Tag from './Tag.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang; slug: string;
  datos: { titulo: string; resumen: string; tags: string[]; estado: 'completo' | 'en-progreso' };
}
const { lang, slug, datos } = Astro.props;
const t = useTranslations(lang);
const href = `/${lang}/qa/${slug}`;
---
<article data-testid="caso-card"
  class="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent">
  <h3 class="text-lg font-semibold">
    <a href={href} class="after:absolute after:inset-0">{datos.titulo}</a>
  </h3>
  {datos.estado === 'en-progreso' && (
    <p class="mt-1 text-xs text-sev-medio"><span aria-hidden="true">◐</span> {t('caso.enProgreso')}</p>
  )}
  <p class="mt-2 text-sm text-muted">{datos.resumen}</p>
  <div class="mt-3 flex flex-wrap gap-1">
    {datos.tags.map((tag) => <Tag nombre={tag} />)}
  </div>
</article>
```

`src/components/StackGrid.astro`:

```astro
---
import Tag from './Tag.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

const grupos = [
  { es: 'Automatización', en: 'Automation', items: ['Playwright', 'Cypress', 'Selenium'] },
  { es: 'API', en: 'API', items: ['Postman', 'REST Assured'] },
  { es: 'Gestión', en: 'Management', items: ['Jira', 'TestRail', 'Xray'] },
  { es: 'Desarrollo', en: 'Development', items: ['TypeScript', 'React', 'Git'] },
];
---
<section data-testid="stack" class="py-10">
  <h2 class="text-2xl font-semibold">{t('home.stack')}</h2>
  <div class="mt-4 grid gap-4 sm:grid-cols-2">
    {grupos.map((g) => (
      <div>
        <h3 class="text-sm uppercase tracking-wide text-muted">{lang === 'es' ? g.es : g.en}</h3>
        <div class="mt-2 flex flex-wrap gap-1">{g.items.map((i) => <Tag nombre={i} />)}</div>
      </div>
    ))}
  </div>
</section>
```

Sin barras de porcentaje, por decisión del spec: nadie cree un "Playwright 85%" y además invita a que te pregunten por el 15% faltante.

- [ ] **Step 6: Escribir la home en español**

`src/pages/es/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Hero from '../../components/Hero.astro';
import StackGrid from '../../components/StackGrid.astro';
import CasoCard from '../../components/CasoCard.astro';
import { useTranslations } from '../../i18n/utils';
import { rutas } from '../../i18n/routes';

const lang = 'es' as const;
const t = useTranslations(lang);
const casos = (await getCollection('casos-qa'))
  .filter((c) => c.id.startsWith('es/') && c.data.destacado)
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
---
<BaseLayout lang={lang} title="Juan Manuel Malugani · QA Engineer"
  description="Portfolio de testing manual y automatización.">
  <Hero lang={lang} />

  <section data-testid="bloque-qa" class="py-10">
    <h2 class="text-2xl font-semibold">{t('home.qa.titulo')}</h2>
    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      {casos.map((c) => (
        <div class="relative">
          <CasoCard lang={lang} slug={c.id.replace('es/', '')} datos={c.data} />
        </div>
      ))}
    </div>
    <a href={rutas.qa[lang]} class="mt-4 inline-block text-accent hover:underline">{t('qa.titulo')} →</a>
  </section>

  <section data-testid="bloque-dev" class="border-t border-border py-8">
    <h2 class="text-lg font-semibold text-muted">{t('home.dev.titulo')}</h2>
    <p class="mt-1 max-w-prose text-sm text-muted">{t('home.dev.bajada')}</p>
    <a href={rutas.dev[lang]} class="mt-2 inline-block text-accent hover:underline">{t('dev.titulo')} →</a>
  </section>

  <StackGrid lang={lang} />

  <section class="py-10">
    <a href={rutas.contact[lang]} data-testid="cta-contacto"
      class="inline-block rounded-md bg-accent px-5 py-3 font-medium text-bg">{t('nav.contacto')}</a>
  </section>
</BaseLayout>
```

Fijate la asimetría entre los dos bloques, que es lo que pide el spec: QA usa `h2` grande con grilla de tarjetas; Dev usa `h2` chico en color apagado, sin tarjetas y con borde superior que lo separa. Ocupa menos de un cuarto del espacio vertical.

- [ ] **Step 7: Escribir la home en inglés**

`src/pages/en/index.astro`: idéntica, cambiando `const lang = 'en' as const`, el filtro a `c.id.startsWith('en/')`, el `replace('en/', '')`, y los textos del `title`/`description` a inglés.

- [ ] **Step 8: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/home.spec.ts`
Expected: PASS, 5 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: home bilingüe con carriles asimétricos QA y Dev"
```

---

### Task 8: Carril QA — listado y detalle

**Files:**
- Create: `src/pages/es/qa/index.astro`, `src/pages/es/qa/[...slug].astro`, `src/pages/en/qa/index.astro`, `src/pages/en/qa/[...slug].astro`
- Create: `src/layouts/CaseLayout.astro`
- Test: `tests/e2e/pages/QaPage.ts`, `tests/e2e/pages/CasoPage.ts`, `tests/e2e/casos.spec.ts`

**Interfaces:**
- Consumes: `CasoCard`, `Tag`, `EjemploBanner`, `BugReport`, `TestMatrix`, `Metricas` (Tasks 6-7); colección `casos-qa` (Task 5)
- Produces:
  - `data-testid`: `lista-casos`, `caso-detalle`, `caso-titulo`, `caso-estado`, `caso-repo`
  - `QaPage` con `abrir(lang)`, `casos`; `CasoPage` con `abrir(lang, slug)`, `titulo`, `estado`

- [ ] **Step 1: Escribir los Page Objects**

`tests/e2e/pages/QaPage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class QaPage extends BasePage {
  readonly lista: Locator;
  readonly casos: Locator;

  constructor(page: Page) {
    super(page);
    this.lista = page.getByTestId('lista-casos');
    this.casos = page.getByTestId('caso-card');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/qa`);
  }
}
```

`tests/e2e/pages/CasoPage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class CasoPage extends BasePage {
  readonly detalle: Locator;
  readonly titulo: Locator;
  readonly bannerEjemplo: Locator;

  constructor(page: Page) {
    super(page);
    this.detalle = page.getByTestId('caso-detalle');
    this.titulo = page.getByTestId('caso-titulo');
    this.bannerEjemplo = page.getByTestId('banner-ejemplo');
  }

  async abrir(lang: Lang, slug: string): Promise<void> {
    await this.page.goto(`/${lang}/qa/${slug}`);
  }
}
```

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/e2e/casos.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { QaPage } from './pages/QaPage';
import { CasoPage } from './pages/CasoPage';

test.describe('Carril QA', () => {
  test('el listado muestra todos los casos', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('es');
    await expect(qa.casos).toHaveCount(3);
  });

  test('el listado en inglés muestra la misma cantidad', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('en');
    await expect(qa.casos).toHaveCount(3);
  });

  test('se navega del listado al detalle', async ({ page }) => {
    const qa = new QaPage(page);
    await qa.abrir('es');
    await qa.casos.first().getByRole('link').click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('el detalle muestra el título y los seis bloques', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await expect(caso.titulo).toBeVisible();
    for (const bloque of ['Contexto', 'Estrategia de prueba', 'Ejecución',
                          'Hallazgos', 'Automatización', 'Resultado y aprendizajes']) {
      await expect(page.getByRole('heading', { name: bloque })).toBeVisible();
    }
  });

  test('el contenido de ejemplo se avisa al visitante', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await expect(caso.bannerEjemplo).toBeVisible();
  });

  test('el cambio de idioma preserva el caso abierto', async ({ page }) => {
    const caso = new CasoPage(page);
    await caso.abrir('es', 'suite-e2e-portfolio');
    await caso.langToggle.click();
    await expect(page).toHaveURL(/\/en\/qa\/suite-e2e-portfolio$/);
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });
});
```

Ese último test es el que más valor tiene de toda la suite: cubre el bug más probable del sitio, que es el toggle de idioma tirando a la home desde una página dinámica.

- [ ] **Step 3: Correr para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/casos.spec.ts`
Expected: FAIL — 404 en `/es/qa`.

- [ ] **Step 4: Crear el layout de caso**

`src/layouts/CaseLayout.astro`:

```astro
---
import BaseLayout from './BaseLayout.astro';
import Tag from '../components/Tag.astro';
import EjemploBanner from '../components/EjemploBanner.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang;
  datos: {
    titulo: string; resumen: string; tags: string[]; stack: string[];
    fecha: Date; estado: 'completo' | 'en-progreso'; ejemplo: boolean;
    repo?: string; demo?: string;
  };
}
const { lang, datos } = Astro.props;
const t = useTranslations(lang);
---
<BaseLayout lang={lang} title={`${datos.titulo} · Juan Manuel Malugani`} description={datos.resumen}>
  <article data-testid="caso-detalle">
    {datos.ejemplo && <EjemploBanner texto={t('ejemplo.aviso')} />}

    <header class="border-b border-border pb-6">
      <h1 data-testid="caso-titulo" class="text-3xl font-bold sm:text-4xl">{datos.titulo}</h1>
      <p data-testid="caso-estado" class="mt-2 text-sm text-muted">
        {datos.estado === 'completo' ? t('caso.completo') : t('caso.enProgreso')}
        · <time datetime={datos.fecha.toISOString()}>
            {datos.fecha.toLocaleDateString(lang === 'es' ? 'es-AR' : 'en-US')}
          </time>
      </p>
      <p class="mt-3 max-w-prose text-lg text-muted">{datos.resumen}</p>
      <div class="mt-4 flex flex-wrap gap-1">
        {datos.tags.map((tag) => <Tag nombre={tag} />)}
        {datos.stack.map((s) => <Tag nombre={s} />)}
      </div>
      {datos.repo && (
        <a href={datos.repo} data-testid="caso-repo"
          class="mt-4 inline-block text-accent hover:underline">{t('caso.verRepo')} →</a>
      )}
    </header>

    <div class="prose-caso mt-8 max-w-prose">
      <slot />
    </div>
  </article>
</BaseLayout>

<style is:global>
  .prose-caso h2 { font-size: 1.5rem; font-weight: 600; margin-top: 2.5rem; margin-bottom: 0.75rem; }
  .prose-caso h3 { font-size: 1.125rem; font-weight: 600; margin-top: 1.75rem; margin-bottom: 0.5rem; }
  .prose-caso p { margin-bottom: 1rem; color: var(--text-muted); line-height: 1.75; }
  .prose-caso ul, .prose-caso ol { margin: 0 0 1rem 1.25rem; color: var(--text-muted); }
  .prose-caso ul { list-style: disc; }
  .prose-caso ol { list-style: decimal; }
  .prose-caso li { margin-bottom: 0.375rem; }
  .prose-caso strong { color: var(--text); font-weight: 600; }
  .prose-caso a { color: var(--accent); text-decoration: underline; }
  .prose-caso code { font-family: var(--font-mono); font-size: 0.875em; background: var(--surface); padding: 0.125rem 0.25rem; border-radius: 0.25rem; }
</style>
```

- [ ] **Step 5: Crear el listado en español**

`src/pages/es/qa/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import CasoCard from '../../../components/CasoCard.astro';
import { useTranslations } from '../../../i18n/utils';

const lang = 'es' as const;
const t = useTranslations(lang);
const casos = (await getCollection('casos-qa'))
  .filter((c) => c.id.startsWith('es/'))
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
---
<BaseLayout lang={lang} title="Casos de QA · Juan Manuel Malugani"
  description="Casos de testing manual y automatización, documentados de punta a punta.">
  <h1 class="text-3xl font-bold sm:text-4xl">{t('qa.titulo')}</h1>
  <p class="mt-3 max-w-prose text-muted">
    Cada caso documenta el contexto, la estrategia de prueba, la ejecución, los hallazgos,
    lo que automaticé y qué aprendí. Priorizo por riesgo y explico también qué decidí no probar.
  </p>
  <div data-testid="lista-casos" class="mt-8 grid gap-4 sm:grid-cols-2">
    {casos.map((c) => (
      <div class="relative">
        <CasoCard lang={lang} slug={c.id.replace('es/', '')} datos={c.data} />
      </div>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 6: Crear el detalle en español**

`src/pages/es/qa/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import CaseLayout from '../../../layouts/CaseLayout.astro';

export async function getStaticPaths() {
  const casos = await getCollection('casos-qa');
  return casos
    .filter((c) => c.id.startsWith('es/'))
    .map((caso) => ({ params: { slug: caso.id.replace('es/', '') }, props: { caso } }));
}

const { caso } = Astro.props;
const { Content } = await render(caso);
---
<CaseLayout lang="es" datos={caso.data}>
  <Content />
</CaseLayout>
```

- [ ] **Step 7: Crear los equivalentes en inglés**

`src/pages/en/qa/index.astro` y `src/pages/en/qa/[...slug].astro`: idénticos, con `lang = 'en'`, el filtro `startsWith('en/')`, el `replace('en/', '')` y los textos del encabezado en inglés.

- [ ] **Step 8: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/casos.spec.ts`
Expected: PASS, 6 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: carril QA con listado y detalle de casos en ambos idiomas"
```

---

### Task 9: Carril Dev

**Files:**
- Create: `src/pages/es/dev/index.astro`, `src/pages/es/dev/[...slug].astro`, `src/pages/en/dev/index.astro`, `src/pages/en/dev/[...slug].astro`
- Create: `src/components/ProyectoCard.astro`
- Test: `tests/e2e/dev.spec.ts`

**Interfaces:**
- Consumes: `CaseLayout`, `Tag`, colección `proyectos` (Tasks 5-8)
- Produces: `data-testid`: `lista-proyectos`, `proyecto-card`, `proyecto-detalle`

- [ ] **Step 1: Escribir los tests (fallan)**

`tests/e2e/dev.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('Carril Dev', () => {
  test('el listado muestra los proyectos en ambos idiomas', async ({ page }) => {
    for (const lang of ['es', 'en']) {
      await page.goto(`/${lang}/dev`);
      await expect(page.getByTestId('proyecto-card')).toHaveCount(1);
    }
  });

  test('se navega al detalle del proyecto', async ({ page }) => {
    await page.goto('/es/dev');
    await page.getByTestId('proyecto-card').first().getByRole('link').click();
    await expect(page.getByTestId('caso-detalle')).toBeVisible();
  });

  test('el detalle enlaza al repositorio', async ({ page }) => {
    await page.goto('/es/dev/gestor-operaciones');
    await expect(page.getByTestId('caso-repo')).toHaveAttribute('href', /github\.com/);
  });
});
```

- [ ] **Step 2: Correr para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/dev.spec.ts`
Expected: FAIL — 404 en `/es/dev`.

- [ ] **Step 3: Crear ProyectoCard**

`src/components/ProyectoCard.astro`:

```astro
---
import Tag from './Tag.astro';
import type { Lang } from '../i18n/ui';

interface Props {
  lang: Lang; slug: string;
  datos: { titulo: string; resumen: string; stack: string[] };
}
const { lang, slug, datos } = Astro.props;
---
<article data-testid="proyecto-card"
  class="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent">
  <h3 class="text-lg font-semibold">
    <a href={`/${lang}/dev/${slug}`} class="after:absolute after:inset-0">{datos.titulo}</a>
  </h3>
  <p class="mt-2 text-sm text-muted">{datos.resumen}</p>
  <div class="mt-3 flex flex-wrap gap-1">{datos.stack.map((s) => <Tag nombre={s} />)}</div>
</article>
```

- [ ] **Step 4: Crear el listado en español**

`src/pages/es/dev/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ProyectoCard from '../../../components/ProyectoCard.astro';
import { useTranslations } from '../../../i18n/utils';

const lang = 'es' as const;
const t = useTranslations(lang);
const proyectos = (await getCollection('proyectos'))
  .filter((p) => p.id.startsWith('es/'))
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
---
<BaseLayout lang={lang} title="Proyectos de desarrollo · Juan Manuel Malugani"
  description="Proyectos de desarrollo propios.">
  <h1 class="text-3xl font-bold sm:text-4xl">{t('dev.titulo')}</h1>
  <p class="mt-3 max-w-prose text-muted">{t('home.dev.bajada')}</p>
  <div data-testid="lista-proyectos" class="mt-8 grid gap-4 sm:grid-cols-2">
    {proyectos.map((p) => (
      <div class="relative">
        <ProyectoCard lang={lang} slug={p.id.replace('es/', '')} datos={p.data} />
      </div>
    ))}
  </div>
</BaseLayout>
```

- [ ] **Step 5: Crear el detalle en español**

`src/pages/es/dev/[...slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content';
import CaseLayout from '../../../layouts/CaseLayout.astro';

export async function getStaticPaths() {
  const proyectos = await getCollection('proyectos');
  return proyectos
    .filter((p) => p.id.startsWith('es/'))
    .map((proyecto) => ({ params: { slug: proyecto.id.replace('es/', '') }, props: { proyecto } }));
}

const { proyecto } = Astro.props;
const { Content } = await render(proyecto);
---
<CaseLayout lang="es" datos={{ ...proyecto.data, tags: [], estado: 'completo' }}>
  <Content />
</CaseLayout>
```

`CaseLayout` se reutiliza pasando `tags: []` y `estado: 'completo'`, que la colección `proyectos` no tiene. Es reúso deliberado: los proyectos dev no necesitan su propio layout y mantener uno solo evita que las dos plantillas se desincronicen.

- [ ] **Step 6: Crear los equivalentes en inglés**

`src/pages/en/dev/index.astro` y `src/pages/en/dev/[...slug].astro`, con `lang = 'en'` y el filtro `startsWith('en/')`.

- [ ] **Step 7: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/dev.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: carril de proyectos de desarrollo"
```

---

### Task 10: Sobre mí, contacto y CV descargable

**Files:**
- Create: `src/pages/es/sobre-mi.astro`, `src/pages/en/about.astro`, `src/pages/es/contacto.astro`, `src/pages/en/contact.astro`
- Create: `src/components/CopyEmail.tsx`, `src/components/CvButton.astro`
- Create: `public/cv/cv-es.pdf`, `public/cv/cv-en.pdf`
- Test: `tests/e2e/pages/ContactoPage.ts`, `tests/e2e/contacto.spec.ts`

**Interfaces:**
- Consumes: `BaseLayout` (Task 4)
- Produces:
  - `<CopyEmail email textoCopiar textoCopiado />` (island de React, requiere `client:load`), `<CvButton lang />`
  - `data-testid`: `email-copiar`, `email-texto`, `link-linkedin`, `link-github`, `cv-descargar`, `sobre-mi`

- [ ] **Step 1: Escribir el Page Object**

`tests/e2e/pages/ContactoPage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ContactoPage extends BasePage {
  readonly botonCopiar: Locator;
  readonly emailTexto: Locator;
  readonly linkedin: Locator;
  readonly github: Locator;

  constructor(page: Page) {
    super(page);
    this.botonCopiar = page.getByTestId('email-copiar');
    this.emailTexto = page.getByTestId('email-texto');
    this.linkedin = page.getByTestId('link-linkedin');
    this.github = page.getByTestId('link-github');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(lang === 'es' ? '/es/contacto' : '/en/contact');
  }
}
```

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/e2e/contacto.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { ContactoPage } from './pages/ContactoPage';

test.describe('Contacto y CV', () => {
  test('muestra email, LinkedIn y GitHub', async ({ page }) => {
    const contacto = new ContactoPage(page);
    await contacto.abrir('es');
    await expect(contacto.emailTexto).toContainText('@');
    await expect(contacto.linkedin).toHaveAttribute('href', /linkedin\.com/);
    await expect(contacto.github).toHaveAttribute('href', /github\.com/);
  });

  test('no hay formulario de contacto', async ({ page }) => {
    await page.goto('/es/contacto');
    await expect(page.locator('form')).toHaveCount(0);
  });

  test('el botón copia el email al portapapeles', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const contacto = new ContactoPage(page);
    await contacto.abrir('es');
    await contacto.botonCopiar.click();
    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    expect(copiado).toContain('@');
  });

  test('el CV en español se descarga', async ({ page }) => {
    await page.goto('/es/');
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('cv-descargar').click(),
    ]);
    expect(descarga.suggestedFilename()).toBe('cv-es.pdf');
  });

  test('el CV en inglés se descarga', async ({ page }) => {
    await page.goto('/en/');
    const [descarga] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('cv-descargar').click(),
    ]);
    expect(descarga.suggestedFilename()).toBe('cv-en.pdf');
  });
});
```

Y agregar a `tests/e2e/idioma.spec.ts` el test que la Task 4 no podía correr, porque recién ahora existen las páginas con slug distinto en cada idioma:

```ts
test('el toggle preserva la sección aunque el slug cambie', async ({ page }) => {
  await page.goto('/es/sobre-mi');
  await page.getByTestId('lang-toggle').click();
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.getByTestId('sobre-mi')).toBeVisible();

  await page.goto('/es/contacto');
  await page.getByTestId('lang-toggle').click();
  await expect(page).toHaveURL(/\/en\/contact$/);
});
```

Este es el caso que en producción rompe más seguido: el toggle de idioma funciona en la home, donde el slug es igual en los dos idiomas, y falla justo en las secciones traducidas.

El test del portapapeles solo pasa en Chromium; los otros navegadores no dan permisos de clipboard a Playwright. Agregar al inicio del test: `test.skip(({ browserName }) => browserName !== 'chromium', 'Clipboard solo en Chromium');`

- [ ] **Step 3: Correr para verificar que fallan**

Run: `npm run test:e2e -- --project=chromium tests/e2e/contacto.spec.ts`
Expected: FAIL — 404 en `/es/contacto`.

- [ ] **Step 4: Crear CopyEmail y CvButton**

`src/components/CopyEmail.tsx`:

```tsx
import { useState } from 'react';

interface Props {
  email: string;
  textoCopiar: string;
  textoCopiado: string;
}

export default function CopyEmail({ email, textoCopiar, textoCopiado }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar(): Promise<void> {
    await navigator.clipboard.writeText(email);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${email}`}
        data-testid="email-texto"
        className="font-mono text-lg text-accent hover:underline"
      >
        {email}
      </a>
      <button
        type="button"
        data-testid="email-copiar"
        onClick={copiar}
        className="rounded-md border border-border px-3 py-1 text-sm hover:bg-surface"
      >
        {copiado ? textoCopiado : textoCopiar}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copiado ? textoCopiado : ''}
      </span>
    </div>
  );
}
```

Dos decisiones acá:

- **Los textos entran por props ya traducidos**, en vez de que el island importe `useTranslations`. Si importara el diccionario, los textos de **los dos idiomas** viajarían en el bundle del cliente. Traduciendo en la página `.astro` y pasando strings, al navegador solo llegan las dos palabras que se usan.
- **El `<span role="status">`** anuncia "Copiado" a los lectores de pantalla. Sin él, el cambio de texto del botón es invisible para quien no ve la pantalla, y axe lo marcaría en la Task 11.

`src/components/CvButton.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<a href={`/cv/cv-${lang}.pdf`} download data-testid="cv-descargar"
  class="inline-block rounded-md border border-accent px-4 py-2 font-medium text-accent hover:bg-surface">
  {t('cv.descargar')} ↓
</a>
```

- [ ] **Step 5: Agregar el botón de CV a la home**

En `src/pages/es/index.astro` y `src/pages/en/index.astro`, importar `CvButton` y agregarlo dentro del bloque del CTA de contacto, junto al enlace existente.

- [ ] **Step 6: Crear los PDFs de ejemplo**

```bash
mkdir -p public/cv
```

Generar dos PDFs mínimos válidos (una página con el texto "CV de ejemplo — reemplazar") y guardarlos como `public/cv/cv-es.pdf` y `public/cv/cv-en.pdf`. Cualquier editor o exportación desde un documento sirve; solo tienen que ser PDFs válidos y no vacíos para que la descarga funcione. Se reemplazan por el CV real antes de publicar.

- [ ] **Step 7: Crear la página de contacto en español**

`src/pages/es/contacto.astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import CopyEmail from '../../components/CopyEmail.tsx';
import CvButton from '../../components/CvButton.astro';
import { useTranslations } from '../../i18n/utils';

const lang = 'es' as const;
const t = useTranslations(lang);
const email = 'maluganijuanmanuel@gmail.com';
---
<BaseLayout lang={lang} title="Contacto · Juan Manuel Malugani" description="Cómo contactarme.">
  <h1 class="text-3xl font-bold sm:text-4xl">Contacto</h1>
  <p class="mt-3 max-w-prose text-muted">
    Estoy buscando mi primer puesto full-time en QA. Escribime y respondo dentro de las 24 horas.
  </p>
  <div class="mt-8">
    <CopyEmail email={email} textoCopiar={t('contacto.copiar')} textoCopiado={t('contacto.copiado')} client:load />
  </div>
  <ul class="mt-6 flex gap-4">
    <li><a href="https://www.linkedin.com/in/maluganijuanmanuel" data-testid="link-linkedin" class="text-accent hover:underline">LinkedIn</a></li>
    <li><a href="https://github.com/maluganiJ" data-testid="link-github" class="text-accent hover:underline">GitHub</a></li>
  </ul>
  <div class="mt-8"><CvButton lang={lang} /></div>
</BaseLayout>
```

Verificar que las URLs de LinkedIn y GitHub sean las reales del usuario antes de commitear; si no coinciden, corregirlas (el test de enlaces de la Task 12 va a fallar con un 404 si están mal).

- [ ] **Step 8: Crear sobre-mi y los equivalentes en inglés**

`src/pages/es/sobre-mi.astro` con `data-testid="sobre-mi"`: recorrido, motivación por QA, forma de trabajo, formación y certificaciones. Texto de ejemplo, claramente marcado con `EjemploBanner`.

`src/pages/en/about.astro` y `src/pages/en/contact.astro`: equivalentes con `lang = 'en'`.

- [ ] **Step 9: Correr los tests**

Run: `npm run test:e2e -- --project=chromium tests/e2e/contacto.spec.ts`
Expected: PASS, 5 tests.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: páginas de contacto y sobre mí con CV descargable"
```

---

### Task 11: Suite de accesibilidad

**Files:**
- Create: `tests/e2e/a11y.spec.ts`
- Modify: los componentes que axe reporte con violaciones

**Interfaces:**
- Consumes: todas las páginas (Tasks 4-10)
- Produces: garantía de cero violaciones WCAG A y AA en las 12 páginas × 2 temas

- [ ] **Step 1: Escribir los tests de accesibilidad**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginas = [
  '/es/', '/es/qa', '/es/qa/suite-e2e-portfolio', '/es/dev',
  '/es/dev/gestor-operaciones', '/es/sobre-mi', '/es/contacto',
  '/en/', '/en/qa', '/en/qa/suite-e2e-portfolio', '/en/dev',
  '/en/dev/gestor-operaciones', '/en/about', '/en/contact',
];

for (const tema of ['light', 'dark'] as const) {
  test.describe(`Accesibilidad · tema ${tema}`, () => {
    for (const ruta of paginas) {
      test(`${ruta} no tiene violaciones WCAG AA`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema });
        await page.goto(ruta);
        const resultados = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(resultados.violations).toEqual([]);
      });
    }
  });
}

test.describe('Navegación por teclado', () => {
  test('el primer tabulador revela el enlace de salto al contenido', async ({ page }) => {
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    const enfocado = page.locator(':focus');
    await expect(enfocado).toHaveAttribute('href', '#contenido');
  });

  test('se llega al toggle de tema solo con el teclado', async ({ page }) => {
    await page.goto('/es/');
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const testid = await page.locator(':focus').getAttribute('data-testid');
      if (testid === 'theme-toggle') return;
    }
    throw new Error('No se alcanzó el toggle de tema con el teclado en 20 tabulaciones');
  });

  test('el foco siempre es visible', async ({ page }) => {
    await page.goto('/es/');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const outline = await page.locator(':focus').evaluate(
      (el) => getComputedStyle(el).outlineStyle
    );
    expect(outline).not.toBe('none');
  });
});
```

- [ ] **Step 2: Correr y anotar cada violación**

Run: `npm run test:e2e -- --project=chromium tests/e2e/a11y.spec.ts`
Expected: FAIL en algunas rutas. Anotar el `id` de cada violación que reporte axe.

- [ ] **Step 3: Corregir las violaciones**

Las tres causas más probables y su corrección:

- **`color-contrast`** — algún token no llega a 4.5:1. Oscurecer el color en tema claro o aclararlo en oscuro dentro de `src/styles/global.css`. Verificar el par exacto que axe reporta.
- **`landmark-unique` o `region`** — contenido fuera de `<main>`, `<header>` o `<footer>`. Envolverlo en el landmark correcto.
- **`heading-order`** — un `h3` sin `h2` previo. Ajustar el nivel en el componente afectado.

Corregir de a una y volver a correr hasta que `violations` quede vacío en todas las rutas y ambos temas.

- [ ] **Step 4: Verificar que pasa en los cuatro navegadores**

Run: `npm run test:e2e -- tests/e2e/a11y.spec.ts`
Expected: PASS, 31 tests × 4 proyectos (14 rutas × 2 temas + 3 de teclado).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: suite de accesibilidad WCAG AA en ambos temas"
```

---

### Task 12: Enlaces rotos y regresión visual

**Files:**
- Create: `tests/e2e/enlaces.spec.ts`, `tests/e2e/visual.spec.ts`

**Interfaces:**
- Consumes: todas las páginas; el sitemap generado por `@astrojs/sitemap` (Task 1)
- Produces: capturas de referencia en `tests/e2e/visual.spec.ts-snapshots/`

- [ ] **Step 1: Escribir el test de enlaces**

`tests/e2e/enlaces.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const paginas = [
  '/es/', '/es/qa', '/es/qa/suite-e2e-portfolio', '/es/dev',
  '/es/dev/gestor-operaciones', '/es/sobre-mi', '/es/contacto',
  '/en/', '/en/qa', '/en/qa/suite-e2e-portfolio', '/en/dev',
  '/en/dev/gestor-operaciones', '/en/about', '/en/contact',
];

test.describe('Integridad de enlaces', () => {
  for (const ruta of paginas) {
    test(`los enlaces internos de ${ruta} responden 200`, async ({ page, request }) => {
      await page.goto(ruta);
      const hrefs = await page.locator('a[href^="/"]').evaluateAll(
        (enlaces) => [...new Set(enlaces.map((a) => (a as HTMLAnchorElement).getAttribute('href')!))]
      );
      for (const href of hrefs) {
        const respuesta = await request.get(href);
        expect(respuesta.status(), `enlace roto: ${href} en ${ruta}`).toBe(200);
      }
    });
  }

  test('los enlaces externos responden', async ({ page, request }) => {
    await page.goto('/es/contacto');
    const hrefs = await page.locator('a[href^="http"]').evaluateAll(
      (enlaces) => enlaces.map((a) => (a as HTMLAnchorElement).href)
    );
    for (const href of hrefs) {
      const respuesta = await request.get(href, { failOnStatusCode: false, timeout: 15_000 });
      expect(respuesta.status(), `enlace externo caído: ${href}`).toBeLessThan(400);
    }
  });

  test('todo enlace externo abre con rel de seguridad', async ({ page }) => {
    await page.goto('/es/contacto');
    const enlaces = page.locator('a[target="_blank"]');
    const total = await enlaces.count();
    for (let i = 0; i < total; i++) {
      await expect(enlaces.nth(i)).toHaveAttribute('rel', /noopener/);
    }
  });
});
```

El test de enlaces externos puede fallar por causas ajenas al sitio (LinkedIn respondiendo 999 a bots, cortes momentáneos). En la Task 13 se lo marca para que no bloquee el deploy.

- [ ] **Step 2: Correr el test de enlaces**

Run: `npm run test:e2e -- --project=chromium tests/e2e/enlaces.spec.ts`
Expected: PASS. Si algún enlace interno da 404, corregir el `href` en el componente correspondiente.

- [ ] **Step 3: Escribir el test visual**

`tests/e2e/visual.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

const paginas = ['/es/', '/es/qa', '/es/qa/suite-e2e-portfolio', '/es/contacto'];

test.describe('Regresión visual', () => {
  test.skip(({ browserName }) => browserName !== 'chromium',
    'Las capturas de referencia se generan solo en Chromium');

  for (const tema of ['light', 'dark'] as const) {
    for (const ruta of paginas) {
      test(`${ruta} en tema ${tema}`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
        await page.goto(ruta);
        await page.waitForLoadState('networkidle');
        const nombre = `${ruta.replace(/\//g, '_')}-${tema}.png`;
        await expect(page).toHaveScreenshot(nombre, { fullPage: true, maxDiffPixelRatio: 0.01 });
      });
    }
  }
});
```

`reducedMotion: 'reduce'` es imprescindible: sin eso, las transiciones producen capturas distintas en cada corrida y el test se vuelve inestable.

- [ ] **Step 4: Generar las capturas de referencia**

Run: `npm run test:e2e -- --project=chromium tests/e2e/visual.spec.ts --update-snapshots`
Expected: se crean 8 archivos PNG en `tests/e2e/visual.spec.ts-snapshots/`.

Revisar visualmente cada PNG antes de commitearlo: una captura de referencia con un error de diseño convierte ese error en el comportamiento esperado.

- [ ] **Step 5: Verificar que el test pasa contra las referencias**

Run: `npm run test:e2e -- --project=chromium tests/e2e/visual.spec.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test: verificación de enlaces y regresión visual"
```

---

### Task 13: Integración continua

**Files:**
- Create: `.github/workflows/ci.yml`, `lighthouserc.json`
- Delete: `src/pages/es/demo-componentes.astro`
- Modify: `tests/e2e/componentes.spec.ts`, `package.json`

**Interfaces:**
- Consumes: todos los scripts de npm y las suites de tests (Tasks 1-12)
- Produces: workflow `CI` con badge en `https://github.com/maluganiJ/portfolio/actions/workflows/ci.yml/badge.svg`

- [ ] **Step 1: Mover los componentes de demostración a un caso real**

Borrar `src/pages/es/demo-componentes.astro`. Insertar los mismos `<BugReport>`, `<TestMatrix>` y `<Metricas>` dentro del bloque "Hallazgos" de `src/content/casos-qa/es/suite-e2e-portfolio.md` y su espejo en inglés.

Para poder usar componentes dentro del contenido, renombrar los archivos de `.md` a `.mdx`, instalar el soporte y actualizar el patrón del loader:

```bash
npx astro add mdx --yes
```

En Astro 7 el procesador Markdown por defecto es Sätteri, no remark/rehype. `@astrojs/mdx` sigue siendo compatible y los componentes importados dentro del propio `.mdx` funcionan sin configuración extra. La única limitación es que Sätteri no soporta plugins Recma; este proyecto no usa ninguno, así que no aplica.

En `src/content.config.ts`, cambiar ambos `pattern: '**/*.md'` por `pattern: '**/*.{md,mdx}'`.

En `tests/unit/contenido.test.ts`, cambiar los dos `.endsWith('.md')` por `.endsWith('.mdx')`.

En `scripts/check-listo.mjs`, cambiar `.endsWith('.md')` por `.endsWith('.mdx')`. Sin este cambio el guardián deja de encontrar archivos y siempre daría verde — un falso negativo silencioso, que es el peor tipo de falla en una herramienta de verificación.

En `tests/e2e/componentes.spec.ts`, cambiar el `beforeEach` a `await page.goto('/es/qa/suite-e2e-portfolio')`.

- [ ] **Step 2: Verificar que todo sigue verde tras el cambio**

Run: `npm run test:unit && npm run test:e2e -- --project=chromium`
Expected: PASS en todas las suites.

- [ ] **Step 3: Configurar Lighthouse CI**

```bash
npm install -D @lhci/cli
```

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": ["http://localhost/es/index.html", "http://localhost/es/qa/index.html"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

Agregar a `package.json`: `"test:lighthouse": "lhci autorun"`

Accesibilidad exige score perfecto (1) y no 0.9: el sitio ya pasa axe sin violaciones, así que el umbral es alcanzable y cualquier bajada indica una regresión real.

- [ ] **Step 4: Correr Lighthouse localmente**

Run: `npm run build && npm run test:lighthouse`
Expected: PASS. Si performance no llega a 0.9, revisar el peso de las fuentes y de las imágenes de portada antes de bajar el umbral.

- [ ] **Step 5: Crear el workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  verificar:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Instalar dependencias
        run: npm ci

      - name: Verificación de tipos
        run: npm run check

      - name: Tests unitarios
        run: npm run test:unit

      - name: Compilar
        run: npm run build

      - name: Instalar navegadores
        run: npx playwright install --with-deps

      - name: Tests E2E y de accesibilidad
        run: npx playwright test --grep-invert "enlaces externos"

      - name: Lighthouse
        run: npm run test:lighthouse

      - name: Publicar reporte de Playwright
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

El `--grep-invert "enlaces externos"` excluye el único test que depende de servicios de terceros. Un CI que se pone rojo porque LinkedIn tuvo un hipo entrena a ignorar el rojo, y entonces deja de servir.

- [ ] **Step 6: Agregar el badge a la home**

En `src/components/Footer.astro`, junto al enlace de GitHub:

```astro
<a href="https://github.com/maluganiJ/portfolio/actions/workflows/ci.yml">
  <img src="https://github.com/maluganiJ/portfolio/actions/workflows/ci.yml/badge.svg"
    alt="Estado de CI" width="88" height="20" loading="lazy" />
</a>
```

- [ ] **Step 7: Publicar el reporte de Playwright en una URL pública**

El artefacto que sube `upload-artifact` solo se puede descargar con sesión iniciada en GitHub, así que no sirve para enlazarlo desde el portfolio. Para que un reclutador pueda abrirlo, hay que publicarlo en GitHub Pages.

Agregar al final del job `verificar` en `.github/workflows/ci.yml`:

```yaml
      - name: Publicar el reporte en Pages
        if: always() && github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./playwright-report
          destination_dir: reporte
```

Y agregar al job los permisos que necesita, justo debajo de `timeout-minutes: 20`:

```yaml
    permissions:
      contents: write
```

En el repositorio de GitHub, activar Pages con origen "Deploy from a branch", rama `gh-pages`.

Luego, en el bloque "Automatización" de `src/content/casos-qa/es/suite-e2e-portfolio.mdx` y su espejo en inglés, enlazar el reporte:

```markdown
[Ver el reporte de la última corrida](https://maluganij.github.io/portfolio/reporte/)
```

Este enlace es la pieza más persuasiva del portfolio: no afirma que los tests existen, los muestra corriendo.

- [ ] **Step 8: Commit y verificar en GitHub**

```bash
git add -A
git commit -m "ci: pipeline de verificación con Playwright, axe y Lighthouse"
```

Crear el repositorio público `portfolio` en GitHub, agregar el remoto, publicar `main` y confirmar en la pestaña Actions que el workflow termina en verde. Si falla, corregir y volver a publicar antes de continuar.

---

### Task 14: Documentación y despliegue

**Files:**
- Create: `README.md`, `vercel.json`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: el proyecto completo
- Produces: sitio publicado en `https://<proyecto>.vercel.app`

- [ ] **Step 1: Escribir el README**

`README.md` con estas secciones:

- **Qué es** — portfolio personal QA, bilingüe, estático.
- **Stack** — Astro 5, Tailwind 4, TypeScript strict, Playwright, axe-core, Lighthouse CI.
- **Decisiones técnicas** — por qué Astro y no Next; por qué el idioma vive en la URL; por qué no hay React en v1; por qué el formulario de contacto no existe. Un párrafo cada una.
- **Cómo correrlo** — `npm install`, `npm run dev`.
- **Cómo correr los tests** — `npm run test:unit`, `npm run test:e2e`, `npm run test:e2e -- --ui` para el modo interactivo.
- **Cómo agregar un caso** — crear `src/content/casos-qa/es/<slug>.mdx` y `en/<slug>.mdx` con el mismo nombre; describir cada campo del frontmatter y los seis bloques del cuerpo.
- **Antes de publicar** — correr `npm run check:listo` y reemplazar los PDFs de `public/cv/`.

Este README lo van a leer reclutadores técnicos. La sección de decisiones técnicas es la que más pesa: demuestra criterio, no solo ejecución.

- [ ] **Step 2: Configurar Vercel**

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- [ ] **Step 3: Desplegar**

Importar el repositorio en Vercel, aceptar los valores detectados y desplegar. Anotar la URL resultante.

- [ ] **Step 4: Actualizar el dominio en la configuración**

En `astro.config.mjs`, reemplazar `site: 'https://portfolio.vercel.app'` por la URL real que asignó Vercel. Ese valor es el que usan el sitemap y las etiquetas `hreflang`; si queda mal, Google indexa URLs inexistentes.

- [ ] **Step 5: Verificar el sitio publicado**

Run: `npx playwright test --project=chromium --grep-invert "visual"` con la variable `PLAYWRIGHT_BASE_URL` apuntando a la URL de Vercel, tras agregar en `playwright.config.ts`:

```ts
use: { baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321', trace: 'on-first-retry' },
```

y condicionar el `webServer` a que no haya URL externa:

```ts
webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
  command: 'npm run build && npm run preview',
  url: 'http://localhost:4321',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

Expected: PASS contra el sitio en producción.

Los tests visuales se excluyen porque las capturas de referencia se generaron en local y el renderizado en otro entorno produce diferencias de subpíxel.

- [ ] **Step 6: Commit final**

```bash
git add -A
git commit -m "docs: README con decisiones técnicas y configuración de despliegue"
git push
```

---

## Después del plan: lo que queda en manos del usuario

El sitio queda funcionando, testeado y publicado, pero con contenido de ejemplo. Para que sirva como carta de presentación falta:

1. Reemplazar los tres casos QA de ejemplo por los reales, respetando los seis bloques.
2. Reemplazar el proyecto dev de ejemplo.
3. Escribir el texto real de "Sobre mí" y quitar su `EjemploBanner`.
4. Reemplazar `public/cv/cv-es.pdf` y `cv-en.pdf` por el CV real.
5. Verificar las URLs de LinkedIn y GitHub.
6. Correr `npm run check:listo` hasta que dé verde.
7. Agregar el dominio propio en Vercel y actualizar `site` en `astro.config.mjs`.

## Fuera de alcance de v1

- Filtros de casos por etiqueta (se incorporan cuando haya volumen; React ya está instalado, así que solo hace falta el island).
- Blog o sección de notas.
- Analítica de visitas.
- Formulario de contacto (descartado en el spec).
- Optimización de imágenes de portada (`astro:assets`), pendiente hasta que haya imágenes reales.
