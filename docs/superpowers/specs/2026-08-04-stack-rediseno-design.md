# Rediseño de la sección "Stack" — diseño

Cubre `PORT-US-04`/`PORT-BUG-04` (Notion): reestructurar la grilla técnica en
3 bloques orientados al perfil QA, badges con SVG nativo en vez de etiquetas
de nivel visibles, y filtro interactivo por nivel de dominio.

## Alcance y decisiones

- **La "Contexto Técnico" del ticket (`Stack.tsx`/`TechBadge.tsx`) no existe**
  en el proyecto — es Astro, no React. El componente real es
  `StackGrid.astro` + `src/data/stack.ts`. Se trata como pista, no como
  hecho, mismo patrón ya documentado para tickets redactados sin ver el
  código real.
- **Sin React**: el filtro es un toggle de 3 botones sobre datos estáticos,
  sin estado complejo. Se resuelve en Astro + vanilla JS + CSS, mismo patrón
  que `FiltroProyectos.astro`/`ProyectoListadoFiltrable.astro`. Decisión
  explícita del usuario tras evaluar: si al verlo en local no convence, la
  alternativa es un componente React con `client:visible`.
- **Trello se elimina** de la grilla. **Notion se queda** por ahora: más
  adelante va a tener su propia sección (entre Proyectos y Stack, con un
  widget del gestor de Notion y accesos a las tablas) — se decide el
  criterio completo cuando llegue ese tramo, no acá.
- **Techs sin bloque explícito en el ticket** (HTML, CSS, PHP, jQuery,
  Newman, REST Assured) se encajan por criterio propio en el bloque que
  corresponda por naturaleza, no se eliminan.
- **El filtro atenúa (opacity), no oculta**: mantiene estable la estructura
  de los 3 bloques sin reflow al filtrar.
- **No hay botón de filtro para "aprendiendo"**: esas tecnologías se atenúan
  igual que cualquier otra que no matchea el nivel activo, sin caso especial
  — solo se ven al 100% en "Todos".
- **El nivel deja de mostrarse como texto visible** (pedido explícito del
  ticket) pero se mantiene accesible vía `aria-label` en cada badge — la
  convención vieja era "no solo con color"; ahora es "no solo con color, ni
  con texto visible: con `aria-label`".
- **Breakpoints**: se reusa el único corte de 640px que ya tiene el sitio
  para mobile. El ticket también pide un layout de escritorio a 3 columnas
  desde 1024px; entre 640–1024px los bloques quedan apilados (no se
  introduce un tercer corte que no existe en el resto del sitio).

## Datos (`src/data/stack.ts`)

`Categoria` pasa de 5 valores a 3:

```ts
export type Categoria = 'qa-testing' | 'desarrollo-datos' | 'devops-herramientas';
```

Se agrega `icono: string` (slug) a `Tecnologia`. Se elimina la entrada
`Trello`. Contenido y orden por bloque — pensado para que lo primero que ve
un reclutador QA sea lo más fuerte y más relevante al rol (nivel avanzado
primero, salvo Python que sube junto a los lenguajes principales por pedido
explícito):

- **qa-testing**: Playwright, Jira, Zephyr Scale, Vitest, Testing Library →
  pytest, Postman, axe-core, Lighthouse CI → Newman, REST Assured
- **desarrollo-datos**: JavaScript, TypeScript, Python, SQL, HTML, CSS,
  React, Next.js, Astro, Tailwind CSS, PostgreSQL, Supabase → PHP, Bootstrap,
  jQuery
- **devops-herramientas**: Git, GitHub Actions, Vercel → Docker, ESLint,
  Notion

(Jira y Zephyr Scale se mudan de "herramientas" a "qa-testing": el ticket
las agrupa ahí explícitamente y es gestión de testing, no infraestructura).

`ordenCategorias` pasa a `['qa-testing', 'desarrollo-datos', 'devops-herramientas']`.

## Íconos (`src/data/stack-iconos.ts`, nuevo)

`Record<string, string>` mapeando el slug de `icono` a su `path` SVG
(`viewBox="0 0 24 24"`), tomado de Simple Icons (MIT/CC0) y guardado como
texto plano local — no se instala el paquete npm, así que no es una
"librería de terceros" en tiempo de ejecución, cumple la letra del ticket.
`StackGrid.astro` arma el `<svg>` una sola vez por badge a partir del path,
no hay un archivo `.astro` por ícono.

## Componentes

### `StackGrid.astro` (se reescribe)

- Renderiza los 3 bloques en el orden de `ordenCategorias`.
- Layout: `space-y-6` (apilado) por defecto; a partir de `lg:` pasa a
  `lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0`.
- Cada tecnología es un badge `data-testid="stack-item"` con
  `data-nivel={tec.nivel}`:
  - `<svg aria-hidden="true" viewBox="0 0 24 24"><path d={...}/></svg>` +
    `<span>{tec.nombre}</span>` — sin texto de nivel visible.
  - `aria-label="{nombre} — {nivel}"` en el badge, armado con las claves
    `stack.nivel.avanzado/intermedio/aprendiendo` ya existentes.
- Contenedor raíz con `data-filtro-activo="todos"` (estado inicial).
- Incluye `<StackFiltro lang={lang} />` arriba de los bloques.
- `<style>` con las reglas de atenuado por atributo:
  ```css
  [data-filtro-activo='avanzado'] [data-nivel]:not([data-nivel='avanzado']) { opacity: .35 }
  [data-filtro-activo='intermedio'] [data-nivel]:not([data-nivel='intermedio']) { opacity: .35 }
  ```
- `<script>` que escucha clicks en `StackFiltro`, actualiza
  `data-filtro-activo` en el contenedor y el estado visual/`aria-current` de
  los botones — mismo patrón que `activarFiltro()` de
  `ProyectoListadoFiltrable.astro`, incluido el registro en
  `astro:after-swap` para sobrevivir a las view transitions.

### `StackFiltro.astro` (nuevo)

- Mismo patrón visual que `FiltroProyectos.astro` (`role="group"`, pill
  activo con `bg-bg text-text`, resto `text-muted`), pero con `<button
  type="button">` en vez de `<a>` — acá no hay una ruta por nivel, es estado
  puro en cliente.
- 3 botones: `Todos | Avanzado | Intermedio`, cada uno con `data-filtro` y
  `data-testid="stack-filtro-{valor}"`.
- `role="group" aria-label={t('stack.filtro.etiqueta')}`.

## i18n (`src/i18n/ui.ts` + `es.ts`/`en.ts` o equivalente)

Nuevas claves (reemplazan las 5 de categoría vieja):

- `stack.qaTesting`, `stack.desarrolloDatos`, `stack.devopsHerramientas`
  (títulos de bloque)
- `stack.filtro.etiqueta` (aria-label del grupo de filtro — distinta de
  `filtro.etiqueta`, que ya usa el filtro de Proyectos)
- `stack.filtro.todos`, `stack.filtro.avanzado`, `stack.filtro.intermedio`
  (texto de los botones)

Se mantienen sin cambios: `stack.nivel.avanzado/intermedio/aprendiendo`
(ahora usadas solo para el `aria-label` de cada badge, ya no como texto
visible en la tarjeta).

## Testing

- **Unit (`tests/unit/stack.test.ts`)**:
  - `CATEGORIAS` actualizado a `['qa-testing', 'desarrollo-datos', 'devops-herramientas']`.
  - Nuevo test: todo `icono` referenciado en `stack` existe como key en
    `stack-iconos.ts` (evita íconos rotos silenciosos).
  - `Trello` se agrega a la lista de "retiradas" con comentario explicando
    el motivo (se muda a una futura sección de Metodología de Trabajo).
  - Se mantienen los tests de "sin categoría/nivel inválido" y "sin
    tecnologías repetidas".
- **E2E**: se extiende `HomePage.ts` con locators para `stack-filtro` y sus
  3 botones. Nuevo bloque de test (en `home.spec.ts` o spec propio) que
  verifica: los 3 bloques se ven con sus nuevos títulos; clickear
  "Avanzado" atenúa (no oculta, sigue en el DOM) los badges con
  `data-nivel` distinto; el estado del filtro sobrevive a una view
  transition (navegar a otra sección y volver).
- **A11y**: `a11y.spec.ts` ya barre toda la home con `axe-core` — corre
  igual como parte de la verificación final, mismo hábito que atrapó el bug
  de `tabindex` en PR #12.
- `astro check` y `test:unit` en verde antes de cerrar.

## Fuera de alcance (explícitamente, no se hace en este tramo)

- Crear la sección "Metodología de Trabajo" (destino futuro de Notion/Trello).
- Curar visualmente los niveles de "Avanzado" (19/33 — deuda anotada aparte).
