# Diseño: reorganización de secciones y restyle visual de la home

Fecha: 2026-08-02

## 1. Contexto y problema

El rediseño anterior dejó la home en formato one-page con seis secciones ancladas
y un navbar contextual con scroll-spy. La estructura funciona, pero quedaron tres
cosas sin resolver.

**El carril QA y el de desarrollo son dos secciones separadas que muestran uno o
dos destacados cada una.** Hay 4 casos QA y 1 proyecto de desarrollo publicados.
Con ese volumen, dos secciones que muestran un ítem cada una y enlazan a un
listado externo hacen que la home se sienta vacía y obligan a salir de ella para
ver lo que hay.

**El hero es una franja de texto alineado a la izquierda.** Nombre, rol, una línea
de posicionamiento e íconos de contacto. Cumple, pero no tiene presencia: es lo
primero que ve alguien que llega y hoy no comunica más que un encabezado.

**No hay dónde declarar la formación.** El bootcamp de testing, la preparación de
ISTQB y el curso de mercados financieros de UTN viven en una lista de viñetas
dentro de `/es/sobre-mi`. Nada de eso aparece en la home, que es la página que un
reclutador va a leer.

Además, el tratamiento visual quedó explícitamente fuera del tramo anterior
(sección 8 de la spec del 31/07/2026: "animaciones de entrada, fondos con
degradados del hero: son estilado, y ese tramo viene después de este"). Este es
ese tramo.

## 2. Objetivo

Que la home muestre todo el trabajo publicado en una sola sección con filtro; que
el hero tenga presencia y descripción; que la formación sea visible y declare con
precisión qué está terminado y qué no; y que el conjunto tenga un tratamiento
visual moderno sin romper ninguno de los gates que ya están en verde.

## 3. Decisiones de diseño

### 3.1 Estructura de la home

```
#inicio      Hero        una columna: foto, nombre, rol, 2-3 líneas, contacto
#sobre-mi    Sobre mí    resumen + enlace a /es/sobre-mi
#proyectos   Projects    filtro QA/Dev/Todos · QA por defecto · las 5 cards
#stack       Skills      grilla por categoría, cada chip con su nivel
#formacion   Formación   bootcamp, ISTQB, UTN
#contacto    Contacto    email copiable, LinkedIn, GitHub, CV
             Footer      enlaces, redes, copyright
```

Navbar: **Inicio · Sobre mí · Projects · Skills · Formación · Contacto**. Siguen
siendo seis items, así que el menú desplegable de pantallas chicas no cambia de
estructura.

Los ids de sección se mantienen en español (`#proyectos`, `#formacion`) con las
etiquetas traducidas, siguiendo la convención que ya rige para `#inicio`,
`#sobre-mi` y `#contacto`.

### 3.2 Las secciones `#qa` y `#dev` se fusionan en `#proyectos`

La home renderiza `ProyectoListadoFiltrable.astro` — el mismo componente que sirve
`/es/proyectos` — con el filtro QA por defecto. Se muestran los 5 proyectos, no
solo los destacados.

Consecuencia asumida a conciencia: **esto contradice la sección 3.1 de la spec del
31/07/2026**, que descartó el híbrido "anclas *y* páginas con el mismo contenido"
por duplicación. Se acepta porque el riesgo concreto es bajo: la home no es un
duplicado de `/es/proyectos` —tiene hero, sobre mí, skills, formación y contacto
alrededor— y el componente es uno solo, así que no se duplica código ni texto.
`/es/proyectos` se mantiene: da URL propia compartible e indexable, y es el
destino de los redirects de `/es/qa` y `/es/dev` que ya funcionan.

Los anclas `/es/#qa` y `/es/#dev` dejan de existir. Los usa el navbar cuando estás
fuera de la home, y se actualizan en el mismo cambio.

### 3.3 `destacado` pasa de filtrar a ordenar

Hoy `destacado: true` decide qué entra en la home. Si la home muestra todo, el
campo deja de controlar nada. En vez de borrarlo del esquema, pasa a definir el
**orden**: los destacados primero dentro de cada filtro, el resto por fecha
descendente.

Un campo que sobrevive sin consumidor es el mismo problema que ya tuvo `demo`
—declarado en el esquema y sin plantilla que lo leyera— así que o se le da uso o
se saca. Se le da uso.

### 3.4 Hero en una columna, con retrato arriba

**Revisado el 02/08/2026.** La versión anterior de esta sección pedía dos
columnas con la foto a la derecha, ocupando 400-500 px de ancho. Se cambió al
confirmarse que el original de 800×800 no existe y no se puede recuperar: ver la
sección 8, que ahora fija el techo de exhibición en 200 px. Un retrato de 200 px
en una columna propia deja esa columna casi vacía, así que la estructura de dos
columnas pierde sentido.

Una sola columna centrada, en este orden: retrato circular de **200 px**, badge
de disponibilidad, nombre, rol en monoespaciada, dos o tres líneas de
descripción, e íconos de contacto (`ContactoInline`, ya existe).

El orden no cambia entre breakpoints: al ser una sola columna, mobile y desktop
comparten la misma secuencia. Esto elimina la regla de apilado que tenía la
versión anterior.

La descripción del hero se mantiene breve a propósito. La sección `#sobre-mi`
sigue existiendo con el resumen y el enlace a la página completa: si el hero
absorbiera tres o cuatro párrafos, las dos cosas se pisarían.

**Requisitos técnicos de la foto, no negociables porque hay un gate de por
medio:** formato WebP, atributos `width` y `height` explícitos para no generar
CLS, `fetchpriority="high"` por ser el elemento más grande del primer viewport, y
un `alt` descriptivo real. El gate de Lighthouse está en performance ≥0.9 y
accesibilidad =1.

### 3.5 Sección Formación

Se llama **Formación** (EN: *Training*), no "Education". No hay formación
académica formal que declarar, y ese título prometería un título que no existe.

| Ítem | Detalle | Estado |
|---|---|---|
| The Complete 2026 Software Testing Bootcamp | Tarek Roshdy / Nezam Academy · 43.5 hs · 372 lecciones | Completado |
| ISTQB Foundation Level V4.0 | Tarek Roshdy / Nezam Academy · 35h50m · 340 lecciones | Curso completo · examen pendiente |
| Operador de Mercados Financieros | UTN FRBA · 94 hs · 12 unidades · 2022 | Cursado sin completar |
| Inglés | Autodidacta | Intermedio |

**El estado se declara en texto**, no solo por color o posición, en coherencia con
la restricción que ya rige para severidad, estado de caso y nivel de stack.

Por qué entra el curso de UTN, que es el que más se discutió: la pieza destacada
del portfolio es **Registro-de-Operaciones, una aplicación financiera**. 94 horas
de mercado de capitales explican por qué se pudo modelar y testear ese dominio,
incluidos los dos defectos que permitían crear dinero salteando la interfaz. Esa
conexión es real y verificable, a diferencia del puente monitoreo→QA que ya se
descartó.

Se declara **"cursado sin completar"** y nada más. Estar en condiciones de rendir
el examen de agente de bolsa idóneo es una afirmación a futuro, repreguntable, y
no aporta a un puesto de QA.

**Qué queda afuera de la sección y por qué:**

- **Primaria y secundaria.** Nadie las pide en un perfil de QA, y listarlas cuando
  no hay título terciario llama la atención justo sobre lo que falta.
- **Curso de Postman de YouTube, curso guiado de Playwright, Roadmap-Logica.** Al
  lado de un bootcamp de 43.5 horas restan más de lo que suman. Se quedan donde
  están hoy: la lista de `/es/sobre-mi`.
**Sobre el ítem de inglés.** Se declara **"Intermedio"**, sin rango y sin nivel
CEFR. Es lo que sostiene la evidencia disponible: en una evaluación informal del
02/08/2026 resolvió 6 de 6 ítems de gramática —dos de ellos de nivel C1— pero no
pudo desarmar un párrafo de registro abstracto (`less X than Y`, *in hindsight*,
*slipped past*) y la producción escrita quedó en 35 palabras sobre 100 pedidas.
Recepción sólida, producción sin determinar.

Se descartó "intermedio/avanzado": un rango no es un nivel, y leído por un
reclutador comunica duda sobre el propio nivel. Se descartó "avanzado" porque la
evidencia lo contradice, y el costo es concreto e inmediato —una entrevista en
inglés agendada sobre una expectativa que no se sostiene.

Queda pendiente rendir el **EF SET** (gratis, ~50 minutos, nivel CEFR y URL
verificable) para reemplazar la autoevaluación por un dato respaldado. Su límite
conocido: mide solo lectura y comprensión auditiva, no producción, y no es
supervisado.

### 3.6 Sistema visual

**Ritmo de sección.** Encabezados centrados con una bajada corta debajo; el
contenido sigue alineado a la izquierda. Se eliminan los `border-t` que hoy
separan secciones: la separación pasa a ser espacio, con el padding vertical más
generoso (`py-10` → `py-16`/`py-20`).

**Scroll.** `scroll-snap-type: y proximity` en `html` y `scroll-snap-align: start`
en cada sección. Se elige `proximity` y no `mandatory` porque las secciones tienen
alturas muy distintas —el hero es corto, el stack es una grilla de 33 chips— y
`mandatory` obligaría a que cada una midiera 100vh, lo que significa recortar
contenido o dejar huecos.

**Hover y foco.** Las cards suman elevación sutil (`translateY(-2px)`) al
`hover:border-accent` que ya tienen. Regla firme: **todo estado de hover lleva su
equivalente en `:focus-visible`**, sin excepción — en mobile el hover no existe y
con teclado tampoco se dispara.

**Aparición al scrollear.** `IntersectionObserver` en vanilla que agrega una
clase; el CSS hace el fade y el desplazamiento. Un solo observador, reenganchado
en `astro:after-swap`, mismo patrón que el scroll-spy.

**Hero.** Degradado radial suave detrás del contenido, CSS puro. Sin partículas ni
campo de estrellas: es carga de JS o canvas en el camino crítico a cambio de nada.

**Skills.** Mantiene la agrupación por categoría y el nivel declarado en cada
chip. El cambio es de densidad y tratamiento: chips más compactos, grilla más
apretada.

**Formación.** Cards apiladas: título, institución, período, carga horaria y
estado.

### 3.7 Tres restricciones sobre las animaciones

**El estado por defecto es visible.** Si el CSS escondiera los elementos y el JS
los revelara, un visitante sin JavaScript vería una página en blanco. El sitio ya
sostiene que el filtro de proyectos funciona sin JS; esto respeta lo mismo. El JS
*opta* por el efecto, no lo habilita.

**`scroll-snap` se verifica en navegador real antes de darlo por bueno.** Convive
con el `overflow-y: scroll` de `html`, que no es estético: está ahí para evitar un
crash real del proceso de render de WebKit. También puede interferir con la
navegación por anclas y con el timing del scroll-spy. Es la clase de cosa que se
ve bien en teoría y se rompe en Safari.

**`prefers-reduced-motion` tiene que cubrir `scroll-snap` explícitamente.** El
bloque global de `global.css` ya anula animaciones, transiciones y
`scroll-behavior`, pero no toca `scroll-snap-type`. Hay que sumarlo.

## 4. Componentes

**Nuevos:** `Formacion.astro`, `src/data/formacion.ts` (datos tipados, mismo
patrón que `src/data/stack.ts`, para poder verificar desde un test unitario que
ningún ítem quede sin estado o con un estado inválido).

**Reescritos:** `Hero.astro` (una columna + retrato de 200 px), `HomeContent.astro`
(`#qa` + `#dev` → `#proyectos`), `Header.astro` (items del navbar),
`NavMobile.astro` (mismos items), `StackGrid.astro` (densidad),
`ProyectoCard.astro` (hover), `Footer.astro` (estructura de la referencia).

**Sin cambios:** `ProyectoListadoFiltrable.astro`, `FiltroProyectos.astro`,
`ContactoInline.astro`, `SobreMiResumen.astro`, `ContactContent.astro`.

## 5. Impacto en la suite

Se salda dentro del mismo tramo, en commits propios y con el motivo escrito. Nunca
`--update-snapshots` global.

| Archivo | Qué le pasa |
|---|---|
| `home.spec.ts` | las secciones pasan de `#qa`/`#dev` a `#proyectos`; sumar `#formacion` |
| `navegacion.spec.ts` | cambian los items del navbar y del menú mobile |
| `a11y.spec.ts` | absorbe la sección nueva solo; verificar el `alt` de la foto |
| `visual.spec.ts` | regenerar las capturas con el motivo escrito |
| `proyectos.spec.ts` | el filtro ahora también vive en la home |

**Cobertura nueva:** la sección Formación y sus estados; el filtro funcionando en
la home además de en `/es/proyectos`; que la foto declare `width` y `height`; y un
test unitario sobre `src/data/formacion.ts`.

**Verificación específica de este tramo**, que no la cubre ningún gate existente:
`scroll-snap` en los cuatro navegadores, y que la aparición al scrollear deje todo
visible con JavaScript deshabilitado.

## 6. Fuera de alcance

- **La paleta de colores.** Se toca en un tramo propio, después de ver la
  estructura armada. Los tokens semánticos que ya existen no cambian acá.
- **Los íconos de tecnologías en los chips del stack.** Decisión pendiente. Si se
  hacen, es con SVG resueltos e inlineados en build, nunca desde un CDN en
  runtime.
- **Work Experience y Certificaciones.** No hay contenido para ninguna de las dos
  todavía.
- **El nivel CEFR de inglés**, hasta que haya certificado con URL verificable. El
  ítem entra ahora como "Intermedio" (ver 3.5).
- **Testimonials, Blog y el bloque "Want to know more?"** de las referencias:
  descartados explícitamente.

## 7. Criterios de éxito

- La home muestra los 5 proyectos con el filtro, QA por defecto, y sigue
  funcionando con JavaScript deshabilitado.
- El hero muestra foto, nombre, rol y descripción sin degradar el gate de
  performance.
- La sección Formación declara el estado de cada ítem en texto, y ninguno promete
  más de lo que hay.
- Todo estado de hover tiene su equivalente en `:focus-visible`.
- Con JavaScript deshabilitado, ninguna sección queda invisible.
- `scroll-snap` verificado en chromium, firefox, webkit y mobile.
- Los gates siguen en verde: `check`, `check:listo`, unit, los 4 proyectos de
  Playwright, y Lighthouse con performance ≥0.9 y accesibilidad =1.

## 8. Dependencias antes de implementar

- ~~La foto, en un original de al menos 800×800 px.~~ **Resuelto el 02/08/2026, y
  no como pedía esta sección.** El original de alta resolución se perdió y no se
  puede recuperar: `juan-manuel-malugani.jpg` a **317×317 px y 17 KB** es todo lo
  que hay. Ya está en el repo, en `src/assets/`.
- Nada más: el resto del contenido ya existe o está definido en esta spec.

**Techo de exhibición: 200 px.** Con un original de 317 px, mostrarlo a 200 px da
1,59× de densidad efectiva; a 160 px da 1,98×, prácticamente nítido en retina. A
los 400-500 px que pedía la versión anterior de 3.4 daría 0,79×, visiblemente
blando. Escalar por software no agrega detalle, solo desenfoque, así que la
restricción se absorbe en el diseño y no en el procesamiento: **el hero pasa a
una sola columna con retrato de 200 px arriba** (sección 3.4, reescrita).

Se maneja con `astro:assets`, que genera WebP y deduce `width`/`height` en build
— así el requisito de CLS de 3.4 se cumple sin escribirlo a mano. **Importante:
no declarar `widths` mayores a 317**, porque Astro generaría variantes
_upscaleadas_ que pesan más sin verse mejor.

Si en algún momento aparece un original de 800×800 o se saca una foto nueva —una
de celular sirve—, alcanza con reemplazar el archivo y subir el tamaño de
exhibición; el resto del hero no depende de esto.
