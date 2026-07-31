# Home one-page y listados unificados — Plan de implementación

> **Para quien ejecute esto:** las tareas están pensadas para hacerse **de a una, con contexto fresco**. Cada tarea nombra sus archivos por ruta completa, no depende de conversaciones previas y deja el árbol commiteable. Los pasos usan checkbox (`- [ ]`).

**Objetivo:** convertir la home en una página scrolleable con navbar sticky y scroll-spy, unificar los listados de QA y desarrollo en `/proyectos` con filtro, y reescribir el stack por categoría técnica con el nivel en cada chip.

**Arquitectura:** Astro estático. El scroll-spy y el filtro son scripts vanilla, sin islands nuevos de React. El filtro se apoya en rutas reales generadas estáticamente, y el JavaScript solo evita la recarga.

**Stack:** Astro 7.1.3, React 19 (solo los dos islands ya existentes), Tailwind 4.3.3, TypeScript strict, Playwright 1.62, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-07-31-home-onepage-design.md`

## Restricciones globales

Aplican a **todas** las tareas:

- **TypeScript strict.** `npm run check` debe dar 0 errores. `astro build` no verifica tipos en `.tsx`.
- **Tokens de color semánticos**, nunca hexadecimales sueltos. Disponibles: `bg`, `surface`, `text`, `muted`, `border`, `accent`, `sev-*`, `est-*`.
- **Nada se comunica solo por color.** Siempre color + texto (+ ícono si aplica).
- **`data-testid` en todo lo verificable.** Los selectores CSS viven solo dentro de los Page Objects, nunca en los `.spec.ts`.
- **Páginas espejo ES/EN** que delegan en un componente compartido que recibe `lang`. Nada de texto hardcodeado en una sola lengua dentro de un componente compartido.
- **React solo en los dos islands existentes** (`ThemeToggle.tsx`, `CopyEmail.tsx`). Este plan no agrega ninguno.
- **`html { overflow-y: scroll }` en `global.css` no se toca.** Evita un crash real de WebKit con las view transitions.
- **Sin marcas de IA en los commits.** Nada de trailers `Co-Authored-By`.
- **La suite se salda en la Tarea 10, no antes.** Las tareas intermedias pueden dejar tests E2E rojos **a propósito**; cada una dice explícitamente cuáles. Lo que sí debe quedar verde en cada tarea: `npm run check` y `npm run test:unit`.

## Orden y dependencias

```
T1 stack.ts ──> T2 StackGrid
T3 card unificada ──> T4 listado /proyectos ──> T7 home
T5 hero  ─┐
T6 sobre mí ─┴──> T7 home ──> T8 navbar ──> T9 menú mobile ──> T10 suite
```

T1, T3, T5 y T6 no dependen de nada y pueden hacerse en cualquier orden.

---

### Tarea 1: Datos del stack tipados

Saca las tecnologías de dentro del componente y las vuelve verificables.

**Archivos:**
- Crear: `src/data/stack.ts`
- Crear: `tests/unit/stack.test.ts`

**Interfaces que produce** (las usa la Tarea 2):
```ts
export type Categoria = 'lenguajes' | 'testing' | 'frameworks' | 'datos' | 'herramientas';
export type Nivel = 'avanzado' | 'intermedio' | 'aprendiendo';
export interface Tecnologia { nombre: string; categoria: Categoria; nivel: Nivel }
export const stack: Tecnologia[]
export const ordenCategorias: Categoria[]
```

- [ ] **Paso 1: escribir el test que falla**

Crear `tests/unit/stack.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stack, ordenCategorias, type Categoria, type Nivel } from '../../src/data/stack';

const CATEGORIAS: Categoria[] = ['lenguajes', 'testing', 'frameworks', 'datos', 'herramientas'];
const NIVELES: Nivel[] = ['avanzado', 'intermedio', 'aprendiendo'];

describe('stack', () => {
  it('no está vacío', () => {
    expect(stack.length).toBeGreaterThan(0);
  });

  it('toda tecnología tiene una categoría válida', () => {
    for (const t of stack) {
      expect(CATEGORIAS, `categoría inválida en ${t.nombre}`).toContain(t.categoria);
    }
  });

  it('toda tecnología tiene un nivel válido', () => {
    for (const t of stack) {
      expect(NIVELES, `nivel inválido en ${t.nombre}`).toContain(t.nivel);
    }
  });

  it('no hay tecnologías repetidas', () => {
    const nombres = stack.map((t) => t.nombre);
    expect(new Set(nombres).size).toBe(nombres.length);
  });

  it('ordenCategorias cubre exactamente las categorías usadas', () => {
    const usadas = new Set(stack.map((t) => t.categoria));
    expect(new Set(ordenCategorias)).toEqual(usadas);
  });

  it('no declara tecnologías sin respaldo en ningún proyecto', () => {
    // Se retiraron el 2026-07-31 tras escanear los repositorios en disco:
    // ninguna aparecía en un proyecto real. Este test evita que vuelvan sin
    // que alguien lo decida a propósito.
    const retiradas = ['Cypress', 'Selenium', 'TestRail', 'Xray'];
    const nombres = stack.map((t) => t.nombre);
    for (const r of retiradas) {
      expect(nombres, `${r} volvió al stack sin justificación`).not.toContain(r);
    }
  });
});
```

- [ ] **Paso 2: correr el test y verificar que falla**

```bash
npm run test:unit -- stack
```
Esperado: FAIL, no resuelve `../../src/data/stack`.

- [ ] **Paso 3: crear el archivo de datos**

Crear `src/data/stack.ts`:

```ts
/**
 * El stack vive acá y no dentro de `StackGrid.astro` para que se pueda
 * verificar desde un test unitario que ninguna tecnología quede sin categoría
 * o con un nivel inválido. Antes estaba hardcodeado en el componente y no
 * había forma de afirmarlo.
 *
 * El nivel es una declaración sobre la evidencia disponible, no una
 * autoevaluación de habilidad:
 *   avanzado    — proyecto real, defendible en una entrevista técnica
 *   intermedio  — uso puntual o proyectos más chicos
 *   aprendiendo — en estudio
 */

export type Categoria = 'lenguajes' | 'testing' | 'frameworks' | 'datos' | 'herramientas';
export type Nivel = 'avanzado' | 'intermedio' | 'aprendiendo';

export interface Tecnologia {
  nombre: string;
  categoria: Categoria;
  nivel: Nivel;
}

/** Orden de aparición de las categorías en la grilla. */
export const ordenCategorias: Categoria[] = [
  'lenguajes',
  'testing',
  'frameworks',
  'datos',
  'herramientas',
];

export const stack: Tecnologia[] = [
  { nombre: 'JavaScript', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'TypeScript', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'SQL', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'HTML', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'CSS', categoria: 'lenguajes', nivel: 'avanzado' },
  { nombre: 'Python', categoria: 'lenguajes', nivel: 'intermedio' },
  { nombre: 'PHP', categoria: 'lenguajes', nivel: 'intermedio' },

  { nombre: 'Playwright', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'Vitest', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'Testing Library', categoria: 'testing', nivel: 'avanzado' },
  { nombre: 'pytest', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'Postman', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'Newman', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'axe-core', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'Lighthouse CI', categoria: 'testing', nivel: 'intermedio' },
  { nombre: 'REST Assured', categoria: 'testing', nivel: 'aprendiendo' },

  { nombre: 'React', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Next.js', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Astro', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Tailwind CSS', categoria: 'frameworks', nivel: 'avanzado' },
  { nombre: 'Bootstrap', categoria: 'frameworks', nivel: 'intermedio' },
  { nombre: 'jQuery', categoria: 'frameworks', nivel: 'intermedio' },

  { nombre: 'PostgreSQL', categoria: 'datos', nivel: 'avanzado' },
  { nombre: 'Supabase', categoria: 'datos', nivel: 'avanzado' },

  { nombre: 'Git', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'GitHub Actions', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Vercel', categoria: 'herramientas', nivel: 'avanzado' },
  { nombre: 'Docker', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'ESLint', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'Jira', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'Trello', categoria: 'herramientas', nivel: 'intermedio' },
  { nombre: 'Notion', categoria: 'herramientas', nivel: 'intermedio' },
];
```

- [ ] **Paso 4: correr el test y verificar que pasa**

```bash
npm run test:unit -- stack
```
Esperado: PASS, 6 tests.

- [ ] **Paso 5: verificar tipos**

```bash
npm run check
```
Esperado: 0 errores.

- [ ] **Paso 6: commit**

```bash
git add src/data/stack.ts tests/unit/stack.test.ts
git commit -m "feat: el stack pasa a datos tipados y verificables"
```

---

### Tarea 2: StackGrid por categoría con el nivel en cada chip

**Archivos:**
- Modificar: `src/components/StackGrid.astro` (reescritura completa)
- Modificar: `src/i18n/ui.ts` (claves de categorías y niveles)

**Consume:** `stack`, `ordenCategorias`, `Categoria`, `Nivel` de `src/data/stack.ts` (Tarea 1).

- [ ] **Paso 1: agregar las claves de traducción**

En `src/i18n/ui.ts`, sumar al tipo `ClaveUI`:

```ts
  | 'stack.lenguajes'
  | 'stack.testing'
  | 'stack.frameworks'
  | 'stack.datos'
  | 'stack.herramientas'
  | 'stack.nivel.avanzado'
  | 'stack.nivel.intermedio'
  | 'stack.nivel.aprendiendo'
```

En el diccionario `es`, después de `'home.stack'`:

```ts
  'stack.lenguajes': 'Lenguajes',
  'stack.testing': 'Testing y automatización',
  'stack.frameworks': 'Frameworks y librerías',
  'stack.datos': 'Bases de datos',
  'stack.herramientas': 'Herramientas y plataformas',
  'stack.nivel.avanzado': 'Avanzado',
  'stack.nivel.intermedio': 'Intermedio',
  'stack.nivel.aprendiendo': 'Aprendiendo',
```

En el diccionario `en`, en la misma posición:

```ts
  'stack.lenguajes': 'Languages',
  'stack.testing': 'Testing & automation',
  'stack.frameworks': 'Frameworks & libraries',
  'stack.datos': 'Databases',
  'stack.herramientas': 'Tools & platforms',
  'stack.nivel.avanzado': 'Advanced',
  'stack.nivel.intermedio': 'Intermediate',
  'stack.nivel.aprendiendo': 'Learning',
```

- [ ] **Paso 2: reescribir el componente**

Reemplazar todo el contenido de `src/components/StackGrid.astro`:

```astro
---
import { stack, ordenCategorias, type Categoria, type Nivel } from '../data/stack';
import { useTranslations } from '../i18n/utils';
import type { Lang, ClaveUI } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

const claveCategoria: Record<Categoria, ClaveUI> = {
  lenguajes: 'stack.lenguajes',
  testing: 'stack.testing',
  frameworks: 'stack.frameworks',
  datos: 'stack.datos',
  herramientas: 'stack.herramientas',
};

const claveNivel: Record<Nivel, ClaveUI> = {
  avanzado: 'stack.nivel.avanzado',
  intermedio: 'stack.nivel.intermedio',
  aprendiendo: 'stack.nivel.aprendiendo',
};

// El nivel se comunica con texto, no solo con color: es la misma restricción
// que rige para severidad y estado en el resto del sitio.
const colorNivel: Record<Nivel, string> = {
  avanzado: 'text-accent',
  intermedio: 'text-muted',
  aprendiendo: 'text-sev-medio',
};
---
<section data-testid="stack" id="stack" class="scroll-mt-24 py-10">
  <h2 class="text-2xl font-semibold">{t('home.stack')}</h2>
  <div class="mt-6 space-y-8">
    {ordenCategorias.map((categoria) => (
      <div data-testid={`stack-grupo-${categoria}`}>
        <h3 class="text-sm font-semibold uppercase tracking-wide text-muted">
          {t(claveCategoria[categoria])}
        </h3>
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
      </div>
    ))}
  </div>
</section>
```

- [ ] **Paso 3: verificar tipos**

```bash
npm run check
```
Esperado: 0 errores. Si aparece un error en `claveCategoria` o `claveNivel`, es que faltó agregar alguna clave al tipo `ClaveUI` en el Paso 1.

- [ ] **Paso 4: verificar el render**

```bash
npm run build
```
Esperado: 21 páginas. Abrir `dist/es/index.html` y confirmar que aparecen los cinco encabezados de categoría y que cada chip tiene nombre y nivel.

- [ ] **Paso 5: commit**

```bash
git add src/components/StackGrid.astro src/i18n/ui.ts
git commit -m "feat: el stack se agrupa por categoria y cada chip declara su nivel"
```

---

### Tarea 3: Card unificada para QA y desarrollo

Fusiona `CasoCard.astro` y `ProyectoCard.astro`, que hoy son casi idénticos, y le suma métricas, enlaces y distintivo de carril.

**Archivos:**
- Modificar: `src/content.config.ts` (campo `metricas` en ambas colecciones)
- Modificar: `src/components/ProyectoCard.astro` (reescritura completa)
- Borrar: `src/components/CasoCard.astro`
- Modificar: `src/components/HomeContent.astro`, `src/components/QaListado.astro` (cambian el import)
- Modificar: `src/i18n/ui.ts` (claves nuevas)
- Modificar: `src/content/casos-qa/es/gestor-operaciones.md` y `.../en/gestor-operaciones.md` (cargar métricas)

**Interfaces que produce** (las usan las Tareas 4 y 7):
```ts
interface Props {
  lang: Lang;
  slug: string;
  tipo: 'qa' | 'dev';
  datos: { titulo: string; resumen: string; tags?: string[]; stack: string[];
           estado?: 'completo' | 'en-progreso';
           metricas?: { etiqueta: string; valor: string }[];
           repo?: string; demo?: string };
  nivelTitulo: 2 | 3;
}
```

- [ ] **Paso 1: agregar el campo al schema**

En `src/content.config.ts`, dentro de `casosQa.schema` y de `proyectos.schema`, agregar antes de `repo`:

```ts
    metricas: z.array(z.object({
      etiqueta: z.string().min(1),
      valor: z.string().min(1),
    })).max(3).optional(),
```

Misma forma que ya consume `Metricas.astro`, para no tener dos maneras de expresar lo mismo.

- [ ] **Paso 2: agregar las claves de traducción**

En `src/i18n/ui.ts`, sumar al tipo `ClaveUI` y a ambos diccionarios:

```ts
// ClaveUI
  | 'card.qa'
  | 'card.dev'

// es
  'card.qa': 'QA',
  'card.dev': 'Desarrollo',

// en
  'card.qa': 'QA',
  'card.dev': 'Development',
```

- [ ] **Paso 3: reescribir la card**

Reemplazar todo el contenido de `src/components/ProyectoCard.astro`:

```astro
---
import Tag from './Tag.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

/**
 * Card única para los dos carriles. `CasoCard` y `ProyectoCard` eran casi
 * idénticos —mismo borde, mismo hover, misma estructura— y mantenerlos
 * separados significaba aplicar cada cambio de diseño dos veces.
 *
 * El `tipo` lo pasa quien renderiza, derivado de la colección de la que sale
 * la entrada. No vive en el frontmatter a propósito: un dato que se puede
 * calcular no debería poder contradecirse.
 */
interface Props {
  lang: Lang;
  slug: string;
  tipo: 'qa' | 'dev';
  datos: {
    titulo: string;
    resumen: string;
    tags?: string[];
    stack: string[];
    estado?: 'completo' | 'en-progreso';
    metricas?: { etiqueta: string; valor: string }[];
    repo?: string;
    demo?: string;
  };
  nivelTitulo: 2 | 3;
}

const { lang, slug, tipo, datos, nivelTitulo } = Astro.props;
const t = useTranslations(lang);
const TituloTag = nivelTitulo === 2 ? 'h2' : 'h3';
const href = `/${lang}/${tipo === 'qa' ? 'qa' : 'dev'}/${slug}`;
// Los chips salen de `tags` en QA (manual, e2e, api...) y de `stack` en dev.
const chips = tipo === 'qa' ? (datos.tags ?? []) : datos.stack;
---
<article data-testid="proyecto-card" data-tipo={tipo}
  class="relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent">
  <div class="flex items-center gap-2">
    <span data-testid="card-distintivo"
      class="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted">
      {tipo === 'qa' ? t('card.qa') : t('card.dev')}
    </span>
    {datos.estado === 'en-progreso' && (
      <span data-testid="card-estado" class="text-xs text-sev-medio">
        <span aria-hidden="true">◐</span> {t('caso.enProgreso')}
      </span>
    )}
  </div>

  <TituloTag class="mt-3 text-lg font-semibold">
    <a href={href} class="after:absolute after:inset-0">{datos.titulo}</a>
  </TituloTag>

  <p class="mt-2 text-sm text-muted">{datos.resumen}</p>

  {datos.metricas && datos.metricas.length > 0 && (
    <dl data-testid="card-metricas" class="mt-3 flex flex-wrap gap-x-4 gap-y-1">
      {datos.metricas.map((m) => (
        <div class="flex items-baseline gap-1">
          <dd class="font-mono text-sm text-accent">{m.valor}</dd>
          <dt class="text-xs text-muted">{m.etiqueta}</dt>
        </div>
      ))}
    </dl>
  )}

  <div class="mt-3 flex flex-wrap gap-1">
    {chips.map((c) => <Tag nombre={c} />)}
  </div>

  {(datos.repo || datos.demo) && (
    <div class="relative z-10 mt-4 flex gap-4 text-sm">
      {datos.repo && (
        <a href={datos.repo} data-testid="card-repo" target="_blank" rel="noopener noreferrer"
          class="text-accent hover:underline">{t('caso.verRepo')}</a>
      )}
      {datos.demo && (
        <a href={datos.demo} data-testid="card-demo" target="_blank" rel="noopener noreferrer"
          class="text-accent hover:underline">{t('caso.verDemo')}</a>
      )}
    </div>
  )}
</article>
```

**Ojo con `relative z-10` en los enlaces:** el título usa `after:absolute after:inset-0` para hacer toda la card clickeable. Sin el `z-10`, esa capa taparía los enlaces de repo y demo y serían imposibles de clickear.

- [ ] **Paso 4: borrar la card vieja y actualizar los consumidores**

```bash
git rm src/components/CasoCard.astro
```

En `src/components/HomeContent.astro`, cambiar el import y el uso:

```astro
import ProyectoCard from './ProyectoCard.astro';
```
```astro
<ProyectoCard lang={lang} slug={c.id.replace(prefijo, '')} tipo="qa" datos={c.data} nivelTitulo={3} />
```

En `src/components/QaListado.astro`, lo mismo con `nivelTitulo={2}`.

En `src/components/ProyectoListado.astro`, agregar `tipo="dev"` al uso existente.

**Sí, estos dos se borran en la Tarea 4.** Se actualizan igual para que esta
tarea deje el árbol compilando y commiteable por sí sola: si se saltea, el
build queda roto entre tareas y deja de poder cerrarse la sesión en el medio.

- [ ] **Paso 5: cargar métricas reales en el caso del gestor**

En `src/content/casos-qa/es/gestor-operaciones.md`, agregar al frontmatter:

```yaml
metricas:
  - etiqueta: pruebas
    valor: "275"
  - etiqueta: defectos
    valor: "10"
```

En `src/content/casos-qa/en/gestor-operaciones.md`:

```yaml
metricas:
  - etiqueta: tests
    valor: "275"
  - etiqueta: defects
    valor: "10"
```

Verificar contra el contenido del caso que los números sigan siendo los correctos antes de escribirlos.

- [ ] **Paso 6: verificar**

```bash
npm run check
npm run test:unit
npm run build
```
Esperado: 0 errores de tipos, unitarios en verde, 21 páginas. Abrir `dist/es/index.html` y confirmar el distintivo, las métricas y los enlaces en la card del gestor.

**Tests E2E que quedan rojos a propósito hasta la Tarea 10:** los que buscan `caso-card` en `casos.spec.ts` y `home.spec.ts`, porque ese testid ya no existe.

- [ ] **Paso 7: commit**

```bash
git add -A src/components src/content.config.ts src/i18n/ui.ts src/content/casos-qa
git commit -m "feat: una sola card para ambos carriles, con metricas y enlaces"
```

---

### Tarea 4: Listado unificado `/proyectos` con filtro

**Archivos:**
- Crear: `src/components/ProyectoListadoFiltrable.astro`, `src/components/FiltroProyectos.astro`
- Crear: `src/pages/es/proyectos/index.astro`, `.../dev.astro`, `.../todos.astro`
- Crear: `src/pages/en/projects/index.astro`, `.../dev.astro`, `.../all.astro`
- Borrar: `src/pages/es/qa/index.astro`, `src/pages/es/dev/index.astro`, `src/pages/en/qa/index.astro`, `src/pages/en/dev/index.astro`
- Borrar: `src/components/QaListado.astro`, `src/components/ProyectoListado.astro`
- Modificar: `src/i18n/routes.ts`, `astro.config.mjs`, `vercel.json`, `src/i18n/ui.ts`

**Consume:** `ProyectoCard.astro` con `tipo` (Tarea 3).

**Los `[...slug].astro` de `qa/` y `dev/` NO se tocan.** Los detalles siguen en `/es/qa/<slug>` y `/es/dev/<slug>`.

- [ ] **Paso 1: agregar claves de traducción**

En `src/i18n/ui.ts`, al tipo y a ambos diccionarios:

```ts
// ClaveUI
  | 'proyectos.titulo'
  | 'proyectos.bajada'
  | 'filtro.qa'
  | 'filtro.dev'
  | 'filtro.todos'
  | 'filtro.etiqueta'

// es
  'proyectos.titulo': 'Proyectos',
  'proyectos.bajada': 'Casos de QA y proyectos de desarrollo. Cada uno documenta el contexto, lo que hice y qué aprendí.',
  'filtro.qa': 'QA · Automation',
  'filtro.dev': 'Desarrollo',
  'filtro.todos': 'Todos',
  'filtro.etiqueta': 'Filtrar proyectos',

// en
  'proyectos.titulo': 'Projects',
  'proyectos.bajada': 'QA cases and development projects. Each one documents the context, what I did, and what I learned.',
  'filtro.qa': 'QA · Automation',
  'filtro.dev': 'Development',
  'filtro.todos': 'All',
  'filtro.etiqueta': 'Filter projects',
```

- [ ] **Paso 2: actualizar el mapa de rutas**

En `src/i18n/routes.ts`, reemplazar el tipo y el mapa:

```ts
export type SeccionKey = 'proyectos' | 'qa' | 'dev' | 'about' | 'contact';

export const seccionSlugs: Record<SeccionKey, Record<Lang, string>> = {
  proyectos: { es: 'proyectos', en: 'projects' },
  // `qa` y `dev` ya no son listados, pero siguen siendo el prefijo de las
  // páginas de detalle (`/es/qa/<slug>`), y `getAlternateUrl` los necesita
  // para traducir la URL de un detalle al otro idioma.
  qa: { es: 'qa', en: 'qa' },
  dev: { es: 'dev', en: 'dev' },
  about: { es: 'sobre-mi', en: 'about' },
  contact: { es: 'contacto', en: 'contact' },
};
```

- [ ] **Paso 2b: arreglar la traducción de URL del tercer filtro**

`getAlternateUrl` traduce la sección y deja el resto del path intacto. Con
`/es/proyectos/todos` produciría `/en/projects/todos`, que **no existe**: la
ruta en inglés es `/en/projects/all`. El toggle de idioma daría 404 justo en
esa vista.

Primero el test. En `tests/unit/i18n.test.ts`, dentro del `describe('getAlternateUrl')`:

```ts
  it('traduce el slug del filtro "todos" al cambiar de idioma', () => {
    expect(getAlternateUrl('/es/proyectos/todos', 'en')).toBe('/en/projects/all');
    expect(getAlternateUrl('/en/projects/all', 'es')).toBe('/es/proyectos/todos');
  });

  it('deja intacto el resto de los slugs de proyectos', () => {
    expect(getAlternateUrl('/es/proyectos/dev', 'en')).toBe('/en/projects/dev');
    expect(getAlternateUrl('/es/proyectos', 'en')).toBe('/en/projects');
  });
```

```bash
npm run test:unit -- i18n
```
Esperado: FAIL, devuelve `/en/projects/todos`.

Ahora el arreglo. En `src/i18n/utils.ts`, dentro de `getAlternateUrl`, justo
antes del `return` final:

```ts
  // El tercer filtro de proyectos es el único slug de segundo nivel que
  // cambia entre idiomas ('todos' / 'all'); el resto ('dev', y los slugs de
  // los casos) es igual en ambos y pasa sin tocar.
  const slugsFiltro: Record<Lang, string> = { es: 'todos', en: 'all' };
  const restoTraducido = resto.map((segmento) =>
    segmento === slugsFiltro[actual] && clave === 'proyectos' ? slugsFiltro[destino] : segmento
  );

  return `${['', destino, seccionSlugs[clave][destino], ...restoTraducido].join('/')}${queryString}${fragment}`;
```

Y borrar el `return` anterior, que usaba `...resto`.

```bash
npm run test:unit -- i18n
```
Esperado: PASS.

- [ ] **Paso 3: crear el filtro**

Crear `src/components/FiltroProyectos.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

/**
 * Los tres botones son enlaces a rutas reales, no estado en cliente. Sin
 * JavaScript, cada uno navega y el filtro funciona igual; con JavaScript, el
 * script de `ProyectoListadoFiltrable` los intercepta y evita la recarga.
 */
interface Props { lang: Lang; activo: 'qa' | 'dev' | 'todos' }
const { lang, activo } = Astro.props;
const t = useTranslations(lang);

const base = lang === 'es' ? '/es/proyectos' : '/en/projects';
const opciones = [
  { clave: 'qa' as const, href: base, texto: t('filtro.qa') },
  { clave: 'dev' as const, href: `${base}/dev`, texto: t('filtro.dev') },
  { clave: 'todos' as const, href: `${base}/${lang === 'es' ? 'todos' : 'all'}`, texto: t('filtro.todos') },
];
---
<div role="group" aria-label={t('filtro.etiqueta')} data-testid="filtro-proyectos"
  class="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1">
  {opciones.map((o) => (
    <a href={o.href} data-testid={`filtro-${o.clave}`} data-filtro={o.clave}
      aria-current={activo === o.clave ? 'true' : undefined}
      class:list={[
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        activo === o.clave ? 'bg-bg text-text' : 'text-muted hover:text-text',
      ]}>{o.texto}</a>
  ))}
</div>
```

- [ ] **Paso 4: crear el listado filtrable**

Crear `src/components/ProyectoListadoFiltrable.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ProyectoCard from './ProyectoCard.astro';
import FiltroProyectos from './FiltroProyectos.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang; activo: 'qa' | 'dev' | 'todos' }
const { lang, activo } = Astro.props;
const t = useTranslations(lang);
const prefijo = `${lang}/`;

const casos = (await getCollection('casos-qa'))
  .filter((c) => c.id.startsWith(prefijo))
  .map((c) => ({ tipo: 'qa' as const, slug: c.id.replace(prefijo, ''), datos: c.data, fecha: c.data.fecha }));

const proyectos = (await getCollection('proyectos'))
  .filter((p) => p.id.startsWith(prefijo))
  .map((p) => ({ tipo: 'dev' as const, slug: p.id.replace(prefijo, ''), datos: p.data, fecha: p.data.fecha }));

// Se renderizan TODOS en las tres rutas y se ocultan por CSS los que no
// corresponden. Así el script del filtro no tiene que pedir nada al servidor
// ni reconstruir el DOM: solo cambia un atributo.
const todos = [...casos, ...proyectos].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
---
<h1 class="text-3xl font-bold sm:text-4xl">{t('proyectos.titulo')}</h1>
<p class="mt-3 max-w-prose text-muted">{t('proyectos.bajada')}</p>

<div class="mt-6"><FiltroProyectos lang={lang} activo={activo} /></div>

<div data-testid="lista-proyectos" data-activo={activo}
  class="mt-8 grid gap-4 sm:grid-cols-2">
  {todos.map((item) => (
    <div data-item-tipo={item.tipo}>
      <ProyectoCard lang={lang} slug={item.slug} tipo={item.tipo} datos={item.datos} nivelTitulo={2} />
    </div>
  ))}
</div>

<style>
  /* El filtrado es CSS puro a partir de `data-activo`: sin JavaScript, cada
     ruta ya sirve el estado correcto porque el atributo viene del servidor. */
  [data-activo='qa'] [data-item-tipo='dev'],
  [data-activo='dev'] [data-item-tipo='qa'] {
    display: none;
  }
</style>

<script>
  // Progresivo: los enlaces del filtro ya funcionan sin esto. El script solo
  // evita la recarga cambiando el atributo y actualizando la URL.
  function activarFiltro() {
    const lista = document.querySelector<HTMLElement>('[data-testid="lista-proyectos"]');
    const grupo = document.querySelector<HTMLElement>('[data-testid="filtro-proyectos"]');
    if (!lista || !grupo) return;

    grupo.addEventListener('click', (evento) => {
      const enlace = (evento.target as HTMLElement).closest<HTMLAnchorElement>('a[data-filtro]');
      if (!enlace) return;
      evento.preventDefault();
      const valor = enlace.dataset.filtro;
      if (!valor) return;

      lista.dataset.activo = valor;
      for (const a of grupo.querySelectorAll<HTMLAnchorElement>('a[data-filtro]')) {
        if (a === enlace) {
          a.setAttribute('aria-current', 'true');
          a.classList.add('bg-bg', 'text-text');
          a.classList.remove('text-muted', 'hover:text-text');
        } else {
          a.removeAttribute('aria-current');
          a.classList.remove('bg-bg', 'text-text');
          a.classList.add('text-muted', 'hover:text-text');
        }
      }
      history.pushState({}, '', enlace.href);
    });
  }

  activarFiltro();
  // Las view transitions no recargan la página: sin esto, el filtro deja de
  // responder después de la primera navegación con el ClientRouter.
  document.addEventListener('astro:after-swap', activarFiltro);
</script>
```

- [ ] **Paso 5: crear las seis páginas**

`src/pages/es/proyectos/index.astro`:

```astro
---
import BaseLayout from '../../../layouts/BaseLayout.astro';
import ProyectoListadoFiltrable from '../../../components/ProyectoListadoFiltrable.astro';

const lang = 'es' as const;
---
<BaseLayout lang={lang} title="Proyectos · Juan Manuel Malugani"
  description="Casos de QA y proyectos de desarrollo, documentados de punta a punta.">
  <ProyectoListadoFiltrable lang={lang} activo="qa" />
</BaseLayout>
```

`src/pages/es/proyectos/dev.astro` y `todos.astro`: idénticos, cambiando `activo="dev"` y `activo="todos"`.

`src/pages/en/projects/index.astro`, `dev.astro`, `all.astro`: los espejos con `lang = 'en'`, título `"Projects · Juan Manuel Malugani"` y descripción `"QA cases and development projects, documented end to end."`.

- [ ] **Paso 6: borrar los listados viejos**

```bash
git rm src/pages/es/qa/index.astro src/pages/es/dev/index.astro
git rm src/pages/en/qa/index.astro src/pages/en/dev/index.astro
git rm src/components/QaListado.astro src/components/ProyectoListado.astro
```

- [ ] **Paso 7: montar los redirects**

En `astro.config.mjs`, dentro de `defineConfig`:

```js
  redirects: {
    '/es/qa': '/es/proyectos',
    '/es/dev': '/es/proyectos/dev',
    '/en/qa': '/en/projects',
    '/en/dev': '/en/projects/dev',
  },
```

En `vercel.json`, agregar:

```json
  "redirects": [
    { "source": "/es/qa", "destination": "/es/proyectos", "permanent": true },
    { "source": "/es/dev", "destination": "/es/proyectos/dev", "permanent": true },
    { "source": "/en/qa", "destination": "/en/projects", "permanent": true },
    { "source": "/en/dev", "destination": "/en/projects/dev", "permanent": true }
  ]
```

**Los dos, no uno.** El de Astro genera una página con `meta refresh`, que funciona en `npm run preview` y por lo tanto es testeable localmente. El de Vercel lo convierte en un 301 real en producción y se aplica antes de servir el archivo. Sin el de Astro no se puede testear; sin el de Vercel no es un redirect de verdad.

- [ ] **Paso 8: verificar**

```bash
npm run check
npm run build
```
Esperado: 0 errores; el build ahora genera más páginas que antes (las tres de proyectos por idioma, más las de redirect). Confirmar que existan `dist/es/proyectos/index.html`, `dist/es/proyectos/dev/index.html` y `dist/es/proyectos/todos/index.html`.

Verificar el filtro sin JavaScript: abrir `dist/es/proyectos/dev/index.html` y confirmar que el `div` de la lista tiene `data-activo="dev"`.

**Tests E2E rojos a propósito hasta la Tarea 10:** todo `casos.spec.ts` y `dev.spec.ts` (las rutas de listado ya no existen), y la captura de `/es/qa` en `visual.spec.ts`.

- [ ] **Paso 9: commit**

```bash
git add -A src/pages src/components src/i18n astro.config.mjs vercel.json
git commit -m "feat: listado unificado de proyectos con filtro en rutas reales"
```

---

### Tarea 5: Hero con contacto abreviado

**Archivos:**
- Crear: `src/components/ContactoInline.astro`
- Modificar: `src/components/Hero.astro`
- Modificar: `src/i18n/ui.ts`

- [ ] **Paso 1: agregar claves**

```ts
// ClaveUI
  | 'contacto.enlaces'

// es
  'contacto.enlaces': 'Enlaces de contacto',
// en
  'contacto.enlaces': 'Contact links',
```

- [ ] **Paso 2: crear el componente**

Crear `src/components/ContactoInline.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

/**
 * Contacto abreviado para el hero. La sección completa sigue al cierre de la
 * home y en `/contacto`: son los dos momentos en que alguien quiere
 * contactarte, apenas llega y cuando terminó de leer.
 *
 * El email es un `mailto:` y no el botón de copiar del island: acá alcanza con
 * el atajo, y sumar un tercer punto de montaje de React por esto no se
 * justifica.
 */
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
const email = 'maluganijuanmanuel@gmail.com';

const enlaces = [
  { testid: 'hero-github', href: 'https://github.com/Malu-gani', texto: 'GitHub', externo: true },
  { testid: 'hero-linkedin', href: 'https://www.linkedin.com/in/maluganijuanmanuel', texto: 'LinkedIn', externo: true },
  { testid: 'hero-email', href: `mailto:${email}`, texto: 'Email', externo: false },
];
---
<ul data-testid="contacto-inline" aria-label={t('contacto.enlaces')} class="mt-6 flex flex-wrap gap-3">
  {enlaces.map((e) => (
    <li>
      <a href={e.href} data-testid={e.testid}
        target={e.externo ? '_blank' : undefined}
        rel={e.externo ? 'noopener noreferrer' : undefined}
        class="inline-block rounded-md border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-accent">
        {e.texto}
      </a>
    </li>
  ))}
</ul>
```

- [ ] **Paso 3: montarlo en el hero**

En `src/components/Hero.astro`, agregar el import y el uso, y sumar `id`/`scroll-mt` a la sección:

```astro
---
import ContactoInline from './ContactoInline.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';
interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<section data-testid="hero" id="inicio" class="scroll-mt-24 py-10">
  <p data-testid="badge-disponible"
    class="inline-flex items-center gap-2 rounded-full border border-est-paso px-3 py-1 text-sm text-est-paso">
    <span aria-hidden="true">●</span> {t('home.disponible')}
  </p>
  <h1 class="mt-4 text-4xl font-bold sm:text-5xl">Juan Manuel Malugani</h1>
  <p class="mt-2 font-mono text-accent">{t('home.rol')}</p>
  <p class="mt-4 max-w-prose text-lg text-muted">{t('home.posicionamiento')}</p>
  <ContactoInline lang={lang} />
</section>
```

- [ ] **Paso 4: verificar**

```bash
npm run check
npm run build
```
Esperado: 0 errores. En `dist/es/index.html`, confirmar los tres enlaces y que los dos externos llevan `rel="noopener noreferrer"` — `enlaces.spec.ts` lo verifica en toda ruta.

- [ ] **Paso 5: commit**

```bash
git add src/components/ContactoInline.astro src/components/Hero.astro src/i18n/ui.ts
git commit -m "feat: contacto abreviado en el hero"
```

---

### Tarea 6: Resumen de Sobre mí en la home

**Archivos:**
- Crear: `src/components/SobreMiResumen.astro`
- Modificar: `src/i18n/ui.ts`

- [ ] **Paso 1: agregar claves**

```ts
// ClaveUI
  | 'sobre.titulo'
  | 'sobre.resumen'
  | 'sobre.ver'

// es
  'sobre.titulo': 'Sobre mí',
  'sobre.resumen': 'Vengo del testing manual y me moví a la automatización. Aprendo construyendo: cada proyecto que hago termina documentado, con lo que salió bien y lo que no.',
  'sobre.ver': 'Leer el recorrido completo',

// en
  'sobre.titulo': 'About me',
  'sobre.resumen': 'I come from manual testing and moved into automation. I learn by building: every project I take on ends up documented, including what worked and what did not.',
  'sobre.ver': 'Read the full story',
```

**Antes de escribirlas, leer `src/components/AboutContent.astro`** y ajustar el resumen para que no contradiga el recorrido ya publicado. Si el texto de arriba no coincide con lo que dice esa página, gana la página.

- [ ] **Paso 2: crear el componente**

Crear `src/components/SobreMiResumen.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import { rutas } from '../i18n/routes';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
---
<section data-testid="bloque-sobre" id="sobre-mi" class="scroll-mt-24 border-t border-border py-10">
  <h2 class="text-2xl font-semibold">{t('sobre.titulo')}</h2>
  <p class="mt-3 max-w-prose text-muted">{t('sobre.resumen')}</p>
  <a href={rutas.about[lang]} data-testid="link-sobre-completo"
    class="mt-4 inline-block text-accent hover:underline">{t('sobre.ver')} →</a>
</section>
```

- [ ] **Paso 3: verificar**

```bash
npm run check
```
Esperado: 0 errores. El componente todavía no se monta en ningún lado — lo hace la Tarea 7.

- [ ] **Paso 4: commit**

```bash
git add src/components/SobreMiResumen.astro src/i18n/ui.ts
git commit -m "feat: componente de resumen de Sobre mi para la home"
```

---

### Tarea 7: Home con secciones ancladas y dev con cards

**Archivos:**
- Modificar: `src/components/HomeContent.astro` (reescritura completa)
- Modificar: `src/i18n/ui.ts`

**Consume:** `ProyectoCard` con `tipo` (T3), `SobreMiResumen` (T6), `ContactoInline` en el hero (T5), `StackGrid` con `id="stack"` (T2).

- [ ] **Paso 1: agregar claves**

```ts
// ClaveUI
  | 'home.qa.ver'
  | 'home.dev.ver'

// es
  'home.qa.ver': 'Ver todos los casos de QA',
  'home.dev.ver': 'Ver todos los proyectos de desarrollo',
// en
  'home.qa.ver': 'See all QA cases',
  'home.dev.ver': 'See all development projects',
```

- [ ] **Paso 2: reescribir la home**

Reemplazar todo el contenido de `src/components/HomeContent.astro`:

```astro
---
import { getCollection } from 'astro:content';
import Hero from './Hero.astro';
import SobreMiResumen from './SobreMiResumen.astro';
import StackGrid from './StackGrid.astro';
import ProyectoCard from './ProyectoCard.astro';
import ContactContent from './ContactContent.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);
const prefijo = `${lang}/`;
const base = lang === 'es' ? '/es/proyectos' : '/en/projects';

const casos = (await getCollection('casos-qa'))
  .filter((c) => c.id.startsWith(prefijo) && c.data.destacado)
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());

const proyectos = (await getCollection('proyectos'))
  .filter((p) => p.id.startsWith(prefijo) && p.data.destacado)
  .sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
---
<Hero lang={lang} />

<SobreMiResumen lang={lang} />

<section data-testid="bloque-qa" id="qa" class="scroll-mt-24 border-t border-border py-10">
  <h2 class="text-2xl font-semibold">{t('home.qa.titulo')}</h2>
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    {casos.map((c) => (
      <ProyectoCard lang={lang} slug={c.id.replace(prefijo, '')} tipo="qa"
        datos={c.data} nivelTitulo={3} />
    ))}
  </div>
  <a href={base} data-testid="ver-todos-qa"
    class="mt-6 inline-block text-accent hover:underline">{t('home.qa.ver')} →</a>
</section>

<!--
  Dev usa el mismo tamaño de encabezado y el mismo tipo de card que QA. La
  asimetría entre carriles la sostiene el orden de las secciones y el rol
  declarado en el hero, no achicar el bloque secundario.
-->
<section data-testid="bloque-dev" id="dev" class="scroll-mt-24 border-t border-border py-10">
  <h2 class="text-2xl font-semibold">{t('home.dev.titulo')}</h2>
  <p class="mt-2 max-w-prose text-muted">{t('home.dev.bajada')}</p>
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    {proyectos.map((p) => (
      <ProyectoCard lang={lang} slug={p.id.replace(prefijo, '')} tipo="dev"
        datos={p.data} nivelTitulo={3} />
    ))}
  </div>
  <a href={`${base}/dev`} data-testid="ver-todos-dev"
    class="mt-6 inline-block text-accent hover:underline">{t('home.dev.ver')} →</a>
</section>

<StackGrid lang={lang} />

<section data-testid="bloque-contacto" id="contacto" class="scroll-mt-24 border-t border-border py-10">
  <ContactContent lang={lang} nivelTitulo={2} />
</section>
```

- [ ] **Paso 3: hacer que ContactContent acepte el nivel de título**

`ContactContent.astro` usa `<h1>` porque hoy solo vive en `/contacto`. En la home tiene que ser `<h2>`: dos `h1` en una página rompen `home.spec.ts` ("hay un único h1") y el orden de headings de `a11y.spec.ts`.

En `src/components/ContactContent.astro`, cambiar la interfaz y el título:

```astro
interface Props { lang: Lang; nivelTitulo?: 1 | 2 }
const { lang, nivelTitulo = 1 } = Astro.props;
const TituloTag = nivelTitulo === 1 ? 'h1' : 'h2';
```
```astro
  <TituloTag class:list={[nivelTitulo === 1 ? 'text-3xl sm:text-4xl' : 'text-2xl', 'font-bold']}>{c.titulo}</TituloTag>
```

El `data-testid="contacto"` del wrapper se mantiene: `contacto.spec.ts` lo usa.

- [ ] **Paso 4: verificar**

```bash
npm run check
npm run test:unit
npm run build
```
Esperado: 0 errores. Abrir `dist/es/index.html` y confirmar: un solo `<h1>`, las seis secciones con sus `id`, y que el bloque dev muestra cards.

Si `check` se queja de que `destacado` no existe en algún proyecto dev, confirmar que al menos uno tenga `destacado: true` en `src/content/proyectos/{es,en}/`; si ninguno lo tiene, la sección dev queda vacía.

- [ ] **Paso 5: commit**

```bash
git add src/components/HomeContent.astro src/components/ContactContent.astro src/i18n/ui.ts
git commit -m "feat: home en secciones ancladas, con cards en el carril de desarrollo"
```

---

### Tarea 8: Navbar contextual con scroll-spy

**Archivos:**
- Modificar: `src/components/Header.astro` (reescritura completa)
- Modificar: `src/i18n/ui.ts`

- [ ] **Paso 1: agregar claves**

```ts
// ClaveUI
  | 'nav.stack'

// es
  'nav.stack': 'Stack',
// en
  'nav.stack': 'Stack',
```

- [ ] **Paso 2: reescribir el header**

Reemplazar `src/components/Header.astro`:

```astro
---
import ThemeToggle from './ThemeToggle.tsx';
import LangToggle from './LangToggle.astro';
import { getLangFromUrl, useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

const lang: Lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

// El navbar es contextual: en la home los items son anclas y el scroll-spy
// marca la sección visible; en cualquier otra página son enlaces a la home
// posicionada en esa sección.
const home = `/${lang}/`;
const enHome = Astro.url.pathname === home || Astro.url.pathname === `/${lang}`;

const secciones = [
  { id: 'inicio', testid: 'nav-inicio', texto: t('nav.inicio') },
  { id: 'sobre-mi', testid: 'nav-sobre', texto: t('nav.sobre') },
  { id: 'qa', testid: 'nav-qa', texto: t('nav.qa') },
  { id: 'dev', testid: 'nav-dev', texto: t('nav.dev') },
  { id: 'stack', testid: 'nav-stack', texto: t('nav.stack') },
  { id: 'contacto', testid: 'nav-contacto', texto: t('nav.contacto') },
];
---
<header class="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur">
  <nav data-testid="nav-principal" aria-label={t('nav.principal')}
    class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
    <ul data-testid="nav-secciones" class="hidden flex-wrap gap-4 sm:flex">
      {secciones.map((s) => (
        <li>
          <a href={enHome ? `#${s.id}` : `${home}#${s.id}`}
            data-testid={s.testid} data-seccion={s.id}
            class="text-muted transition-colors hover:text-accent focus-visible:text-accent aria-[current=true]:text-accent">
            {s.texto}
          </a>
        </li>
      ))}
    </ul>
    <div class="flex gap-2">
      <LangToggle />
      <ThemeToggle
        etiqueta={t('tema.cambiar')}
        etiquetaClaro={t('tema.claro')}
        etiquetaOscuro={t('tema.oscuro')}
        client:load
      />
    </div>
  </nav>
</header>

<script>
  // Scroll-spy en vanilla: marcar el enlace de la sección visible. No se hace
  // con un island de React porque el proyecto sostiene que React se usa en
  // exactamente dos, y pagar hidratación para resaltar un enlace no lo
  // justifica.
  function activarScrollSpy() {
    const enlaces = document.querySelectorAll<HTMLAnchorElement>('a[data-seccion]');
    if (enlaces.length === 0) return;

    const porId = new Map<string, HTMLAnchorElement>();
    for (const a of enlaces) {
      if (a.dataset.seccion) porId.set(a.dataset.seccion, a);
    }

    const secciones = [...porId.keys()]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    // Fuera de la home no hay secciones que observar y los enlaces apuntan a
    // otra página: no hay nada que marcar.
    if (secciones.length === 0) return;

    const observer = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue;
          for (const a of porId.values()) a.removeAttribute('aria-current');
          porId.get(entrada.target.id)?.setAttribute('aria-current', 'true');
        }
      },
      // El margen superior descuenta el header sticky; el inferior hace que la
      // sección se considere activa recién cuando ocupa la parte de arriba del
      // viewport, y no apenas asoma desde abajo.
      { rootMargin: '-20% 0px -70% 0px' }
    );

    for (const s of secciones) observer.observe(s);
  }

  activarScrollSpy();
  // Las view transitions no recargan la página: sin esto, el scroll-spy deja
  // de funcionar tras la primera navegación con el ClientRouter. Es el mismo
  // problema que ya resuelve el script de tema en BaseLayout.astro.
  document.addEventListener('astro:after-swap', activarScrollSpy);
</script>
```

- [ ] **Paso 3: agregar el desplazamiento suave**

En `src/styles/global.css`, en la regla de `html` existente, agregar `scroll-behavior: smooth`:

```css
html { color-scheme: light dark; overflow-y: scroll; scroll-behavior: smooth; }
```

No hace falta tocar nada más: el bloque `@media (prefers-reduced-motion: reduce)` que ya existe fuerza `scroll-behavior: auto !important`.

- [ ] **Paso 4: verificar**

```bash
npm run check
npm run build
```
Esperado: 0 errores. Abrir `dist/es/index.html` y confirmar `href="#qa"`; abrir `dist/es/contacto/index.html` y confirmar `href="/es/#qa"`.

**Ojo:** el menú queda oculto por debajo de `sm` (`hidden ... sm:flex`) hasta que la Tarea 9 monte el menú mobile. En un teléfono, entre esta tarea y la siguiente no hay navegación.

- [ ] **Paso 5: commit**

```bash
git add src/components/Header.astro src/i18n/ui.ts src/styles/global.css
git commit -m "feat: navbar sticky contextual con scroll-spy"
```

---

### Tarea 9: Menú desplegable en mobile

Seis items más los dos toggles no entran en el ancho de un teléfono.

**Archivos:**
- Crear: `src/components/NavMobile.astro`
- Modificar: `src/components/Header.astro`
- Modificar: `src/i18n/ui.ts`

- [ ] **Paso 1: agregar claves**

```ts
// ClaveUI
  | 'nav.abrir'

// es
  'nav.abrir': 'Abrir menú',
// en
  'nav.abrir': 'Open menu',
```

- [ ] **Paso 2: crear el componente**

Crear `src/components/NavMobile.astro`:

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

/**
 * Menú para pantallas chicas. Usa `<details>`/`<summary>` en vez de un botón
 * con JavaScript: abre y cierra sin scripts, es accesible por teclado de
 * fábrica y no puede quedar desincronizado con su estado.
 */
interface Props {
  lang: Lang;
  enHome: boolean;
  secciones: { id: string; testid: string; texto: string }[];
}
const { lang, enHome, secciones } = Astro.props;
const t = useTranslations(lang);
const home = `/${lang}/`;
---
<details data-testid="nav-mobile" class="relative sm:hidden">
  <summary aria-label={t('nav.abrir')}
    class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-text marker:content-['']">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" class="h-5 w-5" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </summary>
  <ul class="absolute left-0 top-11 z-50 w-48 rounded-lg border border-border bg-surface p-2 shadow-lg">
    {secciones.map((s) => (
      <li>
        <a href={enHome ? `#${s.id}` : `${home}#${s.id}`}
          data-testid={`m-${s.testid}`}
          class="block rounded-md px-3 py-2 text-sm text-text hover:bg-bg">{s.texto}</a>
      </li>
    ))}
  </ul>
</details>
```

**Los `data-testid` llevan prefijo `m-`** para no duplicar los del menú de escritorio: dos elementos con el mismo testid hacen que `getByTestId` sea ambiguo y Playwright falle con strict mode violation.

- [ ] **Paso 3: montarlo en el header**

En `src/components/Header.astro`, importar `NavMobile` y ponerlo como primer hijo del `<nav>`, antes del `<ul>` de escritorio:

```astro
import NavMobile from './NavMobile.astro';
```
```astro
    <NavMobile lang={lang} enHome={enHome} secciones={secciones} />
```

- [ ] **Paso 4: cerrar el menú al elegir una sección**

Dentro del `<script>` de `Header.astro`, al final de `activarScrollSpy()`, agregar:

```ts
    // Sin esto, al tocar una sección el panel queda abierto tapando el
    // contenido al que acaba de saltar.
    const menu = document.querySelector<HTMLDetailsElement>('[data-testid="nav-mobile"]');
    menu?.addEventListener('click', (evento) => {
      if ((evento.target as HTMLElement).closest('a')) menu.open = false;
    });
```

- [ ] **Paso 5: verificar**

```bash
npm run check
npm run build
```
Esperado: 0 errores. En `dist/es/index.html`, confirmar que existen el `<details data-testid="nav-mobile">` y el `<ul data-testid="nav-secciones">`, y que sus enlaces no comparten testid.

- [ ] **Paso 6: commit**

```bash
git add src/components/NavMobile.astro src/components/Header.astro src/i18n/ui.ts
git commit -m "feat: menu desplegable para pantallas chicas"
```

---

### Tarea 10: Saldar la deuda de la suite

Esta tarea es la única que toca `tests/`. Es larga; conviene hacerla con contexto fresco y sola.

**Archivos:**
- Crear: `tests/e2e/proyectos.spec.ts`, `tests/e2e/pages/ProyectosPage.ts`
- Borrar: `tests/e2e/casos.spec.ts`, `tests/e2e/dev.spec.ts`, `tests/e2e/pages/QaPage.ts`
- Modificar: `tests/e2e/home.spec.ts`, `tests/e2e/navegacion.spec.ts`, `tests/e2e/pages/BasePage.ts`, `tests/e2e/pages/HomePage.ts`, `tests/unit/contenido.test.ts`
- Regenerar: las 8 capturas de `tests/e2e/visual.spec.ts-snapshots/`

- [ ] **Paso 1: decidir el umbral de la regresión visual**

`visual.spec.ts` usa `maxDiffPixelRatio: 0.01`, que absorbe cambios de hasta unos 5.700 píxeles sin marcar diferencia. Un tramo entero de rediseño es exactamente donde eso deja de avisar.

**Antes de regenerar nada**, correr la comparación con el umbral en cero para ver la magnitud real del cambio:

```bash
npx playwright test --project=chromium visual.spec.ts --reporter=list
```

Decidir con ese dato si baja el umbral. Es decisión del usuario: preguntar antes de cambiarlo.

- [ ] **Paso 2: crear el Page Object**

Crear `tests/e2e/pages/ProyectosPage.ts`. Los selectores CSS viven acá, nunca
en el spec:

```ts
import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProyectosPage extends BasePage {
  readonly lista: Locator;
  readonly filtro: Locator;

  constructor(page: Page) {
    super(page);
    this.lista = page.getByTestId('lista-proyectos');
    this.filtro = page.getByTestId('filtro-proyectos');
  }

  /** Cards efectivamente visibles, ya filtradas por el CSS. */
  cardsVisibles(): Locator {
    return this.lista.locator('[data-item-tipo]:visible');
  }

  cardsDeTipo(tipo: 'qa' | 'dev'): Locator {
    return this.lista.locator(`[data-item-tipo="${tipo}"]:visible`);
  }

  botonFiltro(clave: 'qa' | 'dev' | 'todos'): Locator {
    return this.page.getByTestId(`filtro-${clave}`);
  }

  async filtroActivo(): Promise<string | null> {
    return this.lista.getAttribute('data-activo');
  }
}
```

- [ ] **Paso 3: escribir `proyectos.spec.ts`**

Borrar `tests/e2e/casos.spec.ts`, `tests/e2e/dev.spec.ts` y
`tests/e2e/pages/QaPage.ts`, y crear `tests/e2e/proyectos.spec.ts`. Los tests
de contenido de ejemplo y de las cuatro ramas de repo/demo se **conservan**
desde los specs viejos, adaptando las rutas.

Los tests nuevos, que son los que no existían:

```ts
import { test, expect } from '@playwright/test';
import { ProyectosPage } from './pages/ProyectosPage';

test.describe('Filtro de proyectos', () => {
  test('la ruta por defecto muestra solo QA', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');
    expect(await p.filtroActivo()).toBe('qa');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev')).toHaveCount(0);
  });

  test('la ruta de desarrollo muestra solo dev', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos/dev');
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
  });

  test('la ruta de todos muestra ambos carriles', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos/todos');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  });

  test('clickear un filtro cambia la lista y la URL sin recargar', async ({ page }) => {
    const p = new ProyectosPage(page);
    await page.goto('/es/proyectos');
    // Marca en el objeto window: si la página recarga, se pierde.
    await page.evaluate(() => { (window as unknown as Record<string, boolean>).__sinRecarga = true; });

    await p.botonFiltro('dev').click();

    await expect(page).toHaveURL(/\/es\/proyectos\/dev$/);
    expect(await p.filtroActivo()).toBe('dev');
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
    const sinRecarga = await page.evaluate(
      () => (window as unknown as Record<string, boolean>).__sinRecarga === true
    );
    expect(sinRecarga, 'la página recargó: el script no interceptó el click').toBe(true);
  });
});

test.describe('El filtro funciona sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('cada ruta sirve su propio estado desde el servidor', async ({ page }) => {
    const p = new ProyectosPage(page);

    await page.goto('/es/proyectos');
    await expect(p.cardsDeTipo('dev')).toHaveCount(0);
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();

    await page.goto('/es/proyectos/dev');
    await expect(p.cardsDeTipo('qa')).toHaveCount(0);
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();

    await page.goto('/es/proyectos/todos');
    await expect(p.cardsDeTipo('qa').first()).toBeVisible();
    await expect(p.cardsDeTipo('dev').first()).toBeVisible();
  });
});

test.describe('Las rutas viejas siguen respondiendo', () => {
  for (const [vieja, destino] of [
    ['/es/qa', '/es/proyectos'],
    ['/es/dev', '/es/proyectos/dev'],
    ['/en/qa', '/en/projects'],
    ['/en/dev', '/en/projects/dev'],
  ] as const) {
    test(`${vieja} lleva a ${destino}`, async ({ page }) => {
      await page.goto(vieja);
      await expect(page).toHaveURL(new RegExp(`${destino.replace(/\//g, '\\/')}$`));
    });
  }
});
```

**Falsabilidad:** el test de "sin recarga" es el único que puede pasar
trivialmente si el selector del botón está roto —no clickearía nada y la URL no
cambiaría, pero `toHaveURL` lo atraparía—. Verificarlo rompiendo a propósito el
`preventDefault` del script y confirmando que falla.

- [ ] **Paso 4: cobertura del scroll-spy y del menú mobile**

Agregar a `tests/e2e/navegacion.spec.ts`:

```ts
test.describe('Scroll-spy del navbar', () => {
  test('la sección visible queda marcada en el menú', async ({ page }) => {
    await page.goto('/es/');
    await page.locator('#qa').scrollIntoViewIfNeeded();
    await expect(page.getByTestId('nav-qa')).toHaveAttribute('aria-current', 'true', { timeout: 5000 });
    await expect(page.getByTestId('nav-inicio')).not.toHaveAttribute('aria-current', 'true');
  });

  test('fuera de la home el menú apunta a la home con ancla', async ({ page }) => {
    await page.goto('/es/contacto');
    await expect(page.getByTestId('nav-qa')).toHaveAttribute('href', '/es/#qa');
  });
});

test.describe('Menú en pantallas chicas', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('el menú de escritorio se oculta y el desplegable navega', async ({ page }) => {
    await page.goto('/es/');
    await expect(page.getByTestId('nav-secciones')).toBeHidden();

    const menu = page.getByTestId('nav-mobile');
    await menu.locator('summary').click();
    await expect(page.getByTestId('m-nav-qa')).toBeVisible();

    await page.getByTestId('m-nav-qa').click();
    // El panel se cierra solo: si quedara abierto, taparía la sección.
    await expect(page.getByTestId('m-nav-qa')).toBeHidden();
  });
});
```

- [ ] **Paso 5: actualizar el resto**

- `home.spec.ts`: el bloque dev ahora tiene cards. Reemplazar la aserción del párrafo por `expect(page.getByTestId('bloque-dev').getByTestId('proyecto-card').first()).toBeVisible()`, y sumar que existan las seis secciones (`#inicio`, `#sobre-mi`, `#qa`, `#dev`, `#stack`, `#contacto`). El test de "un único h1" se conserva tal cual y ahora cubre el riesgo real de que `ContactContent` traiga un segundo `h1`.
- `BasePage.ts` / `HomePage.ts`: sumar locators del menú mobile y de las secciones.
- `contenido.test.ts`: validar que toda `metricas` declarada tenga `etiqueta` y `valor` no vacíos.

- [ ] **Paso 4: correr la batería completa**

```bash
npm run check
npm run check:listo
npm run test:unit
npx playwright test --workers=1
```
Esperado: todo verde. Los 28 saltados esperados son los visuales en firefox/webkit/mobile y los de portapapeles.

- [ ] **Paso 5: regenerar las capturas, una por una y con motivo**

Solo después de que todo lo demás esté verde. **Nunca `--update-snapshots` global**: regenerar únicamente las que se puedan explicar, y escribir la razón en el commit.

- [ ] **Paso 6: commit**

```bash
git add -A tests/
git commit -m "test: la suite se actualiza al rediseño de la home"
```

---

## Verificación final

- [ ] `npm run check` — 0 errores
- [ ] `npm run check:listo` — contenido real
- [ ] `npm run test:unit` — verde
- [ ] `npx playwright test --workers=1` — verde en los 4 proyectos
- [ ] `git status` — limpio, sin `.png` inesperados
- [ ] `/es/qa` y `/es/dev` responden y llevan a `/es/proyectos`
- [ ] Las páginas de detalle conservan sus URLs
- [ ] El filtro funciona con JavaScript deshabilitado
