# QA Board & Backlog Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar a la home una sección "QA Board & Backlog Live" que muestra KPIs y actividad reciente del propio gestor de tareas/bugs del portfolio en Notion, con acceso directo al board público real.

**Architecture:** Capa de datos separada en fetch crudo (`notion-client.ts`, no testeado) y transformación pura (`qa-board.ts`, testeada con fixtures). Componente Astro puro sin hidratación (`QABoard.astro` + `QABoardFiltro.astro`, calco del patrón ya usado por Stack) que llama a la capa de datos en frontmatter — todo resuelto en build time, cero JS de framework. El filtro Todos/Bugs/US es vanilla JS + CSS, mismo patrón que `StackGrid.astro`.

**Tech Stack:** Astro (componentes `.astro`, sin islas de React), TypeScript, Vitest (unit), Playwright (e2e), `fetch()` crudo contra la API REST de Notion (sin SDK).

## Global Constraints

- **Sin paginación de la API de Notion.** Se consulta con `page_size: 100` una sola vez por base — no agregar paginación (YAGNI, ver spec).
- **Si el build no puede consultar Notion, el build entero falla.** No envolver el fetch en `try/catch` que trague el error.
- **Todo se filtra por el proyecto "Portfolio QA ENGINEER / DEV"** (id `3b1f143f-ef25-80c9-8049-fbbed8847af8`) en la capa de transformación pura, no en el filtro de la consulta a Notion.
- **Los títulos de los tickets se muestran tal cual vienen de Notion, en español, en ambas versiones del sitio (ES/EN)** — no se traducen. Solo la interfaz (KPIs, filtro, botones, encabezado) usa claves i18n.
- **Sin SDK de Notion** (`@notionhq/client`) — dos `POST` con `fetch()` crudo.
- **Nombres reales de propiedad en Notion, no los que asume el ticket:** la relación a Proyecto es `PROYECTO` en Bug Reports y `PROYTECTO` (con la falta de ortografía real del schema) en Tareas. Bug Reports no tiene campo `Fecha` — el feed ordena por `last_edited_time` en ambas bases.
- **Dos botones CTA**, uno por base de Notion (Bug Reports y Tareas), no uno solo.
- **`NOTION_TOKEN` tiene que estar en `.env.local`** para que `npm run dev` / `npm run build` funcionen localmente (ya seteado por el usuario antes de ejecutar este plan) y en las variables de entorno de Vercel antes del primer deploy de esta feature (pendiente, fuera de este plan — es infraestructura, no código).

---

## Mapa de archivos

```
Crear:
  src/data/qa-board-links.ts       — IDs y URLs públicas de Notion (no secretos)
  src/lib/notion-client.ts         — fetch crudo a la API de Notion, sin lógica de negocio
  src/lib/qa-board.ts              — filtro por proyecto + KPIs + feed, funciones puras
  tests/unit/qa-board.test.ts      — fixtures de NotionPage[] para las funciones puras
  tests/unit/qa-board-copy.test.ts — todas las claves qaBoard.* existen y no están vacías en ES/EN
  src/components/QABoardFiltro.astro — 3 botones Todos/Bugs/US, calco de StackFiltro.astro
  src/components/QABoard.astro     — sección completa
  tests/e2e/qa-board.spec.ts       — KPIs, feed, filtro, CTAs, ancla de sección

Modificar:
  src/i18n/ui.ts                   — sumar claves qaBoard.* a ClaveUI + diccionarios es/en
  src/components/HomeContent.astro — insertar <QABoard lang={lang} /> entre Proyectos y Stack
  tests/e2e/pages/HomePage.ts      — sumar 'qa-board' a SECCIONES + locators del board
  tests/e2e/home.spec.ts           — sumar 'qa-board' a la lista de ids sin border-t
  tests/e2e/visual.spec.ts-snapshots/* — regenerar (la home cambia de alto)
```

---

### Task 1: Capa de fetch crudo a Notion

**Files:**
- Create: `src/data/qa-board-links.ts`
- Create: `src/lib/notion-client.ts`

**Interfaces:**
- Consumes: nada (primera pieza de la cadena).
- Produces:
  - `NOTION_PROYECTO_PORTFOLIO_ID: string`, `NOTION_DB_TAREAS_ID: string`, `NOTION_DB_BUGS_ID: string`, `qaBoardLinks: { bugs: string; tareas: string }` desde `qa-board-links.ts`.
  - `interface NotionPage { properties: Record<string, any>; last_edited_time: string }` y `queryNotionDatabase(databaseId: string): Promise<NotionPage[]>` desde `notion-client.ts` — Task 2 los importa.

- [ ] **Step 1: Crear `src/data/qa-board-links.ts`**

```ts
export const NOTION_PROYECTO_PORTFOLIO_ID = '3b1f143f-ef25-80c9-8049-fbbed8847af8';
export const NOTION_DB_TAREAS_ID = '3b1f143f-ef25-80b5-bb80-ee66c08e8fb3';
export const NOTION_DB_BUGS_ID = '3b1f143f-ef25-80ad-b528-df5d74fa68ed';

export const qaBoardLinks = {
  bugs: 'https://rain-scent-049.notion.site/3b1f143fef2580adb528df5d74fa68ed?v=3b3f143fef25800b917c000cca91f95c',
  tareas: 'https://rain-scent-049.notion.site/USER-STORYS-3b2f143fef258044965de52a369ccfc5',
} as const;
```

- [ ] **Step 2: Crear `src/lib/notion-client.ts`**

```ts
const NOTION_VERSION = '2022-06-28';

export interface NotionPage {
  properties: Record<string, any>;
  last_edited_time: string;
}

export async function queryNotionDatabase(databaseId: string): Promise<NotionPage[]> {
  const token = import.meta.env.NOTION_TOKEN;
  if (!token) throw new Error(`Falta NOTION_TOKEN en el entorno de build`);

  const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page_size: 100 }),
  });
  if (!res.ok) {
    throw new Error(`Notion API (${databaseId}) respondió ${res.status}`);
  }
  const data = await res.json();
  return data.results as NotionPage[];
}
```

Sin `filter` en el body: trae todas las filas de la base y deja que `qa-board.ts` (Task 2) decida qué es de Portfolio. Este archivo no se testea unitariamente — es I/O puro, se verifica con el build real (Task 4 en adelante).

- [ ] **Step 3: Verificar que compila**

Run: `npm run check`
Expected: `0 errors` (puede haber warnings preexistentes; no deben sumarse nuevos).

- [ ] **Step 4: Commit**

```bash
git add src/data/qa-board-links.ts src/lib/notion-client.ts
git commit -m "feat: capa de fetch crudo a la API de Notion para QA Board"
```

---

### Task 2: Capa de transformación pura (KPIs + feed)

**Files:**
- Create: `src/lib/qa-board.ts`
- Test: `tests/unit/qa-board.test.ts`

**Interfaces:**
- Consumes: `NotionPage`, `queryNotionDatabase` de `../lib/notion-client` (Task 1); `NOTION_DB_BUGS_ID`, `NOTION_DB_TAREAS_ID`, `NOTION_PROYECTO_PORTFOLIO_ID` de `../data/qa-board-links` (Task 1).
- Produces:
  - `type TipoItem = 'bug' | 'us'`
  - `type EstadoQaBoard = 'Reportado' | 'En Progreso' | 'Resuelto'`
  - `interface QaBoardKpis { bugsReportados: number; bugsResueltosPct: number; usResueltas: number; enProgreso: number }`
  - `interface QaBoardFeedItem { tipo: TipoItem; titulo: string; estado: EstadoQaBoard; prioridad: string; editadoEn: string }`
  - `interface QaBoardData { kpis: QaBoardKpis; feed: QaBoardFeedItem[] }`
  - `mapKpis(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[]): QaBoardKpis`
  - `mapFeed(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[], limite?: number): QaBoardFeedItem[]`
  - `fetchQaBoardData(): Promise<QaBoardData>` — Task 5 (`QABoard.astro`) lo importa y llama en frontmatter.

- [ ] **Step 1: Escribir los tests que fallan**

Crear `tests/unit/qa-board.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { mapKpis, mapFeed } from '../../src/lib/qa-board';
import type { NotionPage } from '../../src/lib/notion-client';
import { NOTION_PROYECTO_PORTFOLIO_ID } from '../../src/data/qa-board-links';

const OTRO_PROYECTO_ID = '11111111-1111-1111-1111-111111111111';

function bug(overrides: {
  titulo?: string;
  estado?: string;
  prioridad?: string;
  editadoEn?: string;
  proyectoId?: string;
}): NotionPage {
  return {
    properties: {
      'ID / Titutlo del Defecto': { title: [{ plain_text: overrides.titulo ?? 'BUG de prueba' }] },
      Estado: { select: { name: overrides.estado ?? 'Reportado' } },
      Prioridad: { select: { name: overrides.prioridad ?? 'Media' } },
      PROYECTO: { relation: [{ id: overrides.proyectoId ?? NOTION_PROYECTO_PORTFOLIO_ID }] },
    },
    last_edited_time: overrides.editadoEn ?? '2026-01-01T00:00:00.000Z',
  };
}

function tarea(overrides: {
  titulo?: string;
  estado?: string;
  prioridad?: string;
  editadoEn?: string;
  proyectoId?: string;
}): NotionPage {
  return {
    properties: {
      Título: { title: [{ plain_text: overrides.titulo ?? 'US de prueba' }] },
      Estado: { select: { name: overrides.estado ?? 'Reportado' } },
      Prioridad: { select: { name: overrides.prioridad ?? 'Media' } },
      PROYTECTO: { relation: [{ id: overrides.proyectoId ?? NOTION_PROYECTO_PORTFOLIO_ID }] },
    },
    last_edited_time: overrides.editadoEn ?? '2026-01-01T00:00:00.000Z',
  };
}

describe('mapKpis', () => {
  it('cuenta bugs reportados', () => {
    const kpis = mapKpis([bug({}), bug({})], []);
    expect(kpis.bugsReportados).toBe(2);
  });

  it('calcula el porcentaje de bugs resueltos, redondeado', () => {
    const kpis = mapKpis(
      [bug({ estado: 'Resuelto' }), bug({ estado: 'Resuelto' }), bug({ estado: 'Reportado' })],
      []
    );
    expect(kpis.bugsResueltosPct).toBe(67);
  });

  it('da 0% de bugs resueltos con cero bugs, no NaN', () => {
    const kpis = mapKpis([], []);
    expect(kpis.bugsResueltosPct).toBe(0);
  });

  it('cuenta US resueltas', () => {
    const kpis = mapKpis([], [tarea({ estado: 'Resuelto' }), tarea({ estado: 'En Progreso' })]);
    expect(kpis.usResueltas).toBe(1);
  });

  it('enProgreso suma bugs + tareas con Estado distinto de Resuelto', () => {
    const kpis = mapKpis(
      [bug({ estado: 'Reportado' }), bug({ estado: 'Resuelto' })],
      [tarea({ estado: 'En Progreso' }), tarea({ estado: 'Resuelto' })]
    );
    expect(kpis.enProgreso).toBe(2);
  });
});

describe('mapFeed', () => {
  it('mezcla bugs y tareas, recorta a 4 y ordena desc por editadoEn', () => {
    const bugs = [
      bug({ titulo: 'Bug viejo', editadoEn: '2026-01-01T00:00:00.000Z' }),
      bug({ titulo: 'Bug nuevo', editadoEn: '2026-01-05T00:00:00.000Z' }),
    ];
    const tareas = [
      tarea({ titulo: 'US media', editadoEn: '2026-01-03T00:00:00.000Z' }),
      tarea({ titulo: 'US vieja', editadoEn: '2026-01-02T00:00:00.000Z' }),
      tarea({ titulo: 'US descartada', editadoEn: '2026-01-01T12:00:00.000Z' }),
    ];

    const feed = mapFeed(bugs, tareas);

    expect(feed).toHaveLength(4);
    expect(feed.map((i) => i.titulo)).toEqual(['Bug nuevo', 'US media', 'US vieja', 'US descartada']);
  });

  it('respeta el límite pasado por parámetro', () => {
    const bugs = [bug({}), bug({}), bug({})];
    const feed = mapFeed(bugs, [], 2);
    expect(feed).toHaveLength(2);
  });

  it('extrae tipo, estado, prioridad y editadoEn de cada ítem', () => {
    const feed = mapFeed([bug({ estado: 'En Progreso', prioridad: 'Alta' })], []);
    expect(feed[0]).toMatchObject({ tipo: 'bug', estado: 'En Progreso', prioridad: 'Alta' });
  });
});

describe('filtro por proyecto (vía mapKpis/mapFeed)', () => {
  it('una página de otro proyecto no debería llegar a mapKpis/mapFeed si ya se filtró antes', () => {
    // Este test documenta el contrato: mapKpis/mapFeed NO filtran por proyecto,
    // eso es responsabilidad de esDePortfolio() dentro de fetchQaBoardData().
    // Acá solo confirmamos que si les llega una página de otro proyecto (por un
    // filtrado incorrecto en la capa de arriba), igual la cuentan — así un test
    // de integración futuro sabe dónde buscar el bug si el filtro real falla.
    const kpis = mapKpis([bug({ proyectoId: OTRO_PROYECTO_ID })], []);
    expect(kpis.bugsReportados).toBe(1);
  });
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run tests/unit/qa-board.test.ts`
Expected: FAIL — `Cannot find module '../../src/lib/qa-board'` (el archivo todavía no existe).

- [ ] **Step 3: Implementar `src/lib/qa-board.ts`**

```ts
import type { NotionPage } from './notion-client';
import { queryNotionDatabase } from './notion-client';
import { NOTION_DB_BUGS_ID, NOTION_DB_TAREAS_ID, NOTION_PROYECTO_PORTFOLIO_ID } from '../data/qa-board-links';

export type TipoItem = 'bug' | 'us';
export type EstadoQaBoard = 'Reportado' | 'En Progreso' | 'Resuelto';

export interface QaBoardKpis {
  bugsReportados: number;
  bugsResueltosPct: number;
  usResueltas: number;
  enProgreso: number;
}

export interface QaBoardFeedItem {
  tipo: TipoItem;
  titulo: string;
  estado: EstadoQaBoard;
  prioridad: string;
  editadoEn: string;
}

export interface QaBoardData {
  kpis: QaBoardKpis;
  feed: QaBoardFeedItem[];
}

function esDePortfolio(pagina: NotionPage, propiedadRelacion: string): boolean {
  const relacion = pagina.properties[propiedadRelacion]?.relation ?? [];
  return relacion.some((r: { id: string }) => r.id === NOTION_PROYECTO_PORTFOLIO_ID);
}

function extraerTitulo(pagina: NotionPage, propiedadTitulo: string): string {
  return pagina.properties[propiedadTitulo]?.title?.[0]?.plain_text ?? '';
}

function extraerSelect(pagina: NotionPage, propiedad: string): string {
  return pagina.properties[propiedad]?.select?.name ?? '';
}

export function mapKpis(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[]): QaBoardKpis {
  const bugsReportados = bugsPortfolio.length;
  const bugsResueltos = bugsPortfolio.filter((b) => extraerSelect(b, 'Estado') === 'Resuelto').length;
  const bugsResueltosPct = bugsReportados === 0 ? 0 : Math.round((bugsResueltos / bugsReportados) * 100);
  const usResueltas = tareasPortfolio.filter((t) => extraerSelect(t, 'Estado') === 'Resuelto').length;
  const enProgreso =
    bugsPortfolio.filter((b) => extraerSelect(b, 'Estado') !== 'Resuelto').length +
    tareasPortfolio.filter((t) => extraerSelect(t, 'Estado') !== 'Resuelto').length;

  return { bugsReportados, bugsResueltosPct, usResueltas, enProgreso };
}

export function mapFeed(bugsPortfolio: NotionPage[], tareasPortfolio: NotionPage[], limite = 4): QaBoardFeedItem[] {
  const items: QaBoardFeedItem[] = [
    ...bugsPortfolio.map((b) => ({
      tipo: 'bug' as const,
      titulo: extraerTitulo(b, 'ID / Titutlo del Defecto'),
      estado: extraerSelect(b, 'Estado') as EstadoQaBoard,
      prioridad: extraerSelect(b, 'Prioridad'),
      editadoEn: b.last_edited_time,
    })),
    ...tareasPortfolio.map((t) => ({
      tipo: 'us' as const,
      titulo: extraerTitulo(t, 'Título'),
      estado: extraerSelect(t, 'Estado') as EstadoQaBoard,
      prioridad: extraerSelect(t, 'Prioridad'),
      editadoEn: t.last_edited_time,
    })),
  ];
  return items.sort((a, b) => b.editadoEn.localeCompare(a.editadoEn)).slice(0, limite);
}

let cache: Promise<QaBoardData> | null = null;

/** Memoizado a nivel de módulo: /es/ y /en/ comparten una sola consulta a Notion por build. */
export function fetchQaBoardData(): Promise<QaBoardData> {
  if (!cache) {
    cache = (async () => {
      const [bugs, tareas] = await Promise.all([
        queryNotionDatabase(NOTION_DB_BUGS_ID),
        queryNotionDatabase(NOTION_DB_TAREAS_ID),
      ]);
      const bugsPortfolio = bugs.filter((b) => esDePortfolio(b, 'PROYECTO'));
      const tareasPortfolio = tareas.filter((t) => esDePortfolio(t, 'PROYTECTO'));
      return {
        kpis: mapKpis(bugsPortfolio, tareasPortfolio),
        feed: mapFeed(bugsPortfolio, tareasPortfolio),
      };
    })();
  }
  return cache;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run tests/unit/qa-board.test.ts`
Expected: PASS — 9 tests verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/qa-board.ts tests/unit/qa-board.test.ts
git commit -m "feat: transformación pura de KPIs y feed del QA Board, con tests"
```

---

### Task 3: Copy i18n (ES/EN)

**Files:**
- Modify: `src/i18n/ui.ts`
- Test: `tests/unit/qa-board-copy.test.ts`

**Interfaces:**
- Consumes: `ui` de `../../src/i18n/ui` (ya existe).
- Produces: 11 claves nuevas de `ClaveUI` (`qaBoard.titulo`, `qaBoard.bajada`, `qaBoard.kpi.bugsReportados`, `qaBoard.kpi.bugsResueltosPct`, `qaBoard.kpi.usResueltas`, `qaBoard.kpi.enProgreso`, `qaBoard.filtro.etiqueta`, `qaBoard.filtro.todos`, `qaBoard.filtro.bug`, `qaBoard.filtro.us`, `qaBoard.cta.bugs`, `qaBoard.cta.tareas`) — Task 4 y 5 las consumen vía `t('qaBoard.*')`.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/unit/qa-board-copy.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { ui } from '../../src/i18n/ui';

const CLAVES_QA_BOARD = [
  'qaBoard.titulo',
  'qaBoard.bajada',
  'qaBoard.kpi.bugsReportados',
  'qaBoard.kpi.bugsResueltosPct',
  'qaBoard.kpi.usResueltas',
  'qaBoard.kpi.enProgreso',
  'qaBoard.filtro.etiqueta',
  'qaBoard.filtro.todos',
  'qaBoard.filtro.bug',
  'qaBoard.filtro.us',
  'qaBoard.cta.bugs',
  'qaBoard.cta.tareas',
] as const;

describe('copy del QA Board', () => {
  for (const clave of CLAVES_QA_BOARD) {
    for (const lang of ['es', 'en'] as const) {
      it(`"${clave}" existe y no está vacía en ${lang}`, () => {
        const texto = ui[lang][clave];
        expect(texto).toBeTruthy();
        expect(texto.trim().length).toBeGreaterThan(0);
      });
    }
  }

  it('el título es igual en ambos idiomas (es un nombre propio de sección)', () => {
    expect(ui.es['qaBoard.titulo']).toBe(ui.en['qaBoard.titulo']);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run tests/unit/qa-board-copy.test.ts`
Expected: FAIL — `ui.es['qaBoard.titulo']` es `undefined` (la clave no existe todavía), o error de tipos si `astro check` corre antes.

- [ ] **Step 3: Sumar las claves a `src/i18n/ui.ts`**

En el bloque `export type ClaveUI =`, agregar después de `| 'volverArriba.aria'`:

```ts
  | 'volverArriba.aria'
  | 'qaBoard.titulo'
  | 'qaBoard.bajada'
  | 'qaBoard.kpi.bugsReportados'
  | 'qaBoard.kpi.bugsResueltosPct'
  | 'qaBoard.kpi.usResueltas'
  | 'qaBoard.kpi.enProgreso'
  | 'qaBoard.filtro.etiqueta'
  | 'qaBoard.filtro.todos'
  | 'qaBoard.filtro.bug'
  | 'qaBoard.filtro.us'
  | 'qaBoard.cta.bugs'
  | 'qaBoard.cta.tareas';
```

En el diccionario `es` (después de `'volverArriba.aria': 'Volver arriba',`):

```ts
  'qaBoard.titulo': 'QA Board & Backlog Live',
  'qaBoard.bajada': 'Métricas y actividad reciente de mi propio proceso de gestión de calidad (ISTQB v4.0) — actualizado en cada despliegue, con acceso directo al tablero real en Notion.',
  'qaBoard.kpi.bugsReportados': 'Bugs reportados',
  'qaBoard.kpi.bugsResueltosPct': '% de bugs resueltos',
  'qaBoard.kpi.usResueltas': 'User Stories resueltas',
  'qaBoard.kpi.enProgreso': 'Ítems en progreso',
  'qaBoard.filtro.etiqueta': 'Filtrar actividad reciente',
  'qaBoard.filtro.todos': 'Todos',
  'qaBoard.filtro.bug': 'Bugs',
  'qaBoard.filtro.us': 'User Stories',
  'qaBoard.cta.bugs': 'Ver Bug Reports en Notion',
  'qaBoard.cta.tareas': 'Ver Tareas y US en Notion',
```

En el diccionario `en` (después de `'volverArriba.aria': 'Back to top',`):

```ts
  'qaBoard.titulo': 'QA Board & Backlog Live',
  'qaBoard.bajada': 'Metrics and recent activity from my own quality-management process (ISTQB v4.0) — updated on every deploy, with a direct link to the real board on Notion.',
  'qaBoard.kpi.bugsReportados': 'Bugs reported',
  'qaBoard.kpi.bugsResueltosPct': '% bugs resolved',
  'qaBoard.kpi.usResueltas': 'User Stories resolved',
  'qaBoard.kpi.enProgreso': 'Items in progress',
  'qaBoard.filtro.etiqueta': 'Filter recent activity',
  'qaBoard.filtro.todos': 'All',
  'qaBoard.filtro.bug': 'Bugs',
  'qaBoard.filtro.us': 'User Stories',
  'qaBoard.cta.bugs': 'View Bug Reports on Notion',
  'qaBoard.cta.tareas': 'View Tasks & US on Notion',
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run tests/unit/qa-board-copy.test.ts`
Expected: PASS — 25 tests verdes (12 claves × 2 idiomas + 1).

- [ ] **Step 5: Verificar que compila (el `satisfies Diccionario` no rompió tipos)**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 6: Commit**

```bash
git add src/i18n/ui.ts tests/unit/qa-board-copy.test.ts
git commit -m "feat: copy i18n ES/EN del QA Board"
```

---

### Task 4: Componentes `QABoardFiltro.astro` y `QABoard.astro`

**Files:**
- Create: `src/components/QABoardFiltro.astro`
- Create: `src/components/QABoard.astro`
- Modify: `src/components/HomeContent.astro`

**Interfaces:**
- Consumes: `fetchQaBoardData` de `../lib/qa-board` (Task 2); `qaBoardLinks` de `../data/qa-board-links` (Task 1); claves `qaBoard.*` de `../i18n/ui` vía `useTranslations` (Task 3); `AccionBoton` (ya existe, `../components/AccionBoton.astro`).
- Produces: `<QABoard lang={lang} />` — sección con `id="qa-board"`, `data-testid="qa-board"`; usada por `HomeContent.astro` y por los tests e2e de Task 5.

- [ ] **Step 1: Crear `src/components/QABoardFiltro.astro`**

```astro
---
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

const opciones = [
  { valor: 'todos' as const, texto: t('qaBoard.filtro.todos') },
  { valor: 'bug' as const, texto: t('qaBoard.filtro.bug') },
  { valor: 'us' as const, texto: t('qaBoard.filtro.us') },
];
---
<div role="group" aria-label={t('qaBoard.filtro.etiqueta')} data-testid="qa-board-filtro"
  class="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface p-1">
  {opciones.map((o, i) => (
    <button type="button" data-testid={`qa-board-filtro-${o.valor}`} data-filtro={o.valor}
      aria-current={i === 0 ? 'true' : undefined}
      class:list={[
        'rounded-md px-3 py-1.5 text-sm transition-colors',
        i === 0 ? 'bg-bg text-text' : 'text-muted hover:text-text',
      ]}>{o.texto}</button>
  ))}
</div>
```

- [ ] **Step 2: Crear `src/components/QABoard.astro`**

```astro
---
import { fetchQaBoardData } from '../lib/qa-board';
import { qaBoardLinks } from '../data/qa-board-links';
import QABoardFiltro from './QABoardFiltro.astro';
import AccionBoton from './AccionBoton.astro';
import { useTranslations } from '../i18n/utils';
import type { Lang } from '../i18n/ui';

interface Props { lang: Lang }
const { lang } = Astro.props;
const t = useTranslations(lang);

const { kpis, feed } = await fetchQaBoardData();

const colorEstado: Record<string, string> = {
  Resuelto: 'border-est-paso text-est-paso',
  'En Progreso': 'border-sev-medio text-sev-medio',
  Reportado: 'border-border text-muted',
};
---
<section data-testid="qa-board" id="qa-board" class="revelar scroll-mt-24 py-16 sm:py-20">
  <h2 class="text-center text-2xl font-semibold">{t('qaBoard.titulo')}</h2>
  <p class="mx-auto mt-2 max-w-prose text-center text-muted">{t('qaBoard.bajada')}</p>

  <dl data-testid="qa-board-kpis" class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
    <div class="rounded-lg border border-border bg-surface p-4 text-center" data-testid="qa-board-kpi">
      <dt class="text-xs text-muted">{t('qaBoard.kpi.bugsReportados')}</dt>
      <dd class="mt-1 text-2xl font-semibold text-text">{kpis.bugsReportados}</dd>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 text-center" data-testid="qa-board-kpi">
      <dt class="text-xs text-muted">{t('qaBoard.kpi.bugsResueltosPct')}</dt>
      <dd class="mt-1 text-2xl font-semibold text-text">{kpis.bugsResueltosPct}%</dd>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 text-center" data-testid="qa-board-kpi">
      <dt class="text-xs text-muted">{t('qaBoard.kpi.usResueltas')}</dt>
      <dd class="mt-1 text-2xl font-semibold text-text">{kpis.usResueltas}</dd>
    </div>
    <div class="rounded-lg border border-border bg-surface p-4 text-center" data-testid="qa-board-kpi">
      <dt class="text-xs text-muted">{t('qaBoard.kpi.enProgreso')}</dt>
      <dd class="mt-1 text-2xl font-semibold text-text">{kpis.enProgreso}</dd>
    </div>
  </dl>

  <div class="mt-8 flex justify-center">
    <QABoardFiltro lang={lang} />
  </div>

  <ul data-testid="qa-board-feed" data-filtro-activo="todos" class="mt-6 space-y-3">
    {feed.map((item) => (
      <li data-testid="qa-board-item" data-tipo={item.tipo}
        class="rounded-lg border border-border bg-surface p-5 transition-opacity">
        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 class="text-sm font-medium text-text">{item.titulo}</h3>
          <span data-testid="qa-board-estado"
            class={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorEstado[item.estado]}`}>
            {item.estado}
          </span>
        </div>
        <p class="mt-1 text-sm text-muted">{item.prioridad}</p>
      </li>
    ))}
  </ul>

  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <AccionBoton href={qaBoardLinks.bugs} variante="ir" tono="neutro" tamano="chica"
      texto={t('qaBoard.cta.bugs')} testid="qa-board-cta-bugs" target="_blank" />
    <AccionBoton href={qaBoardLinks.tareas} variante="ir" tono="neutro" tamano="chica"
      texto={t('qaBoard.cta.tareas')} testid="qa-board-cta-tareas" target="_blank" />
  </div>
</section>

<style>
  [data-filtro-activo='bug'] [data-tipo]:not([data-tipo='bug']),
  [data-filtro-activo='us'] [data-tipo]:not([data-tipo='us']) {
    opacity: 0.35;
  }
</style>

<script>
  function activarFiltroQaBoard() {
    const feed = document.querySelector<HTMLElement>('[data-testid="qa-board-feed"]');
    const grupo = document.querySelector<HTMLElement>('[data-testid="qa-board-filtro"]');
    if (!feed || !grupo) return;

    grupo.addEventListener('click', (evento) => {
      const boton = (evento.target as HTMLElement).closest<HTMLButtonElement>('button[data-filtro]');
      if (!boton) return;
      const valor = boton.dataset.filtro;
      if (!valor) return;

      feed.dataset.filtroActivo = valor;
      for (const b of grupo.querySelectorAll<HTMLButtonElement>('button[data-filtro]')) {
        if (b === boton) {
          b.setAttribute('aria-current', 'true');
          b.classList.add('bg-bg', 'text-text');
          b.classList.remove('text-muted', 'hover:text-text');
        } else {
          b.removeAttribute('aria-current');
          b.classList.remove('bg-bg', 'text-text');
          b.classList.add('text-muted', 'hover:text-text');
        }
      }
    });
  }

  activarFiltroQaBoard();
  document.addEventListener('astro:after-swap', activarFiltroQaBoard);
</script>
```

- [ ] **Step 3: Insertar `QABoard` en `HomeContent.astro`**

En `src/components/HomeContent.astro`, agregar el import junto a los demás:

```astro
import QABoard from './QABoard.astro';
```

Y colocar `<QABoard lang={lang} />` entre el bloque de Proyectos y `<StackGrid lang={lang} />`:

```astro
<section data-testid="bloque-proyectos" id="proyectos" class="revelar scroll-mt-24 py-16 sm:py-20">
  <ProyectoListadoFiltrable lang={lang} activo="qa" nivelTitulo={2} contexto="home" />
</section>

<QABoard lang={lang} />

<StackGrid lang={lang} />
```

- [ ] **Step 4: Verificar que el build real levanta (requiere `NOTION_TOKEN` en `.env.local`)**

Run: `npm run build`
Expected: build termina sin errores, sin excepciones de `fetchQaBoardData`/`queryNotionDatabase`. Si falla con `Falta NOTION_TOKEN en el entorno de build`, confirmar con el usuario que `.env.local` tiene la variable seteada antes de continuar.

- [ ] **Step 5: Commit**

```bash
git add src/components/QABoardFiltro.astro src/components/QABoard.astro src/components/HomeContent.astro
git commit -m "feat: sección QA Board & Backlog Live en la home"
```

---

### Task 5: Tests e2e y actualización de page objects

**Files:**
- Create: `tests/e2e/qa-board.spec.ts`
- Modify: `tests/e2e/pages/HomePage.ts`
- Modify: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `HomePage` (existente, extendido en este task), `data-testid`s definidos en Task 4 (`qa-board`, `qa-board-kpis`, `qa-board-kpi`, `qa-board-filtro`, `qa-board-filtro-{todos,bug,us}`, `qa-board-feed`, `qa-board-item`, `qa-board-estado`, `qa-board-cta-bugs`, `qa-board-cta-tareas`).
- Produces: nada (task final de verificación de comportamiento).

- [ ] **Step 1: Sumar `'qa-board'` a `SECCIONES` y agregar locators en `tests/e2e/pages/HomePage.ts`**

Cambiar la constante `SECCIONES`:

```ts
export const SECCIONES = ['inicio', 'sobre-mi', 'proyectos', 'qa-board', 'stack', 'formacion', 'contacto'] as const;
```

Agregar los locators dentro de la clase `HomePage` (junto a los de `stack`):

```ts
  readonly qaBoard: Locator;
  readonly qaBoardFiltro: Locator;
  readonly qaBoardKpis: Locator;
  readonly qaBoardFeed: Locator;
  readonly qaBoardItems: Locator;
```

Y en el constructor, junto a la inicialización de `this.stack`:

```ts
    this.qaBoard = page.getByTestId('qa-board');
    this.qaBoardFiltro = page.getByTestId('qa-board-filtro');
    this.qaBoardKpis = page.getByTestId('qa-board-kpi');
    this.qaBoardFeed = page.getByTestId('qa-board-feed');
    this.qaBoardItems = page.getByTestId('qa-board-item');
```

Agregar el método helper junto a `botonFiltroStack`:

```ts
  botonFiltroQaBoard(valor: 'todos' | 'bug' | 'us'): Locator {
    return this.page.getByTestId(`qa-board-filtro-${valor}`);
  }
```

- [ ] **Step 2: Sumar `'qa-board'` a la lista de ids sin `border-t` en `tests/e2e/home.spec.ts`**

En el test `'las secciones se separan por espacio, no por línea'` (línea ~88), la lista de ids pasa de:

```ts
      ['bloque-sobre', 'bloque-proyectos', 'stack', 'bloque-formacion', 'bloque-contacto']
```

a:

```ts
      ['bloque-sobre', 'bloque-proyectos', 'qa-board', 'stack', 'bloque-formacion', 'bloque-contacto']
```

- [ ] **Step 3: Escribir `tests/e2e/qa-board.spec.ts`**

```ts
import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('QA Board & Backlog Live', () => {
  test('la sección existe, anclada entre Proyectos y Stack', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoard).toBeVisible();
    await expect(page.locator('#qa-board')).toHaveCount(1);
  });

  test('muestra 4 tarjetas de KPI, cada una con texto', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoardKpis).toHaveCount(4);
    for (const kpi of await home.qaBoardKpis.all()) {
      const texto = await kpi.textContent();
      expect(texto?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  test('el feed tiene al menos 1 ítem', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await expect(home.qaBoardFeed).toBeVisible();
    const cantidad = await home.qaBoardItems.count();
    expect(cantidad).toBeGreaterThan(0);
  });

  // Atenúa, no oculta: mismo criterio que el filtro de Stack.
  test('filtrar por Bugs atenúa los ítems que no son bug sin ocultarlos', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const noBug = page.locator('[data-testid="qa-board-item"]:not([data-tipo="bug"])').first();
    const hayNoBug = (await noBug.count()) > 0;
    test.skip(!hayNoBug, 'no hay ítems que no sean bug en el feed actual para probar la atenuación');

    await expect(noBug).toHaveCSS('opacity', '1');
    await home.botonFiltroQaBoard('bug').click();
    await expect(home.botonFiltroQaBoard('bug')).toHaveAttribute('aria-current', 'true');
    await expect(noBug).toHaveCSS('opacity', '0.35');
    await expect(noBug).toBeVisible();
  });

  test('el filtro cambia data-filtro-activo al elegir User Stories', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await home.botonFiltroQaBoard('us').click();
    await expect(home.botonFiltroQaBoard('us')).toHaveAttribute('aria-current', 'true');
    await expect(home.qaBoardFeed).toHaveAttribute('data-filtro-activo', 'us');
  });

  test('el filtro sigue funcionando después de una view transition', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    await page.getByTestId('link-sobre-completo').click();
    await expect(page).toHaveURL(/\/es\/sobre-mi$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/es\/$/);

    await home.botonFiltroQaBoard('bug').click();
    await expect(home.botonFiltroQaBoard('bug')).toHaveAttribute('aria-current', 'true');
  });

  test('los 2 CTA apuntan a Notion en pestaña nueva', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('es');
    const ctaBugs = page.getByTestId('qa-board-cta-bugs');
    const ctaTareas = page.getByTestId('qa-board-cta-tareas');

    await expect(ctaBugs).toHaveAttribute('href', /^https:\/\/rain-scent-049\.notion\.site\//);
    await expect(ctaBugs).toHaveAttribute('target', '_blank');
    await expect(ctaTareas).toHaveAttribute('href', /^https:\/\/rain-scent-049\.notion\.site\//);
    await expect(ctaTareas).toHaveAttribute('target', '_blank');
  });

  test('el título y la bajada se traducen en inglés', async ({ page }) => {
    const home = new HomePage(page);
    await home.abrir('en');
    await expect(home.qaBoard).toContainText('QA Board & Backlog Live');
    await expect(home.qaBoard).toContainText('updated on every deploy');
  });
});
```

- [ ] **Step 4: Correr la suite e2e nueva**

Run: `npx playwright test qa-board.spec.ts home.spec.ts --project=chromium`
Expected: todos los tests PASS. Si `'filtrar por Bugs atenúa...'` se saltea (`skip`), no es una falla — depende de que el feed real tenga al menos un ítem que no sea bug; si eso preocupa, correr `npx playwright test qa-board.spec.ts --project=chromium --headed` una vez para confirmar visualmente el feed real.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/qa-board.spec.ts tests/e2e/pages/HomePage.ts tests/e2e/home.spec.ts
git commit -m "test: cobertura e2e del QA Board & Backlog Live"
```

---

### Task 6: Regenerar capturas visuales y correr la suite completa

**Files:**
- Modify: `tests/e2e/visual.spec.ts-snapshots/*` (regenerados, no escritos a mano)

**Interfaces:**
- Consumes: todo lo anterior, ya integrado.
- Produces: nada (task de cierre).

- [ ] **Step 1: Matar los puertos usados por la suite**

Run (PowerShell):
```powershell
Get-NetTCPConnection -LocalPort 4321,4322 -ErrorAction SilentlyContinue | Select-Object -Property OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
```

- [ ] **Step 2: Regenerar las capturas de referencia**

Run: `npx playwright test visual.spec.ts --project=chromium --update-snapshots`
Expected: corre y sobrescribe las 8 capturas afectadas por el nuevo alto de `/es/` (recordar: sin `=all`, si el diff cae dentro del umbral no reescribe — confirmar con `git status` que los `.png` de `/es/` cambiaron).

- [ ] **Step 3: Confirmar visualmente el diff de las capturas de la home**

Run: `git diff --stat tests/e2e/visual.spec.ts-snapshots/`
Expected: solo cambian los `.png` de `/es/` en tema claro y oscuro (los de `/es/proyectos`, `/es/qa/...` y `/es/contacto` no deberían tocarse — si aparecen, investigar antes de seguir).

- [ ] **Step 4: Correr la suite unitaria completa**

Run: `npm run test:unit`
Expected: todos los tests PASS (incluye los de las Tasks 2 y 3).

- [ ] **Step 5: Correr la suite e2e completa en los 4 proyectos**

Run: `npx playwright test`
Expected: todos PASS salvo las 4 fallas puntuales de concurrencia preexistentes ya documentadas en la memoria del proyecto (no relacionadas a este trabajo).

- [ ] **Step 6: Verificar tipos y contenido de ejemplo**

Run: `npm run check && npm run check:listo`
Expected: `0 errors` y `✔ Todo el contenido es real. Listo para publicar.`

- [ ] **Step 7: Commit**

```bash
git add tests/e2e/visual.spec.ts-snapshots/
git commit -m "test: regenerar capturas visuales tras incorporar QA Board a la home"
```

---

## Self-Review

**Cobertura de la spec:**
- Sin isla de React (Astro puro) → Task 4. ✓
- "Backlog Live" no es tiempo real, aclarado en `qaBoard.bajada` → Task 3. ✓
- Build falla sin `try/catch` si no hay `NOTION_TOKEN` → Task 1, verificado explícitamente en Task 4 Step 4. ✓
- Filtro por proyecto en capa pura, no en la query → Task 2 (`esDePortfolio` dentro de `fetchQaBoardData`, nunca en `queryNotionDatabase`). ✓
- Títulos sin traducir, solo interfaz traducida → Task 4 (`item.titulo` sin `t()`) + Task 5 (test de traducción solo sobre título/bajada de sección, no sobre ítems). ✓
- Dos CTA, dos bases → Task 4 + Task 5. ✓
- Nombres reales de propiedad (`PROYECTO` / `PROYTECTO`, sin `Fecha` en Bugs, orden por `last_edited_time`) → Task 2. ✓
- Sin paginación (`page_size: 100`, una sola consulta) → Task 1. ✓
- Inserción entre Proyectos y Stack → Task 4 Step 3. ✓
- Testing unitario de KPIs/feed con fixtures, sin red → Task 2. ✓
- Testing e2e sin números exactos, solo estructura → Task 5. ✓
- Capturas visuales regeneradas → Task 6. ✓
- Prerequisito de `NOTION_TOKEN` en Vercel → documentado en Global Constraints como pendiente fuera de este plan (es infraestructura, no código).

**Placeholders:** ninguno — todo paso de código trae el archivo completo, no fragmentos con "TODO".

**Consistencia de tipos:** `QaBoardData`, `QaBoardKpis`, `QaBoardFeedItem`, `NotionPage`, `mapKpis`, `mapFeed`, `fetchQaBoardData`, `qaBoardLinks`, `NOTION_DB_BUGS_ID`/`NOTION_DB_TAREAS_ID`/`NOTION_PROYECTO_PORTFOLIO_ID` se usan con el mismo nombre y firma en las Tasks 1, 2, 4 y 5.
