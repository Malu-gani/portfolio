# Formación — copy honesto, corrección UTN y badges — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir el copy de las 4 tarjetas de Formación (estados honestos,
título/carga horaria reales de UTN), sumar una línea de descripción por
formación, y pasar el estado de texto plano a badge pill.

**Architecture:** Cambios de datos/copy en `src/data/formacion.ts` y
`src/i18n/ui.ts` (ES/EN), consumidos por `src/components/Formacion.astro`
(Astro + Tailwind, sin JS nuevo). Verificación con Vitest (unit) y Playwright
(e2e) ya existentes en el repo.

**Tech Stack:** Astro, TypeScript, Tailwind CSS, Vitest, Playwright.

## Global Constraints

- Ningún `data-testid` existente cambia (`bloque-formacion`, `formacion-item`,
  `formacion-estado`).
- El ítem de inglés (`id: 'ingles'`) nunca suma `descripcionClave`, ni ningún
  texto con `/` o códigos CEFR en `tituloClave`/`institucionClave`/
  `detalleClave`/`estadoClave` — hay un test existente que lo protege
  ([formacion.test.ts:41](../../../tests/unit/formacion.test.ts#L41)).
- El estado (`EstadoFormacion`: `completado`/`examen-pendiente`/
  `sin-completar`/`nivel`) de cada ítem no cambia, solo el texto que lo
  declara.
- Todo texto nuevo va en los dos idiomas (`es` y `en`) en `src/i18n/ui.ts`.

---

## Task 1: Sumar `descripcionClave` al modelo de datos

**Files:**
- Modify: `src/i18n/ui.ts:57` (después de `formacion.bootcamp.detalle`), `:60` (después de `formacion.istqb.detalle`), `:63` (después de `formacion.utn.detalle`) — sumar 3 claves nuevas al tipo `ClaveUI`
- Modify: `src/i18n/ui.ts:138,141,144` (bloque ES) y `:218,221,224` (bloque EN) — sumar los 3 valores nuevos
- Modify: `src/data/formacion.ts:28-35` (interfaz `ItemFormacion`) y `:37-79` (array `formacion`, ítems `bootcamp`/`istqb`/`utn`)
- Test: `tests/unit/formacion.test.ts`

**Interfaces:**
- Produces: `ItemFormacion.descripcionClave?: ClaveUI` — campo opcional que Task 3 lee para renderizar la línea de descripción.

- [ ] **Step 1: Escribir el test que falla**

Agregar al final de `tests/unit/formacion.test.ts` (antes del cierre del
`describe`):

```ts
  // La descripción es opcional: bootcamp/istqb/utn explican qué aportan al
  // perfil de QA, inglés no la suma porque ya está cubierto por `detalle`.
  it('bootcamp, istqb y utn declaran una descripción con contenido en los dos idiomas', () => {
    for (const id of ['bootcamp', 'istqb', 'utn'] as const) {
      const item = formacion.find((f) => f.id === id);
      expect(item?.descripcionClave, `${id} sin descripcionClave`).toBeDefined();
      for (const lang of ['es', 'en'] as const) {
        const texto = ui[lang][item!.descripcionClave!];
        expect(texto?.trim().length, `${id} sin descripción en ${lang}`).toBeGreaterThan(0);
      }
    }
  });

  it('inglés no declara descripción (ya cubierta por el detalle)', () => {
    const ingles = formacion.find((f) => f.id === 'ingles');
    expect(ingles?.descripcionClave).toBeUndefined();
  });
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run tests/unit/formacion.test.ts`
Expected: FAIL — error de compilación TypeScript, `descripcionClave` no
existe en `ItemFormacion` (el campo todavía no está declarado).

- [ ] **Step 3: Sumar las 3 claves nuevas al tipo `ClaveUI`**

En `src/i18n/ui.ts`, dentro del bloque `export type ClaveUI = ...`:

```ts
  | 'formacion.bootcamp.titulo'
  | 'formacion.bootcamp.institucion'
  | 'formacion.bootcamp.detalle'
  | 'formacion.bootcamp.descripcion'
  | 'formacion.istqb.titulo'
  | 'formacion.istqb.institucion'
  | 'formacion.istqb.detalle'
  | 'formacion.istqb.descripcion'
  | 'formacion.utn.titulo'
  | 'formacion.utn.institucion'
  | 'formacion.utn.detalle'
  | 'formacion.utn.descripcion'
  | 'formacion.ingles.titulo'
```

(Cada línea nueva va inmediatamente después de su `.detalle` correspondiente,
antes de la clave del siguiente ítem.)

- [ ] **Step 4: Sumar los valores ES**

En el bloque `es` de `ui.ts`, después de cada `detalle` correspondiente:

```ts
  'formacion.bootcamp.detalle': '43,5 horas · 372 lecciones',
  'formacion.bootcamp.descripcion': 'Fundamentos de testing manual y automatizado: diseño de casos, Agile/Scrum, API testing con Postman, y nociones de Selenium, JMeter y SQL.',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lecciones',
  'formacion.istqb.descripcion': 'Fundamentos de testing según el estándar ISTQB: ciclo de vida, técnicas de diseño de casos, tipos de prueba.',
```

Y para UTN (el `detalle` y `titulo` de UTN se corrigen en el Task 2 — acá
solo se agrega la clave `descripcion` nueva, sin tocar las otras):

```ts
  'formacion.utn.descripcion': 'Operar en bolsa y administrar carteras: acciones, bonos, opciones, monedas, commodities y ETFs, con análisis fundamental y técnico.',
```

- [ ] **Step 5: Sumar los valores EN**

En el bloque `en` de `ui.ts`, mismo patrón:

```ts
  'formacion.bootcamp.detalle': '43.5 hours · 372 lessons',
  'formacion.bootcamp.descripcion': 'Manual and automated testing fundamentals: test case design, Agile/Scrum, API testing with Postman, and basics of Selenium, JMeter and SQL.',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lessons',
  'formacion.istqb.descripcion': 'Testing fundamentals per the ISTQB standard: software lifecycle, test design techniques, test types.',
```

```ts
  'formacion.utn.descripcion': 'Trading and portfolio management: stocks, bonds, options, currencies, commodities and ETFs, with fundamental and technical analysis.',
```

- [ ] **Step 6: Sumar el campo al tipo `ItemFormacion` y a los 3 ítems**

En `src/data/formacion.ts`:

```ts
export interface ItemFormacion {
  id: string;
  tituloClave: ClaveUI;
  institucionClave: ClaveUI;
  detalleClave: ClaveUI;
  descripcionClave?: ClaveUI;
  estadoClave: ClaveUI;
  estado: EstadoFormacion;
}
```

Y en el array, sumar `descripcionClave` a `bootcamp`, `istqb` y `utn` (no a
`ingles`):

```ts
  {
    id: 'bootcamp',
    tituloClave: 'formacion.bootcamp.titulo',
    institucionClave: 'formacion.bootcamp.institucion',
    detalleClave: 'formacion.bootcamp.detalle',
    descripcionClave: 'formacion.bootcamp.descripcion',
    estadoClave: 'formacion.estado.completado',
    estado: 'completado',
  },
  {
    id: 'istqb',
    tituloClave: 'formacion.istqb.titulo',
    institucionClave: 'formacion.istqb.institucion',
    detalleClave: 'formacion.istqb.detalle',
    descripcionClave: 'formacion.istqb.descripcion',
    estadoClave: 'formacion.estado.examenPendiente',
    estado: 'examen-pendiente',
  },
```

```ts
  {
    id: 'utn',
    tituloClave: 'formacion.utn.titulo',
    institucionClave: 'formacion.utn.institucion',
    detalleClave: 'formacion.utn.detalle',
    descripcionClave: 'formacion.utn.descripcion',
    estadoClave: 'formacion.estado.sinCompletar',
    estado: 'sin-completar',
  },
```

- [ ] **Step 7: Correr el test y verificar que pasa**

Run: `npx vitest run tests/unit/formacion.test.ts`
Expected: PASS (7 tests, incluidos los 2 nuevos).

- [ ] **Step 8: Commit**

```bash
git add src/i18n/ui.ts src/data/formacion.ts tests/unit/formacion.test.ts
git commit -m "feat: sumar descripcionClave a bootcamp, ISTQB y UTN en Formación"
```

---

## Task 2: Corregir el dato real de UTN y el copy de los estados

**Files:**
- Modify: `src/i18n/ui.ts:142,144` (ES) y `:222,224` (EN) — título y detalle de UTN
- Modify: `src/i18n/ui.ts:149-150` (ES) y `:229-230` (EN) — estado ISTQB y estado UTN
- Test: `tests/unit/formacion.test.ts`

**Interfaces:**
- Consumes: nada nuevo de Task 1 (son valores de string dentro de claves que ya existían).
- Produces: strings finales que Task 3 va a mostrar en la UI sin tocarlos más.

- [ ] **Step 1: Escribir el test que falla**

Agregar a `tests/unit/formacion.test.ts`:

```ts
  it('UTN muestra el título y la carga horaria reales del programa', () => {
    expect(ui.es['formacion.utn.titulo']).toBe('Experto Universitario en Mercado de Capitales');
    expect(ui.en['formacion.utn.titulo']).toBe('University Expert in Capital Markets');
    expect(ui.es['formacion.utn.detalle']).toBe('165 horas · 22 unidades · 2022');
    expect(ui.en['formacion.utn.detalle']).toBe('165 hours · 22 units · 2022');
  });

  it('los estados de ISTQB y UTN no suenan negativos ni prometen de más', () => {
    expect(ui.es['formacion.estado.examenPendiente']).toBe('Syllabus V4.0 completo · examen pendiente');
    expect(ui.en['formacion.estado.examenPendiente']).toBe('Syllabus V4.0 complete · exam pending');
    expect(ui.es['formacion.estado.sinCompletar']).toBe('Cursado');
    expect(ui.en['formacion.estado.sinCompletar']).toBe('Attended');
  });
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run tests/unit/formacion.test.ts`
Expected: FAIL — los valores actuales son `'Operador de Mercados
Financieros'`, `'94 horas · 12 unidades · 2022'`, `'Curso completo · examen
pendiente'` y `'Cursado sin completar'` (y sus equivalentes en inglés).

- [ ] **Step 3: Actualizar los valores en `ui.ts`**

Bloque ES:

```ts
  'formacion.utn.titulo': 'Experto Universitario en Mercado de Capitales',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '165 horas · 22 unidades · 2022',
```

```ts
  'formacion.estado.completado': 'Completado',
  'formacion.estado.examenPendiente': 'Syllabus V4.0 completo · examen pendiente',
  'formacion.estado.sinCompletar': 'Cursado',
  'formacion.estado.intermedio': 'Intermedio',
```

Bloque EN:

```ts
  'formacion.utn.titulo': 'University Expert in Capital Markets',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '165 hours · 22 units · 2022',
```

```ts
  'formacion.estado.completado': 'Completed',
  'formacion.estado.examenPendiente': 'Syllabus V4.0 complete · exam pending',
  'formacion.estado.sinCompletar': 'Attended',
  'formacion.estado.intermedio': 'Intermediate',
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run tests/unit/formacion.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ui.ts tests/unit/formacion.test.ts
git commit -m "fix: corregir título y carga horaria reales de UTN, y suavizar el copy de estados"
```

---

## Task 3: Badge pill + línea de descripción en `Formacion.astro`

**Files:**
- Create: `tests/e2e/utils/es-pill.ts`
- Modify: `tests/e2e/botones-accion.spec.ts:1-18` (usar el util en vez de la función local)
- Modify: `tests/e2e/home.spec.ts:192-202` (test "ningún ítem promete más" + 2 tests nuevos)
- Modify: `src/components/Formacion.astro`

**Interfaces:**
- Consumes: `ItemFormacion.descripcionClave` de Task 1; `formacion.estado.*` y `formacion.utn.*` de Task 2.
- Produces: `export async function esPill(locator: Locator): Promise<void>` desde `tests/e2e/utils/es-pill.ts`, usado por `botones-accion.spec.ts` y `home.spec.ts`.

- [ ] **Step 1: Extraer `esPill` a un util compartido**

Crear `tests/e2e/utils/es-pill.ts`:

```ts
import { expect, type Locator } from '@playwright/test';

/**
 * Guarda contra una regresión futura a `rounded-md`, mismo espíritu que el
 * test que protege contra el retorno del scroll-snap. Se afirma sobre la
 * relación real entre el radio y la altura (mitad de la altura = pill),
 * no sobre un valor de píxeles puntual: así no importa si Tailwind emite
 * `9999px` o el `calc(infinity * 1px)` de la v4.
 */
export async function esPill(locator: Locator): Promise<void> {
  const { radio, altura } = await locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const radioStr = style.borderTopLeftRadius;
    const radio = radioStr.includes('%') ? Infinity : parseFloat(radioStr);
    return { radio, altura: el.getBoundingClientRect().height };
  });
  expect(radio, `radio insuficiente para ser pill (altura ${altura}px)`).toBeGreaterThanOrEqual(altura / 2 - 1);
}
```

En `tests/e2e/botones-accion.spec.ts`, reemplazar las líneas 1-18 (el import
y la función local `esPill`) por:

```ts
import { test, expect } from '@playwright/test';
import { esPill } from './utils/es-pill';
```

(El resto del archivo, líneas 20 en adelante, no cambia.)

- [ ] **Step 2: Escribir los tests que fallan en `home.spec.ts`**

Reemplazar el test de las líneas 192-202 de `tests/e2e/home.spec.ts`:

```ts
  // Ninguno de los cuatro ítems puede prometer más de lo que hay: el de la UTN
  // se cursó sin rendir el examen final y el de ISTQB no está rendido.
  test('ningún ítem promete más de lo que hay', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const textos = (await home.itemsFormacion.allTextContents()).join(' ');
    expect(textos).toContain('Cursado');
    expect(textos).toContain('examen pendiente');
    expect(textos).toContain('Experto Universitario en Mercado de Capitales');
    expect(textos).not.toContain('Operador de Mercados Financieros');
    // "Título" o "Graduado" serían afirmaciones que no se sostienen.
    expect(textos).not.toMatch(/Graduado|Titulado|Certificado ISTQB/);
  });

  // Mismo criterio ya aplicado a los botones de acción: el estado no puede
  // volver a ser un rectángulo `rounded-md` sin que un test lo note.
  test('los 4 estados de Formación usan badge pill', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const estados = home.itemsFormacion.getByTestId('formacion-estado');
    const total = await estados.count();
    for (let i = 0; i < total; i++) {
      await esPill(estados.nth(i));
    }
  });

  // Bootcamp, ISTQB y UTN explican qué le aportan al perfil de QA; inglés no
  // suma esta línea porque ya está cubierto por su detalle.
  test('bootcamp, ISTQB y UTN muestran una descripción de qué aportan', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const items = home.itemsFormacion;
    await expect(items.nth(0)).toContainText('Fundamentos de testing manual y automatizado');
    await expect(items.nth(1)).toContainText('Fundamentos de testing según el estándar ISTQB');
    await expect(items.nth(2)).toContainText('Operar en bolsa y administrar carteras');
  });
```

Y agregar el import del util al principio del archivo:

```ts
import { esPill } from './utils/es-pill';
```

- [ ] **Step 3: Correr los tests y verificar que fallan**

Matar los puertos 4321/4322 si quedaron procesos colgados de una corrida
anterior, después:

Run: `npx playwright test home.spec.ts -g "ningún ítem promete|badge pill|muestran una descripción"`
Expected: FAIL — el badge sigue siendo texto plano (radio insuficiente para
ser pill) y no hay ninguna línea de descripción en el DOM todavía.

- [ ] **Step 4: Implementar los cambios en `Formacion.astro`**

Reemplazar el contenido completo de `src/components/Formacion.astro`:

```astro
---
import { formacion, type EstadoFormacion } from '../data/formacion';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

// El color acompaña al texto, nunca lo reemplaza: el estado siempre se lee.
const colorEstado: Record<EstadoFormacion, string> = {
  completado: 'border-est-paso text-est-paso',
  'examen-pendiente': 'border-sev-medio text-sev-medio',
  'sin-completar': 'border-border text-muted',
  nivel: 'border-border text-muted',
};
---
<section data-testid="bloque-formacion" id="formacion" class="revelar scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('formacion.titulo')}</h2>
  <p class="mx-auto mt-2 max-w-prose text-center text-muted">{t('formacion.bajada')}</p>

  <ul class="mt-6 space-y-3">
    {formacion.map((item) => (
      <li data-testid="formacion-item"
        class="rounded-lg border border-border bg-surface p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 class="text-base font-semibold text-text">{t(item.tituloClave)}</h3>
          <span data-testid="formacion-estado"
            class={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorEstado[item.estado]}`}>
            {t(item.estadoClave)}
          </span>
        </div>
        <p class="mt-1 text-sm text-muted">
          {t(item.institucionClave)} · {t(item.detalleClave)}
        </p>
        {item.descripcionClave && (
          <p class="mt-1 text-sm text-muted">{t(item.descripcionClave)}</p>
        )}
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npx playwright test home.spec.ts -g "ningún ítem promete|badge pill|muestran una descripción"`
Expected: PASS (3/3).

Run: `npx playwright test botones-accion.spec.ts`
Expected: PASS (import del util no rompió nada).

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/utils/es-pill.ts tests/e2e/botones-accion.spec.ts tests/e2e/home.spec.ts src/components/Formacion.astro
git commit -m "feat: badge pill y descripción por ítem en la sección Formación"
```

---

## Task 4: Verificación final y capturas visuales

**Files:**
- Modify (posiblemente): `tests/e2e/visual.spec.ts-snapshots/*` (regeneradas, no editadas a mano)

- [ ] **Step 1: Matar procesos colgados en los puertos de test**

Run (PowerShell): `Get-NetTCPConnection -LocalPort 4321,4322 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }`

- [ ] **Step 2: Correr toda la suite unitaria**

Run: `npx vitest run`
Expected: PASS, sin regresiones fuera de `formacion.test.ts`.

- [ ] **Step 3: Correr todo `astro check`**

Run: `npx astro check`
Expected: PASS, sin errores de tipos (confirma que `descripcionClave` está
bien tipado en todos los usos).

- [ ] **Step 4: Correr toda la suite e2e**

Run: `npx playwright test`
Expected: fallan únicamente los tests de `visual.spec.ts` que comparan
contra la home (cambió texto y apareció una línea nueva por tarjeta) — es lo
esperado, se resuelve en el próximo paso.

- [ ] **Step 5: Regenerar las capturas visuales**

Run: `npx playwright test visual.spec.ts --update-snapshots=all`

(Usar `=all`, no el flag sin argumento: el proyecto ya documentó que sin
`=all` no fuerza la reescritura si el diff cae dentro del umbral.)

- [ ] **Step 6: Correr toda la suite una vez más**

Run: `npx playwright test`
Expected: PASS completo.

- [ ] **Step 7: Commit de las capturas regeneradas**

```bash
git add tests/e2e/visual.spec.ts-snapshots
git commit -m "test: regenerar capturas visuales tras el nuevo copy y badges de Formación"
```

---

## Self-Review

**Cobertura de la spec:**
- Copy de estados (ISTQB, UTN) → Task 2.
- Corrección de título/carga horaria de UTN → Task 2.
- Badge pill en los 4 estados → Task 3.
- Línea de descripción en bootcamp/istqb/utn → Task 1 (datos) + Task 3 (render).
- Tests unitarios y e2e actualizados → Tasks 1, 2 y 3 cada uno con su propio ciclo.
- Capturas visuales regeneradas → Task 4.
- Fuera de alcance (`AboutContent.astro`, nivel CEFR de inglés) → no se tocan en ningún task, consistente con la spec.

**Placeholders:** ninguno — todo paso tiene código real, sin "TBD" ni "similar al Task N".

**Consistencia de tipos:** `descripcionClave?: ClaveUI` se define en Task 1
y se consume igual en Task 3 (`item.descripcionClave`); los nombres de test
(`esPill`) coinciden entre el archivo nuevo y sus dos usos.
