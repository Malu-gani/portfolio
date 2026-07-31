# Diseño: la home pasa a formato one-page y los listados se unifican

Fecha: 2026-07-31

## 1. Contexto y problema

La home actual es una página corta que presenta el hero, los casos QA
destacados, un bloque de desarrollo, el stack y dos botones de cierre. Funciona,
pero tiene tres problemas concretos.

**El carril de desarrollo está reducido a un párrafo.** Hoy `HomeContent.astro`
lo resuelve con un título de menor jerarquía, la frase "escribo código, y eso me
hace mejor testeando" y un enlace. La asimetría fue deliberada —QA domina, dev
entra como acceso secundario— pero se implementó achicando dev en vez de
ordenando la jerarquía. El resultado es que un proyecto real de desarrollo, con
despliegue en producción y suite propia, no llega a presentarse.

**El stack promete lo que no hay.** `StackGrid.astro` declara las tecnologías
hardcodeadas en el componente: Playwright, Cypress, Selenium, Postman, REST
Assured, Jira, TestRail, Xray, TypeScript, React, Git. Un escaneo de los
proyectos en disco no encontró rastro de Cypress, Selenium, TestRail ni Xray en
ningún repositorio. La lista tampoco distingue entre una herramienta con 275
pruebas escritas y una que se vio en un curso.

**La navegación obliga a saltar de página para ver poco.** Cada sección es una
ruta separada, y varias tienen contenido breve. Recorrer el portfolio son cinco
cargas de página para leer lo que entra en una.

## 2. Objetivo

Que la home se recorra entera con scroll, con un navbar que acompañe y marque
dónde estás; que desarrollo se presente con el mismo formato que QA sin que QA
pierda protagonismo; y que el stack diga la verdad sobre el nivel de cada
tecnología.

## 3. Decisiones de diseño

### 3.1 Home enriquecida, no one-page puro

Las rutas `/qa`, `/dev`, `/sobre-mi` y `/contacto` **siguen existiendo**. La home
gana las secciones y el formato scrolleable, pero no absorbe el contenido
completo de las otras páginas: muestra lo destacado y enlaza al listado.

Se descartó el one-page puro (secciones reemplazan páginas) porque costaba
cuatro URLs indexables por idioma y reescribía los tests de navegación, enlaces
y accesibilidad a cambio de un formato que igual se consigue sin pagar eso. Se
descartó el híbrido (anclas *y* páginas con el mismo contenido) porque duplica
cada texto en dos lugares y obliga a resolver contenido duplicado con
`canonical`.

### 3.2 Los listados se unifican, los detalles no se mueven

Se crea `/es/proyectos` con un filtro QA-Automation / Developer, default QA.
`/es/qa` y `/es/dev` redirigen ahí con 301 desde `vercel.json` —redirect real de
servidor, no `meta refresh`.

**Las páginas de detalle se quedan donde están**: `/es/qa/<slug>` y
`/es/dev/<slug>` no cambian. Son las páginas con el contenido de verdad y las
que ya están indexadas; moverlas es el riesgo grande de este trabajo a cambio de
ninguna ganancia. Como efecto lateral, evita una colisión de rutas: si los
detalles vivieran bajo `/es/proyectos/<slug>`, un caso con slug `dev` o `todos`
chocaría con las rutas del filtro.

### 3.3 El filtro son rutas reales, no solo estado en cliente

Tres rutas estáticas por idioma:

| ES | EN | Contenido |
|---|---|---|
| `/es/proyectos` | `/en/projects` | todo, filtro aplicado en QA |
| `/es/proyectos/dev` | `/en/projects/dev` | solo desarrollo |
| `/es/proyectos/todos` | `/en/projects/all` | sin filtrar |

Los botones del filtro son `<a href>` a esas rutas. Un script los intercepta,
oculta las cards que no corresponden y actualiza la URL con `history.pushState`.

Con JavaScript deshabilitado cada enlace navega y el filtro funciona igual. Cada
vista tiene URL propia, compartible e indexable, y los tests pueden verificarla
navegando directo en vez de simular clicks. En un portfolio de QA esa decisión
es parte del contenido, no solo de la implementación.

### 3.4 Desarrollo se presenta como QA, la jerarquía la da el orden

El bloque dev pasa a usar el mismo componente de card, el mismo tamaño de
encabezado y el mismo tratamiento visual que QA. Lo que sostiene la asimetría es
el orden de las secciones (QA primero) y el rol declarado en el hero, no achicar
el carril secundario.

### 3.5 Una sola card para ambos carriles

`CasoCard.astro` y `ProyectoCard.astro` son hoy casi idénticos: mismo borde,
mismo `hover:border-accent`, misma estructura. Se fusionan en una
`ProyectoCard.astro` que recibe `tipo: 'qa' | 'dev'` y decide el distintivo, si
muestra estado y si los chips salen de `tags` o de `stack`.

Anatomía: título enlazado, distintivo QA/Dev, estado si aplica, resumen, línea
de métricas si el contenido las declara, chips de tecnología, y enlaces directos
a repositorio y demo cuando el frontmatter los tenga.

**El tipo QA/Dev no se guarda en el frontmatter**: se deriva de la colección de
la que viene la entrada. Un dato que se puede calcular no debería poder
contradecirse.

### 3.6 El stack se agrupa por nivel de dominio, no por categoría técnica

Tres grupos, con el mismo tratamiento visual y distinto encabezado:

**Trabajo con esto** — proyecto real, defendible en una entrevista técnica:
Playwright, TypeScript, JavaScript, React, Next.js, Astro, Tailwind CSS,
Supabase, PostgreSQL, SQL, Vitest, Testing Library, Git, GitHub Actions, Vercel,
HTML, CSS.

**Base sólida** — uso puntual o proyectos más chicos: Python, pytest, Postman,
Newman, PHP, Bootstrap, jQuery, Docker, axe-core, Lighthouse CI, ESLint, Jira,
Trello, Notion.

**En formación** — en estudio: REST Assured.

Cypress, Selenium, TestRail y Xray **salen**: no aparecen en ningún proyecto del
disco y no hay cómo defenderlas.

Una grilla plana de chips iguala visualmente Playwright —275 pruebas y un caso
escrito— con una herramienta vista en videos. En una entrevista, el chip que no
se puede defender es el primero que se pica. Agrupar por nivel deja entrar todo
sin que nada prometa de más, y da un lugar honesto donde poner lo próximo que se
estudie sin tener que elegir entre inflar el stack o esconderlo.

### 3.7 El contacto aparece dos veces, abreviado y completo

Íconos de GitHub, LinkedIn y email bajo el nombre en el hero, y la sección de
contacto completa al cierre de la home con el email copiable y el CV. Son los
dos momentos en que alguien quiere contactarte: apenas llega y cuando terminó de
leer. `/contacto` sigue existiendo con el contenido completo.

### 3.8 Scroll-spy en vanilla, sin un tercer island

`IntersectionObserver` sobre las secciones marca el link activo con
`aria-current="true"`. El navbar sigue siendo `.astro` con `position: sticky`, y
cada sección lleva `scroll-margin-top` para que el header no tape el título al
saltar.

Se descartó convertir el navbar en island de React: el proyecto sostiene que
React se usa en exactamente dos islands, y pagar hidratación para resaltar un
enlace no lo justifica.

**El script debe reengancharse en `astro:after-swap`.** Las view transitions no
recargan la página, así que un listener registrado una sola vez deja de
funcionar tras la primera navegación. Es el mismo problema que ya resuelve el
script de tema en `BaseLayout.astro`.

El salto suave respeta `prefers-reduced-motion`, que `global.css` ya contempla
globalmente.

### 3.9 Menú compacto en mobile

El navbar pasa de cinco a seis items (Inicio, Sobre mí, QA, Desarrollo, Stack,
Contacto) y convive con el toggle de idioma y el control segmentado de tema. Con
cinco ya estaba justo en el ancho de un teléfono; con seis no entra.

Se agrega un menú desplegable por debajo de `sm`. No estaba en el pedido
original, pero es condición para que el navbar funcione.

## 4. Estructura de la home

```
Hero            #inicio    nombre, rol, frase, íconos de contacto
Sobre mí        #sobre-mi  resumen corto, enlace a /sobre-mi
Trabajo en QA   #qa        cards destacadas, enlace a /proyectos
Desarrollo      #dev       cards destacadas, enlace a /proyectos/dev
Stack           #stack     tres grupos por nivel de dominio
Contacto        #contacto  email copiable y CV
```

El navbar es contextual: en la home los items son anclas con scroll-spy; en
cualquier otra página son enlaces a `/es/#qa`, que llevan a la home posicionada
en esa sección.

El navbar **no tiene un item "Proyectos"**: al listado completo se llega desde
el enlace de cierre de cada sección —"Trabajo en QA →" lleva a `/es/proyectos` y
"Desarrollo →" a `/es/proyectos/dev`, cada uno con su filtro ya aplicado. La
home muestra lo destacado; el listado muestra todo.

## 5. Componentes

**Nuevos:** `ProyectoListadoFiltrable.astro`, `FiltroProyectos.astro`,
`ContactoInline.astro`, `SobreMiResumen.astro`, `NavMobile.astro`.

**Fusionados:** `CasoCard.astro` + `ProyectoCard.astro` → `ProyectoCard.astro`.

**Reescritos:** `StackGrid.astro`, `Header.astro`, `HomeContent.astro`,
`Hero.astro`.

**Eliminados:** `QaListado.astro`, `ProyectoListado.astro`.

## 6. Datos

Un campo nuevo, opcional, en ambas colecciones de `content.config.ts`:

```ts
metricas: z.array(z.object({
  etiqueta: z.string(),
  valor: z.string(),
})).max(3).optional()
```

Misma forma que ya consume `Metricas.astro`, para no tener dos maneras de
expresar lo mismo. Opcional a propósito: el contenido que no lo declare no
muestra la línea.

El consumidor —la card— se implementa en el mismo paso que el campo. Ya pasó
que `demo` viviera en el schema sin que ninguna plantilla lo leyera, y ningún
test lo detectó porque no había nada que testear.

## 7. Impacto en la suite

Se salda al cerrar el tramo de rediseño, en commits propios y con el motivo
escrito. Nunca `--update-snapshots` global.

| Archivo | Qué le pasa |
|---|---|
| `casos.spec.ts`, `dev.spec.ts` | se fusionan en `proyectos.spec.ts`; cambian las rutas de listado |
| `home.spec.ts` | el bloque dev deja de ser un párrafo: hay que afirmar cards |
| `navegacion.spec.ts` | el menú apunta a anclas en la home; sumar el menú mobile |
| `enlaces.spec.ts`, `a11y.spec.ts` | derivan rutas del filesystem y absorben `/proyectos` solos; verificar los redirects |
| `visual.spec.ts` | regenerar las 8 capturas; `/es/qa` deja de ser listado |
| `rutas.test.ts` | cambia el helper de rutas |
| `contenido.test.ts` | validar el campo `metricas` |

**Cobertura nueva:** el filtro en sus tres rutas y con JavaScript deshabilitado,
el scroll-spy, el menú mobile, las métricas en card, y los redirects de `/qa` y
`/dev`.

**Decisión abierta:** `maxDiffPixelRatio` está en 0.01 en `visual.spec.ts`. Se
midió que absorbe cambios de hasta unos 5.700 píxeles sin marcar diferencia. Un
tramo entero de cambio visual deliberado es exactamente donde ese umbral deja de
avisar. Bajarlo puede traer inestabilidad por suavizado de fuentes; queda por
decidir antes de empezar.

## 8. Fuera de alcance

Animaciones de entrada, fondos con partículas y degradados del hero: son
estilado, y ese tramo viene después de este. Tampoco se toca la paleta ni se
decide si los chips del stack llevan logo SVG —eso arrastra peso de assets y
licencias de marca, y merece su propia discusión.

## 9. Criterios de éxito

- La home se recorre entera con scroll y el navbar marca la sección visible.
- Desarrollo se presenta con cards, con el mismo formato que QA.
- El filtro funciona con JavaScript deshabilitado y cada vista tiene URL propia.
- Ninguna tecnología del stack promete más de lo que se puede defender.
- `/es/qa` y `/es/dev` siguen respondiendo, ahora con 301.
- Las páginas de detalle conservan sus URLs.
