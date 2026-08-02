# Sección "Reportar un problema" — Plan de implementación

> **Para quien ejecute esto:** SUB-SKILL REQUERIDA: usar
> `superpowers:subagent-driven-development` (recomendado) o
> `superpowers:executing-plans` para implementar tarea por tarea. Los pasos usan
> checkbox (`- [ ]`) para seguimiento.

**Objetivo:** agregar al cierre de la home una sección que invite a reportar
defectos del propio sitio, con salida a GitHub Issues y al portapapeles, y un
acceso en el navbar que no compita con Proyectos.

**Arquitectura:** una sección `.astro` nueva montada desde `HomeContent`, un
ícono SVG inline compartido por el header y el panel mobile, la plantilla de
reporte como dato puro en `src/data/reporte.ts` (unit-testeable), y dos
plantillas de Issue en `.github/ISSUE_TEMPLATE/`. La lógica de copiar al
portapapeles se extrae a un módulo compartido para no quedar escrita tres veces.

**Stack:** Astro 7, TypeScript strict, Tailwind 4 con tokens semánticos,
Playwright, Vitest, axe-core.

**Spec:** `docs/superpowers/specs/2026-08-02-reportar-un-problema-design.md`

## Restricciones globales

- **Sin dependencias nuevas.** El ícono es un `<path>` SVG escrito a mano, no
  una librería. Sumar cualquier dependencia con hidratación exige justificarla
  por escrito antes (ver `portfolio-decisiones-tecnicas`).
- **Sin islands nuevos.** Todo el JavaScript de esta tarea es vanilla. Los
  islands de React siguen siendo `ThemeToggle` y `CopyEmail`.
- **Colores solo por token semántico** (`text-muted`, `border-border`,
  `text-accent`, `bg-surface`). Nunca un hexadecimal suelto.
- **Nada se comunica solo por color.** Todo control con ícono lleva nombre
  accesible.
- **`data-testid` en todo lo verificable.** Los selectores CSS viven solo dentro
  de los Page Objects, nunca en los `.spec.ts`.
- **ES y EN espejo**, delegando en un componente compartido que recibe `lang`.
- **TypeScript strict.** `npm run check` tiene que dar 0 errores. Ojo:
  `astro build` no verifica tipos en `.tsx`.
- **Sin marcas de IA en commits ni en archivos del repo.**
- **Correr la suite con `--workers=1`** y matar los puertos 4321 y 4322 antes.

---

## Estructura de archivos

**Se crean:**

- `.github/ISSUE_TEMPLATE/bug-es.yml` — formulario de Issue en español.
- `.github/ISSUE_TEMPLATE/bug-en.yml` — el mismo en inglés.
- `src/data/reporte.ts` — los campos de la plantilla y la función que arma el
  texto. Dato puro, sin DOM: es lo que hace que sea unit-testeable.
- `src/scripts/copiar.ts` — copiar al portapapeles en vanilla, compartido.
- `src/components/IconoBug.astro` — el SVG inline.
- `src/components/Reportar.astro` — la sección.
- `tests/unit/reporte.test.ts` — unit de la plantilla.
- `tests/e2e/reportar.spec.ts` — e2e de la sección y del acceso.
- `tests/e2e/pages/ReportarPage.ts` — Page Object.

**Se modifican:**

- `src/i18n/ui.ts` — claves nuevas en `ClaveUI`, `es` y `en`.
- `src/components/ContactoInline.astro` — pasa a usar `copiar.ts`.
- `src/components/HomeContent.astro` — monta la sección.
- `src/components/Header.astro` — el enlace-ícono en el grupo derecho.
- `src/components/NavMobile.astro` — el ítem de texto en el panel.
- `src/components/Footer.astro` — cuarto enlace de sección.
- `tests/e2e/navegacion.spec.ts:47` — el pie pasa de 3 a 4 enlaces.
- `tests/e2e/pages/HomePage.ts` — locators de la sección nueva.

---

## Task 1: La plantilla de reporte como dato

**Archivos:**
- Crear: `src/data/reporte.ts`
- Crear: `tests/unit/reporte.test.ts`

**Interfaces:**
- Consume: `Lang` de `src/i18n/ui.ts`.
- Produce: `plantillaReporte(lang: Lang): string` y
  `camposReporte: Record<Lang, string[]>`. Las tareas 3 y 4 las usan.

- [ ] **Paso 1: escribir el test que falla**

`tests/unit/reporte.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { camposReporte, plantillaReporte } from '../../src/data/reporte';

describe('camposReporte', () => {
  // Si un idioma suma un campo y el otro no, el reporte que llega cambia
  // según desde dónde se copió, y nadie se entera hasta leer dos issues.
  it('pide los mismos campos en los dos idiomas', () => {
    expect(camposReporte.en).toHaveLength(camposReporte.es.length);
  });

  it('no tiene campos vacíos', () => {
    for (const lang of ['es', 'en'] as const) {
      for (const campo of camposReporte[lang]) {
        expect(campo.trim().length, `campo vacío en ${lang}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('plantillaReporte', () => {
  it('incluye todos los campos del idioma pedido', () => {
    const texto = plantillaReporte('es');
    for (const campo of camposReporte.es) {
      expect(texto).toContain(campo);
    }
  });

  it('no mezcla idiomas', () => {
    expect(plantillaReporte('en')).not.toContain(camposReporte.es[0]);
  });

  // Es una plantilla para completar: cada campo deja lugar debajo. Sin esto
  // la función podría devolver los títulos pegados y el test seguiría verde.
  it('deja un espacio en blanco debajo de cada campo', () => {
    const texto = plantillaReporte('es');
    expect(texto.split('\n\n').length).toBeGreaterThan(camposReporte.es.length);
  });
});
```

- [ ] **Paso 2: correrlo y verificar que falla**

```bash
npx vitest run tests/unit/reporte.test.ts
```

Esperado: FAIL, `Failed to resolve import "../../src/data/reporte"`.

- [ ] **Paso 3: escribir la implementación mínima**

`src/data/reporte.ts`:

```ts
import type { Lang } from '../i18n/ui';

/**
 * Los campos que se piden en un reporte de defecto, y los que no.
 *
 * No se piden severidad ni prioridad: las estima quien tría, no quien reporta
 * — pedirlas invita a discutir la etiqueta en vez de describir el problema. No
 * se pide captura obligatoria: sube la fricción y la mayoría de los defectos
 * de este sitio se describen mejor en texto.
 */
export const camposReporte: Record<Lang, string[]> = {
  es: [
    'Qué pasó',
    'Pasos para reproducir',
    'Qué esperaba que pasara',
    'Qué pasó en cambio',
    'Navegador y sistema operativo',
    'Tamaño de pantalla',
  ],
  en: [
    'What happened',
    'Steps to reproduce',
    'What you expected',
    'What happened instead',
    'Browser and operating system',
    'Screen size',
  ],
};

/** La plantilla en texto plano, lista para pegar donde sea. */
export function plantillaReporte(lang: Lang): string {
  return camposReporte[lang].map((campo) => `**${campo}**\n\n`).join('\n');
}
```

- [ ] **Paso 4: correr el test y verificar que pasa**

```bash
npx vitest run tests/unit/reporte.test.ts
```

Esperado: PASS, 5 tests.

- [ ] **Paso 5: commit**

```bash
git add src/data/reporte.ts tests/unit/reporte.test.ts
git commit -m "feat: la plantilla de reporte queda como dato unit-testeable"
```

---

## Task 2: Las plantillas de Issue de GitHub

**Archivos:**
- Crear: `.github/ISSUE_TEMPLATE/bug-es.yml`
- Crear: `.github/ISSUE_TEMPLATE/bug-en.yml`

**Interfaces:**
- Consume: los campos de `camposReporte` (Task 1), replicados como campos del
  formulario de GitHub.
- Produce: los nombres de archivo `bug-es.yml` y `bug-en.yml`, que la Task 4
  usa en la query string `?template=`.

No lleva test automatizado: es configuración de GitHub, y verificar que GitHub
renderice su propio formulario es probar GitHub. Se verifica a ojo una vez.

- [ ] **Paso 1: crear la plantilla en español**

`.github/ISSUE_TEMPLATE/bug-es.yml`:

```yaml
name: Reportar un problema
description: Contame un defecto que encontraste en el sitio
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Gracias por tomarte el trabajo. Cuanto más concreto el reporte, más
        rápido se puede reproducir y arreglar.
  - type: textarea
    id: que-paso
    attributes:
      label: Qué pasó
    validations:
      required: true
  - type: textarea
    id: pasos
    attributes:
      label: Pasos para reproducir
      placeholder: |
        1.
        2.
        3.
    validations:
      required: true
  - type: textarea
    id: esperado
    attributes:
      label: Qué esperaba que pasara
    validations:
      required: true
  - type: textarea
    id: obtenido
    attributes:
      label: Qué pasó en cambio
    validations:
      required: true
  - type: input
    id: navegador
    attributes:
      label: Navegador y sistema operativo
      placeholder: Firefox 141 en Windows 11
    validations:
      required: false
  - type: input
    id: pantalla
    attributes:
      label: Tamaño de pantalla
      placeholder: Escritorio 1920x1080, o "celular"
    validations:
      required: false
```

- [ ] **Paso 2: crear la plantilla en inglés**

`.github/ISSUE_TEMPLATE/bug-en.yml`:

```yaml
name: Report a problem
description: Tell me about a defect you found on the site
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time. The more concrete the report, the faster it
        can be reproduced and fixed.
  - type: textarea
    id: what-happened
    attributes:
      label: What happened
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce
      placeholder: |
        1.
        2.
        3.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: What you expected
    validations:
      required: true
  - type: textarea
    id: actual
    attributes:
      label: What happened instead
    validations:
      required: true
  - type: input
    id: browser
    attributes:
      label: Browser and operating system
      placeholder: Firefox 141 on Windows 11
    validations:
      required: false
  - type: input
    id: screen
    attributes:
      label: Screen size
      placeholder: Desktop 1920x1080, or "phone"
    validations:
      required: false
```

- [ ] **Paso 3: verificar que los dos archivos son YAML válido**

```bash
node -e "const f=require('fs');for(const n of ['bug-es','bug-en']){const t=f.readFileSync('.github/ISSUE_TEMPLATE/'+n+'.yml','utf8');if(!t.includes('body:'))throw new Error(n);console.log(n,'ok',t.split('- type:').length-1,'bloques')}"
```

Esperado: `bug-es ok 7 bloques` y `bug-en ok 7 bloques` (6 campos + el bloque
markdown de encabezado).

- [ ] **Paso 4: commit**

```bash
git add .github/ISSUE_TEMPLATE/
git commit -m "feat: plantillas de issue para reportar defectos del sitio"
```

---

## Task 3: Extraer copiar al portapapeles a un módulo compartido

**Archivos:**
- Crear: `src/scripts/copiar.ts`
- Modificar: `src/components/ContactoInline.astro`

**Interfaces:**
- Produce: `engancharCopiar(opciones: OpcionesCopiar): void`, con
  `OpcionesCopiar = { selectorDisparador: string; texto: (disparador: HTMLElement) => string; alCopiar: (disparador: HTMLElement) => void; alFallar: (disparador: HTMLElement) => void }`.
  La Task 5 lo usa para el botón de la sección.

Es una refactorización pura: no cambia ningún comportamiento observable, así
que el gate es que los tests que ya existen sigan pasando sin tocarlos.

- [ ] **Paso 1: correr los tests del hero y anotar que están en verde**

```bash
npx playwright test tests/e2e/home.spec.ts --project=chromium --workers=1 -g "atajo de email"
```

Esperado: PASS, 4 tests. Este es el estado que la refactorización no puede
romper.

- [ ] **Paso 2: escribir el módulo**

`src/scripts/copiar.ts`:

```ts
/**
 * Copiar al portapapeles en vanilla, compartido por el atajo de email del hero
 * y por la sección de reportar. El island de React `CopyEmail` no lo usa: es
 * otro modelo de ejecución y forzarlo a compartir código complica las dos
 * puntas sin beneficio.
 *
 * El enganche es por delegación en `document` para sobrevivir a las view
 * transitions, que reemplazan los nodos.
 */
export interface OpcionesCopiar {
  /** Selector del elemento que dispara la copia. */
  selectorDisparador: string;
  /** Qué texto copiar, dado el disparador. */
  texto: (disparador: HTMLElement) => string;
  alCopiar: (disparador: HTMLElement) => void;
  /**
   * Qué hacer si el portapapeles existía pero rechazó la escritura. No puede
   * quedarse callado ni decir que copió: mentir sobre el resultado es peor que
   * no copiar.
   */
  alFallar: (disparador: HTMLElement) => void;
}

export function engancharCopiar(opciones: OpcionesCopiar): void {
  document.addEventListener('click', async (evento) => {
    const objetivo = evento.target as Element | null;
    const disparador = objetivo?.closest<HTMLElement>(opciones.selectorDisparador);
    if (!disparador) return;
    // Sin portapapeles no se intercepta: el navegador sigue con la acción por
    // defecto del elemento, que en el hero es abrir el cliente de correo.
    if (!navigator.clipboard) return;

    evento.preventDefault();
    try {
      await navigator.clipboard.writeText(opciones.texto(disparador));
    } catch {
      opciones.alFallar(disparador);
      return;
    }
    opciones.alCopiar(disparador);
  });
}
```

- [ ] **Paso 3: reescribir el `<script>` de `ContactoInline.astro`**

Reemplazar el bloque `<script>` entero por:

```astro
<script>
  import { engancharCopiar } from '../scripts/copiar';

  const MS_AVISO = 2000;
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  function partes(enlace: HTMLElement) {
    return {
      etiqueta: enlace.querySelector<HTMLElement>('[data-etiqueta]'),
      aviso: enlace.parentElement?.querySelector<HTMLElement>('[data-testid="hero-email-aviso"]'),
    };
  }

  engancharCopiar({
    selectorDisparador: '[data-testid="hero-email"]',
    texto: (enlace) => (enlace as HTMLAnchorElement).href.replace(/^mailto:/, ''),
    alCopiar: (enlace) => {
      const { etiqueta, aviso } = partes(enlace);
      if (!etiqueta || !aviso) return;
      const copiado = enlace.dataset.copiado ?? '';
      etiqueta.textContent = copiado;
      aviso.textContent = copiado;

      // El texto original se restaura desde el atributo y no desde lo que hay
      // en pantalla: un segundo clic dentro de los dos segundos leería
      // "Copiado" y lo dejaría ahí para siempre.
      clearTimeout(temporizador);
      temporizador = setTimeout(() => {
        etiqueta.textContent = etiqueta.dataset.etiqueta ?? '';
        aviso.textContent = '';
      }, MS_AVISO);
    },
    // El portapapeles existía pero rechazó la escritura: se hace lo que el
    // enlace prometía, abrir el cliente de correo.
    alFallar: (enlace) => {
      window.location.href = (enlace as HTMLAnchorElement).href;
    },
  });
</script>
```

- [ ] **Paso 4: correr los mismos tests y verificar que siguen pasando**

```bash
npx playwright test tests/e2e/home.spec.ts --project=chromium --workers=1 -g "atajo de email"
```

Esperado: PASS, 4 tests. Si alguno se pone en rojo, la refactorización cambió
comportamiento y hay que arreglarla, no ajustar el test.

- [ ] **Paso 5: verificar tipos**

```bash
npx astro check
```

Esperado: 0 errores.

- [ ] **Paso 6: commit**

```bash
git add src/scripts/copiar.ts src/components/ContactoInline.astro
git commit -m "refactor: copiar al portapapeles pasa a un modulo compartido"
```

---

## Task 4: Claves de traducción

**Archivos:**
- Modificar: `src/i18n/ui.ts`

**Interfaces:**
- Produce: las claves `nav.reportar`, `reportar.abrir`, `reportar.titulo`,
  `reportar.bajada`, `reportar.plantillaTitulo`, `reportar.enGithub`,
  `reportar.copiar`, `reportar.copiado`, `reportar.errorCopiar`,
  `reportar.despues`. Las tareas 5 y 6 las consumen.

- [ ] **Paso 1: agregar las claves al tipo `ClaveUI`**

En `src/i18n/ui.ts`, al final de la unión (después de
`'formacion.estado.intermedio'`, cambiando su `;` por `|`):

```ts
  | 'formacion.estado.intermedio'
  | 'nav.reportar'
  | 'reportar.abrir'
  | 'reportar.titulo'
  | 'reportar.bajada'
  | 'reportar.plantillaTitulo'
  | 'reportar.enGithub'
  | 'reportar.copiar'
  | 'reportar.copiado'
  | 'reportar.errorCopiar'
  | 'reportar.despues';
```

- [ ] **Paso 2: correr `astro check` y verificar que falla**

```bash
npx astro check
```

Esperado: FAIL. Los diccionarios `es` y `en` están tipados como
`Diccionario = Record<ClaveUI, string>` y ahora les faltan 10 claves.

- [ ] **Paso 3: agregar los textos en español**

En el objeto `es`, después de `'formacion.estado.intermedio'`:

```ts
  'nav.reportar': 'Reportar',
  'reportar.abrir': 'Reportar un problema del sitio',
  'reportar.titulo': 'Reportar un problema',
  'reportar.bajada': 'Este sitio es mi propio objeto de prueba. Si encontraste algo que no funciona como debería, contámelo: es la clase de ayuda que más agradezco.',
  'reportar.plantillaTitulo': 'Así pido un reporte',
  'reportar.enGithub': 'Reportar en GitHub',
  'reportar.copiar': 'Copiar la plantilla',
  'reportar.copiado': 'Plantilla copiada',
  'reportar.errorCopiar': 'No se pudo copiar. Seleccionala a mano.',
  'reportar.despues': 'Leo todo lo que llega. Lo que sea un defecto real se arregla; lo que no, te explico por qué.',
```

- [ ] **Paso 4: agregar los textos en inglés**

En el objeto `en`, en la misma posición:

```ts
  'nav.reportar': 'Report',
  'reportar.abrir': 'Report a problem with the site',
  'reportar.titulo': 'Report a problem',
  'reportar.bajada': "This site is my own test object. If you found something that doesn't work the way it should, tell me: it's the kind of help I appreciate most.",
  'reportar.plantillaTitulo': 'How I ask for a report',
  'reportar.enGithub': 'Report on GitHub',
  'reportar.copiar': 'Copy the template',
  'reportar.copiado': 'Template copied',
  'reportar.errorCopiar': "Couldn't copy. Select it manually.",
  'reportar.despues': "I read everything that comes in. Anything that's a real defect gets fixed; anything that isn't, I'll explain why.",
```

- [ ] **Paso 5: correr `astro check` y los unit y verificar que pasan**

```bash
npx astro check
npx vitest run
```

Esperado: 0 errores y 58 tests en verde (53 previos + 5 de la Task 1).

- [ ] **Paso 6: commit**

```bash
git add src/i18n/ui.ts
git commit -m "feat: textos de la seccion para reportar un problema"
```

---

## Task 5: La sección `Reportar`

**Archivos:**
- Crear: `src/components/Reportar.astro`
- Crear: `tests/e2e/pages/ReportarPage.ts`
- Crear: `tests/e2e/reportar.spec.ts`
- Modificar: `src/components/HomeContent.astro`

**Interfaces:**
- Consume: `plantillaReporte` (Task 1), los nombres `bug-es.yml`/`bug-en.yml`
  (Task 2), `engancharCopiar` (Task 3), las claves `reportar.*` (Task 4).
- Produce: la sección con `id="reportar"` y los testids `bloque-reportar`,
  `reportar-plantilla`, `reportar-github`, `reportar-copiar`,
  `reportar-aviso`. La Task 6 enlaza contra `#reportar`.

- [ ] **Paso 1: escribir el Page Object**

`tests/e2e/pages/ReportarPage.ts`:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

export class ReportarPage extends BasePage {
  readonly bloque: Locator;
  readonly plantilla: Locator;
  readonly enGithub: Locator;
  readonly botonCopiar: Locator;
  readonly aviso: Locator;
  /** El acceso del navbar en desktop: ícono con nombre accesible. */
  readonly accesoDesktop: Locator;
  /** El acceso dentro del panel `<details>` de pantallas chicas. */
  readonly accesoMobile: Locator;

  constructor(page: Page) {
    super(page);
    this.bloque = page.getByTestId('bloque-reportar');
    this.plantilla = page.getByTestId('reportar-plantilla');
    this.enGithub = page.getByTestId('reportar-github');
    this.botonCopiar = page.getByTestId('reportar-copiar');
    this.aviso = page.getByTestId('reportar-aviso');
    this.accesoDesktop = page.getByTestId('nav-reportar');
    this.accesoMobile = page.getByTestId('m-nav-reportar');
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
```

- [ ] **Paso 2: escribir los tests que fallan**

`tests/e2e/reportar.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { ReportarPage } from './pages/ReportarPage';
import { camposReporte } from '../../src/data/reporte';

test.describe('Sección Reportar un problema', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`la sección está en la home en ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      await expect(reportar.bloque).toBeVisible();
      await expect(page.locator('#reportar')).toHaveCount(1);
    });

    // La plantilla se muestra, no se describe: quien solo lee ya se lleva la
    // señal, y el botón de copiar no copia algo invisible.
    test(`la plantilla está a la vista con todos sus campos en ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      const texto = await reportar.plantilla.textContent();
      for (const campo of camposReporte[lang]) {
        expect(texto, `falta el campo "${campo}" en ${lang}`).toContain(campo);
      }
    });

    test(`el enlace a GitHub apunta a la plantilla de ${lang}`, async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir(lang);
      await expect(reportar.enGithub).toHaveAttribute(
        'href',
        `https://github.com/Malu-gani/portfolio/issues/new?template=bug-${lang}.yml`
      );
    });
  }

  // El repo exige rel="noopener" en todo target="_blank" (enlaces.spec.ts).
  // Sin esto el enlace nuevo rompe el barrido en las 11 rutas del sitio.
  test('el enlace a GitHub abre en pestaña nueva con rel de seguridad', async ({ page }) => {
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await expect(reportar.enGithub).toHaveAttribute('target', '_blank');
    await expect(reportar.enGithub).toHaveAttribute('rel', /noopener/);
  });

  test('copiar la plantilla la deja en el portapapeles', async ({ context, page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Clipboard solo en Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await reportar.botonCopiar.click();
    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    for (const campo of camposReporte.es) {
      expect(copiado).toContain(campo);
    }
    await expect(reportar.aviso).toHaveText('Plantilla copiada');
  });

  // Mentir sobre el resultado es peor que no copiar.
  test('si falla la copia, avisa en vez de decir que copió', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Sobrescribe navigator.clipboard; estable solo en Chromium');
    await page.addInitScript(() => {
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error('permiso denegado')) },
      });
    });
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await reportar.botonCopiar.click();
    await expect(reportar.aviso).toHaveText('No se pudo copiar. Seleccionala a mano.');
  });
});

// El botón de copiar no puede esconder la plantilla detrás suyo: sin
// JavaScript tiene que seguir estando toda a la vista para seleccionarla.
test.describe('La sección Reportar sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la plantilla sigue visible y el enlace a GitHub funciona', async ({ page }) => {
    const reportar = new ReportarPage(page);
    await reportar.abrir('es');
    await expect(reportar.plantilla).toBeVisible();
    await expect(reportar.enGithub).toHaveAttribute('href', /issues\/new/);
  });
});
```

- [ ] **Paso 3: correrlos y verificar que fallan**

```bash
npx playwright test tests/e2e/reportar.spec.ts --project=chromium --workers=1
```

Esperado: FAIL en todos, con timeouts esperando `bloque-reportar`.

- [ ] **Paso 4: escribir la sección**

`src/components/Reportar.astro`:

```astro
---
import { plantillaReporte } from '../data/reporte';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

/**
 * El sitio se ofrece como objeto de prueba. La plantilla se muestra en la
 * página en vez de describirse: quien solo lee ya se lleva la señal de cómo se
 * pide un reporte, y el botón de copiar no copia algo invisible.
 *
 * Nada del visitante se precarga en la URL del Issue. Se evaluó completar
 * navegador, viewport y tema automáticamente y se descartó: son datos del
 * visitante viajando en una URL para ahorrarle tres renglones.
 */
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

// GitHub no tiene i18n en las plantillas de Issue: van dos archivos y cada
// idioma enlaza directo al suyo, así nadie pasa por el selector.
const issueNuevo = `https://github.com/Malu-gani/portfolio/issues/new?template=bug-${lang}.yml`;
const plantilla = plantillaReporte(lang);
---
<section data-testid="bloque-reportar" id="reportar" class="revelar scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('reportar.titulo')}</h2>
  <p class="mx-auto mt-3 max-w-prose text-center text-muted">{t('reportar.bajada')}</p>

  <h3 class="mt-8 text-center text-sm font-semibold text-text">{t('reportar.plantillaTitulo')}</h3>
  <pre data-testid="reportar-plantilla"
    class="mx-auto mt-3 max-w-prose overflow-x-auto rounded-lg border border-border bg-surface p-5 font-mono text-sm text-muted">{plantilla}</pre>

  <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
    <a href={issueNuevo} data-testid="reportar-github" target="_blank" rel="noopener noreferrer"
      class="rounded-md border border-accent px-4 py-2 text-sm text-accent transition-colors hover:bg-surface">
      {t('reportar.enGithub')}
    </a>
    <button type="button" data-testid="reportar-copiar"
      data-copiado={t('reportar.copiado')} data-error={t('reportar.errorCopiar')}
      class="rounded-md border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
      {t('reportar.copiar')}
    </button>
  </div>

  <p data-testid="reportar-aviso" role="status" aria-live="polite"
    class="mt-3 text-center text-sm text-muted"></p>

  <p class="mx-auto mt-6 max-w-prose text-center text-sm text-muted">{t('reportar.despues')}</p>
</section>

<script>
  import { engancharCopiar } from '../scripts/copiar';

  const MS_AVISO = 3000;
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  function avisar(texto: string) {
    const aviso = document.querySelector<HTMLElement>('[data-testid="reportar-aviso"]');
    if (!aviso) return;
    aviso.textContent = texto;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      aviso.textContent = '';
    }, MS_AVISO);
  }

  engancharCopiar({
    selectorDisparador: '[data-testid="reportar-copiar"]',
    // Se copia lo que está en pantalla, no una segunda copia del texto: si el
    // bloque cambiara, lo copiado cambia con él y no quedan dos verdades.
    texto: () =>
      document.querySelector<HTMLElement>('[data-testid="reportar-plantilla"]')?.textContent ?? '',
    alCopiar: (boton) => avisar(boton.dataset.copiado ?? ''),
    alFallar: (boton) => avisar(boton.dataset.error ?? ''),
  });
</script>
```

- [ ] **Paso 5: montar la sección en la home**

En `src/components/HomeContent.astro`, agregar el import junto a los demás:

```astro
import Reportar from './Reportar.astro';
```

y montarla después del bloque de contacto, antes del `<script>`:

```astro
<Reportar lang={lang} />
```

- [ ] **Paso 6: correr los tests y verificar que pasan**

```bash
npx playwright test tests/e2e/reportar.spec.ts --project=chromium --workers=1
npx astro check
```

Esperado: 10 tests en verde y 0 errores de tipos.

- [ ] **Paso 7: commit**

```bash
git add src/components/Reportar.astro src/components/HomeContent.astro tests/e2e/reportar.spec.ts tests/e2e/pages/ReportarPage.ts
git commit -m "feat: seccion para reportar un problema al cierre de la home"
```

---

## Task 6: El acceso en el navbar

**Archivos:**
- Crear: `src/components/IconoBug.astro`
- Modificar: `src/components/Header.astro`
- Modificar: `src/components/NavMobile.astro`
- Modificar: `tests/e2e/reportar.spec.ts`

**Interfaces:**
- Consume: `#reportar` (Task 5), `nav.reportar` y `reportar.abrir` (Task 4).
- Produce: los testids `nav-reportar` y `m-nav-reportar`.

**Dos trampas del repo que esta tarea tiene que esquivar:**

1. El acceso de desktop lleva `data-seccion="reportar"` y el de mobile **no**.
   El scroll-spy indexa en un `Map` por `data-seccion`: dos enlaces con el
   mismo id harían que uno pise al otro. Los ítems del panel mobile ya hoy no
   llevan ese atributo, por el mismo motivo.
2. El ícono va sin texto visible, así que el nombre accesible es obligatorio.
   No es trámite: el toggle de tema se quedó sin nombre accesible en pantallas
   chicas y hubo que arreglarlo (commit `531d8dc`). Es la trampa propia de este
   patrón.

- [ ] **Paso 1: escribir los tests que fallan**

Agregar al final de `tests/e2e/reportar.spec.ts`:

```ts
test.describe('El acceso del navbar', () => {
  test.describe('en desktop', () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    // Va sin texto visible: sin nombre accesible es un enlace mudo para un
    // lector de pantalla. Es lo que le pasó al toggle de tema (531d8dc).
    test('el ícono tiene nombre accesible', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(reportar.accesoDesktop).toBeVisible();
      await expect(reportar.accesoDesktop).toHaveAccessibleName(
        'Reportar un problema del sitio'
      );
    });

    test('el ícono ancla a la sección', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(reportar.accesoDesktop).toHaveAttribute('href', '#reportar');
      await reportar.accesoDesktop.click();
      await expect(page).toHaveURL(/#reportar$/);
      await expect(reportar.bloque).toBeInViewport();
    });

    // No compite con Proyectos: no entra en la lista de secciones, entra en el
    // grupo de herramientas de la derecha junto a idioma y tema.
    test('no entra en la lista de secciones', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      await expect(page.getByTestId('nav-secciones').getByRole('link')).toHaveCount(6);
    });

    // Fuera de la home el ancla suelta no lleva a ningún lado.
    test('fuera de la home apunta a la home posicionada', async ({ page }) => {
      await page.goto('/en/contact');
      await expect(page.getByTestId('nav-reportar')).toHaveAttribute('href', '/en/#reportar');
    });
  });

  test.describe('en pantalla chica', () => {
    test.use({ viewport: { width: 375, height: 700 } });

    test('el ítem está en el panel desplegable, con texto', async ({ page }) => {
      const reportar = new ReportarPage(page);
      await reportar.abrir('es');
      // El panel es un `<details>`: lo que abre es el `<summary>`, que ya
      // tiene su propio nombre accesible ("Abrir menú").
      await page.getByTestId('nav-mobile').getByRole('button', { name: 'Abrir menú' }).click();
      await expect(reportar.accesoMobile).toBeVisible();
      await expect(reportar.accesoMobile).toHaveText('Reportar');
    });
  });
});
```

- [ ] **Paso 2: correrlos y verificar que fallan**

```bash
npx playwright test tests/e2e/reportar.spec.ts --project=chromium --workers=1 -g "acceso del navbar"
```

Esperado: FAIL, timeouts esperando `nav-reportar`.

- [ ] **Paso 3: escribir el ícono**

`src/components/IconoBug.astro`:

```astro
---
/**
 * Ícono de bug, SVG inline y no una librería: la regla del proyecto exige
 * justificar por escrito toda dependencia nueva, y un `<path>` no la
 * justifica. Va siempre `aria-hidden`: el nombre accesible lo pone el control
 * que lo contiene, no el dibujo.
 */
interface Props { clase?: string }
const { clase = 'h-5 w-5' } = Astro.props;
---
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" class={clase} aria-hidden="true">
  <path d="M8 6a4 4 0 0 1 8 0v1H8V6Z" />
  <rect x="7" y="7" width="10" height="11" rx="5" />
  <path d="M3 11h4M17 11h4M3 17h4M17 17h4M5 6l2 2M19 6l-2 2" />
</svg>
```

- [ ] **Paso 4: agregar el enlace-ícono al header**

En `src/components/Header.astro`, importar el ícono:

```astro
import IconoBug from './IconoBug.astro';
```

y reemplazar el `<div class="flex gap-2">` por:

```astro
    <div class="flex items-center gap-2">
      <!--
        El acceso a reportar no entra en la lista de secciones: entra acá, en
        el grupo de herramientas. Así deja de ser hermano de "Proyectos" -con
        el que no debe competir- y pasa a leerse como lo que es, una acción y
        no un destino del recorrido. De paso no ensancha la fila de secciones,
        que es la que se aprieta en pantallas medianas.

        Lleva `data-seccion` y el del panel mobile no: el scroll-spy indexa por
        ese atributo en un Map y dos enlaces con el mismo id se pisarían.
      -->
      <a href={enHome ? '#reportar' : `${home}#reportar`}
        data-testid="nav-reportar" data-seccion="reportar"
        aria-label={t('reportar.abrir')} title={t('reportar.abrir')}
        class="hidden h-9 w-9 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-accent hover:text-accent focus-visible:text-accent aria-[current=true]:text-accent sm:flex">
        <IconoBug />
      </a>
      <LangToggle />
      <ThemeToggle
        etiqueta={t('tema.cambiar')}
        etiquetaClaro={t('tema.claro')}
        etiquetaOscuro={t('tema.oscuro')}
        client:load
      />
    </div>
```

- [ ] **Paso 5: agregar el ítem al panel mobile**

En `src/components/Header.astro`, pasarle el dato a `NavMobile`:

```astro
    <NavMobile lang={lang} enHome={enHome} secciones={secciones}
      reportar={{ href: enHome ? '#reportar' : `${home}#reportar`, texto: t('nav.reportar') }} />
```

En `src/components/NavMobile.astro`, agregar a `Props`:

```ts
  reportar: { href: string; texto: string };
```

extraerlo del destructuring:

```ts
const { lang, enHome, secciones, reportar } = Astro.props;
```

y agregar el ítem al final del `<ul>`, después del `map`:

```astro
    <!--
      Acá va con texto y no con ícono: el panel es una lista vertical con
      espacio de sobra, y un ícono suelto entre palabras se lee peor. La línea
      lo separa porque es una acción, no una sección más del recorrido.

      Sin `data-seccion`, igual que el resto de los ítems del panel: el
      scroll-spy indexa por ese atributo y el enlace de desktop ya lo ocupa.
    -->
    <li class="mt-1 border-t border-border pt-1">
      <a href={reportar.href} data-testid="m-nav-reportar"
        class="block rounded-md px-3 py-2 text-sm text-text hover:bg-bg">{reportar.texto}</a>
    </li>
```

- [ ] **Paso 6: correr los tests y verificar que pasan**

```bash
npx playwright test tests/e2e/reportar.spec.ts --project=chromium --workers=1
npx astro check
```

Esperado: 15 tests en verde y 0 errores de tipos.

- [ ] **Paso 7: commit**

```bash
git add src/components/IconoBug.astro src/components/Header.astro src/components/NavMobile.astro tests/e2e/reportar.spec.ts
git commit -m "feat: acceso a reportar en el navbar, icono en desktop y texto en mobile"
```

---

## Task 7: El enlace del pie

**Archivos:**
- Modificar: `src/components/Footer.astro`
- Modificar: `tests/e2e/navegacion.spec.ts:47`

El pie lista tres secciones a propósito —"los destinos que alguien busca cuando
terminó de leer, no la navegación entera"—. Reportar entra porque cumple
exactamente ese criterio: es algo que se busca al final, no al principio.

- [ ] **Paso 1: actualizar el test que va a fallar**

En `tests/e2e/navegacion.spec.ts`, cambiar la línea 47:

```ts
    await expect(pie.getByTestId('pie-secciones').getByRole('link')).toHaveCount(4);
```

- [ ] **Paso 2: correrlo y verificar que falla**

```bash
npx playwright test tests/e2e/navegacion.spec.ts --project=chromium --workers=1 -g "el pie enlaza"
```

Esperado: FAIL, `Expected: 4, Received: 3`.

- [ ] **Paso 3: agregar la sección al pie**

En `src/components/Footer.astro`, en el array `secciones`:

```ts
const secciones = [
  { id: 'proyectos', texto: t('nav.proyectos') },
  { id: 'formacion', texto: t('nav.formacion') },
  { id: 'contacto', texto: t('nav.contacto') },
  { id: 'reportar', texto: t('nav.reportar') },
];
```

y actualizar el comentario de arriba, que dice "Tres secciones y no las seis
del navbar":

```ts
// Cuatro secciones y no las seis del navbar: el pie repite los destinos que
// alguien busca cuando terminó de leer, no duplica la navegación entera.
// Reportar entra por ese mismo criterio -- es algo que se busca al final.
```

- [ ] **Paso 4: correr el test y verificar que pasa**

```bash
npx playwright test tests/e2e/navegacion.spec.ts --project=chromium --workers=1 -g "el pie enlaza"
```

Esperado: PASS.

- [ ] **Paso 5: commit**

```bash
git add src/components/Footer.astro tests/e2e/navegacion.spec.ts
git commit -m "feat: el pie enlaza la seccion para reportar un problema"
```

---

## Task 8: Cerrar los gates

**Archivos:**
- Modificar: capturas en `tests/e2e/visual.spec.ts-snapshots/` (regeneradas)

El header cambia en todas las páginas, así que **las 8 capturas** se mueven, no
solo las de la home.

- [ ] **Paso 1: matar los puertos y correr la suite entera**

```bash
npx playwright test --workers=1
```

Esperado: las 8 capturas visuales en rojo por el header nuevo; todo lo demás en
verde. Si algo que no sea visual falla, arreglarlo antes de seguir.

- [ ] **Paso 2: regenerar las capturas**

```bash
npx playwright test tests/e2e/visual.spec.ts --project=chromium --workers=1 --update-snapshots
```

- [ ] **Paso 3: mirar las capturas nuevas a ojo**

Abrir `tests/e2e/visual.spec.ts-snapshots/-es--light-chromium-win32.png` y
confirmar tres cosas: que el ícono de bug se ve junto a idioma y tema, que la
sección aparece al cierre con la plantilla en su bloque, y que nada más se
movió. Regenerar sin mirar convierte la captura en un sello de goma.

- [ ] **Paso 4: correr la suite entera de nuevo**

```bash
npx playwright test --workers=1
```

Esperado: 0 fallas. Verificar que el archivo de salida tenga **un solo
resumen**: dos resúmenes superpuestos significa que quedó una corrida vieja
mezclada y el resultado no es confiable.

- [ ] **Paso 5: correr el resto de los gates**

```bash
npx astro check
npm run test:unit
npm run check:listo
```

Esperado: 0 errores, 58 unit en verde, "Listo para publicar".

- [ ] **Paso 6: Lighthouse**

```bash
npm run build
npx lhci collect --url=http://localhost:4321/es/ --numberOfRuns=1
```

`lhci autorun` no funciona en esta máquina Windows, pero el CLI directo sí. El
exit code es 1 aunque escriba el JSON: ignorarlo y leer el archivo. Gates:
performance ≥ 0.9 y accesibilidad = 1.0. La sección no suma hidratación, así
que no debería moverse nada; si baja, la causa está en otro lado.

- [ ] **Paso 7: commit**

```bash
git add tests/e2e/visual.spec.ts-snapshots/
git commit -m "test: se regeneran las capturas con la seccion para reportar"
```

- [ ] **Paso 8: verificar la plantilla de Issue en GitHub a ojo**

Con la rama pusheada, abrir
`https://github.com/Malu-gani/portfolio/issues/new?template=bug-es.yml` y
confirmar que el formulario renderiza los seis campos. Es lo único de este
trabajo que ningún test cubre, y el modo de fallar es silencioso: un `.yml` mal
formado hace que GitHub ignore la plantilla y muestre un Issue en blanco, sin
avisar. **No abrir el Issue** — solo mirar el formulario.

---

## Qué queda fuera

- Precargar contexto del visitante en la URL del Issue.
- Cualquier servicio externo de formularios.
- Crear Issues desde el sitio por API.
- Mostrar en la página los Issues ya reportados: exige llamar a la API de
  GitHub en build y ata la compilación a un servicio externo.
