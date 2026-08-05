# QA Board & Backlog Live — diseño

Cubre `PORT-US-08`/`PORT-BUG-08` (Notion): nueva sección en la home que
muestra KPIs y actividad reciente del propio gestor de tareas/bugs del
portfolio (Notion), con acceso directo al board público real.

## Alcance y decisiones

- **La "Contexto Técnico" del ticket pide una isla de React
  (`QABoardPreview.tsx`, `client:visible`)** para no penalizar el
  rendimiento. Se descarta: los datos se resuelven en *build time* (no hay
  nada dinámico en runtime), así que un componente Astro puro sin
  hidratación pesa cero JS de framework — estrictamente mejor para el FCP
  que la isla diferida que pide el ticket. La única interactividad real
  (el filtro Todos/Bugs/US del feed) se resuelve con el mismo patrón
  vanilla JS + CSS que ya usa el filtro de Stack, sin sumar React.
- **"Backlog Live" no es tiempo real.** El sitio es 100% estático
  (`output: 'static'`, sin backend). Los datos se consultan a la API de
  Notion durante el build (token server-side, nunca viaja al cliente) y
  quedan horneados en el HTML — se actualizan en cada deploy, no al
  instante. El nombre de la sección se mantiene (es el título del ticket,
  y "live dashboard" es terminología habitual para "actualizado", no
  literalmente streaming), pero la bajada de la sección lo aclara en texto
  explícito, mismo criterio de honestidad que el resto del sitio.
- **Si el build no puede consultar Notion, el build entero falla** —
  decisión explícita del usuario: mejor que el deploy no se publique a que
  se publique con datos rotos o vacíos. No hay `try/catch` que trague el
  error en la capa de fetch.
- **Todo se filtra por el proyecto "Portfolio QA ENGINEER / DEV"** (id de
  Notion `3b1f143f-ef25-80c9-8049-fbbed8847af8`), nunca mezcla con
  Gestión de Operaciones ni con proyectos futuros. El filtrado por proyecto
  vive en la capa de transformación pura (testeable con fixtures), no en
  el filtro de la consulta a Notion — así un test unitario puede afirmar
  que el filtro funciona sin pegarle a la API real.
- **Los títulos de los tickets se muestran tal cual, en español, en las
  dos versiones del sitio** (ES y EN) — es contenido real de un gestor
  real; traducirlo lo volvería falso o requeriría mantenimiento manual
  paralelo. Solo la interfaz (KPIs, filtro, botones, encabezado) se
  traduce.
- **Dos botones CTA, uno por base de Notion** (Bug Reports / Tareas y
  Solicitudes de Cambio), no uno solo como sugiere el ticket — reflejan la
  estructura real de dos bases separadas del gestor.
- **Nombres reales de propiedad en Notion, verificados contra la API**
  (no contra lo que asuma el ticket): la relación a Proyecto se llama
  `PROYECTO` en Bug Reports y `PROYTECTO` (con la falta de ortografía real
  del schema) en Tareas. **Bug Reports no tiene campo `Fecha`** (solo
  Tareas lo tiene) — el feed combinado ordena por `last_edited_time`
  (metadato que Notion da siempre, no una propiedad custom), no por
  `Fecha`, para que el criterio de orden sea el mismo en las dos bases.
- **Sin paginación de la API de Notion.** Se consulta con `page_size: 100`
  una sola vez por base; hoy hay ~13 bugs y ~8 tareas en total, muy por
  debajo del límite. Si algún día una base supera 100 filas, hay que sumar
  paginación — no se resuelve ahora (YAGNI), pero queda anotado acá para
  que no sea una sorpresa.
- **Prerequisito de despliegue, no de código:** `NOTION_TOKEN` tiene que
  estar cargado en las variables de entorno de Vercel (además de
  `.env.local`), o el primer build en producción va a fallar ahí mismo —
  que es el comportamiento esperado, pero hay que setearlo antes del
  primer deploy de esta feature.

## Links públicos de Notion (para los botones CTA)

```ts
// src/data/qa-board-links.ts
export const NOTION_PROYECTO_PORTFOLIO_ID = '3b1f143f-ef25-80c9-8049-fbbed8847af8';
export const NOTION_DB_TAREAS_ID = '3b1f143f-ef25-80b5-bb80-ee66c08e8fb3';
export const NOTION_DB_BUGS_ID = '3b1f143f-ef25-80ad-b528-df5d74fa68ed';

export const qaBoardLinks = {
  bugs: 'https://rain-scent-049.notion.site/3b1f143fef2580adb528df5d74fa68ed?v=3b3f143fef25800b917c000cca91f95c',
  tareas: 'https://rain-scent-049.notion.site/USER-STORYS-3b2f143fef258044965de52a369ccfc5',
} as const;
```

Estos IDs/URLs no son secretos (son datos públicos de configuración, como
los IDs de la Formación o del Stack) — viven en `src/data/`, no en
`.env.local`. Lo único secreto es `NOTION_TOKEN`.

## Capa de datos — separación fetch/transform

```
src/lib/notion-client.ts   — fetch crudo, sin lógica de negocio, no testeado unitariamente
src/lib/qa-board.ts        — filtra por proyecto, agrega KPIs, arma el feed — funciones puras, testeables con fixtures
```

Sin SDK (`@notionhq/client`): son dos `POST` simples, un `fetch()` crudo
evita sumar una dependencia nueva para tan poco — mismo criterio
minimalista que ya usa el proyecto (Stack copió los paths de íconos como
texto plano en vez de instalar `simple-icons`).

### `src/lib/notion-client.ts`

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

Sin `filter` en el body: trae todas las filas de la base (bugs ~13, tareas
~8, nada pesado) y deja que `qa-board.ts` decida qué es de Portfolio — así
la lógica de negocio es testeable sin red.

### `src/lib/qa-board.ts`

```ts
import type { NotionPage } from './notion-client';
import { queryNotionDatabase } from './notion-client';
import { NOTION_DB_BUGS_ID, NOTION_DB_TAREAS_ID, NOTION_PROYECTO_PORTFOLIO_ID } from '../data/qa-board-links';

export type TipoItem = 'bug' | 'us';
export type EstadoQaBoard = 'Reportado' | 'En Progreso' | 'Resuelto';

export interface QaBoardKpis {
  bugsReportados: number;
  bugsResueltosPct: number; // 0-100, redondeado; 0 si no hay bugs
  usResueltas: number;
  enProgreso: number; // bugs + tareas con Estado !== 'Resuelto'
}

export interface QaBoardFeedItem {
  tipo: TipoItem;
  titulo: string; // tal cual viene de Notion, con su [PORT-XXX-NN]
  estado: EstadoQaBoard;
  prioridad: string; // 'Alta' | 'Media' | 'Baja', tal cual viene de Notion
  editadoEn: string; // last_edited_time, ISO
}

export interface QaBoardData {
  kpis: QaBoardKpis;
  feed: QaBoardFeedItem[]; // ya recortado a 4, ya ordenado desc por editadoEn
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

`mapKpis`/`mapFeed`/`esDePortfolio` son funciones puras exportadas — el
test unitario les arma fixtures de `NotionPage[]` a mano (páginas con y
sin relación a Portfolio, con distintos `Estado`) sin tocar la red.
`fetchQaBoardData` es la única pieza que orquesta I/O y no se testea
unitariamente (se verifica con el build real + e2e).

## Componentes

Mismo patrón que Stack: sección + filtro separado.

```
src/components/QABoard.astro         — sección completa, llama a fetchQaBoardData() en frontmatter
src/components/QABoardFiltro.astro   — 3 botones Todos/Bugs/US, calco de StackFiltro.astro
```

### `QABoardFiltro.astro`

Copia casi textual de `StackFiltro.astro`: mismo marcado, mismas clases,
cambia `stack.filtro.*` por `qaBoard.filtro.*` y los valores `todos` /
`avanzado` / `intermedio` por `todos` / `bug` / `us`.

### `QABoard.astro`

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

`QABoardFiltro.astro` debe usar `data-testid="qa-board-filtro"` en su
contenedor (mismo rol que `data-testid="stack-filtro"` en el suyo) para
que el script de arriba lo encuentre.

### Inserción en `HomeContent.astro`

Entre `ProyectoListadoFiltrable` y `StackGrid`:

```astro
<ProyectoListadoFiltrable lang={lang} activo="qa" nivelTitulo={2} contexto="home" />
<QABoard lang={lang} />
<StackGrid lang={lang} />
```

## Copy (i18n)

### ES

| Clave | Texto |
|---|---|
| `qaBoard.titulo` | QA Board & Backlog Live |
| `qaBoard.bajada` | Métricas y actividad reciente de mi propio proceso de gestión de calidad (ISTQB v4.0) — actualizado en cada despliegue, con acceso directo al tablero real en Notion. |
| `qaBoard.kpi.bugsReportados` | Bugs reportados |
| `qaBoard.kpi.bugsResueltosPct` | % de bugs resueltos |
| `qaBoard.kpi.usResueltas` | User Stories resueltas |
| `qaBoard.kpi.enProgreso` | Ítems en progreso |
| `qaBoard.filtro.etiqueta` | Filtrar actividad reciente |
| `qaBoard.filtro.todos` | Todos |
| `qaBoard.filtro.bug` | Bugs |
| `qaBoard.filtro.us` | User Stories |
| `qaBoard.cta.bugs` | Ver Bug Reports en Notion |
| `qaBoard.cta.tareas` | Ver Tareas y US en Notion |

### EN

| Clave | Texto |
|---|---|
| `qaBoard.titulo` | QA Board & Backlog Live |
| `qaBoard.bajada` | Metrics and recent activity from my own quality-management process (ISTQB v4.0) — updated on every deploy, with a direct link to the real board on Notion. |
| `qaBoard.kpi.bugsReportados` | Bugs reported |
| `qaBoard.kpi.bugsResueltosPct` | % bugs resolved |
| `qaBoard.kpi.usResueltas` | User Stories resolved |
| `qaBoard.kpi.enProgreso` | Items in progress |
| `qaBoard.filtro.etiqueta` | Filter recent activity |
| `qaBoard.filtro.todos` | All |
| `qaBoard.filtro.bug` | Bugs |
| `qaBoard.filtro.us` | User Stories |
| `qaBoard.cta.bugs` | View Bug Reports on Notion |
| `qaBoard.cta.tareas` | View Tasks & US on Notion |

Los `estado`/`prioridad` de cada ítem del feed (`Reportado`/`En
Progreso`/`Resuelto`, `Alta`/`Media`/`Baja`) se muestran tal cual vienen
de Notion, sin clave i18n — son datos, no interfaz, mismo criterio que los
títulos.

## Testing

- **Unitario** (`tests/unit/qa-board.test.ts`, nuevo): fixtures de
  `NotionPage[]` a mano (algunas páginas con relación a Portfolio, otras
  sin ella o a otro proyecto) para `mapKpis`/`mapFeed`/`esDePortfolio`:
  - Filtra correctamente por proyecto (una página de Gestión de
    Operaciones nunca debe aparecer en el resultado).
  - `bugsResueltosPct` da 0 con cero bugs (no `NaN`).
  - `enProgreso` suma bugs + tareas con `Estado !== 'Resuelto'`.
  - `mapFeed` recorta a 4 y ordena desc por `editadoEn`, mezclando bugs y
    tareas.
- **E2E** (`tests/e2e/qa-board.spec.ts`, nuevo): **no afirma números
  exactos** (van a cambiar con cada ticket real que se cierre) — solo
  estructura:
  - Existen 4 tarjetas KPI (`qa-board-kpi`), cada una con texto no vacío.
  - El feed tiene al menos 1 ítem.
  - El filtro Bugs/US/Todos cambia `data-filtro-activo` y atenúa lo que no
    corresponde (mismo test que ya existe para Stack, adaptado).
  - Los 2 botones CTA (`qa-board-cta-bugs`, `qa-board-cta-tareas`) tienen
    `href` que empieza con `https://rain-scent-049.notion.site/` y
    `target="_blank"`.
  - La sección existe y está anclada en `#qa-board`, entre Proyectos y
    Stack (test de orden de secciones, si existe uno genérico para la
    home).
- **Capturas visuales**: se regeneran al final — sección nueva en la home
  cambia el alto de la página.

## Fuera de alcance

- Paginación de la API de Notion (ver nota en Alcance y decisiones).
- Cualquier tipo de caché entre builds (ej. ISR, revalidación) — el sitio
  es 100% estático, cada build es la única oportunidad de refrescar datos.
- Traducir los títulos de los tickets.
- El segundo board público (Tareas) todavía no tiene su propia vista
  "vista pública" verificada con el mismo detalle que Bug Reports — el
  link que se usa ya devuelve solo ítems `PORT-US-*`, pero no se confirmó
  con la misma exhaustividad que el de Bugs. No bloquea el desarrollo (el
  fetch de datos usa la API con token, no este link — el link es solo
  para el botón CTA humano).
