# Diseño: el gestor de operaciones pasa de plan de pruebas a suite ejecutada

Fecha: 2026-07-30

## 1. Contexto y problema

El caso `gestor-operaciones` del carril QA se publicó como **plan de pruebas
escrito antes de automatizar**, con una advertencia explícita: "este caso
documenta el plan, no su ejecución". El proyecto dev decía lo mismo desde el
otro lado: "todavía no tiene suite de pruebas automatizada".

Entre el 26 y el 30 de julio de 2026 la suite se diseñó, se construyó y se
ejecutó. Hoy son 275 pruebas, encontró 10 defectos y los 10 están arreglados; la
app además se desplegó a producción. **El sitio afirma cosas que ya son falsas**,
así que este trabajo no agrega material: corrige el portfolio y recién después
lo amplía.

Cambió también la restricción que ordenaba todo lo demás: el repositorio
`Malu-gani/Registro-de-Operaciones` era privado y por eso ningún caso declaraba
`repo:`. Se hizo público el 2026-07-30, después de una auditoría de credenciales
sobre sus 126 commits que no encontró ninguna filtración.

## 2. Objetivo

Que el caso pase a contar el arco completo —plan, ejecución, hallazgos— y que
cada afirmación fuerte tenga cómo verificarse desde afuera.

## 3. Decisiones de diseño

### 3.1 Un solo caso, no varios

El material da para tres casos (la suite, la seguridad, la infraestructura). Se
hace **uno solo**, por dos razones:

- El activo más difícil de replicar no es el número de pruebas: es que **el plan
  se publicó antes de escribir el primer test** y ahora se puede comparar contra
  lo que realmente pasó. Partirlo en dos casos corta esa comparación al medio.
- Con cuatro casos en el carril QA, dedicarle dos o tres al mismo proyecto lo
  desbalancea. El lector va a leer uno; conviene que sea el completo.

La seguridad y la infraestructura entran como secciones dentro del caso. Si más
adelante hay material de otros proyectos alrededor, la parte de seguridad puede
separarse.

### 3.2 El reparto entre carriles: proceso a QA, producto a dev

Al carril **QA** va el proceso de prueba, con el esqueleto de ISTQB como
contenido y no como títulos —los cuatro casos comparten la misma estructura de
seis secciones y se mantiene:

| Fase | Qué la sostiene |
|---|---|
| Planificación | Priorización P0–P3 por consecuencia de la falla; la regla "ningún P2 mientras quede un P0 sin cubrir"; la pirámide con base ancha y E2E chico por decisión |
| Análisis y diseño | Alcance negativo explícito con justificación; pgTAP descartado con argumento; casos borde derivados de la documentación de negocio |
| Implementación | 275 pruebas en cuatro niveles; aislamiento por RLS con usuarios únicos; `test.fails()` para defectos conocidos; la condición de corte de `CryptoForm` |
| Ejecución | Los 10 defectos, con los dos P0 al frente; las tres severidades que la ejecución corrigió |
| Monitoreo y control | CI con jobs separados por costo; cobertura que se reporta pero no bloquea |
| Cierre | El análisis estático acierta el *dónde* y falla el *cuánto* |

Al carril **dev** va el producto y su operación: despliegue en Vercel, las fases
A/B/C de costo cero, `verifyOtp` sobre PKCE, y la diferencia entre variables de
entorno de build y de runtime.

**Dos excepciones al reparto**, ambas hacia QA aunque parezcan de dev:

- **El diagnóstico de la intermitencia en Windows.** La CLI de Supabase escribe
  `~/.supabase/telemetry.json` con temporal+rename y los workers en paralelo
  competían por ese rename, tumbando un test al azar. Es diagnóstico de un test
  inestable, que es habilidad de QA, y es el mejor ejemplo disponible de no
  parchear el síntoma.
- **El bug de la confirmación por email.** Las cookies no sobrevivían al
  `NextResponse.redirect` y el `origin` de `request.url` reportaba `localhost`
  bajo `next start`. Es el caso más limpio de "los tests encontraron un defecto
  que ningún usuario podría haber reportado", porque el afectado nunca habría
  logrado entrar para quejarse.

### 3.3 Qué se deja afuera

- Los gotchas de git y de PRs apilados: son de proceso propio, no de QA.
- El detalle de la instalación de Docker y de la CLI: es setup, no diseño.
- El desglose por PR (#31 a #42): el repositorio ya es público y los muestra.
- El lint de 161 a 0 errores: va al proyecto dev, en una línea. No es testing.

## 4. Cambios de contenido

### 4.1 Caso QA — `src/content/casos-qa/{es,en}/gestor-operaciones.md`

Frontmatter:

| Campo | Antes | Después |
|---|---|---|
| `titulo` | "Plan de pruebas de un diario de trading" | "Suite de pruebas de una app financiera propia" |
| `resumen` | descripción del plan | ver abajo |
| `estado` | `en-progreso` | `completo` |
| `tags` | `[manual, automation, api]` | `[manual, automation, e2e, api]` |
| `stack` | `[Next.js, Supabase, PostgreSQL, TypeScript]` | `[Vitest, Playwright, Testing Library, PostgreSQL, Supabase, TypeScript, Docker, GitHub Actions]` |
| `fecha` | 2026-07-29 | 2026-07-30 |
| `repo` | ausente | `https://github.com/Malu-gani/Registro-de-Operaciones` |
| `demo` | ausente | `https://registro-de-operaciones-chi.vercel.app` |
| `destacado` | `true` | sin cambios |

`resumen` propuesto (el esquema lo limita a 200 caracteres):

> 275 pruebas sobre un diario de trading que construí. Encontró 10 defectos: dos
> permitían que cualquier usuario logueado creara dinero salteándose el
> formulario.

El título sigue el patrón de los otros tres casos ([tipo de trabajo] + [sobre
qué]) y lleva los términos que busca un filtro automático. "Propia" es lo que lo
diferencia: es el único caso del portfolio donde construyó el sistema y además
lo probó.

Cuerpo, por sección:

- **Contexto** — se mantiene. Cae el párrafo "este caso documenta el plan, no su
  ejecución", que era la advertencia de honestidad de cuando no había suite.
- **Estrategia de prueba** — la tabla P0–P3 real reemplaza la prosa de riesgo
  crítico/alto/medio. El alcance negativo pasa a las nueve exclusiones reales y
  suma pgTAP descartado con argumento: prueba las funciones desde adentro de
  Postgres con permisos elevados, con lo que RLS no se ejercita —justo la capa
  que había que verificar.
- **Ejecución** — deja de ser futuro. Los 275 tests en cuatro niveles, el
  aislamiento por RLS, el corte de `CryptoForm`, y la intermitencia de Windows.
- **Hallazgos** — la sección que más cambia. Hoy dice "ninguno todavía". Pasa a
  los 10 defectos con los dos P0 al frente, más el bug de confirmación por
  email. **La tabla de "casos que espero que duelan" no se borra: se convierte
  en la comparación** entre lo estimado y lo que la ejecución encontró.
- **Automatización** — CI con jobs separados por costo, cobertura que se reporta
  sin bloquear.
- **Resultado y aprendizajes** — el cierre sobre estimación de severidad.

### 4.2 Proyecto dev — `src/content/proyectos/{es,en}/gestor-operaciones.md`

- Se agregan `repo` y `demo`.
- Se borra "el repositorio es privado por ahora; lo voy a enlazar acá cuando
  termine la suite y lo haga público": ya ocurrió.
- Se borra "todavía no tiene suite de pruebas automatizada" y en su lugar va un
  puntero corto al caso de QA.
- Se suma **"Despliegue y operación"**: Vercel Hobby con deploy continuo desde
  `main` y preview por PR, Supabase gratis, Gmail como SMTP, costo total cero.
  La decisión de `verifyOtp` sobre PKCE va acá con su razón real —el
  `code_verifier` vive en una cookie del navegador donde arrancó el flujo, así
  que confirmar el mail desde otro dispositivo fallaba.

### 4.3 "Sobre mí" — `src/components/AboutContent.astro`

El recorrido termina hoy en "hoy pruebo una aplicación financiera real que estoy
construyendo en paralelo". Se reemplaza por el resultado concreto, en ambos
idiomas. El resto del texto no se toca.

## 5. Trabajo de código

**El campo `demo` está declarado en el esquema y no lo renderiza ninguna
plantilla.** Existe en las dos colecciones desde que se creó el esquema y nunca
se usó. Enlazar la app no es una edición de contenido: hay que construir el
enlace.

Se agrega junto al de `repo`, que ya se dibuja con `data-testid="caso-repo"`:
mismo tratamiento, `target="_blank"` y `rel="noopener"`, con
`data-testid="caso-demo"`. Sirve para los dos carriles porque el campo está en
ambas colecciones.

## 6. Tests

Se actualizan en el mismo paso que el contenido, no después.

1. **`tests/e2e/dev.spec.ts`** — el test "el detalle no muestra enlace al
   repositorio si el proyecto no lo declara" usa `/es/dev/gestor-operaciones`
   como sujeto, elegido porque su repo era privado. Al declarar `repo:` esa
   página pasa a mostrar el enlace y el test falla. **No se borra**: sin él,
   nadie verifica que un caso sin `repo:` no dibuje un enlace vacío. Se le
   cambia el sujeto a `/es/qa/suite-sauce`, cuyo repositorio sigue privado, y se
   actualiza el comentario que explica por qué se eligió cada sujeto.
2. **Test nuevo para `demo`**, con las dos ramas igual que `repo`: una página
   que lo declara y una que no. Agregar la funcionalidad sin cobertura no es
   aceptable en un portfolio de QA.
3. **`tests/e2e/enlaces.spec.ts`** no se toca. El barrido de `rel="noopener"`
   recorre todos los `target="_blank"` del sitio y cubre el enlace nuevo solo;
   si se olvida el `rel`, ese test lo detecta.

Verificación antes de dar el trabajo por cerrado: `npm run check`,
`npm run check:listo`, `npm run test:unit` y los E2E relevantes en chromium.

## 7. Orden de ejecución

Los dos primeros pasos ya están hechos y verificados el 2026-07-30:

1. ~~Mergear el PR #43 del gestor con el CI en verde.~~ Hecho.
2. ~~Hacer público `Registro-de-Operaciones`.~~ Hecho; verificado con
   `gh api repos/Malu-gani/Registro-de-Operaciones --jq .private`.
3. Recién entonces mergear el PR del portfolio. Invertir el orden publica un
   enlace a un repositorio privado y le da 404 a quien entre.

El test de enlaces externos se saltea en CI porque depende de servicios de
terceros, así que un repositorio privado **no** pondría el pipeline en rojo. La
consecuencia sería solo para las personas que visiten el sitio, que es peor.

## 8. Fuera de alcance

- **Diseño y estilado del sitio.** Pendiente y decidido como trabajo aparte.
- **Los PDFs del CV.** Siguen siendo los placeholders que dicen "CV de ejemplo —
  reemplazar", y el botón de descarga ya los entrega. El usuario los va a armar
  y traer; cuando lleguen, se reemplazan y **se refuerza el test de descarga
  para que verifique contenido y no solo el nombre del archivo**.
- **Las páginas de Inicio, Desarrollo y Contacto**, que nunca se revisaron con
  contenido real.
- **Un caso de Postman/Zephyr/Jira**, que sigue siendo material real sin
  documentar.

## 9. Riesgos

- **El demo es una app real con usuarios reales.** Enlazarla desde el portfolio
  mueve el proyecto de "conocidos" a "público", que es el disparador de la Fase
  C documentada en el repositorio del gestor. Los datos están aislados por RLS,
  así que un desconocido que se registre solo ve su propia cuenta vacía. Pero
  los mails de confirmación salen por la casilla personal de Gmail, con un tope
  de unos 500 diarios. Mitigación aceptada: mantener los límites de registro que
  Supabase trae por defecto y vigilar la casilla la primera semana.
- **Publicar el repositorio expone también el historial**, incluyendo los
  commits donde los dos P0 estaban sin arreglar. Es aceptable y hasta favorable:
  la trazabilidad entre el test que los detectó, la migración que los arregló y
  el PR correspondiente es justamente lo que hace verificable el caso.
