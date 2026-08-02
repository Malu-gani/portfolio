# Reorganización de secciones y restyle visual — Plan de implementación

> **Para quien ejecute esto:** SUB-SKILL REQUERIDA: usar `superpowers:subagent-driven-development`
> (recomendado) o `superpowers:executing-plans` para implementar tarea por tarea.
> Los pasos usan checkbox (`- [ ]`) para poder marcarlos.

**Objetivo:** Fusionar los carriles QA y Dev de la home en una sola sección con filtro, darle
presencia al hero con retrato, sumar una sección de Formación, y aplicar el tratamiento visual
que quedó fuera del tramo anterior — sin romper ningún gate que hoy está en verde.

**Arquitectura:** La home (`HomeContent.astro`) pasa a embeber el mismo
`ProyectoListadoFiltrable.astro` que sirve `/es/proyectos`, parametrizado por nivel de título y
por contexto de filtro. La formación se modela como datos tipados (`src/data/formacion.ts`) con
claves de i18n, igual que `src/data/stack.ts`, para poder verificarla desde un test unitario. El
tratamiento visual es CSS puro más un `IntersectionObserver` en vanilla, sin librerías nuevas ni
islands adicionales.

**Stack:** Astro 7 (static), Tailwind CSS 4 (`@theme inline` sobre variables CSS), React solo en
los islands existentes, Playwright (4 proyectos), Vitest, axe-core, Lighthouse CI.

**Spec de origen:** `docs/superpowers/specs/2026-08-02-rediseno-visual-y-secciones-design.md`

---

## Restricciones globales

Valen para **todas** las tareas. Cada tarea las hereda sin repetirlas.

- **Sin librerías nuevas.** Ni de animación, ni de iconos, ni de carrusel. El tratamiento visual
  es CSS y vanilla JS.
- **Sin islands nuevos.** React se queda en `ThemeToggle.tsx` y `CopyEmail.tsx`. Nada de este
  tramo justifica hidratación.
- **Todo estado de `hover` lleva su equivalente alcanzable por teclado.** En mobile el hover no
  existe y con teclado tampoco se dispara.
  - **Excepción resuelta el 02/08/2026, antes de ejecutar:** en `ProyectoCard.astro` el selector
    es `:focus-within`, **no** `:focus-visible`. El `<article>` no es focusable —el foco lo recibe
    el enlace del título, que cubre la card entera con `after:absolute`— así que `:focus-visible`
    sobre la card no se dispararía nunca: sería cumplir la letra y perder el efecto. Costo
    asumido: `:focus-within` también se activa al clickear con mouse, y la elevación queda puesta
    hasta que el foco se va. **Esto no es un hallazgo de revisión.**
- **El estado por defecto es visible.** Ninguna animación de entrada puede depender de JS para
  que el contenido se vea. Sin JavaScript, nada queda invisible.
- **El estado se declara en texto**, no solo por color o posición. Rige para severidad, estado de
  caso, nivel de stack y ahora estado de formación.
- **Los ids de sección van en español** (`#proyectos`, `#formacion`), con las etiquetas
  traducidas. Es la convención que ya rige para `#inicio`, `#sobre-mi`, `#contacto`.
- **Gates que tienen que quedar en verde al terminar cada tarea:** `npm run check`,
  `npm run check:listo`, `npm run test:unit`. La suite E2E completa y Lighthouse se corren en las
  tareas donde el plan lo pide explícitamente y en la Tarea 12.
- **Nunca `--update-snapshots` global.** Las capturas se regeneran con motivo escrito, en la
  Tarea 12.
- **Correr la suite redirigiendo a archivo, nunca con `| tail`.** `| tail` ya ocultó 45 fallas
  una vez. Usar `npm run test:e2e > /tmp/e2e.txt 2>&1; grep -E "passed|failed" /tmp/e2e.txt`.
- **Sin marcas de IA en el repo.** Ni en commits, ni en comentarios, ni en documentación.
- **Comentarios en el código:** solo donde expliquen un *porqué* no obvio, en el estilo que ya
  usa el repo (ver `ProyectoListadoFiltrable.astro`, `Header.astro`). No narrar lo que el código
  ya dice.

### Tres decisiones que la spec no resolvió y este plan sí

La spec dice, en su sección 4, que `ProyectoListadoFiltrable.astro` y `FiltroProyectos.astro`
quedan **sin cambios**. Eso no se sostiene al embeberlos en la home, por tres razones concretas:

1. **`ProyectoListadoFiltrable` renderiza un `<h1>`.** El hero ya tiene el h1 de la home. Embeberlo
   tal cual daría dos h1 y rompería `home.spec.ts` ("hay un único h1"). Se le agrega una prop
   `nivelTitulo`. Resuelto en la **Tarea 2**.
2. **Sus cards se renderizan con `nivelTitulo={2}`.** Dentro de una sección de la home cuyo
   encabezado es un h2, eso da h2 → h2 y después salta. Se deriva del nivel del listado.
   **Tarea 2**.
3. **El script del filtro hace `history.pushState({}, '', enlace.href)`**, y esos href apuntan a
   `/es/proyectos/dev`. En la home eso dejaría la URL en `/es/proyectos/dev` mostrando la home:
   recargar da otra página y el botón atrás queda inconsistente. En la home el filtro no toca la
   URL. **Tarea 2**.

### Un riesgo medido, para tener a mano

La referencia de la que salió el diseño (`https://adityasri.in/`) **no usa `scroll-snap`**:
medido, `getComputedStyle(document.documentElement).scrollSnapType` devuelve `none`. Usa
`padding: 96px` vertical por sección (`py-24`), encabezados centrados y sin `border-t` — eso sí
coincide con la spec. El `scroll-snap` es una decisión propia de la spec (3.6), no heredada, y la
propia spec exige verificarlo en navegador real antes de darlo por bueno (3.7). La **Tarea 9** lo
implementa detrás de esa verificación y define qué hacer si falla.

---

## Estructura de archivos

**Nuevos:**

| Archivo | Responsabilidad |
|---|---|
| `src/data/formacion.ts` | Los 4 ítems de formación como datos tipados con claves de i18n. Sin JSX. |
| `src/components/Formacion.astro` | Renderiza la sección `#formacion` a partir de esos datos. |
| `tests/unit/formacion.test.ts` | Que ningún ítem quede sin estado, con estado inválido, o con una clave que no exista en los dos diccionarios. |

**Modificados:**

| Archivo | Qué le pasa |
|---|---|
| `src/components/Hero.astro` | Una columna + retrato de 200 px con `astro:assets`. |
| `src/components/HomeContent.astro` | `#qa` + `#dev` → `#proyectos`; suma `#formacion`. |
| `src/components/ProyectoListadoFiltrable.astro` | Props `nivelTitulo` y `contexto`; orden por `destacado`. |
| `src/components/ProyectoCard.astro` | Elevación en hover **y** en focus-visible. |
| `src/components/StackGrid.astro` | Densidad de chips; ritmo de sección. |
| `src/components/Header.astro` | Items del navbar: `qa`+`dev` → `proyectos`, suma `formacion`. |
| `src/components/Footer.astro` | Estructura de la referencia. |
| `src/components/SobreMiResumen.astro` | Ritmo de sección (sin `border-t`, padding, encabezado). |
| `src/styles/global.css` | `scroll-snap`, `prefers-reduced-motion`, clases de revelado. |
| `src/i18n/ui.ts` | Claves nuevas; se retiran las de los bloques que desaparecen. |
| `tests/e2e/pages/HomePage.ts` | `SECCIONES` y locators nuevos. |
| `tests/e2e/home.spec.ts`, `navegacion.spec.ts`, `proyectos.spec.ts`, `a11y.spec.ts`, `visual.spec.ts` | Ver tabla de la sección 5 de la spec. |
| `tests/unit/i18n.test.ts` | Usa `'nav.qa'`, que deja de existir como item de navbar. |

**Sin cambios:** `FiltroProyectos.astro`, `ContactoInline.astro`, `ContactContent.astro`,
`AboutContent.astro`, `Tag.astro`, `CvButton.astro`, `astro.config.mjs`, `playwright.config.ts`.

---

## Tarea 1: `destacado` pasa de filtrar a ordenar

Hoy `destacado: true` decide qué entra en la home. Cuando la home muestre todo, el campo deja de
controlar nada. Pasa a definir el orden dentro de cada filtro. Se hace **primero** y aislado,
porque es la única parte que se puede verificar contra el listado actual sin haber tocado la home
todavía.

> **Corregida el 02/08/2026, durante la ejecución.** La versión original de esta tarea pedía un
> test e2e que afirmara que el destacado aparece primero en `/es/proyectos/todos`. **Ese test no
> podía fallar.** `gestor-operaciones` existe en las dos colecciones, las dos entradas tienen
> `destacado: true` y las dos tienen `fecha: 2026-07-30`, que es la máxima del contenido: el orden
> por fecha sola ya las deja primeras, así que una implementación que ignorara `destacado` daría
> exactamente la misma salida. Además el título esperado ("Registro de Operaciones") es el nombre
> del repositorio y no el `titulo` de ninguna entrada. La verificación se mueve a un test unitario
> sobre el comparador, con datos construidos que sí discriminan.

**Archivos:**
- Crear: `src/data/orden.ts`
- Crear: `tests/unit/orden.test.ts`
- Modificar: `src/components/ProyectoListadoFiltrable.astro:24`

**Interfaces:**
- Consume: nada.
- Produce: `ordenarPorDestacadoYFecha` en `src/data/orden.ts`. La Tarea 3 hereda el orden al
  embeber el componente en la home.

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/unit/orden.test.ts`, cubriendo los casos que discriminan de verdad: un destacado
**viejo** tiene que quedar antes que un no destacado **nuevo** —es el caso que separa la
implementación correcta de una que ordene solo por fecha, y el que no existe en el contenido
real—, el desempate por fecha dentro de cada grupo, y que la función no mute su entrada.

- [ ] **Paso 2: Correr el test y verificar que falla**

```bash
npm run test:unit > /tmp/t1.txt 2>&1; grep -E "orden|Cannot find" /tmp/t1.txt
```

Esperado: FAIL — no existe `src/data/orden.ts`.

- [ ] **Paso 3: Crear el comparador**

`src/data/orden.ts`, con la función pura exportada. Vive en `src/data/` y no dentro del
componente por la misma razón que `src/data/stack.ts`: desde un `.astro` no se puede afirmar nada
en un test unitario.

```ts
export interface Ordenable {
  fecha: Date;
  datos: { destacado: boolean };
}

export function ordenarPorDestacadoYFecha<T extends Ordenable>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.datos.destacado !== b.datos.destacado) return a.datos.destacado ? -1 : 1;
    return b.fecha.getTime() - a.fecha.getTime();
  });
}
```

- [ ] **Paso 4: Usarlo en el componente**

En `src/components/ProyectoListadoFiltrable.astro`, reemplazar el `.sort(...)` de la línea 24 por
una llamada a `ordenarPorDestacadoYFecha`, importada desde `../data/orden`.

- [ ] **Paso 5: Verificar**

```bash
npm run test:unit > /tmp/t1u.txt 2>&1; grep -E "Tests|failed" /tmp/t1u.txt
npm run check > /tmp/t1c.txt 2>&1; tail -5 /tmp/t1c.txt
npx playwright test proyectos.spec.ts --project=chromium > /tmp/t1e.txt 2>&1; grep -E "passed|failed" /tmp/t1e.txt
```

Esperado: los tres en verde. El e2e no verifica el orden —no puede— pero confirma que el listado
sigue funcionando.

- [ ] **Paso 6: Commit**

```bash
git add src/data/orden.ts tests/unit/orden.test.ts src/components/ProyectoListadoFiltrable.astro
git commit -m "feat: destacado pasa de filtrar a ordenar el listado"
```

---

## Tarea 2: El listado filtrable se vuelve embebible

Prepara `ProyectoListadoFiltrable.astro` para vivir dentro de la home sin romper la jerarquía de
headings ni la URL. Resuelve las tres cosas que la spec dio por "sin cambios". Todavía **no** se
embebe: eso es la Tarea 3. Esta tarea se puede verificar entera contra `/es/proyectos`, que sigue
siendo el único consumidor.

**Archivos:**
- Modificar: `src/components/ProyectoListadoFiltrable.astro`
- Test: `tests/e2e/proyectos.spec.ts`

**Interfaces:**
- Consume: el orden de la Tarea 1.
- Produce: `ProyectoListadoFiltrable` con esta firma exacta, que la Tarea 3 usa:
  ```ts
  interface Props {
    lang: Lang;
    activo: 'qa' | 'dev' | 'todos';
    /** 2 en la home (debajo del h2 de la sección); 1 en /es/proyectos, que es su propia página. */
    nivelTitulo?: 1 | 2;
    /** 'pagina' actualiza la URL al filtrar; 'home' no la toca. */
    contexto?: 'pagina' | 'home';
  }
  ```
  Defaults: `nivelTitulo = 1`, `contexto = 'pagina'` — así `/es/proyectos` no cambia de
  comportamiento y no hay que tocar sus tres páginas.

- [ ] **Paso 1: Escribir los tests que fallan**

En `tests/e2e/proyectos.spec.ts`, agregar un describe nuevo al final del archivo:

```ts
// El listado se embebe en la home además de servir /es/proyectos. Estas dos
// props son lo que hace posible lo segundo sin romper lo primero.
test.describe('El listado es embebible', () => {
  test('en su propia página el título es h1', async ({ page }) => {
    await page.goto('/es/proyectos');
    await expect(page.getByRole('heading', { level: 1, name: 'Proyectos' })).toHaveCount(1);
  });

  test('en su propia página el filtro sigue actualizando la URL', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');
    await p.botonFiltro('dev').click();
    await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar el estado de partida**

```bash
npx playwright test proyectos.spec.ts --project=chromium -g "embebible" > /tmp/t2.txt 2>&1; cat /tmp/t2.txt
```

Esperado: **PASS los dos.** Son tests de caracterización: fijan el comportamiento actual de
`/es/proyectos` para que el refactor de esta tarea no lo cambie sin que nadie se entere. El test
que sí falla primero es el del paso siguiente.

> **Decidido el 02/08/2026, antes de ejecutar:** que estos dos tests pasen en la primera corrida
> es deliberado y no una violación del ciclo TDD. Son la red de un refactor, no el motor de una
> feature. **Esto no es un hallazgo de revisión.** El ciclo estricto rige para el resto del plan.

- [ ] **Paso 3: Escribir el test que falla de verdad**

Agregar al mismo describe:

```ts
  // `contexto="home"` es lo que evita que, embebido en la home, el filtro deje
  // la URL en /es/proyectos/dev mostrando la home: recargar daría otra página.
  test('el atributo de contexto viaja al DOM', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');
    await expect(p.lista).toHaveAttribute('data-contexto', 'pagina');
  });
```

Correr:

```bash
npx playwright test proyectos.spec.ts --project=chromium -g "contexto viaja" > /tmp/t2.txt 2>&1; cat /tmp/t2.txt
```

Esperado: FAIL — `data-contexto` no existe todavía.

- [ ] **Paso 4: Implementar las props**

En `src/components/ProyectoListadoFiltrable.astro`, reemplazar el bloque de frontmatter que va
de la línea 8 a la 9:

```astro
interface Props { lang: Lang; activo: 'qa' | 'dev' | 'todos' }
const { lang, activo } = Astro.props;
```

por:

```astro
interface Props {
  lang: Lang;
  activo: 'qa' | 'dev' | 'todos';
  /**
   * 1 en `/es/proyectos`, que es su propia página; 2 en la home, donde el h1 ya
   * lo tiene el hero. Sin esto, embeberlo daría dos h1 y un salto de headings.
   */
  nivelTitulo?: 1 | 2;
  /**
   * `pagina` actualiza la URL al filtrar; `home` no la toca, porque los href
   * del filtro apuntan a `/es/proyectos/...` y dejar la URL ahí mostrando la
   * home haría que recargar diera otra página.
   */
  contexto?: 'pagina' | 'home';
}
const { lang, activo, nivelTitulo = 1, contexto = 'pagina' } = Astro.props;
const Titulo = nivelTitulo === 1 ? 'h1' : 'h2';
const nivelCard = nivelTitulo === 1 ? 2 : 3;
```

Reemplazar las líneas 26-27:

```astro
<h1 class="text-3xl font-bold sm:text-4xl">{t('proyectos.titulo')}</h1>
<p class="mt-3 max-w-prose text-muted">{t('proyectos.bajada')}</p>
```

por:

```astro
<Titulo class="text-3xl font-bold sm:text-4xl">{t('proyectos.titulo')}</Titulo>
<p class="mt-3 max-w-prose text-muted">{t('proyectos.bajada')}</p>
```

Reemplazar la apertura del div de la lista (líneas 31-32):

```astro
<div data-testid="lista-proyectos" data-activo={activo}
  class="mt-8 grid gap-4 sm:grid-cols-2">
```

por:

```astro
<div data-testid="lista-proyectos" data-activo={activo} data-contexto={contexto}
  class="mt-8 grid gap-4 sm:grid-cols-2">
```

Y en el `map`, pasar el nivel derivado (línea 35):

```astro
      <ProyectoCard lang={lang} slug={item.slug} tipo={item.tipo} datos={item.datos} nivelTitulo={nivelCard} />
```

- [ ] **Paso 5: Hacer que el script respete el contexto**

En el mismo archivo, dentro de `activarFiltro()`, reemplazar la última línea del listener:

```ts
      history.pushState({}, '', enlace.href);
```

por:

```ts
      // Embebido en la home, los href del filtro apuntan a /es/proyectos/...:
      // empujarlos dejaría la URL en otra página mostrando la home, y recargar
      // daría algo distinto de lo que se está viendo.
      if (lista.dataset.contexto !== 'home') history.pushState({}, '', enlace.href);
```

- [ ] **Paso 6: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t2c.txt 2>&1; grep -E "error|Error|0 errors" /tmp/t2c.txt
npx playwright test proyectos.spec.ts --project=chromium > /tmp/t2.txt 2>&1; grep -E "passed|failed" /tmp/t2.txt
```

Esperado: `astro check` con 0 errores, y todos los tests de `proyectos.spec.ts` en verde —
incluidos los de "sin JavaScript", que no dependen del script.

- [ ] **Paso 7: Commit**

```bash
git add src/components/ProyectoListadoFiltrable.astro tests/e2e/proyectos.spec.ts
git commit -m "refactor: el listado filtrable acepta nivel de titulo y contexto"
```

---

## Tarea 3: `#qa` y `#dev` se fusionan en `#proyectos`

El cambio estructural del tramo. Toca la home, el navbar, el menú mobile, el page object y tres
specs. Va en una sola tarea porque partirlo dejaría el sitio con el navbar apuntando a secciones
que no existen.

**Archivos:**
- Modificar: `src/components/HomeContent.astro`, `src/components/Header.astro`,
  `src/i18n/ui.ts`, `tests/e2e/pages/HomePage.ts`, `tests/e2e/home.spec.ts`,
  `tests/e2e/navegacion.spec.ts`, `tests/unit/i18n.test.ts`
- Sin tocar: `NavMobile.astro` (recibe `secciones` como prop desde `Header.astro`; cambia solo
  su contenido)

**Interfaces:**
- Consume: `ProyectoListadoFiltrable` con `nivelTitulo` y `contexto` (Tarea 2).
- Produce:
  - Sección `#proyectos` con `data-testid="bloque-proyectos"` en la home.
  - `SECCIONES` en `HomePage.ts` = `['inicio', 'sobre-mi', 'proyectos', 'stack', 'contacto']`
    (la Tarea 6 le agrega `'formacion'`).
  - Claves de i18n `nav.proyectos`.

- [ ] **Paso 1: Escribir los tests que fallan**

Reemplazar el contenido de `tests/e2e/home.spec.ts` por:

```ts
import { test, expect } from '@playwright/test';
import { HomePage, SECCIONES } from './pages/HomePage';

test.describe('Home', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`muestra hero, disponibilidad y las secciones en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.hero).toBeVisible();
      await expect(home.badgeDisponible).toBeVisible();
      await expect(home.bloqueProyectos).toBeVisible();
      await expect(home.stack).toBeVisible();
    });
  }

  // La home es one-page: el navbar ancla contra estos ids. Si alguno se renombra
  // o desaparece, los enlaces del menú quedan apuntando a la nada sin que ningún
  // otro test lo note.
  test('existen todas las secciones ancladas', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    for (const id of SECCIONES) {
      await expect(home.seccion(id), `falta la sección #${id}`).toHaveCount(1);
    }
  });

  // Los carriles separados mostraban 1 destacado cada uno. Ahora la home muestra
  // los 5 publicados: 4 casos QA + 1 proyecto de desarrollo. Si volviera a
  // filtrar por `destacado`, este número bajaría a 2 y el test lo marcaría.
  test('la home lista los cinco proyectos publicados', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.cards).toHaveCount(5);
  });

  test('la home arranca con el filtro en QA', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.lista).toHaveAttribute('data-activo', 'qa');
    await expect(home.cardsDeTipo('dev')).toHaveCount(0);
  });

  // El filtro embebido no puede dejar la URL en /es/proyectos/dev mostrando la
  // home: recargar daría otra página.
  test('filtrar en la home no cambia la URL', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltro('dev').click();
    await expect(home.cardsDeTipo('dev').first()).toBeVisible();
    await expect(page).toHaveURL(/\/es\/$/);
  });

  // Cubre un riesgo concreto: la home embebe ContactContent y el listado
  // filtrable, que fuera de la home son páginas con su propio h1.
  test('hay un único h1', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });
});

test.describe('El filtro de la home funciona sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('la home sirve el estado QA desde el servidor', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.cardsDeTipo('qa').first()).toBeVisible();
    await expect(home.cardsDeTipo('dev')).toHaveCount(0);
  });

  // Sin JS los botones son enlaces reales: navegan al listado, que es una
  // degradación correcta, no una rotura.
  test('sin JS el filtro navega al listado', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltro('dev').click();
    await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
  });
});
```

Reemplazar `tests/e2e/pages/HomePage.ts` por:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage, type Lang } from './BasePage';

/** Los anclajes de la home one-page, en el orden en que se recorren. */
export const SECCIONES = ['inicio', 'sobre-mi', 'proyectos', 'stack', 'contacto'] as const;
export type Seccion = (typeof SECCIONES)[number];

export class HomePage extends BasePage {
  readonly hero: Locator;
  readonly badgeDisponible: Locator;
  readonly bloqueSobre: Locator;
  readonly bloqueProyectos: Locator;
  readonly bloqueContacto: Locator;
  readonly stack: Locator;
  /** El listado embebido, el mismo componente que sirve /es/proyectos. */
  readonly lista: Locator;
  /** Todas las cards renderizadas, visibles u ocultas por el filtro. */
  readonly cards: Locator;

  constructor(page: Page) {
    super(page);
    this.hero = page.getByTestId('hero');
    this.badgeDisponible = page.getByTestId('badge-disponible');
    this.bloqueSobre = page.getByTestId('bloque-sobre');
    this.bloqueProyectos = page.getByTestId('bloque-proyectos');
    this.bloqueContacto = page.getByTestId('bloque-contacto');
    this.stack = page.getByTestId('stack');
    this.lista = page.getByTestId('lista-proyectos');
    this.cards = this.lista.getByTestId('proyecto-card');
  }

  /** Cards de un carril que además están visibles: es lo que filtra el CSS. */
  cardsDeTipo(tipo: 'qa' | 'dev'): Locator {
    return this.lista.locator(`[data-item-tipo="${tipo}"]:visible`);
  }

  botonFiltro(clave: 'qa' | 'dev' | 'todos'): Locator {
    return this.page.getByTestId(`filtro-${clave}`);
  }

  /** La sección anclada, por su id: es lo que apunta el navbar. */
  seccion(id: Seccion): Locator {
    return this.page.locator(`#${id}`);
  }

  async abrir(lang: Lang = 'es'): Promise<void> {
    await this.page.goto(`/${lang}/`);
  }
}
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test home.spec.ts --project=chromium > /tmp/t3.txt 2>&1; grep -E "passed|failed" /tmp/t3.txt
```

Esperado: FAIL. `bloque-proyectos` no existe y la sección `#proyectos` tampoco.

- [ ] **Paso 3: Actualizar el diccionario de i18n**

En `src/i18n/ui.ts`, en el tipo `ClaveUI`, **borrar** estas líneas:

```ts
  | 'nav.qa'
  | 'nav.dev'
  | 'home.qa.titulo'
  | 'home.dev.titulo'
  | 'home.dev.bajada'
  | 'home.qa.ver'
  | 'home.dev.ver'
```

y **agregar** en su lugar:

```ts
  | 'nav.proyectos'
```

En el objeto `es`, borrar las entradas correspondientes (`'nav.qa'`, `'nav.dev'`,
`'home.qa.titulo'`, `'home.dev.titulo'`, `'home.dev.bajada'`, `'home.qa.ver'`, `'home.dev.ver'`)
y agregar:

```ts
  'nav.proyectos': 'Projects',
```

En el objeto `en`, lo mismo, agregando:

```ts
  'nav.proyectos': 'Projects',
```

> **Sí, "Projects" en los dos idiomas.** Es lo que pide la sección 3.1 de la spec, que lista el
> navbar como *Inicio · Sobre mí · Projects · Skills · Formación · Contacto*. Es deliberado: el
> vocabulario técnico del rubro se usa en inglés también en español, igual que "Stack".

`qa.titulo` y `dev.titulo` **no se borran**: los usa `HomeContent.astro` hoy y hay que sacarlos
de ahí en el paso siguiente, pero verificar antes con
`grep -rn "qa.titulo\|dev.titulo" src/` que no quede ningún otro consumidor. Si no queda ninguno,
borrarlos también.

- [ ] **Paso 4: Reescribir `HomeContent.astro`**

Reemplazar el archivo entero por:

```astro
---
import Hero from './Hero.astro';
import SobreMiResumen from './SobreMiResumen.astro';
import ProyectoListadoFiltrable from './ProyectoListadoFiltrable.astro';
import StackGrid from './StackGrid.astro';
import ContactContent from './ContactContent.astro';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
---
<Hero lang={lang} />

<SobreMiResumen lang={lang} />

<!--
  Es el mismo componente que sirve /es/proyectos, no una copia: la home no
  duplica el listado, lo embebe con el título un nivel más abajo y sin tocar la
  URL al filtrar. /es/proyectos se mantiene porque da una URL propia,
  compartible e indexable, y es el destino de los redirects de /es/qa y /es/dev.
-->
<section data-testid="bloque-proyectos" id="proyectos" class="scroll-mt-24 py-10">
  <ProyectoListadoFiltrable lang={lang} activo="qa" nivelTitulo={2} contexto="home" />
</section>

<StackGrid lang={lang} />

<section data-testid="bloque-contacto" id="contacto" class="scroll-mt-24 border-t border-border py-10">
  <ContactContent lang={lang} nivelTitulo={2} />
</section>
```

> El `border-t` y el `py-10` quedan como están: el ritmo de sección es la Tarea 7, y mezclarlo
> acá haría que las capturas visuales cambiaran por dos motivos distintos en el mismo commit.

- [ ] **Paso 5: Actualizar el navbar**

En `src/components/Header.astro`, reemplazar el array `secciones` (líneas 17-24):

```astro
const secciones = [
  { id: 'inicio', testid: 'nav-inicio', texto: t('nav.inicio') },
  { id: 'sobre-mi', testid: 'nav-sobre', texto: t('nav.sobre') },
  { id: 'proyectos', testid: 'nav-proyectos', texto: t('nav.proyectos') },
  { id: 'stack', testid: 'nav-stack', texto: t('nav.stack') },
  { id: 'contacto', testid: 'nav-contacto', texto: t('nav.contacto') },
];
```

> `formacion` se agrega en la Tarea 6, cuando la sección exista. Meterlo antes dejaría el navbar
> apuntando a un ancla inexistente y el scroll-spy sin nada que observar.

- [ ] **Paso 6: Actualizar los tests que referencian `nav-qa`**

En `tests/e2e/navegacion.spec.ts`, reemplazar las tres apariciones de `nav-qa` y sus href:

```ts
  test('fuera de la home los enlaces del menú apuntan al idioma correcto', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/en/#proyectos');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/en/#sobre-mi');

    await page.goto('/es/contacto');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/es/#proyectos');
    await expect(page.getByTestId('nav-sobre')).toHaveAttribute('href', '/es/#sobre-mi');
  });
```

En el describe `Scroll-spy del navbar`:

```ts
  test('la sección a la que se salta queda marcada en el menú', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByTestId('nav-inicio')).toHaveAttribute('aria-current', 'true');

    await page.getByTestId('nav-proyectos').click();

    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('aria-current', 'true', { timeout: 5000 });
    await expect(page.getByTestId('nav-inicio')).not.toHaveAttribute('aria-current', 'true');
  });

  test('fuera de la home el menú apunta a la home con ancla', async ({ page }) => {
    await page.goto('/es/contacto');
    await expect(page.getByTestId('nav-proyectos')).toHaveAttribute('href', '/es/#proyectos');
  });
```

En el describe `Menú en pantallas chicas`, reemplazar `m-nav-qa` por `m-nav-proyectos` en las
tres apariciones.

En `tests/unit/i18n.test.ts`, reemplazar:

```ts
  it('devuelve texto en inglés', () => {
    expect(useTranslations('en')('nav.qa')).toBe('QA');
  });
```

por:

```ts
  it('devuelve texto en inglés', () => {
    expect(useTranslations('en')('nav.contacto')).toBe('Contact');
  });
```

> Se elige `nav.contacto` y no `nav.proyectos` a propósito: `nav.proyectos` dice "Projects" en
> los dos idiomas, así que no probaría que la traducción hace algo.

- [ ] **Paso 7: Correr todo y verificar que pasa**

```bash
npm run check > /tmp/t3c.txt 2>&1; tail -5 /tmp/t3c.txt
npm run test:unit > /tmp/t3u.txt 2>&1; grep -E "Tests|failed" /tmp/t3u.txt
npx playwright test --project=chromium > /tmp/t3.txt 2>&1; grep -E "passed|failed" /tmp/t3.txt
```

Esperado: `check` sin errores, unit en verde, y en E2E **solo** fallan las capturas de
`visual.spec.ts` (la home cambió de verdad). Se regeneran en la Tarea 12. Cualquier otra falla
es un problema real: resolverla antes de commitear.

- [ ] **Paso 8: Commit**

```bash
git add src/components/HomeContent.astro src/components/Header.astro src/i18n/ui.ts tests/
git commit -m "feat: los carriles QA y dev se fusionan en una seccion con filtro"
```

---

## Tarea 4: Hero de una columna con retrato

**Archivos:**
- Modificar: `src/components/Hero.astro`, `src/i18n/ui.ts`
- Ya existe: `src/assets/juan-manuel-malugani.jpg` (317×317, commiteada en `0e81a94`)
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consume: nada.
- Produce: `<img data-testid="hero-retrato">` con atributos `width` y `height` explícitos.

**Restricción específica y no negociable:** el original mide 317×317 px. **No declarar `widths`
mayores a 317** — Astro generaría variantes upscaleadas que pesan más sin verse mejor. El techo
de exhibición es 200 px (1,59× de densidad efectiva). Ver sección 8 de la spec.

- [ ] **Paso 1: Escribir los tests que fallan**

En `tests/e2e/home.spec.ts`, agregar dentro del `describe('Home')`:

```ts
  // `width` y `height` explícitos son lo que evita el CLS del elemento más
  // grande del primer viewport. El gate de Lighthouse está en performance ≥0.9.
  test('el retrato del hero declara dimensiones y texto alternativo', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const retrato = home.retrato;
    await expect(retrato).toBeVisible();
    await expect(retrato).toHaveAttribute('width', '200');
    await expect(retrato).toHaveAttribute('height', '200');
    const alt = await retrato.getAttribute('alt');
    expect(alt, 'el alt no puede estar vacío ni ser el nombre del archivo').toBeTruthy();
    expect(alt!.length).toBeGreaterThan(10);
  });

  // No se sirve el JPG original: astro:assets emite WebP en build.
  test('el retrato se sirve en WebP', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.retrato).toHaveAttribute('src', /\.webp/);
  });
```

En `tests/e2e/pages/HomePage.ts`, agregar el locator. Dentro de la clase, junto a los otros
`readonly`:

```ts
  readonly retrato: Locator;
```

y en el constructor:

```ts
    this.retrato = page.getByTestId('hero-retrato');
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test home.spec.ts --project=chromium -g "retrato" > /tmp/t4.txt 2>&1; cat /tmp/t4.txt
```

Esperado: FAIL, `hero-retrato` no existe.

- [ ] **Paso 3: Agregar la clave del texto alternativo**

En `src/i18n/ui.ts`, agregar a `ClaveUI`:

```ts
  | 'home.fotoAlt'
```

en `es`:

```ts
  'home.fotoAlt': 'Retrato de Juan Manuel Malugani',
```

en `en`:

```ts
  'home.fotoAlt': 'Portrait of Juan Manuel Malugani',
```

- [ ] **Paso 4: Reescribir el hero**

Reemplazar `src/components/Hero.astro` por:

```astro
---
import { Image } from 'astro:assets';
import ContactoInline from './ContactoInline.astro';
import retrato from '../assets/juan-manuel-malugani.jpg';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<!--
  Una columna y no dos: el original del retrato mide 317x317 y no hay otro. A
  200px de exhibición da 1,59x de densidad, que se sostiene en retina; a los
  400-500px de una columna propia daría 0,79x y se vería blando. La restricción
  se absorbe en el diseño, no escalando por software.

  `widths` no pasa de 317 a propósito: pedirle más a astro:assets genera
  variantes upscaleadas que pesan más sin verse mejor.
-->
<section data-testid="hero" id="inicio" class="scroll-mt-24 py-10 text-center">
  <Image
    src={retrato}
    alt={t('home.fotoAlt')}
    data-testid="hero-retrato"
    width={200}
    height={200}
    widths={[200, 317]}
    sizes="200px"
    format="webp"
    loading="eager"
    fetchpriority="high"
    class="mx-auto h-[200px] w-[200px] rounded-full object-cover ring-2 ring-border"
  />

  <p data-testid="badge-disponible"
    class="mt-6 inline-flex items-center gap-2 rounded-full border border-est-paso px-3 py-1 text-sm text-est-paso">
    <span aria-hidden="true">●</span> {t('home.disponible')}
  </p>
  <h1 class="mt-4 text-4xl font-bold sm:text-5xl">Juan Manuel Malugani</h1>
  <p class="mt-2 font-mono text-accent">{t('home.rol')}</p>
  <p class="mx-auto mt-4 max-w-prose text-lg text-muted">{t('home.posicionamiento')}</p>
  <div class="flex justify-center"><ContactoInline lang={lang} /></div>
</section>
```

> El `<div class="flex justify-center">` alrededor de `ContactoInline` es necesario porque ese
> componente devuelve un `<ul class="flex">`: `text-center` no centra un contenedor flex, solo su
> texto.

- [ ] **Paso 5: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t4c.txt 2>&1; tail -5 /tmp/t4c.txt
npx playwright test home.spec.ts --project=chromium > /tmp/t4.txt 2>&1; grep -E "passed|failed" /tmp/t4.txt
```

Esperado: verde. Si `astro check` se queja de `fetchpriority`, confirmar que está escrito todo en
minúscula: es el nombre real del atributo HTML y Astro lo pasa tal cual.

- [ ] **Paso 6: Verificar el peso real de la imagen emitida**

```bash
npm run build > /tmp/t4b.txt 2>&1; ls -l dist/_astro/*.webp
```

Esperado: dos archivos WebP, ninguno mayor a ~25 KB. Si aparece alguno mucho más grande o con más
de 317 px de ancho en el nombre, revisar `widths`.

- [ ] **Paso 7: Commit**

```bash
git add src/components/Hero.astro src/i18n/ui.ts tests/
git commit -m "feat: el hero pasa a una columna con retrato"
```

---

## Tarea 5: Los datos de formación

Datos primero, componente después: el test unitario puede correr sin que exista ninguna
plantilla, y así la Tarea 6 arranca con la forma de los datos ya fijada.

**Archivos:**
- Crear: `src/data/formacion.ts`
- Crear: `tests/unit/formacion.test.ts`
- Modificar: `src/i18n/ui.ts`

**Interfaces:**
- Consume: `ClaveUI` de `src/i18n/ui.ts`.
- Produce, para la Tarea 6:
  ```ts
  export type EstadoFormacion = 'completado' | 'examen-pendiente' | 'sin-completar' | 'nivel';
  export interface ItemFormacion {
    id: string;
    tituloClave: ClaveUI;
    institucionClave: ClaveUI;
    detalleClave: ClaveUI;
    estadoClave: ClaveUI;
    estado: EstadoFormacion;
  }
  export const formacion: ItemFormacion[];
  ```

- [ ] **Paso 1: Escribir el test que falla**

Crear `tests/unit/formacion.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { formacion, ESTADOS_FORMACION, type EstadoFormacion } from '../../src/data/formacion';
import { ui } from '../../src/i18n/ui';

const CLAVES_POR_ITEM = ['tituloClave', 'institucionClave', 'detalleClave', 'estadoClave'] as const;

describe('formacion', () => {
  it('declara los cuatro ítems', () => {
    expect(formacion).toHaveLength(4);
  });

  it('todo ítem tiene un estado válido', () => {
    for (const item of formacion) {
      expect(ESTADOS_FORMACION, `estado inválido en ${item.id}`).toContain(item.estado);
    }
  });

  it('no hay ids repetidos', () => {
    const ids = formacion.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // El estado se declara en texto, no solo por color: sin una clave de estado
  // el ítem quedaría comunicándose únicamente por el color de su badge, que es
  // exactamente lo que el resto del sitio no hace.
  it('todo ítem declara su estado en texto en los dos idiomas', () => {
    for (const item of formacion) {
      for (const lang of ['es', 'en'] as const) {
        const texto = ui[lang][item.estadoClave];
        expect(texto, `${item.id} no declara estado en ${lang}`).toBeTruthy();
        expect(texto.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('todas las claves existen en los dos diccionarios', () => {
    for (const item of formacion) {
      for (const campo of CLAVES_POR_ITEM) {
        for (const lang of ['es', 'en'] as const) {
          expect(ui[lang][item[campo]], `falta ${item[campo]} en ${lang}`).toBeDefined();
        }
      }
    }
  });

  // La spec descartó explícitamente declarar un nivel CEFR de inglés hasta que
  // haya certificado con URL verificable, y descartó el rango
  // "intermedio/avanzado". Este test evita que vuelvan sin que alguien lo
  // decida a propósito.
  it('el ítem de inglés no promete un nivel que no está respaldado', () => {
    const ingles = formacion.find((f) => f.id === 'ingles');
    expect(ingles, 'falta el ítem de inglés').toBeDefined();
    for (const lang of ['es', 'en'] as const) {
      const texto = ui[lang][ingles!.estadoClave];
      expect(texto).not.toMatch(/\b[ABC][12]\b/);
      expect(texto).not.toMatch(/\//);
    }
  });
});
```

- [ ] **Paso 2: Correr el test y verificar que falla**

```bash
npm run test:unit > /tmp/t5.txt 2>&1; grep -E "formacion|Cannot find" /tmp/t5.txt
```

Esperado: FAIL — no existe `src/data/formacion.ts`.

- [ ] **Paso 3: Agregar las claves al diccionario**

En `src/i18n/ui.ts`, agregar a `ClaveUI`:

```ts
  | 'nav.formacion'
  | 'formacion.titulo'
  | 'formacion.bajada'
  | 'formacion.bootcamp.titulo'
  | 'formacion.bootcamp.institucion'
  | 'formacion.bootcamp.detalle'
  | 'formacion.istqb.titulo'
  | 'formacion.istqb.institucion'
  | 'formacion.istqb.detalle'
  | 'formacion.utn.titulo'
  | 'formacion.utn.institucion'
  | 'formacion.utn.detalle'
  | 'formacion.ingles.titulo'
  | 'formacion.ingles.institucion'
  | 'formacion.ingles.detalle'
  | 'formacion.estado.completado'
  | 'formacion.estado.examenPendiente'
  | 'formacion.estado.sinCompletar'
  | 'formacion.estado.intermedio'
```

En el objeto `es`:

```ts
  'nav.formacion': 'Formación',
  'formacion.titulo': 'Formación',
  'formacion.bajada': 'Dónde aprendí lo que aplico, y qué terminé de cada cosa.',
  'formacion.bootcamp.titulo': 'The Complete 2026 Software Testing Bootcamp',
  'formacion.bootcamp.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.bootcamp.detalle': '43,5 horas · 372 lecciones',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lecciones',
  'formacion.utn.titulo': 'Operador de Mercados Financieros',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '94 horas · 12 unidades · 2022',
  'formacion.ingles.titulo': 'Inglés',
  'formacion.ingles.institucion': 'Autodidacta',
  'formacion.ingles.detalle': 'Lectura técnica y documentación',
  'formacion.estado.completado': 'Completado',
  'formacion.estado.examenPendiente': 'Curso completo · examen pendiente',
  'formacion.estado.sinCompletar': 'Cursado sin completar',
  'formacion.estado.intermedio': 'Intermedio',
```

En el objeto `en`:

```ts
  'nav.formacion': 'Training',
  'formacion.titulo': 'Training',
  'formacion.bajada': 'Where I learned what I apply, and what I actually finished.',
  'formacion.bootcamp.titulo': 'The Complete 2026 Software Testing Bootcamp',
  'formacion.bootcamp.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.bootcamp.detalle': '43.5 hours · 372 lessons',
  'formacion.istqb.titulo': 'ISTQB Foundation Level V4.0',
  'formacion.istqb.institucion': 'Tarek Roshdy · Nezam Academy',
  'formacion.istqb.detalle': '35 h 50 min · 340 lessons',
  'formacion.utn.titulo': 'Financial Markets Operator',
  'formacion.utn.institucion': 'UTN FRBA',
  'formacion.utn.detalle': '94 hours · 12 units · 2022',
  'formacion.ingles.titulo': 'English',
  'formacion.ingles.institucion': 'Self-taught',
  'formacion.ingles.detalle': 'Technical reading and documentation',
  'formacion.estado.completado': 'Completed',
  'formacion.estado.examenPendiente': 'Course complete · exam pending',
  'formacion.estado.sinCompletar': 'Attended, not completed',
  'formacion.estado.intermedio': 'Intermediate',
```

> Los nombres propios (bootcamp, ISTQB, Nezam Academy, UTN FRBA) no se traducen. El curso de la
> UTN sí lleva traducción del nombre porque en inglés se lee como descripción, no como título.

- [ ] **Paso 4: Crear los datos**

Crear `src/data/formacion.ts`:

```ts
import type { ClaveUI } from '../i18n/ui';

/**
 * La formación vive acá y no dentro de `Formacion.astro` para que se pueda
 * verificar desde un test unitario que ningún ítem quede sin estado o con un
 * estado inválido. Es el mismo patrón que `src/data/stack.ts`.
 *
 * Cada texto es una clave de i18n y no un string suelto: la sección se
 * renderiza en los dos idiomas, y el test unitario puede afirmar que ninguna
 * clave falta en ninguno de los dos diccionarios.
 *
 * El estado se declara en texto, nunca solo por color:
 *   completado        — terminado, sin nada pendiente
 *   examen-pendiente  — el curso está completo, la certificación no
 *   sin-completar     — se cursó y no se terminó; se dice así y nada más
 *   nivel             — no hay nada que completar, se declara un nivel
 */

export type EstadoFormacion = 'completado' | 'examen-pendiente' | 'sin-completar' | 'nivel';

export const ESTADOS_FORMACION: EstadoFormacion[] = [
  'completado',
  'examen-pendiente',
  'sin-completar',
  'nivel',
];

export interface ItemFormacion {
  id: string;
  tituloClave: ClaveUI;
  institucionClave: ClaveUI;
  detalleClave: ClaveUI;
  estadoClave: ClaveUI;
  estado: EstadoFormacion;
}

export const formacion: ItemFormacion[] = [
  {
    id: 'bootcamp',
    tituloClave: 'formacion.bootcamp.titulo',
    institucionClave: 'formacion.bootcamp.institucion',
    detalleClave: 'formacion.bootcamp.detalle',
    estadoClave: 'formacion.estado.completado',
    estado: 'completado',
  },
  {
    id: 'istqb',
    tituloClave: 'formacion.istqb.titulo',
    institucionClave: 'formacion.istqb.institucion',
    detalleClave: 'formacion.istqb.detalle',
    estadoClave: 'formacion.estado.examenPendiente',
    estado: 'examen-pendiente',
  },
  // El curso de la UTN entra porque la pieza destacada del portfolio es una
  // aplicación financiera: 94 horas de mercado de capitales explican por qué se
  // pudo modelar y testear ese dominio. Se declara "cursado sin completar" y
  // nada más; estar en condiciones de rendir el examen de idóneo es una
  // afirmación a futuro, repreguntable, y no aporta a un puesto de QA.
  {
    id: 'utn',
    tituloClave: 'formacion.utn.titulo',
    institucionClave: 'formacion.utn.institucion',
    detalleClave: 'formacion.utn.detalle',
    estadoClave: 'formacion.estado.sinCompletar',
    estado: 'sin-completar',
  },
  // "Intermedio", sin rango y sin CEFR. Es lo que sostiene la evidencia
  // disponible al 02/08/2026: recepción sólida, producción sin determinar. Un
  // rango no es un nivel, y "avanzado" tendría un costo inmediato y concreto en
  // la primera entrevista en inglés.
  {
    id: 'ingles',
    tituloClave: 'formacion.ingles.titulo',
    institucionClave: 'formacion.ingles.institucion',
    detalleClave: 'formacion.ingles.detalle',
    estadoClave: 'formacion.estado.intermedio',
    estado: 'nivel',
  },
];
```

- [ ] **Paso 5: Correr el test y verificar que pasa**

```bash
npm run test:unit > /tmp/t5.txt 2>&1; grep -E "Tests|failed" /tmp/t5.txt
npm run check > /tmp/t5c.txt 2>&1; tail -5 /tmp/t5c.txt
```

Esperado: unit en verde (incluidos los 6 tests nuevos), `check` sin errores.

- [ ] **Paso 6: Commit**

```bash
git add src/data/formacion.ts src/i18n/ui.ts tests/unit/formacion.test.ts
git commit -m "feat: los datos de formacion, tipados y con estado obligatorio"
```

---

## Tarea 6: La sección Formación

**Archivos:**
- Crear: `src/components/Formacion.astro`
- Modificar: `src/components/HomeContent.astro`, `src/components/Header.astro`,
  `tests/e2e/pages/HomePage.ts`, `tests/e2e/home.spec.ts`

**Interfaces:**
- Consume: `formacion`, `ItemFormacion` de `src/data/formacion.ts` (Tarea 5); las claves de i18n
  de la Tarea 5.
- Produce: sección `#formacion` con `data-testid="bloque-formacion"`, un
  `data-testid="formacion-item"` por ítem, cada uno con `data-testid="formacion-estado"`.

- [ ] **Paso 1: Escribir los tests que fallan**

En `tests/e2e/pages/HomePage.ts`, agregar `'formacion'` a `SECCIONES`, entre `'stack'` y
`'contacto'`:

```ts
export const SECCIONES = ['inicio', 'sobre-mi', 'proyectos', 'stack', 'formacion', 'contacto'] as const;
```

Agregar los locators a la clase:

```ts
  readonly bloqueFormacion: Locator;
  readonly itemsFormacion: Locator;
```

y en el constructor:

```ts
    this.bloqueFormacion = page.getByTestId('bloque-formacion');
    this.itemsFormacion = page.getByTestId('formacion-item');
```

En `tests/e2e/home.spec.ts`, agregar un describe nuevo:

```ts
test.describe('Formación', () => {
  for (const lang of ['es', 'en'] as const) {
    test(`lista los cuatro ítems en ${lang}`, async ({ page }) => {
      const home = new HomePage(page);
      await home.abrir(lang);
      await expect(home.bloqueFormacion).toBeVisible();
      await expect(home.itemsFormacion).toHaveCount(4);
    });
  }

  // El estado va en texto, no solo por color ni por posición: es la misma
  // restricción que ya rige para severidad, estado de caso y nivel de stack.
  test('cada ítem declara su estado en texto', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const estados = home.itemsFormacion.getByTestId('formacion-estado');
    await expect(estados).toHaveCount(4);
    for (const texto of await estados.allTextContents()) {
      expect(texto.trim().length, 'un estado quedó vacío').toBeGreaterThan(0);
    }
  });

  // Ninguno de los cuatro ítems puede prometer más de lo que hay: el de la UTN
  // se cursó sin completar y el examen de ISTQB no está rendido.
  test('ningún ítem promete más de lo que hay', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const textos = (await home.itemsFormacion.allTextContents()).join(' ');
    expect(textos).toContain('Cursado sin completar');
    expect(textos).toContain('examen pendiente');
    // "Título" o "Graduado" serían afirmaciones que no se sostienen.
    expect(textos).not.toMatch(/Graduado|Titulado|Certificado ISTQB/);
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test home.spec.ts --project=chromium -g "Formación" > /tmp/t6.txt 2>&1; cat /tmp/t6.txt
```

Esperado: FAIL, `bloque-formacion` no existe.

- [ ] **Paso 3: Crear el componente**

Crear `src/components/Formacion.astro`:

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
  completado: 'text-est-paso',
  'examen-pendiente': 'text-sev-medio',
  'sin-completar': 'text-muted',
  nivel: 'text-muted',
};
---
<section data-testid="bloque-formacion" id="formacion" class="scroll-mt-24 py-10">
  <h2 class="text-2xl font-semibold">{t('formacion.titulo')}</h2>
  <p class="mt-2 max-w-prose text-muted">{t('formacion.bajada')}</p>

  <ul class="mt-6 space-y-3">
    {formacion.map((item) => (
      <li data-testid="formacion-item"
        class="rounded-lg border border-border bg-surface p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 class="text-base font-semibold text-text">{t(item.tituloClave)}</h3>
          <span data-testid="formacion-estado" data-estado={item.estado}
            class={`text-sm ${colorEstado[item.estado]}`}>
            {t(item.estadoClave)}
          </span>
        </div>
        <p class="mt-1 text-sm text-muted">
          {t(item.institucionClave)} · {t(item.detalleClave)}
        </p>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Paso 4: Colgarlo de la home y del navbar**

En `src/components/HomeContent.astro`, agregar el import:

```astro
import Formacion from './Formacion.astro';
```

y la sección **entre** `<StackGrid />` y la sección de contacto:

```astro
<StackGrid lang={lang} />

<Formacion lang={lang} />

<section data-testid="bloque-contacto" id="contacto" class="scroll-mt-24 border-t border-border py-10">
```

En `src/components/Header.astro`, agregar el item al array `secciones`, entre `stack` y
`contacto`:

```astro
  { id: 'formacion', testid: 'nav-formacion', texto: t('nav.formacion') },
```

- [ ] **Paso 5: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t6c.txt 2>&1; tail -5 /tmp/t6c.txt
npx playwright test home.spec.ts a11y.spec.ts --project=chromium > /tmp/t6.txt 2>&1; grep -E "passed|failed" /tmp/t6.txt
```

Esperado: verde. `a11y.spec.ts` se corre acá a propósito: la sección nueva suma headings, y el
test de orden de headings (h2 de sección → h3 de ítem) es exactamente lo que podría romperse.

- [ ] **Paso 6: Commit**

```bash
git add src/components/Formacion.astro src/components/HomeContent.astro src/components/Header.astro tests/
git commit -m "feat: la seccion de formacion, con el estado de cada item en texto"
```

---

## Tarea 7: Ritmo de sección

Primera de las cuatro tareas de tratamiento visual. Encabezados centrados con bajada, sin
`border-t`, padding más generoso.

**Archivos:**
- Modificar: `src/components/SobreMiResumen.astro`, `src/components/StackGrid.astro`,
  `src/components/Formacion.astro`, `src/components/HomeContent.astro`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consume: las secciones de las Tareas 3, 4 y 6.
- Produce: ninguna interfaz nueva. Cambio puramente visual.

**Decisión de padding:** la spec pide `py-16`/`py-20`. La referencia mide `96px` (`py-24`). Se
sigue la spec: `py-16 sm:py-20`. Es una decisión ya tomada, no re-litigarla acá.

- [ ] **Paso 1: Escribir el test que falla**

En `tests/e2e/home.spec.ts`, agregar dentro del `describe('Home')`:

```ts
  // La separación entre secciones pasa a ser espacio, no una línea. Si volviera
  // un `border-t`, la home tendría dos sistemas de separación conviviendo.
  test('las secciones se separan por espacio, no por línea', async ({ page }) => {
    await page.goto('/es/');
    const conBorde = await page.evaluate(() =>
      ['bloque-sobre', 'bloque-proyectos', 'stack', 'bloque-formacion', 'bloque-contacto']
        .map((id) => {
          const el = document.querySelector(`[data-testid="${id}"]`);
          if (!el) return `${id}: no existe`;
          const w = getComputedStyle(el).borderTopWidth;
          return w === '0px' ? null : `${id}: ${w}`;
        })
        .filter(Boolean)
    );
    expect(conBorde, 'quedaron secciones con border-t').toEqual([]);
  });
```

- [ ] **Paso 2: Correr el test y verificar que falla**

```bash
npx playwright test home.spec.ts --project=chromium -g "separan por espacio" > /tmp/t7.txt 2>&1; cat /tmp/t7.txt
```

Esperado: FAIL, listando `bloque-sobre` y `bloque-contacto` con `1px`.

- [ ] **Paso 3: Aplicar el ritmo a cada sección**

En los cuatro archivos, la clase de la etiqueta `<section>` pasa de
`scroll-mt-24 border-t border-border py-10` (o `scroll-mt-24 py-10`) a
`scroll-mt-24 py-16 sm:py-20`.

`src/components/SobreMiResumen.astro`, línea 10:

```astro
<section data-testid="bloque-sobre" id="sobre-mi" class="scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('sobre.titulo')}</h2>
  <p class="mt-3 max-w-prose text-muted">{t('sobre.resumen')}</p>
```

`src/components/StackGrid.astro`, línea 32:

```astro
<section data-testid="stack" id="stack" class="scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('home.stack')}</h2>
```

`src/components/Formacion.astro`:

```astro
<section data-testid="bloque-formacion" id="formacion" class="scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('formacion.titulo')}</h2>
  <p class="mx-auto mt-2 max-w-prose text-center text-muted">{t('formacion.bajada')}</p>
```

`src/components/HomeContent.astro`, las dos secciones que declara:

```astro
<section data-testid="bloque-proyectos" id="proyectos" class="scroll-mt-24 py-16 sm:py-20">
```

```astro
<section data-testid="bloque-contacto" id="contacto" class="scroll-mt-24 py-16 sm:py-20">
```

Y en `src/components/Hero.astro`, la sección del hero:

```astro
<section data-testid="hero" id="inicio" class="scroll-mt-24 py-16 text-center sm:py-20">
```

- [ ] **Paso 4: Centrar el encabezado del listado embebido**

En `src/components/ProyectoListadoFiltrable.astro`, el título y la bajada solo se centran cuando
está embebido; en su propia página siguen alineados a la izquierda, que es lo que ya hace
`/es/proyectos`. Reemplazar:

```astro
<Titulo class="text-3xl font-bold sm:text-4xl">{t('proyectos.titulo')}</Titulo>
<p class="mt-3 max-w-prose text-muted">{t('proyectos.bajada')}</p>

<div class="mt-6"><FiltroProyectos lang={lang} activo={activo} /></div>
```

por:

```astro
<Titulo class:list={['font-bold', nivelTitulo === 1 ? 'text-3xl sm:text-4xl' : 'text-2xl text-center']}>
  {t('proyectos.titulo')}
</Titulo>
<p class:list={['mt-3 max-w-prose text-muted', nivelTitulo === 2 && 'mx-auto text-center']}>
  {t('proyectos.bajada')}
</p>

<div class:list={['mt-6 flex', nivelTitulo === 2 && 'justify-center']}>
  <FiltroProyectos lang={lang} activo={activo} />
</div>
```

> El `flex` en el contenedor del filtro hace que el grupo de botones no se estire a todo el
> ancho: sin eso, centrado o no, ocuparía la línea completa.

- [ ] **Paso 5: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t7c.txt 2>&1; tail -5 /tmp/t7c.txt
npx playwright test home.spec.ts proyectos.spec.ts a11y.spec.ts --project=chromium > /tmp/t7.txt 2>&1; grep -E "passed|failed" /tmp/t7.txt
```

Esperado: verde, salvo `visual.spec.ts` que no se corre acá.

- [ ] **Paso 6: Commit**

```bash
git add src/components/
git commit -m "style: la separacion entre secciones pasa a ser espacio"
```

---

## Tarea 8: Hover y foco en las cards

**Archivos:**
- Modificar: `src/components/ProyectoCard.astro`
- Test: `tests/e2e/componentes.spec.ts`

**Interfaces:**
- Consume: nada.
- Produce: nada nuevo. La regla que fija: toda card eleva en `hover` **y** en
  `:focus-visible` del enlace que contiene.

- [ ] **Paso 1: Escribir el test que falla**

En `tests/e2e/componentes.spec.ts`, agregar al final:

```ts
// En mobile el hover no existe y con teclado tampoco se dispara: una elevación
// que solo responda a `:hover` deja el estado de foco sin ninguna señal visual.
// Es la regla firme de la spec, y esta es la única forma de que se sostenga.
test.describe('Elevación de las cards', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('la card se eleva al enfocar su enlace con teclado', async ({ page }) => {
    await page.goto('/es/proyectos');
    const card = page.getByTestId('proyecto-card').first();

    const reposo = await card.evaluate((el) => getComputedStyle(el).transform);

    await card.getByRole('link').first().focus();
    const enfocada = await card.evaluate((el) => getComputedStyle(el).transform);

    expect(enfocada, 'la card no se eleva al enfocar: el hover quedó sin equivalente en focus-visible')
      .not.toBe(reposo);
  });

  test('la card se eleva al pasar el mouse', async ({ page }) => {
    await page.goto('/es/proyectos');
    const card = page.getByTestId('proyecto-card').first();

    const reposo = await card.evaluate((el) => getComputedStyle(el).transform);
    await card.hover();
    const encima = await card.evaluate((el) => getComputedStyle(el).transform);

    expect(encima).not.toBe(reposo);
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test componentes.spec.ts --project=chromium -g "Elevación" > /tmp/t8.txt 2>&1; cat /tmp/t8.txt
```

Esperado: FAIL los dos — hoy la card solo cambia el color del borde.

- [ ] **Paso 3: Implementar la elevación**

En `src/components/ProyectoCard.astro`, reemplazar la etiqueta `<article>` (líneas 39-40):

```astro
<article data-testid="proyecto-card" data-tipo={tipo}
  class="relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent">
```

por:

```astro
<article data-testid="proyecto-card" data-tipo={tipo}
  class="tarjeta relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-[transform,border-color,box-shadow] hover:border-accent">
```

y agregar al final del archivo:

```astro
<style>
  /* La elevación acompaña al cambio de borde que ya existía. Va en `:hover` y
     en `:focus-within` porque el enlace del título cubre la card entera con
     `after:absolute`: enfocarlo con teclado es el equivalente exacto de pasarle
     el mouse por encima, y sin esto ese estado no tendría ninguna señal visual.
     `:focus-within` y no `:focus-visible` sobre la card: el foco lo recibe el
     enlace de adentro, no el <article>. */
  .tarjeta:hover,
  .tarjeta:focus-within {
    transform: translateY(-2px);
    border-color: var(--accent);
  }

  /* El bloque global de prefers-reduced-motion ya lleva las transiciones a
     0.01ms, pero no anula la transformación en sí: sin esto el salto ocurre
     igual, solo que instantáneo. */
  @media (prefers-reduced-motion: reduce) {
    .tarjeta:hover,
    .tarjeta:focus-within {
      transform: none;
    }
  }
</style>
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

```bash
npx playwright test componentes.spec.ts --project=chromium > /tmp/t8.txt 2>&1; grep -E "passed|failed" /tmp/t8.txt
```

Esperado: verde.

> Si el test de `focus-visible` falla en `webkit`, revisar `docs/cross-browser-diagnostico.md`:
> Safari no pone los enlaces en el tab-order por defecto, pero `.focus()` programático —que es lo
> que usa el test— sí funciona. Si igual falla, es un problema real del CSS, no del navegador.

- [ ] **Paso 5: Commit**

```bash
git add src/components/ProyectoCard.astro tests/e2e/componentes.spec.ts
git commit -m "style: las cards se elevan en hover y en foco de teclado"
```

---

## Tarea 9: `scroll-snap` y `prefers-reduced-motion`

**La tarea con más riesgo del plan.** `scroll-snap` convive con el `overflow-y: scroll` de `html`,
que está ahí para evitar un crash real de WebKit, y puede interferir con la navegación por anclas
y con el timing del scroll-spy. La referencia de la que salió el diseño **no lo usa**. Se
implementa detrás de una verificación en los cuatro navegadores, con criterio de reversión escrito
de antemano.

**Archivos:**
- Modificar: `src/styles/global.css`
- Test: `tests/e2e/navegacion.spec.ts`

**Interfaces:**
- Consume: las secciones de las Tareas 3, 6 y 7.
- Produce: `scroll-snap-type: y proximity` en `html`, `scroll-snap-align: start` en cada sección
  de la home.

- [ ] **Paso 1: Escribir los tests que fallan**

En `tests/e2e/navegacion.spec.ts`, agregar al final:

```ts
test.describe('Scroll-snap', () => {
  test('la home declara snap por proximidad', async ({ page }) => {
    await page.goto('/es/');
    const tipo = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollSnapType
    );
    expect(tipo).toContain('proximity');
  });

  // El bloque global de reduced-motion anula animaciones, transiciones y
  // scroll-behavior, pero `scroll-snap-type` es una propiedad aparte: sin esta
  // regla, alguien con la preferencia activada seguiría teniendo el scroll
  // agarrándose solo, que es exactamente el movimiento que pidió no tener.
  test('con reduced-motion el snap se desactiva', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es/');
    const tipo = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollSnapType
    );
    expect(tipo).toBe('none');
  });

  // El invariante que evita el crash de WebKit no se puede perder por sumar
  // snap: `overflow-y: scroll` tiene que seguir ahí.
  test('el snap no se come el overflow que evita el crash de WebKit', async ({ page }) => {
    await page.goto('/es/');
    const overflowY = await page.evaluate(
      () => getComputedStyle(document.documentElement).overflowY
    );
    expect(overflowY).toBe('scroll');
  });

  // El navbar ancla contra los ids: si el snap rompiera el salto, el sitio
  // perdería su navegación principal sin que nada más lo notara.
  test('la navegación por ancla sigue llegando a la sección', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/es/');
    await page.getByTestId('nav-formacion').click();
    await expect(page.getByTestId('bloque-formacion')).toBeInViewport({ timeout: 5000 });
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test navegacion.spec.ts --project=chromium -g "Scroll-snap" > /tmp/t9.txt 2>&1; cat /tmp/t9.txt
```

Esperado: fallan los dos primeros (no hay snap declarado); los otros dos pasan, y están ahí para
detectar que el snap no rompa lo que ya funciona.

- [ ] **Paso 3: Implementar el snap**

En `src/styles/global.css`, reemplazar la línea 72:

```css
html { color-scheme: light dark; overflow-y: scroll; scroll-behavior: smooth; }
```

por:

```css
/* `proximity` y no `mandatory`: las secciones tienen alturas muy distintas —el
   hero es corto, el stack es una grilla de 33 chips— y `mandatory` obligaría a
   que cada una midiera 100vh, lo que significa recortar contenido o dejar
   huecos. Con `proximity` el scroll se acomoda solo cuando ya está cerca. */
html {
  color-scheme: light dark;
  overflow-y: scroll;
  scroll-behavior: smooth;
  scroll-snap-type: y proximity;
}

/* Solo las secciones de la home: son las que el navbar ancla. Aplicarlo a
   cualquier <section> agarraría también las de los detalles de caso, que son
   texto largo y ahí el snap estorba en vez de ayudar. */
main > section[id],
main > * > section[id] {
  scroll-snap-align: start;
}
```

Y dentro del bloque `@media (prefers-reduced-motion: reduce)` existente, agregar:

```css
  /* `scroll-snap-type` no lo cubre ninguna de las reglas de arriba: no es una
     animación ni una transición ni `scroll-behavior`. Sin esto, el scroll
     seguiría agarrándose solo para quien pidió no tener movimiento. */
  html {
    scroll-snap-type: none !important;
  }
```

- [ ] **Paso 4: Correr los tests en los cuatro navegadores**

Este es el paso que la spec exige explícitamente. **No se saltea.**

```bash
npx playwright test navegacion.spec.ts home.spec.ts > /tmp/t9-todos.txt 2>&1; grep -E "passed|failed" /tmp/t9-todos.txt
```

Esperado: verde en `chromium`, `firefox`, `webkit` y `mobile`.

- [ ] **Paso 5: Verificar a mano en navegador real**

El snap es la clase de cosa que pasa los tests y se siente mal. Levantar el sitio y scrollear:

```bash
npm run build && npm run preview
```

Con la home abierta en `http://localhost:4321/es/`, comprobar tres cosas:

1. Scrollear despacio de arriba a abajo: el scroll se acomoda cerca de los bordes de sección, sin
   pelear con el gesto ni saltar hacia atrás.
2. Clickear cada item del navbar: la sección queda debajo del header sticky, no tapada.
3. Scrollear hasta el fondo: el navbar marca "Contacto", no "Formación".

**Criterio de reversión, decidido de antemano:** si alguna de las tres falla en algún navegador y
no se resuelve ajustando `scroll-padding-top`, se revierte el snap —borrando
`scroll-snap-type`, la regla de `scroll-snap-align` y los dos primeros tests del Paso 1— y se deja
anotado en el commit qué navegador y cuál de los tres síntomas. El resto del tratamiento visual no
depende de esto. La referencia de la que salió el diseño no usa snap, así que perderlo no aleja la
home de su modelo.

- [ ] **Paso 6: Commit**

```bash
git add src/styles/global.css tests/e2e/navegacion.spec.ts
git commit -m "style: scroll-snap por proximidad, desactivado con reduced-motion"
```

---

## Tarea 10: Aparición al scrollear

**Archivos:**
- Modificar: `src/styles/global.css`, `src/components/HomeContent.astro`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consume: las secciones de las Tareas 3, 6 y 7.
- Produce: la clase `revelar` sobre cada sección de la home y la clase `js-revelar` sobre
  `<html>`, que es lo que habilita el efecto.

**El punto central:** el CSS **no** puede esconder nada por sí solo. Esconde únicamente cuando
`<html>` tiene la clase `js-revelar`, que la pone el propio script. Sin JavaScript no hay clase,
no hay ocultamiento, y todo se ve.

- [ ] **Paso 1: Escribir el test que falla**

En `tests/e2e/home.spec.ts`, agregar:

```ts
test.describe('Aparición al scrollear', () => {
  test('las secciones terminan visibles al recorrer la página', async ({ page }) => {
    await page.goto('/es/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    // El observador dispara con el scroll; esperar a la última sección alcanza
    // porque es la que llega al final del recorrido.
    await expect(page.getByTestId('bloque-contacto')).toBeVisible();
    const opacidades = await page.evaluate(() =>
      [...document.querySelectorAll('.revelar')].map((el) => getComputedStyle(el).opacity)
    );
    expect(opacidades.length, 'ninguna sección declara la clase revelar').toBeGreaterThan(0);
    expect(opacidades.every((o) => Number(o) === 1), `quedaron secciones invisibles: ${opacidades}`).toBe(true);
  });
});

// La restricción más importante del tratamiento visual: si el CSS escondiera
// los elementos y el JS los revelara, un visitante sin JavaScript vería una
// página en blanco. El JS opta por el efecto, no lo habilita.
test.describe('Sin JavaScript no queda nada invisible', () => {
  test.use({ javaScriptEnabled: false });

  test('todas las secciones de la home son visibles', async ({ page }) => {
    await page.goto('/es/');
    const opacidades = await page.evaluate(() =>
      [...document.querySelectorAll('.revelar')].map((el) => getComputedStyle(el).opacity)
    );
    expect(opacidades.length).toBeGreaterThan(0);
    expect(opacidades.every((o) => Number(o) === 1), `sin JS quedaron secciones invisibles: ${opacidades}`).toBe(true);
  });

  test('el documento no declara la clase que habilita el efecto', async ({ page }) => {
    await page.goto('/es/');
    const tiene = await page.evaluate(() => document.documentElement.classList.contains('js-revelar'));
    expect(tiene, 'la clase js-revelar apareció sin JavaScript').toBe(false);
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

```bash
npx playwright test home.spec.ts --project=chromium -g "Aparición|Sin JavaScript" > /tmp/t10.txt 2>&1; cat /tmp/t10.txt
```

Esperado: FAIL — no existe ninguna `.revelar`.

- [ ] **Paso 3: Agregar el CSS**

Al final de `src/styles/global.css`:

```css
/* El efecto de entrada se habilita desde JavaScript, no desde acá: el script
   pone `js-revelar` en <html> antes de observar nada. Sin JavaScript la clase
   nunca aparece, estas reglas no aplican y todo se ve —que es el estado por
   defecto correcto. Si el CSS escondiera por su cuenta, un visitante sin JS
   vería una página en blanco. */
.js-revelar .revelar {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 500ms ease-out, transform 500ms ease-out;
}

.js-revelar .revelar.visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .js-revelar .revelar {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Paso 4: Marcar las secciones y agregar el observador**

En `src/components/HomeContent.astro`, agregar la clase `revelar` a las dos secciones que declara
y a las importadas. Como las otras secciones viven dentro de sus componentes, el marcado se hace
desde el script, que es el único lugar donde están todas juntas.

Agregar `class="revelar"` a las dos secciones propias:

```astro
<section data-testid="bloque-proyectos" id="proyectos" class="revelar scroll-mt-24 py-16 sm:py-20">
```

```astro
<section data-testid="bloque-contacto" id="contacto" class="revelar scroll-mt-24 py-16 sm:py-20">
```

Y agregar `revelar` a la clase de la sección en `SobreMiResumen.astro`, `StackGrid.astro` y
`Formacion.astro`. **El hero no la lleva:** está en el primer viewport, y animarlo al entrar
significa que lo primero que ve alguien que llega es un elemento moviéndose.

Al final de `src/components/HomeContent.astro`, agregar:

```astro
<script>
  // Un solo observador para todas las secciones, mismo patrón que el scroll-spy
  // del header. No es un island de React: pagar hidratación para un fade no se
  // justifica.
  let observador: IntersectionObserver | null = null;

  function activarRevelado() {
    observador?.disconnect();

    const secciones = document.querySelectorAll<HTMLElement>('.revelar');
    if (secciones.length === 0) return;

    // La clase va primero y desde acá: es lo que habilita el CSS que esconde.
    // Sin JavaScript nunca se agrega y las secciones se ven de entrada.
    document.documentElement.classList.add('js-revelar');

    observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          entrada.target.classList.add('visible');
          // Una vez revelada no se vuelve a esconder: el efecto es de entrada,
          // no un parpadeo cada vez que la sección cruza el borde.
          observador?.unobserve(entrada.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' }
    );

    for (const s of secciones) observador.observe(s);
  }

  activarRevelado();
  // Las view transitions no recargan la página: sin esto, volver a la home tras
  // navegar dejaría las secciones escondidas y sin nadie que las revele.
  document.addEventListener('astro:after-swap', activarRevelado);
</script>
```

> **Ojo con el orden.** `classList.add('js-revelar')` va **después** del `if` que corta cuando no
> hay secciones: si se agregara antes, una página sin `.revelar` quedaría con la clase puesta sin
> ningún observador, y cualquier `.revelar` que apareciera después por una view transition se
> quedaría invisible para siempre.

- [ ] **Paso 5: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t10c.txt 2>&1; tail -5 /tmp/t10c.txt
npx playwright test home.spec.ts --project=chromium > /tmp/t10.txt 2>&1; grep -E "passed|failed" /tmp/t10.txt
```

Esperado: verde, incluidos los dos tests sin JavaScript.

- [ ] **Paso 6: Verificar que la navegación de vuelta no rompe el efecto**

```bash
npx playwright test navegacion.spec.ts --project=chromium > /tmp/t10n.txt 2>&1; grep -E "passed|failed" /tmp/t10n.txt
```

Esperado: verde. Este paso existe porque el reenganche en `astro:after-swap` es el error que ya
se cometió una vez con el scroll-spy y con el filtro.

- [ ] **Paso 7: Commit**

```bash
git add src/styles/global.css src/components/ tests/e2e/home.spec.ts
git commit -m "style: las secciones aparecen al scrollear, visibles sin JavaScript"
```

---

## Tarea 11: Densidad del stack y estructura del pie

Las dos piezas visuales que quedan. Van juntas porque ninguna tiene lógica y las dos son ajustes
de presentación aislados.

**Archivos:**
- Modificar: `src/components/StackGrid.astro`, `src/components/Footer.astro`
- Test: `tests/e2e/navegacion.spec.ts`

**Interfaces:**
- Consume: nada.
- Produce: nada. El testid `pie` se mantiene, que es lo que ya afirma `navegacion.spec.ts`.

- [ ] **Paso 1: Escribir el test que falla**

En `tests/e2e/navegacion.spec.ts`, dentro del `describe('Navegación')`, agregar:

```ts
  // El pie pasa a tener los enlaces de las secciones además de las redes. Sin
  // esta aserción, que quede solo el copyright no rompería nada.
  test('el pie enlaza secciones y redes', async ({ page }) => {
    await page.goto('/es/');
    const pie = page.getByTestId('pie');
    await expect(pie.getByTestId('pie-github')).toHaveAttribute('href', /github\.com/);
    await expect(pie.getByTestId('pie-linkedin')).toHaveAttribute('href', /linkedin\.com/);
    await expect(pie.getByTestId('pie-secciones').getByRole('link')).toHaveCount(3);
  });
```

- [ ] **Paso 2: Correr el test y verificar que falla**

```bash
npx playwright test navegacion.spec.ts --project=chromium -g "pie enlaza" > /tmp/t11.txt 2>&1; cat /tmp/t11.txt
```

Esperado: FAIL, no existe `pie-github`.

- [ ] **Paso 3: Reescribir el pie**

Reemplazar `src/components/Footer.astro` por:

```astro
---
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

const lang: Lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const anio = new Date().getFullYear();
const home = `/${lang}/`;

// Tres secciones y no las seis del navbar: el pie repite los destinos que
// alguien busca cuando terminó de leer, no duplica la navegación entera.
const secciones = [
  { id: 'proyectos', texto: t('nav.proyectos') },
  { id: 'formacion', texto: t('nav.formacion') },
  { id: 'contacto', texto: t('nav.contacto') },
];

const redes = [
  { testid: 'pie-github', href: 'https://github.com/Malu-gani', texto: 'GitHub' },
  { testid: 'pie-linkedin', href: 'https://www.linkedin.com/in/maluganijuanmanuel', texto: 'LinkedIn' },
];
---
<footer data-testid="pie" class="mt-16 border-t border-border">
  <div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
    <div>
      <p class="font-medium text-text">Juan Manuel Malugani</p>
      <p class="mt-1">{t('home.rol')}</p>
    </div>

    <ul data-testid="pie-secciones" class="flex flex-wrap gap-x-6 gap-y-2">
      {secciones.map((s) => (
        <li>
          <a href={`${home}#${s.id}`}
            class="transition-colors hover:text-accent focus-visible:text-accent">{s.texto}</a>
        </li>
      ))}
    </ul>

    <ul class="flex flex-wrap gap-x-6 gap-y-2">
      {redes.map((r) => (
        <li>
          <a href={r.href} data-testid={r.testid} target="_blank" rel="noopener noreferrer"
            class="transition-colors hover:text-accent focus-visible:text-accent">{r.texto}</a>
        </li>
      ))}
    </ul>
  </div>

  <div class="mx-auto max-w-5xl px-4 pb-6 text-sm text-muted">
    <span>© {anio} Juan Manuel Malugani</span>
  </div>
</footer>
```

> El pie es el único componente que resuelve su idioma con `getLangFromUrl` en vez de recibirlo
> como prop, porque `BaseLayout.astro` lo monta sin pasarle nada. Es lo mismo que ya hace
> `Header.astro`.

- [ ] **Paso 4: Comprimir la grilla del stack**

En `src/components/StackGrid.astro`, reemplazar el bloque del `<ul>` y sus `<li>`:

```astro
        <ul class="mt-3 flex flex-wrap gap-2">
          {stack.filter((tec) => tec.categoria === categoria).map((tec) => (
            <li data-testid="stack-item"
              class="rounded-lg border border-border bg-surface px-3 py-2">
              <span class="block text-sm font-medium text-text">{tec.nombre}</span>
              <span class={`block text-xs ${colorNivel[tec.nivel]}`}>
                {t(claveNivel[tec.nivel])}
              </span>
            </li>
          ))}
        </ul>
```

por:

```astro
        <ul class="mt-3 flex flex-wrap gap-1.5">
          {stack.filter((tec) => tec.categoria === categoria).map((tec) => (
            <li data-testid="stack-item"
              class="flex items-baseline gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5">
              <span class="text-sm font-medium text-text">{tec.nombre}</span>
              <span class={`text-xs ${colorNivel[tec.nivel]}`}>
                {t(claveNivel[tec.nivel])}
              </span>
            </li>
          ))}
        </ul>
```

> El nivel pasa de estar debajo del nombre a estar al lado: mismo texto, misma información, la
> mitad de alto por chip. Con 33 chips eso es la diferencia entre que el stack ocupe dos
> pantallas o una.

Y reducir el espacio entre categorías, en el `<div>` de la línea 34:

```astro
  <div class="mt-6 space-y-6">
```

- [ ] **Paso 5: Correr los tests y verificar que pasan**

```bash
npm run check > /tmp/t11c.txt 2>&1; tail -5 /tmp/t11c.txt
npx playwright test navegacion.spec.ts componentes.spec.ts a11y.spec.ts --project=chromium > /tmp/t11.txt 2>&1; grep -E "passed|failed" /tmp/t11.txt
```

Esperado: verde. `a11y.spec.ts` se corre acá porque el pie sumó enlaces y el contraste de
`text-muted` sobre `bg` es el que está más al límite del sitio.

- [ ] **Paso 6: Commit**

```bash
git add src/components/StackGrid.astro src/components/Footer.astro tests/e2e/navegacion.spec.ts
git commit -m "style: chips de stack mas compactos y pie con enlaces de seccion"
```

---

## Tarea 12: Cierre — capturas, gates y verificación cross-browser

La única tarea que regenera capturas y la única que corre todo. No se saltea ni se parte.

**Archivos:**
- Modificar: `tests/e2e/visual.spec.ts-snapshots/` (8 archivos PNG)

**Interfaces:**
- Consume: todo lo anterior.
- Produce: la rama lista para PR.

- [ ] **Paso 1: Correr la suite completa y anotar el estado real**

```bash
npm run test:e2e > /tmp/final-e2e.txt 2>&1; grep -E "passed|failed|flaky" /tmp/final-e2e.txt
```

**Nunca con `| tail`.** Leer el archivo entero si algo falla.

Esperado: fallan **solo** los 8 tests de `visual.spec.ts`. Cualquier otra falla se arregla antes
de seguir: regenerar capturas sobre una suite roja congela el bug en la referencia.

- [ ] **Paso 2: Verificar que las únicas fallas son visuales**

```bash
grep -E "^\s+[0-9]+\) " /tmp/final-e2e.txt
```

Esperado: las 8 líneas listadas son todas de `visual.spec.ts`. Si aparece otra, volver al Paso 1.

- [ ] **Paso 3: Regenerar las capturas, con motivo**

```bash
npx playwright test visual.spec.ts --project=chromium --update-snapshots > /tmp/final-snap.txt 2>&1; grep -E "passed|failed" /tmp/final-snap.txt
```

Se limita a `visual.spec.ts` y a `chromium` a propósito: es el único proyecto que tiene capturas
de referencia versionadas, y `--update-snapshots` global reescribiría cualquier otra cosa que
estuviera fallando.

- [ ] **Paso 4: Mirar las capturas nuevas antes de commitearlas**

```bash
git status --short tests/e2e/visual.spec.ts-snapshots/
```

Abrir al menos `-es--light-chromium-win32.png` y `-es--dark-chromium-win32.png` y confirmar a ojo:
retrato circular centrado arriba, una sola sección de proyectos con el filtro, la sección
Formación con sus cuatro ítems, sin líneas divisorias entre secciones. Si alguna captura muestra
algo que no se pidió, es un bug, no una referencia nueva.

- [ ] **Paso 5: Correr los gates que faltan**

```bash
npm run check > /tmp/final-check.txt 2>&1; tail -5 /tmp/final-check.txt
npm run check:listo > /tmp/final-listo.txt 2>&1; tail -5 /tmp/final-listo.txt
npm run test:unit > /tmp/final-unit.txt 2>&1; grep -E "Tests|failed" /tmp/final-unit.txt
npm run test:e2e > /tmp/final-e2e2.txt 2>&1; grep -E "passed|failed|flaky" /tmp/final-e2e2.txt
```

Esperado: los cuatro en verde, los 4 proyectos de Playwright incluidos.

- [ ] **Paso 6: Lighthouse**

`lhci autorun` no funciona en esta máquina Windows; el CLI directo sí. Con el preview levantado:

```bash
npm run build && npm run preview
```

y en otra terminal:

```bash
node_modules/.bin/lighthouse http://localhost:4321/es/ --only-categories=performance,accessibility --output=json --output-path=/tmp/lh-home.json --chrome-flags="--headless=new"
node -e "const r=require('/tmp/lh-home.json');console.log('perf',r.categories.performance.score,'a11y',r.categories.accessibility.score)"
```

Esperado: `perf ≥ 0.9`, `a11y = 1`.

Si performance baja de 0.9, el sospechoso número uno es el retrato: verificar en el reporte que
no aparezca en "Properly size images" ni en "Largest Contentful Paint element" con un tiempo alto,
y confirmar que se está sirviendo el WebP y no el JPG.

- [ ] **Paso 7: Verificación específica del tramo, a mano**

Los dos puntos que la spec exige y que ningún gate cubre:

1. **`scroll-snap` en los cuatro navegadores** — ya cubierto por los tests de la Tarea 9 más la
   verificación manual de su Paso 5. Confirmar que se hizo y anotar el resultado.
2. **Aparición al scrollear con JavaScript deshabilitado** — cubierto por el describe "Sin
   JavaScript no queda nada invisible" de la Tarea 10. Confirmar que corrió en los 4 proyectos.

- [ ] **Paso 8: Commit y push**

```bash
git add tests/e2e/visual.spec.ts-snapshots/
git commit -m "test: se regeneran las capturas tras la reorganizacion de secciones"
git push -u origin feat/secciones-y-restyle
```

- [ ] **Paso 9: Abrir el PR**

Usar `superpowers:finishing-a-development-branch`. El cuerpo del PR tiene que decir, como mínimo:
qué secciones cambiaron de id, que el retrato se resolvió con 317 px y por qué el hero es de una
columna, y si `scroll-snap` quedó o se revirtió.

---

## Auto-revisión

**1. Cobertura de la spec.** Recorriendo sección por sección:

| Spec | Tarea |
|---|---|
| 3.1 Estructura de la home | 3, 6 |
| 3.2 `#qa` + `#dev` → `#proyectos` | 2, 3 |
| 3.3 `destacado` ordena | 1 |
| 3.4 Hero con retrato | 4 |
| 3.5 Sección Formación | 5, 6 |
| 3.6 Ritmo de sección | 7 |
| 3.6 Hover y foco | 8 |
| 3.6 Scroll | 9 |
| 3.6 Aparición al scrollear | 10 |
| 3.6 Skills (densidad) | 11 |
| 3.6 Formación (cards) | 6 |
| 3.7 Estado por defecto visible | 10 |
| 3.7 `scroll-snap` verificado en navegador | 9 (Paso 5), 12 (Paso 7) |
| 3.7 `prefers-reduced-motion` cubre snap | 9 |
| 5 Impacto en la suite | 3, 6, 12 |
| 7 Criterios de éxito | 12 |

**Un ítem de la spec que este plan no implementa:** el degradado radial del hero (3.6). Es una
línea de CSS y depende de la paleta, que la sección 6 de la spec deja explícitamente para un
tramo propio. Se hace ahí, junto con el resto del color. Queda anotado como pendiente, no como
olvido.

**2. Placeholders.** Sin TBD, sin "manejar errores apropiadamente", sin "similar a la Tarea N".
Todos los pasos de código llevan el código.

**3. Consistencia de tipos.** `nivelTitulo` es `1 | 2` en `ProyectoListadoFiltrable` y `2 | 3` en
`ProyectoCard` — son dos props distintas con el mismo nombre y rangos distintos a propósito; la
Tarea 2 deriva la segunda de la primera con `nivelCard`. `EstadoFormacion` y `ESTADOS_FORMACION`
se definen en la Tarea 5 y se consumen en la 5 (test) y la 6 (componente), con los mismos cuatro
valores. `SECCIONES` crece de 5 a 6 elementos entre la Tarea 3 y la 6, y los tests de ambas usan
la constante en vez de una lista copiada.
