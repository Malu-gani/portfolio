# Portfolio personal QA — Documento de diseño

**Fecha:** 2026-07-27
**Estado:** Aprobado, pendiente de plan de implementación
**Autor del portfolio:** Juan Manuel Malugani

---

## 1. Propósito y contexto

Portfolio personal que funciona como carta de presentación para una **búsqueda laboral activa** en QA.

**Perfil actual:** sin experiencia laboral formal en QA más allá de testing freelance de sitios web. El objetivo es el primer puesto full-time como QA.

**Segmentación pedida:** actividad QA (manual y automation) como eje principal, proyectos de desarrollo como carril secundario y minoritario.

**Mercado objetivo:** doble — hispanohablante e internacional. Portfolio bilingüe ES/EN.

### Criterio rector del diseño

Sin historial laboral, el portfolio no puede ser un catálogo de herramientas: tiene que ser **prueba de competencia**. La objeción silenciosa del reclutador es *"¿sabe hacer el trabajo o solo lo estudió?"*. Cada decisión de este documento se evalúa contra esa pregunta.

De ahí se derivan tres principios:

1. **Profundidad sobre cantidad.** Tres casos bien documentados superan a diez tarjetas con logos.
2. **Demostrar, no afirmar.** El sitio se testea a sí mismo, con código público y CI visible.
3. **Nada de secciones esqueleto.** Una sección vacía cuesta más credibilidad de la que suma un título prometedor.

---

## 2. Decisiones tomadas

| Decisión | Elección | Motivo |
|---|---|---|
| Idiomas | Bilingüe ES/EN | Se aplica a mercado local e internacional |
| Estrategia de lanzamiento | Portfolio primero, contenido después | Permite aplicar a puestos de inmediato; el contenido crece sin refactor |
| Stack | Astro 5 + Tailwind + TypeScript | Cero JS por defecto, contenido en Markdown, i18n nativo, baja fricción de mantenimiento |
| Estructura | Dos carriles `/qa` y `/dev` | Segmentación explícita pedida por el usuario |
| Peso entre carriles | Asimétrico, QA dominante | Evita que el carril dev, con poco material, se vea vacío |
| Segmentación interna de QA | Sin separar; casos con etiquetas | Refleja que muchos proyectos son mixtos manual + automation |
| Tema visual | Claro y oscuro con toggle | Expectativa estándar de audiencia técnica |
| Suite E2E sobre el propio portfolio | Sí, desde el arranque | Caso QA demostrable sin depender de material externo |
| Dominio propio | Más adelante | Se lanza con subdominio de Vercel; migrar es trivial |
| Repositorio | Público desde el inicio | El repo es parte del portfolio |

### Alternativas descartadas

- **Next.js:** su ventaja ("señal técnica") es aparente en un sitio estático, donde no se ejercita ninguna de sus capacidades distintivas. Habría exigido configurar MDX e i18n manualmente. Astro permite islands de React, así que React sigue siendo demostrable.
- **Estructura de vitrina de casos única** (recomendada inicialmente): descartada por el usuario en favor de los dos carriles explícitos.
- **Catálogo filtrable desde el arranque:** los filtros lucen con volumen; con tres casos subrayan la escasez. Se incorporarán cuando haya material.
- **Formulario de contacto:** punto de falla silencioso en sitio estático, requiere servicio externo y agrega fricción en el paso más crítico.

---

## 3. Arquitectura

Astro 5 en modo estático puro (`output: 'static'`). El sitio compila a HTML y se sirve desde CDN: sin servidor, sin base de datos, sin costo operativo. Islands de React únicamente donde hay interacción real (toggle de tema, toggle de idioma, y filtros de casos cuando se incorporen).

### Rutas

El idioma vive en la URL, no en un botón que reemplaza textos por JavaScript.

```
/es/           (raíz por defecto)          /en/
/es/qa                                     /en/qa
/es/qa/[caso]                              /en/qa/[caso]
/es/dev                                    /en/dev
/es/dev/[proyecto]                         /en/dev/[proyecto]
/es/sobre-mi                               /en/about
/es/contacto                               /en/contact
```

Razones para routing por idioma y no toggle en cliente:

- **Compartible:** un reclutador extranjero que recibe `/en/qa` lo abre en inglés.
- **Indexable:** Google indexa ambas versiones por separado, con `hreflang`.
- **Sin parpadeo:** no hay flash de contenido en el idioma equivocado.

El toggle de idioma navega a la ruta equivalente en el otro idioma; no reemplaza textos en el DOM.

`/` redirige a `/es/`. La detección del idioma del navegador se aplica solo en la primera visita.

### Estructura de carpetas

```
src/
├── content/          Contenido en Markdown, separado por idioma
│   ├── casos-qa/     es/*.md · en/*.md
│   └── proyectos/    es/*.md · en/*.md
├── i18n/             ui.ts — textos de interfaz (nav, botones, labels)
├── components/       .astro (estáticos) + .tsx (islands de React)
├── layouts/
└── pages/
    ├── es/
    └── en/
```

Separación clave: **`content/` es lo que escribe el usuario; `components/` se escribe una sola vez.** Agregar un caso nuevo nunca debe requerir abrir un archivo de código: se crean dos `.md` (uno por idioma) y queda publicado.

---

## 4. Modelo de contenido

Dos colecciones de Astro con esquema validado por TypeScript. Si falta un campo obligatorio, el build falla — un control de calidad sobre el propio contenido.

### Colección `casos-qa`

```yaml
---
titulo: "Suite E2E para gestor de operaciones"
resumen: "Estrategia de prueba y automatización de los flujos críticos..."
tags: [automation, e2e, api]
stack: [Playwright, TypeScript, GitHub Actions]
fecha: 2026-08-10
destacado: true
estado: en-progreso        # o: completo
repo: "https://github.com/..."     # opcional
demo: "https://..."                # opcional
portada: "./portada.png"
---
```

**Vocabulario cerrado de `tags`:** `manual`, `automation`, `e2e`, `api`, `exploratorio`, `regresion`, `accesibilidad`, `performance`, `mobile`.

**Campo `estado`:** permite publicar trabajo en curso. Desbloquea la publicación del caso del gestor de operaciones sin esperar a terminarlo. Un caso en progreso comunica actividad, no incompletitud.

### Anatomía de un caso QA

Estructura fija de seis bloques. Es el diferencial central del portfolio.

| Bloque | Qué responde | Por qué importa |
|---|---|---|
| Contexto | Qué es el producto, qué se necesitaba | Ubica al lector en 20 segundos |
| Estrategia de prueba | Riesgos identificados, qué se decidió probar **y qué no** | El bloque de mayor impacto: demuestra criterio, no solo ejecución |
| Ejecución | Qué se hizo concretamente, con qué herramientas | Demuestra manejo real |
| Hallazgos | Bugs encontrados, con al menos uno reportado en detalle | Prueba tangible de resultados |
| Automatización | Qué se automatizó, **por qué esos casos**, con código real | Separa "escribir scripts" de "decidir qué automatizar" |
| Resultado y aprendizajes | Qué mejoró, qué se haría distinto | Muestra criterio propio |

El bloque de estrategia es el de mayor retorno: explicitar el razonamiento de priorización por riesgo es lo que distingue a un QA con criterio de un ejecutor de casos.

### Componentes de dominio QA

Reutilizables, invocables desde Markdown con una línea:

- **`<BugReport>`** — bug con formato profesional: ID, severidad, prioridad, entorno, pasos para reproducir, resultado esperado vs. obtenido, evidencia. Es el artefacto que el usuario producirá en el trabajo real, mostrado tal cual.
- **`<TestMatrix>`** — tabla compacta de casos de prueba (ID, escenario, tipo, estado).
- **`<Metricas>`** — fila de métricas del caso: casos ejecutados, bugs encontrados, cobertura automatizada, tiempo de ejecución.

### Colección `proyectos` (carril Dev)

Deliberadamente más simple que los casos QA, para mantener el peso donde corresponde: problema que resuelve, stack, dos o tres decisiones técnicas tomadas, links a repo y demo.

### Confidencialidad del trabajo freelance

Anonimizar, no descartar. Descripción genérica del cliente ("plataforma de reservas para un estudio de servicios") y capturas con logos y datos tapados. El trabajo sigue siendo demostrable sin exponer al cliente.

---

## 5. Contenido de lanzamiento

Regla: **todo lo publicado está terminado.** Sin secciones "próximamente".

### Home `/es/`

- **Hero:** nombre, "QA Engineer · Manual & Automation", y una línea de posicionamiento concreta y honesta (ej.: *"Testing manual y automatización con Playwright. Busco mi primer puesto full-time en QA."*). Se evita el lenguaje vacío tipo "apasionado por la calidad".
- **Badge de disponibilidad:** "Disponible para trabajar".
- **Acceso a QA:** bloque dominante, con los casos destacados.
- **Acceso a Dev:** bloque secundario y visualmente menor, encuadrado como *"Escribo código, y eso me hace mejor testeando."*
- **Stack:** herramientas agrupadas por categoría. Sin barras de porcentaje.
- **CTA de contacto.**

### `/qa`

Encabezado con el enfoque como QA (3-4 líneas) y listado de casos con etiquetas visibles. Tres casos iniciales:

1. **Suite E2E de este portfolio** — estado `completo` desde el lanzamiento. Código público, CI en verde.
2. **Testing freelance de sitios web** — anonimizado, con la anatomía de seis bloques.
3. **Gestor de operaciones** — estado `en-progreso`, documentando la estrategia de prueba en definición.

### `/dev`

El gestor de operaciones como proyecto principal. Se prioriza un proyecto bien contado sobre varios a medias.

### `/sobre-mi`

Recorrido, motivación por QA, forma de trabajo, formación y certificaciones. Con foto.

### `/contacto`

Sin formulario. Email visible con copiar-al-portapapeles, LinkedIn y GitHub.

### CV descargable

PDF estático por idioma (`cv-es.pdf` / `cv-en.pdf`), con botón en el home y en Sobre mí.

---

## 6. Testing, CI y deploy

Los tests son **contenido del portfolio**: alguien los va a leer para evaluar al autor. Eso impone dos restricciones desde el primer commit:

- **Page Object Model** aunque el sitio sea pequeño. Demuestra cómo se mantiene una suite.
- **Atributos `data-testid` en el markup desde el inicio.** Es una restricción de diseño de los componentes, no un agregado posterior. Habilita el argumento "diseñé la app para que fuera testeable".

### Cobertura

| Capa | Herramienta | Qué verifica |
|---|---|---|
| E2E | Playwright | Navegación completa, toggle ES/EN preserva la página equivalente, toggle de tema persiste al recargar, descarga de CV, copiar email al portapapeles |
| Accesibilidad | axe-core + Playwright | Sin violaciones WCAG, navegación completa por teclado, contraste en ambos temas |
| Enlaces | Playwright | Sin links rotos, internos ni externos |
| Visual | Playwright screenshots | Regresiones visuales en desktop y mobile |
| Performance | Lighthouse CI | Umbrales mínimos que fallan el build al degradarse |
| Contenido | Astro content schema | Campos obligatorios presentes en todo caso publicado |

Matriz de ejecución: Chromium, Firefox y WebKit, más viewport mobile.

Beneficio secundario: la suite garantiza que la carta de presentación no esté rota. Un deploy que rompa un link o degrade el contraste falla antes de llegar al reclutador.

### CI

GitHub Actions en cada push y cada pull request: build → E2E → accesibilidad → Lighthouse. Si algo falla, no se despliega.

El reporte HTML de Playwright se publica como artefacto y **se enlaza desde el caso QA correspondiente**, de modo que el visitante puede abrir el reporte real de la última corrida.

Badge de CI en verde en el home, enlazado al workflow público.

### Deploy

**Vercel** conectado al repositorio de GitHub. Push a `main` publica automáticamente; cada PR genera URL de preview. HTTPS y CDN incluidos, gratis para este uso.

**Dominio:** se lanza con el subdominio de Vercel. El usuario adquirirá dominio propio más adelante; la migración no requiere cambios de código.

### Repositorio

Público desde el inicio, con README que documente qué es el proyecto, las decisiones técnicas y cómo correr los tests. Mensajes de commit cuidados: reclutadores técnicos revisan el historial.

---

## 7. Sistema visual

"Moderno" aquí significa tipografía cuidada, espacio en blanco abundante y ausencia de ruido decorativo. El contenido es el protagonista. La prolijidad visual es coherente con el rasgo que el perfil quiere proyectar.

### Color

Sistema de **tokens semánticos**, no colores sueltos: `--bg`, `--surface`, `--text`, `--text-muted`, `--border`, `--accent`. Cada token tiene valor en tema claro y oscuro. Los componentes nunca nombran un color concreto. El toggle de tema funciona sin duplicar estilos.

- Base neutra en grises fríos, no negro puro (`#0B0F14` en oscuro).
- Un solo color de acento, aplicado con disciplina: links, badges de estado, resultados de tests.
- Escala semántica adicional de dominio QA: severidad (crítico / alto / medio / bajo) y estado (pasó / falló / bloqueado), usada por `<BugReport>` y `<TestMatrix>`.

**Restricción de accesibilidad:** la severidad y el estado nunca se comunican solo por color. Siempre color + ícono + texto.

### Tipografía

Dos familias, servidas localmente (sin Google Fonts: más rápido y sin filtrar datos de visitantes).

- **Inter** para texto e interfaz.
- **JetBrains Mono** para código, IDs de bug, métricas y detalles técnicos. Uso moderado; aporta el registro técnico sin convertir el sitio en una imitación de terminal.

Escala tipográfica fluida con `clamp()`. Cuerpo de texto entre 65 y 75 caracteres por línea.

### Layout y movimiento

Mobile-first real: una parte importante de las visitas llegará desde el celular, vía LinkedIn. Grilla de 12 columnas en desktop; ancho de lectura contenido en las páginas de caso.

Movimiento mínimo y con propósito: View Transitions API entre páginas y aparición sutil al hacer scroll. Todo respeta `prefers-reduced-motion`, verificado por la suite de accesibilidad.

### Estándar de calidad

**WCAG AA como mínimo en ambos temas**, verificado automáticamente en CI. Es coherencia: un QA cuyo sitio falla auditoría de accesibilidad se desacredita solo.

---

## 8. Punto pendiente para la fase de planificación

**Producción del contenido real.** El sitio requiere textos, capturas, reportes de bugs y CV que solo puede producir el usuario. Hay dos caminos y se decidirá al armar el plan de implementación:

- **a)** Construir la estructura con contenido de ejemplo claramente marcado como tal, y que el usuario lo reemplace después.
- **b)** Escribir el contenido real de forma colaborativa a medida que se construye cada sección.

---

## 9. Criterios de éxito

El portfolio cumple su objetivo si:

1. Está online y es enlazable en postulaciones dentro del plazo acordado en el plan.
2. Un reclutador entiende en 30 segundos qué perfil es y que está disponible.
3. Cada caso QA publicado permite juzgar el criterio del autor, no solo las herramientas que usó.
4. La suite de tests corre en verde en CI y su reporte es accesible públicamente.
5. Agregar un caso nuevo requiere crear dos archivos Markdown y nada más.
6. El sitio pasa auditoría de accesibilidad AA en ambos temas y carga rápido en mobile.
